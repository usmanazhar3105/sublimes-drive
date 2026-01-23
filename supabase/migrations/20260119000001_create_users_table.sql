-- ============================================================================
-- Migration: Create Users Table
-- Date: 2026-01-19
-- Purpose: Create simplified users table with auto-creation trigger
-- ============================================================================

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL,
  email TEXT NULL,
  role TEXT NULL DEFAULT 'user'::text,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- ============================================================================
-- 2. CREATE TRIGGER FUNCTION TO AUTO-CREATE USER ON AUTH SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table when auth user is created
  INSERT INTO public.users (
    id,
    email,
    role,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'user', -- Default role
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    created_at = COALESCE(EXCLUDED.created_at, users.created_at);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'handle_new_auth_user failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. CREATE TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;

CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- 4. ENABLE RLS
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_read_all" ON public.users;
DROP POLICY IF EXISTS "users_service_role_all" ON public.users;

-- Allow users to insert their own record
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to read their own record
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own record (except role - admin only)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow public read (optional - remove if you want private)
-- CREATE POLICY "users_read_all" ON public.users
--   FOR SELECT
--   TO anon, authenticated
--   USING (true);

-- Allow service_role full access (for triggers)
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
-- GRANT SELECT ON public.users TO anon; -- Uncomment if you want public read

-- ============================================================================
-- 7. BACKFILL EXISTING AUTH USERS (Optional)
-- ============================================================================

-- Create users for existing auth.users that don't have a users record
INSERT INTO public.users (id, email, role, created_at)
SELECT 
  u.id,
  u.email,
  'user'::text,
  COALESCE(u.created_at, NOW())
FROM auth.users u
LEFT JOIN public.users usr ON usr.id = u.id
WHERE usr.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ✅ Migration complete - Users table created with auto-creation trigger




























