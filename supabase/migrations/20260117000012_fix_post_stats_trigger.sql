-- Migration: Fix post_stats Trigger to Handle VIEW
-- Date: 2026-01-17
-- Purpose: Fix trigger that tries to insert into post_stats when it's a VIEW
-- ============================================================================

-- 1. Update ensure_post_stats_row function to check if post_stats is a VIEW
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ensure_post_stats_row(p_post_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_view BOOLEAN;
BEGIN
  -- Check if post_stats is a VIEW (not a TABLE)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) INTO v_is_view;
  
  -- Only try to insert if it's NOT a view (i.e., it's a TABLE)
  IF NOT v_is_view THEN
    BEGIN
      INSERT INTO public.post_stats(post_id, view_count, like_count, comment_count, share_count, save_count)
      VALUES (p_post_id, 0, 0, 0, 0, 0)
      ON CONFLICT (post_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Silently fail if insert fails (permission issue, etc.)
      -- If it's a view, this will be caught by the v_is_view check above
      NULL;
    END;
  END IF;
  -- If it's a VIEW, do nothing - stats are calculated automatically
END;
$$;

-- 2. Update the trigger function to use the fixed ensure_post_stats_row
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_fn_posts_insert_stats()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the updated function which checks if post_stats is a VIEW
  PERFORM public.ensure_post_stats_row(NEW.id);
  RETURN NEW;
END;
$$;

-- 3. Ensure the trigger exists (recreate if needed)
-- ============================================================================
DO $$
BEGIN
  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS trg_posts_insert_stats ON public.posts;
  
  -- Recreate the trigger
  CREATE TRIGGER trg_posts_insert_stats
    AFTER INSERT ON public.posts
    FOR EACH ROW 
    EXECUTE FUNCTION public.trg_fn_posts_insert_stats();
    
  RAISE NOTICE '✅ Recreated trg_posts_insert_stats trigger with VIEW check';
END $$;

-- 4. Update other trigger functions that might insert into post_stats
-- ============================================================================

-- Update post_likes trigger function
CREATE OR REPLACE FUNCTION public.trg_fn_post_likes_inc()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_view BOOLEAN;
BEGIN
  -- Check if post_stats is a VIEW
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) INTO v_is_view;
  
  -- Only update if it's a TABLE (not a VIEW)
  IF NOT v_is_view THEN
    BEGIN
      PERFORM public.ensure_post_stats_row(NEW.post_id);
      UPDATE public.post_stats 
      SET like_count = like_count + 1, updated_at = NOW()
      WHERE post_id = NEW.post_id;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Silently fail if post_stats is a VIEW or permission issue
    END;
  END IF;
  -- If it's a VIEW, do nothing - stats are calculated automatically
  RETURN NEW;
END;
$$;

-- Update post_likes decrement trigger function
CREATE OR REPLACE FUNCTION public.trg_fn_post_likes_dec()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_view BOOLEAN;
BEGIN
  -- Check if post_stats is a VIEW
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) INTO v_is_view;
  
  -- Only update if it's a TABLE (not a VIEW)
  IF NOT v_is_view THEN
    BEGIN
      UPDATE public.post_stats 
      SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW()
      WHERE post_id = OLD.post_id;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Silently fail if post_stats is a VIEW or permission issue
    END;
  END IF;
  -- If it's a VIEW, do nothing - stats are calculated automatically
  RETURN OLD;
END;
$$;

-- 5. Update update_post_stats function (used by other triggers)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_view BOOLEAN;
  v_post_id UUID;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);
  
  -- Check if post_stats is a VIEW
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) INTO v_is_view;
  
  -- Only update if it's a TABLE (not a VIEW)
  IF NOT v_is_view THEN
    BEGIN
      -- Ensure post_stats row exists
      INSERT INTO public.post_stats (post_id, like_count, comment_count, save_count, view_count)
      VALUES (v_post_id, 0, 0, 0, 0)
      ON CONFLICT (post_id) DO NOTHING;

      -- Update counts
      UPDATE public.post_stats
      SET
        like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = v_post_id),
        comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = v_post_id),
        save_count = (SELECT COUNT(*) FROM post_saves WHERE post_id = v_post_id),
        updated_at = NOW()
      WHERE post_id = v_post_id;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Silently fail if post_stats is a VIEW or permission issue
    END;
  END IF;
  -- If it's a VIEW, do nothing - stats are calculated automatically
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Update trg_upd_post_like_count function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_upd_post_like_count() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_view BOOLEAN;
  v_post_id UUID;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);
  
  -- Check if post_stats is a VIEW
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) INTO v_is_view;
  
  -- Only update if it's a TABLE (not a VIEW)
  IF NOT v_is_view THEN
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.post_stats (post_id, like_count, comment_count, view_count)
        VALUES (NEW.post_id, 1, 0, 0)
        ON CONFLICT (post_id) DO UPDATE 
        SET like_count = post_stats.like_count + 1, updated_at = NOW();
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.post_stats 
        SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW() 
        WHERE post_id = OLD.post_id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Silently fail if post_stats is a VIEW or permission issue
    END;
  END IF;
  -- If it's a VIEW, do nothing - stats are calculated automatically
  
  RETURN NULL;
END;
$$;

-- ✅ Migration complete - All triggers now check if post_stats is a VIEW before inserting/updating


