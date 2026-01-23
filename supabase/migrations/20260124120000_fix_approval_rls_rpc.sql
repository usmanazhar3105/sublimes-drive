-- Migration: Create Secure RPC to Approve Verifications
-- Description: Creates a secure server-side function to handle approval.
-- SECURITY: Includes explicit role check to ensure only Admins/Editors can execute this.

CREATE OR REPLACE FUNCTION approve_verification_request(
  p_request_id UUID,
  p_admin_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as DB owner to bypass RLS on tables
SET search_path = public
AS $$
DECLARE
  v_admin_role TEXT;
  v_user_id UUID;
  v_req_type TEXT;
  v_new_role TEXT;
  v_new_sub_role TEXT;
BEGIN
  -- 1. SECURITY CHECK: Ensure caller is Admin or Editor
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Insufficient permissions');
  END IF;

  -- 2. Get Request Info
  SELECT user_id, verification_type INTO v_user_id, v_req_type
  FROM verification_requests
  WHERE id = p_request_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  -- 3. Determine Roles based on type
  IF v_req_type = 'vehicle' THEN
    v_new_role := 'car_owner';
    v_new_sub_role := 'car_owner';
  ELSIF v_req_type = 'garage' THEN
    v_new_role := 'garage_owner';
    v_new_sub_role := 'garage_owner';
  ELSIF v_req_type = 'vendor' THEN
    v_new_role := 'vendor';
    v_new_sub_role := 'vendor';
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid verification type: ' || v_req_type);
  END IF;

  -- 4. Update Request
  UPDATE verification_requests
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    reviewer_id = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- 5. Update Profile
  UPDATE profiles
  SET 
    role = v_new_role,
    sub_role = v_new_sub_role,
    verification_status = 'approved',
    is_verified = true,
    verified_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 6. Log Action
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(), 
    'approve_verification', 
    'verification_requests', 
    p_request_id,
    jsonb_build_object('notes', p_admin_notes, 'success', true)
  );

  RETURN jsonb_build_object('success', true);
END;
$$;
