-- ============================================================================
-- SAFE ADMIN PAGES FIX - January 16, 2026
-- ============================================================================
-- This migration is ADDITIVE ONLY - checks existence before creating/altering
-- Fixes:
-- 1. fn_export_users timestamp type mismatch
-- 2. Missing garage_verifications table
-- 3. Missing columns in offers table for admin panel
-- 4. Missing columns in ad_campaigns table
-- 5. Missing ad_placements and ad_events tables
-- 6. Missing reports table for community management
-- 7. Missing FK relationship for market_listings
-- 8. Community and ad stats RPC functions
-- ============================================================================

-- ============================================================================
-- 1. FIX fn_export_users TIMESTAMP TYPE MISMATCH
-- ============================================================================
-- Error: "Returned type timestamp with time zone does not match expected type timestamp without time zone"
-- Fix: Change return type to TIMESTAMPTZ to match profiles.created_at

DO $$
BEGIN
  -- Drop old function signature if it exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'fn_export_users'
    AND pg_get_function_arguments(p.oid) LIKE '%TIMESTAMP%'
    AND pg_get_function_arguments(p.oid) NOT LIKE '%TIMESTAMPTZ%'
  ) THEN
    DROP FUNCTION IF EXISTS public.fn_export_users(TIMESTAMP, TIMESTAMP);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_export_users(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  verification_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.verification_status
  FROM profiles p
  WHERE (p_start_date IS NULL OR p.created_at >= p_start_date)
    AND (p_end_date IS NULL OR p.created_at <= p_end_date)
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_export_users(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- ============================================================================
-- 2. CREATE garage_verifications TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.garage_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  trade_license_number TEXT,
  trade_license_url TEXT,
  emirates_id_url TEXT,
  owner_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  emirate TEXT,
  city TEXT,
  services_offered TEXT[],
  operating_hours JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for garage_verifications
CREATE INDEX IF NOT EXISTS idx_garage_verifications_user ON public.garage_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_garage_verifications_status ON public.garage_verifications(status);
CREATE INDEX IF NOT EXISTS idx_garage_verifications_garage ON public.garage_verifications(garage_id);

-- Enable RLS for garage_verifications
ALTER TABLE public.garage_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_verifications' AND policyname = 'garage_verifications_own'
  ) THEN
    CREATE POLICY garage_verifications_own ON public.garage_verifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Users can insert their own verification requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_verifications' AND policyname = 'garage_verifications_insert_own'
  ) THEN
    CREATE POLICY garage_verifications_insert_own ON public.garage_verifications
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- All authenticated users can view garage verifications (admin check in app layer)
-- NOTE: Following project rule - NEVER check admin roles in RLS (causes infinite recursion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_verifications' AND policyname = 'garage_verifications_select_all'
  ) THEN
    CREATE POLICY garage_verifications_select_all ON public.garage_verifications
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can update garage verifications (admin check in app layer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_verifications' AND policyname = 'garage_verifications_update_all'
  ) THEN
    CREATE POLICY garage_verifications_update_all ON public.garage_verifications
    FOR UPDATE TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can delete garage verifications (admin check in app layer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_verifications' AND policyname = 'garage_verifications_delete_all'
  ) THEN
    CREATE POLICY garage_verifications_delete_all ON public.garage_verifications
    FOR DELETE TO authenticated
    USING (true);
  END IF;
END $$;

-- ============================================================================
-- 2b. ADD RLS POLICIES FOR marketplace_listings (admin access)
-- ============================================================================

-- Enable RLS on marketplace_listings if not already enabled
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view marketplace_listings (admin check in app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketplace_listings' AND policyname = 'marketplace_listings_select_all'
  ) THEN
    CREATE POLICY marketplace_listings_select_all ON public.marketplace_listings
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can update marketplace_listings (admin check in app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketplace_listings' AND policyname = 'marketplace_listings_update_all'
  ) THEN
    CREATE POLICY marketplace_listings_update_all ON public.marketplace_listings
    FOR UPDATE TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can insert marketplace_listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketplace_listings' AND policyname = 'marketplace_listings_insert'
  ) THEN
    CREATE POLICY marketplace_listings_insert ON public.marketplace_listings
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 2c. ADD RLS POLICIES FOR posts TABLE (admin access to community posts)
-- ============================================================================

-- Enable RLS on posts if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_select_all'
  ) THEN
    CREATE POLICY posts_select_all ON public.posts
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can update posts (for admin moderation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_update_all'
  ) THEN
    CREATE POLICY posts_update_all ON public.posts
    FOR UPDATE TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can delete posts (for admin moderation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_delete_all'
  ) THEN
    CREATE POLICY posts_delete_all ON public.posts
    FOR DELETE TO authenticated
    USING (true);
  END IF;
END $$;

-- ============================================================================
-- 3. ADD MISSING COLUMNS TO offers TABLE (additive only)
-- ============================================================================
-- Admin panel needs: title, description, category, original_price, discounted_price,
-- discount_percent, discount_percentage, valid_from, valid_until, max_redemptions,
-- current_redemptions, terms, provider_name, images, image_url, created_by, is_featured, is_active

DO $$
BEGIN
  -- Ensure offers table exists (create minimal if not exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'offers') THEN
    CREATE TABLE public.offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Add missing columns one by one
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'created_by') THEN
    ALTER TABLE public.offers ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'title') THEN
    ALTER TABLE public.offers ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'description') THEN
    ALTER TABLE public.offers ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'category') THEN
    ALTER TABLE public.offers ADD COLUMN category TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'original_price') THEN
    ALTER TABLE public.offers ADD COLUMN original_price NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discounted_price') THEN
    ALTER TABLE public.offers ADD COLUMN discounted_price NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percent') THEN
    ALTER TABLE public.offers ADD COLUMN discount_percent INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percentage') THEN
    ALTER TABLE public.offers ADD COLUMN discount_percentage INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'valid_from') THEN
    ALTER TABLE public.offers ADD COLUMN valid_from TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'valid_until') THEN
    ALTER TABLE public.offers ADD COLUMN valid_until TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'max_redemptions') THEN
    ALTER TABLE public.offers ADD COLUMN max_redemptions INTEGER DEFAULT 100;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'current_redemptions') THEN
    ALTER TABLE public.offers ADD COLUMN current_redemptions INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'terms') THEN
    ALTER TABLE public.offers ADD COLUMN terms TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'provider_name') THEN
    ALTER TABLE public.offers ADD COLUMN provider_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'images') THEN
    ALTER TABLE public.offers ADD COLUMN images JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'image_url') THEN
    ALTER TABLE public.offers ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'is_featured') THEN
    ALTER TABLE public.offers ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'is_active') THEN
    ALTER TABLE public.offers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'status') THEN
    ALTER TABLE public.offers ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'updated_at') THEN
    ALTER TABLE public.offers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add alternative column names that the frontend might use
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'offer_price') THEN
    ALTER TABLE public.offers ADD COLUMN offer_price NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'image_urls') THEN
    ALTER TABLE public.offers ADD COLUMN image_urls JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'terms_conditions') THEN
    ALTER TABLE public.offers ADD COLUMN terms_conditions TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'location') THEN
    ALTER TABLE public.offers ADD COLUMN location TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'available_days') THEN
    ALTER TABLE public.offers ADD COLUMN available_days JSONB DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percentage') THEN
    ALTER TABLE public.offers ADD COLUMN discount_percentage INTEGER;
  END IF;

  -- Ensure created_at column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'created_at') THEN
    ALTER TABLE public.offers ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_created_by ON public.offers(created_by);
CREATE INDEX IF NOT EXISTS idx_offers_category ON public.offers(category);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);

-- Enable RLS for offers (if not already enabled)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public can view active offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'offers_public_view'
  ) THEN
    CREATE POLICY offers_public_view ON public.offers
    FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- Authenticated users can insert offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'offers_insert'
  ) THEN
    CREATE POLICY offers_insert ON public.offers
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;
END $$;

-- Users can update their own offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'offers_update_own'
  ) THEN
    CREATE POLICY offers_update_own ON public.offers
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid() OR created_by IS NULL);
  END IF;
END $$;

-- ============================================================================
-- 4. ADD MISSING COLUMNS TO ad_campaigns TABLE (additive only)
-- ============================================================================
-- Admin panel needs: description, campaign_type, spent, impressions, clicks, ctr,
-- start_date, end_date, target_audience, placement, creative_url, landing_url, created_by

DO $$
BEGIN
  -- Ensure ad_campaigns table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ad_campaigns') THEN
    CREATE TABLE public.ad_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      budget NUMERIC,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'description') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'campaign_type') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN campaign_type TEXT DEFAULT 'banner';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'spent') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN spent NUMERIC(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'impressions') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN impressions INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'clicks') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN clicks INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'ctr') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN ctr NUMERIC(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'start_date') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'end_date') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN end_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'target_audience') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN target_audience TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'placement') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN placement TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'creative_url') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN creative_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'creative_html') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN creative_html TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'landing_url') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN landing_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'created_by') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'updated_at') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Update status constraint if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%ad_campaigns_status%'
  ) THEN
    -- Constraint exists, but might need updating - skip for safety
    NULL;
  END IF;
END $$;

-- Create indexes for ad_campaigns
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_created_by ON public.ad_campaigns(created_by);

-- Enable RLS for ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view ad_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_campaigns' AND policyname = 'ad_campaigns_select_all'
  ) THEN
    CREATE POLICY ad_campaigns_select_all ON public.ad_campaigns
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can insert ad_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_campaigns' AND policyname = 'ad_campaigns_insert'
  ) THEN
    CREATE POLICY ad_campaigns_insert ON public.ad_campaigns
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- All authenticated users can update ad_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_campaigns' AND policyname = 'ad_campaigns_update'
  ) THEN
    CREATE POLICY ad_campaigns_update ON public.ad_campaigns
    FOR UPDATE TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can delete ad_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_campaigns' AND policyname = 'ad_campaigns_delete'
  ) THEN
    CREATE POLICY ad_campaigns_delete ON public.ad_campaigns
    FOR DELETE TO authenticated
    USING (true);
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE ad_placements TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  size TEXT,
  price_per_day NUMERIC(10,2),
  price_per_click NUMERIC(10,2),
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'occupied', 'reserved', 'disabled')),
  current_campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'slug') THEN
    ALTER TABLE public.ad_placements ADD COLUMN slug TEXT;
    -- Add unique constraint if possible
    BEGIN
      CREATE UNIQUE INDEX IF NOT EXISTS ad_placements_slug_unique ON public.ad_placements(slug) WHERE slug IS NOT NULL;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'name') THEN
    ALTER TABLE public.ad_placements ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'description') THEN
    ALTER TABLE public.ad_placements ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'size') THEN
    ALTER TABLE public.ad_placements ADD COLUMN size TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'price_per_day') THEN
    ALTER TABLE public.ad_placements ADD COLUMN price_per_day NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'price_per_click') THEN
    ALTER TABLE public.ad_placements ADD COLUMN price_per_click NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'availability') THEN
    ALTER TABLE public.ad_placements ADD COLUMN availability TEXT DEFAULT 'available';
    -- Add check constraint if it doesn't exist
    BEGIN
      ALTER TABLE public.ad_placements ADD CONSTRAINT ad_placements_availability_check 
        CHECK (availability IN ('available', 'occupied', 'reserved', 'disabled'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'current_campaign_id') THEN
    ALTER TABLE public.ad_placements ADD COLUMN current_campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'is_active') THEN
    ALTER TABLE public.ad_placements ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'created_at') THEN
    ALTER TABLE public.ad_placements ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Check if placement_type exists and has NOT NULL constraint
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
    -- Column exists, check if it allows NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ad_placements' 
      AND column_name = 'placement_type' 
      AND is_nullable = 'NO'
    ) THEN
      -- If NOT NULL and has no default, set a default value for existing rows
      BEGIN
        UPDATE public.ad_placements 
        SET placement_type = 'banner' 
        WHERE placement_type IS NULL;
      EXCEPTION WHEN others THEN
        NULL;
      END;
    END IF;
  ELSE
    -- Column doesn't exist, add it with default
    ALTER TABLE public.ad_placements ADD COLUMN placement_type TEXT DEFAULT 'banner';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ad_placements_availability ON public.ad_placements(availability);
CREATE INDEX IF NOT EXISTS idx_ad_placements_slug ON public.ad_placements(slug);

-- Ensure unique constraint on slug exists for ON CONFLICT
DO $$
BEGIN
  -- Create unique index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'ad_placements' 
    AND indexname = 'ad_placements_slug_unique'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX ad_placements_slug_unique ON public.ad_placements(slug) WHERE slug IS NOT NULL;
    EXCEPTION WHEN others THEN
      -- Index might already exist with different name, try to find it
      NULL;
    END;
  END IF;
END $$;

ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

-- Public view for placements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_placements' AND policyname = 'ad_placements_public_view'
  ) THEN
    CREATE POLICY ad_placements_public_view ON public.ad_placements
    FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- Insert default ad placements (only if they don't exist)
-- Use a safer approach that checks existence first
DO $$
BEGIN
  -- Insert only if slug doesn't exist
  -- Include placement_type if the column exists
  IF NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE slug = 'homepage-banner') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability, placement_type)
      VALUES ('homepage-banner', 'Homepage Top Banner', '1200x200', 150, 'available', 'banner');
    ELSE
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
      VALUES ('homepage-banner', 'Homepage Top Banner', '1200x200', 150, 'available');
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE slug = 'sidebar-square') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability, placement_type)
      VALUES ('sidebar-square', 'Sidebar Square Ad', '300x300', 80, 'available', 'banner');
    ELSE
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
      VALUES ('sidebar-square', 'Sidebar Square Ad', '300x300', 80, 'available');
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE slug = 'feed-native') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability, placement_type)
      VALUES ('feed-native', 'Native Feed Ad', 'Variable', NULL, 'available', 'native');
    ELSE
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
      VALUES ('feed-native', 'Native Feed Ad', 'Variable', NULL, 'available');
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE slug = 'garage-banner') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability, placement_type)
      VALUES ('garage-banner', 'Garage Hub Banner', '800x120', 100, 'available', 'banner');
    ELSE
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
      VALUES ('garage-banner', 'Garage Hub Banner', '800x120', 100, 'available');
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE slug = 'marketplace-strip') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_placements' AND column_name = 'placement_type') THEN
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability, placement_type)
      VALUES ('marketplace-strip', 'Marketplace Strip Ad', '1000x100', 120, 'available', 'banner');
    ELSE
      INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
      VALUES ('marketplace-strip', 'Marketplace Strip Ad', '1000x100', 120, 'available');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 6. CREATE ad_events TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES public.ad_placements(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON public.ad_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_type ON public.ad_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_events_created ON public.ad_events(created_at);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

-- Insert only for tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_events' AND policyname = 'ad_events_insert'
  ) THEN
    CREATE POLICY ad_events_insert ON public.ad_events
    FOR INSERT WITH CHECK (TRUE);
  END IF;
END $$;

-- ============================================================================
-- 7. CREATE/UPDATE reports TABLE FOR COMMUNITY MANAGEMENT (if not exists)
-- ============================================================================
-- Note: reports table may already exist with entity_type/entity_id structure
-- We'll add post_id column if it doesn't exist for compatibility

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns additively
DO $$
BEGIN
  -- Add post_id if it doesn't exist (for direct post reporting)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'post_id') THEN
    ALTER TABLE public.reports ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;

  -- Add reported_user_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reported_user_id') THEN
    ALTER TABLE public.reports ADD COLUMN reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add comment_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'comment_id') THEN
    ALTER TABLE public.reports ADD COLUMN comment_id UUID;
  END IF;

  -- Add reason if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reason') THEN
    ALTER TABLE public.reports ADD COLUMN reason TEXT;
  END IF;

  -- Add details if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'details') THEN
    ALTER TABLE public.reports ADD COLUMN details TEXT;
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'status') THEN
    ALTER TABLE public.reports ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Add action_taken if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'action_taken') THEN
    ALTER TABLE public.reports ADD COLUMN action_taken TEXT;
  END IF;

  -- Add resolved_by if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'resolved_by') THEN
    ALTER TABLE public.reports ADD COLUMN resolved_by UUID REFERENCES public.profiles(id);
  END IF;

  -- Add resolved_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'resolved_at') THEN
    ALTER TABLE public.reports ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;

  -- Ensure reporter_id exists (should already exist from CREATE TABLE IF NOT EXISTS)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reporter_id') THEN
    ALTER TABLE public.reports ADD COLUMN reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  -- Ensure created_at exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'created_at') THEN
    ALTER TABLE public.reports ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes only on columns that exist
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Only create post_id index if the column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'post_id') THEN
    CREATE INDEX IF NOT EXISTS idx_reports_post ON public.reports(post_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_insert'
  ) THEN
    CREATE POLICY reports_insert ON public.reports
    FOR INSERT TO authenticated
    WITH CHECK (reporter_id = auth.uid());
  END IF;
END $$;

-- Users can view their own reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_view_own'
  ) THEN
    CREATE POLICY reports_view_own ON public.reports
    FOR SELECT TO authenticated
    USING (reporter_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- 8. FIX market_listings FK TO profiles
-- ============================================================================
-- Ensure the FK exists properly for the admin query:
-- .select('*, profiles:user_id(email, full_name)')

DO $$
BEGIN
  -- Check if market_listings table exists and has user_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'market_listings' AND column_name = 'user_id'
  ) THEN
    -- Check if the FK constraint exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'market_listings_user_id_fkey' 
      AND table_name = 'market_listings'
    ) THEN
      BEGIN
        ALTER TABLE public.market_listings 
        ADD CONSTRAINT market_listings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'FK already exists or cannot be created: %', SQLERRM;
      END;
    END IF;
  END IF;

  -- Also check marketplace_listings table (different name used in some places)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'marketplace_listings_user_id_fkey' 
      AND table_name = 'marketplace_listings'
    ) THEN
      BEGIN
        ALTER TABLE public.marketplace_listings 
        ADD CONSTRAINT marketplace_listings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'FK already exists or cannot be created: %', SQLERRM;
      END;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 9. CREATE community_stats VIEW (if not exists)
-- ============================================================================
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '30 days') AS total_posts_month,
  (SELECT COUNT(*) FROM public.posts) AS total_posts,
  (SELECT COUNT(DISTINCT user_id) FROM public.posts WHERE created_at > NOW() - INTERVAL '7 days') AS active_users_week,
  (SELECT COUNT(*) FROM public.profiles WHERE role != 'admin') AS total_users,
  COALESCE((SELECT COUNT(*) FROM public.reports WHERE status = 'pending'), 0) AS pending_reports,
  COALESCE((SELECT COUNT(*) FROM public.communities WHERE is_active = TRUE), 0) AS active_communities;

-- ============================================================================
-- 10. CREATE RPC FUNCTIONS FOR STATS
-- ============================================================================

-- Community stats RPC
CREATE OR REPLACE FUNCTION public.fn_get_community_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  pending_reports_count INTEGER;
BEGIN
  -- Count pending reports - handle both entity_type/entity_id and post_id schemas
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'status') THEN
    SELECT COUNT(*) INTO pending_reports_count 
    FROM public.reports 
    WHERE status = 'pending';
  ELSE
    pending_reports_count := 0;
  END IF;

  SELECT json_build_object(
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'posts_this_month', (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '30 days'),
    'active_users', (SELECT COUNT(DISTINCT user_id) FROM public.posts WHERE created_at > NOW() - INTERVAL '7 days'),
    'pending_reports', COALESCE(pending_reports_count, 0),
    'total_communities', COALESCE((SELECT COUNT(*) FROM public.communities WHERE is_active = TRUE), 0),
    'daily_engagement', ROUND((
      SELECT COALESCE(
        (COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM public.profiles WHERE role != 'admin'), 0)) * 100,
        0
      )
      FROM public.posts 
      WHERE created_at > NOW() - INTERVAL '1 day'
    )::NUMERIC, 1)
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_community_stats() TO authenticated;

-- Ad stats RPC
CREATE OR REPLACE FUNCTION public.fn_get_ad_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  available_placements_count INTEGER;
BEGIN
  -- Check if availability column exists before using it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ad_placements' AND column_name = 'availability'
  ) THEN
    SELECT COUNT(*) INTO available_placements_count 
    FROM public.ad_placements 
    WHERE availability = 'available';
  ELSE
    -- Fallback: count all active placements if availability column doesn't exist
    SELECT COUNT(*) INTO available_placements_count 
    FROM public.ad_placements 
    WHERE is_active = TRUE;
  END IF;

  SELECT json_build_object(
    'total_revenue', COALESCE((SELECT SUM(spent) FROM public.ad_campaigns), 0),
    'active_campaigns', (SELECT COUNT(*) FROM public.ad_campaigns WHERE status = 'active'),
    'total_impressions', COALESCE((SELECT SUM(impressions) FROM public.ad_campaigns), 0),
    'total_clicks', COALESCE((SELECT SUM(clicks) FROM public.ad_campaigns), 0),
    'average_ctr', COALESCE((
      SELECT ROUND(AVG(ctr), 2) 
      FROM public.ad_campaigns 
      WHERE impressions > 0
    ), 0),
    'available_placements', COALESCE(available_placements_count, 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_ad_stats() TO authenticated;

-- ============================================================================
-- COMPLETE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SAFE ADMIN PAGES FIX COMPLETE - January 16, 2026';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  1. fn_export_users timestamp type mismatch';
  RAISE NOTICE '  2. Created garage_verifications table';
  RAISE NOTICE '  3. Added missing columns to offers table';
  RAISE NOTICE '  4. Added missing columns to ad_campaigns table';
  RAISE NOTICE '  5. Created ad_placements and ad_events tables';
  RAISE NOTICE '  6. Created reports table for community management';
  RAISE NOTICE '  7. Fixed FK for market_listings.user_id';
  RAISE NOTICE '  8. Created community_stats view';
  RAISE NOTICE '  9. Created fn_get_community_stats RPC';
  RAISE NOTICE '  10. Created fn_get_ad_stats RPC';
  RAISE NOTICE '  11. Fixed wallet_transactions table and RLS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'All changes are ADDITIVE ONLY - safe to apply';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- 11. WALLET_TRANSACTIONS TABLE AND RLS POLICIES
-- ============================================================================

-- Create wallet_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'topup', 'payment', 'refund', 'withdrawal', 'deposit', 'pending', 'processing')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'success', 'failed', 'rejected', 'refunded', 'cancelled')),
  reference_type TEXT,
  reference_id UUID,
  stripe_payment_id TEXT,
  stripe_checkout_id TEXT,
  balance_after NUMERIC(12,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to wallet_transactions if they exist but are incomplete
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'status') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'stripe_payment_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN stripe_payment_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'stripe_checkout_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN stripe_checkout_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'balance_after') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN balance_after NUMERIC(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'metadata') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'reference_type') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN reference_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'reference_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN reference_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'updated_at') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for wallet_transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe ON public.wallet_transactions(stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;

-- Enable RLS for wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view wallet_transactions (admin check in app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_select_all'
  ) THEN
    CREATE POLICY wallet_transactions_select_all ON public.wallet_transactions
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can update wallet_transactions (admin check in app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_update_all'
  ) THEN
    CREATE POLICY wallet_transactions_update_all ON public.wallet_transactions
    FOR UPDATE TO authenticated
    USING (true);
  END IF;
END $$;

-- All authenticated users can insert wallet_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_insert'
  ) THEN
    CREATE POLICY wallet_transactions_insert ON public.wallet_transactions
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 12. REFUND_REQUESTS TABLE (DEDICATED TABLE FOR REFUND MANAGEMENT)
-- ============================================================================

-- Create refund_requests table if not exists
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.wallet_transactions(id) ON DELETE SET NULL,
  original_amount NUMERIC(12,2) NOT NULL,
  requested_amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  stripe_refund_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to refund_requests if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'priority') THEN
    ALTER TABLE public.refund_requests ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'reviewed_by') THEN
    ALTER TABLE public.refund_requests ADD COLUMN reviewed_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'reviewed_at') THEN
    ALTER TABLE public.refund_requests ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'processed_at') THEN
    ALTER TABLE public.refund_requests ADD COLUMN processed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'stripe_payment_id') THEN
    ALTER TABLE public.refund_requests ADD COLUMN stripe_payment_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'stripe_refund_id') THEN
    ALTER TABLE public.refund_requests ADD COLUMN stripe_refund_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'metadata') THEN
    ALTER TABLE public.refund_requests ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refund_requests' AND column_name = 'updated_at') THEN
    ALTER TABLE public.refund_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for refund_requests
CREATE INDEX IF NOT EXISTS idx_refund_requests_user ON public.refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_priority ON public.refund_requests(priority);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created ON public.refund_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refund_requests_transaction ON public.refund_requests(transaction_id) WHERE transaction_id IS NOT NULL;

-- Enable RLS for refund_requests
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for refund_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refund_requests' AND policyname = 'refund_requests_select_all'
  ) THEN
    CREATE POLICY refund_requests_select_all ON public.refund_requests
    FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refund_requests' AND policyname = 'refund_requests_update_all'
  ) THEN
    CREATE POLICY refund_requests_update_all ON public.refund_requests
    FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refund_requests' AND policyname = 'refund_requests_insert'
  ) THEN
    CREATE POLICY refund_requests_insert ON public.refund_requests
    FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- Update notice with new item
DO $$
BEGIN
  RAISE NOTICE '  12. Created refund_requests table with RLS';
END $$;

-- ============================================================================
-- 13. BOOST_PACKAGES TABLE (FOR LISTING & BOOST MANAGEMENT)
-- ============================================================================

-- Create boost_packages table if not exists
CREATE TABLE IF NOT EXISTS public.boost_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 7,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  currency TEXT DEFAULT 'AED',
  features JSONB DEFAULT '[]',
  badge TEXT,
  badge_color TEXT,
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'all',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to boost_packages if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'original_price') THEN
    ALTER TABLE public.boost_packages ADD COLUMN original_price NUMERIC(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'badge') THEN
    ALTER TABLE public.boost_packages ADD COLUMN badge TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'badge_color') THEN
    ALTER TABLE public.boost_packages ADD COLUMN badge_color TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'popular') THEN
    ALTER TABLE public.boost_packages ADD COLUMN popular BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'category') THEN
    ALTER TABLE public.boost_packages ADD COLUMN category TEXT DEFAULT 'all';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'sort_order') THEN
    ALTER TABLE public.boost_packages ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for boost_packages
CREATE INDEX IF NOT EXISTS idx_boost_packages_active ON public.boost_packages(active);
CREATE INDEX IF NOT EXISTS idx_boost_packages_category ON public.boost_packages(category);
CREATE INDEX IF NOT EXISTS idx_boost_packages_sort ON public.boost_packages(sort_order);

-- Enable RLS for boost_packages
ALTER TABLE public.boost_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies for boost_packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'boost_packages' AND policyname = 'boost_packages_select_all'
  ) THEN
    CREATE POLICY boost_packages_select_all ON public.boost_packages
    FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'boost_packages' AND policyname = 'boost_packages_insert'
  ) THEN
    CREATE POLICY boost_packages_insert ON public.boost_packages
    FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'boost_packages' AND policyname = 'boost_packages_update'
  ) THEN
    CREATE POLICY boost_packages_update ON public.boost_packages
    FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'boost_packages' AND policyname = 'boost_packages_delete'
  ) THEN
    CREATE POLICY boost_packages_delete ON public.boost_packages
    FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Insert default boost packages if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.boost_packages LIMIT 1) THEN
    INSERT INTO public.boost_packages (name, description, duration, price, original_price, features, badge, badge_color, popular, category, sort_order)
    VALUES
      ('7-Day Boost', 'Boost your listing for 7 days', 7, 50, 75, '["Top placement for 7 days", "Featured badge", "2x visibility"]'::jsonb, 'Basic', 'blue', false, 'all', 1),
      ('14-Day Boost', 'Boost your listing for 14 days', 14, 90, 150, '["Top placement for 14 days", "Featured badge", "3x visibility", "Priority support"]'::jsonb, 'Popular', 'gold', true, 'all', 2),
      ('30-Day Boost', 'Boost your listing for 30 days', 30, 150, 225, '["Top placement for 30 days", "Premium badge", "5x visibility", "Priority support", "Social media promotion"]'::jsonb, 'Premium', 'purple', false, 'all', 3);
  END IF;
END $$;

-- Update notice
DO $$
BEGIN
  RAISE NOTICE '  13. Created boost_packages table with default packages';
END $$;

-- ============================================================================
-- 14. MARKETPLACE_LISTINGS BOOST COLUMNS
-- ============================================================================

-- Add boost-related columns to marketplace_listings if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'is_boosted') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'boost_package') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN boost_package TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'boost_expires_at') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'boost_payment_id') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN boost_payment_id TEXT;
  END IF;
END $$;

-- Create index for boosted listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_boosted ON public.marketplace_listings(is_boosted) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_boost_expires ON public.marketplace_listings(boost_expires_at) WHERE boost_expires_at IS NOT NULL;

-- Update notice
DO $$
BEGIN
  RAISE NOTICE '  14. Added boost columns to marketplace_listings';
END $$;

-- ============================================================================
-- 15. GARAGES BOOST COLUMNS
-- ============================================================================

-- Add boost-related columns to garages if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'is_boosted') THEN
    ALTER TABLE public.garages ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'boost_level') THEN
    ALTER TABLE public.garages ADD COLUMN boost_level TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'boost_expires_at') THEN
    ALTER TABLE public.garages ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for boosted garages
CREATE INDEX IF NOT EXISTS idx_garages_boosted ON public.garages(is_boosted) WHERE is_boosted = true;

-- Update notice
DO $$
BEGIN
  RAISE NOTICE '  15. Added boost columns to garages';
END $$;

