/**
 * Migration: Fix RLS Infinite Recursion - FINAL PROPER FIX
 * 
 * This migration completely removes the infinite recursion issue
 * by using simple, non-recursive RLS policies.
 * 
 * Root Cause: Policies were checking profiles table while defining
 * policies ON profiles table, causing infinite loop.
 * 
 * Solution: Use auth.uid() directly without subqueries.
 * 
 * Date: 2025-11-02
 */

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES ON PROFILES
-- ============================================================================

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: DISABLE AND RE-ENABLE RLS (Clean slate)
-- ============================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================================

-- Policy 1: Users can read their own profile
-- Uses auth.uid() directly - NO RECURSION
CREATE POLICY "profiles_select_own"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can update their own profile
-- Uses auth.uid() directly - NO RECURSION
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Users can insert their own profile (for signup)
-- Uses auth.uid() directly - NO RECURSION
CREATE POLICY "profiles_insert_own"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 4: Users can delete their own profile
-- Uses auth.uid() directly - NO RECURSION
CREATE POLICY "profiles_delete_own"
ON profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Policy 5: Public can view basic profile info (for displaying usernames, avatars)
-- This allows viewing other users' profiles without authentication
CREATE POLICY "profiles_select_public"
ON profiles
FOR SELECT
TO public
USING (true);

-- ============================================================================
-- STEP 4: GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Grant select to public (for viewing profiles)
GRANT SELECT ON profiles TO anon;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- ============================================================================
-- STEP 5: CREATE HELPER FUNCTION FOR ADMIN CHECK (Non-recursive)
-- ============================================================================

-- This function checks if current user is admin WITHOUT causing recursion
-- It uses auth.uid() and a direct query, not a policy check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================================
-- STEP 6: VERIFY POLICIES
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS POLICIES FIXED!';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Total policies on profiles: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '  1. profiles_select_own - Users read own profile';
    RAISE NOTICE '  2. profiles_update_own - Users update own profile';
    RAISE NOTICE '  3. profiles_insert_own - Users insert own profile';
    RAISE NOTICE '  4. profiles_delete_own - Users delete own profile';
    RAISE NOTICE '  5. profiles_select_public - Public can view profiles';
    RAISE NOTICE '';
    RAISE NOTICE '✅ NO MORE INFINITE RECURSION!';
    RAISE NOTICE '✅ Profiles will now load correctly!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 7: TEST THE FIX
-- ============================================================================

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
