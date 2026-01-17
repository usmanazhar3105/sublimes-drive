-- ============================================================================
-- SUBLIMES DRIVE - COMPLETE DATABASE SCHEMA (Tables)
-- Version: 1.0
-- Created: November 3, 2025
-- ============================================================================
-- This migration adds all remaining tables from the comprehensive schema
-- All operations are additive and safe
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENHANCE POSTS TABLE (Add missing columns)
-- ============================================================================

DO $$
BEGIN
  -- Add content column (alias for body if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'content'
  ) THEN
    -- If body exists, create computed column, otherwise add content
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'body') THEN
      -- Comment to indicate body is used as content
      COMMENT ON COLUMN public.posts.body IS 'Post content (also accessible as content field in app)';
    ELSE
      ALTER TABLE public.posts ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add images column (alias for media)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'images'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'media'
  ) THEN
    COMMENT ON COLUMN public.posts.media IS 'Media array (images/videos), also accessible as images field in app';
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'images') THEN
    ALTER TABLE public.posts ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add is_pinned (might exist as pinned)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_pinned'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'pinned'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_featured (might exist as featured)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_featured'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: POST STATS ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_stats') THEN
    -- Add share_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_stats' AND column_name = 'share_count') THEN
      ALTER TABLE public.post_stats ADD COLUMN share_count INTEGER DEFAULT 0;
    END IF;

    -- Add save_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_stats' AND column_name = 'save_count') THEN
      ALTER TABLE public.post_stats ADD COLUMN save_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: PROFILES ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  -- Add display_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
    ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    -- Populate from full_name or email
    UPDATE public.profiles SET display_name = COALESCE(full_name, SPLIT_PART(email, '@', 1)) WHERE display_name IS NULL;
  END IF;

  -- Add presence if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'presence') THEN
    ALTER TABLE public.profiles ADD COLUMN presence TEXT 
      CHECK (presence IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline';
  END IF;

  -- Add last_seen if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen') THEN
    ALTER TABLE public.profiles ADD COLUMN last_seen TIMESTAMPTZ;
  END IF;

  -- Add is_premium if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add level if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
    ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;

  -- Add wallet_balance if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
    ALTER TABLE public.profiles ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Add is_verified if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
    ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: COMMENTS ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    -- Add is_edited if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_edited') THEN
      ALTER TABLE public.comments ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
    END IF;

    -- Ensure parent_comment_id exists (might be parent_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_id') THEN
      COMMENT ON COLUMN public.comments.parent_id IS 'Parent comment ID for nested replies (also known as parent_comment_id)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') 
          AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_id') THEN
      ALTER TABLE public.comments ADD COLUMN parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;

    -- Add content column if using body
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'content')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'body') THEN
      COMMENT ON COLUMN public.comments.body IS 'Comment text (also accessible as content in app)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'content') THEN
      ALTER TABLE public.comments ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: LISTINGS ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Add user_id as alias for seller_id if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
      COMMENT ON COLUMN public.listings.seller_id IS 'Listing owner (also known as user_id in some contexts)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'user_id') THEN
      ALTER TABLE public.listings ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add is_featured if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_featured') THEN
      ALTER TABLE public.listings ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add is_boosted if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_boosted') THEN
      ALTER TABLE public.listings ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add boost_expires_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'boost_expires_at') THEN
      ALTER TABLE public.listings ADD COLUMN boost_expires_at TIMESTAMPTZ;
    END IF;

    -- Add attributes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'attributes') THEN
      ALTER TABLE public.listings ADD COLUMN attributes JSONB DEFAULT '{}'::jsonb;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 6: EVENTS ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    -- Add user_id as alias for creator_id/organizer_id if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
      COMMENT ON COLUMN public.events.organizer_id IS 'Event creator (also known as user_id in app)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'user_id')
          AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'creator_id') THEN
      COMMENT ON COLUMN public.events.creator_id IS 'Event creator (also known as user_id in app)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'user_id') THEN
      ALTER TABLE public.events ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add event_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_type') THEN
      ALTER TABLE public.events ADD COLUMN event_type TEXT 
        CHECK (event_type IN ('meetup', 'instant_meetup', 'official', 'community')) DEFAULT 'community';
    END IF;

    -- Add images if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'images') THEN
      ALTER TABLE public.events ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add location_lat/lng if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_lat') THEN
      ALTER TABLE public.events ADD COLUMN location_lat DECIMAL(10,8);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_lng') THEN
      ALTER TABLE public.events ADD COLUMN location_lng DECIMAL(11,8);
    END IF;

    -- Add start_time/end_time (might be event_date)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date') THEN
      COMMENT ON COLUMN public.events.event_date IS 'Event start time (also known as start_time)';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
      ALTER TABLE public.events ADD COLUMN start_time TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
      ALTER TABLE public.events ADD COLUMN end_time TIMESTAMPTZ;
    END IF;

    -- Add max_attendees if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_attendees') THEN
      ALTER TABLE public.events ADD COLUMN max_attendees INTEGER;
    END IF;

    -- Add is_featured (might exist as featured)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_featured')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'featured') THEN
      ALTER TABLE public.events ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 7: GARAGES ENHANCEMENTS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    -- Add logo_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'logo_url') THEN
      ALTER TABLE public.garages ADD COLUMN logo_url TEXT;
    END IF;

    -- Add cover_image_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'cover_image_url') THEN
      ALTER TABLE public.garages ADD COLUMN cover_image_url TEXT;
    END IF;

    -- Add services array if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'services') THEN
      ALTER TABLE public.garages ADD COLUMN services TEXT[] DEFAULT '{}';
    END IF;

    -- Add email if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'email') THEN
      ALTER TABLE public.garages ADD COLUMN email TEXT;
    END IF;

    -- Add is_verified if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'is_verified') THEN
      ALTER TABLE public.garages ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add is_boosted if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'is_boosted') THEN
      ALTER TABLE public.garages ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add boost_expires_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'boost_expires_at') THEN
      ALTER TABLE public.garages ADD COLUMN boost_expires_at TIMESTAMPTZ;
    END IF;

    -- Add rating if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'rating') THEN
      ALTER TABLE public.garages ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    -- Add review_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'review_count') THEN
      ALTER TABLE public.garages ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 8: NEW TABLES
-- ============================================================================

-- Garage Media
CREATE TABLE IF NOT EXISTS public.garage_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'video', 'document')) DEFAULT 'photo',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garage_media_garage_id ON public.garage_media(garage_id);

-- Marketplace Categories
CREATE TABLE IF NOT EXISTS public.mk_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.mk_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mk_categories_parent ON public.mk_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_mk_categories_slug ON public.mk_categories(slug);

-- Marketplace Attributes
CREATE TABLE IF NOT EXISTS public.mk_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.mk_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'number', 'select', 'multiselect', 'boolean')) DEFAULT 'text',
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mk_attributes_category ON public.mk_attributes(category_id);

-- Listing Saves (if not exists)
CREATE TABLE IF NOT EXISTS public.listing_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_saves_listing_id ON public.listing_saves(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_saves_user_id ON public.listing_saves(user_id);

-- Bid Threads
CREATE TABLE IF NOT EXISTS public.bid_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_request_id UUID NOT NULL REFERENCES public.bid_requests(id) ON DELETE CASCADE,
  bid_reply_id UUID NOT NULL REFERENCES public.bid_replies(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_threads_request ON public.bid_threads(bid_request_id);
CREATE INDEX IF NOT EXISTS idx_bid_threads_requester ON public.bid_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_bid_threads_garage ON public.bid_threads(garage_owner_id);

-- Bid Messages
CREATE TABLE IF NOT EXISTS public.bid_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.bid_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_messages_thread ON public.bid_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_bid_messages_sender ON public.bid_messages(sender_id);

-- Event Likes
CREATE TABLE IF NOT EXISTS public.event_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON public.event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON public.event_likes(user_id);

-- Event Views
CREATE TABLE IF NOT EXISTS public.event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON public.event_views(event_id);

-- Challenge Progress
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);

-- Push Templates
CREATE TABLE IF NOT EXISTS public.push_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  action_url_template TEXT,
  icon_url TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Segments
CREATE TABLE IF NOT EXISTS public.push_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  conditions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Push Tokens
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user ON public.user_push_tokens(user_id);

-- User Push Settings
CREATE TABLE IF NOT EXISTS public.user_push_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT TRUE,
  updates BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  events BOOLEAN DEFAULT TRUE,
  bids BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  from_name TEXT,
  from_email TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Segments
CREATE TABLE IF NOT EXISTS public.email_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  conditions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMTP Configs
CREATE TABLE IF NOT EXISTS public.smtp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  use_tls BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Suppressions
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  reason TEXT CHECK (reason IN ('bounce', 'complaint', 'unsubscribe', 'manual')) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Email Settings
CREATE TABLE IF NOT EXISTS public.user_email_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT TRUE,
  updates BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  events BOOLEAN DEFAULT TRUE,
  bids BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB Categories
CREATE TABLE IF NOT EXISTS public.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_categories_slug ON public.kb_categories(slug);

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT CHECK (level IN ('info', 'warning', 'error', 'critical')) NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON public.system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Boost Packages
CREATE TABLE IF NOT EXISTS public.boost_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('listing', 'garage', 'post', 'offer')) NOT NULL,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index only if entity_type column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'entity_type') THEN
    CREATE INDEX IF NOT EXISTS idx_boost_packages_entity_type ON public.boost_packages(entity_type);
  END IF;
END $$;

-- ============================================================================
-- SECTION 9: VIEWS
-- ============================================================================

-- Event Stats View
CREATE OR REPLACE VIEW v_event_stats AS
SELECT 
  e.id AS event_id,
  COUNT(DISTINCT ev.id) AS view_count,
  COUNT(DISTINCT el.id) AS like_count,
  COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'going') AS attendee_count
FROM events e
LEFT JOIN event_views ev ON e.id = ev.event_id
LEFT JOIN event_likes el ON e.id = el.event_id
LEFT JOIN event_attendees ea ON e.id = ea.event_id
GROUP BY e.id;

-- Leaderboard Views
CREATE OR REPLACE VIEW vw_leaderboard_week AS
SELECT 
  p.id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.xp_points,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp_points DESC) AS rank
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.xp_points DESC
LIMIT 100;

CREATE OR REPLACE VIEW vw_leaderboard_month AS
SELECT 
  p.id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.xp_points,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp_points DESC) AS rank
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '30 days'
ORDER BY p.xp_points DESC
LIMIT 100;

CREATE OR REPLACE VIEW vw_leaderboard_all AS
SELECT 
  p.id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.xp_points,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp_points DESC) AS rank
FROM profiles p
ORDER BY p.xp_points DESC
LIMIT 100;

-- App Stats View (Daily)
CREATE OR REPLACE VIEW v_app_stats_day AS
SELECT 
  DATE(created_at) AS stat_date,
  COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN user_id END) AS sessions,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(*) AS total_events
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY stat_date DESC;

-- Module Stats View (Daily)
CREATE OR REPLACE VIEW v_module_stats_day AS
SELECT 
  DATE(created_at) AS stat_date,
  event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
AND event_name IN ('post_created', 'listing_created', 'event_created', 'bid_created', 'message_sent')
GROUP BY DATE(created_at), event_name
ORDER BY stat_date DESC, event_count DESC;

-- Brand Kit Public View (check which columns exist)
DO $$
BEGIN
  -- Drop existing view
  DROP VIEW IF EXISTS vw_brandkit_public;
  
  -- Create view based on available columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_assets' AND column_name = 'type') THEN
    CREATE VIEW vw_brandkit_public AS
    SELECT id, type, name, file_url, thumbnail_url, meta
    FROM brand_assets
    WHERE is_active = TRUE;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_assets' AND column_name = 'file_ref') THEN
    CREATE VIEW vw_brandkit_public AS
    SELECT id, file_ref, meta
    FROM brand_assets;
  END IF;
END $$;

-- Verification Union View (handles different column names)
DO $$
BEGIN
  DROP VIEW IF EXISTS vw_verifications_union;
  
  -- Create view based on actual columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'verification_type') THEN
    CREATE VIEW vw_verifications_union AS
    SELECT 
      id,
      user_id,
      verification_type AS type,
      status,
      documents,
      rejection_reason AS notes,
      NULL::TEXT AS admin_notes,
      reviewer_id AS reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    FROM verification_requests;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'type') THEN
    CREATE VIEW vw_verifications_union AS
    SELECT 
      id,
      user_id,
      type,
      status,
      documents,
      reason AS notes,
      NULL::TEXT AS admin_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      NULL::TIMESTAMPTZ AS updated_at
    FROM verification_requests;
  END IF;
END $$;

-- ============================================================================
-- SECTION 10: INITIALIZE POST_STATS FOR EXISTING POSTS
-- ============================================================================

-- Backfill post_stats for any posts that don't have stats
INSERT INTO post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
SELECT 
  p.id,
  COALESCE(COUNT(DISTINCT pv.id), 0) AS view_count,
  COALESCE(COUNT(DISTINCT pl.id), 0) AS like_count,
  COALESCE(COUNT(DISTINCT c.id), 0) AS comment_count,
  0 AS share_count,
  COALESCE(COUNT(DISTINCT ps.id), 0) AS save_count
FROM posts p
LEFT JOIN post_views pv ON p.id = pv.post_id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN post_saves ps ON p.id = ps.post_id
WHERE NOT EXISTS (SELECT 1 FROM post_stats WHERE post_id = p.id)
GROUP BY p.id
ON CONFLICT (post_id) DO NOTHING;

-- ============================================================================
-- SECTION 11: GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- END OF SCHEMA TABLES
-- ============================================================================

COMMENT ON SCHEMA public IS 'Sublimes Drive - Complete Schema with all tables (2025-11-03)';

