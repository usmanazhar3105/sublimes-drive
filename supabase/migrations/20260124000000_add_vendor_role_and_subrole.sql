-- Migration: Add 'vendor' role, handle legacy data, and ensure sub_role column
-- Description: Fixes existing data violations (subscriber/null -> browser) and updates role constraint.

-- 1. DATA FIX: Convert legacy 'subscriber' and NULL roles to 'browser'
-- We do this BEFORE changing the constraint to avoid violations.
UPDATE public.profiles 
SET role = 'browser' 
WHERE role = 'subscriber' OR role IS NULL;

-- 2. Add sub_role column if it doesn't exist (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sub_role') THEN
        ALTER TABLE public.profiles ADD COLUMN sub_role TEXT;
    END IF;
END $$;

-- 3. Update the check constraint for 'role'
-- We include 'vendor' (new) and 'ai_agent' (found in DB) to the allowed list.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'editor', 'car_owner', 'garage_owner', 'vendor', 'browser', 'ai_agent'));

-- 4. Index for sub_role queries
CREATE INDEX IF NOT EXISTS idx_profiles_sub_role ON public.profiles(sub_role);
