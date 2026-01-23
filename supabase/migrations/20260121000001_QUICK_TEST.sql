-- ============================================================================
-- QUICK TEST - Run this immediately after migration
-- This is a simplified test to quickly verify the main fixes
-- ============================================================================

-- TEST 1: Check if you can read your profile (no recursion error)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
SELECT 
    id,
    email,
    system_role,
    user_role,
    verification_status,
    created_at
FROM public.profiles
WHERE id = auth.uid()
LIMIT 1;

-- If this returns a result WITHOUT a 500 error, recursion is fixed! ✅
-- If you get "infinite recursion" error, the migration needs adjustment

-- ============================================================================
-- TEST 2: Check default values are correct
-- ============================================================================
SELECT 
    'system_role default' AS check_name,
    column_default AS current_default,
    CASE 
        WHEN column_default LIKE '%browser%' THEN '✅ CORRECT'
        ELSE '❌ WRONG - Should be ''browser'''
    END AS status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'system_role'

UNION ALL

SELECT 
    'verification_status default' AS check_name,
    column_default AS current_default,
    CASE 
        WHEN column_default LIKE '%pending%' THEN '✅ CORRECT'
        ELSE '❌ WRONG - Should be ''pending'''
    END AS status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'verification_status';

-- Expected: Both should show ✅ CORRECT

-- ============================================================================
-- TEST 3: Check RLS policies (admin policy should not query profiles)
-- ============================================================================
SELECT 
    policyname,
    CASE 
        WHEN qual LIKE '%EXISTS%SELECT%FROM%profiles%' THEN '❌ RECURSION RISK'
        WHEN qual LIKE '%auth.jwt%' OR qual LIKE '%auth.role%' THEN '✅ SAFE (uses JWT)'
        ELSE '⚠️ CHECK MANUALLY'
    END AS recursion_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname = 'pr_admin_all';

-- Expected: Should show ✅ SAFE (uses JWT)

-- ============================================================================
-- TEST 4: Check recent users have correct role
-- ============================================================================
SELECT 
    email,
    system_role,
    verification_status,
    CASE 
        WHEN system_role = 'browser' THEN '✅ CORRECT'
        WHEN system_role IS NULL THEN '❌ NULL - Should be browser'
        ELSE '⚠️ Different role: ' || system_role
    END AS role_status
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Recent users should show ✅ CORRECT with system_role = 'browser'

-- ============================================================================
-- ALL TESTS PASSED? 
-- ============================================================================
-- ✅ Profile read works (no recursion error)
-- ✅ system_role default is 'browser'
-- ✅ verification_status default is 'pending'
-- ✅ Admin policy uses JWT (no recursion)
-- ✅ Recent users have correct role
--
-- If all show ✅, the migration was successful! 🎉















