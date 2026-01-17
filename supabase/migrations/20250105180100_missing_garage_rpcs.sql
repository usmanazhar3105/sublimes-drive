-- Missing Garage Hub RPCs from wiring map
-- Created: 2025-01-05
-- Based on: Database-Wiring/text/sd_wiring_maps/GarageHub_mapping.md

-- Function: Request garage verification
CREATE OR REPLACE FUNCTION public.fn_request_garage_verification(
  p_garage_id uuid,
  p_documents jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Check if user owns this garage
  IF NOT EXISTS (
    SELECT 1 FROM garages 
    WHERE id = p_garage_id 
    AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not garage owner';
  END IF;

  -- Create verification request
  INSERT INTO verification_requests (
    entity_type,
    entity_id,
    user_id,
    documents,
    status,
    created_at
  ) VALUES (
    'garage',
    p_garage_id,
    auth.uid(),
    p_documents,
    'pending',
    NOW()
  )
  ON CONFLICT (entity_type, entity_id) 
  DO UPDATE SET
    documents = EXCLUDED.documents,
    status = 'pending',
    updated_at = NOW();

  v_result := jsonb_build_object(
    'success', true,
    'status', 'pending',
    'message', 'Verification request submitted'
  );

  RETURN v_result;
END;
$$;

-- Admin: Approve/Reject garage verification
CREATE OR REPLACE FUNCTION public.fn_admin_process_garage_verification(
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
  v_garage_id uuid;
  v_result jsonb;
BEGIN
  -- Only admins can process verifications
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Moderator only';
  END IF;

  -- Get garage ID
  SELECT entity_id INTO v_garage_id
  FROM verification_requests
  WHERE id = p_request_id
  AND entity_type = 'garage';

  IF p_action = 'approve' THEN
    -- Update verification request
    UPDATE verification_requests
    SET 
      status = 'approved',
      processed_by = auth.uid(),
      processed_at = NOW(),
      notes = p_notes
    WHERE id = p_request_id;

    -- Update garage
    UPDATE garages
    SET 
      verified = true,
      verification_status = 'verified',
      verified_at = NOW()
    WHERE id = v_garage_id;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'approved',
      'garage_id', v_garage_id
    );
  ELSE
    -- Reject
    UPDATE verification_requests
    SET 
      status = 'rejected',
      processed_by = auth.uid(),
      processed_at = NOW(),
      notes = p_notes
    WHERE id = p_request_id;

    UPDATE garages
    SET verification_status = 'rejected'
    WHERE id = v_garage_id;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'garage_id', v_garage_id
    );
  END IF;

  -- Log action
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'garage_verification_' || p_action,
    'garage',
    v_garage_id,
    jsonb_build_object('notes', p_notes),
    NOW()
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_request_garage_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_process_garage_verification TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_request_garage_verification IS 'User: Request verification for owned garage';
COMMENT ON FUNCTION public.fn_admin_process_garage_verification IS 'Admin: Approve or reject garage verification';

