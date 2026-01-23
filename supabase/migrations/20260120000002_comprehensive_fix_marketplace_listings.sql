-- Migration: Comprehensive fix for marketplace_listings table
-- Date: 2026-01-20
-- Purpose: Add ALL potentially missing columns that the code might try to insert
-- This is a safe migration that only adds columns if they don't exist

-- ============================================================================
-- 1. LOCATION FIELDS
-- ============================================================================

-- location_country
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'location_country'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN location_country TEXT DEFAULT 'AE';
  END IF;
END $$;

-- ============================================================================
-- 2. VEHICLE FIELDS
-- ============================================================================

-- brand
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'brand'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN brand TEXT;
  END IF;
END $$;

-- model
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'model'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN model TEXT;
  END IF;
END $$;

-- year
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'year'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN year INTEGER CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2));
  END IF;
END $$;

-- mileage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'mileage'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN mileage INTEGER CHECK (mileage IS NULL OR mileage >= 0);
  END IF;
END $$;

-- ============================================================================
-- 3. STATUS FIELD
-- ============================================================================

-- status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN status TEXT DEFAULT 'pending' 
      CHECK (status IS NULL OR status IN ('draft', 'pending', 'approved', 'rejected', 'archived', 'sold', 'active', 'inactive'));
  END IF;
END $$;

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location_country 
ON public.marketplace_listings(location_country) WHERE location_country IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand 
ON public.marketplace_listings(brand) WHERE brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_model 
ON public.marketplace_listings(model) WHERE model IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_year 
ON public.marketplace_listings(year) WHERE year IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status 
ON public.marketplace_listings(status) WHERE status IS NOT NULL;

-- ============================================================================
-- 5. VERIFICATION QUERY (for debugging)
-- ============================================================================

-- Uncomment to verify columns were added:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'marketplace_listings'
--   AND column_name IN ('location_country', 'brand', 'model', 'year', 'mileage', 'status')
-- ORDER BY column_name;

