-- ============================================================================
-- Fix: fn_create_post to set BOTH body AND content columns
-- Issue: posts table has both body and content columns, but RPC only sets body
-- ============================================================================

DROP FUNCTION IF EXISTS public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID);

CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_media JSONB DEFAULT '[]'::JSONB,
  p_tags TEXT[] DEFAULT '{}'::TEXT[],
  p_community_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
  v_content TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Ensure p_body is never null - default to '[Image Post]' if empty
  v_content := COALESCE(NULLIF(TRIM(p_body), ''), '[Image Post]');
  
  -- Insert into posts table - set BOTH body AND content columns
  INSERT INTO public.posts (
    id, 
    user_id, 
    community_id, 
    title, 
    body, 
    content,  -- ✅ FIX: Set content column to avoid NOT NULL constraint violation
    media, 
    tags, 
    status, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    v_user_id, 
    p_community_id, 
    p_title, 
    v_content,  -- body
    v_content,  -- content (same value)
    p_media, 
    p_tags, 
    'pending', 
    NOW()
  ) RETURNING id INTO v_post_id;
  
  -- Initialize post stats
  INSERT INTO public.post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
  VALUES (v_post_id, 0, 0, 0, 0, 0)
  ON CONFLICT (post_id) DO NOTHING;
  
  RETURN v_post_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID) IS 'Creates a post with both body and content columns set';

