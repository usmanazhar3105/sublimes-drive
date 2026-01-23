-- Migration: Add vehicle fields (brand, model, year, mileage) to marketplace_listings
-- Date: 2026-01-20
-- Purpose: Fix 400 error when creating parts/vehicle listings - add missing columns

-- Add brand column if it doesn't exist (for text-based brand names)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'brand'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN brand TEXT;
    
    COMMENT ON COLUMN public.marketplace_listings.brand IS 'Vehicle brand name (text)';
  END IF;
END $$;

-- Add model column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'model'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN model TEXT;
    
    COMMENT ON COLUMN public.marketplace_listings.model IS 'Vehicle model name';
  END IF;
END $$;

-- Add year column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'year'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2);
    
    COMMENT ON COLUMN public.marketplace_listings.year IS 'Vehicle year';
  END IF;
END $$;

-- Add mileage column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'mileage'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN mileage INTEGER CHECK (mileage >= 0);
    
    COMMENT ON COLUMN public.marketplace_listings.mileage IS 'Vehicle mileage in kilometers';
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN status TEXT DEFAULT 'pending' 
      CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'archived', 'sold', 'active', 'inactive'));
    
    COMMENT ON COLUMN public.marketplace_listings.status IS 'Listing status';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand 
ON public.marketplace_listings(brand) WHERE brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_model 
ON public.marketplace_listings(model) WHERE model IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_year 
ON public.marketplace_listings(year) WHERE year IS NOT NULL;

