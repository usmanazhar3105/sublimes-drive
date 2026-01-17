-- ============================================================================
-- 📚 Sublimes Drive — Complete Database & Freya Agent Schema (Rev A)
-- ============================================================================
-- Status: ✅ Production-ready
-- Focus: Clean schema, safe RLS, Freya AI with 2-comment limit
-- No role recursion in RLS, admin via service role / hashed API token
-- ============================================================================

-- ============================================================================
-- 🔧 SECTION 1: GLOBAL SETUP (Extensions, Triggers, Helpers)
-- ============================================================================

-- Extensions (safe: run once per project)
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- fuzzy search
CREATE EXTENSION IF NOT EXISTS unaccent;   -- search normalization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID generation

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

-- ============================================================================
-- 🔧 SECTION 1.5: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================
-- This section ensures all columns exist before creating indexes or constraints
-- Safe to run multiple times - only adds columns if they don't exist

DO $$
DECLARE
  tbl TEXT;
  col TEXT;
BEGIN
  -- COMPREHENSIVE: Add ALL possible missing columns to ALL tables
  
  -- Posts: all potential missing columns
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'posts') THEN
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS car_brand TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS car_model TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS body TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS urgency TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
  END IF;

  -- Comments
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'comments') THEN
    ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS body TEXT;
  END IF;

  -- Post_likes
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'post_likes') THEN
    ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;

  -- Post_saves
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'post_saves') THEN
    ALTER TABLE public.post_saves ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.post_saves ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;

  -- Post_shares
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'post_shares') THEN
    ALTER TABLE public.post_shares ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    ALTER TABLE public.post_shares ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    ALTER TABLE public.post_shares ADD COLUMN IF NOT EXISTS share_type TEXT;
  END IF;

  -- Listings
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'listings') THEN
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS car_brand TEXT;
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS car_model TEXT;
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category TEXT;
  END IF;

  -- Listing_saves
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'listing_saves') THEN
    ALTER TABLE public.listing_saves ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.listing_saves ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  -- Garages
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'garages') THEN
    ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
  END IF;

  -- Garage_reviews
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'garage_reviews') THEN
    ALTER TABLE public.garage_reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.garage_reviews ADD COLUMN IF NOT EXISTS garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE;
  END IF;

  -- Events
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'events') THEN
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT;
  END IF;

  -- Event_attendees
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'event_attendees') THEN
    ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'going';
  END IF;

  -- Bid_repair
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bid_repair') THEN
    ALTER TABLE public.bid_repair ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.bid_repair ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
  END IF;

  -- Bid_replies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bid_replies') THEN
    ALTER TABLE public.bid_replies ADD COLUMN IF NOT EXISTS garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE;
    ALTER TABLE public.bid_replies ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bid_repair(id) ON DELETE CASCADE;
    ALTER TABLE public.bid_replies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
  END IF;

  -- Messages
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
    ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bid_repair(id) ON DELETE CASCADE;
  END IF;

  -- Offers
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'offers') THEN
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS offer_type TEXT;
  END IF;

  -- Challenges
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'challenges') THEN
    ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS difficulty TEXT;
    ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  END IF;

  -- Challenge_progress
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'challenge_progress') THEN
    ALTER TABLE public.challenge_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.challenge_progress ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE;
    ALTER TABLE public.challenge_progress ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
  END IF;

  -- Service_logs
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'service_logs') THEN
    ALTER TABLE public.service_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.service_logs ADD COLUMN IF NOT EXISTS service_type TEXT;
  END IF;

END $$;

-- ============================================================================
-- 🗂 SECTION 2: CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 PROFILES
-- ----------------------------------------------------------------------------
-- CRITICAL: Never check roles inside RLS using profile rows
-- Gate admin via service role or auth.jwt() claim to avoid infinite recursion

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  cover_image TEXT,
  role TEXT DEFAULT 'browser' CHECK (role IN ('admin','editor','car_owner','garage_owner','browser')),
  bio TEXT,
  location TEXT,
  phone_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON public.profiles(created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_on_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_on_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- 2.2 POSTS / COMMENTS / LIKES / SAVES / SHARES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  urgency TEXT CHECK (urgency IN ('low','medium','high','urgent')),
  car_brand TEXT,
  car_model TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags_gin ON public.posts USING gin(tags);

-- Conditional index for car_brand (only if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'posts' AND column_name = 'car_brand') THEN
    CREATE INDEX IF NOT EXISTS idx_posts_brand ON public.posts(car_brand);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_on_posts ON public.posts;
CREATE TRIGGER set_updated_at_on_posts
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_post_like UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_post_save UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON public.post_saves(user_id);

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('link','whatsapp','twitter','facebook','email','other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);

-- Conditional index for share_type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'post_shares' AND column_name = 'share_type') THEN
    CREATE INDEX IF NOT EXISTS idx_post_shares_type ON public.post_shares(share_type);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2.3 LISTINGS / LISTING_SAVES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('parts','accessories','tools','services','other')),
  condition TEXT CHECK (condition IN ('new','like-new','good','fair','poor')),
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'AED',
  location TEXT,
  car_brand TEXT,
  car_model TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  is_featured BOOLEAN DEFAULT FALSE,
  is_sold BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured DESC);

-- Conditional index for car_brand/car_model (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'listings' AND column_name = 'car_brand') THEN
    CREATE INDEX IF NOT EXISTS idx_listings_brand_model ON public.listings(car_brand, car_model);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_on_listings ON public.listings;
CREATE TRIGGER set_updated_at_on_listings
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.listing_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_listing_save UNIQUE(listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_saves_listing ON public.listing_saves(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_saves_user ON public.listing_saves(user_id);

-- ----------------------------------------------------------------------------
-- 2.4 GARAGES / GARAGE_REVIEWS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  specialties TEXT[] DEFAULT '{}'::text[],
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garages_owner ON public.garages(owner_id);
CREATE INDEX IF NOT EXISTS idx_garages_status ON public.garages(status);
CREATE INDEX IF NOT EXISTS idx_garages_featured ON public.garages(is_featured DESC);

DROP TRIGGER IF EXISTS set_updated_at_on_garages ON public.garages;
CREATE TRIGGER set_updated_at_on_garages
  BEFORE UPDATE ON public.garages
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.garage_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_garage_review UNIQUE(garage_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_garage_reviews_garage ON public.garage_reviews(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_user ON public.garage_reviews(user_id);

-- ----------------------------------------------------------------------------
-- 2.5 EVENTS / EVENT_ATTENDEES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('meetup','exhibition','race','workshop','other')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);

-- Conditional index for event_type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'events' AND column_name = 'event_type') THEN
    CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
  END IF;
END $$;

-- Conditional index for start_date
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'events' AND column_name = 'start_date') THEN
    CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_date DESC);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_on_events ON public.events;
CREATE TRIGGER set_updated_at_on_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going','interested','not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_event_attendee UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON public.event_attendees(user_id);

-- ----------------------------------------------------------------------------
-- 2.6 BID_REPAIR / BID_REPLIES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bid_repair (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  car_brand TEXT,
  car_model TEXT,
  car_year INTEGER,
  urgency TEXT CHECK (urgency IN ('low','medium','high','urgent')),
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','bidding','accepted','completed','cancelled')),
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_repair_user ON public.bid_repair(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_repair_status ON public.bid_repair(status);
CREATE INDEX IF NOT EXISTS idx_bid_repair_created ON public.bid_repair(created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_on_bid_repair ON public.bid_repair;
CREATE TRIGGER set_updated_at_on_bid_repair
  BEFORE UPDATE ON public.bid_repair
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.bid_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.bid_repair(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  price_estimate NUMERIC(10,2) NOT NULL,
  estimated_time TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_replies_bid ON public.bid_replies(bid_id);
CREATE INDEX IF NOT EXISTS idx_bid_replies_garage ON public.bid_replies(garage_id);

-- ----------------------------------------------------------------------------
-- 2.7 MESSAGES (for bid communication)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.bid_repair(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_bid ON public.messages(bid_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ----------------------------------------------------------------------------
-- 2.8 OFFERS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT CHECK (offer_type IN ('discount','service','product','event')),
  category TEXT,
  discount_percentage INTEGER,
  original_price NUMERIC(10,2),
  discounted_price NUMERIC(10,2),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_claims INTEGER,
  claim_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_creator ON public.offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_valid ON public.offers(valid_from, valid_until);

-- ----------------------------------------------------------------------------
-- 2.9 CHALLENGES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL,
  type TEXT CHECK (type IN ('daily','weekly','special')),
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  target_value INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);

-- Conditional index for type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'challenges' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','claimed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ux_challenge_progress UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);

-- ----------------------------------------------------------------------------
-- 2.10 SERVICE_LOGS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_brand TEXT,
  car_model TEXT,
  car_year INTEGER,
  service_type TEXT,
  service_description TEXT,
  service_date DATE,
  mileage INTEGER,
  cost NUMERIC(10,2),
  garage_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_user ON public.service_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_date ON public.service_logs(service_date DESC);

DROP TRIGGER IF EXISTS set_updated_at_on_service_logs ON public.service_logs;
CREATE TRIGGER set_updated_at_on_service_logs
  BEFORE UPDATE ON public.service_logs
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

-- ============================================================================
-- 🤖 SECTION 3: FREYA (AI AUTO-COMMENT) PRIMITIVES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  provider TEXT DEFAULT 'openai',
  model TEXT DEFAULT 'gpt-4o-mini',
  max_comment_len INTEGER DEFAULT 900,
  allow_images BOOLEAN DEFAULT TRUE,
  comment_limit_per_post INTEGER DEFAULT 2,
  admin_api_token_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.ai_settings(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS set_updated_at_on_ai_settings ON public.ai_settings;
CREATE TRIGGER set_updated_at_on_ai_settings
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE PROCEDURE public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.ai_comment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  ai_action TEXT NOT NULL CHECK (ai_action IN ('auto_comment','reply_comment','like')),
  used_tokens INTEGER DEFAULT 0,
  has_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_comment_log_post ON public.ai_comment_log(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_comment_log_action ON public.ai_comment_log(ai_action);
CREATE INDEX IF NOT EXISTS idx_ai_comment_log_created ON public.ai_comment_log(created_at DESC);

-- ============================================================================
-- ⚙ SECTION 4: RPC FUNCTIONS
-- ============================================================================

-- Function: Check if AI can comment on a post (2-comment limit)
DROP FUNCTION IF EXISTS public.fn_ai_can_comment(UUID);
CREATE OR REPLACE FUNCTION public.fn_ai_can_comment(p_post_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT COUNT(*) < 2 FROM public.ai_comment_log
  WHERE post_id = p_post_id AND ai_action IN ('auto_comment','reply_comment');
$$;

-- Function: Set admin API token (hashed)
DROP FUNCTION IF EXISTS public.fn_set_admin_token(TEXT);
CREATE OR REPLACE FUNCTION public.fn_set_admin_token(p_raw TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.ai_settings
  SET admin_api_token_hash = encode(digest(p_raw, 'sha256'), 'hex'),
      updated_at = NOW()
  WHERE id = 1;
END$$;

-- Function: Update XP and level
DROP FUNCTION IF EXISTS public.fn_update_xp(UUID, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION public.fn_update_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new INTEGER;
  v_lvl INTEGER;
BEGIN
  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + p_amount
  WHERE id = p_user_id
  RETURNING total_xp INTO v_new;
  
  v_lvl := GREATEST(1, 1 + (v_new / 500));
  
  UPDATE public.profiles
  SET level = v_lvl
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'new_xp', v_new,
    'new_level', v_lvl
  );
END$$;

-- Function: Toggle post like
DROP FUNCTION IF EXISTS public.fn_toggle_like(UUID);
CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_exists BOOLEAN;
  v_count INTEGER;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = auth.uid()
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.post_likes(post_id, user_id)
    VALUES (p_post_id, auth.uid());
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM public.post_likes WHERE post_id = p_post_id;
  
  UPDATE public.posts SET like_count = v_count WHERE id = p_post_id;
  
  RETURN json_build_object(
    'liked', NOT v_exists,
    'like_count', v_count
  );
END$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_ai_can_comment(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_set_admin_token(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_update_xp(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO authenticated;

-- ============================================================================
-- 🔐 SECTION 5: ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garage_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_repair ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_comment_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Posts policies
DROP POLICY IF EXISTS "posts_read_all" ON public.posts;
CREATE POLICY "posts_read_all" ON public.posts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies (public read, self insert/update/delete)
DROP POLICY IF EXISTS "comments_read_all" ON public.comments;
CREATE POLICY "comments_read_all" ON public.comments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Post interactions (likes, saves, shares) - similar pattern
DROP POLICY IF EXISTS "post_likes_manage_own" ON public.post_likes;
CREATE POLICY "post_likes_manage_own" ON public.post_likes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_saves_manage_own" ON public.post_saves;
CREATE POLICY "post_saves_manage_own" ON public.post_saves FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_shares_insert" ON public.post_shares;
CREATE POLICY "post_shares_insert" ON public.post_shares FOR INSERT
  WITH CHECK (TRUE);

-- Listings policies
DROP POLICY IF EXISTS "listings_read_all" ON public.listings;
CREATE POLICY "listings_read_all" ON public.listings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "listings_manage_own" ON public.listings;
CREATE POLICY "listings_manage_own" ON public.listings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Listing saves
DROP POLICY IF EXISTS "listing_saves_manage_own" ON public.listing_saves;
CREATE POLICY "listing_saves_manage_own" ON public.listing_saves FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Garages policies
DROP POLICY IF EXISTS "garages_read_approved" ON public.garages;
CREATE POLICY "garages_read_approved" ON public.garages FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "garages_manage_own" ON public.garages;
CREATE POLICY "garages_manage_own" ON public.garages FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Events policies
DROP POLICY IF EXISTS "events_read_all" ON public.events;
CREATE POLICY "events_read_all" ON public.events FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "events_manage_own" ON public.events;
CREATE POLICY "events_manage_own" ON public.events FOR ALL
  USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

-- Bid repair policies
DROP POLICY IF EXISTS "bid_repair_read_all" ON public.bid_repair;
CREATE POLICY "bid_repair_read_all" ON public.bid_repair FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "bid_repair_manage_own" ON public.bid_repair;
CREATE POLICY "bid_repair_manage_own" ON public.bid_repair FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Messages policies (only after bid accepted/completed)
DROP POLICY IF EXISTS "messages_read_own" ON public.messages;
CREATE POLICY "messages_read_own" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_insert_when_accepted" ON public.messages;
CREATE POLICY "messages_insert_when_accepted" ON public.messages FOR INSERT
  WITH CHECK (
    (SELECT status FROM public.bid_repair WHERE id = bid_id) IN ('accepted', 'completed')
    AND auth.uid() = sender_id
  );

-- Service logs policies
DROP POLICY IF EXISTS "service_logs_manage_own" ON public.service_logs;
CREATE POLICY "service_logs_manage_own" ON public.service_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Freya AI tables - locked down
REVOKE ALL ON TABLE public.ai_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.ai_comment_log FROM anon, authenticated;

GRANT SELECT ON TABLE public.ai_settings TO service_role;
GRANT ALL ON TABLE public.ai_settings TO service_role;
GRANT ALL ON TABLE public.ai_comment_log TO service_role;

-- ============================================================================
-- 📊 SECTION 6: COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access';
COMMENT ON TABLE public.posts IS 'Community posts';
COMMENT ON TABLE public.comments IS 'Post comments';
COMMENT ON TABLE public.post_likes IS 'Post like tracking';
COMMENT ON TABLE public.post_saves IS 'Post bookmark tracking';
COMMENT ON TABLE public.post_shares IS 'Post share tracking';
COMMENT ON TABLE public.listings IS 'Marketplace listings';
COMMENT ON TABLE public.listing_saves IS 'Saved listings';
COMMENT ON TABLE public.garages IS 'Garage/workshop profiles';
COMMENT ON TABLE public.garage_reviews IS 'Garage reviews and ratings';
COMMENT ON TABLE public.events IS 'Events and meetups';
COMMENT ON TABLE public.event_attendees IS 'Event attendance tracking';
COMMENT ON TABLE public.bid_repair IS 'Repair bid requests';
COMMENT ON TABLE public.bid_replies IS 'Garage replies to bids';
COMMENT ON TABLE public.messages IS 'Bid-related messages (unlocked after acceptance)';
COMMENT ON TABLE public.offers IS 'Promotional offers';
COMMENT ON TABLE public.challenges IS 'Daily/weekly challenges';
COMMENT ON TABLE public.challenge_progress IS 'User challenge progress';
COMMENT ON TABLE public.service_logs IS 'Vehicle service history';
COMMENT ON TABLE public.ai_settings IS 'Freya AI global settings (2-comment limit)';
COMMENT ON TABLE public.ai_comment_log IS 'Freya AI comment audit log';

COMMENT ON FUNCTION public.fn_ai_can_comment(UUID) IS 'Check if AI can comment on post (max 2 comments)';
COMMENT ON FUNCTION public.fn_set_admin_token(TEXT) IS 'Set hashed admin API token for Freya';
COMMENT ON FUNCTION public.fn_update_xp(UUID, INTEGER, TEXT) IS 'Update user XP and calculate level';
COMMENT ON FUNCTION public.fn_toggle_like(UUID) IS 'Toggle post like and update count';

-- ============================================================================
-- ✅ DEPLOYMENT COMPLETE
-- ============================================================================
-- Document ID: sd-schema-revA-2025-11-06
-- Author: Chief Architect — Sublimes Drive
-- ============================================================================

