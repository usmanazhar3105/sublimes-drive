-- Migration: Fix invalid sub_role data and update constraint
-- Description: Cleans up invalid sub_role data first, then applies the new constraint

-- 1. Fix invalid sub_role data (reset to NULL)
UPDATE public.profiles
SET sub_role = NULL 
WHERE sub_role NOT IN ('admin', 'editor', 'car_owner', 'garage_owner', 'vendor', 'browser', 'ai_agent')
   OR sub_role = '';

-- 2. Drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check;

-- 3. Re-add the constraint with 'vendor' included
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_sub_role_check 
    CHECK (sub_role IN ('admin', 'editor', 'car_owner', 'garage_owner', 'vendor', 'browser', 'ai_agent') OR sub_role IS NULL);
