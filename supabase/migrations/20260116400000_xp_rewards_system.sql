-- ============================================================================
-- XP & REWARDS SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This migration creates all tables for the XP Management & Rewards system
-- ============================================================================

-- ============================================================================
-- 1. USER_XP TABLE - Tracks user XP points and progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_xp_earned_at TIMESTAMPTZ,
  current_milestone INTEGER DEFAULT 100,
  milestone_progress INTEGER DEFAULT 0,
  posts_with_xp INTEGER DEFAULT 0,
  rank_position INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_xp_user ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_total ON public.user_xp(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_active ON public.user_xp(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_xp_rank ON public.user_xp(rank_position) WHERE rank_position IS NOT NULL;

-- ============================================================================
-- 2. XP_TRANSACTIONS TABLE - History of XP earned/spent
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'bonus', 'milestone', 'admin_adjust', 'deducted', 'streak_bonus')),
  source TEXT NOT NULL CHECK (source IN ('post', 'comment', 'like', 'share', 'referral', 'streak', 'milestone', 'admin', 'event', 'other')),
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  balance_after INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_type ON public.xp_transactions(type);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON public.xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON public.xp_transactions(source);

-- ============================================================================
-- 3. XP_MILESTONE_REWARDS TABLE - Reward tiers for XP milestones
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.xp_milestone_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xp_threshold INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'gift', 'discount', 'credits', 'feature', 'custom')),
  reward_value JSONB DEFAULT '{}',
  badge_icon TEXT,
  badge_color TEXT,
  is_active BOOLEAN DEFAULT true,
  claims_count INTEGER DEFAULT 0,
  validity_months INTEGER DEFAULT 6,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_xp_milestones_threshold ON public.xp_milestone_rewards(xp_threshold);
CREATE INDEX IF NOT EXISTS idx_xp_milestones_active ON public.xp_milestone_rewards(is_active) WHERE is_active = true;

-- Insert default milestones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.xp_milestone_rewards LIMIT 1) THEN
    INSERT INTO public.xp_milestone_rewards (xp_threshold, title, description, reward_type, reward_value, badge_color, sort_order)
    VALUES
      (100, 'Free car accessory', 'Premium car accessory of your choice', 'gift', '{"gift_type": "accessory", "max_value": 100}'::jsonb, 'gold', 1),
      (200, 'Premium profile badge', 'Exclusive verified badge for your profile', 'badge', '{"badge_name": "verified_gold", "duration_days": 365}'::jsonb, 'purple', 2),
      (365, 'Annual recognition award', 'Special trophy and certificate of achievement', 'gift', '{"gift_type": "trophy", "includes_certificate": true}'::jsonb, 'platinum', 3),
      (500, 'VIP Status', 'VIP member status with exclusive benefits', 'feature', '{"features": ["priority_support", "early_access", "vip_badge"]}'::jsonb, 'diamond', 4),
      (1000, 'Lifetime Achievement', 'Permanent recognition and premium rewards', 'custom', '{"reward": "lifetime_premium", "one_time": true}'::jsonb, 'legendary', 5);
  END IF;
END $$;

-- ============================================================================
-- 4. XP_REWARD_CLAIMS TABLE - Track claimed rewards
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.xp_reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.xp_milestone_rewards(id) ON DELETE CASCADE,
  xp_at_claim INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  shipping_address JSONB,
  tracking_number TEXT,
  notes TEXT,
  admin_notes TEXT,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_claims_user ON public.xp_reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_claims_status ON public.xp_reward_claims(status);
CREATE INDEX IF NOT EXISTS idx_xp_claims_milestone ON public.xp_reward_claims(milestone_id);

-- ============================================================================
-- 5. XP_SETTINGS TABLE - Admin configuration for XP system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.xp_settings (
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
  IF NOT EXISTS (SELECT 1 FROM public.xp_settings WHERE setting_key = 'xp_per_post') THEN
    INSERT INTO public.xp_settings (setting_key, setting_value, description)
    VALUES
      ('xp_per_post', '{"value": 1}'::jsonb, 'XP earned per qualifying post'),
      ('max_daily_xp', '{"value": 10}'::jsonb, 'Maximum XP a user can earn per day'),
      ('require_image_for_xp', '{"value": true}'::jsonb, 'Posts must include an image to earn XP'),
      ('milestone_validity_months', '{"value": 6}'::jsonb, 'Months to claim milestone rewards'),
      ('enable_streak_tracking', '{"value": true}'::jsonb, 'Track consecutive daily posting'),
      ('enable_leaderboards', '{"value": true}'::jsonb, 'Show public XP rankings'),
      ('enable_xp_notifications', '{"value": true}'::jsonb, 'Send XP-related notifications'),
      ('daily_reminder_hour', '{"value": 20}'::jsonb, 'Hour to send daily posting reminder (24h)'),
      ('streak_bonus_xp', '{"value": 1, "required_days": 7}'::jsonb, 'Bonus XP for maintaining streak'),
      ('xp_system_enabled', '{"value": true}'::jsonb, 'Master switch for XP system');
  END IF;
END $$;

-- ============================================================================
-- 6. ENABLE RLS
-- ============================================================================
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_milestone_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- user_xp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_xp' AND policyname = 'user_xp_select') THEN
    CREATE POLICY user_xp_select ON public.user_xp FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_xp' AND policyname = 'user_xp_insert') THEN
    CREATE POLICY user_xp_insert ON public.user_xp FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_xp' AND policyname = 'user_xp_update') THEN
    CREATE POLICY user_xp_update ON public.user_xp FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- xp_transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_transactions' AND policyname = 'xp_transactions_select') THEN
    CREATE POLICY xp_transactions_select ON public.xp_transactions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_transactions' AND policyname = 'xp_transactions_insert') THEN
    CREATE POLICY xp_transactions_insert ON public.xp_transactions FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- xp_milestone_rewards
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_milestone_rewards' AND policyname = 'xp_milestones_select') THEN
    CREATE POLICY xp_milestones_select ON public.xp_milestone_rewards FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_milestone_rewards' AND policyname = 'xp_milestones_all') THEN
    CREATE POLICY xp_milestones_all ON public.xp_milestone_rewards FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- xp_reward_claims
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_reward_claims' AND policyname = 'xp_claims_select') THEN
    CREATE POLICY xp_claims_select ON public.xp_reward_claims FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_reward_claims' AND policyname = 'xp_claims_all') THEN
    CREATE POLICY xp_claims_all ON public.xp_reward_claims FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- xp_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_settings' AND policyname = 'xp_settings_select') THEN
    CREATE POLICY xp_settings_select ON public.xp_settings FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_settings' AND policyname = 'xp_settings_update') THEN
    CREATE POLICY xp_settings_update ON public.xp_settings FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- 8. FUNCTIONS
-- ============================================================================

-- Function to get XP stats
CREATE OR REPLACE FUNCTION public.fn_get_xp_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  total_xp_earned BIGINT,
  users_100_plus BIGINT,
  average_xp NUMERIC,
  pending_rewards BIGINT,
  fulfilled_rewards BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.user_xp)::BIGINT,
    (SELECT COUNT(*) FROM public.user_xp WHERE is_active = true AND total_xp > 0)::BIGINT,
    COALESCE((SELECT SUM(total_xp) FROM public.user_xp), 0)::BIGINT,
    (SELECT COUNT(*) FROM public.user_xp WHERE total_xp >= 100)::BIGINT,
    COALESCE((SELECT AVG(total_xp)::NUMERIC FROM public.user_xp WHERE total_xp > 0), 0),
    (SELECT COUNT(*) FROM public.xp_reward_claims WHERE status IN ('pending', 'processing'))::BIGINT,
    (SELECT COUNT(*) FROM public.xp_reward_claims WHERE status IN ('delivered', 'completed'))::BIGINT;
END;
$$;

-- Function to add XP to user
CREATE OR REPLACE FUNCTION public.fn_add_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT DEFAULT 'post',
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_xp_id UUID;
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_max_daily INTEGER;
  v_today_xp INTEGER;
BEGIN
  -- Get max daily XP setting
  SELECT (setting_value->>'value')::INTEGER INTO v_max_daily
  FROM public.xp_settings WHERE setting_key = 'max_daily_xp';
  v_max_daily := COALESCE(v_max_daily, 10);

  -- Get XP earned today
  SELECT COALESCE(SUM(amount), 0) INTO v_today_xp
  FROM public.xp_transactions
  WHERE user_id = p_user_id
    AND type = 'earned'
    AND created_at >= CURRENT_DATE;

  -- Check daily limit
  IF v_today_xp >= v_max_daily THEN
    RETURN 0; -- Daily limit reached
  END IF;

  -- Adjust amount if it would exceed daily limit
  IF v_today_xp + p_amount > v_max_daily THEN
    p_amount := v_max_daily - v_today_xp;
  END IF;

  -- Get or create user_xp record
  SELECT id, total_xp INTO v_user_xp_id, v_current_xp
  FROM public.user_xp
  WHERE user_id = p_user_id;

  IF v_user_xp_id IS NULL THEN
    INSERT INTO public.user_xp (user_id, total_xp, last_xp_earned_at, posts_with_xp)
    VALUES (p_user_id, p_amount, NOW(), 1)
    RETURNING id, total_xp INTO v_user_xp_id, v_new_xp;
  ELSE
    v_new_xp := v_current_xp + p_amount;
    UPDATE public.user_xp
    SET total_xp = v_new_xp,
        last_xp_earned_at = NOW(),
        posts_with_xp = posts_with_xp + 1,
        milestone_progress = (v_new_xp % 100),
        updated_at = NOW()
    WHERE id = v_user_xp_id;
  END IF;

  -- Record transaction
  INSERT INTO public.xp_transactions (
    user_id, amount, type, source, description,
    reference_type, reference_id, balance_after
  )
  VALUES (
    p_user_id, p_amount, 'earned', p_source, p_description,
    p_reference_type, p_reference_id, v_new_xp
  );

  RETURN p_amount;
END;
$$;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION public.fn_update_xp_rankings()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_xp DESC, last_xp_earned_at ASC) as rank
    FROM public.user_xp
    WHERE is_active = true AND total_xp > 0
  )
  UPDATE public.user_xp ux
  SET rank_position = r.rank, updated_at = NOW()
  FROM ranked r
  WHERE ux.id = r.id;
END;
$$;

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Trigger to update rankings after XP changes
CREATE OR REPLACE FUNCTION public.fn_trigger_update_rankings()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.fn_update_xp_rankings();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_xp_rankings') THEN
    CREATE TRIGGER trg_update_xp_rankings
    AFTER INSERT OR UPDATE OF total_xp ON public.user_xp
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.fn_trigger_update_rankings();
  END IF;
END $$;

-- ============================================================================
-- 10. INITIALIZE XP FOR EXISTING USERS
-- ============================================================================
DO $$
BEGIN
  -- Create user_xp records for users who don't have one
  INSERT INTO public.user_xp (user_id, total_xp)
  SELECT p.id, 0
  FROM public.profiles p
  LEFT JOIN public.user_xp ux ON p.id = ux.user_id
  WHERE ux.id IS NULL
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'XP & REWARDS SYSTEM MIGRATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables: user_xp, xp_transactions, xp_milestone_rewards,';
  RAISE NOTICE '        xp_reward_claims, xp_settings';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions: fn_get_xp_stats, fn_add_xp, fn_update_xp_rankings';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;



