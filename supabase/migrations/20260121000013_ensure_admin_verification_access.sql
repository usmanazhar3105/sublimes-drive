-- ============================================================================
-- ENSURE ADMIN ACCESS TO VERIFICATION REQUESTS
-- Date: 2026-01-21
-- Priority: CRITICAL - Fixes admin not seeing verification requests
-- 
-- Problem: Admin can't see verification requests despite data existing.
-- Solution: Ensure RLS policies allow admin access using check_is_admin()
-- ============================================================================

-- ============================================================================
-- 1. ENSURE check_is_admin() FUNCTION EXISTS
-- ============================================================================

-- Create or replace the function (from migration 20260121000010)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
-- 2. DROP ALL EXISTING VERIFICATION_REQUESTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "verification_requests_select_admin" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_update_admin" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_select_own" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_insert_own" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_update_own" ON public.verification_requests;

-- ============================================================================
-- 3. CREATE COMPREHENSIVE RLS POLICIES
-- ============================================================================

-- Admin can see ALL verification requests
CREATE POLICY "verification_requests_select_admin" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    -- Service role bypass
    auth.role() = 'service_role'
    -- JWT claims (if set)
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
    -- Function check (SECURITY DEFINER, no recursion)
    OR public.check_is_admin() = true
  );

-- Admin can update ALL verification requests
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

-- Users can see their own verification requests
CREATE POLICY "verification_requests_select_own" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own verification requests
CREATE POLICY "verification_requests_insert_own" ON public.verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests
CREATE POLICY "verification_requests_update_own" ON public.verification_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT SELECT ON public.verification_requests TO anon;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Test admin access
SELECT 
    'Admin Access Test' as test_name,
    public.check_is_admin() as is_admin,
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- Count verification requests admin should see
SELECT 
    'Verification Requests Count' as test_name,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE verification_type = 'vehicle') as vehicle_requests,
    COUNT(*) FILTER (WHERE verification_type = 'garage') as garage_requests,
    COUNT(*) FILTER (WHERE verification_type = 'vendor') as vendor_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests
FROM public.verification_requests;

-- Test actual query (what component does)
SELECT 
    vr.id,
    vr.verification_type,
    vr.status,
    vr.submitted_at,
    p.email as user_email,
    p.display_name as user_name
FROM public.verification_requests vr
LEFT JOIN public.profiles p ON p.id = vr.user_id
WHERE vr.verification_type = 'vehicle'
ORDER BY vr.submitted_at DESC
LIMIT 5;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Admin should now be able to see all verification requests.
-- The check_is_admin() function uses SECURITY DEFINER to safely check
-- admin status without causing recursion.
-- ============================================================================

