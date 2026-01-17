-- === RLS FIXES (Advisor errors bundle) ===
SET search_path = public;

-- bid_repair_replies: minimal, broad access for now (can tighten later)
ALTER TABLE IF EXISTS public.bid_repair_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bid_repair_replies_read ON public.bid_repair_replies;
CREATE POLICY bid_repair_replies_read ON public.bid_repair_replies
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS bid_repair_replies_insert ON public.bid_repair_replies;
CREATE POLICY bid_repair_replies_insert ON public.bid_repair_replies
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- event_views: admin/editor analytics (RLS-enabled)
ALTER TABLE IF EXISTS public.event_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS event_views_admin_read ON public.event_views;
CREATE POLICY event_views_admin_read ON public.event_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

DROP POLICY IF EXISTS event_views_insert_self ON public.event_views;
CREATE POLICY event_views_insert_self ON public.event_views
  FOR INSERT TO authenticated
  WITH CHECK (COALESCE(user_id, auth.uid()) = auth.uid());

-- kv_store_97527403: system settings table (admin/editor only)
ALTER TABLE IF EXISTS public.kv_store_97527403 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kv_store_public_read ON public.kv_store_97527403;
DROP POLICY IF EXISTS kv_store_admin_read ON public.kv_store_97527403;
DROP POLICY IF EXISTS kv_store_admin_all ON public.kv_store_97527403;

CREATE POLICY kv_store_admin_read ON public.kv_store_97527403
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY kv_store_admin_all ON public.kv_store_97527403
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- marketplace_settings: admin/editor only
ALTER TABLE IF EXISTS public.marketplace_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS marketplace_settings_admin_read ON public.marketplace_settings;
DROP POLICY IF EXISTS marketplace_settings_admin_all ON public.marketplace_settings;

CREATE POLICY marketplace_settings_admin_read ON public.marketplace_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY marketplace_settings_admin_all ON public.marketplace_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- post_stats: analytics by user; admin/editor read; users insert their own rows
ALTER TABLE IF EXISTS public.post_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS post_stats_admin_read ON public.post_stats;
DROP POLICY IF EXISTS post_stats_insert_self ON public.post_stats;

CREATE POLICY post_stats_admin_read ON public.post_stats
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

CREATE POLICY post_stats_insert_self ON public.post_stats
  FOR INSERT TO authenticated
  WITH CHECK (COALESCE(user_id, auth.uid()) = auth.uid());

-- verification_history: owner + admin/editor read
ALTER TABLE IF EXISTS public.verification_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS verification_history_owner_read ON public.verification_history;

CREATE POLICY verification_history_owner_read ON public.verification_history
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );

-- xp_transactions: owner-only
ALTER TABLE IF EXISTS public.xp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS xp_transactions_owner_read ON public.xp_transactions;
DROP POLICY IF EXISTS xp_transactions_owner_insert ON public.xp_transactions;

CREATE POLICY xp_transactions_owner_read ON public.xp_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY xp_transactions_owner_insert ON public.xp_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
