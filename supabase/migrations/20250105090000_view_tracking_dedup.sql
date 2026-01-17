-- ============================================================================
-- VIEW TRACKING - 10-Minute Deduplication
-- ============================================================================
-- Purpose: Track views with 10-minute deduplication to prevent inflation
--          from page refreshes/back-forward navigation
-- ============================================================================

-- Universal view tracking table (if not exists)
CREATE TABLE IF NOT EXISTS public.view_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'listing', 'event', 'offer', 'garage', 'profile')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For anonymous users
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_view_tracking_entity ON public.view_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_view_tracking_user ON public.view_tracking(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_view_tracking_session ON public.view_tracking(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_view_tracking_created ON public.view_tracking(created_at);

-- RLS
ALTER TABLE public.view_tracking ENABLE ROW LEVEL SECURITY;

-- Service role can write (from Edge Functions)
CREATE POLICY "view_tracking_service_write"
ON public.view_tracking FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- Users can read own views
CREATE POLICY "view_tracking_user_read"
ON public.view_tracking FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can read all
CREATE POLICY "view_tracking_admin_read"
ON public.view_tracking FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- FUNCTION: Track view with 10-min deduplication
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_track_view(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_view_id UUID;
  v_new_view_id UUID;
BEGIN
  -- Use auth.uid() if no user_id provided
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Check for existing view in last 10 minutes
  IF v_user_id IS NOT NULL THEN
    -- Authenticated user - check by user_id
    SELECT id INTO v_existing_view_id
    FROM public.view_tracking
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND user_id = v_user_id
      AND created_at > NOW() - INTERVAL '10 minutes'
    LIMIT 1;
  ELSIF p_session_id IS NOT NULL THEN
    -- Anonymous user - check by session_id
    SELECT id INTO v_existing_view_id
    FROM public.view_tracking
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND session_id = p_session_id
      AND created_at > NOW() - INTERVAL '10 minutes'
    LIMIT 1;
  END IF;
  
  -- If view exists in last 10 min, return early (deduplication)
  IF v_existing_view_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'view_id', v_existing_view_id,
      'is_new', FALSE,
      'message', 'View already tracked within 10 minutes'
    );
  END IF;
  
  -- Insert new view
  INSERT INTO public.view_tracking (
    entity_type,
    entity_id,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_entity_type,
    p_entity_id,
    v_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_new_view_id;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'view_id', v_new_view_id,
    'is_new', TRUE,
    'message', 'View tracked successfully'
  );
END;
$$;

COMMENT ON FUNCTION public.fn_track_view IS 
'Track views with 10-minute deduplication. Returns is_new=false if view already exists within 10 min.';

-- ============================================================================
-- MATERIALIZED VIEW: Aggregate view counts (refreshed periodically)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_view_counts AS
SELECT
  entity_type,
  entity_id,
  COUNT(DISTINCT COALESCE(user_id::TEXT, session_id)) as unique_views,
  COUNT(*) as total_views,
  MAX(created_at) as last_viewed_at
FROM public.view_tracking
GROUP BY entity_type, entity_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_view_counts_entity 
ON public.mv_view_counts(entity_type, entity_id);

-- Refresh function (call from cron or manually)
CREATE OR REPLACE FUNCTION public.fn_refresh_view_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_view_counts;
END;
$$;

-- ============================================================================
-- Success notification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ View tracking deployed successfully!';
  RAISE NOTICE '   - Table: view_tracking';
  RAISE NOTICE '   - Function: fn_track_view (10min dedup)';
  RAISE NOTICE '   - Materialized view: mv_view_counts';
  RAISE NOTICE '   - Refresh: CALL fn_refresh_view_counts()';
END $$;
