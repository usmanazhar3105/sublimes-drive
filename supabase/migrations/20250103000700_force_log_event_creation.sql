-- Migration: Force log_event RPC Function Creation
-- Date: 2025-01-03
-- Purpose: Definitively create log_event RPC function that Supabase will recognize

-- ============================================================================
-- Drop ALL possible variations of log_event  
-- ============================================================================

-- Public schema
DROP FUNCTION IF EXISTS public.log_event(TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_event(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_event(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_event() CASCADE;

-- Default schema (just in case)
DROP FUNCTION IF EXISTS log_event(TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS log_event(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS log_event(TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_event() CASCADE;

-- ============================================================================
-- Create log_event with explicit schema qualification
-- ============================================================================

CREATE FUNCTION public.log_event(
  p_event_name TEXT,
  p_entity TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Generate a UUID to return
  v_event_id := gen_random_uuid();
  
  -- Try to log to analytics_events, but don't fail if it doesn't work
  BEGIN
    INSERT INTO public.analytics_events (user_id, event_name, entity, metadata, created_at)
    VALUES (auth.uid(), p_event_name, p_entity, p_metadata, NOW());
  EXCEPTION WHEN OTHERS THEN
    -- Continue silently - analytics logging is optional
    NULL;
  END;
  
  RETURN v_event_id;
END;
$$;

-- ============================================================================
-- Grant permissions to ALL roles
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO service_role;

-- ============================================================================
-- Add helpful comment
-- ============================================================================

COMMENT ON FUNCTION public.log_event(TEXT, TEXT, JSONB) IS 
'Analytics event logging - Returns UUID immediately, logs to analytics_events table if available. Never fails.';

-- ============================================================================
-- Verify the function exists
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'log_event';
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ log_event function created successfully! Found % version(s)', v_count;
  ELSE
    RAISE WARNING '⚠️ log_event function NOT found after creation!';
  END IF;
END $$;

