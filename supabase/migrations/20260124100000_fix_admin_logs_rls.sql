-- Migration: Allow Admin Insert on admin_logs
-- Description: Fixes 403 error when creating audit logs by adding missing INSERT policy.

-- 1. Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 2. Add INSERT policy for admins and editors
-- Drop first to allow re-running without error
DROP POLICY IF EXISTS "admin_logs_admin_insert" ON public.admin_logs;

CREATE POLICY "admin_logs_admin_insert"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- 3. Ensure SELECT policy also exists (idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' AND policyname = 'admin_logs_admin_read'
    ) THEN
        CREATE POLICY "admin_logs_admin_read"
          ON public.admin_logs
          FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'editor')
            )
          );
    END IF;
END $$;
