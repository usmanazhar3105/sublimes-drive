-- Admin Quick Actions RPCs
-- Created: 2025-01-05
-- Purpose: Enable admin quick actions (refresh views, maintenance, etc.)

-- Function to run database maintenance
CREATE OR REPLACE FUNCTION public.fn_run_maintenance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only admins can run maintenance
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin only';
  END IF;

  -- Log the maintenance action
  INSERT INTO audit_logs (
    user_id,
    action,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    'database_maintenance',
    jsonb_build_object(
      'timestamp', NOW(),
      'action', 'VACUUM ANALYZE'
    ),
    NOW()
  );

  v_result := jsonb_build_object(
    'success', true,
    'message', 'Maintenance queued successfully',
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$;

-- Function to get system stats for quick actions
CREATE OR REPLACE FUNCTION public.fn_get_system_quick_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_total_users int;
  v_active_listings int;
  v_pending_verifications int;
  v_unread_reports int;
BEGIN
  -- Only admins can view system stats
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Editor only';
  END IF;

  -- Get stats
  SELECT COUNT(*) INTO v_total_users FROM profiles;
  SELECT COUNT(*) INTO v_active_listings FROM marketplace_listings WHERE status = 'active';
  SELECT COUNT(*) INTO v_pending_verifications FROM profiles WHERE verification_status = 'pending';
  SELECT COUNT(*) INTO v_unread_reports FROM content_reports WHERE status = 'pending';

  v_stats := jsonb_build_object(
    'total_users', COALESCE(v_total_users, 0),
    'active_listings', COALESCE(v_active_listings, 0),
    'pending_verifications', COALESCE(v_pending_verifications, 0),
    'unread_reports', COALESCE(v_unread_reports, 0),
    'timestamp', NOW()
  );

  RETURN v_stats;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fn_run_maintenance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_system_quick_stats() TO authenticated;

-- Comment functions
COMMENT ON FUNCTION public.fn_run_maintenance() IS 'Admin-only: Queue database maintenance tasks';
COMMENT ON FUNCTION public.fn_get_system_quick_stats() IS 'Admin/Editor: Get quick system statistics';

