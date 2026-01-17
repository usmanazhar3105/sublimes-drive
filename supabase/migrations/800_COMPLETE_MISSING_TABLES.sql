-- 800_COMPLETE_MISSING_TABLES.sql
-- Phase 1 (part): Events module + Garage enhancements
-- Additive, idempotent (IF NOT EXISTS); no destructive changes

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- Events Module
-- =========================

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meetup','track_day','car_show','workshop','cruise','charity')),
  location TEXT NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  cover_image TEXT,
  images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  is_featured BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT events_valid_times CHECK (end_time IS NULL OR end_time > start_time),
  CONSTRAINT events_valid_max_attendees CHECK (max_attendees IS NULL OR max_attendees > 0)
);

CREATE INDEX IF NOT EXISTS idx_events_creator ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_time'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location_id);

-- event_attendees
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going','interested','not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(status);

-- event_likes
CREATE TABLE IF NOT EXISTS public.event_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_likes_event ON public.event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user ON public.event_likes(user_id);

-- event_views
CREATE TABLE IF NOT EXISTS public.event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_views_event ON public.event_views(event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user ON public.event_views(user_id);

-- =========================
-- Garage Enhancements
-- =========================

-- garage_services (many-to-many with service_categories)
CREATE TABLE IF NOT EXISTS public.garage_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  estimated_duration TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garage_id, service_category_id)
);

CREATE INDEX IF NOT EXISTS idx_garage_services_garage ON public.garage_services(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_services_category ON public.garage_services(service_category_id);

-- garage_reviews
CREATE TABLE IF NOT EXISTS public.garage_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  service_type TEXT,
  visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garage_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_garage_reviews_garage ON public.garage_reviews(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_user ON public.garage_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_rating ON public.garage_reviews(rating);
