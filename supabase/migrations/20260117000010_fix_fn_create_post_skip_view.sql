-- ============================================================================
-- Migration: Fix fn_create_post to Skip post_stats Insert if it's a VIEW
-- Date: 2026-01-17
-- Purpose: Fix "permission denied for view post_stats" error when creating posts
-- ============================================================================

-- ============================================================================
-- 1. Update fn_create_post to properly handle post_stats VIEW
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT DEFAULT NULL,
  p_body TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_media JSONB DEFAULT '[]'::JSONB,
  p_tags TEXT[] DEFAULT '{}'::TEXT[],
  p_community_id UUID DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_car_brand TEXT DEFAULT NULL,
  p_car_model TEXT DEFAULT NULL,
  p_urgency TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
  v_title TEXT;
  v_content TEXT;
  v_body TEXT;
  v_is_post_stats_table BOOLEAN;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Determine title (use p_title, or generate from content, or use default)
  v_title := COALESCE(
    NULLIF(TRIM(p_title), ''),
    NULLIF(TRIM(SUBSTRING(COALESCE(p_content, p_body, ''), 1, 50)), ''),
    'Untitled Post'
  );
  
  -- Determine content/body (use p_content, or p_body, or default)
  v_content := COALESCE(
    NULLIF(TRIM(p_content), ''),
    NULLIF(TRIM(p_body), ''),
    '[No content]'
  );
  v_body := v_content; -- Use same value for both if both columns exist
  
  -- CRITICAL: Ensure title is NEVER null (even if empty string, use default)
  IF v_title IS NULL OR v_title = '' THEN
    v_title := 'Untitled Post';
  END IF;
  
  -- Insert post - try with all columns, let database handle missing ones
  BEGIN
    INSERT INTO public.posts (
      user_id,
      title,
      content,
      body,
      images,
      media,
      tags,
      location,
      car_brand,
      car_model,
      urgency,
      status,
      created_at
    )
    VALUES (
      v_user_id,
      v_title,
      v_content,
      v_body,
      CASE WHEN jsonb_typeof(p_media) = 'array' THEN p_media ELSE '[]'::JSONB END,
      CASE WHEN jsonb_typeof(p_media) = 'array' THEN p_media ELSE '[]'::JSONB END,
      COALESCE(p_tags, '{}'::TEXT[]),
      NULLIF(TRIM(p_location), ''),
      NULLIF(TRIM(p_car_brand), ''),
      NULLIF(TRIM(p_car_model), ''),
      NULLIF(TRIM(p_urgency), ''),
      'approved',
      NOW()
    )
    RETURNING id INTO v_post_id;
  EXCEPTION WHEN undefined_column THEN
    -- If some columns don't exist, try minimal insert
    INSERT INTO public.posts (
      user_id,
      title,
      content,
      status,
      created_at
    )
    VALUES (
      v_user_id,
      v_title,
      v_content,
      'approved',
      NOW()
    )
    RETURNING id INTO v_post_id;
  END;
  
  -- CRITICAL FIX: Check if post_stats is a TABLE (not a VIEW) before inserting
  -- If it's a VIEW, skip the insert entirely (views are read-only and calculated automatically)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
    AND table_type = 'BASE TABLE'  -- Only insert if it's a TABLE, not a VIEW
  ) INTO v_is_post_stats_table;
  
  -- Only try to insert into post_stats if it's actually a TABLE
  IF v_is_post_stats_table THEN
    BEGIN
      INSERT INTO public.post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
      VALUES (v_post_id, 0, 0, 0, 0, 0)
      ON CONFLICT (post_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Silently fail if post_stats insert fails (permission issue, etc.)
      -- If it's a view, this will fail, but we've already checked, so this is a real error
      -- Log it but don't fail the post creation
      RAISE WARNING 'Failed to insert into post_stats: % - %', SQLERRM, SQLSTATE;
    END;
  ELSE
    -- post_stats is a VIEW - no insert needed, stats are calculated automatically
    -- This is the expected behavior, so we just continue
    NULL;
  END IF;
  
  RETURN v_post_id;
EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  RAISE WARNING 'fn_create_post failed: % - %', SQLERRM, SQLSTATE;
  RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_create_post(
  TEXT, TEXT, TEXT, JSONB, TEXT[], UUID, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

-- ============================================================================
-- 2. Update the simpler overload as well
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_community_id UUID DEFAULT NULL,
  p_media JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the main function with mapped parameters
  RETURN public.fn_create_post(
    p_title := p_title,
    p_body := p_body,
    p_content := p_body,
    p_media := p_media,
    p_tags := '{}'::TEXT[],
    p_community_id := p_community_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_create_post(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ============================================================================
-- 3. Ensure post_stats VIEW has proper permissions (if it's a view)
-- ============================================================================

DO $$
BEGIN
  -- If post_stats is a VIEW, ensure it has SELECT permissions
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'post_stats'
  ) THEN
    -- Grant SELECT on view to authenticated users
    GRANT SELECT ON public.post_stats TO authenticated;
    GRANT SELECT ON public.post_stats TO anon;
    
    RAISE NOTICE '✅ Granted SELECT on post_stats VIEW to authenticated users';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the function:
--
-- 1. Check if post_stats is view or table:
--    SELECT 
--      CASE 
--        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'post_stats') 
--        THEN 'VIEW'
--        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_stats' AND table_type = 'BASE TABLE')
--        THEN 'TABLE'
--        ELSE 'DOES NOT EXIST'
--      END AS post_stats_type;
--
-- 2. Test post creation:
--    SELECT public.fn_create_post(
--      p_title := 'Test Post',
--      p_body := 'Test content',
--      p_media := '[]'::JSONB
--    );
--    Should return a UUID without errors

-- ✅ Migration complete - fn_create_post now properly skips post_stats insert if it's a VIEW

