/**
 * Migration: Subscriber Role System
 * 
 * Implements:
 * - Sub-roles: car_owner, browser, garage_owner
 * - Verification system with document upload
 * - Badge system (green, yellow, blue, grey)
 * - Verification reminders
 * 
 * Date: 2025-11-01
 */

-- ============================================================================
-- 1. EXTEND PROFILES TABLE
-- ============================================================================

-- Add sub_role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sub_role TEXT 
CHECK (sub_role IN ('car_owner', 'browser', 'garage_owner'));

-- Add verification status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'approved', 'rejected', 'reupload_requested'));

-- Add badge color
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'grey'
CHECK (badge_color IN ('green', 'yellow', 'blue', 'grey'));

-- Add verification documents (stores URLs and metadata)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]';

-- Add verification notes (admin notes)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add last verification reminder timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_verification_reminder TIMESTAMP;

-- Add verification requested date
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMP;

-- Add verification approved/rejected date
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMP;

-- Add verification completed by (admin ID)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_completed_by UUID REFERENCES profiles(id);

-- ============================================================================
-- 2. CREATE VERIFICATION HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  notes TEXT,
  documents JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_history_user 
ON verification_history(user_id, created_at DESC);

-- ============================================================================
-- 3. UPDATE BADGE COLOR TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_badge_color()
RETURNS TRIGGER AS $$
BEGIN
  -- Update badge color based on sub_role and verification_status
  IF NEW.verification_status = 'approved' THEN
    CASE NEW.sub_role
      WHEN 'car_owner' THEN
        NEW.badge_color := 'green';
      WHEN 'garage_owner' THEN
        NEW.badge_color := 'blue';
      WHEN 'browser' THEN
        NEW.badge_color := 'yellow';
      ELSE
        NEW.badge_color := 'grey';
    END CASE;
  ELSE
    -- Pending, rejected, or reupload_requested
    NEW.badge_color := 'grey';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_badge_color ON profiles;
CREATE TRIGGER trg_update_badge_color
  BEFORE INSERT OR UPDATE OF sub_role, verification_status
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_badge_color();

-- ============================================================================
-- 4. VERIFICATION HISTORY TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_log_verification_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log verification status changes
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO verification_history (
      user_id,
      previous_status,
      new_status,
      admin_id,
      notes,
      documents
    ) VALUES (
      NEW.id,
      OLD.verification_status,
      NEW.verification_status,
      NEW.verification_completed_by,
      NEW.verification_notes,
      NEW.verification_documents
    );
    
    -- Update completion timestamp
    NEW.verification_completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_log_verification_change ON profiles;
CREATE TRIGGER trg_log_verification_change
  BEFORE UPDATE OF verification_status
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_log_verification_change();

-- ============================================================================
-- 5. RPC FUNCTIONS
-- ============================================================================

-- Function: Submit verification request
CREATE OR REPLACE FUNCTION fn_submit_verification(
  p_sub_role TEXT,
  p_documents JSONB
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    sub_role = p_sub_role,
    verification_documents = p_documents,
    verification_status = 'pending',
    verification_requested_at = NOW(),
    last_verification_reminder = NULL
  WHERE id = v_user_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Verification request submitted',
    'status', 'pending'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin approve verification
CREATE OR REPLACE FUNCTION fn_admin_approve_verification(
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;
  
  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Approve verification
  UPDATE profiles
  SET 
    verification_status = 'approved',
    verification_notes = p_notes,
    verification_completed_by = v_admin_id,
    verification_completed_at = NOW()
  WHERE id = p_user_id;
  
  -- TODO: Send notification email
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Verification approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin reject verification
CREATE OR REPLACE FUNCTION fn_admin_reject_verification(
  p_user_id UUID,
  p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;
  
  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Reject verification
  UPDATE profiles
  SET 
    verification_status = 'rejected',
    verification_notes = p_notes,
    verification_completed_by = v_admin_id,
    verification_completed_at = NOW()
  WHERE id = p_user_id;
  
  -- TODO: Send notification email
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Verification rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin request re-upload
CREATE OR REPLACE FUNCTION fn_admin_request_reupload(
  p_user_id UUID,
  p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;
  
  IF v_admin_role NOT IN ('admin', 'editor') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Request re-upload
  UPDATE profiles
  SET 
    verification_status = 'reupload_requested',
    verification_notes = p_notes,
    verification_completed_by = v_admin_id,
    verification_completed_at = NOW()
  WHERE id = p_user_id;
  
  -- TODO: Send notification email
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Re-upload requested'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if verification reminder needed
CREATE OR REPLACE FUNCTION fn_should_show_verification_reminder()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
  v_last_reminder TIMESTAMP;
  v_sub_role TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT 
    verification_status,
    last_verification_reminder,
    sub_role
  INTO v_status, v_last_reminder, v_sub_role
  FROM profiles
  WHERE id = v_user_id;
  
  -- Browser doesn't need verification
  IF v_sub_role = 'browser' THEN
    RETURN FALSE;
  END IF;
  
  -- Show if pending and (never shown OR shown more than 24h ago)
  IF v_status = 'pending' AND (
    v_last_reminder IS NULL OR
    v_last_reminder < NOW() - INTERVAL '24 hours'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Show if reupload requested
  IF v_status = 'reupload_requested' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Dismiss verification reminder
CREATE OR REPLACE FUNCTION fn_dismiss_verification_reminder()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET last_verification_reminder = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Users can read their own verification status
CREATE POLICY "users_read_own_verification" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own verification documents
CREATE POLICY "users_update_own_verification" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read all verification data
CREATE POLICY "admins_read_all_verification" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- Admins can update verification status
CREATE POLICY "admins_update_verification" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- Verification history policies
DROP POLICY IF EXISTS "users_read_own_history" ON verification_history;
CREATE POLICY "users_read_own_history" ON verification_history
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_read_all_history" ON verification_history;
CREATE POLICY "admins_read_all_history" ON verification_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
ON profiles(verification_status) 
WHERE verification_status IN ('pending', 'reupload_requested');

CREATE INDEX IF NOT EXISTS idx_profiles_sub_role 
ON profiles(sub_role);

CREATE INDEX IF NOT EXISTS idx_profiles_badge_color 
ON profiles(badge_color);

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================

COMMENT ON COLUMN profiles.sub_role IS 'User sub-role: car_owner, browser, or garage_owner';
COMMENT ON COLUMN profiles.verification_status IS 'Verification status: pending, approved, rejected, reupload_requested';
COMMENT ON COLUMN profiles.badge_color IS 'Badge color: green (car_owner), yellow (browser), blue (garage_owner), grey (unverified)';
COMMENT ON COLUMN profiles.verification_documents IS 'Array of document URLs and metadata';
COMMENT ON COLUMN profiles.verification_notes IS 'Admin notes about verification';
COMMENT ON TABLE verification_history IS 'Audit log of verification status changes';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20241101210000_subscriber_roles_system completed successfully';
END $$;
