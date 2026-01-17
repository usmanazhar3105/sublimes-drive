-- ============================================================================
-- Migration: Fix fn_toggle_like RLS Permissions
-- Date: 2026-01-17
-- Purpose: Fix 400 error when toggling likes - RLS policies blocking SECURITY DEFINER function
-- ============================================================================

-- ============================================================================
-- 1. Fix post_likes RLS policies to work with SECURITY DEFINER functions
-- ============================================================================

DO $$
BEGIN
  -- Ensure post_likes table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_likes'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies to avoid conflicts
    DROP POLICY IF EXISTS "post_likes_select_public" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_insert_authenticated" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_delete_own" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_select_all" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_manage_own" ON public.post_likes;
    DROP POLICY IF EXISTS "Users can manage own likes" ON public.post_likes;
    DROP POLICY IF EXISTS "Everyone can view likes" ON public.post_likes;
    DROP POLICY IF EXISTS "Admin can manage all likes" ON public.post_likes;
    DROP POLICY IF EXISTS "allow_read_post_likes" ON public.post_likes;
    DROP POLICY IF EXISTS "allow_manage_own_post_likes" ON public.post_likes;
    
    -- SELECT: Anyone can read likes (for counts)
    CREATE POLICY "post_likes_select_public"
      ON public.post_likes FOR SELECT
      USING (true);
    
    -- INSERT: Authenticated users can insert their own likes
    -- Simplified policy - just check user_id matches auth.uid()
    CREATE POLICY "post_likes_insert_authenticated"
      ON public.post_likes FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
    
    -- DELETE: Users can delete their own likes
    CREATE POLICY "post_likes_delete_own"
      ON public.post_likes FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
    
    -- Grant necessary permissions
    GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
    GRANT SELECT ON public.post_likes TO anon;
    
    RAISE NOTICE '✅ Fixed post_likes RLS policies for fn_toggle_like';
  ELSE
    RAISE WARNING '⚠️ post_likes table does not exist. Please ensure base schema is applied.';
  END IF;
END $$;

-- ============================================================================
-- 2. Ensure fn_toggle_like function has proper permissions
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Grant execute on fn_toggle_like to authenticated users
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'fn_toggle_like' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    -- Grant execute on all overloads of fn_toggle_like
    FOR rec IN 
      SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
      FROM pg_proc
      WHERE proname = 'fn_toggle_like'
      AND pronamespace = 'public'::regnamespace
    LOOP
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated', 
                     rec.proname, rec.args);
    END LOOP;
    
    RAISE NOTICE '✅ Granted EXECUTE on fn_toggle_like to authenticated';
  ELSE
    RAISE WARNING '⚠️ fn_toggle_like function does not exist. Please ensure base schema is applied.';
  END IF;
END $$;

-- ============================================================================
-- 3. Verify fn_toggle_like function signature and fix if needed
-- ============================================================================

-- The function should be SECURITY DEFINER and use auth.uid() correctly
-- Let's ensure it exists and is correct
CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_like_count INTEGER;
  v_post_exists BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check authentication
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Not authenticated',
      'message', 'Please sign in to like posts',
      'liked', false,
      'like_count', 0
    );
  END IF;

  -- Validate post_id is not null
  IF p_post_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Invalid post ID',
      'message', 'Post ID is required',
      'liked', false,
      'like_count', 0
    );
  END IF;

  -- Verify post exists (optional check, but helps with better error messages)
  SELECT EXISTS (
    SELECT 1 FROM public.posts WHERE id = p_post_id
  ) INTO v_post_exists;
  
  IF NOT v_post_exists THEN
    RETURN jsonb_build_object(
      'error', 'Post not found',
      'message', 'The post you are trying to like does not exist',
      'liked', false,
      'like_count', 0
    );
  END IF;

  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_liked;
  
  -- Toggle like
  IF v_liked THEN
    -- Unlike
    DELETE FROM public.post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    -- Like - use INSERT with explicit conflict handling
    BEGIN
      INSERT INTO public.post_likes (post_id, user_id)
      VALUES (p_post_id, v_user_id);
      v_liked := TRUE;
    EXCEPTION 
      WHEN unique_violation THEN
        -- Already liked (race condition), set to true
        v_liked := TRUE;
      WHEN foreign_key_violation THEN
        RETURN jsonb_build_object(
          'error', 'Invalid post or user',
          'message', 'The post or user does not exist',
          'liked', false,
          'like_count', 0
        );
      WHEN OTHERS THEN
        RETURN jsonb_build_object(
          'error', SQLERRM,
          'message', 'Failed to like post',
          'liked', false,
          'like_count', 0
        );
    END;
  END IF;
  
  -- Get updated count
  SELECT COUNT(*) INTO v_like_count
  FROM public.post_likes
  WHERE post_id = p_post_id;
  
  -- Update denormalized count on posts table (if column exists)
  BEGIN
    UPDATE public.posts 
    SET like_count = v_like_count 
    WHERE id = p_post_id;
  EXCEPTION WHEN OTHERS THEN
    -- Column might not exist, ignore
    NULL;
  END;
  
  -- Return result
  RETURN jsonb_build_object(
    'liked', v_liked,
    'like_count', v_like_count
  );
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error and return user-friendly message
    RAISE WARNING 'fn_toggle_like error: % - %', SQLERRM, SQLSTATE;
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'message', 'An error occurred while toggling like',
      'liked', false,
      'like_count', 0
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO anon;

DO $$
BEGIN
  RAISE NOTICE '✅ Created/updated fn_toggle_like function with proper error handling';
END $$;

-- ============================================================================
-- 4. Check for unique constraint on post_likes
-- ============================================================================

DO $$
BEGIN
  -- Ensure unique constraint exists on (post_id, user_id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_likes'
  ) THEN
    -- Check if unique constraint exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conrelid = 'public.post_likes'::regclass
      AND contype = 'u'
      AND (
        conname LIKE '%post_id%user_id%' 
        OR conname LIKE '%user_id%post_id%'
        OR conname = 'ux_post_like'
      )
    ) THEN
      -- Create unique constraint
      ALTER TABLE public.post_likes 
      ADD CONSTRAINT ux_post_likes_post_user UNIQUE (post_id, user_id);
      
      RAISE NOTICE '✅ Created unique constraint on post_likes(post_id, user_id)';
    ELSE
      RAISE NOTICE 'ℹ️ Unique constraint already exists on post_likes';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the function:
--
-- 1. Check RLS policies:
--    SELECT * FROM pg_policies WHERE tablename = 'post_likes';
--
-- 2. Test function (replace with actual post_id and user_id):
--    SELECT * FROM public.fn_toggle_like('YOUR_POST_ID_HERE'::uuid);
--
-- 3. Check if like was created:
--    SELECT * FROM post_likes WHERE post_id = 'YOUR_POST_ID_HERE'::uuid;

-- ✅ Migration complete - fn_toggle_like RLS permissions fixed

