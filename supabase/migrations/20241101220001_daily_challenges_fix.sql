/**
 * Migration: Daily Challenges System (Fixed)
 * 
 * Fixes conflicts with existing daily_challenges table
 * Adds missing columns and functions
 * 
 * Date: 2025-11-01
 */

-- ============================================================================
-- 1. ALTER EXISTING TABLE OR CREATE NEW
-- ============================================================================

-- Add missing columns to existing table if they don't exist
DO $$ 
BEGIN
  -- Add active_date if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'active_date') THEN
    ALTER TABLE daily_challenges ADD COLUMN active_date DATE DEFAULT CURRENT_DATE;
  END IF;

  -- Add challenge_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'challenge_type') THEN
    ALTER TABLE daily_challenges ADD COLUMN challenge_type TEXT;
  END IF;

  -- Add target_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'target_count') THEN
    ALTER TABLE daily_challenges ADD COLUMN target_count INTEGER DEFAULT 1;
  END IF;

  -- Add xp_reward if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'xp_reward') THEN
    ALTER TABLE daily_challenges ADD COLUMN xp_reward INTEGER DEFAULT 10;
  END IF;

  -- Add status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'status') THEN
    ALTER TABLE daily_challenges ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  -- Add total_participants if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'total_participants') THEN
    ALTER TABLE daily_challenges ADD COLUMN total_participants INTEGER DEFAULT 0;
  END IF;

  -- Add total_completions if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'total_completions') THEN
    ALTER TABLE daily_challenges ADD COLUMN total_completions INTEGER DEFAULT 0;
  END IF;

  -- Add completion_rate if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_challenges' AND column_name = 'completion_rate') THEN
    ALTER TABLE daily_challenges ADD COLUMN completion_rate NUMERIC(5,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- 2. CHALLENGE COMPLETIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Progress
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'claimed')),
  
  -- Completion details
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  
  -- Rewards claimed
  xp_claimed INTEGER DEFAULT 0,
  credits_claimed INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id, status);

-- ============================================================================
-- 3. RPC FUNCTIONS
-- ============================================================================

-- Get today's challenges for user
CREATE OR REPLACE FUNCTION fn_get_todays_challenges(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  challenge_id UUID,
  title TEXT,
  description TEXT,
  challenge_type TEXT,
  target_count INTEGER,
  xp_reward INTEGER,
  difficulty TEXT,
  user_progress INTEGER,
  user_status TEXT,
  completed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.title,
    dc.description,
    dc.challenge_type,
    dc.target_count,
    dc.xp_reward,
    dc.difficulty,
    COALESCE(cc.current_progress, 0) as user_progress,
    COALESCE(cc.status, 'not_started') as user_status,
    cc.completed_at
  FROM daily_challenges dc
  LEFT JOIN challenge_completions cc ON dc.id = cc.challenge_id 
    AND cc.user_id = COALESCE(p_user_id, auth.uid())
  WHERE dc.active_date = CURRENT_DATE
    AND dc.status = 'active'
  ORDER BY dc.difficulty, dc.xp_reward DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update challenge progress
CREATE OR REPLACE FUNCTION fn_update_challenge_progress(
  p_challenge_id UUID,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_new_progress INTEGER;
  v_target INTEGER;
  v_xp_reward INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get challenge details
  SELECT target_count, xp_reward
  INTO v_target, v_xp_reward
  FROM daily_challenges
  WHERE id = p_challenge_id;
  
  -- Insert or update progress
  INSERT INTO challenge_completions (challenge_id, user_id, target_progress, current_progress, status)
  VALUES (p_challenge_id, v_user_id, v_target, p_increment, 
          CASE WHEN p_increment >= v_target THEN 'completed' ELSE 'in_progress' END)
  ON CONFLICT (challenge_id, user_id)
  DO UPDATE SET 
    current_progress = LEAST(challenge_completions.current_progress + p_increment, challenge_completions.target_progress),
    status = CASE 
      WHEN challenge_completions.current_progress + p_increment >= challenge_completions.target_progress 
      THEN 'completed'
      ELSE 'in_progress'
    END,
    completed_at = CASE 
      WHEN challenge_completions.current_progress + p_increment >= challenge_completions.target_progress 
      THEN NOW()
      ELSE challenge_completions.completed_at
    END,
    updated_at = NOW()
  RETURNING current_progress INTO v_new_progress;
  
  -- Award XP if completed
  IF v_new_progress >= v_target THEN
    PERFORM fn_award_xp(v_user_id, v_xp_reward, 'daily_challenge', p_challenge_id::TEXT, NULL, 'Completed daily challenge');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'progress', v_new_progress,
    'target', v_target,
    'completed', v_new_progress >= v_target
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

-- Users can read/write own completions
DROP POLICY IF EXISTS "users_manage_own_completions" ON challenge_completions;
CREATE POLICY "users_manage_own_completions" ON challenge_completions
FOR ALL USING (user_id = auth.uid());

-- Admins can read all
DROP POLICY IF EXISTS "admin_read_all_completions" ON challenge_completions;
CREATE POLICY "admin_read_all_completions" ON challenge_completions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20241101220001_daily_challenges_fix completed successfully';
END $$;
