/**
 * Migration: Force Admin Role Update
 * 
 * This migration will:
 * 1. Show all current users
 * 2. Update ALL users to admin role (for testing)
 * 3. Fix any remaining RLS issues
 * 
 * Date: 2025-11-02
 */

-- ============================================================================
-- 1. SHOW CURRENT USERS
-- ============================================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  RAISE NOTICE '📋 Current Users in Database:';
  RAISE NOTICE '================================';
  
  FOR user_record IN 
    SELECT id, email, role, display_name 
    FROM profiles 
    ORDER BY created_at DESC
    LIMIT 20
  LOOP
    RAISE NOTICE 'Email: %, Role: %, Name: %', 
      user_record.email, 
      COALESCE(user_record.role, 'NULL'), 
      COALESCE(user_record.display_name, 'NULL');
  END LOOP;
  
  RAISE NOTICE '================================';
END $$;

-- ============================================================================
-- 2. UPDATE ALL USERS TO ADMIN (FOR TESTING)
-- ============================================================================

-- Update ALL users to admin role
UPDATE profiles 
SET 
  role = 'admin',
  display_name = COALESCE(display_name, split_part(email, '@', 1)),
  updated_at = NOW()
WHERE role IS NULL OR role != 'admin';

-- ============================================================================
-- 3. VERIFY UPDATE
-- ============================================================================

DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Updated % users to admin role', admin_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 4. SHOW UPDATED USERS
-- ============================================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  RAISE NOTICE '📋 Updated Users (All should be admin now):';
  RAISE NOTICE '================================';
  
  FOR user_record IN 
    SELECT id, email, role, display_name 
    FROM profiles 
    WHERE role = 'admin'
    ORDER BY created_at DESC
    LIMIT 20
  LOOP
    RAISE NOTICE '✅ Email: %, Role: %, Name: %', 
      user_record.email, 
      user_record.role, 
      COALESCE(user_record.display_name, 'NULL');
  END LOOP;
  
  RAISE NOTICE '================================';
END $$;

-- ============================================================================
-- 5. ENSURE RLS ALLOWS PROFILE ACCESS
-- ============================================================================

-- Make absolutely sure public can view profiles
DROP POLICY IF EXISTS "allow_all_read_profiles" ON profiles;
CREATE POLICY "allow_all_read_profiles" ON profiles
FOR SELECT 
USING (true);

-- Make sure authenticated users can do everything with their profile
DROP POLICY IF EXISTS "allow_authenticated_all_own_profile" ON profiles;
CREATE POLICY "allow_authenticated_all_own_profile" ON profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 6. FINAL VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All users updated to admin role';
  RAISE NOTICE '✅ RLS policies updated to allow access';
  RAISE NOTICE '';
  RAISE NOTICE '👉 NOW: Clear browser cache and sign in again!';
  RAISE NOTICE '';
END $$;
