-- Create challenges tables from scratch
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_count INT NOT NULL DEFAULT 1,
  xp_reward INT NOT NULL DEFAULT 10,
  difficulty TEXT DEFAULT 'easy',
  icon TEXT DEFAULT '🎯',
  is_daily BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_count INT DEFAULT 0,
  target_count INT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  xp_earned INT DEFAULT 0,
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.challenge_progress(user_id);

-- Insert defaults
INSERT INTO public.challenges (title, description, challenge_type, target_count, xp_reward, difficulty, icon)
VALUES 
  ('First Post', 'Create your first post', 'post', 1, 10, 'easy', '📝'),
  ('Social', 'Comment on 3 posts', 'comment', 3, 15, 'easy', '💬'),
  ('Supporter', 'Like 5 posts', 'like', 5, 10, 'easy', '❤️')
ON CONFLICT DO NOTHING;

