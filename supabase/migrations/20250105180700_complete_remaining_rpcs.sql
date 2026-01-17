-- Complete Remaining RPCs from all wiring maps
-- Created: 2025-01-05
-- Final comprehensive RPC collection

-- Function: Toggle offer save
DROP FUNCTION IF EXISTS public.fn_toggle_offer_save(uuid);
CREATE OR REPLACE FUNCTION public.fn_toggle_offer_save(
  p_offer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM offer_saves 
    WHERE offer_id = p_offer_id 
    AND user_id = auth.uid()
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM offer_saves 
    WHERE offer_id = p_offer_id AND user_id = auth.uid();
    RETURN jsonb_build_object('action', 'removed', 'saved', false);
  ELSE
    INSERT INTO offer_saves (offer_id, user_id, created_at)
    VALUES (p_offer_id, auth.uid(), NOW())
    ON CONFLICT (offer_id, user_id) DO NOTHING;
    RETURN jsonb_build_object('action', 'added', 'saved', true);
  END IF;
END;
$$;

-- Function: Claim offer
DROP FUNCTION IF EXISTS public.fn_claim_offer(uuid);
CREATE OR REPLACE FUNCTION public.fn_claim_offer(
  p_offer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_claim_id uuid;
BEGIN
  -- Generate unique claim code
  v_code := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));

  -- Create claim record
  INSERT INTO offer_claims (
    offer_id,
    user_id,
    claim_code,
    status,
    created_at
  ) VALUES (
    p_offer_id,
    auth.uid(),
    v_code,
    'claimed',
    NOW()
  )
  RETURNING id INTO v_claim_id;

  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'claim_code', v_code
  );
END;
$$;

-- Function: Update XP
DROP FUNCTION IF EXISTS public.fn_update_xp(uuid, int, text);
CREATE OR REPLACE FUNCTION public.fn_update_xp(
  p_user_id uuid,
  p_amount int,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_xp int;
  v_new_level int;
BEGIN
  -- Update profile XP
  UPDATE profiles
  SET 
    xp = xp + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp, level INTO v_new_xp, v_new_level;

  -- Log XP event
  INSERT INTO xp_events (
    user_id,
    amount,
    reason,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_reason,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'level', v_new_level
  );
END;
$$;

-- Function: Get leaderboard
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(text, int);
CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(
  p_timeframe text DEFAULT 'all_time', -- 'weekly', 'monthly', 'all_time'
  p_limit int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_cutoff_date timestamptz;
BEGIN
  -- Determine cutoff date
  CASE p_timeframe
    WHEN 'weekly' THEN
      v_cutoff_date := NOW() - INTERVAL '7 days';
    WHEN 'monthly' THEN
      v_cutoff_date := NOW() - INTERVAL '30 days';
    ELSE
      v_cutoff_date := NULL;
  END CASE;

  SELECT jsonb_agg(row_to_json(t))
  INTO v_result
  FROM (
    SELECT
      p.id,
      p.username,
      p.avatar_url,
      p.xp,
      p.level,
      ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank
    FROM profiles p
    WHERE (v_cutoff_date IS NULL OR p.created_at >= v_cutoff_date)
    ORDER BY p.xp DESC
    LIMIT p_limit
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Function: Process referral
DROP FUNCTION IF EXISTS public.fn_process_referral(text, uuid);
CREATE OR REPLACE FUNCTION public.fn_process_referral(
  p_referral_code text,
  p_new_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_referrer_role text;
  v_xp_reward int := 5;
  v_credit_reward int := 1;
BEGIN
  -- Find referrer by code
  SELECT id, role INTO v_referrer_id, v_referrer_role
  FROM profiles
  WHERE referral_code = p_referral_code;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Create referral record
  INSERT INTO referrals (
    referrer_id,
    referred_id,
    status,
    created_at
  ) VALUES (
    v_referrer_id,
    p_new_user_id,
    'completed',
    NOW()
  );

  -- Award XP to referrer
  PERFORM fn_update_xp(v_referrer_id, v_xp_reward, 'referral_signup');

  -- If referrer is garage_owner, also award bid credit
  IF v_referrer_role = 'garage_owner' THEN
    UPDATE bid_wallet
    SET 
      credits = credits + v_credit_reward,
      updated_at = NOW()
    WHERE user_id = v_referrer_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_reward,
    'credit_awarded', CASE WHEN v_referrer_role = 'garage_owner' THEN v_credit_reward ELSE 0 END
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_toggle_offer_save(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_claim_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_update_xp(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_leaderboard(text, int) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_process_referral(text, uuid) TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_toggle_offer_save(uuid) IS 'Toggle save status for an offer';
COMMENT ON FUNCTION public.fn_claim_offer(uuid) IS 'Claim an offer and get unique code';
COMMENT ON FUNCTION public.fn_update_xp(uuid, int, text) IS 'Update user XP and log event';
COMMENT ON FUNCTION public.fn_get_leaderboard(text, int) IS 'Get leaderboard (weekly/monthly/all-time)';
COMMENT ON FUNCTION public.fn_process_referral(text, uuid) IS 'Process referral signup and award rewards';

