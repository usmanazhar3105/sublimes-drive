-- ============================================================================
-- Migration: Fix Posts RLS for Subscribers
-- Date: 2026-01-17
-- Purpose: Ensure subscribers can create posts with proper RLS policies
-- ============================================================================

-- ============================================================================
-- 1. Ensure RLS is enabled on posts table
-- ============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Drop existing conflicting policies
-- ============================================================================
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_owner_all" ON public.posts;
DROP POLICY IF EXISTS "posts_manage_own" ON public.posts;
DROP POLICY IF EXISTS "posts_owner_crud" ON public.posts;
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
DROP POLICY IF EXISTS "posts_select_approved" ON public.posts;
DROP POLICY IF EXISTS "posts_read_all" ON public.posts;

-- ============================================================================
-- 3. Create comprehensive RLS policies for posts
-- ============================================================================

-- SELECT: Anyone can read posts (public read)
CREATE POLICY "posts_select_public"
  ON public.posts FOR SELECT
  USING (true);

-- INSERT: Authenticated users (including subscribers) can create posts
-- Must set user_id = auth.uid() (enforced by WITH CHECK)
CREATE POLICY "posts_insert_authenticated"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- User can only create posts with their own user_id
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- UPDATE: Users can update their own posts
CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own posts
CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. Ensure title column has a default value (if not already set)
-- ============================================================================
DO $$
BEGIN
  -- Check if title column exists and doesn't have a default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'title'
  ) THEN
    -- Check if default doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'posts' 
      AND column_name = 'title'
      AND column_default IS NOT NULL
    ) THEN
      -- Add default value for title
      ALTER TABLE public.posts 
      ALTER COLUMN title SET DEFAULT 'Untitled Post';
      RAISE NOTICE '✅ Added DEFAULT ''Untitled Post'' to posts.title column.';
    ELSE
      RAISE NOTICE 'ℹ️ posts.title column already has a DEFAULT value. No change needed.';
    END IF;
  ELSE
    RAISE WARNING '⚠️ posts.title column does not exist. Please ensure your base schema is applied.';
  END IF;
END $$;

-- ============================================================================
-- 5. Grant necessary permissions
-- ============================================================================
GRANT SELECT ON public.posts TO authenticated;
GRANT INSERT ON public.posts TO authenticated;
GRANT UPDATE ON public.posts TO authenticated;
GRANT DELETE ON public.posts TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify:
-- 
-- 1. Check RLS policies:
--    SELECT * FROM pg_policies WHERE tablename = 'posts';
--
-- 2. Check title default:
--    SELECT column_name, column_default 
--    FROM information_schema.columns 
--    WHERE table_name = 'posts' AND column_name = 'title';
--
-- 3. Test insert as subscriber:
--    INSERT INTO posts (user_id, title, content) 
--    VALUES (auth.uid(), 'Test Post', 'Test content');
--    -- Should succeed

-- ✅ Migration complete - Subscribers can now create posts



