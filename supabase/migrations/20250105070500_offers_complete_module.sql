-- ============================================================================
-- OFFERS MODULE - COMPLETE SCHEMA
-- ============================================================================
-- From docs/wiring/offers/sql.generated.sql
-- ============================================================================

-- Vendors (offer providers)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor staff
CREATE TABLE IF NOT EXISTS public.vendor_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, user_id)
);

-- Offer categories
CREATE TABLE IF NOT EXISTS public.offer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complete offers table (rename if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers_full') THEN
    -- Table already exists
    RAISE NOTICE 'offers_full already exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    -- Rename offers to offers_full
    ALTER TABLE public.offers RENAME TO offers_full;
    RAISE NOTICE 'Renamed offers to offers_full';
  ELSE
    -- Create new
    CREATE TABLE public.offers_full (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
      category_id UUID REFERENCES public.offer_categories(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      terms TEXT,
      discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'freebie')),
      discount_value NUMERIC(10,2),
      original_price NUMERIC(10,2),
      final_price NUMERIC(10,2),
      code TEXT,
      valid_from TIMESTAMPTZ,
      valid_until TIMESTAMPTZ,
      max_redemptions INTEGER,
      redemption_count INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      is_exclusive BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'expired', 'suspended')),
      location_point GEOGRAPHY(Point, 4326),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Offer locations (for multi-location offers)
CREATE TABLE IF NOT EXISTS public.offer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  location_point GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer media
CREATE TABLE IF NOT EXISTS public.offer_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer attributes (key-value pairs)
CREATE TABLE IF NOT EXISTS public.offer_attrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer favorites
CREATE TABLE IF NOT EXISTS public.offer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, offer_id)
);

-- Offer redemptions (complete version, non-destructive)
DO $$
BEGIN
  -- If the table does not exist at all, create it with the full schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'offer_redemptions'
  ) THEN
    CREATE TABLE public.offer_redemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      location_id UUID REFERENCES public.offer_locations(id),
      qr_code TEXT UNIQUE,
      redeemed_at TIMESTAMPTZ,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'cancelled')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Table exists: add any missing columns without dropping data
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'offer_id'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN offer_id UUID REFERENCES public.offers_full(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'location_id'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN location_id UUID REFERENCES public.offer_locations(id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'qr_code'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN qr_code TEXT;
      -- Uniqueness will be enforced below via CREATE UNIQUE INDEX or constraint
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'redeemed_at'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN redeemed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'status'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'cancelled'));
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.offer_redemptions
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Ensure qr_code is unique if the column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'offer_redemptions'
        AND column_name = 'qr_code'
    ) THEN
      BEGIN
        ALTER TABLE public.offer_redemptions
          ADD CONSTRAINT offer_redemptions_qr_code_key UNIQUE (qr_code);
      EXCEPTION WHEN duplicate_table OR duplicate_object THEN
        -- Constraint/index already exists; ignore
        NULL;
      END;
    END IF;
  END IF;
END $$;

-- Offer usage limits
CREATE TABLE IF NOT EXISTS public.offer_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_full(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL CHECK (limit_type IN ('per_user', 'per_day', 'total')),
  limit_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vendors_owner ON public.vendors(owner_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendor_staff_vendor ON public.vendor_staff(vendor_id);
CREATE INDEX IF NOT EXISTS idx_offer_categories_active ON public.offer_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS gist_offers_full_location ON public.offers_full USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_offers_full_vendor ON public.offers_full(vendor_id);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers_full' AND column_name = 'category_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offers_full_category ON public.offers_full(category_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers_full' AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_offers_full_status ON public.offers_full(status);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS gist_offer_locations_point ON public.offer_locations USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_offer_media_offer ON public.offer_media(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_favorites_user ON public.offer_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_offer ON public.offer_redemptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_user ON public.offer_redemptions(user_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vendors_public_approved ON public.vendors;
CREATE POLICY vendors_public_approved ON public.vendors FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS vendors_owner_all ON public.vendors;
CREATE POLICY vendors_owner_all ON public.vendors FOR ALL TO authenticated 
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

ALTER TABLE public.vendor_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vendor_staff_view ON public.vendor_staff;
CREATE POLICY vendor_staff_view ON public.vendor_staff FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND owner_id = auth.uid())
  OR user_id = auth.uid()
);

ALTER TABLE public.offer_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offer_categories_public ON public.offer_categories;
CREATE POLICY offer_categories_public ON public.offer_categories FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.offers_full ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offers_full_public_approved ON public.offers_full;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers_full' AND column_name = 'status'
  ) THEN
    CREATE POLICY offers_full_public_approved ON public.offers_full FOR SELECT USING (status = 'approved');
  END IF;
END $$;

DROP POLICY IF EXISTS offers_full_vendor_all ON public.offers_full;
CREATE POLICY offers_full_vendor_all ON public.offers_full FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND owner_id = auth.uid())
);

ALTER TABLE public.offer_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offer_locations_public ON public.offer_locations;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers_full' AND column_name = 'status'
  ) THEN
    CREATE POLICY offer_locations_public ON public.offer_locations FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.offers_full WHERE id = offer_id AND status = 'approved')
    );
  ELSE
    CREATE POLICY offer_locations_public ON public.offer_locations FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.offers_full WHERE id = offer_id)
    );
  END IF;
END $$;

ALTER TABLE public.offer_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offer_media_public ON public.offer_media;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers_full' AND column_name = 'status'
  ) THEN
    CREATE POLICY offer_media_public ON public.offer_media FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.offers_full WHERE id = offer_id AND status = 'approved')
    );
  ELSE
    CREATE POLICY offer_media_public ON public.offer_media FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.offers_full WHERE id = offer_id)
    );
  END IF;
END $$;

ALTER TABLE public.offer_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offer_favorites_owner ON public.offer_favorites;
CREATE POLICY offer_favorites_owner ON public.offer_favorites FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offer_redemptions_owner ON public.offer_redemptions;
CREATE POLICY offer_redemptions_owner ON public.offer_redemptions FOR SELECT TO authenticated 
USING (user_id = auth.uid());

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ OFFERS MODULE - COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables: vendors, vendor_staff, offer_categories, offers_full,';
  RAISE NOTICE '        offer_locations, offer_media, offer_attrs, offer_favorites,';
  RAISE NOTICE '        offer_redemptions, offer_limits';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
