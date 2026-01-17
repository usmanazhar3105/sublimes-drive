-- ============================================================================
-- REFERRAL SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This migration creates all tables for the Referral Management system
-- ============================================================================

-- ============================================================================
-- 1. REFERRALS TABLE - Main referral tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_type TEXT NOT NULL CHECK (referrer_type IN ('car_owner', 'garage_owner')),
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_user_type TEXT CHECK (referred_user_type IN ('car_owner', 'garage_owner')),
  referred_email TEXT,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'expired')),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('xp', 'bid_credits', 'both')),
  reward_amount INTEGER DEFAULT 0,
  reward_awarded BOOLEAN DEFAULT false,
  notes TEXT,
  admin_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON public.referrals(created_at DESC);

-- ============================================================================
-- 2. REFERRAL_CODES TABLE - User-generated referral codes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('car_owner', 'garage_owner')),
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 0, -- 0 = unlimited
  reward_type TEXT DEFAULT 'xp' CHECK (reward_type IN ('xp', 'bid_credits', 'both')),
  reward_amount INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active) WHERE is_active = true;

-- ============================================================================
-- 3. REFERRAL_SETTINGS TABLE - Admin configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.referral_settings WHERE setting_key = 'car_owner_xp_reward') THEN
    INSERT INTO public.referral_settings (setting_key, setting_value, description)
    VALUES
      ('car_owner_xp_reward', '{"value": 5}'::jsonb, 'XP awarded to car owners for successful referrals'),
      ('garage_owner_credit_reward', '{"value": 10}'::jsonb, 'Bid credits awarded to garage owners for successful referrals'),
      ('require_approval', '{"value": true}'::jsonb, 'Require admin approval for referrals'),
      ('auto_approve', '{"value": false}'::jsonb, 'Auto-approve all new referrals'),
      ('auto_approve_after_days', '{"value": 7}'::jsonb, 'Auto-approve referrals after X days'),
      ('enable_referral_codes', '{"value": true}'::jsonb, 'Allow users to generate custom referral codes'),
      ('max_referrals_per_user', '{"value": 50}'::jsonb, 'Maximum referrals per user (0 = unlimited)'),
      ('enable_notifications', '{"value": true}'::jsonb, 'Send referral notifications'),
      ('referral_validity_days', '{"value": 30}'::jsonb, 'How long referral codes remain valid'),
      ('referral_system_enabled', '{"value": true}'::jsonb, 'Master switch for referral system');
  END IF;
END $$;

-- ============================================================================
-- 4. ENABLE RLS
-- ============================================================================
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- referrals policies
DROP POLICY IF EXISTS "Allow authenticated select on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow authenticated insert on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow authenticated update on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow authenticated delete on referrals" ON public.referrals;

CREATE POLICY "Allow authenticated select on referrals" ON public.referrals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on referrals" ON public.referrals
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on referrals" ON public.referrals
  FOR DELETE TO authenticated USING (true);

-- referral_codes policies
DROP POLICY IF EXISTS "Allow authenticated select on referral_codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Allow authenticated insert on referral_codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Allow authenticated update on referral_codes" ON public.referral_codes;

CREATE POLICY "Allow authenticated select on referral_codes" ON public.referral_codes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on referral_codes" ON public.referral_codes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on referral_codes" ON public.referral_codes
  FOR UPDATE TO authenticated USING (true);

-- referral_settings policies
DROP POLICY IF EXISTS "Allow authenticated select on referral_settings" ON public.referral_settings;
DROP POLICY IF EXISTS "Allow authenticated update on referral_settings" ON public.referral_settings;

CREATE POLICY "Allow authenticated select on referral_settings" ON public.referral_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update on referral_settings" ON public.referral_settings
  FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- 6. GRANTS
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referral_codes TO authenticated;
GRANT SELECT, UPDATE ON public.referral_settings TO authenticated;

-- ============================================================================
-- 7. FUNCTIONS
-- ============================================================================

-- Function to get referral stats
CREATE OR REPLACE FUNCTION public.fn_get_referral_stats()
RETURNS TABLE (
  total_referrals BIGINT,
  pending_approval BIGINT,
  completed BIGINT,
  rejected BIGINT,
  total_xp_awarded BIGINT,
  total_credits_awarded BIGINT,
  car_owner_referrals BIGINT,
  garage_owner_referrals BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total BIGINT;
  v_completed BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.referrals;
  SELECT COUNT(*) INTO v_completed FROM public.referrals WHERE status = 'completed';

  RETURN QUERY
  SELECT
    v_total,
    (SELECT COUNT(*) FROM public.referrals WHERE status = 'pending')::BIGINT,
    v_completed,
    (SELECT COUNT(*) FROM public.referrals WHERE status = 'rejected')::BIGINT,
    COALESCE((SELECT SUM(reward_amount) FROM public.referrals WHERE reward_type = 'xp' AND reward_awarded = true), 0)::BIGINT,
    COALESCE((SELECT SUM(reward_amount) FROM public.referrals WHERE reward_type = 'bid_credits' AND reward_awarded = true), 0)::BIGINT,
    (SELECT COUNT(*) FROM public.referrals WHERE referrer_type = 'car_owner')::BIGINT,
    (SELECT COUNT(*) FROM public.referrals WHERE referrer_type = 'garage_owner')::BIGINT,
    CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100, 1) ELSE 0 END;
END;
$$;

-- Function to get top referrers
CREATE OR REPLACE FUNCTION public.fn_get_top_referrers(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  referrer_id UUID,
  referrer_name TEXT,
  referrer_type TEXT,
  total_referrals BIGINT,
  successful_referrals BIGINT,
  total_rewards BIGINT,
  reward_type TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.referrer_id,
    COALESCE(p.display_name, p.email, 'Unknown') as referrer_name,
    r.referrer_type,
    COUNT(r.id)::BIGINT as total_referrals,
    COUNT(r.id) FILTER (WHERE r.status = 'completed')::BIGINT as successful_referrals,
    COALESCE(SUM(r.reward_amount) FILTER (WHERE r.reward_awarded = true), 0)::BIGINT as total_rewards,
    MAX(r.reward_type) as reward_type
  FROM public.referrals r
  LEFT JOIN public.profiles p ON r.referrer_id = p.id
  GROUP BY r.referrer_id, p.display_name, p.email, r.referrer_type
  ORDER BY COUNT(r.id) DESC
  LIMIT p_limit;
END;
$$;

-- Function to approve a referral
CREATE OR REPLACE FUNCTION public.fn_approve_referral(p_referral_id UUID, p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.referrals
  SET status = 'approved',
      approved_by = p_admin_id,
      approved_at = NOW(),
      updated_at = NOW()
  WHERE id = p_referral_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Function to complete a referral and award rewards
CREATE OR REPLACE FUNCTION public.fn_complete_referral(p_referral_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral RECORD;
BEGIN
  SELECT * INTO v_referral FROM public.referrals WHERE id = p_referral_id;
  
  IF NOT FOUND OR v_referral.status NOT IN ('approved', 'pending') THEN
    RETURN FALSE;
  END IF;
  
  -- Update referral status
  UPDATE public.referrals
  SET status = 'completed',
      reward_awarded = true,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_referral_id;
  
  -- Award XP if reward_type is 'xp'
  IF v_referral.reward_type IN ('xp', 'both') THEN
    -- Update or insert user_xp
    INSERT INTO public.user_xp (user_id, total_xp, last_xp_earned_at)
    VALUES (v_referral.referrer_id, v_referral.reward_amount, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET total_xp = public.user_xp.total_xp + v_referral.reward_amount,
        last_xp_earned_at = NOW(),
        updated_at = NOW();
    
    -- Record XP transaction
    INSERT INTO public.xp_transactions (user_id, amount, type, source, description)
    VALUES (
      v_referral.referrer_id,
      v_referral.reward_amount,
      'earned',
      'referral',
      'Referral reward for referring a new user'
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 8. GENERATE DEFAULT REFERRAL CODES FOR EXISTING USERS
-- ============================================================================
DO $$
DECLARE
  v_profile RECORD;
  v_code TEXT;
BEGIN
  FOR v_profile IN 
    SELECT p.id, p.display_name, p.role
    FROM public.profiles p
    LEFT JOIN public.referral_codes rc ON p.id = rc.user_id
    WHERE rc.id IS NULL
  LOOP
    -- Generate unique code
    v_code := UPPER(
      COALESCE(
        SUBSTRING(REGEXP_REPLACE(v_profile.display_name, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 6),
        'USER'
      ) || 
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    );
    
    -- Insert referral code
    INSERT INTO public.referral_codes (
      user_id, 
      code, 
      user_type,
      reward_type,
      reward_amount
    )
    VALUES (
      v_profile.id,
      v_code,
      CASE WHEN v_profile.role = 'garage_owner' THEN 'garage_owner' ELSE 'car_owner' END,
      CASE WHEN v_profile.role = 'garage_owner' THEN 'bid_credits' ELSE 'xp' END,
      CASE WHEN v_profile.role = 'garage_owner' THEN 10 ELSE 5 END
    )
    ON CONFLICT (code) DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- DONE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'REFERRAL SYSTEM MIGRATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables: referrals, referral_codes, referral_settings';
  RAISE NOTICE 'Functions: fn_get_referral_stats, fn_get_top_referrers,';
  RAISE NOTICE '           fn_approve_referral, fn_complete_referral';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;


