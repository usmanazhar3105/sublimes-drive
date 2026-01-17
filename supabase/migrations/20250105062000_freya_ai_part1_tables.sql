-- Freya AI Part 1: Core Tables
-- AI agent directory
CREATE TABLE IF NOT EXISTS public.ai_agents_freya (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  gender TEXT DEFAULT 'female',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings (global or per-community override)
CREATE TABLE IF NOT EXISTS public.ai_agent_settings_freya (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents_freya(id) ON DELETE CASCADE,
  community_id UUID NULL,
  language_default TEXT NOT NULL DEFAULT 'en',
  max_comment_len INT NOT NULL DEFAULT 900,
  rate_per_min INT NOT NULL DEFAULT 6,
  rate_per_hour INT NOT NULL DEFAULT 60,
  rate_per_day INT NOT NULL DEFAULT 500,
  safe_mode BOOLEAN NOT NULL DEFAULT TRUE,
  source_attribution BOOLEAN NOT NULL DEFAULT TRUE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(agent_id, community_id)
);

-- One-per-post + thread anchor
CREATE TABLE IF NOT EXISTS public.ai_post_responses_freya (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents_freya(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  root_comment_id UUID,
  status TEXT NOT NULL DEFAULT 'posted',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.ai_comment_threads_freya (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents_freya(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  root_comment_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, post_id)
);

-- Activity & rate limits
CREATE TABLE IF NOT EXISTS public.ai_activity_log_freya (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents_freya(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  post_id UUID,
  comment_id UUID,
  thread_root_id UUID,
  language TEXT,
  latency_ms INT,
  tokens_in INT,
  tokens_out INT,
  sources JSONB,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_rate_limits_freya (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents_freya(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, bucket)
);

-- Add bot flags to comments if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_bot') THEN
    ALTER TABLE public.comments ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'bot_agent_id') THEN
    ALTER TABLE public.comments ADD COLUMN bot_agent_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
    ALTER TABLE public.comments ADD COLUMN parent_comment_id UUID;
  END IF;
END $$;
