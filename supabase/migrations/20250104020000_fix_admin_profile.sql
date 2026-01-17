-- ============================================================================
-- FIX ADMIN PROFILE - Create missing profile for admin@sublimesdrive.com
-- ============================================================================
-- This migration creates the admin profile that should have been auto-created
-- by the handle_new_user trigger
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = 'admin@sublimesdrive.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '⚠️  Admin user not found in auth.users';
    RAISE NOTICE '   Please create the user first in Supabase Auth dashboard';
  ELSE
    RAISE NOTICE '✅ Found admin user: % (%)', v_user_email, v_user_id;
    
    -- Create or update profile
    INSERT INTO profiles (
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
      v_user_id,
      v_user_email,
      'Admin User',
      'Admin',
      'admin',
      'car_browser',
      'yellow',
      'platinum',
      'approved',
      true,
      1000,
      10,
      0,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      full_name = 'Admin User',
      display_name = 'Admin',
      verification_status = 'approved',
      is_verified = true,
      badge_tier = 'platinum',
      updated_at = NOW();
    
    RAISE NOTICE '✅ Admin profile created/updated successfully!';
    RAISE NOTICE '   ID: %', v_user_id;
    RAISE NOTICE '   Email: %', v_user_email;
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '   Status: approved';
  END IF;
END $$;

-- Verify the profile was created
DO $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE email = 'admin@sublimesdrive.com';
  
  IF v_profile.id IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 VERIFICATION SUCCESSFUL!';
    RAISE NOTICE '   Profile ID: %', v_profile.id;
    RAISE NOTICE '   Email: %', v_profile.email;
    RAISE NOTICE '   Full Name: %', v_profile.full_name;
    RAISE NOTICE '   Role: %', v_profile.role;
    RAISE NOTICE '   Sub Role: %', v_profile.sub_role;
    RAISE NOTICE '   Badge: %', v_profile.badge_tier;
    RAISE NOTICE '   Verified: %', v_profile.is_verified;
    RAISE NOTICE '';
    RAISE NOTICE '✅ You can now refresh your browser!';
  ELSE
    RAISE NOTICE '❌ Profile verification failed - profile not found';
  END IF;
END $$;

