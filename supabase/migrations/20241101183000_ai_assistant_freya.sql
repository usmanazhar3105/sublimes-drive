-- ============================================================================
-- AI ASSISTANT (FREYA) - Complete Implementation
-- ============================================================================
-- This migration creates all tables and functions for the AI Assistant feature
-- Freya: Female AI assistant for Sublimes Drive community
-- Email: freya@sublimesdrive.com
-- UUID: d8c1f7a7-9c89-4090-a0a6-b310120b190c

-- ============================================================================
-- 1. AI AGENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Freya profile
INSERT INTO public.ai_agents (id, name, handle, email, avatar_url, bio, is_enabled)
VALUES (
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
  'Freya',
  '@freya',
  'freya@sublimesdrive.com',
  '/assets/freya-avatar.png',
  'Your friendly AI assistant for all things automotive in the UAE. I''m here to help with car questions, recommendations, and local insights!',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  handle = EXCLUDED.handle,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio;

-- ============================================================================
-- 2. AI AGENT SETTINGS (Global & Per-Community)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  language_default TEXT NOT NULL DEFAULT 'en',
  max_comment_len INTEGER NOT NULL DEFAULT 900,
  rate_per_min INTEGER NOT NULL DEFAULT 6,
  rate_per_hour INTEGER NOT NULL DEFAULT 60,
  rate_per_day INTEGER NOT NULL DEFAULT 500,
  safe_mode BOOLEAN NOT NULL DEFAULT true,
  source_attribution BOOLEAN NOT NULL DEFAULT true,
  auto_reply_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, community_id)
);

-- Create global settings for Freya
INSERT INTO public.ai_agent_settings (
  agent_id, 
  community_id, 
  is_enabled, 
  language_default,
  max_comment_len,
  rate_per_min,
  rate_per_hour,
  rate_per_day,
  safe_mode,
  source_attribution,
  auto_reply_enabled
)
VALUES (
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
  NULL, -- Global settings
  true,
  'en',
  900,
  6,
  60,
  500,
  true,
  true,
  true
) ON CONFLICT (agent_id, community_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();

-- ============================================================================
-- 3. AI POST RESPONSES (One per post per agent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_post_responses (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  root_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'skipped', 'refused', 'error', 'processing')),
  reason TEXT,
  language TEXT,
  sources JSONB,
  tokens_in INTEGER,
  tokens_out INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_post_responses_post ON public.ai_post_responses(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_post_responses_agent ON public.ai_post_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_post_responses_status ON public.ai_post_responses(status);
CREATE INDEX IF NOT EXISTS idx_ai_post_responses_created ON public.ai_post_responses(created_at DESC);

-- ============================================================================
-- 4. AI COMMENT THREADS (Track bot's root comment per post)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_comment_threads (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  root_comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reply_count INTEGER NOT NULL DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_comment_threads_post ON public.ai_comment_threads(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_comment_threads_root ON public.ai_comment_threads(root_comment_id);

-- ============================================================================
-- 5. AI ACTIVITY LOG (Observability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_activity_log (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_post', 'reply', 'skip', 'error', 'refused', 'rate_limited')),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  thread_root_id UUID,
  language TEXT,
  latency_ms INTEGER,
  tokens_in INTEGER,
  tokens_out INTEGER,
  sources JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'refused', 'rate_limited', 'error', 'skipped')),
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_activity_log_agent ON public.ai_activity_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_event ON public.ai_activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_status ON public.ai_activity_log(status);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_created ON public.ai_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_post ON public.ai_activity_log(post_id);

-- ============================================================================
-- 6. AI RATE LIMITS (Rolling window counters)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL, -- 'min:YYYYMMDDHHMM' | 'hour:YYYYMMDDHH' | 'day:YYYYMMDD'
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, bucket)
);

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_agent_bucket ON public.ai_rate_limits(agent_id, bucket);
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_created ON public.ai_rate_limits(created_at);

-- ============================================================================
-- 7. EXTEND COMMENTS TABLE FOR AI
-- ============================================================================

-- Add AI-specific columns to comments table
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bot_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_bot ON public.comments(is_bot, bot_agent_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON public.comments(post_id, parent_comment_id);

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- Enable RLS on all AI tables
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_post_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Public read access to AI agents
CREATE POLICY "Everyone can view AI agents"
  ON public.ai_agents FOR SELECT
  USING (true);

-- Public read access to AI settings (for transparency)
CREATE POLICY "Everyone can view AI settings"
  ON public.ai_agent_settings FOR SELECT
  USING (true);

-- Admin full access to all AI tables
CREATE POLICY "Admin can manage AI agents"
  ON public.ai_agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can manage AI settings"
  ON public.ai_agent_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admin can view AI responses and logs
CREATE POLICY "Admin can view AI responses"
  ON public.ai_post_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can view AI activity logs"
  ON public.ai_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin can view AI threads"
  ON public.ai_comment_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if AI should respond to a post
CREATE OR REPLACE FUNCTION public.fn_ai_should_respond(
  _agent_id UUID,
  _post_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _already_responded BOOLEAN;
  _agent_enabled BOOLEAN;
  _post_community_id UUID;
  _community_enabled BOOLEAN;
BEGIN
  -- Check if already responded
  SELECT EXISTS (
    SELECT 1 FROM public.ai_post_responses
    WHERE agent_id = _agent_id AND post_id = _post_id
  ) INTO _already_responded;
  
  IF _already_responded THEN
    RETURN false;
  END IF;
  
  -- Check if agent is enabled globally
  SELECT is_enabled INTO _agent_enabled
  FROM public.ai_agents
  WHERE id = _agent_id;
  
  IF NOT _agent_enabled THEN
    RETURN false;
  END IF;
  
  -- Check community-specific settings
  SELECT community_id INTO _post_community_id
  FROM public.posts
  WHERE id = _post_id;
  
  IF _post_community_id IS NOT NULL THEN
    SELECT is_enabled INTO _community_enabled
    FROM public.ai_agent_settings
    WHERE agent_id = _agent_id 
      AND community_id = _post_community_id;
    
    IF _community_enabled IS NOT NULL AND NOT _community_enabled THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.fn_ai_increment_rate_limit(
  _agent_id UUID,
  _bucket TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _new_count INTEGER;
BEGIN
  INSERT INTO public.ai_rate_limits (agent_id, bucket, count)
  VALUES (_agent_id, _bucket, 1)
  ON CONFLICT (agent_id, bucket)
  DO UPDATE SET 
    count = ai_rate_limits.count + 1,
    updated_at = NOW()
  RETURNING count INTO _new_count;
  
  RETURN _new_count;
END;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.fn_ai_check_rate_limits(
  _agent_id UUID,
  _timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _settings RECORD;
  _min_bucket TEXT;
  _hour_bucket TEXT;
  _day_bucket TEXT;
  _min_count INTEGER;
  _hour_count INTEGER;
  _day_count INTEGER;
  _result JSONB;
BEGIN
  -- Get settings
  SELECT rate_per_min, rate_per_hour, rate_per_day
  INTO _settings
  FROM public.ai_agent_settings
  WHERE agent_id = _agent_id AND community_id IS NULL;
  
  -- Generate bucket keys
  _min_bucket := 'min:' || TO_CHAR(_timestamp, 'YYYYMMDDHH24MI');
  _hour_bucket := 'hour:' || TO_CHAR(_timestamp, 'YYYYMMDDHH24');
  _day_bucket := 'day:' || TO_CHAR(_timestamp, 'YYYYMMDD');
  
  -- Get current counts
  SELECT COALESCE(count, 0) INTO _min_count
  FROM public.ai_rate_limits
  WHERE agent_id = _agent_id AND bucket = _min_bucket;
  
  SELECT COALESCE(count, 0) INTO _hour_count
  FROM public.ai_rate_limits
  WHERE agent_id = _agent_id AND bucket = _hour_bucket;
  
  SELECT COALESCE(count, 0) INTO _day_count
  FROM public.ai_rate_limits
  WHERE agent_id = _agent_id AND bucket = _day_bucket;
  
  -- Build result
  _result := jsonb_build_object(
    'allowed', (
      _min_count < _settings.rate_per_min AND
      _hour_count < _settings.rate_per_hour AND
      _day_count < _settings.rate_per_day
    ),
    'limits', jsonb_build_object(
      'per_min', jsonb_build_object('current', _min_count, 'max', _settings.rate_per_min),
      'per_hour', jsonb_build_object('current', _hour_count, 'max', _settings.rate_per_hour),
      'per_day', jsonb_build_object('current', _day_count, 'max', _settings.rate_per_day)
    ),
    'buckets', jsonb_build_object(
      'min', _min_bucket,
      'hour', _hour_bucket,
      'day', _day_bucket
    )
  );
  
  RETURN _result;
END;
$$;

-- Function to get AI thread context
CREATE OR REPLACE FUNCTION public.fn_ai_get_thread_context(
  _agent_id UUID,
  _comment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _thread RECORD;
  _comments JSONB;
BEGIN
  -- Find the thread this comment belongs to
  SELECT * INTO _thread
  FROM public.ai_comment_threads
  WHERE agent_id = _agent_id
    AND root_comment_id = (
      -- Traverse up to find root
      WITH RECURSIVE comment_tree AS (
        SELECT id, parent_comment_id, post_id
        FROM public.comments
        WHERE id = _comment_id
        
        UNION ALL
        
        SELECT c.id, c.parent_comment_id, c.post_id
        FROM public.comments c
        INNER JOIN comment_tree ct ON c.id = ct.parent_comment_id
      )
      SELECT id FROM comment_tree WHERE parent_comment_id IS NULL
    );
  
  IF _thread IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get all comments in thread
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'content', c.content,
      'is_bot', c.is_bot,
      'created_at', c.created_at,
      'user_id', c.user_id
    ) ORDER BY c.created_at
  ) INTO _comments
  FROM public.comments c
  WHERE c.post_id = _thread.post_id
    AND (c.id = _thread.root_comment_id OR c.parent_comment_id IS NOT NULL);
  
  RETURN jsonb_build_object(
    'thread_id', _thread.id,
    'post_id', _thread.post_id,
    'root_comment_id', _thread.root_comment_id,
    'comments', _comments
  );
END;
$$;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ai_agents_updated_at ON public.ai_agents;
CREATE TRIGGER tr_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS tr_ai_agent_settings_updated_at ON public.ai_agent_settings;
CREATE TRIGGER tr_ai_agent_settings_updated_at
  BEFORE UPDATE ON public.ai_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE public.ai_agents IS 'AI assistant profiles (Freya)';
COMMENT ON TABLE public.ai_agent_settings IS 'Global and per-community AI settings';
COMMENT ON TABLE public.ai_post_responses IS 'One AI response per post tracking';
COMMENT ON TABLE public.ai_comment_threads IS 'AI comment thread tracking for confined replies';
COMMENT ON TABLE public.ai_activity_log IS 'Complete audit log of all AI actions';
COMMENT ON TABLE public.ai_rate_limits IS 'Rate limiting counters (min/hour/day)';

COMMENT ON COLUMN public.comments.is_bot IS 'True if comment is from AI assistant';
COMMENT ON COLUMN public.comments.bot_agent_id IS 'Reference to AI agent that created this comment';
COMMENT ON COLUMN public.comments.parent_comment_id IS 'Parent comment for threading';
