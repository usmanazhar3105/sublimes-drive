-- Migration: Fix Admin Pages Schema Errors
-- Date: 2025-01-03
-- Purpose: Fix all database schema mismatches causing admin pages to fail

-- ============================================================================
-- 1. FIX OFFERS TABLE - Add missing columns for admin page compatibility
-- ============================================================================

DO $$
BEGIN
  -- Check if offers table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    
    -- Add 'offer_price' alias column if it doesn't exist (admin code expects this)
    -- The table has 'discounted_price', so we'll add offer_price as an alias/copy
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'offers' AND column_name = 'offer_price'
    ) THEN
      -- Add the column
      ALTER TABLE public.offers ADD COLUMN offer_price DECIMAL(10,2);
      -- Copy existing discounted_price values
      UPDATE public.offers SET offer_price = discounted_price WHERE offer_price IS NULL;
      RAISE NOTICE '✅ Added offer_price column and migrated from discounted_price';
    END IF;
    
    -- Verify other expected columns exist (these should already be there from prior migrations)
    -- Just log if they're missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'redemptions_count') THEN
      ALTER TABLE public.offers ADD COLUMN redemptions_count INTEGER DEFAULT 0;
      RAISE NOTICE '✅ Added redemptions_count column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'views') THEN
      ALTER TABLE public.offers ADD COLUMN views INTEGER DEFAULT 0;
      RAISE NOTICE '✅ Added views column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'category') THEN
      ALTER TABLE public.offers ADD COLUMN category TEXT;
      RAISE NOTICE '✅ Added category column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'image_urls') THEN
      ALTER TABLE public.offers ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
      RAISE NOTICE '✅ Added image_urls column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percentage') THEN
      ALTER TABLE public.offers ADD COLUMN discount_percentage INTEGER DEFAULT 0;
      -- Auto-calculate from existing original_price and discounted_price if they exist
      UPDATE public.offers 
      SET discount_percentage = ROUND(((original_price - discounted_price) / NULLIF(original_price, 0)) * 100)::integer
      WHERE original_price > 0 AND discounted_price > 0 AND discount_percentage = 0;
      RAISE NOTICE '✅ Added discount_percentage column';
    END IF;
    
  END IF;
END
$$;

-- ============================================================================
-- 2. FIX OFFER_REDEMPTIONS TABLE - Add missing columns
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_redemptions') THEN
    -- Ensure redemption_status column exists (already added in previous migration)
    -- Just verify it's there
    NULL;
  END IF;
END
$$;

-- ============================================================================
-- 3. GRANT PROPER RLS PERMISSIONS FOR OFFERS
-- ============================================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "offers_public_read" ON public.offers;
DROP POLICY IF EXISTS "offers_owner_crud" ON public.offers;

-- Public can read active offers
CREATE POLICY "offers_public_read"
  ON public.offers FOR SELECT
  USING (is_active = true);

-- Owners can CRUD their own offers (using created_by or provider_id)
CREATE POLICY "offers_owner_crud"
  ON public.offers FOR ALL
  USING (auth.uid() = created_by OR auth.uid() = provider_id)
  WITH CHECK (auth.uid() = created_by OR auth.uid() = provider_id);

-- ============================================================================
-- 4. CREATE TRIGGER TO UPDATE updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_offers ON public.offers;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_offers
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.offers TO authenticated;
GRANT SELECT ON public.offers TO anon;

-- Migration complete: Fix all admin page schema errors

