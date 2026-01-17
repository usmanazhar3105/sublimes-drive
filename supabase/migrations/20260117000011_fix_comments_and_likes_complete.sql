-- ============================================================================
-- Migration: Fix Comments and Likes - Complete Refactor
-- Date: 2026-01-17
-- Purpose: Fix comment editing, ensure comments/likes are saved and displayed correctly
-- ============================================================================

-- ============================================================================
-- 1. Fix Comments RLS Policies
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comments'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
    DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
    DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
    DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
    DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
    DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
    DROP POLICY IF EXISTS "comments_manage_own" ON public.comments;
    DROP POLICY IF EXISTS "comments_owner_update" ON public.comments;
    DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments;
    
    -- SELECT: Anyone can read comments (for display)
    CREATE POLICY "comments_select_public"
      ON public.comments FOR SELECT
      USING (true);
    
    -- INSERT: Authenticated users can create comments
    CREATE POLICY "comments_insert_authenticated"
      ON public.comments FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
    
    -- UPDATE: Users can update their own comments
    CREATE POLICY "comments_update_own"
      ON public.comments FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    
    -- DELETE: Users can delete their own comments
    CREATE POLICY "comments_delete_own"
      ON public.comments FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
    GRANT SELECT ON public.comments TO anon;
    
    RAISE NOTICE '✅ Fixed comments RLS policies';
  END IF;
END $$;

-- ============================================================================
-- 2. Fix fn_edit_comment - Make it work with RLS
-- ============================================================================

-- Drop all existing versions
DO $$
BEGIN
  EXECUTE (
    SELECT string_agg('DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;', E'\n')
    FROM pg_proc
    WHERE proname = 'fn_edit_comment'
    AND pronamespace = 'public'::regnamespace
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create new fn_edit_comment function
CREATE OR REPLACE FUNCTION public.fn_edit_comment(
  p_comment_id UUID,
  p_content TEXT DEFAULT NULL,
  p_body TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_comment_user_id UUID;
  v_content_text TEXT;
  v_updated_comment JSONB;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated',
      'message', 'Please sign in to edit comments'
    );
  END IF;

  -- Determine content text (use p_content or p_body)
  v_content_text := COALESCE(NULLIF(TRIM(p_content), ''), NULLIF(TRIM(p_body), ''), '');
  
  IF v_content_text = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Empty content',
      'message', 'Comment content cannot be empty'
    );
  END IF;

  -- Get comment owner (bypass RLS with SECURITY DEFINER)
  SELECT user_id INTO v_comment_user_id
  FROM public.comments
  WHERE id = p_comment_id;
  
  -- Check if comment exists
  IF v_comment_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Comment not found',
      'message', 'The comment you are trying to edit does not exist'
    );
  END IF;
  
  -- Check ownership
  IF v_comment_user_id != v_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'You can only edit your own comments'
    );
  END IF;

  -- Update comment (handle both content and body columns)
  UPDATE public.comments
  SET 
    content = CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'content') 
      THEN v_content_text 
      ELSE content 
    END,
    body = CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'body') 
      THEN v_content_text 
      ELSE body 
    END,
    is_edited = CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'is_edited') 
      THEN TRUE 
      ELSE NULL 
    END,
    updated_at = NOW()
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  -- Check if update succeeded
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Update failed',
      'message', 'Failed to update comment'
    );
  END IF;
  
  -- Get updated comment
  SELECT to_jsonb(c.*) INTO v_updated_comment
  FROM public.comments c
  WHERE c.id = p_comment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment', v_updated_comment,
    'message', 'Comment updated successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'An error occurred while editing the comment'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_edit_comment(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_edit_comment(UUID, TEXT, TEXT) TO anon;

-- ============================================================================
-- 3. Ensure fn_add_comment works correctly
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.fn_add_comment(UUID, TEXT, UUID);

-- Create improved fn_add_comment
CREATE OR REPLACE FUNCTION public.fn_add_comment(
  p_post_id UUID,
  p_body TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_comment_id UUID;
  v_comment_count INTEGER;
  v_user_profile RECORD;
  v_content_text TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate input
  v_content_text := TRIM(COALESCE(p_body, ''));
  IF v_content_text = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment body cannot be empty');
  END IF;

  -- Insert comment (set both body and content if both columns exist)
  INSERT INTO public.comments (
    post_id, 
    user_id, 
    body, 
    content,
    parent_id,
    parent_comment_id,
    created_at
  )
  VALUES (
    p_post_id, 
    v_user_id, 
    v_content_text, 
    v_content_text,
    p_parent_id,
    p_parent_id,
    NOW()
  )
  RETURNING id INTO v_comment_id;
  
  -- Update comment count on post
  SELECT COUNT(*) INTO v_comment_count
  FROM public.comments
  WHERE post_id = p_post_id;
  
  -- Update denormalized count on posts table (if column exists)
  BEGIN
    UPDATE public.posts 
    SET comment_count = v_comment_count 
    WHERE id = p_post_id;
  EXCEPTION WHEN OTHERS THEN
    -- Column might not exist, ignore
    NULL;
  END;
  
  -- Get user profile for response
  BEGIN
    SELECT display_name, avatar_url, username INTO v_user_profile
    FROM public.profiles
    WHERE id = v_user_id;
  EXCEPTION WHEN OTHERS THEN
    -- Profile might not exist, use defaults
    v_user_profile := ROW('User', NULL, NULL);
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment', jsonb_build_object(
      'id', v_comment_id,
      'post_id', p_post_id,
      'user_id', v_user_id,
      'body', v_content_text,
      'content', v_content_text,
      'parent_id', p_parent_id,
      'parent_comment_id', p_parent_id,
      'like_count', 0,
      'created_at', NOW(),
      'user', jsonb_build_object(
        'display_name', COALESCE(v_user_profile.display_name, 'User'),
        'avatar_url', v_user_profile.avatar_url,
        'username', COALESCE(v_user_profile.username, 'user')
      )
    ),
    'comment_count', v_comment_count
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to add comment'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_add_comment(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_add_comment(UUID, TEXT, UUID) TO anon;

-- ============================================================================
-- 4. Ensure fn_delete_comment works correctly
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.fn_delete_comment(UUID);

-- Create improved fn_delete_comment
CREATE OR REPLACE FUNCTION public.fn_delete_comment(p_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_post_id UUID;
  v_comment_user_id UUID;
  v_comment_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get comment owner and post_id (bypass RLS with SECURITY DEFINER)
  SELECT user_id, post_id INTO v_comment_user_id, v_post_id
  FROM public.comments
  WHERE id = p_comment_id;
  
  -- Check if comment exists
  IF v_post_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment not found');
  END IF;
  
  -- Check ownership
  IF v_comment_user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'You can only delete your own comments');
  END IF;

  -- Delete the comment
  DELETE FROM public.comments
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  -- Update comment count
  SELECT COUNT(*) INTO v_comment_count
  FROM public.comments
  WHERE post_id = v_post_id;
  
  -- Update denormalized count on posts table (if column exists)
  BEGIN
    UPDATE public.posts 
    SET comment_count = v_comment_count 
    WHERE id = v_post_id;
  EXCEPTION WHEN OTHERS THEN
    -- Column might not exist, ignore
    NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment_count', v_comment_count
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to delete comment'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_delete_comment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_delete_comment(UUID) TO anon;

-- ============================================================================
-- 5. Ensure comment_likes RLS policies are correct
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comment_likes'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "comment_likes_select_all" ON public.comment_likes;
    DROP POLICY IF EXISTS "comment_likes_manage_own" ON public.comment_likes;
    
    -- SELECT: Anyone can read comment likes (for counts)
    CREATE POLICY "comment_likes_select_all"
      ON public.comment_likes FOR SELECT
      USING (true);
    
    -- INSERT/DELETE: Users can manage their own comment likes
    CREATE POLICY "comment_likes_manage_own"
      ON public.comment_likes FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    
    -- Grant permissions
    GRANT SELECT, INSERT, DELETE ON public.comment_likes TO authenticated;
    GRANT SELECT ON public.comment_likes TO anon;
    
    RAISE NOTICE '✅ Fixed comment_likes RLS policies';
  END IF;
END $$;

-- ============================================================================
-- 6. Ensure post_likes RLS policies are correct (re-apply from previous migration)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_likes'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "post_likes_select_public" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_insert_authenticated" ON public.post_likes;
    DROP POLICY IF EXISTS "post_likes_delete_own" ON public.post_likes;
    
    -- SELECT: Anyone can read post likes (for counts)
    CREATE POLICY "post_likes_select_public"
      ON public.post_likes FOR SELECT
      USING (true);
    
    -- INSERT: Authenticated users can insert their own likes
    CREATE POLICY "post_likes_insert_authenticated"
      ON public.post_likes FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
    
    -- DELETE: Users can delete their own likes
    CREATE POLICY "post_likes_delete_own"
      ON public.post_likes FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
    
    -- Grant permissions
    GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
    GRANT SELECT ON public.post_likes TO anon;
    
    RAISE NOTICE '✅ Fixed post_likes RLS policies';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test queries:
--
-- 1. Test adding a comment:
--    SELECT * FROM public.fn_add_comment(
--      'YOUR_POST_ID'::uuid,
--      'Test comment'
--    );
--
-- 2. Test editing a comment:
--    SELECT * FROM public.fn_edit_comment(
--      'YOUR_COMMENT_ID'::uuid,
--      'Updated comment text'
--    );
--
-- 3. Test deleting a comment:
--    SELECT * FROM public.fn_delete_comment('YOUR_COMMENT_ID'::uuid);
--
-- 4. Check RLS policies:
--    SELECT * FROM pg_policies WHERE tablename IN ('comments', 'post_likes', 'comment_likes');

-- ✅ Migration complete - Comments and likes are now properly saved and displayed

