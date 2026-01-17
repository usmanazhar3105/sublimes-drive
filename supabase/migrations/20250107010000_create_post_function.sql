-- ============================================================================
-- CRITICAL: fn_create_post Function
-- Deploy this to enable post creation in Communities
-- ============================================================================

-- Drop any existing versions
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT proname, oidvectortypes(proargtypes) as args 
    FROM pg_proc 
    WHERE proname = 'fn_create_post' 
      AND pronamespace = 'public'::regnamespace
  LOOP 
    EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.proname || '(' || r.args || ') CASCADE'; 
  END LOOP;
END $$;

-- Create fn_create_post function
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
  v_user_id UUID := auth.uid();
  v_post_id UUID;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert post into posts table
  INSERT INTO public.posts (
    user_id,
    title,
    body,
    content,  -- Set both body and content for compatibility
    media,
    tags,
    community_id,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_title,
    p_body,
    p_body,  -- Duplicate body into content column
    p_media,
    p_tags,
    p_community_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.fn_create_post(TEXT, TEXT, JSONB, TEXT[], UUID) 
  IS 'Creates a new community post with media, tags, and optional community assignment';

-- Test
SELECT 'fn_create_post function created successfully!' AS status;

