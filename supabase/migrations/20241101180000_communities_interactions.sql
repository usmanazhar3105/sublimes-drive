-- ============================================================================
-- COMMUNITIES INTERACTIONS - Missing Tables for Like/Save/Share/Report
-- ============================================================================
-- This migration adds the missing interaction tables for the Communities module
-- All changes are additive and non-breaking

-- ============================================================================
-- 1. POST LIKES
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
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON public.post_likes(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Everyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Admin can manage all likes" ON public.post_likes;

-- Users can manage their own likes
CREATE POLICY "Users can manage own likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Everyone can view likes (for counts)
CREATE POLICY "Everyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

-- Admin/editor full access
CREATE POLICY "Admin can manage all likes"
  ON public.post_likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 2. POST SAVES (Bookmarks)
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
CREATE INDEX IF NOT EXISTS idx_post_saves_created ON public.post_saves(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saves" ON public.post_saves;
DROP POLICY IF EXISTS "Users can view own saves" ON public.post_saves;
DROP POLICY IF EXISTS "Admin can manage all saves" ON public.post_saves;

-- Users can manage their own saves
CREATE POLICY "Users can manage own saves"
  ON public.post_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own saves (privacy)
CREATE POLICY "Users can view own saves"
  ON public.post_saves FOR SELECT
  USING (auth.uid() = user_id);

-- Admin/editor full access
CREATE POLICY "Admin can manage all saves"
  ON public.post_saves FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 3. POST SHARES (Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('link', 'whatsapp', 'twitter', 'facebook', 'email', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_type ON public.post_shares(share_type);
CREATE INDEX IF NOT EXISTS idx_post_shares_created ON public.post_shares(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create shares" ON public.post_shares;
DROP POLICY IF EXISTS "Users can view own shares" ON public.post_shares;
DROP POLICY IF EXISTS "Admin can manage all shares" ON public.post_shares;

-- Anyone can create shares (even anonymous for tracking)
CREATE POLICY "Anyone can create shares"
  ON public.post_shares FOR INSERT
  WITH CHECK (true);

-- Users can view their own shares
CREATE POLICY "Users can view own shares"
  ON public.post_shares FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin/editor full access
CREATE POLICY "Admin can manage all shares"
  ON public.post_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 4. REPORTS (Content Moderation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'listing', 'garage', 'user', 'event')),
  entity_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_entity ON public.reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Admin can manage all reports" ON public.reports;

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admin/editor can view and manage all reports
CREATE POLICY "Admin can manage all reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 5. COMMENT LIKES
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

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Everyone can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Admin can manage all comment likes" ON public.comment_likes;

-- Users can manage their own comment likes
CREATE POLICY "Users can manage own comment likes"
  ON public.comment_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Everyone can view comment likes
CREATE POLICY "Everyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

-- Admin full access
CREATE POLICY "Admin can manage all comment likes"
  ON public.comment_likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reports_updated_at ON public.reports;
CREATE TRIGGER tr_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 7. VIEWS FOR AGGREGATED COUNTS
-- ============================================================================

CREATE OR REPLACE VIEW public.v_post_stats AS
SELECT 
  p.id AS post_id,
  COUNT(DISTINCT pl.user_id) AS like_count,
  COUNT(DISTINCT ps.user_id) AS save_count,
  COUNT(DISTINCT psh.id) AS share_count,
  COUNT(DISTINCT c.id) AS comment_count
FROM public.posts p
LEFT JOIN public.post_likes pl ON pl.post_id = p.id
LEFT JOIN public.post_saves ps ON ps.post_id = p.id
LEFT JOIN public.post_shares psh ON psh.post_id = p.id
LEFT JOIN public.comments c ON c.post_id = p.id
GROUP BY p.id;

-- Grant access to view
GRANT SELECT ON public.v_post_stats TO authenticated;
GRANT SELECT ON public.v_post_stats TO anon;

-- ============================================================================
-- 8. RPC FUNCTIONS FOR TOGGLE OPERATIONS
-- ============================================================================

-- Toggle Like
CREATE OR REPLACE FUNCTION public.fn_toggle_like(_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _liked BOOLEAN;
  _like_count INTEGER;
BEGIN
  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes 
    WHERE post_id = _post_id AND user_id = auth.uid()
  ) INTO _liked;
  
  IF _liked THEN
    -- Unlike
    DELETE FROM public.post_likes 
    WHERE post_id = _post_id AND user_id = auth.uid();
  ELSE
    -- Like
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
  END IF;
  
  -- Get updated count
  SELECT COUNT(*) INTO _like_count
  FROM public.post_likes
  WHERE post_id = _post_id;
  
  RETURN jsonb_build_object(
    'liked', NOT _liked,
    'like_count', _like_count
  );
END;
$$;

-- Toggle Save
CREATE OR REPLACE FUNCTION public.fn_toggle_save(_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _saved BOOLEAN;
  _save_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.post_saves 
    WHERE post_id = _post_id AND user_id = auth.uid()
  ) INTO _saved;
  
  IF _saved THEN
    DELETE FROM public.post_saves 
    WHERE post_id = _post_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.post_saves (post_id, user_id)
    VALUES (_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
  END IF;
  
  SELECT COUNT(*) INTO _save_count
  FROM public.post_saves
  WHERE post_id = _post_id;
  
  RETURN jsonb_build_object(
    'saved', NOT _saved,
    'save_count', _save_count
  );
END;
$$;

-- Track Share
CREATE OR REPLACE FUNCTION public.fn_track_share(
  _post_id UUID,
  _share_type TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _share_count INTEGER;
BEGIN
  INSERT INTO public.post_shares (post_id, user_id, share_type)
  VALUES (_post_id, auth.uid(), _share_type);
  
  SELECT COUNT(*) INTO _share_count
  FROM public.post_shares
  WHERE post_id = _post_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'share_count', _share_count
  );
END;
$$;

-- Toggle Comment Like
CREATE OR REPLACE FUNCTION public.fn_toggle_comment_like(_comment_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _liked BOOLEAN;
  _like_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.comment_likes 
    WHERE comment_id = _comment_id AND user_id = auth.uid()
  ) INTO _liked;
  
  IF _liked THEN
    DELETE FROM public.comment_likes 
    WHERE comment_id = _comment_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.comment_likes (comment_id, user_id)
    VALUES (_comment_id, auth.uid())
    ON CONFLICT (comment_id, user_id) DO NOTHING;
  END IF;
  
  SELECT COUNT(*) INTO _like_count
  FROM public.comment_likes
  WHERE comment_id = _comment_id;
  
  RETURN jsonb_build_object(
    'liked', NOT _liked,
    'like_count', _like_count
  );
END;
$$;

-- Create Report
CREATE OR REPLACE FUNCTION public.fn_create_report(
  _entity_type TEXT,
  _entity_id UUID,
  _reason TEXT,
  _description TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _report_id UUID;
BEGIN
  -- Check if user already reported this entity
  IF EXISTS (
    SELECT 1 FROM public.reports
    WHERE entity_type = _entity_type
      AND entity_id = _entity_id
      AND reporter_id = auth.uid()
      AND status IN ('pending', 'reviewing')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have already reported this content'
    );
  END IF;
  
  INSERT INTO public.reports (entity_type, entity_id, reporter_id, reason, description)
  VALUES (_entity_type, _entity_id, auth.uid(), _reason, _description)
  RETURNING id INTO _report_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'report_id', _report_id
  );
END;
$$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE public.post_likes IS 'Tracks user likes on posts';
COMMENT ON TABLE public.post_saves IS 'Tracks user bookmarks/saves on posts';
COMMENT ON TABLE public.post_shares IS 'Tracks post shares across platforms';
COMMENT ON TABLE public.reports IS 'Content moderation reports';
COMMENT ON TABLE public.comment_likes IS 'Tracks user likes on comments';
