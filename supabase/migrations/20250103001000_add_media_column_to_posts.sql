-- Migration: Add media column to posts table
-- Date: 2025-01-03
-- Purpose: Fix "column media does not exist" error when creating posts with images

-- Add media column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN media JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN public.posts.media IS 'Array of media objects (images/videos) with URLs and metadata';
  END IF;
END
$$;

-- Add index for faster queries on posts with media
CREATE INDEX IF NOT EXISTS idx_posts_media ON public.posts USING GIN (media);

COMMENT ON INDEX idx_posts_media IS 'GIN index for JSONB media column to speed up queries';

