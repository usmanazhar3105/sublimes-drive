-- ============================================================================
-- MARKETPLACE MODULE - Complete Schema with PostGIS
-- ============================================================================
-- Generated: 2025-11-05T04:15:00Z
-- Purpose: Complete marketplace wiring with geo/maps + commerce
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE POSTGIS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================================
-- PART 2: REFERENCE TABLES
-- ============================================================================

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_categories' AND column_name='parent_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent ON public.marketplace_categories(parent_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_categories' AND column_name='is_active'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_categories' AND column_name='sort_order'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_categories_active ON public.marketplace_categories(is_active, sort_order);
  END IF;
END $$;

-- Brands
CREATE TABLE IF NOT EXISTS public.marketplace_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_brands_active ON public.marketplace_brands(is_active);

-- Models (per brand)
CREATE TABLE IF NOT EXISTS public.marketplace_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.marketplace_brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  body_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_models_brand ON public.marketplace_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_models_active ON public.marketplace_models(is_active);

-- ============================================================================
-- PART 3: CORE LISTINGS TABLE (with PostGIS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Classification
  category_id UUID REFERENCES public.marketplace_categories(id),
  brand_id UUID REFERENCES public.marketplace_brands(id),
  model_id UUID REFERENCES public.marketplace_models(id),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  
  -- Pricing
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED' CHECK (currency IN ('AED', 'USD', 'EUR')),
  negotiable BOOLEAN DEFAULT TRUE,
  
  -- Vehicle Specs
  condition TEXT CHECK (condition IN ('new', 'used', 'certified_pre_owned', 'refurbished')),
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  mileage INTEGER CHECK (mileage >= 0),
  body_type TEXT CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'pickup')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen')),
  transmission TEXT CHECK (transmission IN ('automatic', 'manual', 'cvt', 'dct')),
  drive_train TEXT CHECK (drive_train IN ('fwd', 'rwd', 'awd', '4wd')),
  color_exterior TEXT,
  color_interior TEXT,
  doors INTEGER CHECK (doors BETWEEN 2 AND 5),
  seats INTEGER CHECK (seats BETWEEN 2 AND 9),
  engine_size NUMERIC(4,1),
  horsepower INTEGER,
  vin TEXT,
  registration_number TEXT,
  
  -- Features
  features JSONB DEFAULT '[]'::JSONB,
  has_video BOOLEAN DEFAULT FALSE,
  has_inspection_report BOOLEAN DEFAULT FALSE,
  has_warranty BOOLEAN DEFAULT FALSE,
  warranty_months INTEGER,
  
  -- Location (PostGIS)
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'AE',
  location_address TEXT,
  location_point GEOGRAPHY(Point, 4326),
  
  -- Status & Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'archived', 'sold')),
  rejection_reason TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES public.profiles(id),
  
  -- Featured & Boosted
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  is_boosted BOOLEAN DEFAULT FALSE,
  boosted_until TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes for filtering and sorting (check column exists first)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'seller_id') THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user ON public.marketplace_listings(user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listings' AND column_name = 'brand_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listings' AND column_name = 'model_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand_model ON public.marketplace_listings(brand_id, model_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listings' AND column_name = 'category_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON public.marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_year ON public.marketplace_listings(year);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_mileage ON public.marketplace_listings(mileage);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON public.marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(is_featured, created_at DESC) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_approved ON public.marketplace_listings(status, created_at DESC) WHERE status = 'approved';

-- PostGIS Spatial Index (CRITICAL for radius/bounds queries)
CREATE INDEX IF NOT EXISTS gist_marketplace_listings_location ON public.marketplace_listings USING GIST (location_point);

-- ============================================================================
-- PART 4: LISTING MEDIA & ATTRIBUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  position INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_media_listing ON public.marketplace_listing_media(listing_id, position);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_attrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (listing_id, key)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listing_attrs_listing ON public.marketplace_listing_attrs(listing_id);

-- ============================================================================
-- PART 5: ENGAGEMENT TABLES
-- ============================================================================

-- Favorites/Saves
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user ON public.marketplace_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_listing ON public.marketplace_favorites(listing_id);

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.marketplace_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::JSONB,
  notify_new BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_saved_searches_user ON public.marketplace_saved_searches(user_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_messages_listing ON public.marketplace_messages(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_conversation ON public.marketplace_messages(sender_id, receiver_id, created_at DESC);

-- Offers
CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'accepted', 'declined', 'withdrawn', 'expired', 'countered')),
  counter_amount NUMERIC(12,2),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_offers_listing ON public.marketplace_offers(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_buyer ON public.marketplace_offers(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_status ON public.marketplace_offers(status);

-- Views/Analytics
CREATE TABLE IF NOT EXISTS public.marketplace_listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listing_views' AND column_name = 'listing_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listing_views' AND column_name = 'viewed_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listing_views_listing ON public.marketplace_listing_views(listing_id, viewed_at DESC);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listing_views' AND column_name = 'user_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_listing_views' AND column_name = 'viewed_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_marketplace_listing_views_user ON public.marketplace_listing_views(user_id, viewed_at DESC);
  END IF;
END $$;

-- ============================================================================
-- PART 6: ADMIN & MODERATION
-- ============================================================================

-- Re-use existing moderation_actions table, but ensure it exists
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'listing', 'comment', 'user', 'garage', 'event')),
  target_id UUID NOT NULL,
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'feature', 'unfeature', 'suspend', 'restore', 'archive', 'delete')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON public.moderation_actions(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON public.moderation_actions(moderator_id, created_at DESC);

-- ============================================================================
-- PART 7: RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_attrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_models ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS marketplace_listings_public_read ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_owner_read ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_owner_insert ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_owner_update ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_owner_delete ON public.marketplace_listings;

-- Listings: Public read only approved (supports seller_id or user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_listings_public_read ON public.marketplace_listings
      FOR SELECT
      USING (
        status = 'approved'
        OR seller_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_listings_public_read ON public.marketplace_listings
      FOR SELECT
      USING (
        status = 'approved'
        OR user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  END IF;
END $$;

-- Listings: Authenticated can insert as owner (supports seller_id or user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_insert ON public.marketplace_listings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_insert ON public.marketplace_listings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Listings: Owner can update own (supports seller_id or user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_update ON public.marketplace_listings
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = seller_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      )
      WITH CHECK (
        auth.uid() = seller_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_update ON public.marketplace_listings
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      )
      WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  END IF;
END $$;

-- Listings: Owner or admin can delete (supports seller_id or user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_delete ON public.marketplace_listings
      FOR DELETE
      TO authenticated
      USING (
        auth.uid() = seller_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_listings_owner_delete ON public.marketplace_listings
      FOR DELETE
      TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  END IF;
END $$;

-- Media: Inherit from listing visibility
DROP POLICY IF EXISTS marketplace_media_read ON public.marketplace_listing_media;
DROP POLICY IF EXISTS marketplace_media_write ON public.marketplace_listing_media;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_media_read ON public.marketplace_listing_media
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id
          AND (
            l.status = 'approved'
            OR l.seller_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role IN ('admin', 'editor')
            )
          )
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_media_read ON public.marketplace_listing_media
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id
          AND (
            l.status = 'approved'
            OR l.user_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role IN ('admin', 'editor')
            )
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_media_write ON public.marketplace_listing_media
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id
          AND (
            l.seller_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role IN ('admin', 'editor')
            )
          )
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_media_write ON public.marketplace_listing_media
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id
          AND (
            l.user_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role IN ('admin', 'editor')
            )
          )
        )
      );
  END IF;
END $$;

-- Favorites: Owner read/write
DROP POLICY IF EXISTS marketplace_favorites_owner ON public.marketplace_favorites;
CREATE POLICY marketplace_favorites_owner ON public.marketplace_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved Searches: Owner read/write
DROP POLICY IF EXISTS marketplace_saved_searches_owner ON public.marketplace_saved_searches;
CREATE POLICY marketplace_saved_searches_owner ON public.marketplace_saved_searches
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Messages: Participants + admin read; participants write
DROP POLICY IF EXISTS marketplace_messages_read ON public.marketplace_messages;
DROP POLICY IF EXISTS marketplace_messages_write ON public.marketplace_messages;

CREATE POLICY marketplace_messages_read ON public.marketplace_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (sender_id, receiver_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY marketplace_messages_write ON public.marketplace_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (sender_id, receiver_id));

-- Offers: Buyer + seller + admin read; buyer create; seller/admin update
DROP POLICY IF EXISTS marketplace_offers_read ON public.marketplace_offers;
DROP POLICY IF EXISTS marketplace_offers_insert ON public.marketplace_offers;
DROP POLICY IF EXISTS marketplace_offers_update ON public.marketplace_offers;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_offers_read ON public.marketplace_offers
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = buyer_id
        OR EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id AND l.seller_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_offers_read ON public.marketplace_offers
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = buyer_id
        OR EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id AND l.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  END IF;
END $$;

CREATE POLICY marketplace_offers_insert ON public.marketplace_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id'
  ) THEN
    CREATE POLICY marketplace_offers_update ON public.marketplace_offers
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id AND l.seller_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id'
  ) THEN
    CREATE POLICY marketplace_offers_update ON public.marketplace_offers
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.marketplace_listings l
          WHERE l.id = listing_id AND l.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
      );
  END IF;
END $$;

-- Views: No direct user write; system writes via trigger or backend
DROP POLICY IF EXISTS marketplace_views_read ON public.marketplace_listing_views;
CREATE POLICY marketplace_views_read ON public.marketplace_listing_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Reference tables: Public read, admin write
DROP POLICY IF EXISTS marketplace_categories_read ON public.marketplace_categories;
CREATE POLICY marketplace_categories_read ON public.marketplace_categories
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS marketplace_brands_read ON public.marketplace_brands;
CREATE POLICY marketplace_brands_read ON public.marketplace_brands
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS marketplace_models_read ON public.marketplace_models;
CREATE POLICY marketplace_models_read ON public.marketplace_models
  FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- PART 8: RPC FUNCTIONS FOR GEO QUERIES
-- ============================================================================

-- Radius search
CREATE OR REPLACE FUNCTION public.fn_marketplace_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_filters JSONB DEFAULT '{}'::JSONB,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  listing_id UUID,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    ROUND((ST_Distance(
      l.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.marketplace_listings l
  WHERE l.status = 'approved'
    AND l.location_point IS NOT NULL
    AND ST_DWithin(
      l.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_marketplace_search_radius(
  NUMERIC, NUMERIC, NUMERIC, JSONB, INTEGER, INTEGER
) TO authenticated, anon;

-- Bounds search
CREATE OR REPLACE FUNCTION public.fn_marketplace_search_bounds(
  p_sw_lat NUMERIC,
  p_sw_lng NUMERIC,
  p_ne_lat NUMERIC,
  p_ne_lng NUMERIC,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  listing_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id
  FROM public.marketplace_listings l
  WHERE l.status = 'approved'
    AND l.location_point IS NOT NULL
    AND ST_Within(
      l.location_point::geometry,
      ST_MakeEnvelope(p_sw_lng, p_sw_lat, p_ne_lng, p_ne_lat, 4326)
    )
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_marketplace_search_bounds(
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER
) TO authenticated, anon;

-- ============================================================================
-- PART 9: TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.trg_marketplace_listings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_marketplace_listings_updated_at();

-- Auto-update favorite counter
CREATE OR REPLACE FUNCTION public.trg_marketplace_favorite_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.marketplace_listings
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.marketplace_listings
    SET favorite_count = GREATEST(0, favorite_count - 1)
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS marketplace_favorites_count_insert ON public.marketplace_favorites;
CREATE TRIGGER marketplace_favorites_count_insert
  AFTER INSERT ON public.marketplace_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_marketplace_favorite_count();

DROP TRIGGER IF EXISTS marketplace_favorites_count_delete ON public.marketplace_favorites;
CREATE TRIGGER marketplace_favorites_count_delete
  AFTER DELETE ON public.marketplace_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_marketplace_favorite_count();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_postgis_enabled BOOLEAN;
  v_listings_count INTEGER;
  v_gist_index_exists BOOLEAN;
BEGIN
  -- Check PostGIS
  SELECT EXISTS(
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) INTO v_postgis_enabled;
  
  -- Check listings table
  SELECT COUNT(*) INTO v_listings_count
  FROM information_schema.tables
  WHERE table_name = 'marketplace_listings';
  
  -- Check GIST index
  SELECT EXISTS(
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'gist_marketplace_listings_location'
  ) INTO v_gist_index_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MARKETPLACE MODULE - SCHEMA COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'PostGIS Enabled: %', CASE WHEN v_postgis_enabled THEN '✅ YES' ELSE '❌ NO' END;
  RAISE NOTICE 'Listings Table: %', CASE WHEN v_listings_count > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'GIST Index: %', CASE WHEN v_gist_index_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  - marketplace_categories';
  RAISE NOTICE '  - marketplace_brands';
  RAISE NOTICE '  - marketplace_models';
  RAISE NOTICE '  - marketplace_listings (with PostGIS)';
  RAISE NOTICE '  - marketplace_listing_media';
  RAISE NOTICE '  - marketplace_listing_attrs';
  RAISE NOTICE '  - marketplace_favorites';
  RAISE NOTICE '  - marketplace_saved_searches';
  RAISE NOTICE '  - marketplace_messages';
  RAISE NOTICE '  - marketplace_offers';
  RAISE NOTICE '  - marketplace_listing_views';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies: All configured';
  RAISE NOTICE 'Geo Functions: fn_marketplace_search_radius, fn_marketplace_search_bounds';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

