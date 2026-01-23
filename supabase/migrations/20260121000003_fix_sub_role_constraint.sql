-- ============================================================================
-- Migration: Fix sub_role/user_role CHECK Constraint
-- Date: 2026-01-21
-- Priority: CRITICAL - Fixes signup failures
-- 
-- Fixes:
-- 1. Drop or modify profiles_sub_role_check constraint to allow NULL
-- 2. Ensure user_role can be NULL (set during role selection)
-- 3. Fix any conflicting constraints
-- ============================================================================

-- ============================================================================
-- 1. CHECK WHAT CONSTRAINT EXISTS
-- ============================================================================

-- First, let's see what constraints exist
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND conname LIKE '%sub_role%' OR conname LIKE '%user_role%';

-- ============================================================================
-- 2. DROP ALL PROBLEMATIC CHECK CONSTRAINTS (FORCE DROP)
-- ============================================================================

-- Drop sub_role check constraint (doesn't allow NULL - causes signup failures)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check1;

-- Drop user_role check constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;

-- Drop any other variations
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass 
        AND (conname LIKE '%sub_role%' OR conname LIKE '%user_role%')
        AND contype = 'c'  -- CHECK constraint
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
        RAISE NOTICE '✅ Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- ============================================================================
-- 3. ENSURE user_role AND sub_role COLUMNS ALLOW NULL AND HAVE NO BAD DEFAULTS
-- ============================================================================

-- Make sure user_role column exists and allows NULL
DO $$
BEGIN
    -- Check if user_role column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_role'
    ) THEN
        -- Ensure it allows NULL
        ALTER TABLE public.profiles 
        ALTER COLUMN user_role DROP NOT NULL;
        
        -- Remove any default value (let it be NULL)
        ALTER TABLE public.profiles 
        ALTER COLUMN user_role DROP DEFAULT;
        
        RAISE NOTICE '✅ user_role column allows NULL, default removed';
    END IF;
    
    -- Also check sub_role (old column name)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'sub_role'
    ) THEN
        -- Ensure it allows NULL
        ALTER TABLE public.profiles 
        ALTER COLUMN sub_role DROP NOT NULL;
        
        -- Remove any default value that might violate constraint
        -- We'll let it be NULL, which is allowed by the constraint
        ALTER TABLE public.profiles 
        ALTER COLUMN sub_role DROP DEFAULT;
        
        RAISE NOTICE '✅ sub_role column allows NULL, default removed';
    END IF;
END $$;

-- ============================================================================
-- 4. CREATE FLEXIBLE CHECK CONSTRAINT THAT ALLOWS NULL
-- ============================================================================

-- Create a new, flexible constraint that allows NULL and valid values
-- This is critical - the constraint MUST allow NULL for signup to work

-- For user_role column (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_role'
    ) THEN
        -- Create flexible constraint: NULL or valid values
        BEGIN
            ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_user_role_check 
            CHECK (
                user_role IS NULL 
                OR user_role IN ('car_browser', 'car_owner', 'garage_owner', 'vendor', 'browser')
            );
            RAISE NOTICE '✅ Created flexible user_role constraint (allows NULL)';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE '✅ user_role constraint already exists';
        END;
    END IF;
END $$;

-- For sub_role column (if it exists - old schema)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'sub_role'
    ) THEN
        -- Create flexible constraint: NULL or valid values
        BEGIN
            ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_sub_role_check 
            CHECK (
                sub_role IS NULL 
                OR sub_role IN ('car_browser', 'car_owner', 'garage_owner', 'vendor', 'browser')
            );
            RAISE NOTICE '✅ Created flexible sub_role constraint (allows NULL)';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE '✅ sub_role constraint already exists';
        END;
    END IF;
END $$;

-- ============================================================================
-- 5. UPDATE handle_new_user() TO ENSURE NULL user_role
-- ============================================================================

-- Make sure the trigger function explicitly sets user_role to NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
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

  -- Insert profile with system_role = 'browser' and user_role = NULL
  -- user_role will be set later during role selection
  -- Explicitly set sub_role to NULL to avoid any default value issues
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    system_role,
    user_role,
    sub_role, -- Explicitly set to NULL
    verification_status,
    created_at,
    last_login_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'display_name', v_full_name),
    'browser', -- Default system_role
    NULL, -- user_role is NULL initially (set during role selection)
    NULL, -- sub_role is NULL (allowed by constraint)
    'pending', -- Default verification_status
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    last_login_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'handle_new_user failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check constraints after migration:
-- SELECT 
--     conname AS constraint_name,
--     pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'public.profiles'::regclass
--   AND (conname LIKE '%sub_role%' OR conname LIKE '%user_role%');
--
-- Expected: Constraints should allow NULL values

-- Test insert (should work now):
-- INSERT INTO public.profiles (id, email, system_role, user_role, verification_status)
-- VALUES (gen_random_uuid(), 'test@example.com', 'browser', NULL, 'pending');
-- -- Should succeed without constraint violation

-- ✅ Migration complete - sub_role/user_role constraint fixed

