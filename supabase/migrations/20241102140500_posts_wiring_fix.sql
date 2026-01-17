-- ============================================================================
-- POSTS WIRING FIX (idempotent)
-- Ensures required columns/policies for posts used by Edge Functions and UI
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    -- Core columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content'
    ) THEN
      ALTER TABLE posts ADD COLUMN content TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'images'
    ) THEN
      ALTER TABLE posts ADD COLUMN images TEXT[] DEFAULT ARRAY[]::text[] NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags'
    ) THEN
      ALTER TABLE posts ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[] NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'location'
    ) THEN
      ALTER TABLE posts ADD COLUMN location TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count'
    ) THEN
      ALTER TABLE posts ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;

    -- Ownership column (server expects user_id)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE posts ADD COLUMN user_id UUID;
    END IF;

    -- Helpful indexes
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)';
    EXCEPTION WHEN undefined_column THEN
      -- created_at not present; ignore
      NULL;
    END;

    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
  END IF;
END $$;

-- Increment views function used by Edge Function
CREATE OR REPLACE FUNCTION increment_post_views(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = post_id;
$$;

-- Enable RLS and basic policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    BEGIN
      EXECUTE 'ALTER TABLE posts ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN NULL; END;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_select_public'
    ) THEN
      CREATE POLICY posts_select_public ON posts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_insert_owner'
    ) THEN
      CREATE POLICY posts_insert_owner ON posts FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_update_owner'
    ) THEN
      CREATE POLICY posts_update_owner ON posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_delete_owner'
    ) THEN
      CREATE POLICY posts_delete_owner ON posts FOR DELETE USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;
