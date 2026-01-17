-- === WARNINGS / SUGGESTIONS FIXES (Advisor warnings bundle) ===
SET search_path = public;

-- Pin search_path on common public functions and Freya helpers
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND (
        p.proname IN (
          'get_pending_verifications',
          'fn_reply_to_bid',
          'update_favorite_count',
          'broadcast_row_changes',
          'update_post_stats',
          'auto_approve_free_listing',
          'fn_get_post_with_stats'
        )
        OR p.proname LIKE 'fn_freya_enqueue_auto_%'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', r.schema, r.proname, r.args);
  END LOOP;
END $$;

-- Achievements: owner-scoped RLS
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS achievements_owner_read ON public.achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS achievements_owner_insert ON public.achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS achievements_owner_update ON public.achievements
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ads: admin/editor only
ALTER TABLE IF EXISTS public.ad_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ad_categories_admin_read ON public.ad_categories
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

CREATE POLICY IF NOT EXISTS ad_categories_admin_all ON public.ad_categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

ALTER TABLE IF EXISTS public.ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ad_campaigns_admin_read ON public.ad_campaigns
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

CREATE POLICY IF NOT EXISTS ad_campaigns_admin_all ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

ALTER TABLE IF EXISTS public.ad_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ad_placements_admin_read ON public.ad_placements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

CREATE POLICY IF NOT EXISTS ad_placements_admin_all ON public.ad_placements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

ALTER TABLE IF EXISTS public.ad_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ad_stats_admin_read ON public.ad_stats
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- Admin logs: admin/editor only
ALTER TABLE IF EXISTS public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS admin_logs_admin_read ON public.admin_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- AI comment log: owner-only
ALTER TABLE IF EXISTS public.ai_comment_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ai_comment_log_owner_read ON public.ai_comment_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS ai_comment_log_owner_insert ON public.ai_comment_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- AI rate limits: owner-only
ALTER TABLE IF EXISTS public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ai_rate_limits_owner_read ON public.ai_rate_limits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS ai_rate_limits_owner_insert ON public.ai_rate_limits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
