-- ============================================================================
-- Migration: Fix xp_events schema - Remove xp_amount column reference
-- Date: 2026-01-17
-- 
-- Fixes: Column "xp_amount" does not exist error
-- The table uses "points" not "xp_amount"
-- ============================================================================

-- Check if xp_events table exists and has correct schema
DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'xp_events'
  ) THEN
    -- Check if xp_amount column exists (shouldn't, but check anyway)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'xp_events' 
      AND column_name = 'xp_amount'
    ) THEN
      -- Drop the incorrect column if it exists
      ALTER TABLE public.xp_events DROP COLUMN IF EXISTS xp_amount;
      RAISE NOTICE '✅ Removed incorrect xp_amount column';
    END IF;
    
    -- Ensure points column exists (correct column name)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'xp_events' 
      AND column_name = 'points'
    ) THEN
      -- Add points column if missing
      ALTER TABLE public.xp_events 
      ADD COLUMN points INT NOT NULL DEFAULT 0;
      RAISE NOTICE '✅ Added points column';
    END IF;
    
    RAISE NOTICE '✅ xp_events table schema verified';
  ELSE
    RAISE NOTICE '⚠️ xp_events table does not exist - will be created by other migrations';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'xp_events' 
-- ORDER BY ordinal_position;
-- 
-- Should show: id, user_id, kind, points (NOT xp_amount), meta, created_at





