-- Fix: Add ai_agent to allowed roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'editor', 'subscriber', 'moderator', 'car_browser', 'car_owner', 'garage_owner', 'ai_agent'));
