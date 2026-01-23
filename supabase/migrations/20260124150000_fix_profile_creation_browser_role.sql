-- Migration: Fix profile creation for new users
-- Description: Updates DEFAULT role to 'browser' and ensures display_name/username are set

-- 1. Fix the DEFAULT role
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'browser';

-- 2. Update any existing 'subscriber' roles to 'browser'
UPDATE public.profiles 
SET role = 'browser' 
WHERE role = 'subscriber' OR role IS NULL;

-- 3. Update the trigger function to set display_name and username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
BEGIN
  -- Extract full_name from user metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    split_part(NEW.email, '@', 1)
  );
  v_full_name := TRIM(v_full_name);
  IF v_full_name = '' THEN
    v_full_name := split_part(NEW.email, '@', 1);
  END IF;

  -- Generate username from email
  v_username := LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_'));

  -- Insert profile with display_name and username
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    username,
    created_at,
    last_login_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'display_name', v_full_name),
    v_username,
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    username = COALESCE(NULLIF(EXCLUDED.username, ''), profiles.username),
    last_login_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'handle_new_user failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;
