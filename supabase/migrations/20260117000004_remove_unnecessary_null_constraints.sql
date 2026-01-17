-- ============================================================================
-- Migration: Remove Unnecessary NULL Constraints
-- Date: 2026-01-17
-- Purpose: Make database more flexible by removing unnecessary NOT NULL constraints
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE - Make most fields nullable (except id)
-- ============================================================================

DO $$
BEGIN
  -- Make email nullable (OAuth users might not have email initially)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
    RAISE NOTICE '✅ Made profiles.email nullable';
  END IF;

  -- Make full_name nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'full_name'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
    RAISE NOTICE '✅ Made profiles.full_name nullable';
  END IF;

  -- Make display_name nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'display_name'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN display_name DROP NOT NULL;
    RAISE NOTICE '✅ Made profiles.display_name nullable';
  END IF;

  -- Ensure role has DEFAULT (already done, but verify)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
    AND column_default IS NULL
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'subscriber';
    RAISE NOTICE '✅ Set profiles.role DEFAULT to subscriber';
  END IF;
END $$;

-- ============================================================================
-- 2. POSTS TABLE - Make title nullable with DEFAULT
-- ============================================================================

DO $$
BEGIN
  -- Make title nullable (will use DEFAULT if not provided)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'title'
    AND is_nullable = 'NO'
  ) THEN
    -- First ensure DEFAULT exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'posts' 
      AND column_name = 'title'
      AND column_default IS NOT NULL
    ) THEN
      ALTER TABLE public.posts ALTER COLUMN title SET DEFAULT 'Untitled Post';
    END IF;
    
    ALTER TABLE public.posts ALTER COLUMN title DROP NOT NULL;
    RAISE NOTICE '✅ Made posts.title nullable with DEFAULT';
  END IF;

  -- Make content nullable (image-only posts)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'content'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.posts ALTER COLUMN content DROP NOT NULL;
    RAISE NOTICE '✅ Made posts.content nullable';
  END IF;

  -- Make body nullable (if exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'body'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.posts ALTER COLUMN body DROP NOT NULL;
    RAISE NOTICE '✅ Made posts.body nullable';
  END IF;
END $$;

-- ============================================================================
-- 3. COMMENTS TABLE - Make content nullable
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comments'
  ) THEN
    -- Make content nullable (image-only comments)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'comments' 
      AND column_name = 'content'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE public.comments ALTER COLUMN content DROP NOT NULL;
      RAISE NOTICE '✅ Made comments.content nullable';
    END IF;

    -- Make body nullable (if exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'comments' 
      AND column_name = 'body'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE public.comments ALTER COLUMN body DROP NOT NULL;
      RAISE NOTICE '✅ Made comments.body nullable';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to check nullable columns:
-- SELECT column_name, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'posts', 'comments')
-- ORDER BY table_name, column_name;

-- ✅ Migration complete - Database is now more flexible

