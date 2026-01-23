-- Migration: Add location_country column to marketplace_listings
-- Date: 2026-01-20
-- Purpose: Fix "Could not find the 'location_country' column" error

-- Add location_country column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'location_country'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN location_country TEXT DEFAULT 'AE';
    
    -- Add comment
    COMMENT ON COLUMN public.marketplace_listings.location_country IS 'Country code for the listing location (default: AE for UAE)';
  END IF;
END $$;

-- Create index for location_country if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location_country 
ON public.marketplace_listings(location_country);





















