-- Analytics log_event RPC
-- Created: 2025-01-05
-- Purpose: Fix 401 error on log_event RPC calls

-- Function: Log analytics event
DROP FUNCTION IF EXISTS public.log_event(text, jsonb);
CREATE OR REPLACE FUNCTION public.log_event(
  p_event_name text,
  p_event_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert analytics event
  INSERT INTO analytics_events (
    user_id,
    event_type,
    event_name,
    event_data,
    created_at
  ) VALUES (
    auth.uid(), -- Can be NULL for anonymous users
    'custom',
    p_event_name,
    p_event_data,
    NOW()
  );
END;
$$;

-- Grant permissions (allow anon too for analytics)
GRANT EXECUTE ON FUNCTION public.log_event(text, jsonb) TO authenticated, anon;

-- Comment
COMMENT ON FUNCTION public.log_event IS 'Log analytics event (authenticated or anonymous)';

