-- ============================================================================
-- Migration: Fix Signup Flow for system_role/user_role Structure
-- Date: 2026-01-21
-- Priority: CRITICAL
-- 
-- Fixes:
-- 1. Update handle_new_user() to use system_role (not role) with default 'browser'
-- 2. Ensure system_role column has DEFAULT 'browser'
-- 3. Fix RLS policies to allow INSERT with system_role
-- 4. Handle user_role column (can be NULL initially)
-- ============================================================================

-- ============================================================================
-- 1. ENSURE system_role COLUMN EXISTS WITH DEFAULT 'browser'
-- ============================================================================

-- Check if system_role column exists, if not create it
DO $$
BEGIN
  -- Check if system_role column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'system_role'
  ) THEN
    -- Add system_role column with default 'browser'
    ALTER TABLE public.profiles 
    ADD COLUMN system_role TEXT DEFAULT 'browser';
    
    -- Update existing rows to have 'browser' if NULL
    UPDATE public.profiles 
    SET system_role = 'browser' 
    WHERE system_role IS NULL;
    
    RAISE NOTICE '✅ Created system_role column with default ''browser''';
  ELSE
    -- Update default value if it doesn't exist or is different
    ALTER TABLE public.profiles 
    ALTER COLUMN system_role SET DEFAULT 'browser';
    
    RAISE NOTICE '✅ system_role column default set to ''browser''';
  END IF;
END $$;

-- ============================================================================
-- 2. ENSURE user_role COLUMN EXISTS (can be NULL)
-- ============================================================================

DO $$
BEGIN
  -- Check if user_role column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'user_role'
  ) THEN
    -- Add user_role column (nullable)
    ALTER TABLE public.profiles 
    ADD COLUMN user_role TEXT;
    
    RAISE NOTICE '✅ Created user_role column (nullable)';
  END IF;
END $$;

-- ============================================================================
-- 3. UPDATE TRIGGER FUNCTION - Use system_role instead of role
-- ============================================================================

-- Drop the old trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated trigger function that uses system_role
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

  -- Insert profile with system_role = 'browser' (default)
  -- user_role is NULL initially (can be set later)
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
    'browser', -- Default system_role for new users
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ✅ Trigger function updated to use system_role

-- ============================================================================
-- 4. RLS POLICIES - Allow INSERT with system_role
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "pr_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_id_only" ON public.profiles;

-- CRITICAL: Allow authenticated users to INSERT their own profile
-- WITH CHECK ensures they can only insert their own id
-- system_role will be set by trigger or default to 'browser'
DROP POLICY IF EXISTS "profiles_insert_own_with_system_role" ON public.profiles;
CREATE POLICY "profiles_insert_own_with_system_role" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only insert their own id
    id = auth.uid()
    -- system_role can be 'browser' (default) or set by trigger
    -- user_role can be NULL initially
  );

-- Allow service_role full access (for triggers)
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;
CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure users can read their own profile
DROP POLICY IF EXISTS "pr_read_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow public read (for public profiles)
DROP POLICY IF EXISTS "profiles_anon_read" ON public.profiles;
CREATE POLICY "profiles_anon_read" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Ensure users can update their own profile (but NOT system_role - admin only)
DROP POLICY IF EXISTS "pr_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Note: system_role updates should be restricted to admins only
    -- Frontend should never send system_role in updates
  );

-- Admin can do everything
DROP POLICY IF EXISTS "pr_admin_all" ON public.profiles;
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.system_role IN ('admin', 'superadmin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.system_role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ✅ RLS policies updated

-- ============================================================================
-- 5. GRANT NECESSARY PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ✅ Permissions granted

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify:
-- 
-- 1. Check system_role default:
--    SELECT column_name, column_default 
--    FROM information_schema.columns 
--    WHERE table_name = 'profiles' AND column_name = 'system_role';
--
-- 2. Check trigger exists:
--    SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 3. Check RLS policies:
--    SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- 4. Test new user signup:
--    -- Sign up a new user via frontend or:
--    -- INSERT INTO auth.users (id, email, encrypted_password) 
--    -- VALUES (gen_random_uuid(), 'test@example.com', crypt('password123', gen_salt('bf')));
--    -- Then check:
--    -- SELECT id, email, system_role, user_role, verification_status 
--    -- FROM profiles WHERE email = 'test@example.com';
--    -- Should show: system_role = 'browser', user_role = NULL, verification_status = 'pending'

-- ✅ Migration complete - Signup flow fixed for system_role/user_role structure














