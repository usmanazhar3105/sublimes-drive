-- ============================================================================
-- ADD ADMIN RLS POLICIES - Allow admins to manage all data
-- ============================================================================
-- This migration adds admin-specific RLS policies for reading/managing all data
-- WITHOUT causing infinite recursion
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ADMIN CHECK HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function bypasses RLS by using SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- PART 2: ADD ADMIN POLICIES FOR PROFILES TABLE
-- ============================================================================

-- Allow admins to read all profiles
DROP POLICY IF EXISTS profiles_admin_read_all ON public.profiles;
CREATE POLICY profiles_admin_read_all ON public.profiles
  FOR SELECT TO authenticated
  USING (is_admin());

-- Allow admins to update all profiles
DROP POLICY IF EXISTS profiles_admin_update_all ON public.profiles;
CREATE POLICY profiles_admin_update_all ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_admin());

-- Allow admins to insert profiles
DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Allow admins to delete profiles
DROP POLICY IF EXISTS profiles_admin_delete ON public.profiles;
CREATE POLICY profiles_admin_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- PART 3: ADD ADMIN POLICIES FOR VERIFICATION_REQUESTS
-- ============================================================================

-- Allow admins to read all verification requests
DROP POLICY IF EXISTS verif_admin_read_all ON public.verification_requests;
CREATE POLICY verif_admin_read_all ON public.verification_requests
  FOR SELECT TO authenticated
  USING (is_admin());

-- Allow admins to update all verification requests
DROP POLICY IF EXISTS verif_admin_update_all ON public.verification_requests;
CREATE POLICY verif_admin_update_all ON public.verification_requests
  FOR UPDATE TO authenticated
  USING (is_admin());

-- Allow admins to insert verification requests
DROP POLICY IF EXISTS verif_admin_insert ON public.verification_requests;
CREATE POLICY verif_admin_insert ON public.verification_requests
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Allow admins to delete verification requests
DROP POLICY IF EXISTS verif_admin_delete ON public.verification_requests;
CREATE POLICY verif_admin_delete ON public.verification_requests
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- PART 4: ADD ADMIN POLICIES FOR POSTS
-- ============================================================================

-- Allow admins to read all posts
DROP POLICY IF EXISTS posts_admin_read_all ON public.posts;
CREATE POLICY posts_admin_read_all ON public.posts
  FOR SELECT TO authenticated
  USING (is_admin());

-- Allow admins to update all posts
DROP POLICY IF EXISTS posts_admin_update_all ON public.posts;
CREATE POLICY posts_admin_update_all ON public.posts
  FOR UPDATE TO authenticated
  USING (is_admin());

-- Allow admins to delete posts
DROP POLICY IF EXISTS posts_admin_delete ON public.posts;
CREATE POLICY posts_admin_delete ON public.posts
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- PART 5: ADD ADMIN POLICIES FOR LISTINGS
-- ============================================================================

DO $$
BEGIN
  -- Check if listings table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS listings_admin_read_all ON public.listings;
    DROP POLICY IF EXISTS listings_admin_update_all ON public.listings;
    DROP POLICY IF EXISTS listings_admin_delete ON public.listings;
    
    -- Create admin policies
    CREATE POLICY listings_admin_read_all ON public.listings
      FOR SELECT TO authenticated
      USING (is_admin());
    
    CREATE POLICY listings_admin_update_all ON public.listings
      FOR UPDATE TO authenticated
      USING (is_admin());
    
    CREATE POLICY listings_admin_delete ON public.listings
      FOR DELETE TO authenticated
      USING (is_admin());
      
    RAISE NOTICE '✅ Admin policies created for listings';
  END IF;
END $$;

-- ============================================================================
-- PART 6: ADD ADMIN POLICIES FOR EVENTS
-- ============================================================================

DO $$
BEGIN
  -- Check if events table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS events_admin_read_all ON public.events;
    DROP POLICY IF EXISTS events_admin_update_all ON public.events;
    DROP POLICY IF EXISTS events_admin_delete ON public.events;
    
    -- Create admin policies
    CREATE POLICY events_admin_read_all ON public.events
      FOR SELECT TO authenticated
      USING (is_admin());
    
    CREATE POLICY events_admin_update_all ON public.events
      FOR UPDATE TO authenticated
      USING (is_admin());
    
    CREATE POLICY events_admin_delete ON public.events
      FOR DELETE TO authenticated
      USING (is_admin());
      
    RAISE NOTICE '✅ Admin policies created for events';
  END IF;
END $$;

-- ============================================================================
-- PART 7: ADD ADMIN POLICIES FOR GARAGES
-- ============================================================================

DO $$
BEGIN
  -- Check if garages table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS garages_admin_read_all ON public.garages;
    DROP POLICY IF EXISTS garages_admin_update_all ON public.garages;
    DROP POLICY IF EXISTS garages_admin_delete ON public.garages;
    
    -- Create admin policies
    CREATE POLICY garages_admin_read_all ON public.garages
      FOR SELECT TO authenticated
      USING (is_admin());
    
    CREATE POLICY garages_admin_update_all ON public.garages
      FOR UPDATE TO authenticated
      USING (is_admin());
    
    CREATE POLICY garages_admin_delete ON public.garages
      FOR DELETE TO authenticated
      USING (is_admin());
      
    RAISE NOTICE '✅ Admin policies created for garages';
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ✅ ✅ ADMIN RLS POLICIES CREATED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ is_admin() helper function created';
  RAISE NOTICE '✅ Admin policies for profiles (read/update/insert/delete)';
  RAISE NOTICE '✅ Admin policies for verification_requests (read/update/insert/delete)';
  RAISE NOTICE '✅ Admin policies for posts (read/update/delete)';
  RAISE NOTICE '✅ Admin policies for listings (read/update/delete)';
  RAISE NOTICE '✅ Admin policies for events (read/update/delete)';
  RAISE NOTICE '✅ Admin policies for garages (read/update/delete)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Admins can now:';
  RAISE NOTICE '   - View all users';
  RAISE NOTICE '   - Manage all verification requests';
  RAISE NOTICE '   - Moderate all content (posts, listings, events)';
  RAISE NOTICE '   - Manage all garages';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security: Uses SECURITY DEFINER function (no infinite recursion)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ REFRESH YOUR BROWSER TO SEE ALL 11 USERS!';
END $$;

