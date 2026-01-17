-- ============================================================================
-- COMMUNITY CORE: comments, likes, saves, stats, RLS, RPC
-- Idempotent and safe to re-run
-- ============================================================================

-- Extensions for UUID if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------
-- Tables
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'comments'
  ) THEN
    CREATE TABLE public.comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      body TEXT NOT NULL,
      media TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
      parent_id UUID NULL REFERENCES public.comments(id) ON DELETE CASCADE,
      like_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes'
  ) THEN
    CREATE TABLE public.post_likes (
      user_id UUID NOT NULL,
      post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT post_likes_pk PRIMARY KEY (user_id, post_id)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_likes'
  ) THEN
    CREATE TABLE public.comment_likes (
      user_id UUID NOT NULL,
      comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT comment_likes_pk PRIMARY KEY (user_id, comment_id)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_posts'
  ) THEN
    CREATE TABLE public.saved_posts (
      user_id UUID NOT NULL,
      post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT saved_posts_pk PRIMARY KEY (user_id, post_id)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'post_stats'
  ) THEN
    CREATE TABLE public.post_stats (
      post_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
      like_count INTEGER NOT NULL DEFAULT 0,
      comment_count INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0
    );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);

-- ----------------------------
-- RLS
-- ----------------------------
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_stats ENABLE ROW LEVEL SECURITY;

-- Comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comments_select_public' AND tablename = 'comments'
  ) THEN
    CREATE POLICY comments_select_public ON public.comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comments_insert_self' AND tablename = 'comments'
  ) THEN
    CREATE POLICY comments_insert_self ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comments_update_self' AND tablename = 'comments'
  ) THEN
    CREATE POLICY comments_update_self ON public.comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comments_delete_self' AND tablename = 'comments'
  ) THEN
    CREATE POLICY comments_delete_self ON public.comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Post Likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'post_likes_select_public' AND tablename = 'post_likes'
  ) THEN
    CREATE POLICY post_likes_select_public ON public.post_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'post_likes_insert_self' AND tablename = 'post_likes'
  ) THEN
    CREATE POLICY post_likes_insert_self ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'post_likes_delete_self' AND tablename = 'post_likes'
  ) THEN
    CREATE POLICY post_likes_delete_self ON public.post_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Comment Likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comment_likes_select_public' AND tablename = 'comment_likes'
  ) THEN
    CREATE POLICY comment_likes_select_public ON public.comment_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comment_likes_insert_self' AND tablename = 'comment_likes'
  ) THEN
    CREATE POLICY comment_likes_insert_self ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'comment_likes_delete_self' AND tablename = 'comment_likes'
  ) THEN
    CREATE POLICY comment_likes_delete_self ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Saved Posts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'saved_posts_select_public' AND tablename = 'saved_posts'
  ) THEN
    CREATE POLICY saved_posts_select_public ON public.saved_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'saved_posts_insert_self' AND tablename = 'saved_posts'
  ) THEN
    CREATE POLICY saved_posts_insert_self ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'saved_posts_delete_self' AND tablename = 'saved_posts'
  ) THEN
    CREATE POLICY saved_posts_delete_self ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- post_stats read-only for public
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'post_stats_select_public' AND tablename = 'post_stats'
  ) THEN
    CREATE POLICY post_stats_select_public ON public.post_stats FOR SELECT USING (true);
  END IF;
END $$;

-- ----------------------------
-- Stats and triggers
-- ----------------------------
CREATE OR REPLACE FUNCTION public.ensure_post_stats_row(p_post_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.post_stats(post_id)
  VALUES (p_post_id)
  ON CONFLICT (post_id) DO NOTHING;
END;$$;

-- Ensure stats on posts insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_posts_insert_stats'
  ) THEN
    CREATE OR REPLACE FUNCTION public.trg_fn_posts_insert_stats()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      PERFORM public.ensure_post_stats_row(NEW.id);
      RETURN NEW;
    END;
    $fn$;
    CREATE TRIGGER trg_posts_insert_stats
      AFTER INSERT ON public.posts
      FOR EACH ROW EXECUTE FUNCTION public.trg_fn_posts_insert_stats();
  END IF;
END$$;

-- Likes triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_post_likes_inc') THEN
    CREATE OR REPLACE FUNCTION public.trg_fn_post_likes_inc()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      PERFORM public.ensure_post_stats_row(NEW.post_id);
      UPDATE public.post_stats SET like_count = like_count + 1 WHERE post_id = NEW.post_id;
      RETURN NEW;
    END;
    $fn$;
    CREATE TRIGGER trg_post_likes_inc
      AFTER INSERT ON public.post_likes
      FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_likes_inc();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_post_likes_dec') THEN
    CREATE OR REPLACE FUNCTION public.trg_fn_post_likes_dec()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      UPDATE public.post_stats SET like_count = GREATEST(like_count - 1, 0) WHERE post_id = OLD.post_id;
      RETURN OLD;
    END;
    $fn$;
    CREATE TRIGGER trg_post_likes_dec
      AFTER DELETE ON public.post_likes
      FOR EACH ROW EXECUTE FUNCTION public.trg_fn_post_likes_dec();
  END IF;
END $$;

-- Comments triggers -> comment_count
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_comments_inc') THEN
    CREATE OR REPLACE FUNCTION public.trg_fn_comments_inc()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      PERFORM public.ensure_post_stats_row(NEW.post_id);
      UPDATE public.post_stats SET comment_count = comment_count + 1 WHERE post_id = NEW.post_id;
      RETURN NEW;
    END;
    $fn$;
    CREATE TRIGGER trg_comments_inc
      AFTER INSERT ON public.comments
      FOR EACH ROW EXECUTE FUNCTION public.trg_fn_comments_inc();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_comments_dec') THEN
    CREATE OR REPLACE FUNCTION public.trg_fn_comments_dec()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      UPDATE public.post_stats SET comment_count = GREATEST(comment_count - 1, 0) WHERE post_id = OLD.post_id;
      RETURN OLD;
    END;
    $fn$;
    CREATE TRIGGER trg_comments_dec
      AFTER DELETE ON public.comments
      FOR EACH ROW EXECUTE FUNCTION public.trg_fn_comments_dec();
  END IF;
END $$;

-- Increment views RPC used by Edge Function
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.post_stats SET view_count = view_count + 1 WHERE post_id = increment_post_views.post_id;
$$;

-- ----------------------------
-- RPCs for client hooks
-- ----------------------------
-- Toggle post like
CREATE OR REPLACE FUNCTION public.fn_toggle_post_like(p_post_id uuid)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_exists BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM public.post_likes WHERE user_id = auth.uid() AND post_id = p_post_id
  ) INTO v_exists;
  IF v_exists THEN
    DELETE FROM public.post_likes WHERE user_id = auth.uid() AND post_id = p_post_id;
  ELSE
    INSERT INTO public.post_likes(user_id, post_id) VALUES (auth.uid(), p_post_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN jsonb_build_object(
    'liked', NOT v_exists,
    'like_count', (SELECT like_count FROM public.post_stats WHERE post_id = p_post_id)
  );
END;$$;

-- Toggle comment like
CREATE OR REPLACE FUNCTION public.fn_toggle_comment_like(p_comment_id uuid)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_exists BOOLEAN; v_post uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT post_id INTO v_post FROM public.comments WHERE id = p_comment_id;
  IF v_post IS NULL THEN
    RAISE EXCEPTION 'Comment not found';
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM public.comment_likes WHERE user_id = auth.uid() AND comment_id = p_comment_id
  ) INTO v_exists;
  IF v_exists THEN
    DELETE FROM public.comment_likes WHERE user_id = auth.uid() AND comment_id = p_comment_id;
    UPDATE public.comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_comment_id;
  ELSE
    INSERT INTO public.comment_likes(user_id, comment_id) VALUES (auth.uid(), p_comment_id)
    ON CONFLICT DO NOTHING;
    UPDATE public.comments SET like_count = like_count + 1 WHERE id = p_comment_id;
  END IF;
  RETURN jsonb_build_object(
    'liked', NOT v_exists,
    'like_count', (SELECT like_count FROM public.comments WHERE id = p_comment_id)
  );
END;$$;

-- Add comment
CREATE OR REPLACE FUNCTION public.fn_add_comment(
  p_post_id uuid,
  p_body text,
  p_parent_id uuid DEFAULT NULL,
  p_media text[] DEFAULT ARRAY[]::text[]
) RETURNS public.comments LANGUAGE plpgsql AS $$
DECLARE v_comment public.comments;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.comments(post_id, user_id, body, media, parent_id)
  VALUES (p_post_id, auth.uid(), p_body, COALESCE(p_media, ARRAY[]::text[]), p_parent_id)
  RETURNING * INTO v_comment;
  RETURN v_comment;
END;$$;

-- Get post with stats (json)
CREATE OR REPLACE FUNCTION public.fn_get_post_with_stats(p_post_id uuid)
RETURNS jsonb LANGUAGE sql AS $$
  SELECT jsonb_build_object(
    'post', to_jsonb(p.*),
    'stats', to_jsonb(s.*)
  )
  FROM public.posts p
  LEFT JOIN public.post_stats s ON s.post_id = p.id
  WHERE p.id = p_post_id;
$$;

-- Get comments for a post (flat list)
DROP FUNCTION IF EXISTS public.fn_get_comments(uuid);
CREATE OR REPLACE FUNCTION public.fn_get_comments(p_post_id uuid)
RETURNS SETOF public.comments LANGUAGE sql AS $$
  SELECT * FROM public.comments WHERE post_id = p_post_id ORDER BY created_at ASC;
$$;
