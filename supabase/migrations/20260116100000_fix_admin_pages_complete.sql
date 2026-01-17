-- ============================================================================
-- COMPREHENSIVE FIX FOR ADMIN PAGES - January 16, 2026
-- ============================================================================
-- Fixes:
-- 1. fn_export_users timestamp type mismatch
-- 2. Missing garage_verifications table
-- 3. Missing/incomplete offers table for admin panel
-- 4. Missing ad_campaigns table for Ads & Monetization page
-- 5. Community management stats tables
-- 6. Missing FK relationship for market_listings
-- ============================================================================

-- ============================================================================
-- 1. FIX fn_export_users TIMESTAMP TYPE MISMATCH
-- ============================================================================
-- The error: "Returned type timestamp with time zone does not match expected type timestamp without time zone in column 5"
-- Fix: Change return type to TIMESTAMPTZ to match profiles.created_at

DROP FUNCTION IF EXISTS fn_export_users(TIMESTAMP, TIMESTAMP);

CREATE OR REPLACE FUNCTION fn_export_users(
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

GRANT EXECUTE ON FUNCTION fn_export_users(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

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
DROP POLICY IF EXISTS garage_verifications_own ON public.garage_verifications;
CREATE POLICY garage_verifications_own ON public.garage_verifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own verification requests
DROP POLICY IF EXISTS garage_verifications_insert_own ON public.garage_verifications;
CREATE POLICY garage_verifications_insert_own ON public.garage_verifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 3. FIX offers TABLE - Ensure all columns exist for admin panel
-- ============================================================================
-- The admin panel tries to insert: title, description, category, original_price,
-- discounted_price, discount_percent, valid_until, max_redemptions, terms,
-- provider_name, images, image_url, created_by, is_featured, is_active

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  original_price NUMERIC(10,2),
  discounted_price NUMERIC(10,2),
  discount_percent INTEGER,
  discount_percentage INTEGER,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_redemptions INTEGER DEFAULT 100,
  current_redemptions INTEGER DEFAULT 0,
  terms TEXT,
  provider_name TEXT,
  images JSONB DEFAULT '[]',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  -- Add created_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'created_by') THEN
    ALTER TABLE public.offers ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add category if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'category') THEN
    ALTER TABLE public.offers ADD COLUMN category TEXT;
  END IF;

  -- Add original_price if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'original_price') THEN
    ALTER TABLE public.offers ADD COLUMN original_price NUMERIC(10,2);
  END IF;

  -- Add discounted_price if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discounted_price') THEN
    ALTER TABLE public.offers ADD COLUMN discounted_price NUMERIC(10,2);
  END IF;

  -- Add discount_percent if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percent') THEN
    ALTER TABLE public.offers ADD COLUMN discount_percent INTEGER;
  END IF;

  -- Add discount_percentage if missing (some components use this name)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'discount_percentage') THEN
    ALTER TABLE public.offers ADD COLUMN discount_percentage INTEGER;
  END IF;

  -- Add valid_from if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'valid_from') THEN
    ALTER TABLE public.offers ADD COLUMN valid_from TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add valid_until if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'valid_until') THEN
    ALTER TABLE public.offers ADD COLUMN valid_until TIMESTAMPTZ;
  END IF;

  -- Add max_redemptions if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'max_redemptions') THEN
    ALTER TABLE public.offers ADD COLUMN max_redemptions INTEGER DEFAULT 100;
  END IF;

  -- Add current_redemptions if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'current_redemptions') THEN
    ALTER TABLE public.offers ADD COLUMN current_redemptions INTEGER DEFAULT 0;
  END IF;

  -- Add terms if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'terms') THEN
    ALTER TABLE public.offers ADD COLUMN terms TEXT;
  END IF;

  -- Add provider_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'provider_name') THEN
    ALTER TABLE public.offers ADD COLUMN provider_name TEXT;
  END IF;

  -- Add images if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'images') THEN
    ALTER TABLE public.offers ADD COLUMN images JSONB DEFAULT '[]';
  END IF;

  -- Add image_url if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'image_url') THEN
    ALTER TABLE public.offers ADD COLUMN image_url TEXT;
  END IF;

  -- Add is_featured if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'is_featured') THEN
    ALTER TABLE public.offers ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_active if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'is_active') THEN
    ALTER TABLE public.offers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'status') THEN
    ALTER TABLE public.offers ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'created_at') THEN
    ALTER TABLE public.offers ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'updated_at') THEN
    ALTER TABLE public.offers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_created_by ON public.offers(created_by);
CREATE INDEX IF NOT EXISTS idx_offers_category ON public.offers(category);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);

-- Enable RLS for offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public can view active offers
DROP POLICY IF EXISTS offers_public_view ON public.offers;
CREATE POLICY offers_public_view ON public.offers
FOR SELECT USING (is_active = TRUE);

-- Authenticated users can insert offers
DROP POLICY IF EXISTS offers_insert ON public.offers;
CREATE POLICY offers_insert ON public.offers
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Users can update their own offers
DROP POLICY IF EXISTS offers_update_own ON public.offers;
CREATE POLICY offers_update_own ON public.offers
FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR created_by IS NULL);

-- ============================================================================
-- 4. CREATE ad_campaigns TABLE FOR ADS & MONETIZATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT DEFAULT 'banner' CHECK (campaign_type IN ('banner', 'sponsored_post', 'native', 'video')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  budget NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  placement TEXT,
  creative_url TEXT,
  creative_html TEXT,
  landing_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad placements table
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

-- Ad impressions/clicks tracking
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_placements_availability ON public.ad_placements(availability);
CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON public.ad_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_type ON public.ad_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_events_created ON public.ad_events(created_at);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

-- Ad campaigns - public can view active campaigns
DROP POLICY IF EXISTS ad_campaigns_public_view ON public.ad_campaigns;
CREATE POLICY ad_campaigns_public_view ON public.ad_campaigns
FOR SELECT USING (status = 'active');

-- Ad placements - public view
DROP POLICY IF EXISTS ad_placements_public_view ON public.ad_placements;
CREATE POLICY ad_placements_public_view ON public.ad_placements
FOR SELECT USING (is_active = TRUE);

-- Ad events - insert only for tracking
DROP POLICY IF EXISTS ad_events_insert ON public.ad_events;
CREATE POLICY ad_events_insert ON public.ad_events
FOR INSERT WITH CHECK (TRUE);

-- Insert default ad placements
INSERT INTO public.ad_placements (slug, name, size, price_per_day, availability)
VALUES 
  ('homepage-banner', 'Homepage Top Banner', '1200x200', 150, 'available'),
  ('sidebar-square', 'Sidebar Square Ad', '300x300', 80, 'available'),
  ('feed-native', 'Native Feed Ad', 'Variable', NULL, 'available'),
  ('garage-banner', 'Garage Hub Banner', '800x120', 100, 'available'),
  ('marketplace-strip', 'Marketplace Strip Ad', '1000x100', 120, 'available')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 5. CREATE community_stats VIEW FOR COMMUNITY MANAGEMENT
-- ============================================================================
DROP VIEW IF EXISTS public.community_stats;
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '30 days') AS total_posts_month,
  (SELECT COUNT(*) FROM public.posts) AS total_posts,
  (SELECT COUNT(DISTINCT user_id) FROM public.posts WHERE created_at > NOW() - INTERVAL '7 days') AS active_users_week,
  (SELECT COUNT(*) FROM public.profiles WHERE role != 'admin') AS total_users,
  (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports,
  (SELECT COUNT(*) FROM public.communities WHERE is_active = TRUE) AS active_communities;

-- Community reports table (if not exists)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  action_taken TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_post ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
DROP POLICY IF EXISTS reports_insert ON public.reports;
CREATE POLICY reports_insert ON public.reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
DROP POLICY IF EXISTS reports_view_own ON public.reports;
CREATE POLICY reports_view_own ON public.reports
FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

-- ============================================================================
-- 6. FIX market_listings FK to profiles
-- ============================================================================
-- Ensure the FK exists properly for the admin query:
-- .select('*, profiles:user_id(email, full_name)')

DO $$
BEGIN
  -- Check if the FK constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'market_listings_user_id_fkey' 
    AND table_name = 'market_listings'
  ) THEN
    -- Add FK if missing (only if column exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'market_listings' AND column_name = 'user_id'
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
END $$;

-- Also check marketplace_listings table (different name used in some places)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'marketplace_listings_user_id_fkey' 
      AND table_name = 'marketplace_listings'
    ) THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' AND column_name = 'user_id'
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
  END IF;
END $$;

-- ============================================================================
-- 7. CREATE RPC for getting community stats (for dashboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_community_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'posts_this_month', (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '30 days'),
    'active_users', (SELECT COUNT(DISTINCT user_id) FROM public.posts WHERE created_at > NOW() - INTERVAL '7 days'),
    'pending_reports', (SELECT COUNT(*) FROM public.reports WHERE status = 'pending'),
    'total_communities', (SELECT COUNT(*) FROM public.communities WHERE is_active = TRUE),
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

GRANT EXECUTE ON FUNCTION fn_get_community_stats() TO authenticated;

-- ============================================================================
-- 8. CREATE RPC for getting ad stats (for dashboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_get_ad_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
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
    'available_placements', (SELECT COUNT(*) FROM public.ad_placements WHERE availability = 'available')
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_ad_stats() TO authenticated;

-- ============================================================================
-- COMPLETE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ADMIN PAGES FIX COMPLETE - January 16, 2026';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  1. fn_export_users timestamp type mismatch';
  RAISE NOTICE '  2. Created garage_verifications table';
  RAISE NOTICE '  3. Fixed offers table with all required columns';
  RAISE NOTICE '  4. Created ad_campaigns, ad_placements, ad_events tables';
  RAISE NOTICE '  5. Created community_stats view and reports table';
  RAISE NOTICE '  6. Added FK for market_listings.user_id';
  RAISE NOTICE '  7. Created fn_get_community_stats RPC';
  RAISE NOTICE '  8. Created fn_get_ad_stats RPC';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;






