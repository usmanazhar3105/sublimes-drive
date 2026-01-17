-- ============================================================================
-- Migration: Fix post_saves 406 Error
-- Date: 2026-01-17
-- Purpose: Fix RLS policies for post_saves to prevent 406 errors
-- ============================================================================

-- ============================================================================
-- 1. Ensure post_saves table exists
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_post_save UNIQUE(post_id, user_id)
);

-- Add foreign keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_saves_post_id_fkey'
  ) THEN
    ALTER TABLE public.post_saves 
    ADD CONSTRAINT post_saves_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_saves_user_id_fkey'
  ) THEN
    ALTER TABLE public.post_saves 
    ADD CONSTRAINT post_saves_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_post ON public.post_saves(user_id, post_id);

-- ============================================================================
-- 2. Enable RLS and drop existing policies
-- ============================================================================

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "post_saves_select_own" ON public.post_saves;
DROP POLICY IF EXISTS "post_saves_insert_own" ON public.post_saves;
DROP POLICY IF EXISTS "post_saves_delete_own" ON public.post_saves;
DROP POLICY IF EXISTS "post_saves_owner" ON public.post_saves;
DROP POLICY IF EXISTS "post_saves_public_read" ON public.post_saves;

-- ============================================================================
-- 3. Create comprehensive RLS policies
-- ============================================================================

-- SELECT: Users can read their own saves
CREATE POLICY "post_saves_select_own"
  ON public.post_saves FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- SELECT: Users can also check if a specific post is saved (for UI)
-- This allows queries like: SELECT id FROM post_saves WHERE user_id = X AND post_id = Y
CREATE POLICY "post_saves_select_check"
  ON public.post_saves FOR SELECT
  TO authenticated
  USING (
    -- User can check their own saves
    user_id = auth.uid()
    OR
    -- User can check if any post is saved (for counts, but not see who saved it)
    -- This is handled by the fact that we only return id, not user_id
    true
  );

-- Actually, let's simplify - users can only see their own saves
-- But we need to allow the query format: SELECT id WHERE user_id = X AND post_id = Y
-- The issue is the query is using .eq() filters which need to match RLS USING clause

-- Better approach: Allow SELECT for authenticated users checking their own saves
DROP POLICY IF EXISTS "post_saves_select_own" ON public.post_saves;
DROP POLICY IF EXISTS "post_saves_select_check" ON public.post_saves;

CREATE POLICY "post_saves_select_authenticated"
  ON public.post_saves FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Users can save posts
CREATE POLICY "post_saves_insert_authenticated"
  ON public.post_saves FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can unsave posts
CREATE POLICY "post_saves_delete_own"
  ON public.post_saves FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.post_saves TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test query (should work):
-- SELECT id FROM post_saves 
-- WHERE user_id = auth.uid() 
-- AND post_id = 'POST_ID';
--
-- This should return the id if saved, or empty if not saved

-- ✅ Migration complete - post_saves RLS is fixed

