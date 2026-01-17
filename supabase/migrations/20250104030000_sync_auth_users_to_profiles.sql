-- ============================================================================
-- SYNC ALL AUTH USERS TO PROFILES TABLE
-- ============================================================================
-- This migration creates profiles for all existing auth.users
-- that don't have a profile yet
-- ============================================================================

DO $$
DECLARE
  v_user RECORD;
  v_created_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Starting auth.users → profiles sync...';
  RAISE NOTICE '';
  
  -- Loop through all auth.users
  FOR v_user IN 
    SELECT 
      au.id,
      au.email,
      au.created_at,
      au.last_sign_in_at,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL  -- Only users without profiles
  LOOP
    BEGIN
      -- Create profile for this user
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        display_name,
        role,
        sub_role,
        badge_color,
        badge_tier,
        verification_status,
        is_verified,
        xp_points,
        level,
        wallet_balance,
        created_at,
        updated_at,
        last_login_at
      )
      VALUES (
        v_user.id,
        v_user.email,
        COALESCE(v_user.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(v_user.raw_user_meta_data->>'display_name', SPLIT_PART(v_user.email, '@', 1)),
        'subscriber',  -- Default role
        'car_browser', -- Default sub_role
        'yellow',      -- Default badge
        'bronze',      -- Default tier
        'unverified',  -- Default verification status
        false,         -- Not verified yet
        0,             -- Starting XP
        1,             -- Starting level
        0,             -- Starting balance
        v_user.created_at,
        NOW(),
        v_user.last_sign_in_at
      );
      
      v_created_count := v_created_count + 1;
      
      RAISE NOTICE '✅ Created profile for: % (ID: %)', v_user.email, v_user.id;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_skipped_count := v_skipped_count + 1;
        RAISE NOTICE '⚠️  Skipped % - Error: %', v_user.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SYNC COMPLETE!';
  RAISE NOTICE '   Profiles Created: %', v_created_count;
  RAISE NOTICE '   Skipped/Errors: %', v_skipped_count;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  
  -- Show final count
  RAISE NOTICE '📊 Total profiles in database:';
  RAISE NOTICE '';
END $$;

-- Verify the sync worked
DO $$
DECLARE
  v_auth_count INTEGER;
  v_profile_count INTEGER;
  v_missing INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_auth_count FROM auth.users;
  SELECT COUNT(*) INTO v_profile_count FROM public.profiles;
  v_missing := v_auth_count - v_profile_count;
  
  RAISE NOTICE '   Auth Users:    %', v_auth_count;
  RAISE NOTICE '   Profiles:      %', v_profile_count;
  RAISE NOTICE '   Missing:       %', v_missing;
  RAISE NOTICE '';
  
  IF v_missing = 0 THEN
    RAISE NOTICE '✅ ALL AUTH USERS HAVE PROFILES!';
  ELSE
    RAISE WARNING '⚠️  % auth users still missing profiles!', v_missing;
  END IF;
END $$;

