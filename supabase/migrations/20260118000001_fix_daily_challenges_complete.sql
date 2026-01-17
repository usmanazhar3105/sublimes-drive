-- ============================================================================
-- Fix Daily Challenges Table and Setup
-- ============================================================================
-- This migration ensures daily_challenges table has all required columns
-- and works for all user types (admin, car-owner, garage-owner, browser)
-- ============================================================================

-- Drop existing table if it has wrong structure (will recreate)
-- We'll use IF NOT EXISTS and ALTER to be safe

-- Create daily_challenges table with all required columns
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'post', 'comment', 'like', 'share', etc.
  
  -- Challenge details
  target_count INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  icon TEXT DEFAULT '🎯',
  
  -- Date management (support both naming conventions)
  start_date DATE,
  end_date DATE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active_date DATE DEFAULT CURRENT_DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  
  -- Legacy columns (for compatibility)
  key TEXT,
  name TEXT,
  rules_json JSONB DEFAULT '{}'::jsonb,
  reward_xp INTEGER,
  
  -- Stats
  total_participants INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add title if missing (might be called 'name')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'title') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN title TEXT;
    -- Copy from 'name' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'daily_challenges' 
               AND column_name = 'name') THEN
      UPDATE public.daily_challenges SET title = name WHERE title IS NULL;
    END IF;
  END IF;

  -- Add description if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'description') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN description TEXT;
  END IF;

  -- Add challenge_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'challenge_type') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN challenge_type TEXT;
  END IF;

  -- Add target_count if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'target_count') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN target_count INTEGER DEFAULT 1;
  END IF;

  -- Add xp_reward if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'xp_reward') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN xp_reward INTEGER DEFAULT 10;
    -- Copy from reward_xp if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'daily_challenges' 
               AND column_name = 'reward_xp') THEN
      UPDATE public.daily_challenges SET xp_reward = reward_xp WHERE xp_reward IS NULL;
    END IF;
  END IF;

  -- Add start_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'start_date') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN start_date DATE;
    -- Copy from starts_at if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'daily_challenges' 
               AND column_name = 'starts_at') THEN
      UPDATE public.daily_challenges SET start_date = starts_at::DATE WHERE start_date IS NULL;
    END IF;
  END IF;

  -- Add end_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'end_date') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN end_date DATE;
    -- Copy from ends_at if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'daily_challenges' 
               AND column_name = 'ends_at') THEN
      UPDATE public.daily_challenges SET end_date = ends_at::DATE WHERE end_date IS NULL;
    END IF;
  END IF;

  -- Add is_active if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'is_active') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add active_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'active_date') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN active_date DATE DEFAULT CURRENT_DATE;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  -- Add icon if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'icon') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN icon TEXT DEFAULT '🎯';
  END IF;

  -- Add difficulty if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'difficulty') THEN
    ALTER TABLE public.daily_challenges ADD COLUMN difficulty TEXT DEFAULT 'easy';
  END IF;

  -- Set defaults for NULL values
  UPDATE public.daily_challenges 
  SET 
    start_date = COALESCE(start_date, CURRENT_DATE),
    end_date = COALESCE(end_date, CURRENT_DATE + INTERVAL '1 day'),
    is_active = COALESCE(is_active, true),
    status = COALESCE(status, 'active'),
    target_count = COALESCE(target_count, 1),
    xp_reward = COALESCE(xp_reward, 10)
  WHERE start_date IS NULL OR end_date IS NULL OR is_active IS NULL;
END $$;

-- Create user_daily_progress table
CREATE TABLE IF NOT EXISTS public.user_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  
  -- Progress tracking
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  claimed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, challenge_id)
);

-- Add missing columns to user_daily_progress if table already exists
DO $$ 
BEGIN
  -- Add progress if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'progress') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN progress INTEGER DEFAULT 0;
  END IF;

  -- Add completed if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'completed') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN completed BOOLEAN DEFAULT false;
  END IF;

  -- Add claimed if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'claimed') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN claimed BOOLEAN DEFAULT false;
  END IF;

  -- Add started_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'started_at') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add completed_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'completed_at') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;

  -- Add claimed_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'claimed_at') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN claimed_at TIMESTAMPTZ;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_daily_progress' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.user_daily_progress ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes (after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON public.daily_challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_type ON public.daily_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user ON public.user_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_challenge ON public.user_daily_progress(challenge_id);

-- Only create completed index if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'user_daily_progress' 
             AND column_name = 'completed') THEN
    CREATE INDEX IF NOT EXISTS idx_user_daily_progress_completed ON public.user_daily_progress(user_id, completed);
  END IF;
END $$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "daily_challenges_public_read" ON public.daily_challenges;
DROP POLICY IF EXISTS "daily_challenges_admin_all" ON public.daily_challenges;
DROP POLICY IF EXISTS "user_daily_progress_own" ON public.user_daily_progress;
DROP POLICY IF EXISTS "user_daily_progress_admin_read" ON public.user_daily_progress;

-- Daily challenges: Public read for active challenges
CREATE POLICY "daily_challenges_public_read" ON public.daily_challenges
FOR SELECT
USING (is_active = true);

-- Daily challenges: Admins can do everything
CREATE POLICY "daily_challenges_admin_all" ON public.daily_challenges
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- User progress: Users can read/write their own progress
CREATE POLICY "user_daily_progress_own" ON public.user_daily_progress
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User progress: Admins can read all
CREATE POLICY "user_daily_progress_admin_read" ON public.user_daily_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- ============================================================================
-- INSERT SAMPLE CHALLENGES (if none exist)
-- ============================================================================
-- Insert sample challenges only if columns exist
DO $$
BEGIN
  -- Only proceed if required columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'daily_challenges' 
             AND column_name = 'icon')
     AND EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'daily_challenges' 
                 AND column_name = 'title') THEN
    
    -- Insert First Post challenge
    INSERT INTO public.daily_challenges (
      title, description, challenge_type, target_count, xp_reward, difficulty, icon,
      start_date, end_date, is_active, status
    )
    SELECT 
      'First Post', 'Create your first post in the community', 'post', 1, 25, 'easy', '📝',
      CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE challenge_type = 'post' AND start_date = CURRENT_DATE);
    
    -- Insert Social Butterfly challenge
    INSERT INTO public.daily_challenges (
      title, description, challenge_type, target_count, xp_reward, difficulty, icon,
      start_date, end_date, is_active, status
    )
    SELECT 
      'Social Butterfly', 'Comment on 3 different posts', 'comment', 3, 30, 'easy', '💬',
      CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE challenge_type = 'comment' AND start_date = CURRENT_DATE);
    
    -- Insert Supporter challenge
    INSERT INTO public.daily_challenges (
      title, description, challenge_type, target_count, xp_reward, difficulty, icon,
      start_date, end_date, is_active, status
    )
    SELECT 
      'Supporter', 'Like 5 posts', 'like', 5, 20, 'easy', '❤️',
      CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE challenge_type = 'like' AND start_date = CURRENT_DATE);
    
    -- Insert Sharing is Caring challenge
    INSERT INTO public.daily_challenges (
      title, description, challenge_type, target_count, xp_reward, difficulty, icon,
      start_date, end_date, is_active, status
    )
    SELECT 
      'Sharing is Caring', 'Share 2 posts', 'share', 2, 25, 'easy', '📤',
      CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE challenge_type = 'share' AND start_date = CURRENT_DATE);
    
  END IF;
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.daily_challenges TO authenticated, anon;
GRANT ALL ON public.daily_challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_daily_progress TO authenticated;
GRANT SELECT ON public.user_daily_progress TO anon;

-- Add comment
COMMENT ON TABLE public.daily_challenges IS 'Daily challenges for users to complete and earn XP';
COMMENT ON TABLE public.user_daily_progress IS 'Tracks user progress on daily challenges';

