-- Migration: Fix profiles_sub_role_check constraint
-- Description: Updates the sub_role check constraint to include 'vendor' and other roles

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check;

-- Re-add the constraint with all allowed values
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_sub_role_check 
    CHECK (sub_role IN ('admin', 'editor', 'car_owner', 'garage_owner', 'vendor', 'browser', 'ai_agent') OR sub_role IS NULL);

-- Also ensuring role check has 'vendor' (just in case)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'editor', 'car_owner', 'garage_owner', 'vendor', 'browser', 'ai_agent'));
