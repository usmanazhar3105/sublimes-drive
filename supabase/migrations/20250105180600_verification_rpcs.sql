-- User & Vendor Verification RPCs
-- Created: 2025-01-05
-- Based on: Database-Wiring/text/sd_wiring_maps/Users_Verification_mapping.md

-- Function: Submit vehicle verification
CREATE OR REPLACE FUNCTION public.fn_submit_vehicle_verification(
  p_vehicle_data jsonb,
  p_documents jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Create verification request
  INSERT INTO verification_requests (
    entity_type,
    entity_id,
    user_id,
    documents,
    metadata,
    status,
    created_at
  ) VALUES (
    'vehicle',
    gen_random_uuid(),
    auth.uid(),
    p_documents,
    p_vehicle_data,
    'pending',
    NOW()
  )
  RETURNING id INTO v_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_request_id,
    'status', 'pending'
  );
END;
$$;

-- Function: Admin process verification request
CREATE OR REPLACE FUNCTION public.fn_admin_process_verification(
  p_request_id uuid,
  p_action text, -- 'approve' or 'reject'
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_type text;
  v_entity_id uuid;
  v_user_id uuid;
BEGIN
  -- Only admins/moderators can process
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Moderator only';
  END IF;

  -- Get request details
  SELECT entity_type, entity_id, user_id
  INTO v_entity_type, v_entity_id, v_user_id
  FROM verification_requests
  WHERE id = p_request_id;

  IF p_action = 'approve' THEN
    -- Update request
    UPDATE verification_requests
    SET 
      status = 'approved',
      processed_by = auth.uid(),
      processed_at = NOW(),
      notes = p_notes
    WHERE id = p_request_id;

    -- Update user verification status
    UPDATE profiles
    SET 
      verification_status = 'verified',
      verified_at = NOW()
    WHERE id = v_user_id;

  ELSE
    -- Reject
    UPDATE verification_requests
    SET 
      status = 'rejected',
      processed_by = auth.uid(),
      processed_at = NOW(),
      notes = p_notes
    WHERE id = p_request_id;

    UPDATE profiles
    SET verification_status = 'rejected'
    WHERE id = v_user_id;
  END IF;

  -- Log action
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'verification_' || p_action,
    v_entity_type,
    v_entity_id,
    jsonb_build_object('notes', p_notes, 'user_id', v_user_id),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'action', p_action,
    'entity_type', v_entity_type
  );
END;
$$;

-- Function: Get verification stats for admin
CREATE OR REPLACE FUNCTION public.fn_get_verification_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_pending int;
  v_approved int;
  v_rejected int;
BEGIN
  -- Only admins can view stats
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Moderator only';
  END IF;

  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'rejected')
  INTO v_pending, v_approved, v_rejected
  FROM verification_requests;

  v_stats := jsonb_build_object(
    'pending', COALESCE(v_pending, 0),
    'approved', COALESCE(v_approved, 0),
    'rejected', COALESCE(v_rejected, 0),
    'total', COALESCE(v_pending, 0) + COALESCE(v_approved, 0) + COALESCE(v_rejected, 0)
  );

  RETURN v_stats;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_submit_vehicle_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_process_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_verification_stats TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_submit_vehicle_verification IS 'User: Submit vehicle for verification';
COMMENT ON FUNCTION public.fn_admin_process_verification IS 'Admin: Approve or reject verification request';
COMMENT ON FUNCTION public.fn_get_verification_stats IS 'Admin: Get verification statistics';

