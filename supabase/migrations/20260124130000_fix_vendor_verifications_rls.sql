-- Migration: Fix vendor_verifications RLS - Add INSERT Policy
-- Description: Allows authenticated users to insert their own vendor verification requests

-- Add INSERT policy for vendor_verifications
DROP POLICY IF EXISTS "vendor_verif_owner_insert" ON public.vendor_verifications;

CREATE POLICY "vendor_verif_owner_insert"
  ON public.vendor_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also add UPDATE policy so users can update their pending requests
DROP POLICY IF EXISTS "vendor_verif_owner_update" ON public.vendor_verifications;

CREATE POLICY "vendor_verif_owner_update"
  ON public.vendor_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Add admin policies for full access
DROP POLICY IF EXISTS "vendor_verif_admin_all" ON public.vendor_verifications;

CREATE POLICY "vendor_verif_admin_all"
  ON public.vendor_verifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );
