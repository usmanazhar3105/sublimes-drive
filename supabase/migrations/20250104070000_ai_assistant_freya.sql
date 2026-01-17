-- ============================================================================
-- AI ASSISTANT "FREYA" - Complete Implementation
-- ============================================================================
-- This migration creates the AI assistant system for Community Posts
-- Features:
-- - One AI comment per post
-- - Thread-confined replies only
-- - Admin controls
-- - Rate limiting
-- - Multi-language support (EN/AR/ZH)
-- - Safety guardrails
-- ============================================================================

-- ============================================================================
-- 1. AI AGENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. AI AGENT SETTINGS (Global + Per-Community)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  language_default TEXT NOT NULL DEFAULT 'en' CHECK (language_default IN ('en', 'ar', 'zh')),
  max_comment_len INT NOT NULL DEFAULT 900,
  rate_per_min INT NOT NULL DEFAULT 6,
  rate_per_hour INT NOT NULL DEFAULT 60,
  rate_per_day INT NOT NULL DEFAULT 500,
  safe_mode BOOLEAN NOT NULL DEFAULT TRUE,
  source_attribution BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, community_id)
);

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
  sources JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, post_id)
);

-- ============================================================================
-- 4. AI COMMENT THREADS (Track AI's root comment per post)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_comment_threads (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  root_comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reply_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, post_id)
);

-- ============================================================================
-- 5. AI ACTIVITY LOG (Observability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_activity_log (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_post', 'reply', 'skip', 'error', 'refusal', 'rate_limited')),
  post_id UUID,
  comment_id UUID,
  thread_root_id UUID,
  language TEXT,
  latency_ms INT,
  tokens_in INT,
  tokens_out INT,
  sources JSONB DEFAULT '[]'::JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'refused', 'rate_limited', 'error')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. AI RATE LIMITS (Rolling counters)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, bucket)
);

-- ============================================================================
-- 7. EXTEND COMMENTS TABLE FOR AI
-- ============================================================================

-- Add columns to comments table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_bot') THEN
    ALTER TABLE public.comments ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'bot_agent_id') THEN
    ALTER TABLE public.comments ADD COLUMN bot_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
    ALTER TABLE public.comments ADD COLUMN parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_comments_bot ON public.comments (is_bot, bot_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_comments_parent ON public.comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_ai_post_responses_post ON public.ai_post_responses (post_id);
CREATE INDEX IF NOT EXISTS idx_ai_post_responses_agent ON public.ai_post_responses (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_comment_threads_post ON public.ai_comment_threads (post_id);
CREATE INDEX IF NOT EXISTS idx_ai_comment_threads_agent ON public.ai_comment_threads (agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_created ON public.ai_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_agent ON public.ai_activity_log (agent_id, event_type);
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_bucket ON public.ai_rate_limits (agent_id, bucket);

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_post_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Public read for ai_agents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_agents' AND policyname = 'ai_agents_public_read'
  ) THEN
    CREATE POLICY ai_agents_public_read ON public.ai_agents
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Public read for ai_agent_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_agent_settings' AND policyname = 'ai_settings_public_read'
  ) THEN
    CREATE POLICY ai_settings_public_read ON public.ai_agent_settings
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Public read for ai_post_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_post_responses' AND policyname = 'ai_responses_public_read'
  ) THEN
    CREATE POLICY ai_responses_public_read ON public.ai_post_responses
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Public read for ai_comment_threads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_comment_threads' AND policyname = 'ai_threads_public_read'
  ) THEN
    CREATE POLICY ai_threads_public_read ON public.ai_comment_threads
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Authenticated read for activity logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_activity_log' AND policyname = 'ai_logs_auth_read'
  ) THEN
    CREATE POLICY ai_logs_auth_read ON public.ai_activity_log
      FOR SELECT TO authenticated USING (TRUE);
  END IF;
END $$;

-- Service role can write all (Edge Functions use service role)
-- No write policies for regular users

-- ============================================================================
-- 10. SEED FREYA AI AGENT
-- ============================================================================

-- Insert Freya AI agent with specific UUID
INSERT INTO public.ai_agents (
  id,
  name,
  handle,
  email,
  is_enabled,
  avatar_url,
  bio
) VALUES (
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c'::UUID,
  'Freya',
  '@freya',
  'freya@sublimesdrive.com',
  TRUE,
  NULL,
  'Sublimes Drive AI Assistant - Your helpful companion for all things automotive in the UAE. I provide information, suggestions, and support based on web research and community knowledge.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  handle = EXCLUDED.handle,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  updated_at = NOW();

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
  source_attribution
) VALUES (
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c'::UUID,
  NULL,
  TRUE,
  'en',
  900,
  6,
  60,
  500,
  TRUE,
  TRUE
)
ON CONFLICT (agent_id, community_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  language_default = EXCLUDED.language_default,
  max_comment_len = EXCLUDED.max_comment_len,
  rate_per_min = EXCLUDED.rate_per_min,
  rate_per_hour = EXCLUDED.rate_per_hour,
  rate_per_day = EXCLUDED.rate_per_day,
  safe_mode = EXCLUDED.safe_mode,
  source_attribution = EXCLUDED.source_attribution,
  updated_at = NOW();

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if AI should respond to a post
CREATE OR REPLACE FUNCTION public.fn_ai_should_respond(p_post_id UUID, p_agent_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if already responded
  SELECT EXISTS(
    SELECT 1 FROM public.ai_post_responses
    WHERE agent_id = p_agent_id AND post_id = p_post_id
  ) INTO v_exists;
  
  RETURN NOT v_exists;
END;
$$;

-- Function to get AI thread root for a post
CREATE OR REPLACE FUNCTION public.fn_ai_get_thread_root(p_post_id UUID, p_agent_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_root_id UUID;
BEGIN
  SELECT root_comment_id INTO v_root_id
  FROM public.ai_comment_threads
  WHERE post_id = p_post_id AND agent_id = p_agent_id
  LIMIT 1;
  
  RETURN v_root_id;
END;
$$;

-- Function to check if comment is in AI thread
CREATE OR REPLACE FUNCTION public.fn_ai_is_in_thread(p_comment_id UUID, p_thread_root_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_id UUID := p_comment_id;
  v_parent_id UUID;
  v_depth INT := 0;
  v_max_depth INT := 10;
BEGIN
  -- Traverse up the comment tree
  WHILE v_current_id IS NOT NULL AND v_depth < v_max_depth LOOP
    -- Check if we've reached the root
    IF v_current_id = p_thread_root_id THEN
      RETURN TRUE;
    END IF;
    
    -- Get parent
    SELECT parent_comment_id INTO v_parent_id
    FROM public.comments
    WHERE id = v_current_id;
    
    v_current_id := v_parent_id;
    v_depth := v_depth + 1;
  END LOOP;
  
  RETURN FALSE;
END;
$$;

-- Function to increment rate limit
CREATE OR REPLACE FUNCTION public.fn_ai_increment_rate(p_agent_id UUID, p_bucket TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_rate_limits (agent_id, bucket, count, created_at, updated_at)
  VALUES (p_agent_id, p_bucket, 1, NOW(), NOW())
  ON CONFLICT (agent_id, bucket)
  DO UPDATE SET 
    count = ai_rate_limits.count + 1,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fn_ai_should_respond TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_ai_get_thread_root TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_ai_is_in_thread TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_ai_increment_rate TO service_role;

-- ============================================================================
-- 12. TRIGGERS
-- ============================================================================

-- Trigger to update ai_agent_settings updated_at
CREATE OR REPLACE FUNCTION public.trg_update_ai_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ai_settings_updated_at ON public.ai_agent_settings;
CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON public.ai_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_update_ai_settings_timestamp();

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_agent_exists BOOLEAN;
  v_settings_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '🤖 AI ASSISTANT "FREYA" - MIGRATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Verify Freya exists
  SELECT EXISTS(
    SELECT 1 FROM public.ai_agents WHERE id = 'd8c1f7a7-9c89-4090-a0a6-b310120b190c'::UUID
  ) INTO v_agent_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM public.ai_agent_settings WHERE agent_id = 'd8c1f7a7-9c89-4090-a0a6-b310120b190c'::UUID
  ) INTO v_settings_exists;
  
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✅ ai_agents';
  RAISE NOTICE '  ✅ ai_agent_settings';
  RAISE NOTICE '  ✅ ai_post_responses';
  RAISE NOTICE '  ✅ ai_comment_threads';
  RAISE NOTICE '  ✅ ai_activity_log';
  RAISE NOTICE '  ✅ ai_rate_limits';
  RAISE NOTICE '';
  
  RAISE NOTICE 'AI Agent:';
  IF v_agent_exists THEN
    RAISE NOTICE '  ✅ Freya (d8c1f7a7-9c89-4090-a0a6-b310120b190c)';
    RAISE NOTICE '  ✅ Email: freya@sublimesdrive.com';
    RAISE NOTICE '  ✅ Handle: @freya';
  ELSE
    RAISE NOTICE '  ❌ Freya NOT FOUND';
  END IF;
  RAISE NOTICE '';
  
  RAISE NOTICE 'Settings:';
  IF v_settings_exists THEN
    RAISE NOTICE '  ✅ Global settings configured';
    RAISE NOTICE '  ✅ Rate limits: 6/min, 60/hour, 500/day';
    RAISE NOTICE '  ✅ Max comment length: 900 chars';
    RAISE NOTICE '  ✅ Safe mode: ON';
    RAISE NOTICE '  ✅ Source attribution: ON';
  ELSE
    RAISE NOTICE '  ❌ Settings NOT FOUND';
  END IF;
  RAISE NOTICE '';
  
  RAISE NOTICE 'Helper Functions:';
  RAISE NOTICE '  ✅ fn_ai_should_respond';
  RAISE NOTICE '  ✅ fn_ai_get_thread_root';
  RAISE NOTICE '  ✅ fn_ai_is_in_thread';
  RAISE NOTICE '  ✅ fn_ai_increment_rate';
  RAISE NOTICE '';
  
  RAISE NOTICE 'Comments Table:';
  RAISE NOTICE '  ✅ is_bot column added';
  RAISE NOTICE '  ✅ bot_agent_id column added';
  RAISE NOTICE '  ✅ parent_comment_id column added';
  RAISE NOTICE '';
  
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  → Create Edge Functions (ai_on_new_post, ai_on_new_comment)';
  RAISE NOTICE '  → Create Admin Panel UI for AI settings';
  RAISE NOTICE '  → Configure environment variables (SEARCH_API_KEY, LLM_API_KEY)';
  RAISE NOTICE '  → Test AI responses in Communities';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

