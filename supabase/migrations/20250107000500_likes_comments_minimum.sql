-- ============================================================================
-- MASTER FIX: Comment Likes + Comment Images (RLS + RPCs + Storage)
-- ============================================================================

-- ENUM + profiles baseline (if you already have these, this is idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('browser','car_owner','garage_owner','vendor','admin');
  END IF;
END $$;

-- Ensure profiles table exists with necessary columns
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'browser',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Helper function for admin checks (avoids RLS recursion)
-- Checks both is_admin column AND role='admin' for flexibility
CREATE OR REPLACE FUNCTION is_admin_from_profiles(uid UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
AS $$
  SELECT COALESCE(
    (SELECT (is_admin = TRUE OR role = 'admin') FROM profiles WHERE id = uid), 
    FALSE
  );
$$;

-- Core community objects (using UUID for post_id to match existing posts table)
-- Note: This works with existing `posts` table (UUID IDs) via a flexible foreign key
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL, -- References posts(id) but flexible to avoid schema conflicts
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_comment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint if posts table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    -- Add FK constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_community_comments_post_id'
    ) THEN
      ALTER TABLE community_comments 
      ADD CONSTRAINT fk_community_comments_post_id 
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comment_images ENABLE ROW LEVEL SECURITY;

-- Profiles: self + admin
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_self_select ON profiles;
  CREATE POLICY profiles_self_select ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin_from_profiles(auth.uid()));
  
  DROP POLICY IF EXISTS profiles_self_update ON profiles;
  CREATE POLICY profiles_self_update ON profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin_from_profiles(auth.uid()));
END $$;

-- Posts: Comments inherit post visibility from existing posts table RLS
-- (No need to create policies for community_posts since we're using existing posts table)

-- Comments: read post viewers (check posts table); insert/update author/admin
DO $$ BEGIN
  DROP POLICY IF EXISTS comments_select_inherit_post ON community_comments;
  CREATE POLICY comments_select_inherit_post ON community_comments FOR SELECT
    USING ( EXISTS(
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (
        -- Allow if post owner, or admin, or post is public (status = 'published' or similar)
        p.user_id = auth.uid() 
        OR is_admin_from_profiles(auth.uid())
        OR p.status IN ('published', 'active', 'pending') -- Common public statuses
        OR p.status IS NULL -- If no status column, assume public
      )
    ));
  
  DROP POLICY IF EXISTS comments_insert_auth ON community_comments;
  CREATE POLICY comments_insert_auth ON community_comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  
  DROP POLICY IF EXISTS comments_update_author_or_admin ON community_comments;
  CREATE POLICY comments_update_author_or_admin ON community_comments FOR UPDATE
    USING (author_id = auth.uid() OR is_admin_from_profiles(auth.uid()));
END $$;

-- Comment likes: viewers can read; author of like can insert/delete; admin can do all
DO $$ BEGIN
  DROP POLICY IF EXISTS likes_select_inherit_post ON community_comment_likes;
  CREATE POLICY likes_select_inherit_post ON community_comment_likes FOR SELECT
    USING ( EXISTS(
      SELECT 1 FROM community_comments c 
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (
        p.user_id = auth.uid() 
        OR is_admin_from_profiles(auth.uid())
        OR p.status IN ('published', 'active', 'pending')
        OR p.status IS NULL
      )
    ));
  
  DROP POLICY IF EXISTS likes_insert_self ON community_comment_likes;
  CREATE POLICY likes_insert_self ON community_comment_likes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS likes_delete_self_or_admin ON community_comment_likes;
  CREATE POLICY likes_delete_self_or_admin ON community_comment_likes FOR DELETE
    USING (user_id = auth.uid() OR is_admin_from_profiles(auth.uid()));
END $$;

-- Comment images: viewers read; authors insert; admin manage
DO $$ BEGIN
  DROP POLICY IF EXISTS cimg_select_inherit_post ON community_comment_images;
  CREATE POLICY cimg_select_inherit_post ON community_comment_images FOR SELECT
    USING ( EXISTS(
      SELECT 1 FROM community_comments c 
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (
        p.user_id = auth.uid() 
        OR is_admin_from_profiles(auth.uid())
        OR p.status IN ('published', 'active', 'pending')
        OR p.status IS NULL
      )
    ));
  
  DROP POLICY IF EXISTS cimg_insert_commenter ON community_comment_images;
  CREATE POLICY cimg_insert_commenter ON community_comment_images FOR INSERT
    WITH CHECK ( EXISTS(
      SELECT 1 FROM community_comments c 
      WHERE c.id = comment_id 
      AND c.author_id = auth.uid()
    ));
  
  DROP POLICY IF EXISTS cimg_delete_admin ON community_comment_images;
  CREATE POLICY cimg_delete_admin ON community_comment_images FOR DELETE
    USING (is_admin_from_profiles(auth.uid()));
END $$;

-- RPC: toggle like on a comment (idempotent click) - using UUID
DROP FUNCTION IF EXISTS public.toggle_comment_like(UUID);

CREATE OR REPLACE FUNCTION public.toggle_comment_like(p_comment_id UUID)
RETURNS TABLE (liked BOOLEAN, like_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS(SELECT 1 FROM community_comment_likes WHERE comment_id = p_comment_id AND user_id = v_uid) THEN
    DELETE FROM community_comment_likes WHERE comment_id = p_comment_id AND user_id = v_uid;
    RETURN QUERY 
      SELECT FALSE AS liked, 
             (SELECT COUNT(*)::BIGINT FROM community_comment_likes WHERE comment_id = p_comment_id) AS like_count;
  ELSE
    INSERT INTO community_comment_likes (comment_id, user_id) VALUES (p_comment_id, v_uid);
    RETURN QUERY 
      SELECT TRUE AS liked, 
             (SELECT COUNT(*)::BIGINT FROM community_comment_likes WHERE comment_id = p_comment_id) AS like_count;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.toggle_comment_like(UUID) TO authenticated, anon;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comment_likes_comment_id ON community_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_community_comment_likes_user_id ON community_comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comment_images_comment_id ON community_comment_images(comment_id);

-- Comments
COMMENT ON FUNCTION public.toggle_comment_like(UUID) IS 'Toggle like on a comment (idempotent click)';
COMMENT ON TABLE community_comment_likes IS 'Likes on comments';
COMMENT ON TABLE community_comment_images IS 'Images attached to comments';

