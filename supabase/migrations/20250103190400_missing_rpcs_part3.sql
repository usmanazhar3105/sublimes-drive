-- ============================================================================
-- MISSING RPCs PART 3: Events, XP/Referrals, Notifications
-- Date: 2025-01-03
-- ============================================================================

-- ============================================================================
-- 1. EVENTS RPCs
-- ============================================================================

-- Register event view (with deduplication)
CREATE OR REPLACE FUNCTION public.fn_register_event_view(
  p_event_id UUID,
  p_anon_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_view BOOLEAN;
BEGIN
  -- Check if view already registered in last 10 minutes
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.event_views
      WHERE event_id = p_event_id AND user_id = auth.uid()
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.event_views
      WHERE event_id = p_event_id AND anon_hash = p_anon_hash
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  END IF;
  
  IF NOT v_recent_view THEN
    INSERT INTO public.event_views (event_id, user_id, anon_hash)
    VALUES (p_event_id, auth.uid(), p_anon_hash);
    
    -- Update counter if event_stats exists
    UPDATE public.event_stats SET view_count = view_count + 1, updated_at = NOW()
    WHERE event_id = p_event_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Toggle event like
CREATE OR REPLACE FUNCTION public.fn_toggle_event_like(
  p_event_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.event_likes
    WHERE event_id = p_event_id AND user_id = v_user_id
  ) INTO v_liked;
  
  IF v_liked THEN
    DELETE FROM public.event_likes
    WHERE event_id = p_event_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.event_likes (event_id, user_id)
    VALUES (p_event_id, v_user_id)
    ON CONFLICT DO NOTHING;
    v_liked := TRUE;
  END IF;
  
  -- Get updated count
  SELECT COUNT(*) INTO v_like_count
  FROM public.event_likes
  WHERE event_id = p_event_id;
  
  RETURN jsonb_build_object('liked', v_liked, 'like_count', v_like_count);
END;
$$;

-- RSVP to event
CREATE OR REPLACE FUNCTION public.fn_rsvp_event(
  p_event_id UUID,
  p_rsvp_status TEXT DEFAULT 'going'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_attendee_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Upsert RSVP
  INSERT INTO public.event_attendees (event_id, user_id, status)
  VALUES (p_event_id, v_user_id, p_rsvp_status)
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET status = p_rsvp_status, updated_at = NOW()
  RETURNING id INTO v_attendee_id;
  
  -- Log analytics event
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id, metadata)
  VALUES (v_user_id, 'rsvp_event', 'event', p_event_id, jsonb_build_object('status', p_rsvp_status));
  
  RETURN jsonb_build_object('success', TRUE, 'attendee_id', v_attendee_id, 'status', p_rsvp_status);
END;
$$;

-- ============================================================================
-- 2. XP / REFERRALS RPCs
-- ============================================================================

-- Award referral XP (trigger function)
CREATE OR REPLACE FUNCTION public.fn_award_referral_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_sub_role TEXT;
BEGIN
  -- Get referrer info if referral code exists
  IF NEW.referral_code IS NOT NULL THEN
    SELECT id, sub_role INTO v_referrer_id, v_referrer_sub_role
    FROM public.profiles
    WHERE referral_code = NEW.referral_code
    LIMIT 1;
    
    IF v_referrer_id IS NOT NULL THEN
      -- Award +5 XP to referrer
      UPDATE public.profiles
      SET 
        xp_points = xp_points + 5,
        referrals_count = referrals_count + 1
      WHERE id = v_referrer_id;
      
      -- If referrer is garage_owner, award +1 bid credit
      IF v_referrer_sub_role = 'garage_owner' THEN
        -- Update bid_wallet if it exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallet') THEN
          UPDATE public.bid_wallet
          SET balance = balance + 1
          WHERE user_id = v_referrer_id;
          
          -- Log transaction
          INSERT INTO public.wallet_transactions (user_id, amount, type, description)
          VALUES (v_referrer_id, 1, 'referral_credit', 'Referral bonus: +1 bid credit');
        END IF;
      END IF;
      
      -- Log XP event
      INSERT INTO public.xp_events (user_id, event_type, xp_amount, description)
      VALUES (v_referrer_id, 'referral', 5, 'Referral signup bonus');
      
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id, created_at)
      VALUES (v_referrer_id, NEW.id, NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply referral trigger to profiles if not exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS trigger_award_referral_xp ON public.profiles;
    CREATE TRIGGER trigger_award_referral_xp
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.fn_award_referral_xp();
  END IF;
END $$;

-- ============================================================================
-- 3. NOTIFICATIONS RPCs (BASIC)
-- ============================================================================

-- Preview push notification
CREATE OR REPLACE FUNCTION public.fn_push_preview(
  p_template_id UUID,
  p_test_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_preview JSONB;
BEGIN
  SELECT * INTO v_template FROM public.push_templates WHERE id = p_template_id;
  
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Simple preview (replace {{variables}} with test data)
  v_preview := jsonb_build_object(
    'title', v_template.title_template,
    'body', v_template.body_template,
    'data', v_template.data_template
  );
  
  RETURN v_preview;
END;
$$;

-- Preview email
CREATE OR REPLACE FUNCTION public.fn_email_preview(
  p_template_id UUID,
  p_test_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_preview JSONB;
BEGIN
  SELECT * INTO v_template FROM public.email_templates WHERE id = p_template_id;
  
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  v_preview := jsonb_build_object(
    'subject', v_template.subject_template,
    'html', v_template.html_template,
    'text', v_template.text_template
  );
  
  RETURN v_preview;
END;
$$;

-- Grant boost after payment
CREATE OR REPLACE FUNCTION public.fn_grant_boost_after_payment(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_duration_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_entitlement_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO public.boost_entitlements (entity_type, entity_id, user_id, start_at, end_at, status)
  VALUES (p_entity_type, p_entity_id, v_user_id, NOW(), NOW() + (p_duration_days || ' days')::INTERVAL, 'active')
  RETURNING id INTO v_entitlement_id;
  
  -- Update boosted flag on entity
  IF p_entity_type = 'listing' THEN
    UPDATE public.market_listings SET is_boosted = TRUE WHERE id = p_entity_id;
  ELSIF p_entity_type = 'garage' THEN
    UPDATE public.garages SET is_boosted = TRUE WHERE id = p_entity_id;
  END IF;
  
  -- Log audit event
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'grant_boost', p_entity_type, p_entity_id,
          jsonb_build_object('entitlement_id', v_entitlement_id, 'duration_days', p_duration_days));
  
  RETURN v_entitlement_id;
END;
$$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PART 3 RPCs CREATED: Events, XP, Notifications, Boosts';
END $$;

