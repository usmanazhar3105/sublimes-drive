-- ============================================================================
-- COMPREHENSIVE FIX: Comments, Likes, and Social Interactions API
-- Date: 2026-01-13
-- Priority: CRITICAL
-- 
-- This migration ensures all tables, RPC functions, and policies are correct
-- for the comments/likes system to work properly with the frontend.
-- ============================================================================

-- ============================================================================
-- PART 1: ENSURE POSTS TABLE EXISTS WITH CORRECT STRUCTURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  content TEXT, -- Alias for body
  media JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'regular' CHECK (post_type IN ('regular', 'poll', 'event', 'question', 'showcase')),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  car_brand TEXT,
  car_model TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted', 'pending')),
  
  -- Counts (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add content column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content') THEN
    ALTER TABLE public.posts ADD COLUMN content TEXT;
  END IF;
  
  -- Add images column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'images') THEN
    ALTER TABLE public.posts ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add status column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
    ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  -- Add count columns if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'like_count') THEN
    ALTER TABLE public.posts ADD COLUMN like_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comment_count') THEN
    ALTER TABLE public.posts ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'share_count') THEN
    ALTER TABLE public.posts ADD COLUMN share_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'save_count') THEN
    ALTER TABLE public.posts ADD COLUMN save_count INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts RLS (no admin checks per project rules)
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
CREATE POLICY "posts_select_all" ON public.posts
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- PART 2: ENSURE COMMENTS TABLE EXISTS WITH CORRECT STRUCTURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  content TEXT, -- Alias for backward compatibility
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Another alias
  like_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'content') THEN
    ALTER TABLE public.comments ADD COLUMN content TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_id') THEN
    ALTER TABLE public.comments ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'like_count') THEN
    ALTER TABLE public.comments ADD COLUMN like_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_hidden') THEN
    ALTER TABLE public.comments ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments RLS
DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (is_hidden = FALSE OR user_id = auth.uid());

DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
CREATE POLICY "comments_insert_auth" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- PART 3: ENSURE POST_LIKES TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_post_like UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_likes_select_all" ON public.post_likes;
CREATE POLICY "post_likes_select_all" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_likes_manage_own" ON public.post_likes;
CREATE POLICY "post_likes_manage_own" ON public.post_likes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 4: ENSURE POST_SAVES TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_post_save UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON public.post_saves(user_id);

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_saves_select_own" ON public.post_saves;
CREATE POLICY "post_saves_select_own" ON public.post_saves
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "post_saves_manage_own" ON public.post_saves;
CREATE POLICY "post_saves_manage_own" ON public.post_saves
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 5: ENSURE POST_SHARES TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_type TEXT DEFAULT 'link' CHECK (share_type IN ('link', 'whatsapp', 'twitter', 'facebook', 'email', 'copy', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_shares_insert_all" ON public.post_shares;
CREATE POLICY "post_shares_insert_all" ON public.post_shares
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "post_shares_select_all" ON public.post_shares;
CREATE POLICY "post_shares_select_all" ON public.post_shares
  FOR SELECT USING (true);

-- ============================================================================
-- PART 6: ENSURE COMMENT_LIKES TABLE EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_comment_like UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_likes_select_all" ON public.comment_likes;
CREATE POLICY "comment_likes_select_all" ON public.comment_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "comment_likes_manage_own" ON public.comment_likes;
CREATE POLICY "comment_likes_manage_own" ON public.comment_likes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 7: POST STATS VIEW (for fast queries)
-- ============================================================================

-- Drop table if it exists (some migrations may have created it as a table)
DO $$
BEGIN
  -- Drop table if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_stats') THEN
    DROP TABLE IF EXISTS public.post_stats CASCADE;
  END IF;
  
  -- Drop view if exists
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'post_stats') THEN
    DROP VIEW IF EXISTS public.post_stats CASCADE;
  END IF;
END $$;

-- Create as view
CREATE OR REPLACE VIEW public.post_stats AS
SELECT 
  p.id AS post_id,
  p.view_count,
  COALESCE(p.like_count, (SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id)) AS like_count,
  COALESCE(p.comment_count, (SELECT COUNT(*) FROM public.comments WHERE post_id = p.id)) AS comment_count,
  COALESCE(p.share_count, (SELECT COUNT(*) FROM public.post_shares WHERE post_id = p.id)) AS share_count,
  COALESCE(p.save_count, (SELECT COUNT(*) FROM public.post_saves WHERE post_id = p.id)) AS save_count
FROM public.posts p;

GRANT SELECT ON public.post_stats TO authenticated;
GRANT SELECT ON public.post_stats TO anon;

-- ============================================================================
-- PART 8: RPC FUNCTIONS (SECURITY DEFINER for atomic operations)
-- ============================================================================

-- Drop existing functions first to avoid parameter name conflicts
-- Drop all overloaded versions of each function
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Loop through all functions we need to drop
  FOR func_record IN 
    SELECT 
      p.proname,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
      'fn_toggle_like',
      'fn_toggle_save', 
      'fn_track_share',
      'fn_toggle_comment_like',
      'fn_add_comment',
      'fn_delete_comment',
      'fn_get_post_with_stats',
      'fn_increment_view'
    )
  LOOP
    -- Drop each function by its exact signature
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                   func_record.proname, 
                   func_record.args);
  END LOOP;
END $$;

-- Toggle Like RPC
-- Note: PostgreSQL identifies functions by signature (name + types), not parameter names
-- So fn_toggle_like(p_post_id UUID) and fn_toggle_like(_post_id UUID) are the same function
CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated', 'liked', false, 'like_count', 0);
  END IF;

  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_liked;
  
  IF v_liked THEN
    -- Unlike
    DELETE FROM public.post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    -- Like
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (p_post_id, v_user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    v_liked := TRUE;
  END IF;
  
  -- Get updated count
  SELECT COUNT(*) INTO v_like_count
  FROM public.post_likes
  WHERE post_id = p_post_id;
  
  -- Update denormalized count on posts table
  UPDATE public.posts SET like_count = v_like_count WHERE id = p_post_id;
  
  RETURN jsonb_build_object(
    'liked', v_liked,
    'like_count', v_like_count
  );
END;
$$;

-- Toggle Save RPC
CREATE OR REPLACE FUNCTION public.fn_toggle_save(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_saved BOOLEAN;
  v_save_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated', 'saved', false, 'save_count', 0);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.post_saves 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_saved;
  
  IF v_saved THEN
    DELETE FROM public.post_saves 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    v_saved := FALSE;
  ELSE
    INSERT INTO public.post_saves (post_id, user_id)
    VALUES (p_post_id, v_user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    v_saved := TRUE;
  END IF;
  
  SELECT COUNT(*) INTO v_save_count
  FROM public.post_saves
  WHERE post_id = p_post_id;
  
  -- Update denormalized count
  UPDATE public.posts SET save_count = v_save_count WHERE id = p_post_id;
  
  RETURN jsonb_build_object(
    'saved', v_saved,
    'save_count', v_save_count
  );
END;
$$;

-- Track Share RPC
CREATE OR REPLACE FUNCTION public.fn_track_share(p_post_id UUID, p_share_type TEXT DEFAULT 'link')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share_count INTEGER;
BEGIN
  INSERT INTO public.post_shares (post_id, user_id, share_type)
  VALUES (p_post_id, auth.uid(), COALESCE(p_share_type, 'link'));
  
  SELECT COUNT(*) INTO v_share_count
  FROM public.post_shares
  WHERE post_id = p_post_id;
  
  -- Update denormalized count
  UPDATE public.posts SET share_count = v_share_count WHERE id = p_post_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'share_count', v_share_count
  );
END;
$$;

-- Toggle Comment Like RPC
CREATE OR REPLACE FUNCTION public.fn_toggle_comment_like(p_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated', 'liked', false, 'like_count', 0);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.comment_likes 
    WHERE comment_id = p_comment_id AND user_id = v_user_id
  ) INTO v_liked;
  
  IF v_liked THEN
    DELETE FROM public.comment_likes 
    WHERE comment_id = p_comment_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.comment_likes (comment_id, user_id)
    VALUES (p_comment_id, v_user_id)
    ON CONFLICT (comment_id, user_id) DO NOTHING;
    v_liked := TRUE;
  END IF;
  
  SELECT COUNT(*) INTO v_like_count
  FROM public.comment_likes
  WHERE comment_id = p_comment_id;
  
  -- Update denormalized count on comment
  UPDATE public.comments SET like_count = v_like_count WHERE id = p_comment_id;
  
  RETURN jsonb_build_object(
    'liked', v_liked,
    'like_count', v_like_count
  );
END;
$$;

-- Add Comment RPC (with automatic count update)
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
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;
  
  IF p_body IS NULL OR TRIM(p_body) = '' THEN
    RETURN jsonb_build_object('error', 'Comment body cannot be empty');
  END IF;

  -- Insert comment
  INSERT INTO public.comments (post_id, user_id, body, content, parent_id)
  VALUES (p_post_id, v_user_id, TRIM(p_body), TRIM(p_body), p_parent_id)
  RETURNING id INTO v_comment_id;
  
  -- Update comment count on post
  SELECT COUNT(*) INTO v_comment_count
  FROM public.comments
  WHERE post_id = p_post_id;
  
  UPDATE public.posts SET comment_count = v_comment_count WHERE id = p_post_id;
  
  -- Get user profile for response
  SELECT display_name, avatar_url INTO v_user_profile
  FROM public.profiles
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment', jsonb_build_object(
      'id', v_comment_id,
      'post_id', p_post_id,
      'user_id', v_user_id,
      'body', TRIM(p_body),
      'content', TRIM(p_body),
      'parent_id', p_parent_id,
      'like_count', 0,
      'created_at', NOW(),
      'user', jsonb_build_object(
        'display_name', v_user_profile.display_name,
        'avatar_url', v_user_profile.avatar_url
      )
    ),
    'comment_count', v_comment_count
  );
END;
$$;

-- Delete Comment RPC  
CREATE OR REPLACE FUNCTION public.fn_delete_comment(p_comment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_post_id UUID;
  v_comment_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Get post_id before deleting
  SELECT post_id INTO v_post_id
  FROM public.comments
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  IF v_post_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Comment not found or not owned by user');
  END IF;

  -- Delete the comment
  DELETE FROM public.comments
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  -- Update comment count
  SELECT COUNT(*) INTO v_comment_count
  FROM public.comments
  WHERE post_id = v_post_id;
  
  UPDATE public.posts SET comment_count = v_comment_count WHERE id = v_post_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment_count', v_comment_count
  );
END;
$$;

-- Get Post with Stats RPC (optimized single query)
CREATE OR REPLACE FUNCTION public.fn_get_post_with_stats(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_post RECORD;
  v_user_liked BOOLEAN := FALSE;
  v_user_saved BOOLEAN := FALSE;
BEGIN
  -- Get post with author profile
  SELECT 
    p.*,
    pr.display_name AS author_name,
    pr.avatar_url AS author_avatar,
    pr.role AS author_role
  INTO v_post
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.id = p_post_id;
  
  IF v_post IS NULL THEN
    RETURN jsonb_build_object('error', 'Post not found');
  END IF;
  
  -- Check if user has liked/saved
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_user_liked;
    SELECT EXISTS(SELECT 1 FROM public.post_saves WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_user_saved;
  END IF;
  
  RETURN jsonb_build_object(
    'post', jsonb_build_object(
      'id', v_post.id,
      'user_id', v_post.user_id,
      'title', v_post.title,
      'body', COALESCE(v_post.body, v_post.content),
      'content', COALESCE(v_post.content, v_post.body),
      'media', v_post.media,
      'images', v_post.images,
      'post_type', v_post.post_type,
      'status', v_post.status,
      'created_at', v_post.created_at,
      'updated_at', v_post.updated_at,
      'author', jsonb_build_object(
        'display_name', v_post.author_name,
        'avatar_url', v_post.author_avatar,
        'role', v_post.author_role
      )
    ),
    'stats', jsonb_build_object(
      'view_count', COALESCE(v_post.view_count, 0),
      'like_count', COALESCE(v_post.like_count, 0),
      'comment_count', COALESCE(v_post.comment_count, 0),
      'share_count', COALESCE(v_post.share_count, 0),
      'save_count', COALESCE(v_post.save_count, 0)
    ),
    'user_interactions', jsonb_build_object(
      'has_liked', v_user_liked,
      'has_saved', v_user_saved
    )
  );
END;
$$;

-- Increment View Count RPC
CREATE OR REPLACE FUNCTION public.fn_increment_view(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_view_count INTEGER;
BEGIN
  UPDATE public.posts 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_post_id
  RETURNING view_count INTO v_view_count;
  
  IF v_view_count IS NULL THEN
    RETURN jsonb_build_object('error', 'Post not found');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'view_count', v_view_count
  );
END;
$$;

-- ============================================================================
-- PART 9: GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Tables
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.post_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT ON public.post_saves TO authenticated;
GRANT INSERT, DELETE ON public.post_saves TO authenticated;
GRANT SELECT, INSERT ON public.post_shares TO anon, authenticated;
GRANT SELECT ON public.comment_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.comment_likes TO authenticated;

-- RPC Functions
GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_save(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_track_share(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_toggle_comment_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_add_comment(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_delete_comment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_post_with_stats(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_increment_view(UUID) TO authenticated, anon;

-- ============================================================================
-- PART 10: TRIGGER TO SYNC BODY/CONTENT COLUMNS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_comment_body_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure both body and content have the same value
  IF NEW.body IS NOT NULL AND NEW.content IS NULL THEN
    NEW.content := NEW.body;
  ELSIF NEW.content IS NOT NULL AND NEW.body IS NULL THEN
    NEW.body := NEW.content;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_comment_body_content ON public.comments;
CREATE TRIGGER tr_sync_comment_body_content
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_body_content();

-- Same for posts
CREATE OR REPLACE FUNCTION public.sync_post_body_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.body IS NOT NULL AND NEW.content IS NULL THEN
    NEW.content := NEW.body;
  ELSIF NEW.content IS NOT NULL AND NEW.body IS NULL THEN
    NEW.body := NEW.content;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_post_body_content ON public.posts;
CREATE TRIGGER tr_sync_post_body_content
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_post_body_content();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Run these to verify:
-- SELECT * FROM pg_proc WHERE proname LIKE 'fn_%' AND pronamespace = 'public'::regnamespace;
-- SELECT * FROM public.posts LIMIT 5;
-- SELECT * FROM public.comments LIMIT 5;
























