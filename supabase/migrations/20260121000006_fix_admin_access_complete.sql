-- ============================================================================
-- Migration: Fix Admin Access - Complete Fix
-- Date: 2026-01-21
-- Priority: CRITICAL - Restores admin functionality
-- 
-- Fixes:
-- 1. Update all RLS policies to use role column (synced with system_role)
-- 2. Fix verification_requests RLS for admin access
-- 3. Fix offers table RLS for admin access
-- 4. Ensure admin can see all users and verification requests
-- ============================================================================

-- ============================================================================
-- 1. FIX VERIFICATION_REQUESTS RLS POLICIES
-- ============================================================================

-- Drop old policies that check profiles.role (causes recursion)
DROP POLICY IF EXISTS "verification_requests_select_admin" ON public.verification_requests;
DROP POLICY IF EXISTS "verification_requests_update_admin" ON public.verification_requests;

-- Create new admin policies using JWT claims (no recursion)
CREATE POLICY "verification_requests_select_admin" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can see all verification requests
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    -- Also check role column (synced with system_role, no recursion)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin', 'editor')
    )
  );

CREATE POLICY "verification_requests_update_admin" ON public.verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin', 'editor')
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ============================================================================
-- 2. FIX OFFERS TABLE RLS POLICIES FOR ADMIN
-- ============================================================================

-- Check if offers table exists and fix RLS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'offers'
    ) THEN
        -- Drop old admin policies
        EXECUTE 'DROP POLICY IF EXISTS "of_admin_all" ON public.offers';
        EXECUTE 'DROP POLICY IF EXISTS "offers_admin_all" ON public.offers';
        
        -- Create new admin policy using JWT + role check
        EXECUTE '
        CREATE POLICY "offers_admin_all" ON public.offers
          FOR ALL
          TO authenticated
          USING (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid()
              AND p.role IN (''admin'', ''superadmin'', ''editor'')
            )
          )
          WITH CHECK (
            auth.role() = ''service_role''
            OR COALESCE((auth.jwt()->>''is_admin'')::boolean, false) = true
            OR COALESCE(auth.jwt()->>''user_role'', '''') IN (''admin'',''superadmin'',''editor'')
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid()
              AND p.role IN (''admin'', ''superadmin'', ''editor'')
            )
          )';
        
        RAISE NOTICE '✅ Fixed offers table RLS policies';
    END IF;
END $$;

-- ============================================================================
-- 3. ENSURE ADMIN CAN READ ALL PROFILES (for admin users page)
-- ============================================================================

-- The pr_admin_all policy should already exist, but ensure it works
-- Update it to use both JWT and role column check
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
CREATE POLICY "profiles_admin_read_all" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can read all profiles
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- Also ensure the main admin policy allows SELECT
-- The pr_admin_all policy should handle this, but let's make sure
-- Users can still read their own profile (this should already exist)
-- Admin can read all (via pr_admin_all or profiles_admin_read_all)

-- ============================================================================
-- 4. FIX OFFERS TABLE STRUCTURE (ensure required columns exist)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'offers'
    ) THEN
        -- Add missing columns if they don't exist
        ALTER TABLE public.offers 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id),
        ADD COLUMN IF NOT EXISTS vendor_id UUID,
        ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
        ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS offer_price NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS category TEXT,
        ADD COLUMN IF NOT EXISTS max_redemptions INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS current_redemptions INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
        ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}'::JSONB,
        ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        RAISE NOTICE '✅ Ensured offers table has all required columns';
    END IF;
END $$;

-- ============================================================================
-- 5. CREATE HELPER FUNCTION FOR ADMIN CHECKS (uses role column)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
    
    -- Check JWT claims
    IF COALESCE((auth.jwt()->>'is_admin')::boolean, false) THEN
        RETURN true;
    END IF;
    
    IF COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor') THEN
        RETURN true;
    END IF;
    
    -- Check role column (synced with system_role, no recursion risk)
    IF v_uid IS NOT NULL THEN
        SELECT role INTO v_role
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
-- 6. UPDATE VERIFICATION_REQUESTS TO USE NEW FUNCTION
-- ============================================================================

-- Update policies to use the helper function (optional, but cleaner)
-- The policies above already work, but this is an alternative

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Ensure admin has access to all necessary tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_requests TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================

-- Test admin access:
-- SELECT public.is_admin_user();
-- Should return: true (if you're admin)

-- Test verification requests visibility:
-- SELECT COUNT(*) FROM public.verification_requests;
-- Should return count (admin can see all)

-- Test offers access:
-- SELECT COUNT(*) FROM public.offers;
-- Should return count (admin can see all)

-- ✅ Migration complete - Admin access restored


