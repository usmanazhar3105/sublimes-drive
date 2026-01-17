-- Missing Marketplace RPCs from wiring map
-- Created: 2025-01-05
-- Based on: Database-Wiring/text/sd_wiring_maps/Marketplace_mapping.md

-- Function: Toggle listing save (favorite)
DROP FUNCTION IF EXISTS public.fn_toggle_listing_save(uuid);
CREATE OR REPLACE FUNCTION public.fn_toggle_listing_save(p_listing_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_result jsonb;
BEGIN
  -- Check if already saved
  SELECT EXISTS (
    SELECT 1 FROM listing_saves 
    WHERE listing_id = p_listing_id 
    AND user_id = auth.uid()
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove save
    DELETE FROM listing_saves 
    WHERE listing_id = p_listing_id 
    AND user_id = auth.uid();
    
    v_result := jsonb_build_object(
      'action', 'removed',
      'saved', false
    );
  ELSE
    -- Add save
    INSERT INTO listing_saves (listing_id, user_id, created_at)
    VALUES (p_listing_id, auth.uid(), NOW())
    ON CONFLICT (listing_id, user_id) DO NOTHING;
    
    v_result := jsonb_build_object(
      'action', 'added',
      'saved', true
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Function: Register listing view (with deduplication)
DROP FUNCTION IF EXISTS public.fn_register_listing_view(uuid, text);
CREATE OR REPLACE FUNCTION public.fn_register_listing_view(
  p_listing_id uuid,
  p_anon_hash text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_last_view timestamptz;
BEGIN
  v_user_id := auth.uid();
  
  -- Check for recent view (10 min deduplication)
  IF v_user_id IS NOT NULL THEN
    SELECT viewed_at INTO v_last_view
    FROM listing_views
    WHERE listing_id = p_listing_id
    AND viewer_id = v_user_id
    ORDER BY viewed_at DESC
    LIMIT 1;
    
    IF v_last_view IS NOT NULL AND v_last_view > NOW() - INTERVAL '10 minutes' THEN
      RETURN; -- Skip duplicate view
    END IF;
  ELSIF p_anon_hash IS NOT NULL THEN
    SELECT viewed_at INTO v_last_view
    FROM listing_views
    WHERE listing_id = p_listing_id
    AND anon_hash = p_anon_hash
    ORDER BY viewed_at DESC
    LIMIT 1;
    
    IF v_last_view IS NOT NULL AND v_last_view > NOW() - INTERVAL '10 minutes' THEN
      RETURN; -- Skip duplicate view
    END IF;
  END IF;

  -- Register view
  INSERT INTO listing_views (listing_id, viewer_id, anon_hash, viewed_at)
  VALUES (p_listing_id, v_user_id, p_anon_hash, NOW());
END;
$$;

-- Admin: Set listing status
DROP FUNCTION IF EXISTS public.fn_admin_set_listing_status(uuid, text, text);
CREATE OR REPLACE FUNCTION public.fn_admin_set_listing_status(
  p_listing_id uuid,
  p_status text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
  v_result jsonb;
BEGIN
  -- Only admins/editors can change status
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Editor only';
  END IF;

  -- Get old status
  SELECT status INTO v_old_status
  FROM marketplace_listings
  WHERE id = p_listing_id;

  -- Update status
  UPDATE marketplace_listings
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_listing_id;

  -- Log in audit
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'listing_status_change',
    'marketplace_listing',
    p_listing_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status,
      'reason', p_reason
    ),
    NOW()
  );

  v_result := jsonb_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_status
  );

  RETURN v_result;
END;
$$;

-- Admin: Feature/Pin listing
DROP FUNCTION IF EXISTS public.fn_admin_feature_pin(uuid, boolean, boolean);
CREATE OR REPLACE FUNCTION public.fn_admin_feature_pin(
  p_listing_id uuid,
  p_featured boolean DEFAULT NULL,
  p_pinned boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can feature/pin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin only';
  END IF;

  UPDATE marketplace_listings
  SET 
    featured = COALESCE(p_featured, featured),
    pinned = COALESCE(p_pinned, pinned),
    updated_at = NOW()
  WHERE id = p_listing_id;

  -- Log action
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'listing_feature_pin',
    'marketplace_listing',
    p_listing_id,
    jsonb_build_object('featured', p_featured, 'pinned', p_pinned),
    NOW()
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_toggle_listing_save(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_register_listing_view(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_set_listing_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_feature_pin(uuid, boolean, boolean) TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_toggle_listing_save(uuid) IS 'Toggle favorite status for a listing';
COMMENT ON FUNCTION public.fn_register_listing_view(uuid, text) IS 'Register listing view with 10min deduplication';
COMMENT ON FUNCTION public.fn_admin_set_listing_status(uuid, text, text) IS 'Admin: Change listing status';
COMMENT ON FUNCTION public.fn_admin_feature_pin(uuid, boolean, boolean) IS 'Admin: Feature or pin a listing';

