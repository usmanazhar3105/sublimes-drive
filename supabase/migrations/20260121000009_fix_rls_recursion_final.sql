-- ============================================================================
-- FIX RLS INFINITE RECURSION - FINAL FIX
-- Date: 2026-01-21
-- Priority: CRITICAL - Fixes infinite recursion on profiles table
-- 
-- Problem: RLS policies query the profiles table within their USING clauses,
--          causing infinite recursion when checking access.
-- 
-- Solution: Remove ALL queries to profiles table from RLS policies.
--           Use ONLY JWT claims and auth.role() checks.
-- ============================================================================

-- ============================================================================
-- 1. DROP ALL EXISTING RECURSIVE POLICIES ON PROFILES
-- ============================================================================

-- Drop all policies that might query profiles table
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "pr_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- ============================================================================
-- 2. CREATE NON-RECURSIVE ADMIN POLICY (JWT ONLY, NO TABLE QUERIES)
-- ============================================================================

-- Admin policy using ONLY JWT claims and service_role (NO profiles table queries)
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    -- Service role bypass (for triggers/functions)
    auth.role() = 'service_role'
    -- JWT claim checks (set by application, no recursion)
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin', 'superadmin', 'editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin', 'superadmin', 'editor')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin', 'superadmin', 'editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin', 'superadmin', 'editor')
  );

-- ============================================================================
-- 3. CREATE USER SELF-ACCESS POLICIES (NO RECURSION)
-- ============================================================================

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "pr_read_self" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "pr_update_self" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for signup)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "pr_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- 4. CREATE PUBLIC READ POLICY (for public profiles)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_anon_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 5. SERVICE ROLE POLICY (for triggers/functions)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;
CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. FIX VERIFICATION_REQUESTS POLICIES (remove profiles queries)
-- ============================================================================

DROP POLICY IF EXISTS "verification_requests_select_admin" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_update_admin" ON public.verification_requests;

-- Admin can see all verification requests (JWT only, no profiles query)
CREATE POLICY "verification_requests_select_admin" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
  );

CREATE POLICY "verification_requests_update_admin" ON public.verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
  );

-- Users can see their own verification requests
DROP POLICY IF EXISTS "verification_requests_select_own" ON public.verification_requests;
CREATE POLICY "verification_requests_select_own" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. FIX OFFERS POLICIES (remove profiles queries)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'offers'
    ) THEN
        -- Drop old policies
        EXECUTE 'DROP POLICY IF EXISTS "offers_admin_all" ON public.offers';
        EXECUTE 'DROP POLICY IF EXISTS "of_admin_all" ON public.offers';
        
        -- Create new non-recursive admin policy
        EXECUTE '
        CREATE POLICY "offers_admin_all" ON public.offers
          FOR ALL
          TO authenticated
          USING (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR COALESCE(auth.jwt()->>''system_role'', '''') IN (''admin'',''superadmin'',''editor'')
          )
          WITH CHECK (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR COALESCE(auth.jwt()->>''system_role'', '''') IN (''admin'',''superadmin'',''editor'')
          )';
        
        RAISE NOTICE '✅ Fixed offers table RLS policies';
    END IF;
END $$;

-- ============================================================================
-- 8. UPDATE is_admin_user() FUNCTION (use SECURITY DEFINER to bypass RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS, so it's safe to query profiles
STABLE
SET search_path = public
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_role text;
BEGIN
    -- Service role always admin
    IF auth.role() = 'service_role' THEN
        RETURN true;
    END IF;
    
    -- Check JWT claims first (no recursion)
    IF COALESCE((auth.jwt()->>'is_admin')::boolean, false) THEN
        RETURN true;
    END IF;
    
    IF COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor') THEN
        RETURN true;
    END IF;
    
    IF COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor') THEN
        RETURN true;
    END IF;
    
    -- Only query profiles if JWT claims don't work (SECURITY DEFINER bypasses RLS)
    IF v_uid IS NOT NULL THEN
        SELECT COALESCE(role, system_role) INTO v_role
        FROM public.profiles
        WHERE id = v_uid;
        
        IF v_role IN ('admin', 'superadmin', 'editor') THEN
            RETURN true;
        END IF;
    END IF;
    
    RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- ============================================================================
-- 9. VERIFICATION QUERIES
-- ============================================================================

-- Check all policies on profiles (should show no recursive queries)
SELECT 
    policyname,
    CASE 
        WHEN qual::text LIKE '%profiles%' OR qual::text LIKE '%FROM public.profiles%' 
        THEN '⚠️ RECURSIVE'
        WHEN qual::text LIKE '%EXISTS%SELECT%profiles%' 
        THEN '⚠️ RECURSIVE'
        ELSE '✅ SAFE'
    END as status,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- All RLS policies now use ONLY JWT claims and auth.role() checks.
-- NO queries to profiles table within RLS policies = NO RECURSION
-- 
-- IMPORTANT NOTES:
-- 1. This fixes the infinite recursion error immediately
-- 2. Users can still access their own profiles (id = auth.uid())
-- 3. Admin access via JWT claims requires your application to set:
--    - auth.jwt()->>'is_admin' = true
--    - auth.jwt()->>'user_role' = 'admin'/'superadmin'/'editor'
--    - auth.jwt()->>'system_role' = 'admin'/'superadmin'/'editor'
-- 4. If JWT claims aren't set, admins can still use service_role
-- 5. The is_admin_user() function can still query profiles safely
--    (uses SECURITY DEFINER to bypass RLS)
-- ============================================================================

