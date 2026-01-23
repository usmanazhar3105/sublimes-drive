-- ============================================================================
-- DIAGNOSE RLS RECURSION ISSUE - Overview of Current Database State
-- ============================================================================
-- Run this FIRST to understand the current state before fixing
-- ============================================================================

-- ============================================================================
-- 1. CHECK ALL RLS POLICIES ON PROFILES TABLE
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- 2. CHECK FOR RECURSIVE PATTERNS IN POLICIES
-- ============================================================================
-- Look for policies that query the profiles table within their USING/WITH CHECK clauses
SELECT 
    policyname,
    CASE 
        WHEN qual::text LIKE '%profiles%' OR qual::text LIKE '%FROM public.profiles%' 
        THEN '⚠️ RECURSIVE - Queries profiles table'
        WHEN qual::text LIKE '%EXISTS%SELECT%profiles%' 
        THEN '⚠️ RECURSIVE - EXISTS query on profiles'
        ELSE '✅ SAFE - No profiles query'
    END as recursion_risk,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
  AND (qual::text LIKE '%profiles%' OR with_check::text LIKE '%profiles%');

-- ============================================================================
-- 3. CHECK PROFILES TABLE STRUCTURE
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CHECK ROLE COLUMNS IN PROFILES
-- ============================================================================
SELECT 
    COUNT(*) as total_profiles,
    COUNT(DISTINCT system_role) as distinct_system_roles,
    COUNT(DISTINCT role) as distinct_roles,
    COUNT(DISTINCT user_role) as distinct_user_roles,
    COUNT(DISTINCT sub_role) as distinct_sub_roles
FROM public.profiles;

-- Distribution of roles
SELECT 
    COALESCE(system_role, 'NULL') as system_role,
    COALESCE(role, 'NULL') as role,
    COUNT(*) as count
FROM public.profiles
GROUP BY system_role, role
ORDER BY count DESC;

-- ============================================================================
-- 5. CHECK ADMIN USERS
-- ============================================================================
SELECT 
    id,
    email,
    display_name,
    system_role,
    role,
    user_role,
    sub_role,
    verification_status,
    created_at
FROM public.profiles
WHERE system_role IN ('admin', 'superadmin', 'editor')
   OR role IN ('admin', 'superadmin', 'editor')
ORDER BY created_at DESC;

-- ============================================================================
-- 6. CHECK HELPER FUNCTIONS
-- ============================================================================
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'is_admin_user', 'app.is_admin')
ORDER BY routine_name;

-- ============================================================================
-- 7. CHECK JWT CLAIMS STRUCTURE (if available)
-- ============================================================================
-- This will show what JWT claims are available
-- Note: This requires being logged in as a user
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.jwt() as jwt_claims;

-- ============================================================================
-- 8. CHECK RLS STATUS
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- ============================================================================
-- 9. TEST CURRENT POLICY BEHAVIOR (if logged in)
-- ============================================================================
-- This will show what policies are being used
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM public.profiles WHERE id = auth.uid()
LIMIT 1;

-- ============================================================================
-- SUMMARY OUTPUT
-- ============================================================================
-- After running all queries above, you should see:
-- 1. All policies on profiles table
-- 2. Which policies are recursive (query profiles within policy)
-- 3. Current table structure
-- 4. Role distribution
-- 5. Admin users
-- 6. Helper functions
-- 7. RLS status
-- ============================================================================


