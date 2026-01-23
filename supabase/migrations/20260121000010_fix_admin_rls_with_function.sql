-- ============================================================================
-- FIX ADMIN RLS - Use SECURITY DEFINER Function for Admin Check
-- Date: 2026-01-21
-- Priority: CRITICAL - Allows admin to see all users without JWT claims
-- 
-- Problem: Admin can't see all users because JWT claims aren't set.
-- Solution: Use a SECURITY DEFINER function in RLS policy to safely check
--           admin status from profiles table (bypasses RLS, no recursion).
-- ============================================================================

-- ============================================================================
-- 1. CREATE SECURITY DEFINER FUNCTION FOR ADMIN CHECK (Safe for RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- Bypasses RLS when checking profiles
STABLE
SET search_path = public
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_role text;
    v_system_role text;
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
    
    -- Query profiles table (SECURITY DEFINER bypasses RLS, no recursion)
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

GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon;

-- ============================================================================
-- 2. UPDATE PROFILES RLS POLICIES TO USE FUNCTION
-- ============================================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "pr_admin_all" ON public.profiles;

-- Create new admin policy using the function (no recursion, works without JWT)
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    -- Service role bypass
    auth.role() = 'service_role'
    -- JWT claims (if set)
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin', 'superadmin', 'editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin', 'superadmin', 'editor')
    -- Function check (SECURITY DEFINER, no recursion)
    OR public.check_is_admin() = true
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin', 'superadmin', 'editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin', 'superadmin', 'editor')
    OR public.check_is_admin() = true
  );

-- ============================================================================
-- 3. UPDATE VERIFICATION_REQUESTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "verification_requests_select_admin" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_update_admin" ON public.verification_requests;

CREATE POLICY "verification_requests_select_admin" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
    OR public.check_is_admin() = true
  );

CREATE POLICY "verification_requests_update_admin" ON public.verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
    OR public.check_is_admin() = true
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
    OR public.check_is_admin() = true
  );

-- ============================================================================
-- 4. UPDATE OFFERS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'offers'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "offers_admin_all" ON public.offers';
        EXECUTE 'DROP POLICY IF EXISTS "of_admin_all" ON public.offers';
        
        EXECUTE '
        CREATE POLICY "offers_admin_all" ON public.offers
          FOR ALL
          TO authenticated
          USING (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR COALESCE(auth.jwt()->>''system_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR public.check_is_admin() = true
          )
          WITH CHECK (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR COALESCE(auth.jwt()->>''system_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR public.check_is_admin() = true
          )';
        
        RAISE NOTICE '✅ Fixed offers table RLS policies';
    END IF;
END $$;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Test the function
SELECT 
    'Function Test' as test_name,
    public.check_is_admin() as is_admin_result,
    auth.uid() as current_user_id;

-- Check policies
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual::text LIKE '%check_is_admin%' THEN '✅ Uses function (safe)'
        WHEN qual::text LIKE '%profiles%' AND qual::text NOT LIKE '%check_is_admin%' 
        THEN '⚠️ Direct profiles query (risky)'
        ELSE '✅ Safe'
    END as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Admin can now see all users and verification requests even without JWT claims.
-- The check_is_admin() function uses SECURITY DEFINER to safely query profiles
-- without causing recursion.
-- ============================================================================

