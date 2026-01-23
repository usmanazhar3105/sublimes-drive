-- ============================================================================
-- DATABASE OVERVIEW QUERIES
-- Sublimes Drive - Complete Database Structure Overview
-- Run these queries in Supabase SQL Editor to understand your database
-- ============================================================================

-- ============================================================================
-- SECTION 1: USER & AUTHENTICATION OVERVIEW
-- ============================================================================

-- Total users and profiles
SELECT 
    'Total Auth Users' AS metric,
    COUNT(*)::text AS value
FROM auth.users
UNION ALL
SELECT 
    'Total Profiles',
    COUNT(*)::text
FROM public.profiles
UNION ALL
SELECT 
    'Admin Users',
    COUNT(*)::text
FROM public.profiles
WHERE role IN ('admin', 'superadmin', 'editor')
UNION ALL
SELECT 
    'Verified Users',
    COUNT(*)::text
FROM public.profiles
WHERE verification_status = 'approved';

-- User role distribution
SELECT 
    role AS user_role,
    system_role,
    COUNT(*) AS count,
    COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) AS pending_verification,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) AS approved_verification
FROM public.profiles
GROUP BY role, system_role
ORDER BY count DESC;

-- ============================================================================
-- SECTION 2: VERIFICATION REQUESTS OVERVIEW
-- ============================================================================

-- Verification requests by status
SELECT 
    verification_type,
    status,
    COUNT(*) AS count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
FROM public.verification_requests
GROUP BY verification_type, status
ORDER BY verification_type, status;

-- Pending verification requests (for admin)
SELECT 
    vr.id,
    vr.verification_type,
    vr.status,
    vr.submitted_at,
    p.email,
    p.display_name,
    p.role,
    p.system_role
FROM public.verification_requests vr
JOIN public.profiles p ON vr.user_id = p.id
WHERE vr.status = 'pending'
ORDER BY vr.submitted_at DESC
LIMIT 20;

-- ============================================================================
-- SECTION 3: OFFERS OVERVIEW
-- ============================================================================

-- Offers statistics
SELECT 
    'Total Offers' AS metric,
    COUNT(*)::text AS value
FROM public.offers
UNION ALL
SELECT 
    'Active Offers',
    COUNT(*)::text
FROM public.offers
WHERE is_active = true
UNION ALL
SELECT 
    'Featured Offers',
    COUNT(*)::text
FROM public.offers
WHERE is_featured = true;

-- Recent offers
SELECT 
    id,
    title,
    category,
    original_price,
    offer_price,
    discount_percentage,
    valid_from,
    valid_until,
    is_active,
    created_at
FROM public.offers
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SECTION 4: ADMIN ACCESS VERIFICATION
-- ============================================================================

-- Check if current user is admin
SELECT 
    auth.uid() AS current_user_id,
    public.is_admin_user() AS is_admin,
    p.role,
    p.system_role,
    p.email
FROM public.profiles p
WHERE p.id = auth.uid();

-- Admin users list
SELECT 
    id,
    email,
    display_name,
    role,
    system_role,
    verification_status,
    created_at,
    last_login_at
FROM public.profiles
WHERE role IN ('admin', 'superadmin', 'editor')
ORDER BY created_at DESC;

-- ============================================================================
-- SECTION 5: TABLE STRUCTURES
-- ============================================================================

-- Profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Offers table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'offers'
ORDER BY ordinal_position;

-- Verification requests table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'verification_requests'
ORDER BY ordinal_position;

-- ============================================================================
-- SECTION 6: RLS POLICIES OVERVIEW
-- ============================================================================

-- Profiles RLS policies
SELECT 
    policyname,
    cmd AS command,
    roles,
    LEFT(qual, 200) AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- Verification requests RLS policies
SELECT 
    policyname,
    cmd AS command,
    roles,
    LEFT(qual, 200) AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'verification_requests'
ORDER BY policyname;

-- Offers RLS policies
SELECT 
    policyname,
    cmd AS command,
    roles,
    LEFT(qual, 200) AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'offers'
ORDER BY policyname;

-- ============================================================================
-- SECTION 7: RECENT ACTIVITY
-- ============================================================================

-- Recent user signups
SELECT 
    p.id,
    p.email,
    p.display_name,
    p.role,
    p.system_role,
    p.verification_status,
    p.created_at,
    au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Recent verification requests
SELECT 
    vr.id,
    vr.verification_type,
    vr.status,
    vr.submitted_at,
    p.email,
    p.display_name
FROM public.verification_requests vr
JOIN public.profiles p ON vr.user_id = p.id
ORDER BY vr.submitted_at DESC
LIMIT 10;

-- Recent offers created
SELECT 
    o.id,
    o.title,
    o.category,
    o.discount_percentage,
    o.is_active,
    o.created_at,
    p.email AS created_by_email
FROM public.offers o
LEFT JOIN public.profiles p ON o.created_by = p.id
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- SECTION 8: DATA INTEGRITY CHECKS
-- ============================================================================

-- Check role sync (role should match system_role)
SELECT 
    COUNT(*) AS total_profiles,
    COUNT(CASE WHEN role = system_role THEN 1 END) AS synced_count,
    COUNT(CASE WHEN role IS DISTINCT FROM system_role THEN 1 END) AS mismatch_count
FROM public.profiles;

-- Profiles without auth users (orphaned)
SELECT 
    p.id,
    p.email,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- Auth users without profiles (should trigger create)
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- SECTION 9: ADMIN FUNCTIONS AVAILABLE
-- ============================================================================

-- List all admin-related functions
SELECT 
    routine_schema,
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema IN ('public', 'app')
  AND (
    routine_name LIKE '%admin%' 
    OR routine_name LIKE '%verification%'
    OR routine_name IN ('is_admin', 'is_admin_user', 'sync_role_from_system_role')
  )
ORDER BY routine_schema, routine_name;

-- ============================================================================
-- SECTION 10: QUICK STATS DASHBOARD
-- ============================================================================

SELECT 
    'Users' AS category,
    COUNT(*)::text AS total,
    COUNT(CASE WHEN verification_status = 'pending' THEN 1 END)::text AS pending,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END)::text AS approved
FROM public.profiles
UNION ALL
SELECT 
    'Verification Requests',
    COUNT(*)::text,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::text,
    COUNT(CASE WHEN status = 'approved' THEN 1 END)::text
FROM public.verification_requests
UNION ALL
SELECT 
    'Offers',
    COUNT(*)::text,
    COUNT(CASE WHEN is_active = false THEN 1 END)::text AS inactive,
    COUNT(CASE WHEN is_active = true THEN 1 END)::text AS active
FROM public.offers;

-- ============================================================================
-- END OF OVERVIEW
-- ============================================================================



