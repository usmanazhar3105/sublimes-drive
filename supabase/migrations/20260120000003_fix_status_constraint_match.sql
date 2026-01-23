-- Migration: Fix status constraint to match existing constraint values
-- Date: 2026-01-20
-- Purpose: Ensure status column matches the actual constraint ('pending', 'active', 'sold')

-- If status column exists but constraint doesn't match, we need to handle it carefully
-- The existing constraint shows: status IN ('pending', 'active', 'sold' and possibly more)

-- Check and update status column default if needed
DO $$
BEGIN
  -- If status column exists, ensure default is 'pending' (which is in the constraint)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'status'
  ) THEN
    -- Update default if it's not 'pending'
    ALTER TABLE public.marketplace_listings 
    ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
END $$;

-- Note: We don't modify the constraint itself as it already exists
-- The constraint allows: 'pending', 'active', 'sold' (and possibly more values)
-- The code should only use these values


















