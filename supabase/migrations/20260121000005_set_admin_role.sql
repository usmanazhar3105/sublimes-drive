-- ============================================================================
-- Migration: Set Admin Account to Admin Role
-- Date: 2026-01-21
-- Purpose: Restore admin role for admin@sublimesdrive.com
-- ============================================================================

-- ============================================================================
-- 1. UPDATE ADMIN ACCOUNT TO ADMIN ROLE
-- ============================================================================

UPDATE public.profiles
SET 
    system_role = 'admin',
    role = 'admin'  -- Will be synced by trigger, but set explicitly for immediate effect
WHERE email = 'admin@sublimesdrive.com';

-- Verify the update
DO $$
DECLARE
    v_updated_count INTEGER;
    v_admin_role TEXT;
BEGIN
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    IF v_updated_count > 0 THEN
        -- Get the updated role to verify
        SELECT system_role INTO v_admin_role
        FROM public.profiles
        WHERE email = 'admin@sublimesdrive.com';
        
        RAISE NOTICE '✅ Admin account updated successfully!';
        RAISE NOTICE '   Email: admin@sublimesdrive.com';
        RAISE NOTICE '   System Role: %', v_admin_role;
        RAISE NOTICE '   Rows updated: %', v_updated_count;
    ELSE
        RAISE WARNING '⚠️  No rows updated. Check if email exists: admin@sublimesdrive.com';
        
        -- List all admin emails to help find the correct one
        RAISE NOTICE 'Available admin emails:';
        FOR v_admin_role IN 
            SELECT email FROM public.profiles WHERE system_role IN ('admin', 'superadmin', 'editor')
        LOOP
            RAISE NOTICE '   - %', v_admin_role;
        END LOOP;
    END IF;
END $$;

-- ============================================================================
-- 2. VERIFY ADMIN ACCOUNT STATUS
-- ============================================================================

SELECT 
    id,
    email,
    full_name,
    system_role,
    role,
    verification_status,
    is_verified,
    created_at
FROM public.profiles
WHERE email = 'admin@sublimesdrive.com';

-- Expected Result:
-- - system_role: 'admin'
-- - role: 'admin' (synced by trigger)
-- - verification_status: should be 'approved' or can be set

-- ============================================================================
-- 3. OPTIONAL: SET VERIFICATION STATUS TO APPROVED
-- ============================================================================

-- Uncomment to also set verification status to approved
/*
UPDATE public.profiles
SET 
    verification_status = 'approved',
    is_verified = TRUE,
    verified_at = NOW()
WHERE email = 'admin@sublimesdrive.com';
*/

-- ============================================================================
-- 4. VERIFY ADMIN CAN ACCESS ADMIN FUNCTIONS
-- ============================================================================

-- Test if admin check works (run as the admin user)
-- SELECT app.is_admin();
-- Should return: true

-- ✅ Migration complete - Admin role restored







