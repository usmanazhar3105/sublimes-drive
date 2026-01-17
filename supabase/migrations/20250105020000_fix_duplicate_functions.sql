-- ============================================================================
-- FIX DUPLICATE FUNCTIONS - Clean All Versions
-- ============================================================================
-- This migration removes all versions of duplicate functions
-- Then recreates them with clean, unambiguous signatures
-- ============================================================================

-- ============================================================================
-- PART 1: DROP ALL VERSIONS OF CONFLICTING FUNCTIONS
-- ============================================================================

-- Drop all versions of fn_create_post
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT oid::regprocedure::text AS func_signature
    FROM pg_proc
    WHERE proname = 'fn_create_post'
    AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped: %', r.func_signature;
  END LOOP;
END $$;

-- Drop all versions of other potentially conflicting functions
DO $$
DECLARE
  r RECORD;
  v_func_name TEXT;
BEGIN
  FOR v_func_name IN SELECT unnest(ARRAY['fn_toggle_like', 'fn_toggle_save', 'fn_add_comment', 'fn_toggle_comment_like'])
  LOOP
    FOR r IN 
      SELECT oid::regprocedure::text AS func_signature
      FROM pg_proc
      WHERE proname = v_func_name
      AND pronamespace = 'public'::regnamespace
    LOOP
      EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
      RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: RECREATE CLEAN VERSIONS
-- ============================================================================

-- Create Post (clean signature)
CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_media JSONB DEFAULT '[]'::JSONB,
  p_tags TEXT[] DEFAULT '{}'::TEXT[],
  p_community_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.posts (
    id, user_id, community_id, title, body, media, tags, status, created_at
  ) VALUES (
    gen_random_uuid(), v_user_id, p_community_id, p_title, p_body, p_media, p_tags, 'pending', NOW()
  ) RETURNING id INTO v_post_id;
  
  INSERT INTO public.post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
  VALUES (v_post_id, 0, 0, 0, 0, 0)
  ON CONFLICT (post_id) DO NOTHING;
  
  RETURN v_post_id;
END;
$$;

-- Toggle Like (clean signature)
CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_liked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_liked := TRUE;
  END IF;
  
  RETURN jsonb_build_object('liked', v_liked);
END;
$$;

-- Toggle Save (clean signature)
CREATE OR REPLACE FUNCTION public.fn_toggle_save(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_saved BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.post_saves WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.post_saves WHERE post_id = p_post_id AND user_id = v_user_id;
    v_saved := FALSE;
  ELSE
    INSERT INTO public.post_saves (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_saved := TRUE;
  END IF;
  
  RETURN jsonb_build_object('saved', v_saved);
END;
$$;

-- Add Comment (clean signature)
CREATE OR REPLACE FUNCTION public.fn_add_comment(
  p_post_id UUID,
  p_content TEXT,
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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.comments (
    id, post_id, user_id, parent_comment_id, body, created_at
  ) VALUES (
    gen_random_uuid(), p_post_id, v_user_id, p_parent_id, p_content, NOW()
  ) RETURNING id INTO v_comment_id;
  
  RETURN jsonb_build_object('comment_id', v_comment_id);
END;
$$;

-- Toggle Comment Like (clean signature)
CREATE OR REPLACE FUNCTION public.fn_toggle_comment_like(p_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_liked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.comment_likes (comment_id, user_id) VALUES (p_comment_id, v_user_id);
    v_liked := TRUE;
  END IF;
  
  RETURN jsonb_build_object('liked', v_liked);
END;
$$;

-- ============================================================================
-- PART 3: GRANT PERMISSIONS (with explicit signatures)
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_save(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_add_comment(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_comment_like(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_create_post_count INT;
  v_toggle_like_count INT;
BEGIN
  SELECT COUNT(*) INTO v_create_post_count FROM pg_proc WHERE proname = 'fn_create_post';
  SELECT COUNT(*) INTO v_toggle_like_count FROM pg_proc WHERE proname = 'fn_toggle_like';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DUPLICATE FUNCTIONS FIXED';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'fn_create_post versions: %', v_create_post_count;
  RAISE NOTICE 'fn_toggle_like versions: %', v_toggle_like_count;
  RAISE NOTICE '';
  IF v_create_post_count = 1 AND v_toggle_like_count = 1 THEN
    RAISE NOTICE '✅ All functions now have unique signatures';
  ELSE
    RAISE NOTICE '⚠️  Warning: Multiple function versions still exist';
  END IF;
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

