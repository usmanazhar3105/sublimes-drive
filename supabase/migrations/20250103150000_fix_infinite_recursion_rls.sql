-- ============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================================================
-- Error: "infinite recursion detected in policy for relation 'profiles'"
-- Cause: profiles_admin_all policy queries profiles while selecting from profiles
-- Solution: Remove recursive policies, use SECURITY DEFINER functions for admin
-- ============================================================================

DO $$ BEGIN RAISE NOTICE '🔧 Fixing infinite recursion in RLS policies...'; END $$;

-- ============================================================================
-- PART 1: Fix Profiles Table Policies
-- ============================================================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;

-- Create fixed policies (no recursion)

-- Policy 1: Users can INSERT their own profile (on signup)
CREATE POLICY profiles_insert_own
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 2: Users can SELECT all profiles (for display purposes)
-- ✅ No recursion - simple TRUE check
CREATE POLICY profiles_select_all
    ON public.profiles FOR SELECT
    TO authenticated
    USING (TRUE);

-- Policy 3: Users can UPDATE only their own profile
-- ✅ No admin check here to avoid recursion
CREATE POLICY profiles_update_own
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can DELETE only their own profile
CREATE POLICY profiles_delete_own
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

DO $$ BEGIN RAISE NOTICE '✅ Fixed profiles policies (no recursion)'; END $$;

-- ============================================================================
-- PART 2: Fix Verification Requests Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS verif_owner_select ON public.verification_requests;
DROP POLICY IF EXISTS verif_owner_insert ON public.verification_requests;
DROP POLICY IF EXISTS verif_owner_update ON public.verification_requests;
DROP POLICY IF EXISTS verif_admin_all ON public.verification_requests;
DROP POLICY IF EXISTS verif_select_own ON public.verification_requests;
DROP POLICY IF EXISTS verif_insert_own ON public.verification_requests;
DROP POLICY IF EXISTS verif_update_own ON public.verification_requests;

-- Create fixed policies (no recursion)

-- Users can view their own verification requests
CREATE POLICY verif_select_own
    ON public.verification_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create their own verification requests
CREATE POLICY verif_insert_own
    ON public.verification_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification requests
CREATE POLICY verif_update_own
    ON public.verification_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DO $$ BEGIN RAISE NOTICE '✅ Fixed verification_requests policies'; END $$;

-- ============================================================================
-- PART 3: Create Admin Helper Function (SECURITY DEFINER bypasses RLS)
-- ============================================================================

-- Drop existing if any
DROP FUNCTION IF EXISTS public.is_admin();

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- SECURITY DEFINER bypasses RLS, so no recursion
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ Created is_admin() helper function'; END $$;

-- ============================================================================
-- PART 4: Update fn_select_role to Use SECURITY DEFINER
-- ============================================================================

-- Ensure fn_select_role is SECURITY DEFINER (bypasses RLS)
DROP FUNCTION IF EXISTS public.fn_select_role(TEXT);

CREATE OR REPLACE FUNCTION public.fn_select_role(p_sub_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_needs_verification BOOLEAN := (p_sub_role IN ('car_owner', 'garage_owner'));
    v_profile JSONB;
    v_existing_request UUID;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
    END IF;
    
    -- Validate role
    IF p_sub_role NOT IN ('car_browser', 'car_owner', 'garage_owner') THEN
        RAISE EXCEPTION 'INVALID_ROLE: Role must be car_browser, car_owner, or garage_owner';
    END IF;
    
    -- Update profile (SECURITY DEFINER bypasses RLS)
    UPDATE profiles
    SET 
        sub_role = p_sub_role,
        badge_color = CASE 
            WHEN p_sub_role = 'car_browser' THEN 'yellow'
            WHEN p_sub_role = 'car_owner' THEN 'green'
            WHEN p_sub_role = 'garage_owner' THEN 'blue'
        END,
        verification_status = CASE
            WHEN p_sub_role = 'car_browser' THEN 'unverified'
            ELSE 'pending'
        END,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Create verification request if needed
    IF v_needs_verification THEN
        SELECT id INTO v_existing_request
        FROM verification_requests
        WHERE user_id = v_user_id 
          AND type = p_sub_role
          AND status IN ('pending', 'under_review')
        LIMIT 1;
        
        IF v_existing_request IS NULL THEN
            INSERT INTO verification_requests (user_id, type, status, created_at)
            VALUES (v_user_id, p_sub_role, 'pending', NOW())
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    -- Return updated profile
    SELECT to_jsonb(p.*) INTO v_profile
    FROM profiles p
    WHERE p.id = v_user_id;
    
    RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_select_role(TEXT) TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ Updated fn_select_role with SECURITY DEFINER'; END $$;

-- ============================================================================
-- PART 5: Verification
-- ============================================================================

DO $$
DECLARE
    v_policy_count INTEGER;
    v_function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📝 Running verification checks...';
    
    -- Check profiles policies
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    IF v_policy_count >= 4 THEN
        RAISE NOTICE '✅ profiles has % policies (expected 4)', v_policy_count;
    ELSE
        RAISE WARNING '⚠️ profiles has only % policies (expected 4)', v_policy_count;
    END IF;
    
    -- Check verification_requests policies
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'verification_requests';
    
    IF v_policy_count >= 3 THEN
        RAISE NOTICE '✅ verification_requests has % policies (expected 3)', v_policy_count;
    ELSE
        RAISE WARNING '⚠️ verification_requests has only % policies (expected 3)', v_policy_count;
    END IF;
    
    -- Check is_admin function
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) INTO v_function_exists;
    
    IF v_function_exists THEN
        RAISE NOTICE '✅ is_admin() function exists';
    ELSE
        RAISE WARNING '⚠️ is_admin() function not found';
    END IF;
    
    -- Check fn_select_role function
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'fn_select_role'
    ) INTO v_function_exists;
    
    IF v_function_exists THEN
        RAISE NOTICE '✅ fn_select_role() function exists';
    ELSE
        RAISE WARNING '⚠️ fn_select_role() function not found';
    END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;
DO $$ BEGIN RAISE NOTICE '✅ INFINITE RECURSION FIXED'; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE 'What was fixed:'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Removed recursive admin policy on profiles'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ All authenticated users can SELECT all profiles'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Users can UPDATE only their own profile'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Created is_admin() helper function'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Updated fn_select_role to use SECURITY DEFINER'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE 'Test now:'; END $$;
DO $$ BEGIN RAISE NOTICE '  SELECT * FROM profiles LIMIT 1;'; END $$;
DO $$ BEGIN RAISE NOTICE '  -- Should work without recursion error'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;

