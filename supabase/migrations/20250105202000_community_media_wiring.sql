-- === COMMUNITY: posts/comments with media + likes/saves + stats ===
SET search_path = public;

-- Core posts table: create only if missing
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  like_count INT NOT NULL DEFAULT 0,
  save_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS community_posts_read ON public.community_posts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY IF NOT EXISTS community_posts_insert ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS community_posts_update ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS community_posts_delete ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- Comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS community_comments_read ON public.community_comments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY IF NOT EXISTS community_comments_insert ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS community_comments_delete ON public.community_comments FOR DELETE TO authenticated USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- Post media
CREATE TABLE IF NOT EXISTS public.community_post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT 'community-media',
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bucket, path)
);
ALTER TABLE public.community_post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS community_post_media_read ON public.community_post_media FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY IF NOT EXISTS community_post_media_insert ON public.community_post_media FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS community_post_media_delete ON public.community_post_media FOR DELETE TO authenticated USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- Comment media
CREATE TABLE IF NOT EXISTS public.community_comment_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT 'community-media',
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bucket, path)
);
ALTER TABLE public.community_comment_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS community_comment_media_read ON public.community_comment_media FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY IF NOT EXISTS community_comment_media_insert ON public.community_comment_media FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS community_comment_media_delete ON public.community_comment_media FOR DELETE TO authenticated USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('admin','editor')));

-- Likes & saves
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS post_likes_read ON public.community_post_likes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY IF NOT EXISTS post_likes_write ON public.community_post_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_post_saves (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.community_post_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS post_saves_read ON public.community_post_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS post_saves_write ON public.community_post_saves FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Counters
CREATE OR REPLACE FUNCTION public.fn_post_like_counter() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_post_like_counter_ins ON public.community_post_likes;
CREATE TRIGGER trg_post_like_counter_ins AFTER INSERT ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_like_counter();
DROP TRIGGER IF EXISTS trg_post_like_counter_del ON public.community_post_likes;
CREATE TRIGGER trg_post_like_counter_del AFTER DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_like_counter();

CREATE OR REPLACE FUNCTION public.fn_post_save_counter() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET save_count = save_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET save_count = GREATEST(0, save_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_post_save_counter_ins ON public.community_post_saves;
CREATE TRIGGER trg_post_save_counter_ins AFTER INSERT ON public.community_post_saves
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_save_counter();
DROP TRIGGER IF EXISTS trg_post_save_counter_del ON public.community_post_saves;
CREATE TRIGGER trg_post_save_counter_del AFTER DELETE ON public.community_post_saves
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_save_counter();

CREATE OR REPLACE FUNCTION public.fn_post_comment_counter() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_post_comment_counter_ins ON public.community_comments;
CREATE TRIGGER trg_post_comment_counter_ins AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_comment_counter();
DROP TRIGGER IF EXISTS trg_post_comment_counter_del ON public.community_comments;
CREATE TRIGGER trg_post_comment_counter_del AFTER DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.fn_post_comment_counter();

-- Media attach RPCs (paths come from client after using Storage)
CREATE OR REPLACE FUNCTION public.fn_attach_post_media(p_post UUID, p_paths TEXT[])
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count INT := 0;
BEGIN
  PERFORM 1 FROM public.community_posts WHERE id=p_post AND author_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not allowed'; END IF;
  INSERT INTO public.community_post_media(post_id, owner_id, path, bucket)
  SELECT p_post, auth.uid(), unnest(p_paths), 'community-media'
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;
GRANT EXECUTE ON FUNCTION public.fn_attach_post_media(UUID, TEXT[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_attach_comment_media(p_comment UUID, p_paths TEXT[])
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count INT := 0;
BEGIN
  PERFORM 1 FROM public.community_comments WHERE id=p_comment AND author_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not allowed'; END IF;
  INSERT INTO public.community_comment_media(comment_id, owner_id, path, bucket)
  SELECT p_comment, auth.uid(), unnest(p_paths), 'community-media'
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;
GRANT EXECUTE ON FUNCTION public.fn_attach_comment_media(UUID, TEXT[]) TO authenticated;
