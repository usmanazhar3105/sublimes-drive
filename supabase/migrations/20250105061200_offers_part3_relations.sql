-- Offers Part 3: Locations, Media, Favorites, Redemptions
CREATE TABLE IF NOT EXISTS public.offer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_complete(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  location_point GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offer_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_complete(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offer_favorites_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers_complete(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, offer_id)
);

CREATE TABLE IF NOT EXISTS public.offer_redemptions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers_complete(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.offer_locations(id),
  qr_code TEXT UNIQUE,
  redeemed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gist_offer_locations_point ON public.offer_locations USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_offer_media_offer ON public.offer_media(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_favorites_new_user ON public.offer_favorites_new(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_new_user ON public.offer_redemptions_new(user_id);

ALTER TABLE public.offer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_favorites_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_redemptions_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_locations_public ON public.offer_locations;
CREATE POLICY offer_locations_public ON public.offer_locations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.offers_complete WHERE id = offer_id AND status = 'approved')
);

DROP POLICY IF EXISTS offer_media_public ON public.offer_media;
CREATE POLICY offer_media_public ON public.offer_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.offers_complete WHERE id = offer_id AND status = 'approved')
);

DROP POLICY IF EXISTS offer_favorites_new_owner ON public.offer_favorites_new;
CREATE POLICY offer_favorites_new_owner ON public.offer_favorites_new FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS offer_redemptions_new_owner ON public.offer_redemptions_new;
CREATE POLICY offer_redemptions_new_owner ON public.offer_redemptions_new FOR SELECT TO authenticated 
USING (user_id = auth.uid());
