-- Offers Part 2: Categories and Core Offers Table
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

-- Main offers table  
CREATE TABLE IF NOT EXISTS public.offers_complete (
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

CREATE INDEX IF NOT EXISTS idx_offers_complete_vendor ON public.offers_complete(vendor_id);
CREATE INDEX IF NOT EXISTS idx_offers_complete_status ON public.offers_complete(status);
CREATE INDEX IF NOT EXISTS gist_offers_complete_location ON public.offers_complete USING GIST (location_point);

ALTER TABLE public.offer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers_complete ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_categories_public ON public.offer_categories;
CREATE POLICY offer_categories_public ON public.offer_categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS offers_complete_public ON public.offers_complete;
CREATE POLICY offers_complete_public ON public.offers_complete FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS offers_complete_vendor ON public.offers_complete;
CREATE POLICY offers_complete_vendor ON public.offers_complete FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND owner_id = auth.uid())
);
