-- ============================================================================
-- FREYA AI AUTO-COMMENT SYSTEM - COMPLETE IMPLEMENTATION
-- ============================================================================
-- This migration creates the comprehensive Freya system with:
-- - Settings & secrets management
-- - Token budgeting
-- - Per-post state tracking (2-comment cap)
-- - Run logging & observability
-- - Image assets storage
-- ============================================================================

-- 1. SETTINGS TABLE (admin-controlled)
CREATE TABLE IF NOT EXISTS public.freya_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'openai',
  model_text TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  model_vision TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  daily_token_cap INT NOT NULL DEFAULT 300000,
  image_annotation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  brand_whitelist TEXT NOT NULL DEFAULT 'BYD,Jetour,Changan,Geely,Haval,MG,Exeed,Chery,Hongqi,Zeekr,Ora',
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SECRETS TABLE (encrypted API keys)
CREATE TABLE IF NOT EXISTS public.freya_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,  -- Store via Supabase secrets or encrypted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DAILY BUDGET TRACKING
CREATE TABLE IF NOT EXISTS public.freya_budget (
  id BIGSERIAL PRIMARY KEY,
  day DATE NOT NULL,
  tokens_used INT NOT NULL DEFAULT 0,
  tokens_limit INT NOT NULL DEFAULT 300000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(day)
);

-- 4. PER-POST STATE (enforce 2-comment cap)
CREATE TABLE IF NOT EXISTS public.freya_post_state (
  post_id UUID PRIMARY KEY,
  auto_comment_id UUID,            -- First auto-comment on post
  summary_reply_comment_id UUID,   -- Summary reply to human
  liked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RUN LOGS (observability)
CREATE TABLE IF NOT EXISTS public.freya_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('auto_comment', 'summary_reply', 'like')),
  reason TEXT,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  provider TEXT,
  model TEXT,
  cost_estimate NUMERIC(12,6),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'success', 'skipped', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 6. IMAGE ASSETS (annotated images)
CREATE TABLE IF NOT EXISTS public.freya_image_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ENABLE RLS ON ALL TABLES
ALTER TABLE public.freya_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freya_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freya_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freya_post_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freya_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freya_image_assets ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- Settings: Admin read/write
DROP POLICY IF EXISTS "freya_admin_rw_settings" ON public.freya_settings;
CREATE POLICY "freya_admin_rw_settings" ON public.freya_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Secrets: Admin read/write
DROP POLICY IF EXISTS "freya_admin_rw_secrets" ON public.freya_secrets;
CREATE POLICY "freya_admin_rw_secrets" ON public.freya_secrets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Budget: Admin read
DROP POLICY IF EXISTS "freya_admin_read_budget" ON public.freya_budget;
CREATE POLICY "freya_admin_read_budget" ON public.freya_budget
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Runs: Admin read
DROP POLICY IF EXISTS "freya_runs_admin_read" ON public.freya_runs;
CREATE POLICY "freya_runs_admin_read" ON public.freya_runs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Post state: Service role full access
DROP POLICY IF EXISTS "freya_state_service" ON public.freya_post_state;
CREATE POLICY "freya_state_service" ON public.freya_post_state
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Budget: Service role full access
DROP POLICY IF EXISTS "freya_budget_service" ON public.freya_budget;
CREATE POLICY "freya_budget_service" ON public.freya_budget
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Runs: Service role full access
DROP POLICY IF EXISTS "freya_runs_service" ON public.freya_runs;
CREATE POLICY "freya_runs_service" ON public.freya_runs
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Image assets: Service role full access
DROP POLICY IF EXISTS "freya_img_service" ON public.freya_image_assets;
CREATE POLICY "freya_img_service" ON public.freya_image_assets
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- 9. SEED DEFAULT SETTINGS
INSERT INTO public.freya_settings (
  provider,
  model_text,
  model_vision,
  daily_token_cap,
  image_annotation_enabled,
  brand_whitelist,
  locale
)
VALUES (
  'openai',
  'gpt-4o-mini',
  'gpt-4o-mini',
  300000,
  TRUE,
  'BYD,Jetour,Changan,Geely,Haval,MG,Exeed,Chery,Hongqi,Zeekr,Ora',
  'en'
)
ON CONFLICT DO NOTHING;

-- 10. SEED TODAY'S BUDGET
INSERT INTO public.freya_budget (day, tokens_used, tokens_limit)
VALUES (CURRENT_DATE, 0, 300000)
ON CONFLICT (day) DO NOTHING;

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_freya_budget_day ON public.freya_budget(day);
CREATE INDEX IF NOT EXISTS idx_freya_runs_post_id ON public.freya_runs(post_id);
CREATE INDEX IF NOT EXISTS idx_freya_runs_status ON public.freya_runs(status);
CREATE INDEX IF NOT EXISTS idx_freya_runs_created ON public.freya_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freya_image_assets_post ON public.freya_image_assets(post_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Freya Enhanced system created successfully!';
  RAISE NOTICE '   - 6 tables created with RLS';
  RAISE NOTICE '   - Default settings seeded';
  RAISE NOTICE '   - Budget initialized for today';
END $$;

