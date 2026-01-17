-- Migration: Fix log_event RPC Parameter Names
-- Date: 2025-01-03
-- Purpose: Create log_event with correct parameter names that frontend expects

-- ============================================================================
-- Drop all variations
-- ============================================================================

DROP FUNCTION IF EXISTS public.log_event(TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_event(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_event(TEXT) CASCADE;

-- ============================================================================
-- Create log_event with CORRECT parameter names (p_name, p_props)
-- ============================================================================

CREATE FUNCTION public.log_event(
  p_name TEXT,
  p_props JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  v_event_id := gen_random_uuid();
  
  -- Try to insert into analytics_events
  BEGIN
    INSERT INTO public.analytics_events (user_id, event_name, metadata, created_at)
    VALUES (auth.uid(), p_name, p_props, NOW());
  EXCEPTION WHEN OTHERS THEN
    -- Silently fail - analytics is optional
    NULL;
  END;
  
  RETURN v_event_id;
END;
$$;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.log_event(TEXT, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION public.log_event(TEXT, JSONB) IS 
'Analytics event logging - accepts p_name and p_props parameters as used by frontend useAnalytics hook';

-- ============================================================================
-- Verify
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'log_event'
  AND p.pronargs = 2; -- Expecting 2 parameters
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ log_event(p_name, p_props) created successfully!';
  ELSE
    RAISE WARNING '⚠️ log_event function with 2 parameters not found!';
  END IF;
END $$;

