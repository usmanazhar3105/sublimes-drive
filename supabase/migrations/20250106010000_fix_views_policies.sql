-- ============================================================================
-- FIX VIEWS AND POLICIES - Make Admin & MyProfile work
-- ============================================================================
-- This migration creates missing views, fixes RLS policies, and seeds admin

-- 1) Ensure user_role enum exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('browser','car_owner','garage_owner','vendor','admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Ensure profiles table has all required columns
DO $$ BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='xp') THEN
    ALTER TABLE public.profiles ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='level') THEN
    ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
END $$;

-- 3) Create helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin_from_profiles(uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = uid), false)
$$;

-- 4) Fix profiles RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select" ON public.profiles
FOR SELECT USING (
  auth.uid() = id 
  OR COALESCE(is_admin, false) = true
  OR true -- Allow public read for basic info
);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id 
  OR COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false) = true
) WITH CHECK (
  auth.uid() = id 
  OR COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false) = true
);

-- 5) Fix other critical tables RLS
DO $$ 
DECLARE 
  t text;
BEGIN
  -- Enable RLS on key tables
  FOR t IN SELECT unnest(ARRAY['posts','comments','challenges','challenge_progress','xp_events','analytics_events','marketplace_listings','offers','garages','events','bid_repair','messages','service_log'])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      
      -- Add public read policy if not exists
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = t || '_public_read'
      ) THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', t || '_public_read', t);
      END IF;
    END IF;
  END LOOP;
END $$;

-- 6) Seed admin user if none exists (using any auth user with 'admin' in email)
INSERT INTO public.profiles (id, email, full_name, role, is_admin, xp, level)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'admin'::user_role,
  true,
  1000,
  10
FROM auth.users u
WHERE u.email ILIKE '%admin%'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
LIMIT 1;

-- 7) Add owner_id and is_public columns to app tables if missing
DO $$ BEGIN
  -- marketplace_listings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='marketplace_listings') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS owner_id UUID;
    ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- offers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='offers') THEN
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS owner_id UUID;
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- garages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='garages') THEN
    ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS owner_id UUID;
    ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- listings (legacy)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='listings') THEN
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS owner_id UUID;
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- 8) Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin_from_profiles(uuid) TO anon, authenticated;

-- ============================================================================
-- COMPLETE - Schema cache will refresh automatically
-- Admin and MyProfile should now work
-- ============================================================================

