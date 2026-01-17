-- ============================================================================
-- QUICK FIX: Add post_type column if missing
-- Run this if fn_get_posts_feed() fails with "column post_type does not exist"
-- ============================================================================

DO $$ 
BEGIN
  -- Add post_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
      AND table_name='posts' 
      AND column_name='post_type'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN post_type TEXT DEFAULT 'regular';
    RAISE NOTICE 'Added post_type column to posts table';
  ELSE
    RAISE NOTICE 'post_type column already exists';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to add post_type column: %', SQLERRM;
END $$;

-- Update existing rows to have default value
UPDATE public.posts 
SET post_type = 'regular' 
WHERE post_type IS NULL;

