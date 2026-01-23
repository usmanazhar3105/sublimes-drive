-- ============================================================================
-- Migration: Fix Profiles Table Permissions
-- Date: 2026-01-21
-- Priority: SECURITY - Restrict unnecessary privileges
-- 
-- Fixes:
-- 1. Remove DELETE, TRUNCATE, REFERENCES, TRIGGER from authenticated users
-- 2. Keep only SELECT, INSERT, UPDATE for authenticated users
-- 3. Service role keeps all privileges (needed for admin operations)
-- ============================================================================

-- ============================================================================
-- 1. REVOKE UNNECESSARY PRIVILEGES FROM authenticated
-- ============================================================================

-- Remove DELETE privilege (users shouldn't delete profiles via API)
REVOKE DELETE ON public.profiles FROM authenticated;

-- Remove TRUNCATE privilege (users should never truncate tables)
REVOKE TRUNCATE ON public.profiles FROM authenticated;

-- Remove REFERENCES privilege (not needed for regular users)
REVOKE REFERENCES ON public.profiles FROM authenticated;

-- Remove TRIGGER privilege (users shouldn't manage triggers)
REVOKE TRIGGER ON public.profiles FROM authenticated;

-- ============================================================================
-- 2. ENSURE CORRECT PRIVILEGES ARE GRANTED
-- ============================================================================

-- Grant only necessary privileges to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Service role needs all privileges (for admin operations and triggers)
GRANT ALL ON public.profiles TO service_role;

-- Anon users can only read (for public profiles)
GRANT SELECT ON public.profiles TO anon;

-- ============================================================================
-- 3. VERIFICATION QUERY
-- ============================================================================

-- Run this to verify permissions are correct:
-- SELECT 
--     grantee,
--     privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND table_name = 'profiles'
--   AND grantee IN ('authenticated', 'anon', 'service_role')
-- ORDER BY grantee, privilege_type;
--
-- Expected Result:
-- - authenticated: SELECT, INSERT, UPDATE (only these 3)
-- - anon: SELECT (only)
-- - service_role: ALL (DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE)

-- ✅ Migration complete - Permissions restricted for security













