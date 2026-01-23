-- ============================================================================
-- TEST QUERIES - Verify role column sync with system_role
-- Date: 2026-01-21
-- Run these queries after migration to verify everything works
-- ============================================================================

-- ============================================================================
-- TEST 1: Check if role column exists
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'role';

-- Expected: Should return role column with TEXT type

-- ============================================================================
-- TEST 2: Check if triggers exist
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'profiles'
  AND trigger_name LIKE '%sync_role%'
ORDER BY trigger_name;

-- Expected: Should return 2 triggers:
-- - sync_role_trigger_insert (BEFORE INSERT)
-- - sync_role_trigger_update (BEFORE UPDATE)

-- ============================================================================
-- TEST 3: Check if sync function exists
-- ============================================================================
SELECT 
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'sync_role_from_system_role';

-- Expected: Should return the function definition

-- ============================================================================
-- TEST 4: Verify role is synced with system_role (existing data)
-- ============================================================================
SELECT 
    id,
    email,
    system_role,
    role,
    CASE 
        WHEN role = system_role THEN '✅ SYNCED'
        WHEN role IS NULL AND system_role IS NULL THEN '✅ BOTH NULL'
        WHEN role IS NULL THEN '❌ role is NULL but system_role is not'
        WHEN system_role IS NULL THEN '❌ system_role is NULL but role is not'
        ELSE '❌ MISMATCH'
    END AS sync_status
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Expected: All rows should show ✅ SYNCED or ✅ BOTH NULL

-- ============================================================================
-- TEST 5: Count mismatches (should be 0)
-- ============================================================================
SELECT 
    COUNT(*) AS total_profiles,
    COUNT(CASE WHEN role = system_role THEN 1 END) AS synced_count,
    COUNT(CASE WHEN role IS DISTINCT FROM system_role THEN 1 END) AS mismatch_count,
    COUNT(CASE WHEN role IS NULL AND system_role IS NOT NULL THEN 1 END) AS role_null_count,
    COUNT(CASE WHEN system_role IS NULL AND role IS NOT NULL THEN 1 END) AS system_role_null_count
FROM public.profiles;

-- Expected: 
-- - mismatch_count should be 0
-- - role_null_count should be 0 (or very few if some are legitimately NULL)
-- - system_role_null_count should be 0

-- ============================================================================
-- TEST 6: Test INSERT trigger (uses existing user or creates auth user)
-- NOTE: This test requires an existing auth user or creates one
-- ============================================================================
DO $$
DECLARE
    test_user_id UUID;
    test_role_value TEXT;
    existing_user_id UUID;
BEGIN
    -- Try to find an existing user that doesn't have a profile yet
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Use existing auth user
        test_user_id := existing_user_id;
        RAISE NOTICE 'Using existing auth user: %', test_user_id;
    ELSE
        -- No existing user without profile, skip test
        RAISE NOTICE '⚠️  No auth user without profile found - skipping INSERT test';
        RAISE NOTICE '💡 To test INSERT trigger, create a new auth user via signup';
        RETURN;
    END IF;
    
    -- Insert a test profile with system_role = 'browser'
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        system_role,
        verification_status
    ) VALUES (
        test_user_id,
        (SELECT email FROM auth.users WHERE id = test_user_id),
        'Test User',
        'browser',
        'pending'
    );
    
    -- Check if role was automatically set
    SELECT role INTO test_role_value
    FROM public.profiles
    WHERE id = test_user_id;
    
    IF test_role_value = 'browser' THEN
        RAISE NOTICE '✅ INSERT trigger works! role = %', test_role_value;
    ELSE
        RAISE WARNING '❌ INSERT trigger failed! role = %, expected browser', test_role_value;
    END IF;
    
    -- Cleanup: Delete test profile (keep auth user)
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE '✅ Test profile deleted';
END $$;

-- Expected: Should show "✅ INSERT trigger works! role = browser"
-- OR "⚠️ No auth user without profile found" if no test user available

-- ============================================================================
-- TEST 7: Test UPDATE trigger (updates existing profile)
-- WARNING: This modifies an existing profile - use a test account
-- ============================================================================
-- Uncomment and replace USER_ID with a test user ID:
/*
DO $$
DECLARE
    test_user_id UUID := 'USER_ID_HERE'; -- Replace with actual test user ID
    old_role TEXT;
    new_role TEXT;
BEGIN
    -- Get current role
    SELECT role INTO old_role
    FROM public.profiles
    WHERE id = test_user_id;
    
    RAISE NOTICE 'Current role: %', old_role;
    
    -- Update system_role
    UPDATE public.profiles
    SET system_role = 'car_owner'
    WHERE id = test_user_id;
    
    -- Check if role was automatically updated
    SELECT role INTO new_role
    FROM public.profiles
    WHERE id = test_user_id;
    
    IF new_role = 'car_owner' THEN
        RAISE NOTICE '✅ UPDATE trigger works! role changed from % to %', old_role, new_role;
    ELSE
        RAISE WARNING '❌ UPDATE trigger failed! role = %, expected car_owner', new_role;
    END IF;
    
    -- Restore original value
    UPDATE public.profiles
    SET system_role = old_role
    WHERE id = test_user_id;
    
    RAISE NOTICE '✅ Original value restored';
END $$;
*/

-- ============================================================================
-- TEST 8: Check index exists
-- ============================================================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND indexname = 'idx_profiles_role';

-- Expected: Should return the index definition

-- ============================================================================
-- TEST 9: Performance test - query using role column
-- ============================================================================
EXPLAIN ANALYZE
SELECT 
    id,
    email,
    role,
    system_role
FROM public.profiles
WHERE role = 'browser'
LIMIT 10;

-- Expected: Should use the index and return results quickly

-- ============================================================================
-- TEST 10: Verify frontend query works
-- ============================================================================
-- This simulates what the frontend does:
SELECT 
    id,
    role
FROM public.profiles
WHERE id = auth.uid()
LIMIT 1;

-- Expected: Should return your profile with role column (no 409 error)

-- ============================================================================
-- SUMMARY CHECKLIST
-- ============================================================================
-- After running all tests, verify:
-- 
-- ✅ role column exists
-- ✅ 2 triggers exist (insert and update)
-- ✅ sync function exists
-- ✅ All existing rows have role = system_role
-- ✅ INSERT trigger automatically sets role
-- ✅ UPDATE trigger automatically updates role
-- ✅ Index exists for performance
-- ✅ Frontend query works (no 409 error)
--
-- If all tests pass, the migration was successful! 🎉

