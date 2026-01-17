-- 801: ADD MISSING TABLES ONLY (non-overlapping with existing migrations)
-- Safe: additive only, IF NOT EXISTS everywhere. No destructive ops.
-- Avoids redefining objects already created by earlier migrations.

BEGIN;

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- Events module (not found in existing migrations)
-- =========================

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
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured) WHERE is_featured = true;

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
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(event_id, status);

CREATE TABLE IF NOT EXISTS public.event_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_likes_event ON public.event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user ON public.event_likes(user_id);

CREATE TABLE IF NOT EXISTS public.event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_views_event ON public.event_views(event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user ON public.event_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_views_session ON public.event_views(session_id) WHERE session_id IS NOT NULL;

-- =========================
-- Garage enhancements (not found earlier)
-- =========================

CREATE TABLE IF NOT EXISTS public.garage_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  estimated_duration TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garage_id, service_category_id)
);

CREATE INDEX IF NOT EXISTS idx_garage_services_garage ON public.garage_services(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_services_category ON public.garage_services(service_category_id);

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

-- =========================
-- Wallet & Social minimal
-- =========================

CREATE TABLE IF NOT EXISTS public.wallet_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'AED',
  total_deposited DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  CONSTRAINT wallet_balance_non_negative CHECK (balance >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wallet_balance_user ON public.wallet_balance(user_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_unread_read_at ON public.notifications(user_id) WHERE read_at IS NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> following_id)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'follows' AND column_name = 'follower_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'follows' AND column_name = 'following_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
  END IF;
END $$;

-- =========================
-- Push & Email auxiliary tables (not present yet)
-- =========================

CREATE TABLE IF NOT EXISTS public.push_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_push_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  categories JSONB DEFAULT '{"posts": true, "comments": true, "events": true, "offers": true, "messages": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  provider_type TEXT CHECK (provider_type IN ('fcm','apns','web_push')),
  device_type TEXT,
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user ON public.user_push_tokens(user_id);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_push_tokens' AND column_name = 'is_active'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_push_tokens_active ON public.user_push_tokens(is_active) WHERE is_active = true;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.smtp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL CHECK (reason IN ('bounce','complaint','unsubscribe')),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON public.email_suppressions(email);

CREATE TABLE IF NOT EXISTS public.user_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  categories JSONB DEFAULT '{"marketing": true, "transactional": true, "newsletters": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =========================
-- Brand & Legal
-- =========================

CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON public.brand_assets(asset_type);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brand_assets' AND column_name = 'is_active'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_brand_assets_active ON public.brand_assets(is_active) WHERE is_active = true;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type, version, language)
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON public.support_tickets(assigned_to);

-- =========================
-- Views
-- =========================

DO $$
DECLARE
  v_has_view_count boolean;
  v_sql text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'view_count'
  ) INTO v_has_view_count;

  IF v_has_view_count THEN
    v_sql := $v$
      CREATE OR REPLACE VIEW public.event_stats AS
      SELECT 
        e.id AS event_id,
        COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'going') AS going_count,
        COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'interested') AS interested_count,
        COUNT(DISTINCT el.id) AS like_count,
        e.view_count
      FROM public.events e
      LEFT JOIN public.event_attendees ea ON ea.event_id = e.id
      LEFT JOIN public.event_likes el ON el.event_id = e.id
      GROUP BY e.id, e.view_count;
    $v$;
  ELSE
    v_sql := $v$
      CREATE OR REPLACE VIEW public.event_stats AS
      SELECT 
        e.id AS event_id,
        COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'going') AS going_count,
        COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'interested') AS interested_count,
        COUNT(DISTINCT el.id) AS like_count,
        NULL::integer AS view_count
      FROM public.events e
      LEFT JOIN public.event_attendees ea ON ea.event_id = e.id
      LEFT JOIN public.event_likes el ON el.event_id = e.id
      GROUP BY e.id;
    $v$;
  END IF;

  EXECUTE v_sql;
END $$;

CREATE OR REPLACE VIEW public.garage_stats AS
SELECT 
  g.id AS garage_id,
  COUNT(DISTINCT gr.id) AS review_count,
  ROUND(AVG(gr.rating), 1) AS avg_rating,
  COUNT(DISTINCT gs.id) AS service_count
FROM public.garages g
LEFT JOIN public.garage_reviews gr ON gr.garage_id = g.id
LEFT JOIN public.garage_services gs ON gs.garage_id = g.id
GROUP BY g.id;

-- =========================
-- RLS for new tables only (avoid conflicting with existing policies)
-- =========================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_public_read'
  ) THEN
    CREATE POLICY events_public_read ON public.events FOR SELECT USING (status = 'approved' OR creator_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_owner_modify'
  ) THEN
    CREATE POLICY events_owner_modify ON public.events FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_attendees' AND policyname = 'event_attendees_public_read'
  ) THEN
    CREATE POLICY event_attendees_public_read ON public.event_attendees FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_attendees' AND policyname = 'event_attendees_owner_modify'
  ) THEN
    CREATE POLICY event_attendees_owner_modify ON public.event_attendees FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_likes' AND policyname = 'event_likes_public_read'
  ) THEN
    CREATE POLICY event_likes_public_read ON public.event_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_likes' AND policyname = 'event_likes_owner_modify'
  ) THEN
    CREATE POLICY event_likes_owner_modify ON public.event_likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_views' AND policyname = 'event_views_insert_all'
  ) THEN
    CREATE POLICY event_views_insert_all ON public.event_views FOR INSERT WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.garage_services ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_services' AND policyname = 'garage_services_public_read'
  ) THEN
    CREATE POLICY garage_services_public_read ON public.garage_services FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE public.garage_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_reviews' AND policyname = 'garage_reviews_public_read'
  ) THEN
    CREATE POLICY garage_reviews_public_read ON public.garage_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_reviews' AND policyname = 'garage_reviews_owner_modify'
  ) THEN
    CREATE POLICY garage_reviews_owner_modify ON public.garage_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wallet_balance' AND policyname = 'wallet_balance_owner_read'
  ) THEN
    CREATE POLICY wallet_balance_owner_read ON public.wallet_balance FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner_read'
  ) THEN
    CREATE POLICY notifications_owner_read ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner_update'
  ) THEN
    CREATE POLICY notifications_owner_update ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows' AND policyname = 'follows_public_read'
  ) THEN
    CREATE POLICY follows_public_read ON public.follows FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows' AND policyname = 'follows_owner_modify'
  ) THEN
    CREATE POLICY follows_owner_modify ON public.follows FOR ALL USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
  END IF;
END $$;

COMMIT;
