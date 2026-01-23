-- ============================================================================
-- TEST QUERIES - Run after migration to verify fixes
-- Date: 2026-01-21
-- Run these queries in Supabase SQL Editor to verify the migration worked
-- ============================================================================

-- ============================================================================
-- TEST 1: Check system_role default value
-- Expected: DEFAULT 'browser'
-- ============================================================================
SELECT 
    column_name,
    column_default,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'system_role';

-- Expected Result:
-- column_name: system_role
-- column_default: 'browser'::text
-- data_type: text
-- is_nullable: YES

-- ============================================================================
-- TEST 2: Check verification_status default value
-- Expected: DEFAULT 'pending'
-- ============================================================================
SELECT 
    column_name,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'verification_status';

-- Expected Result:
-- column_name: verification_status
-- column_default: 'pending'::text
-- data_type: text

-- ============================================================================
-- TEST 3: Check existing users have correct system_role
-- Expected: All users should have system_role = 'browser' (or their assigned role)
-- ============================================================================
SELECT 
    id,
    email,
    system_role,
    user_role,
    verification_status,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Expected: All rows should have system_role set (not NULL)
-- New users should have system_role = 'browser'

-- ============================================================================
-- TEST 4: Check RLS policies exist and are correct
-- Expected: Policies should exist, admin policy should NOT query profiles table
-- ============================================================================
SELECT 
    policyname,
    cmd AS command,
    roles,
    LEFT(qual, 200) AS using_expression,
    LEFT(with_check, 200) AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- Expected Policies:
-- - pr_admin_all (should use JWT claims, not profiles table query)
-- - profiles_read_own
-- - profiles_update_own
-- - profiles_insert_own
-- - profiles_anon_read
-- - profiles_service_role_all

-- ============================================================================
-- TEST 5: Check admin policy does NOT query profiles table (no recursion)
-- Expected: Policy should use JWT claims, not EXISTS (SELECT FROM profiles)
-- ============================================================================
SELECT 
    policyname,
    qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname = 'pr_admin_all';

-- Expected: The using_expression should contain:
-- - auth.role() = 'service_role'
-- - auth.jwt()->>'is_admin'
-- - auth.jwt()->>'user_role'
-- 
-- Should NOT contain:
-- - EXISTS (SELECT FROM profiles)
-- - Any query to profiles table

-- ============================================================================
-- TEST 6: Test profile read (should work without recursion)
-- Run this as an authenticated user (replace with your user ID)
-- ============================================================================
-- First, get your user ID:
SELECT id, email FROM auth.users WHERE email = 'procursorrr@gmail.com';

-- Then test reading your profile (replace USER_ID with your actual ID):
-- SELECT * FROM public.profiles WHERE id = 'USER_ID_HERE';

-- Expected: Should return your profile without 500 error
-- If you get "infinite recursion" error, the migration didn't work correctly

-- ============================================================================
-- TEST 7: Check handle_new_user() trigger function
-- Expected: Function should set system_role = 'browser'
-- ============================================================================
SELECT 
    routine_name,
    routine_type,
    LEFT(routine_definition, 500) AS function_preview
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- Expected: Function definition should contain:
-- - system_role = 'browser'
-- - verification_status = 'pending'
-- - user_role = NULL

-- ============================================================================
-- TEST 8: Check trigger exists and is active
-- Expected: Trigger should exist on auth.users table
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%user%created%';

-- Expected: Should return trigger named 'on_auth_user_created'

-- ============================================================================
-- TEST 9: Test app.is_admin() function exists
-- Expected: Function should exist and be callable
-- ============================================================================
SELECT 
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'app'
  AND routine_name = 'is_admin';

-- Expected: Should return function definition

-- Test the function (will return true/false based on your role):
-- SELECT app.is_admin();

-- ============================================================================
-- TEST 10: Check role distribution
-- Expected: Most users should have system_role = 'browser'
-- ============================================================================
SELECT 
    system_role,
    COUNT(*) AS user_count,
    COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) AS pending_verification,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) AS approved_verification
FROM public.profiles
GROUP BY system_role
ORDER BY user_count DESC;

-- Expected: 
-- - system_role = 'browser' should have the most users
-- - New users should have verification_status = 'pending'

-- ============================================================================
-- TEST 11: Simulate new user signup (test trigger)
-- WARNING: This creates a test user - you may want to delete it after
-- ============================================================================
-- Uncomment to test (creates a test auth user which triggers profile creation):
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert test auth user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        'test_' || test_user_id::text || '@example.com',
        crypt('testpassword123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Test User", "first_name": "Test", "last_name": "User"}'::jsonb
    );
    
    -- Wait a moment for trigger
    PERFORM pg_sleep(0.5);
    
    -- Check if profile was created with correct defaults
    RAISE NOTICE 'Test user ID: %', test_user_id;
    
    -- Check profile
    IF EXISTS (
        SELECT 1 FROM public.profiles WHERE id = test_user_id
    ) THEN
        RAISE NOTICE '✅ Profile created successfully';
        
        -- Check defaults
        PERFORM * FROM public.profiles WHERE id = test_user_id;
        -- Should show: system_role = 'browser', verification_status = 'pending'
    ELSE
        RAISE WARNING '❌ Profile was NOT created';
    END IF;
    
    -- Cleanup: Delete test user (optional)
    -- DELETE FROM auth.users WHERE id = test_user_id;
END $$;
*/

-- ============================================================================
-- TEST 12: Check for any NULL system_role values (should be fixed)
-- Expected: No NULL values (all should be set to 'browser' or their role)
-- ============================================================================
SELECT 
    COUNT(*) AS null_system_role_count
FROM public.profiles
WHERE system_role IS NULL;

-- Expected: Should return 0 (all users should have a system_role)

-- ============================================================================
-- TEST 13: Verify RLS policies allow profile read (no recursion)
-- Run this as authenticated user
-- ============================================================================
-- This query should work without "infinite recursion" error:
-- SELECT 
--     id,
--     email,
--     system_role,
--     user_role,
--     verification_status
-- FROM public.profiles
-- WHERE id = auth.uid()
-- LIMIT 1;

-- Expected: Should return your profile without 500 error

-- ============================================================================
-- TEST 14: Check permissions are granted correctly
-- Expected: authenticated role should have SELECT, INSERT, UPDATE
-- ============================================================================
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY grantee, privilege_type;

-- Expected:
-- - authenticated: SELECT, INSERT, UPDATE
-- - anon: SELECT
-- - service_role: ALL

-- ============================================================================
-- SUMMARY CHECKLIST
-- ============================================================================
-- After running all tests, verify:
-- 
-- ✅ system_role default is 'browser'
-- ✅ verification_status default is 'pending'
-- ✅ RLS policies exist and don't query profiles table
-- ✅ handle_new_user() function sets correct defaults
-- ✅ Trigger exists on auth.users
-- ✅ app.is_admin() function exists
-- ✅ No NULL system_role values
-- ✅ Profile read works without recursion error
-- ✅ Permissions are granted correctly
--
-- If all tests pass, the migration was successful! 🎉













