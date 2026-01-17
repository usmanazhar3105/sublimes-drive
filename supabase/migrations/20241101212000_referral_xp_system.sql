/**
 * Migration: Referral and XP System
 * 
 * Implements:
 * - Referral tracking
 * - XP points system
 * - Leaderboard
 * - Referral rewards (XP + wallet credits for garage owners)
 * 
 * Date: 2025-11-01
 */

-- ============================================================================
-- 1. EXTEND PROFILES FOR XP SYSTEM
-- ============================================================================

-- Add XP and referral columns if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0 CHECK (xp_points >= 0);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0 CHECK (referrals_count >= 0);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp_level INTEGER DEFAULT 1 CHECK (xp_level >= 1);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp_level_name TEXT DEFAULT 'Novice';

-- ============================================================================
-- 2. REFERRALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Rewards
  points_awarded INTEGER DEFAULT 5,
  credit_awarded BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  
  -- Metadata
  referral_source TEXT, -- 'link', 'code', 'social', etc.
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate referrals
  UNIQUE(referrer_id, referred_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================================
-- 3. XP TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- XP details
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earned', 'deducted', 'bonus', 'penalty')),
  source TEXT NOT NULL, -- 'referral', 'daily_challenge', 'post', 'comment', 'admin', etc.
  
  -- Related entities
  related_id UUID, -- ID of related entity (challenge, post, etc.)
  related_type TEXT, -- 'challenge', 'post', 'comment', etc.
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_tx_source ON xp_transactions(source);

-- ============================================================================
-- 4. LEADERBOARD VIEW
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.xp_points,
  p.xp_level,
  p.xp_level_name,
  p.referrals_count,
  p.badge_color,
  p.sub_role,
  ROW_NUMBER() OVER (ORDER BY p.xp_points DESC, p.created_at ASC) as rank,
  -- Calculate percentile
  PERCENT_RANK() OVER (ORDER BY p.xp_points) as percentile
FROM profiles p
WHERE p.role = 'user' -- Exclude admins from leaderboard
ORDER BY p.xp_points DESC, p.created_at ASC;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Generate referral code on profile creation
CREATE OR REPLACE FUNCTION fn_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    -- Generate unique 8-character code
    NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_generate_referral_code();

-- Update XP level based on points
CREATE OR REPLACE FUNCTION fn_update_xp_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate level based on XP (every 100 XP = 1 level)
  NEW.xp_level := GREATEST(1, (NEW.xp_points / 100) + 1);
  
  -- Assign level name
  NEW.xp_level_name := CASE
    WHEN NEW.xp_level >= 50 THEN 'Legend'
    WHEN NEW.xp_level >= 40 THEN 'Master'
    WHEN NEW.xp_level >= 30 THEN 'Expert'
    WHEN NEW.xp_level >= 20 THEN 'Professional'
    WHEN NEW.xp_level >= 10 THEN 'Intermediate'
    WHEN NEW.xp_level >= 5 THEN 'Apprentice'
    ELSE 'Novice'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_xp_level ON profiles;
CREATE TRIGGER trg_update_xp_level
  BEFORE INSERT OR UPDATE OF xp_points
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_xp_level();

-- ============================================================================
-- 6. RPC FUNCTIONS
-- ============================================================================

-- Function: Process referral signup
CREATE OR REPLACE FUNCTION fn_process_referral(
  p_referrer_code TEXT,
  p_referred_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_is_garage BOOLEAN;
  v_xp_awarded INTEGER := 5;
  v_credit_awarded BOOLEAN := FALSE;
BEGIN
  -- Use auth.uid() if referred_id not provided
  v_referred_id := COALESCE(p_referred_id, auth.uid());
  
  IF v_referred_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find referrer by code
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = UPPER(p_referrer_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_id = v_referred_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;
  
  -- Check if already referred
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_id = v_referred_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  -- Insert referral record
  INSERT INTO referrals (referrer_id, referred_id, referral_source)
  VALUES (v_referrer_id, v_referred_id, 'code');
  
  -- Update referred_by in profiles
  UPDATE profiles
  SET referred_by = v_referrer_id
  WHERE id = v_referred_id;
  
  -- Award XP to referrer
  UPDATE profiles
  SET 
    xp_points = xp_points + v_xp_awarded,
    referrals_count = referrals_count + 1
  WHERE id = v_referrer_id;
  
  -- Log XP transaction
  INSERT INTO xp_transactions (user_id, amount, type, source, related_id, description)
  VALUES (
    v_referrer_id,
    v_xp_awarded,
    'earned',
    'referral',
    v_referred_id,
    'Referral bonus for inviting new user'
  );
  
  -- Check if referrer is garage owner
  SELECT sub_role = 'garage_owner' INTO v_is_garage
  FROM profiles
  WHERE id = v_referrer_id;
  
  -- Award wallet credit if garage owner
  IF v_is_garage THEN
    -- Add credit to wallet
    INSERT INTO bid_wallet (garage_owner_id, balance, total_earned)
    VALUES (v_referrer_id, 1, 1)
    ON CONFLICT (garage_owner_id)
    DO UPDATE SET
      balance = bid_wallet.balance + 1,
      total_earned = bid_wallet.total_earned + 1,
      updated_at = NOW();
    
    -- Log wallet transaction
    INSERT INTO wallet_transactions (
      user_id,
      amount,
      type,
      source,
      metadata,
      description
    ) VALUES (
      v_referrer_id,
      1,
      'credit',
      'referral',
      jsonb_build_object('referred_id', v_referred_id),
      'Free bid credit for successful referral'
    );
    
    v_credit_awarded := TRUE;
    
    -- Update referral record
    UPDATE referrals
    SET credit_awarded = TRUE
    WHERE referrer_id = v_referrer_id AND referred_id = v_referred_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_awarded,
    'credit_awarded', v_credit_awarded,
    'message', 'Referral processed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Award XP
CREATE OR REPLACE FUNCTION fn_award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
BEGIN
  -- Update XP
  UPDATE profiles
  SET xp_points = xp_points + p_amount
  WHERE id = p_user_id;
  
  -- Log transaction
  INSERT INTO xp_transactions (
    user_id,
    amount,
    type,
    source,
    related_id,
    related_type,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'earned',
    p_source,
    p_related_id,
    p_related_type,
    p_description
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Deduct XP (admin only)
CREATE OR REPLACE FUNCTION fn_deduct_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;
  
  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Deduct XP (don't go below 0)
  UPDATE profiles
  SET xp_points = GREATEST(0, xp_points - p_amount)
  WHERE id = p_user_id;
  
  -- Log transaction
  INSERT INTO xp_transactions (
    user_id,
    amount,
    type,
    source,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'penalty',
    'admin',
    p_reason
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user leaderboard position
CREATE OR REPLACE FUNCTION fn_get_leaderboard_position(
  p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_position INTEGER;
  v_total_users INTEGER;
  v_xp_points INTEGER;
  v_percentile NUMERIC;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get user's position
  SELECT 
    rank,
    xp_points,
    percentile
  INTO v_position, v_xp_points, v_percentile
  FROM leaderboard
  WHERE id = v_user_id;
  
  -- Get total users
  SELECT COUNT(*) INTO v_total_users
  FROM profiles
  WHERE role = 'user';
  
  RETURN jsonb_build_object(
    'success', true,
    'position', v_position,
    'total_users', v_total_users,
    'xp_points', v_xp_points,
    'percentile', ROUND((v_percentile * 100)::numeric, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top leaderboard
CREATE OR REPLACE FUNCTION fn_get_top_leaderboard(
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  xp_points INTEGER,
  xp_level INTEGER,
  xp_level_name TEXT,
  referrals_count INTEGER,
  badge_color TEXT,
  sub_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.rank,
    l.id,
    l.display_name,
    l.username,
    l.avatar_url,
    l.xp_points,
    l.xp_level,
    l.xp_level_name,
    l.referrals_count,
    l.badge_color,
    l.sub_role
  FROM leaderboard l
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Ban fraudulent referral (admin only)
CREATE OR REPLACE FUNCTION fn_ban_referral(
  p_referral_id UUID,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
  v_referrer_id UUID;
  v_xp_to_deduct INTEGER;
  v_credit_awarded BOOLEAN;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;
  
  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Get referral details
  SELECT referrer_id, points_awarded, credit_awarded
  INTO v_referrer_id, v_xp_to_deduct, v_credit_awarded
  FROM referrals
  WHERE id = p_referral_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral not found');
  END IF;
  
  -- Cancel referral
  UPDATE referrals
  SET status = 'cancelled'
  WHERE id = p_referral_id;
  
  -- Deduct XP
  UPDATE profiles
  SET 
    xp_points = GREATEST(0, xp_points - v_xp_to_deduct),
    referrals_count = GREATEST(0, referrals_count - 1)
  WHERE id = v_referrer_id;
  
  -- Log XP deduction
  INSERT INTO xp_transactions (
    user_id,
    amount,
    type,
    source,
    related_id,
    description
  ) VALUES (
    v_referrer_id,
    v_xp_to_deduct,
    'penalty',
    'admin',
    p_referral_id,
    'Fraudulent referral banned: ' || p_reason
  );
  
  -- Deduct credit if awarded
  IF v_credit_awarded THEN
    UPDATE bid_wallet
    SET balance = GREATEST(0, balance - 1)
    WHERE garage_owner_id = v_referrer_id;
    
    INSERT INTO wallet_transactions (
      user_id,
      amount,
      type,
      source,
      description
    ) VALUES (
      v_referrer_id,
      1,
      'debit',
      'admin',
      'Credit revoked for fraudulent referral'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral banned and rewards revoked'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- Referrals policies
CREATE POLICY "users_read_own_referrals" ON referrals
FOR SELECT USING (
  referrer_id = auth.uid() OR referred_id = auth.uid()
);

CREATE POLICY "admins_read_all_referrals" ON referrals
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- XP transactions policies
CREATE POLICY "users_read_own_xp_tx" ON xp_transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admins_read_all_xp_tx" ON xp_transactions
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_xp_points ON profiles(xp_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE referrals IS 'Tracks user referrals and rewards';
COMMENT ON TABLE xp_transactions IS 'Audit log of XP changes';
COMMENT ON VIEW leaderboard IS 'Global XP leaderboard with rankings';
COMMENT ON COLUMN profiles.xp_points IS 'Total XP points earned';
COMMENT ON COLUMN profiles.referrals_count IS 'Number of successful referrals';
COMMENT ON COLUMN profiles.referral_code IS 'Unique referral code for sharing';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20241101212000_referral_xp_system completed successfully';
END $$;
