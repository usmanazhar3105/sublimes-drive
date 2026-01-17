/**
 * Migration: Create Verification Requests Table
 * 
 * This table stores all verification requests from users:
 * - Vehicle verifications
 * - Garage verifications
 * - Vendor verifications
 * 
 * Connects user submissions to admin verification hub
 * 
 * Date: 2025-11-02
 */

-- ============================================================================
-- CREATE VERIFICATION_REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('vehicle', 'garage', 'vendor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  data JSONB NOT NULL DEFAULT '{}',
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewer_id UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON verification_requests(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewer_id ON verification_requests(reviewer_id);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Users can read their own verification requests
CREATE POLICY "verification_requests_select_own"
ON verification_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "verification_requests_insert_own"
ON verification_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "verification_requests_update_own"
ON verification_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can read all verification requests
CREATE POLICY "verification_requests_select_admin"
ON verification_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Admins can update all verification requests
CREATE POLICY "verification_requests_update_admin"
ON verification_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON verification_requests TO authenticated;
GRANT SELECT ON verification_requests TO anon;

-- ============================================================================
-- CREATE UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_verification_requests_updated_at();

-- ============================================================================
-- CREATE FUNCTION TO AUTO-UPDATE PROFILE ROLE ON APPROVAL
-- ============================================================================

CREATE OR REPLACE FUNCTION update_profile_role_on_verification_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification is approved, update user's role
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles
    SET role = CASE
      WHEN NEW.verification_type = 'vehicle' THEN 'car-owner'
      WHEN NEW.verification_type = 'garage' THEN 'garage-owner'
      WHEN NEW.verification_type = 'vendor' THEN 'vendor'
      ELSE role
    END,
    updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_role_on_verification_approval ON verification_requests;
CREATE TRIGGER update_profile_role_on_verification_approval
AFTER UPDATE ON verification_requests
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
EXECUTE FUNCTION update_profile_role_on_verification_approval();

-- ============================================================================
-- INSERT SAMPLE DATA (FOR TESTING)
-- ============================================================================

-- Insert some sample verification requests
INSERT INTO verification_requests (user_id, verification_type, status, data, documents)
SELECT 
  id,
  'vehicle',
  'pending',
  jsonb_build_object(
    'vehicle_make', 'Toyota',
    'vehicle_model', 'Camry',
    'vehicle_year', 2023,
    'license_plate', 'ABC123',
    'owner_name', display_name
  ),
  ARRAY['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf']
FROM profiles
WHERE role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ VERIFICATION REQUESTS TABLE CREATED!';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Table: verification_requests';
    RAISE NOTICE 'Columns:';
    RAISE NOTICE '  - id (UUID)';
    RAISE NOTICE '  - user_id (UUID)';
    RAISE NOTICE '  - verification_type (vehicle/garage/vendor)';
    RAISE NOTICE '  - status (pending/approved/rejected)';
    RAISE NOTICE '  - data (JSONB)';
    RAISE NOTICE '  - documents (TEXT[])';
    RAISE NOTICE '  - submitted_at, reviewed_at';
    RAISE NOTICE '  - reviewer_id';
    RAISE NOTICE '';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '  ✅ RLS policies for users and admins';
    RAISE NOTICE '  ✅ Auto-update profile role on approval';
    RAISE NOTICE '  ✅ Indexes for performance';
    RAISE NOTICE '  ✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ADMIN VERIFICATION HUB READY!';
    RAISE NOTICE '';
END $$;
