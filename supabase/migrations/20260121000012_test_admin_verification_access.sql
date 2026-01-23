-- ============================================================================
-- TEST ADMIN ACCESS TO VERIFICATION REQUESTS
-- Date: 2026-01-21
-- Priority: DEBUG - Verify admin can see verification requests
-- ============================================================================

-- ============================================================================
-- 1. CHECK CURRENT USER AND ADMIN STATUS
-- ============================================================================

SELECT 
    'Current User' as check_type,
    auth.uid() as user_id,
    auth.role() as role,
    public.check_is_admin() as is_admin,
    COALESCE((auth.jwt()->>'is_admin')::boolean, false) as jwt_is_admin,
    COALESCE(auth.jwt()->>'user_role', '') as jwt_user_role,
    COALESCE(auth.jwt()->>'system_role', '') as jwt_system_role;

-- ============================================================================
-- 2. CHECK ADMIN USER PROFILE
-- ============================================================================

SELECT 
    'Admin Profile' as check_type,
    id,
    email,
    role,
    system_role,
    verification_status
FROM public.profiles
WHERE role IN ('admin', 'superadmin', 'editor')
   OR system_role IN ('admin', 'superadmin', 'editor')
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- 3. TEST VERIFICATION REQUESTS QUERY (as admin would see)
-- ============================================================================

-- Test query for vehicle verifications
SELECT 
    'Vehicle Verifications' as check_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM public.verification_requests
WHERE verification_type = 'vehicle';

-- Test query for garage verifications
SELECT 
    'Garage Verifications' as check_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM public.verification_requests
WHERE verification_type = 'garage';

-- Test query for vendor verifications
SELECT 
    'Vendor Verifications' as check_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM public.verification_requests
WHERE verification_type = 'vendor';

-- ============================================================================
-- 4. TEST FULL QUERY WITH PROFILE JOIN (as component would query)
-- ============================================================================

-- This simulates what the admin panel component does
SELECT 
    vr.id,
    vr.user_id,
    vr.verification_type,
    vr.status,
    vr.submitted_at,
    vr.created_at,
    p.email as user_email,
    p.display_name as user_name,
    p.role as user_role,
    p.system_role as user_system_role
FROM public.verification_requests vr
LEFT JOIN public.profiles p ON p.id = vr.user_id
WHERE vr.verification_type = 'vehicle'
ORDER BY vr.submitted_at DESC
LIMIT 10;

-- ============================================================================
-- 5. CHECK RLS POLICIES ON VERIFICATION_REQUESTS
-- ============================================================================

SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN qual::text LIKE '%check_is_admin%' THEN '✅ Uses function'
        WHEN qual::text LIKE '%profiles%' AND qual::text NOT LIKE '%check_is_admin%' 
        THEN '⚠️ Direct profiles query (risky)'
        ELSE '✅ Safe'
    END as policy_type,
    LEFT(qual::text, 200) as using_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'verification_requests'
ORDER BY policyname;

-- ============================================================================
-- 6. VERIFY FOREIGN KEY RELATIONSHIP
-- ============================================================================

SELECT 
    'Foreign Key Check' as check_type,
    COUNT(*) as total_requests,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE user_id IN (SELECT id FROM public.profiles)) as requests_with_valid_users,
    COUNT(*) FILTER (WHERE user_id NOT IN (SELECT id FROM public.profiles)) as requests_with_invalid_users
FROM public.verification_requests;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this, you should see:
-- 1. Current user admin status
-- 2. Admin profiles
-- 3. Counts of verification requests by type
-- 4. Sample verification requests with profile data
-- 5. RLS policies status
-- 6. Foreign key integrity
-- ============================================================================

