-- ============================================================================
-- 20251114000000_core_rls_and_likes.sql
-- Core RLS policies and like toggle helper for communities & marketplace
-- ============================================================================

-- Ensure helper schema + functions exist (idempotent)
CREATE SCHEMA IF NOT EXISTS app;

-- Admin helper mirrored from existing conventions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_jwt jsonb := auth.jwt();
  v_claim_admin boolean := COALESCE((v_jwt->>'is_admin')::boolean, false);
  v_claim_role text := NULLIF(auth.role(), '');
  v_db_admin boolean := false;
BEGIN
  -- Service role always bypasses
  IF v_claim_role = 'service_role' THEN
    RETURN true;
  END IF;

  -- JWT claim hint
  IF v_claim_admin THEN
    RETURN true;
  END IF;

  -- DB-backed role check
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_uid
      AND p.role IN ('admin', 'superadmin')
  )
  INTO v_db_admin;

  RETURN v_db_admin;
END;
$$;

-- Convenience helpers (align with existing conventions)
CREATE OR REPLACE FUNCTION app.is_service()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.role() = 'service_role' $$;

CREATE OR REPLACE FUNCTION app.is_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.uid() IS NOT NULL AND user_id = auth.uid() $$;

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Owner or admin/service can manage posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_posts'
      AND policyname = 'community_posts_owner_rw'
  ) THEN
    CREATE POLICY community_posts_owner_rw
      ON public.community_posts
      FOR ALL
      TO authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = author_id
      )
      WITH CHECK (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = author_id
      );
  END IF;
END;
$$;

-- Public (anon + authenticated) can read only approved posts, owners/admin can always read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_posts'
      AND policyname = 'community_posts_public_read_approved'
  ) THEN
    CREATE POLICY community_posts_public_read_approved
      ON public.community_posts
      FOR SELECT
      TO anon, authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = author_id
        OR approved = true
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_community_posts_author
  ON public.community_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_approved
  ON public.community_posts(approved);

-- ============================================================================
-- COMMUNITY POST COMMENTS
-- ============================================================================

ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_post_comments'
      AND policyname = 'community_comments_owner_rw'
  ) THEN
    CREATE POLICY community_comments_owner_rw
      ON public.community_post_comments
      FOR ALL
      TO authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      )
      WITH CHECK (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_post_comments'
      AND policyname = 'community_comments_public_read_approved'
  ) THEN
    CREATE POLICY community_comments_public_read_approved
      ON public.community_post_comments
      FOR SELECT
      TO anon, authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
        OR EXISTS (
          SELECT 1
          FROM public.community_posts p
          WHERE p.id = community_post_comments.post_id
            AND (p.approved = true OR p.author_id = auth.uid())
        )
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_community_comments_post
  ON public.community_post_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_user
  ON public.community_post_comments(user_id);

-- ============================================================================
-- COMMUNITY POST LIKES
-- ============================================================================

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_post_likes'
      AND policyname = 'community_post_likes_owner_manage'
  ) THEN
    CREATE POLICY community_post_likes_owner_manage
      ON public.community_post_likes
      FOR ALL
      TO authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      )
      WITH CHECK (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'community_post_likes'
      AND policyname = 'community_post_likes_public_read_approved'
  ) THEN
    CREATE POLICY community_post_likes_public_read_approved
      ON public.community_post_likes
      FOR SELECT
      TO anon, authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
        OR EXISTS (
          SELECT 1
          FROM public.community_posts p
          WHERE p.id = community_post_likes.post_id
            AND (p.approved = true OR p.author_id = auth.uid())
        )
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_user
  ON public.community_post_likes(post_id, user_id);

-- ============================================================================
-- MARKETPLACE LISTINGS
-- ============================================================================

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketplace_listings'
      AND policyname = 'marketplace_listings_owner_rw'
  ) THEN
    CREATE POLICY marketplace_listings_owner_rw
      ON public.marketplace_listings
      FOR ALL
      TO authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      )
      WITH CHECK (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketplace_listings'
      AND policyname = 'marketplace_listings_public_read_approved'
  ) THEN
    CREATE POLICY marketplace_listings_public_read_approved
      ON public.marketplace_listings
      FOR SELECT
      TO anon, authenticated
      USING (
        app.is_admin()
        OR app.is_service()
        OR auth.uid() = user_id
        OR status = 'approved'::status_enum
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user
  ON public.marketplace_listings(user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status
  ON public.marketplace_listings(status);

-- ============================================================================
-- RPC: toggle_community_post_like
-- ============================================================================

CREATE OR REPLACE FUNCTION public.toggle_community_post_like(p_post_id uuid)
RETURNS TABLE(liked boolean, like_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, extensions
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.community_post_likes
    WHERE post_id = p_post_id
      AND user_id = v_user
  ) THEN
    DELETE FROM public.community_post_likes
    WHERE post_id = p_post_id
      AND user_id = v_user;
    liked := false;
  ELSE
    INSERT INTO public.community_post_likes(post_id, user_id)
    VALUES (p_post_id, v_user)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    liked := true;
  END IF;

  SELECT COUNT(*)::bigint
  INTO like_count
  FROM public.community_post_likes
  WHERE post_id = p_post_id;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_community_post_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_community_post_like(uuid) TO service_role;

-- ============================================================================
-- END
-- ============================================================================

