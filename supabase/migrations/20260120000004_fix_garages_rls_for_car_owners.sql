-- Migration: Fix RLS policies for garages to allow car owners to view all approved garages
-- Date: 2026-01-20
-- Purpose: Ensure car owners can see all approved garages in Garage Hub

-- ============================================================================
-- 1. ENSURE RLS IS ENABLED
-- ============================================================================

ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "garages_select" ON public.garages;
DROP POLICY IF EXISTS "garages_public_read" ON public.garages;
DROP POLICY IF EXISTS "garages_read_approved" ON public.garages;
DROP POLICY IF EXISTS "garages_read_auth" ON public.garages;

-- ============================================================================
-- 3. CREATE COMPREHENSIVE SELECT POLICY
-- ============================================================================

-- Allow all authenticated users (including car owners) to view approved garages
-- Also allow garage owners to view their own garages regardless of status
CREATE POLICY "garages_select_approved_and_own" ON public.garages
  FOR SELECT TO authenticated
  USING (
    -- Show approved garages to everyone
    status = 'approved' 
    OR 
    -- Show garage owner their own garages (any status)
    owner_id = auth.uid()
    OR
    -- Fallback: if status column doesn't exist, show all (for schema compatibility)
    NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'garages' 
      AND column_name = 'status'
    )
  );

-- ============================================================================
-- 4. ENSURE INSERT/UPDATE/DELETE POLICIES EXIST
-- ============================================================================

-- Insert: Only garage owners can create garages
DROP POLICY IF EXISTS "garages_insert" ON public.garages;
CREATE POLICY "garages_insert" ON public.garages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Update: Garage owners can update their own garages
DROP POLICY IF EXISTS "garages_update" ON public.garages;
CREATE POLICY "garages_update" ON public.garages
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Delete: Garage owners can delete their own garages
DROP POLICY IF EXISTS "garages_delete" ON public.garages;
CREATE POLICY "garages_delete" ON public.garages
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- ============================================================================
-- 5. VERIFICATION QUERY
-- ============================================================================

-- Uncomment to verify policies:
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE schemaname = 'public' 
--   AND tablename = 'garages'
-- ORDER BY policyname;



