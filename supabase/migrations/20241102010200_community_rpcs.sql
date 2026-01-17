/**
 * COMMUNITY RPC FUNCTIONS
 * 
 * Safe functions for community interactions:
 * - Toggle post like
 * - Toggle comment like
 * - Add comment (with reply support)
 * - Save/unsave post
 * - Register view
 * 
 * Date: 2025-11-02
 */

-- Drop existing functions first
DROP FUNCTION IF EXISTS fn_toggle_post_like(UUID);
DROP FUNCTION IF EXISTS fn_toggle_comment_like(UUID);
DROP FUNCTION IF EXISTS fn_add_comment(UUID, TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS fn_toggle_post_save(UUID);
DROP FUNCTION IF EXISTS fn_get_post_with_stats(UUID);
DROP FUNCTION IF EXISTS fn_get_comments(UUID);

-- ============================================================================
-- 1. TOGGLE POST LIKE
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_toggle_post_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_liked;

  IF v_liked THEN
    -- Unlike
    DELETE FROM post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    -- Like
    INSERT INTO post_likes (post_id, user_id)
    VALUES (p_post_id, v_user_id)
    ON CONFLICT DO NOTHING;
    v_liked := true;
  END IF;

  -- Get updated count
  SELECT COUNT(*) INTO v_like_count
  FROM post_likes
  WHERE post_id = p_post_id;

  RETURN jsonb_build_object(
    'liked', v_liked,
    'like_count', v_like_count
  );
END;
$$;

-- ============================================================================
-- 2. TOGGLE COMMENT LIKE
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_toggle_comment_like(p_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM comment_likes 
    WHERE comment_id = p_comment_id AND user_id = v_user_id
  ) INTO v_liked;

  IF v_liked THEN
    DELETE FROM comment_likes 
    WHERE comment_id = p_comment_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    INSERT INTO comment_likes (comment_id, user_id)
    VALUES (p_comment_id, v_user_id)
    ON CONFLICT DO NOTHING;
    v_liked := true;
  END IF;

  SELECT COUNT(*) INTO v_like_count
  FROM comment_likes
  WHERE comment_id = p_comment_id;

  RETURN jsonb_build_object(
    'liked', v_liked,
    'like_count', v_like_count
  );
END;
$$;

-- ============================================================================
-- 3. ADD COMMENT (WITH REPLY SUPPORT)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_add_comment(
  p_post_id UUID,
  p_body TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_media JSONB DEFAULT '[]'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_comment_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_body IS NULL OR LENGTH(TRIM(p_body)) = 0 THEN
    RAISE EXCEPTION 'Comment body cannot be empty';
  END IF;

  -- Insert comment
  INSERT INTO comments (post_id, user_id, parent_id, body, media)
  VALUES (p_post_id, v_user_id, p_parent_id, p_body, p_media)
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id;
END;
$$;

-- ============================================================================
-- 4. TOGGLE POST SAVE
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_toggle_post_save(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_saved BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM post_saves 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_saved;

  IF v_saved THEN
    DELETE FROM post_saves 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    v_saved := false;
  ELSE
    INSERT INTO post_saves (post_id, user_id)
    VALUES (p_post_id, v_user_id)
    ON CONFLICT DO NOTHING;
    v_saved := true;
  END IF;

  RETURN jsonb_build_object('saved', v_saved);
END;
$$;

-- ============================================================================
-- 5. GET POST WITH STATS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_get_post_with_stats(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  SELECT jsonb_build_object(
    'post', row_to_json(p.*),
    'author', row_to_json(pr.*),
    'stats', jsonb_build_object(
      'like_count', COALESCE(ps.like_count, 0),
      'comment_count', COALESCE(ps.comment_count, 0),
      'save_count', COALESCE(ps.save_count, 0),
      'view_count', COALESCE(ps.view_count, 0)
    ),
    'user_interaction', jsonb_build_object(
      'liked', EXISTS(SELECT 1 FROM post_likes WHERE post_id = p_post_id AND user_id = v_user_id),
      'saved', EXISTS(SELECT 1 FROM post_saves WHERE post_id = p_post_id AND user_id = v_user_id)
    )
  ) INTO v_result
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN post_stats ps ON p.id = ps.post_id
  WHERE p.id = p_post_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 6. GET COMMENTS FOR POST
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_get_comments(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  SELECT jsonb_agg(
    jsonb_build_object(
      'comment', row_to_json(c.*),
      'author', row_to_json(pr.*),
      'like_count', (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id),
      'liked', EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = v_user_id),
      'replies', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'comment', row_to_json(cr.*),
            'author', row_to_json(prr.*),
            'like_count', (SELECT COUNT(*) FROM comment_likes WHERE comment_id = cr.id),
            'liked', EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = cr.id AND user_id = v_user_id)
          )
          ORDER BY cr.created_at ASC
        )
        FROM comments cr
        LEFT JOIN profiles prr ON cr.user_id = prr.id
        WHERE cr.parent_id = c.id
      )
    )
    ORDER BY c.created_at DESC
  ) INTO v_result
  FROM comments c
  LEFT JOIN profiles pr ON c.user_id = pr.id
  WHERE c.post_id = p_post_id AND c.parent_id IS NULL;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION fn_toggle_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION fn_toggle_comment_like TO authenticated;
GRANT EXECUTE ON FUNCTION fn_add_comment TO authenticated;
GRANT EXECUTE ON FUNCTION fn_toggle_post_save TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_post_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_post_with_stats TO anon;
GRANT EXECUTE ON FUNCTION fn_get_comments TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_comments TO anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ COMMUNITY RPC FUNCTIONS CREATED!';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions:';
    RAISE NOTICE '  ✅ fn_toggle_post_like - Like/unlike posts';
    RAISE NOTICE '  ✅ fn_toggle_comment_like - Like/unlike comments';
    RAISE NOTICE '  ✅ fn_add_comment - Add comments with replies';
    RAISE NOTICE '  ✅ fn_toggle_post_save - Save/unsave posts';
    RAISE NOTICE '  ✅ fn_get_post_with_stats - Get post with all stats';
    RAISE NOTICE '  ✅ fn_get_comments - Get comments with replies';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 COMMUNITY FEATURES READY!';
    RAISE NOTICE '';
END $$;
