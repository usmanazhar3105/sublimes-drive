-- Marketplace - Minimal Safe Addition
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add location_point if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'location_point') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN location_point GEOGRAPHY(Point, 4326);
    END IF;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_categories_public ON public.marketplace_categories;
CREATE POLICY marketplace_categories_public ON public.marketplace_categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS marketplace_brands_public ON public.marketplace_brands;
CREATE POLICY marketplace_brands_public ON public.marketplace_brands FOR SELECT USING (is_active = TRUE);

