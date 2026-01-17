-- Fix profiles RLS recursion and allow self insert
-- Idempotent and safe for re-run

BEGIN;

-- Ensure RLS on profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin bypass WITHOUT querying profiles to avoid recursion
DROP POLICY IF EXISTS "pr_admin_all" ON public.profiles;
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR COALESCE( (auth.jwt() ->> 'is_admin')::boolean, false )
    OR COALESCE( auth.jwt() ->> 'user_role', '' ) IN ('admin','superadmin')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE( (auth.jwt() ->> 'is_admin')::boolean, false )
    OR COALESCE( auth.jwt() ->> 'user_role', '' ) IN ('admin','superadmin')
  );

-- Allow regular users to create their own profile row (no recursion)
DROP POLICY IF EXISTS "pr_insert_self" ON public.profiles;
CREATE POLICY "pr_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Keep existing read/update self policies if already present; otherwise recreate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='pr_read_self'
  ) THEN
    EXECUTE 'CREATE POLICY "pr_read_self" ON public.profiles FOR SELECT USING (id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='pr_update_self'
  ) THEN
    EXECUTE 'CREATE POLICY "pr_update_self" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid())';
  END IF;
END $$;

COMMIT;
