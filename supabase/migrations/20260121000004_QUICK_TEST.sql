-- ============================================================================
-- QUICK TEST - Verify role column sync
-- Run this immediately after migration
-- ============================================================================

-- TEST 1: Check if role column exists and is synced
SELECT 
    'Total Profiles' AS metric,
    COUNT(*)::text AS value
FROM public.profiles
UNION ALL
SELECT 
    'Synced (role = system_role)',
    COUNT(*)::text
FROM public.profiles
WHERE role = system_role
UNION ALL
SELECT 
    'Mismatched',
    COUNT(*)::text
FROM public.profiles
WHERE role IS DISTINCT FROM system_role
UNION ALL
SELECT 
    'role is NULL',
    COUNT(*)::text
FROM public.profiles
WHERE role IS NULL AND system_role IS NOT NULL;

-- Expected: Mismatched and role is NULL should be 0 or very low

-- ============================================================================
-- TEST 2: Check triggers exist
-- ============================================================================
SELECT 
    trigger_name,
    CASE 
        WHEN trigger_name LIKE '%insert%' THEN '✅ INSERT trigger'
        WHEN trigger_name LIKE '%update%' THEN '✅ UPDATE trigger'
        ELSE '✅ Other trigger'
    END AS status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'profiles'
  AND trigger_name LIKE '%sync_role%';

-- Expected: Should return 2 rows (insert and update triggers)

-- ============================================================================
-- TEST 3: Sample data check
-- ============================================================================
SELECT 
    email,
    system_role,
    role,
    CASE 
        WHEN role = system_role THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END AS status
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Expected: All should show ✅ SYNCED

-- ============================================================================
-- TEST 4: Test frontend query (simulate)
-- ============================================================================
-- This is what the frontend does - should work without 409 error
SELECT 
    id,
    role,
    system_role
FROM public.profiles
LIMIT 1;

-- Expected: Should return data without errors

-- ============================================================================
-- ALL TESTS PASSED?
-- ============================================================================
-- ✅ role column exists
-- ✅ Triggers exist
-- ✅ Data is synced
-- ✅ Frontend query works
--
-- If all show ✅, the migration was successful! 🎉












