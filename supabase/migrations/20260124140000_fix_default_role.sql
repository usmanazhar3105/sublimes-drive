-- Migration: Fix profiles default role
-- Description: Ensures new users get 'browser' role by default

-- Set the DEFAULT value for role column to 'browser'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'browser';

-- Also ensure any NULL roles are converted to 'browser'
UPDATE public.profiles 
SET role = 'browser' 
WHERE role IS NULL;
