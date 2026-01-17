-- ============================================================================
-- Migration: Fix All Subscriber Permissions
-- Date: 2026-01-17
-- Purpose: Ensure subscribers can perform all basic user operations
-- ============================================================================

-- ============================================================================
-- 1. COMMENTS - Ensure subscribers can create comments
-- ============================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own" ON public.comments;
DROP POLICY IF EXISTS "comments_owner_update" ON public.comments;
DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments;

-- SELECT: Anyone can read comments
CREATE POLICY "comments_select_public"
  ON public.comments FOR SELECT
  USING (true);

-- INSERT: Authenticated users (including subscribers) can create comments
CREATE POLICY "comments_insert_authenticated"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    (user_id = auth.uid() OR user_id IS NULL)
  );

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

-- ============================================================================
-- 2. POST LIKES - Ensure subscribers can like posts
-- ============================================================================
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "post_likes_select_all" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_manage_own" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_insert" ON public.post_likes;

-- SELECT: Anyone can read likes (for counts)
CREATE POLICY "post_likes_select_public"
  ON public.post_likes FOR SELECT
  USING (true);

-- INSERT: Authenticated users can like posts
CREATE POLICY "post_likes_insert_authenticated"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- DELETE: Users can unlike their own likes
CREATE POLICY "post_likes_delete_own"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. COMMENT LIKES - Ensure subscribers can like comments
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comment_likes'
  ) THEN
    ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "comment_likes_select_all" ON public.comment_likes;
    DROP POLICY IF EXISTS "comment_likes_manage_own" ON public.comment_likes;
    
    CREATE POLICY "comment_likes_select_public"
      ON public.comment_likes FOR SELECT
      USING (true);
    
    CREATE POLICY "comment_likes_insert_authenticated"
      ON public.comment_likes FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND
        (user_id = auth.uid() OR user_id IS NULL)
      );
    
    CREATE POLICY "comment_likes_delete_own"
      ON public.comment_likes FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- 4. POST SAVES - Ensure subscribers can save posts
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_saves'
  ) THEN
    ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "post_saves_select_own" ON public.post_saves;
    DROP POLICY IF EXISTS "post_saves_insert_own" ON public.post_saves;
    DROP POLICY IF EXISTS "post_saves_delete_own" ON public.post_saves;
    
    CREATE POLICY "post_saves_select_own"
      ON public.post_saves FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
    
    CREATE POLICY "post_saves_insert_own"
      ON public.post_saves FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "post_saves_delete_own"
      ON public.post_saves FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comment_likes') THEN
    GRANT SELECT, INSERT, DELETE ON public.comment_likes TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_saves') THEN
    GRANT SELECT, INSERT, DELETE ON public.post_saves TO authenticated;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify:
--
-- 1. Check comments policies:
--    SELECT * FROM pg_policies WHERE tablename = 'comments';
--
-- 2. Check post_likes policies:
--    SELECT * FROM pg_policies WHERE tablename = 'post_likes';
--
-- 3. Test as subscriber:
--    -- Create comment
--    INSERT INTO comments (post_id, user_id, content) 
--    VALUES ('POST_ID', auth.uid(), 'Test comment');
--
--    -- Like post
--    INSERT INTO post_likes (post_id, user_id) 
--    VALUES ('POST_ID', auth.uid());

-- ✅ Migration complete - Subscribers can now perform all basic operations



