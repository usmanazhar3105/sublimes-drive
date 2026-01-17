-- Migration: Core RLS Policies (Simplified)
-- Date: 2025-11-02
-- Purpose: Set up RLS policies for core existing tables only
-- CRITICAL: Admin checks done in APPLICATION LAYER, not in RLS policies

-- Enable RLS on core existing tables
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "posts_select" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_update" ON public.posts;
DROP POLICY IF EXISTS "posts_delete" ON public.posts;

-- ============================================================================
-- POSTS - Public read approved, owner write
-- ============================================================================

CREATE POLICY "posts_public_read"
  ON public.posts FOR SELECT
  USING (status = 'approved');

CREATE POLICY "posts_owner_all"
  ON public.posts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS - Public read, authenticated write
-- ============================================================================

DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_owner_update" ON public.comments;
DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments;

CREATE POLICY "comments_public_read"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_owner_update"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "comments_owner_delete"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POST LIKES - Owner only
-- ============================================================================

DROP POLICY IF EXISTS "post_likes_owner" ON public.post_likes;

CREATE POLICY "post_likes_owner"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- POST SAVES - Owner only
-- ============================================================================

DROP POLICY IF EXISTS "post_saves_owner" ON public.post_saves;

CREATE POLICY "post_saves_owner"
  ON public.post_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- POST REPORTS - Insert only, own reports readable
-- ============================================================================

DROP POLICY IF EXISTS "post_reports_select" ON public.post_reports;
DROP POLICY IF EXISTS "post_reports_insert" ON public.post_reports;

CREATE POLICY "post_reports_select"
  ON public.post_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "post_reports_insert"
  ON public.post_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

