-- ============================================================================
-- Sublimes Drive - Universal Interactions System
-- ============================================================================
-- This schema allows interactions (likes, comments, shares, saves) on ANY item
-- type: listing, garage, event, meetup, repair_bid, post, etc.
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UNIVERSAL LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'garage', 'event', 'meetup', 'repair_bid', 'post')),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(item_type, item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_item_likes_item ON item_likes(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_item_likes_user ON item_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_item_likes_created ON item_likes(created_at DESC);

-- ============================================================================
-- 2. UNIVERSAL SAVES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'garage', 'event', 'meetup', 'repair_bid', 'post')),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(item_type, item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_item_saves_item ON item_saves(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_item_saves_user ON item_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_item_saves_created ON item_saves(created_at DESC);

-- ============================================================================
-- 3. UNIVERSAL SHARES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'garage', 'event', 'meetup', 'repair_bid', 'post')),
  item_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Allow anonymous shares
  platform TEXT CHECK (platform IN ('link', 'whatsapp', 'twitter', 'facebook', 'email', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_shares_item ON item_shares(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_user ON item_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_platform ON item_shares(platform);
CREATE INDEX IF NOT EXISTS idx_item_shares_created ON item_shares(created_at DESC);

-- ============================================================================
-- 4. UNIVERSAL COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'garage', 'event', 'meetup', 'repair_bid', 'post')),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES item_comments(id) ON DELETE CASCADE, -- For threading/replies
  
  content TEXT NOT NULL,
  
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_item_comments_item ON item_comments(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_item_comments_user ON item_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_item_comments_parent ON item_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_item_comments_created ON item_comments(created_at DESC);

-- ============================================================================
-- 5. RPC FUNCTIONS - Toggle Like
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_toggle_item_like(
  _item_type TEXT,
  _item_id UUID
)
RETURNS JSON AS $$
DECLARE
  _user_id UUID;
  _existing_like UUID;
  _new_count INTEGER;
  _liked BOOLEAN;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if like exists
  SELECT id INTO _existing_like
  FROM item_likes
  WHERE item_type = _item_type 
    AND item_id = _item_id 
    AND user_id = _user_id;
  
  -- Toggle like
  IF _existing_like IS NOT NULL THEN
    -- Unlike
    DELETE FROM item_likes WHERE id = _existing_like;
    _liked := false;
  ELSE
    -- Like
    INSERT INTO item_likes (item_type, item_id, user_id)
    VALUES (_item_type, _item_id, _user_id);
    _liked := true;
  END IF;
  
  -- Get new count
  SELECT COUNT(*) INTO _new_count
  FROM item_likes
  WHERE item_type = _item_type AND item_id = _item_id;
  
  -- Return result
  RETURN json_build_object(
    'liked', _liked,
    'like_count', _new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. RPC FUNCTIONS - Toggle Save
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_toggle_item_save(
  _item_type TEXT,
  _item_id UUID
)
RETURNS JSON AS $$
DECLARE
  _user_id UUID;
  _existing_save UUID;
  _new_count INTEGER;
  _saved BOOLEAN;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if save exists
  SELECT id INTO _existing_save
  FROM item_saves
  WHERE item_type = _item_type 
    AND item_id = _item_id 
    AND user_id = _user_id;
  
  -- Toggle save
  IF _existing_save IS NOT NULL THEN
    -- Unsave
    DELETE FROM item_saves WHERE id = _existing_save;
    _saved := false;
  ELSE
    -- Save
    INSERT INTO item_saves (item_type, item_id, user_id)
    VALUES (_item_type, _item_id, _user_id);
    _saved := true;
  END IF;
  
  -- Get new count
  SELECT COUNT(*) INTO _new_count
  FROM item_saves
  WHERE item_type = _item_type AND item_id = _item_id;
  
  -- Return result
  RETURN json_build_object(
    'saved', _saved,
    'save_count', _new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. RPC FUNCTIONS - Add Comment
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_add_item_comment(
  _item_type TEXT,
  _item_id UUID,
  _content TEXT,
  _parent_comment_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  _user_id UUID;
  _comment_id UUID;
  _new_count INTEGER;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert comment
  INSERT INTO item_comments (item_type, item_id, user_id, parent_comment_id, content)
  VALUES (_item_type, _item_id, _user_id, _parent_comment_id, _content)
  RETURNING id INTO _comment_id;
  
  -- Update reply count if this is a reply
  IF _parent_comment_id IS NOT NULL THEN
    UPDATE item_comments
    SET reply_count = reply_count + 1
    WHERE id = _parent_comment_id;
  END IF;
  
  -- Get new comment count
  SELECT COUNT(*) INTO _new_count
  FROM item_comments
  WHERE item_type = _item_type 
    AND item_id = _item_id
    AND deleted_at IS NULL;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'comment_id', _comment_id,
    'comment_count', _new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RPC FUNCTIONS - Delete Comment
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_delete_item_comment(
  _comment_id UUID
)
RETURNS JSON AS $$
DECLARE
  _user_id UUID;
  _item_type TEXT;
  _item_id UUID;
  _parent_id UUID;
  _new_count INTEGER;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get comment details and verify ownership
  SELECT item_type, item_id, parent_comment_id
  INTO _item_type, _item_id, _parent_id
  FROM item_comments
  WHERE id = _comment_id AND user_id = _user_id;
  
  IF _item_type IS NULL THEN
    RAISE EXCEPTION 'Comment not found or access denied';
  END IF;
  
  -- Soft delete comment
  UPDATE item_comments
  SET deleted_at = NOW(),
      content = '[deleted]'
  WHERE id = _comment_id;
  
  -- Update parent reply count if this was a reply
  IF _parent_id IS NOT NULL THEN
    UPDATE item_comments
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = _parent_id;
  END IF;
  
  -- Get new comment count
  SELECT COUNT(*) INTO _new_count
  FROM item_comments
  WHERE item_type = _item_type 
    AND item_id = _item_id
    AND deleted_at IS NULL;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'comment_count', _new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE item_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_comments ENABLE ROW LEVEL SECURITY;

-- Likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON item_likes;
CREATE POLICY "Anyone can view likes"
  ON item_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own likes" ON item_likes;
CREATE POLICY "Users can manage their own likes"
  ON item_likes FOR ALL
  USING (auth.uid() = user_id);

-- Saves policies
DROP POLICY IF EXISTS "Users can view their own saves" ON item_saves;
CREATE POLICY "Users can view their own saves"
  ON item_saves FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own saves" ON item_saves;
CREATE POLICY "Users can manage their own saves"
  ON item_saves FOR ALL
  USING (auth.uid() = user_id);

-- Shares policies
DROP POLICY IF EXISTS "Anyone can view shares" ON item_shares;
CREATE POLICY "Anyone can view shares"
  ON item_shares FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create shares" ON item_shares;
CREATE POLICY "Users can create shares"
  ON item_shares FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view non-deleted comments" ON item_comments;
CREATE POLICY "Anyone can view non-deleted comments"
  ON item_comments FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON item_comments;
CREATE POLICY "Authenticated users can create comments"
  ON item_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON item_comments;
CREATE POLICY "Users can update their own comments"
  ON item_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON item_comments;
CREATE POLICY "Users can delete their own comments"
  ON item_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on tables
GRANT ALL ON item_likes TO authenticated;
GRANT ALL ON item_saves TO authenticated;
GRANT ALL ON item_shares TO authenticated;
GRANT ALL ON item_comments TO authenticated;

-- Grant select to anon for viewing
GRANT SELECT ON item_likes TO anon;
GRANT SELECT ON item_shares TO anon;
GRANT SELECT ON item_comments TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION fn_toggle_item_like TO authenticated;
GRANT EXECUTE ON FUNCTION fn_toggle_item_save TO authenticated;
GRANT EXECUTE ON FUNCTION fn_add_item_comment TO authenticated;
GRANT EXECUTE ON FUNCTION fn_delete_item_comment TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Universal Interactions System created successfully!';
  RAISE NOTICE '   - item_likes table';
  RAISE NOTICE '   - item_saves table';
  RAISE NOTICE '   - item_shares table';
  RAISE NOTICE '   - item_comments table';
  RAISE NOTICE '   - RPC functions for interactions';
  RAISE NOTICE '   - RLS policies enabled';
END $$;

