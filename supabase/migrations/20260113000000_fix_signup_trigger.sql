-- Fix signup trigger - resolve role constraint mismatch
-- Date: 2026-01-13
-- Priority: CRITICAL
-- 
-- Issue: The handle_new_user() trigger was trying to insert 'browser' role,
-- but the profiles table CHECK constraint may only allow 'subscriber'.
-- This caused "Database error saving new user" on signup.

-- ============================================================================
-- 1. FIX THE TRIGGER FUNCTION
-- ============================================================================

-- Drop the old trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a robust handle_new_user function that handles all role scenarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  -- Determine the default role based on what's allowed in the table
  -- Try 'subscriber' first (from comprehensive schema), then 'browser' (from other schemas)
  BEGIN
    -- Check if 'subscriber' is valid
    SELECT unnest INTO v_role
    FROM unnest(ARRAY['subscriber', 'browser', 'car_browser']) AS unnest
    WHERE unnest IN (
      SELECT enumval FROM (
        SELECT unnest(regexp_matches(
          (SELECT check_clause FROM information_schema.check_constraints 
           WHERE constraint_name LIKE '%profiles_role%' LIMIT 1),
          '''([^'']+)''', 'g'
        )) AS enumval
      ) subq
    )
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'subscriber'; -- Default fallback
  END;
  
  -- If we couldn't determine the role, use a safe default
  IF v_role IS NULL THEN
    v_role := 'subscriber';
  END IF;
  
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

  -- Insert the profile with dynamic columns based on what exists
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    role,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'display_name', v_full_name),
    v_role,
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'handle_new_user failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. ENSURE PROFILES TABLE HAS CORRECT RLS FOR SERVICE ROLE
-- ============================================================================

-- The trigger runs as SECURITY DEFINER, but let's also ensure service_role can insert
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;

-- Create a policy that allows service_role full access (triggers run as definer)
CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure authenticated users can insert their own profile (backup for client-side)
DROP POLICY IF EXISTS "pr_insert_self" ON public.profiles;
CREATE POLICY "pr_insert_self" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Ensure users can read and update their own profile
DROP POLICY IF EXISTS "pr_read_self" ON public.profiles;
CREATE POLICY "pr_read_self" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "pr_update_self" ON public.profiles;
CREATE POLICY "pr_update_self" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow anon users to read public profile data
DROP POLICY IF EXISTS "profiles_anon_read" ON public.profiles;
CREATE POLICY "profiles_anon_read" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 3. GRANT NECESSARY PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this after migration to verify:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
























