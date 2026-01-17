-- ============================================================================
-- COMPREHENSIVE DATABASE FIX - Complete Schema Alignment
-- ============================================================================
-- This migration ensures database is properly aligned and fixes any conflicts
-- ============================================================================

DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;
DO $$ BEGIN RAISE NOTICE '🔧 COMPREHENSIVE DATABASE FIX - STARTING'; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;

-- ============================================================================
-- PART 1: Fix Column Name Conflicts (kind vs type)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 1: Fixing column name conflicts...';
  
  -- Check if verification_requests exists with 'kind' column
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'verification_requests'
    AND column_name = 'kind'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'verification_requests'
    AND column_name = 'type'
  ) THEN
    -- Rename kind to type for consistency
    ALTER TABLE verification_requests RENAME COLUMN kind TO type;
    RAISE NOTICE '✅ Renamed verification_requests.kind to type';
  ELSIF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'verification_requests'
    AND column_name = 'type'
  ) THEN
    RAISE NOTICE '✅ verification_requests already has "type" column';
  ELSE
    RAISE NOTICE 'ℹ️ verification_requests will be created later';
  END IF;
END $$;

-- ============================================================================
-- PART 2: Ensure Profiles Has All Required Columns
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 2: Ensuring profiles has all required columns...';
  
  -- Add sub_role if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'sub_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sub_role TEXT DEFAULT 'car_browser' 
      CHECK (sub_role IN ('car_browser', 'car_owner', 'garage_owner'));
    RAISE NOTICE '✅ Added sub_role column to profiles';
  ELSE
    RAISE NOTICE '✅ profiles.sub_role already exists';
  END IF;
  
  -- Add presence if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'presence'
  ) THEN
    ALTER TABLE profiles ADD COLUMN presence TEXT DEFAULT 'offline'
      CHECK (presence IN ('online', 'away', 'busy', 'offline'));
    RAISE NOTICE '✅ Added presence column to profiles';
  END IF;
  
  -- Add last_seen if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ;
    RAISE NOTICE '✅ Added last_seen column to profiles';
  END IF;
END $$;

-- ============================================================================
-- PART 3: Update Role Constraints to Support Both Systems
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 3: Updating role constraints...';
  
  -- Drop and recreate role constraint to support both naming schemes
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'editor', 'subscriber', 'moderator', 'car_browser', 'car_owner', 'garage_owner'));
  
  RAISE NOTICE '✅ Updated profiles role constraint';
  
  -- Drop and recreate verification_status constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
    CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected', 'unverified'));
  
  RAISE NOTICE '✅ Updated verification_status constraint';
END $$;

-- ============================================================================
-- PART 4: Ensure fn_select_role Function Exists
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 4: Ensuring fn_select_role exists...';
  
  -- Drop and recreate to ensure latest version
  DROP FUNCTION IF EXISTS fn_select_role(TEXT);
  
  CREATE OR REPLACE FUNCTION fn_select_role(p_sub_role TEXT)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $func$
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
      
      -- Update profile
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
          -- Check if request already exists
          SELECT id INTO v_existing_request
          FROM verification_requests
          WHERE user_id = v_user_id 
            AND type = p_sub_role
            AND status IN ('pending', 'under_review')
          LIMIT 1;
          
          -- Create new request if none exists
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
  $func$;
  
  GRANT EXECUTE ON FUNCTION fn_select_role(TEXT) TO authenticated;
  
  RAISE NOTICE '✅ Created/updated fn_select_role function';
END $$;

-- ============================================================================
-- PART 5: Ensure RLS Policies Are Correct
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 5: Verifying RLS policies...';
  
  -- Enable RLS on profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- Recreate essential policies
  DROP POLICY IF EXISTS profiles_owner_select ON profiles;
  CREATE POLICY profiles_owner_select 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS profiles_owner_update ON profiles;
  CREATE POLICY profiles_owner_update 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  
  DROP POLICY IF EXISTS profiles_public_read ON profiles;
  CREATE POLICY profiles_public_read
    ON profiles FOR SELECT
    TO authenticated
    USING (TRUE);
  
  DROP POLICY IF EXISTS profiles_admin_all ON profiles;
  CREATE POLICY profiles_admin_all 
    ON profiles FOR ALL 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
      )
    )
    WITH CHECK (TRUE);
  
  RAISE NOTICE '✅ Verified profiles RLS policies';
  
  -- Verify verification_requests RLS
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification_requests'
  ) THEN
    ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS verif_owner_select ON verification_requests;
    CREATE POLICY verif_owner_select
      ON verification_requests FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS verif_owner_insert ON verification_requests;
    CREATE POLICY verif_owner_insert
      ON verification_requests FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS verif_admin_all ON verification_requests;
    CREATE POLICY verif_admin_all
      ON verification_requests FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
        )
      )
      WITH CHECK (TRUE);
    
    RAISE NOTICE '✅ Verified verification_requests RLS policies';
  END IF;
END $$;

-- ============================================================================
-- PART 6: Create Indexes for Performance
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 6: Creating performance indexes...';
  
  CREATE INDEX IF NOT EXISTS idx_profiles_sub_role ON profiles(sub_role);
  CREATE INDEX IF NOT EXISTS idx_profiles_presence ON profiles(presence);
  CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen DESC);
  
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification_requests'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_verification_type ON verification_requests(type);
  END IF;
  
  RAISE NOTICE '✅ Created performance indexes';
END $$;

-- ============================================================================
-- PART 7: Grant All Necessary Permissions
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 7: Granting permissions...';
  
  GRANT USAGE ON SCHEMA public TO authenticated, anon;
  GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
  
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification_requests'
  ) THEN
    GRANT SELECT, INSERT, UPDATE ON verification_requests TO authenticated;
  END IF;
  
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
  
  RAISE NOTICE '✅ Granted necessary permissions';
END $$;

-- ============================================================================
-- PART 8: Final Verification
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 PART 8: Running verification checks...';
  
  -- Check profiles columns
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('role', 'sub_role', 'verification_status');
  
  IF v_count >= 3 THEN
    RAISE NOTICE '✅ profiles has all required role columns';
  ELSE
    RAISE WARNING '⚠️ profiles missing some role columns (found %)', v_count;
  END IF;
  
  -- Check fn_select_role
  SELECT COUNT(*) INTO v_count
  FROM pg_proc
  WHERE proname = 'fn_select_role';
  
  IF v_count >= 1 THEN
    RAISE NOTICE '✅ fn_select_role function exists';
  ELSE
    RAISE WARNING '⚠️ fn_select_role function missing';
  END IF;
  
  -- Check verification_requests type column
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification_requests'
  ) THEN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests'
    AND column_name = 'type';
    
    IF v_count = 1 THEN
      RAISE NOTICE '✅ verification_requests has "type" column';
    ELSE
      RAISE WARNING '⚠️ verification_requests missing "type" column';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;
DO $$ BEGIN RAISE NOTICE '✅ COMPREHENSIVE DATABASE FIX - COMPLETE'; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE 'What was fixed:'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Fixed column name conflicts (kind → type)'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Added missing columns to profiles'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Updated role constraints'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Created/updated fn_select_role'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Verified RLS policies'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Created performance indexes'; END $$;
DO $$ BEGIN RAISE NOTICE '  ✅ Granted permissions'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE 'Database is now aligned and ready!'; END $$;
DO $$ BEGIN RAISE NOTICE '════════════════════════════════════════════════════════'; END $$;

