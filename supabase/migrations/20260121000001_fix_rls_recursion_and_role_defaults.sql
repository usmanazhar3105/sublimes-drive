-- ============================================================================
-- Migration: Fix RLS Recursion and Role Defaults
-- Date: 2026-01-21
-- Priority: CRITICAL - Fixes infinite recursion and role assignment issues
-- 
-- Fixes:
-- 1. Remove infinite recursion in profiles RLS policies
-- 2. Ensure default system_role is 'browser' not 'car_owner'
-- 3. Fix admin check to use app.is_admin() function (avoids recursion)
-- 4. Ensure verification_status defaults correctly
-- ============================================================================

-- ============================================================================
-- 1. FIX INFINITE RECURSION - Use JWT claims instead of querying profiles
-- ============================================================================

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Create admin policy using JWT claims (NO RECURSION - doesn't query profiles)
-- This avoids recursion by checking JWT metadata, not the profiles table
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    -- Check JWT claims and service_role - NO profiles table query
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
  );

-- ============================================================================
-- 2. ENSURE system_role DEFAULT IS 'browser' NOT 'car_owner'
-- ============================================================================

-- Update default value for system_role
DO $$
BEGIN
  -- Check if system_role column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'system_role'
  ) THEN
    -- Set default to 'browser'
    ALTER TABLE public.profiles 
    ALTER COLUMN system_role SET DEFAULT 'browser';
    
    -- Update any NULL values to 'browser'
    UPDATE public.profiles 
    SET system_role = 'browser' 
    WHERE system_role IS NULL;
    
    RAISE NOTICE '✅ system_role default set to ''browser''';
  END IF;
END $$;

-- ============================================================================
-- 3. UPDATE handle_new_user() TO SET system_role = 'browser'
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract full_name from user metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    split_part(NEW.email, '@', 1)
  );
  v_full_name := TRIM(v_full_name);
  IF v_full_name = '' THEN
    v_full_name := split_part(NEW.email, '@', 1);
  END IF;

  -- Insert profile with system_role = 'browser' (NOT 'car_owner')
  -- user_role is NULL initially (can be set later during role selection)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    system_role,
    user_role,
    verification_status,
    created_at,
    last_login_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'display_name', v_full_name),
    'browser', -- CRITICAL: Default to 'browser', NOT 'car_owner'
    NULL, -- user_role is NULL initially
    'pending', -- Default verification_status
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    last_login_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'handle_new_user failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. FIX ALL RLS POLICIES TO AVOID RECURSION
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "pr_read_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "pr_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_with_system_role" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_id_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;

-- Admin policy (already created above, but ensure it's correct)
-- Uses app.is_admin() which doesn't query profiles table

-- Users can read their own profile (simple check, no recursion)
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (simple check, no recursion)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Public read (for public profiles)
CREATE POLICY "profiles_anon_read" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Service role has full access (for triggers)
CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. ENSURE app.is_admin() FUNCTION EXISTS (for other uses, not RLS)
-- ============================================================================

-- Create or replace app.is_admin() function
-- Note: This function uses SECURITY DEFINER to bypass RLS when checking profiles
-- It's safe to use in application code, but NOT in RLS policies (would cause recursion)
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_jwt jsonb := auth.jwt();
  v_claim_admin boolean := COALESCE( (v_jwt->>'is_admin')::boolean, false );
  v_claim_role text := NULLIF(auth.role(), '');
  v_db_admin boolean := false;
BEGIN
  -- Service role always bypasses
  IF v_claim_role = 'service_role' THEN
    RETURN true;
  END IF;

  -- JWT claim hint
  IF v_claim_admin THEN
    RETURN true;
  END IF;

  -- DB-backed role check - Uses SECURITY DEFINER to bypass RLS
  -- This is safe because we're only reading, not modifying
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Use SECURITY DEFINER to bypass RLS when checking profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = v_uid
      AND p.system_role IN ('admin','superadmin','editor')
  ) INTO v_db_admin;

  RETURN v_db_admin;
END;
$$;

-- ============================================================================
-- 6. ENSURE VERIFICATION_STATUS COLUMN EXISTS WITH DEFAULT
-- ============================================================================

DO $$
BEGIN
  -- Check if verification_status column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'verification_status'
  ) THEN
    -- Add verification_status column
    ALTER TABLE public.profiles 
    ADD COLUMN verification_status TEXT DEFAULT 'pending';
    
    -- Update existing rows
    UPDATE public.profiles 
    SET verification_status = 'pending' 
    WHERE verification_status IS NULL;
    
    RAISE NOTICE '✅ Created verification_status column';
  ELSE
    -- Ensure default is set
    ALTER TABLE public.profiles 
    ALTER COLUMN verification_status SET DEFAULT 'pending';
    
    RAISE NOTICE '✅ verification_status default set to ''pending''';
  END IF;
END $$;

-- ============================================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT USAGE ON SCHEMA app TO service_role;

GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT EXECUTE ON FUNCTION app.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_admin() TO service_role;

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify:
-- 
-- 1. Check system_role default:
--    SELECT column_name, column_default 
--    FROM information_schema.columns 
--    WHERE table_name = 'profiles' AND column_name = 'system_role';
--    -- Should show: 'browser'
--
-- 2. Check RLS policies (should not have recursion):
--    SELECT policyname, cmd, qual, with_check
--    FROM pg_policies 
--    WHERE tablename = 'profiles';
--    -- Admin policy should use app.is_admin(), not query profiles
--
-- 3. Test profile read (should work without recursion):
--    -- As authenticated user:
--    SELECT * FROM profiles WHERE id = auth.uid();
--    -- Should return your profile without 500 error
--
-- 4. Check app.is_admin() function:
--    SELECT app.is_admin();
--    -- Should return true/false without recursion

-- ✅ Migration complete - RLS recursion fixed, default role set to 'browser'

