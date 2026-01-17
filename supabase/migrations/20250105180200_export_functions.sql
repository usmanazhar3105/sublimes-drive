-- Universal Export Function for Admin
-- Created: 2025-01-05
-- Supports all modules with date range filtering

CREATE OR REPLACE FUNCTION public.fn_export_data(
  p_entity_type text,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query text;
  v_result jsonb;
  v_count int;
BEGIN
  -- Only admins/editors can export
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Editor only';
  END IF;

  -- Build query based on entity type
  CASE p_entity_type
    WHEN 'users' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, email, username, role, created_at, xp, level, verification_status
        FROM profiles
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR verification_status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'listings' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, user_id, title, type, status, price, created_at
        FROM marketplace_listings
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'bids' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, user_id, title, status, created_at, updated_at
        FROM bid_repair
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'posts' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, user_id, title, status, created_at, category
        FROM community_posts
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'events' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, title, type, status, start_date, created_at
        FROM events
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'offers' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, title, discount, status, created_at, valid_until
        FROM promotional_offers
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    WHEN 'payments' THEN
      SELECT jsonb_agg(row_to_json(t))
      INTO v_result
      FROM (
        SELECT id, user_id, amount, currency, status, created_at, payment_method
        FROM payments
        WHERE (p_date_from IS NULL OR created_at >= p_date_from)
        AND (p_date_to IS NULL OR created_at <= p_date_to)
        AND (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT 10000
      ) t;

    ELSE
      RAISE EXCEPTION 'Unknown entity type: %', p_entity_type;
  END CASE;

  -- Get count
  SELECT jsonb_array_length(COALESCE(v_result, '[]'::jsonb)) INTO v_count;

  -- Log export
  INSERT INTO audit_logs (user_id, action, entity_type, details, created_at)
  VALUES (
    auth.uid(),
    'export_data',
    p_entity_type,
    jsonb_build_object(
      'count', v_count,
      'date_from', p_date_from,
      'date_to', p_date_to,
      'status', p_status
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'entity_type', p_entity_type,
    'count', v_count,
    'data', COALESCE(v_result, '[]'::jsonb)
  );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.fn_export_data TO authenticated;

-- Comment
COMMENT ON FUNCTION public.fn_export_data IS 'Admin/Editor: Export data with date range and status filters';

