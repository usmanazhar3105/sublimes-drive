-- ============================================================================
-- Migration: Add role column as alias to system_role
-- Date: 2026-01-21
-- Priority: CRITICAL - Fixes frontend queries
-- 
-- Fixes:
-- 1. Add 'role' column that references 'system_role' for backward compatibility
-- 2. Frontend code queries 'role' but database has 'system_role'
-- 3. This allows frontend to work without code changes
-- ============================================================================

-- ============================================================================
-- 1. SYNC role COLUMN WITH system_role (Don't drop - has dependencies!)
-- ============================================================================

-- The role column already exists and has many dependencies (views, policies)
-- Instead of dropping it, we'll keep it and sync it with system_role using a trigger

DO $$
BEGIN
    -- Check if role column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        RAISE NOTICE '✅ role column already exists - will sync with system_role via trigger';
        
        -- Ensure role column allows NULL (in case it doesn't)
        ALTER TABLE public.profiles 
        ALTER COLUMN role DROP NOT NULL;
        
        -- Backfill: sync existing rows
        UPDATE public.profiles 
        SET role = system_role 
        WHERE role IS DISTINCT FROM system_role 
           OR (role IS NULL AND system_role IS NOT NULL);
        
        RAISE NOTICE '✅ Synced existing role values with system_role';
    ELSE
        -- Column doesn't exist - add it as regular column (not generated to avoid dependency issues)
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT;
        
        -- Initialize with system_role values
        UPDATE public.profiles 
        SET role = system_role 
        WHERE role IS NULL;
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
        
        RAISE NOTICE '✅ Added role column and initialized from system_role';
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE TRIGGER TO KEEP role IN SYNC WITH system_role
-- ============================================================================

-- Create function to sync role with system_role
-- Use different delimiter to avoid conflict with DO block
CREATE OR REPLACE FUNCTION sync_role_from_system_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Always sync role with system_role
    NEW.role := NEW.system_role;
    RETURN NEW;
END;
$function$;

-- Create trigger to keep role in sync with system_role
-- Need separate triggers for INSERT and UPDATE because INSERT can't reference OLD
DROP TRIGGER IF EXISTS sync_role_trigger_insert ON public.profiles;
DROP TRIGGER IF EXISTS sync_role_trigger_update ON public.profiles;

-- Trigger for INSERT (always sync)
CREATE TRIGGER sync_role_trigger_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_role_from_system_role();

-- Trigger for UPDATE (only when system_role changes)
CREATE TRIGGER sync_role_trigger_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (NEW.system_role IS DISTINCT FROM OLD.system_role)
    EXECUTE FUNCTION sync_role_from_system_role();

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ Created trigger to sync role with system_role';
END $$;

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

-- Check if role column exists and works
DO $$
DECLARE
    v_role_exists BOOLEAN;
    v_is_generated BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) INTO v_role_exists;
    
    IF v_role_exists THEN
        SELECT is_generated = 'ALWAYS' INTO v_is_generated
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role';
        
        IF v_is_generated THEN
            RAISE NOTICE '✅ role column exists as GENERATED column';
        ELSE
            RAISE NOTICE '✅ role column exists with trigger sync';
        END IF;
        
        -- Test that role matches system_role
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE role IS DISTINCT FROM system_role
        ) THEN
            RAISE WARNING '⚠️  Some rows have role != system_role - syncing...';
            UPDATE public.profiles 
            SET role = system_role 
            WHERE role IS DISTINCT FROM system_role;
        END IF;
    ELSE
        RAISE WARNING '❌ role column was not created';
    END IF;
END $$;

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Ensure role column is readable
GRANT SELECT (role) ON public.profiles TO authenticated;
GRANT SELECT (role) ON public.profiles TO anon;

-- ✅ Migration complete - role column now available for frontend queries

