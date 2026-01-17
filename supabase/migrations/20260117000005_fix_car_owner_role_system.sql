-- ============================================================================
-- Migration: Fix Car Owner Role System
-- Date: 2026-01-17
-- Purpose: Ensure car_owner role works properly and subscribers can become car owners
-- ============================================================================

-- ============================================================================
-- 1. Update role CHECK constraint to include car_owner
-- ============================================================================

DO $$
BEGIN
  -- Check if profiles table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Drop existing role constraint if it exists
    IF EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conrelid = 'public.profiles'::regclass 
      AND conname LIKE '%role%check%'
    ) THEN
      -- Get constraint name
      DECLARE
        constraint_name TEXT;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
        AND conname LIKE '%role%check%'
        LIMIT 1;
        
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE '✅ Dropped existing role constraint';
      END;
    END IF;
    
    -- Create new constraint that includes car_owner
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'editor', 'subscriber', 'moderator', 'car_owner', 'garage_owner', 'vendor', 'browser'));
    
    RAISE NOTICE '✅ Created role constraint with car_owner support';
  END IF;
END $$;

-- ============================================================================
-- 2. Create function to upgrade subscriber to car_owner
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_upgrade_to_car_owner(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Update profile role to car_owner
  UPDATE public.profiles
  SET role = 'car_owner',
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- If profile doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role)
    VALUES (p_user_id, 'car_owner')
    ON CONFLICT (id) DO UPDATE SET
      role = 'car_owner',
      updated_at = NOW();
  END IF;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to upgrade user to car_owner: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_upgrade_to_car_owner(UUID) TO authenticated;

-- ============================================================================
-- 3. Ensure car_owner has same permissions as subscriber
-- ============================================================================

-- Car owners should have all subscriber permissions (already handled by authenticated role)
-- But let's verify RLS policies allow car_owner to create posts, comments, etc.

-- Posts: Already handled by authenticated role (from previous migrations)
-- Comments: Already handled by authenticated role (from previous migrations)
-- Likes: Already handled by authenticated role (from previous migrations)

-- ============================================================================
-- 4. Create view for easy role checking
-- ============================================================================

CREATE OR REPLACE VIEW public.user_roles_view AS
SELECT 
  id,
  email,
  display_name,
  role,
  CASE 
    WHEN role = 'admin' THEN true
    WHEN role = 'editor' THEN true
    ELSE false
  END AS is_admin,
  CASE 
    WHEN role = 'car_owner' THEN true
    ELSE false
  END AS is_car_owner,
  CASE 
    WHEN role = 'garage_owner' THEN true
    ELSE false
  END AS is_garage_owner,
  CASE 
    WHEN role = 'vendor' THEN true
    ELSE false
  END AS is_vendor,
  created_at,
  updated_at
FROM public.profiles;

-- Grant select to authenticated users
GRANT SELECT ON public.user_roles_view TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify:
--
-- 1. Check role constraint:
--    SELECT conname, pg_get_constraintdef(oid) 
--    FROM pg_constraint 
--    WHERE conrelid = 'public.profiles'::regclass 
--    AND conname LIKE '%role%';
--
-- 2. Test upgrade function:
--    SELECT public.fn_upgrade_to_car_owner(auth.uid());
--    SELECT role FROM profiles WHERE id = auth.uid();
--    -- Should show role = 'car_owner'
--
-- 3. Check view:
--    SELECT * FROM user_roles_view WHERE id = auth.uid();

-- ✅ Migration complete - Car owner role system is ready



