-- ============================================================================
-- Migration: Fix sub_role Constraint and Default
-- Date: 2026-01-19
-- Priority: CRITICAL
-- 
-- Fixes:
-- 1. Ensure sub_role column has DEFAULT 'car_browser'
-- 2. Fix constraint to only allow ('car_browser', 'car_owner', 'garage_owner')
-- 3. Update any NULL or invalid sub_role values to 'car_browser'
-- ============================================================================

-- ============================================================================
-- 1. FIX SUB_ROLE CONSTRAINT
-- ============================================================================

-- Drop the old constraint if it exists (may have different allowed values)
DO $$
BEGIN
  -- Drop any existing sub_role constraint
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check;
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check1;
  
  RAISE NOTICE '✅ Dropped old sub_role constraints';
END $$;

-- ============================================================================
-- 2. ENSURE SUB_ROLE COLUMN EXISTS WITH CORRECT DEFAULT
-- ============================================================================

DO $$
BEGIN
  -- Check if sub_role column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'sub_role'
  ) THEN
    -- Add sub_role column with default
    ALTER TABLE public.profiles 
    ADD COLUMN sub_role TEXT DEFAULT 'car_browser';
    
    RAISE NOTICE '✅ Added sub_role column with DEFAULT ''car_browser''';
  ELSE
    -- Column exists, ensure it has the correct default
    ALTER TABLE public.profiles 
    ALTER COLUMN sub_role SET DEFAULT 'car_browser';
    
    RAISE NOTICE '✅ Updated sub_role DEFAULT to ''car_browser''';
  END IF;
END $$;

-- ============================================================================
-- 3. ADD CORRECT CONSTRAINT
-- ============================================================================

-- Add the correct constraint
DO $$
BEGIN
  ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_sub_role_check 
  CHECK (sub_role IN ('car_browser', 'car_owner', 'garage_owner'));
  
  RAISE NOTICE '✅ Added profiles_sub_role_check constraint';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE '✅ profiles_sub_role_check constraint already exists';
END $$;

-- ============================================================================
-- 4. FIX EXISTING NULL OR INVALID VALUES
-- ============================================================================

DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Update any NULL sub_role values to 'car_browser'
  UPDATE public.profiles 
  SET sub_role = 'car_browser' 
  WHERE sub_role IS NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % NULL sub_role values to ''car_browser''', v_updated_count;
  
  -- Update any invalid sub_role values to 'car_browser'
  -- We need to do this carefully to avoid constraint violations
  -- First, temporarily allow NULL, then update, then re-add constraint
  BEGIN
    -- Temporarily drop constraint to allow updates
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sub_role_check;
    
    -- Update invalid values
    UPDATE public.profiles 
    SET sub_role = 'car_browser' 
    WHERE sub_role NOT IN ('car_browser', 'car_owner', 'garage_owner')
       OR sub_role IS NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
      RAISE NOTICE '✅ Updated % invalid sub_role values to ''car_browser''', v_updated_count;
    END IF;
    
    -- Re-add constraint
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_sub_role_check 
    CHECK (sub_role IN ('car_browser', 'car_owner', 'garage_owner'));
    
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, that's fine
    NULL;
  END;
END $$;

-- ============================================================================
-- 5. UPDATE TRIGGER TO ENSURE SUB_ROLE IS NOT INSERTED (USE DEFAULT)
-- ============================================================================

-- The trigger function should NOT insert sub_role - let the DEFAULT handle it
-- Verify the current trigger doesn't insert sub_role
-- (The migration 20260117000000_fix_profile_creation_production.sql already handles this correctly)

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the constraint and default
DO $$
DECLARE
  v_default TEXT;
  v_constraint_name TEXT;
BEGIN
  -- Check default value
  SELECT column_default INTO v_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'sub_role';
  
  IF v_default = '''car_browser'''::text OR v_default LIKE '%car_browser%' THEN
    RAISE NOTICE '✅ sub_role DEFAULT is correct: %', v_default;
  ELSE
    RAISE WARNING '⚠️  sub_role DEFAULT may be incorrect: %', v_default;
  END IF;
  
  -- Check constraint exists
  SELECT constraint_name INTO v_constraint_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND constraint_name = 'profiles_sub_role_check';
  
  IF v_constraint_name IS NOT NULL THEN
    RAISE NOTICE '✅ profiles_sub_role_check constraint exists';
  ELSE
    RAISE WARNING '⚠️  profiles_sub_role_check constraint not found';
  END IF;
END $$;

-- ✅ Migration complete - sub_role constraint and default are now correct

