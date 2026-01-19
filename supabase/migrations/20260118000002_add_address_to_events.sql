-- ============================================================================
-- Add address column to events table
-- ============================================================================
-- This migration adds the missing 'address' column to the events table
-- to support meetup/event creation from the frontend
-- ============================================================================

-- Add address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.events ADD COLUMN address TEXT;
    
    -- If location column exists, copy existing location data to address
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'events' 
      AND column_name = 'location'
    ) THEN
      UPDATE public.events 
      SET address = location 
      WHERE address IS NULL AND location IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.events.address IS 'Full address string for the event location (used for meetups)';



