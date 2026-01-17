-- ============================================================================
-- FIX: Posts table - Ensure both 'body' and 'content' columns exist
-- Date: 2025-11-03
-- Purpose: Sync body/content columns and update RPC functions
-- ============================================================================

-- Add 'body' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'body'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN body TEXT;
    -- Copy content to body if content exists and has data
    UPDATE public.posts SET body = content WHERE content IS NOT NULL AND body IS NULL;
  END IF;
END $$;

-- Add 'content' column if it doesn't exist (for backwards compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN content TEXT;
    -- Copy body to content if body exists and has data
    UPDATE public.posts SET content = body WHERE body IS NOT NULL AND content IS NULL;
  END IF;
END $$;

-- Sync body and content for existing rows
UPDATE public.posts 
SET content = body 
WHERE body IS NOT NULL AND content IS NULL;

UPDATE public.posts 
SET body = content 
WHERE content IS NOT NULL AND body IS NULL;

-- Drop and recreate fn_create_post to ensure it works with both columns
DROP FUNCTION IF EXISTS public.fn_create_post(TEXT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_community_id UUID DEFAULT NULL,
  p_media JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO public.posts (
    user_id, 
    community_id, 
    title, 
    body,
    content,  -- Set both columns
    media, 
    status
  )
  VALUES (
    auth.uid(), 
    p_community_id, 
    p_title, 
    p_body,
    p_body,  -- Sync content with body
    p_media, 
    'pending'
  )
  RETURNING id INTO v_post_id;
  
  RETURN v_post_id;
END;
$$;

COMMENT ON FUNCTION public.fn_create_post IS 'Creates a new post with both body and content columns synced';

