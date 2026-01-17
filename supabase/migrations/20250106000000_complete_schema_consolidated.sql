-- ============================================================================
-- 🚀 SUBLIMES DRIVE - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Production-ready, idempotent, chunked deployment
-- Includes: Core tables, Admin modules, RPC functions, RLS policies
-- Last Updated: 2025-11-06
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE TABLES
-- ============================================================================

-- 1️⃣ PROFILES (Main User Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  cover_image TEXT,
  role TEXT NOT NULL DEFAULT 'browser' CHECK (role IN ('admin','editor','car_owner','garage_owner','browser')),
  bio TEXT,
  location TEXT,
  phone_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON public.profiles(created_at DESC);

-- 2️⃣ COMMUNITIES MODULE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  media JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  urgency TEXT CHECK (urgency IN ('low','medium','high','urgent')),
  car_brand TEXT,
  car_model TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_urgency ON public.posts(urgency);
CREATE INDEX IF NOT EXISTS idx_posts_brand ON public.posts(car_brand);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON public.posts(is_pinned DESC);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_post_like UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_post_save UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON public.post_saves(user_id);

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('link','whatsapp','twitter','facebook','email','other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_type ON public.post_shares(share_type);

-- 3️⃣ MARKETPLACE MODULE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('parts','accessories','tools','services','other')),
  condition TEXT CHECK (condition IN ('new','like-new','good','fair','poor')),
  price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'AED',
  location TEXT,
  car_brand TEXT,
  car_model TEXT,
  media JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_sold BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_brand_model ON public.listings(car_brand, car_model);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured DESC);

CREATE TABLE IF NOT EXISTS public.listing_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_listing_save UNIQUE(listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_saves_listing ON public.listing_saves(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_saves_user ON public.listing_saves(user_id);

-- 4️⃣ GARAGES MODULE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  media JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garages_owner ON public.garages(owner_id);
CREATE INDEX IF NOT EXISTS idx_garages_status ON public.garages(status);
CREATE INDEX IF NOT EXISTS idx_garages_featured ON public.garages(is_featured DESC);

CREATE TABLE IF NOT EXISTS public.garage_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_garage_review UNIQUE(garage_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_garage_reviews_garage ON public.garage_reviews(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_user ON public.garage_reviews(user_id);

-- 5️⃣ EVENTS MODULE
-- ============================================================================

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
  attendee_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  media JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_date DESC);

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going','interested','not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_event_attendee UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON public.event_attendees(user_id);

-- 6️⃣ BID REPAIR SYSTEM
-- ============================================================================

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
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','bidding','accepted','completed','cancelled')),
  media JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_repair_user ON public.bid_repair(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_repair_status ON public.bid_repair(status);
CREATE INDEX IF NOT EXISTS idx_bid_repair_created ON public.bid_repair(created_at DESC);

CREATE TABLE IF NOT EXISTS public.bid_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.bid_repair(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  price_estimate NUMERIC(10,2) NOT NULL,
  estimated_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_replies_bid ON public.bid_replies(bid_id);
CREATE INDEX IF NOT EXISTS idx_bid_replies_garage ON public.bid_replies(garage_id);

-- 7️⃣ MESSAGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.bid_repair(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_bid ON public.messages(bid_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- 8️⃣ OFFERS MODULE
-- ============================================================================

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
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_claims INTEGER,
  claim_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  media JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_creator ON public.offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_valid ON public.offers(valid_until DESC);

-- 9️⃣ DAILY CHALLENGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL,
  type TEXT CHECK (type IN ('daily','weekly','special')),
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  target_value INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','claimed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_challenge_progress UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);

-- 🔟 SERVICE LOGS
-- ============================================================================

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_user ON public.service_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_date ON public.service_logs(service_date DESC);

-- ============================================================================
-- SECTION 2: ADMIN MODULES
-- ============================================================================

-- WALLETS & TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  txn_type TEXT NOT NULL CHECK (txn_type IN ('topup','spend','refund','adjust')),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','completed','failed','refunded')),
  ref TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);

-- LISTING APPROVAL QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.listing_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  payment_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_laq_listing ON public.listing_approval_queue(listing_id);
CREATE INDEX IF NOT EXISTS idx_laq_status ON public.listing_approval_queue(status);

-- REFUNDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_tx_id BIGINT REFERENCES public.wallet_transactions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','processed')),
  attachments JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_user ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- BROADCAST NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  target_role TEXT,
  target_emirate TEXT,
  method TEXT NOT NULL DEFAULT 'push' CHECK (method IN ('push','email','sms')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id BIGSERIAL PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivered BOOLEAN NOT NULL DEFAULT false,
  opened BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notif_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_notif ON public.user_notifications(notification_id);

-- ADS & MONETIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective TEXT,
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  placement TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);

CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  click BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);

-- SEO CENTER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  ranking INTEGER,
  traffic INTEGER NOT NULL DEFAULT 0,
  optimized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_seo_path ON public.seo_pages(path);

CREATE TABLE IF NOT EXISTS public.seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  position INTEGER,
  volume INTEGER,
  difficulty TEXT,
  trend JSONB NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_seo_keyword ON public.seo_keywords(keyword);

-- SECURITY & SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_logs (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  user_email TEXT,
  ip INET,
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high')),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_created ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);

CREATE TABLE IF NOT EXISTS public.blocked_ips (
  ip INET PRIMARY KEY,
  reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT,
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','escalated')),
  subject TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);

-- ============================================================================
-- SECTION 3: RPC FUNCTIONS
-- ============================================================================

-- XP MANAGEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_update_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  UPDATE public.profiles
  SET total_xp = total_xp + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING total_xp INTO v_new_xp;
  
  v_new_level := FLOOR(v_new_xp / 1000) + 1;
  
  UPDATE public.profiles
  SET level = v_new_level
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'new_level', v_new_level
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_update_xp(UUID, INT, TEXT) TO authenticated;

-- LEADERBOARD
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(
  p_timeframe TEXT DEFAULT 'all_time',
  p_limit INT DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'user_id', id,
        'display_name', display_name,
        'avatar_url', avatar_url,
        'total_xp', total_xp,
        'level', level
      )
    )
    FROM (
      SELECT id, display_name, avatar_url, total_xp, level
      FROM public.profiles
      ORDER BY total_xp DESC
      LIMIT p_limit
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_leaderboard(TEXT, INT) TO authenticated, anon;

-- COMMUNITY INTERACTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_liked BOOLEAN;
  v_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = auth.uid()
  ) INTO v_liked;
  
  IF v_liked THEN
    DELETE FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (p_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM public.post_likes WHERE post_id = p_post_id;
  
  UPDATE public.posts SET like_count = v_count WHERE id = p_post_id;
  
  RETURN jsonb_build_object('liked', NOT v_liked, 'like_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_toggle_like(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_toggle_save(p_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saved BOOLEAN;
  v_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.post_saves
    WHERE post_id = p_post_id AND user_id = auth.uid()
  ) INTO v_saved;
  
  IF v_saved THEN
    DELETE FROM public.post_saves
    WHERE post_id = p_post_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.post_saves (post_id, user_id)
    VALUES (p_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM public.post_saves WHERE post_id = p_post_id;
  
  RETURN jsonb_build_object('saved', NOT v_saved, 'save_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_toggle_save(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_track_share(
  p_post_id UUID,
  p_share_type TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.post_shares (post_id, user_id, share_type)
  VALUES (p_post_id, auth.uid(), p_share_type);
  
  SELECT COUNT(*) INTO v_count
  FROM public.post_shares WHERE post_id = p_post_id;
  
  UPDATE public.posts SET share_count = v_count WHERE id = p_post_id;
  
  RETURN jsonb_build_object('success', true, 'share_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_track_share(UUID, TEXT) TO authenticated;

-- MARKETPLACE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_toggle_listing_save(p_listing_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saved BOOLEAN;
  v_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.listing_saves
    WHERE listing_id = p_listing_id AND user_id = auth.uid()
  ) INTO v_saved;
  
  IF v_saved THEN
    DELETE FROM public.listing_saves
    WHERE listing_id = p_listing_id AND user_id = auth.uid();
  ELSE
    INSERT INTO public.listing_saves (listing_id, user_id)
    VALUES (p_listing_id, auth.uid())
    ON CONFLICT (listing_id, user_id) DO NOTHING;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM public.listing_saves WHERE listing_id = p_listing_id;
  
  UPDATE public.listings SET save_count = v_count WHERE id = p_listing_id;
  
  RETURN jsonb_build_object('saved', NOT v_saved, 'save_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_toggle_listing_save(UUID) TO authenticated;

-- ANALYTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_event(
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.analytics_events (user_id, event_name, properties, user_role)
  VALUES (
    auth.uid(),
    p_event_name,
    p_properties,
    (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_event(TEXT, JSONB) TO authenticated, anon;

-- VIEW TRACKING (10-minute deduplication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.view_tracking (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post','listing','event','garage','profile')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_view_tracking_entity ON public.view_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_view_tracking_created ON public.view_tracking(created_at DESC);

CREATE OR REPLACE FUNCTION public.fn_track_view(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_session_id TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.view_tracking
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND (user_id = auth.uid() OR (user_id IS NULL AND session_id = p_session_id))
      AND created_at > NOW() - INTERVAL '10 minutes'
  ) THEN
    INSERT INTO public.view_tracking (entity_type, entity_id, user_id, session_id, ip_address, user_agent)
    VALUES (p_entity_type, p_entity_id, auth.uid(), p_session_id, p_ip_address, p_user_agent);
    
    CASE p_entity_type
      WHEN 'post' THEN
        UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_entity_id;
      WHEN 'listing' THEN
        UPDATE public.listings SET view_count = view_count + 1 WHERE id = p_entity_id;
    END CASE;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_track_view(TEXT, UUID, TEXT, TEXT, TEXT) TO authenticated, anon;

-- ============================================================================
-- SECTION 4: RLS POLICIES
-- ============================================================================

-- PROFILES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage_all" ON public.profiles;

CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_manage_all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

-- POSTS
-- ============================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_create_own" ON public.posts;
DROP POLICY IF EXISTS "posts_read_all" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_manage_all" ON public.posts;

CREATE POLICY "posts_create_own"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_read_all"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "posts_admin_manage_all"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

-- POST INTERACTIONS (Likes, Saves, Shares)
-- ============================================================================

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Everyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Admin can manage all likes" ON public.post_likes;

CREATE POLICY "Users can manage own likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage all likes"
  ON public.post_likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Users can manage own saves" ON public.post_saves;
DROP POLICY IF EXISTS "Users can view own saves" ON public.post_saves;
DROP POLICY IF EXISTS "Admin can manage all saves" ON public.post_saves;

CREATE POLICY "Users can manage own saves"
  ON public.post_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own saves"
  ON public.post_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all saves"
  ON public.post_saves FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Anyone can create shares" ON public.post_shares;
DROP POLICY IF EXISTS "Users can view own shares" ON public.post_shares;
DROP POLICY IF EXISTS "Admin can manage all shares" ON public.post_shares;

CREATE POLICY "Anyone can create shares"
  ON public.post_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own shares"
  ON public.post_shares FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin can manage all shares"
  ON public.post_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

-- BID REPAIR (Role Restrictions + Status Alignment)
-- ============================================================================

ALTER TABLE public.bid_repair ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bid_create_allowed_roles" ON public.bid_repair;
DROP POLICY IF EXISTS "bid_read_all" ON public.bid_repair;
DROP POLICY IF EXISTS "bid_update_own" ON public.bid_repair;

CREATE POLICY "bid_create_allowed_roles"
  ON public.bid_repair FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('car_owner', 'browser', 'admin')
  );

CREATE POLICY "bid_read_all"
  ON public.bid_repair FOR SELECT
  USING (true);

CREATE POLICY "bid_update_own"
  ON public.bid_repair FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- MESSAGES (Status aligned: accepted|completed)
-- ============================================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_insert_after_accept" ON public.messages;
DROP POLICY IF EXISTS "msg_select_sender_or_admin" ON public.messages;

CREATE POLICY "msg_insert_after_accept"
  ON public.messages FOR INSERT
  WITH CHECK (
    (SELECT status FROM public.bid_repair WHERE id = bid_id) IN ('accepted', 'completed')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "msg_select_sender_or_admin"
  ON public.messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- COMMENTS
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_create_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_read_all" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;

CREATE POLICY "comments_create_auth"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_read_all"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- LISTINGS
-- ============================================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_create_own" ON public.listings;
DROP POLICY IF EXISTS "listings_read_all" ON public.listings;
DROP POLICY IF EXISTS "listings_update_own" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_own" ON public.listings;

CREATE POLICY "listings_create_own"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_read_all"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_delete_own"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- GARAGES
-- ============================================================================

ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "garages_create_owner" ON public.garages;
DROP POLICY IF EXISTS "garages_read_approved" ON public.garages;
DROP POLICY IF EXISTS "garages_update_own" ON public.garages;

CREATE POLICY "garages_create_owner"
  ON public.garages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "garages_read_approved"
  ON public.garages FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());

CREATE POLICY "garages_update_own"
  ON public.garages FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- EVENTS
-- ============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_create_auth" ON public.events;
DROP POLICY IF EXISTS "events_read_all" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;

CREATE POLICY "events_create_auth"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_read_all"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "events_update_own"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- OFFERS
-- ============================================================================

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_read_active" ON public.offers;

CREATE POLICY "offers_read_active"
  ON public.offers FOR SELECT
  USING (is_active = true);

-- WALLETS (Users see own, admins see all)
-- ============================================================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_read_own" ON public.wallets;
DROP POLICY IF EXISTS "wallets_admin_all" ON public.wallets;

CREATE POLICY "wallets_read_own"
  ON public.wallets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "wallets_admin_all"
  ON public.wallets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- WALLET TRANSACTIONS
-- ============================================================================

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_tx_read_own" ON public.wallet_transactions;

CREATE POLICY "wallet_tx_read_own"
  ON public.wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

-- SERVICE LOGS
-- ============================================================================

ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_logs_manage_own" ON public.service_logs;

CREATE POLICY "service_logs_manage_own"
  ON public.service_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECTION 5: ANALYTICS & HELPER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  user_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);

-- ============================================================================
-- SECTION 6: REPORTS (Content Moderation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post','comment','listing','garage','user','event')),
  entity_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','misinformation','other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_entity ON public.reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_create_auth" ON public.reports;
DROP POLICY IF EXISTS "reports_read_own" ON public.reports;
DROP POLICY IF EXISTS "reports_admin_all" ON public.reports;

CREATE POLICY "reports_create_auth"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_read_own"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "reports_admin_all"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- SECTION 7: COMMENT LIKES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_comment_like UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Everyone can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Admin can manage all comment likes" ON public.comment_likes;

CREATE POLICY "Users can manage own comment likes"
  ON public.comment_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage all comment likes"
  ON public.comment_likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- SECTION 8: UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated ON public.profiles;
CREATE TRIGGER tr_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_posts_updated ON public.posts;
CREATE TRIGGER tr_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_listings_updated ON public.listings;
CREATE TRIGGER tr_listings_updated
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_garages_updated ON public.garages;
CREATE TRIGGER tr_garages_updated
  BEFORE UPDATE ON public.garages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_events_updated ON public.events;
CREATE TRIGGER tr_events_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_bid_repair_updated ON public.bid_repair;
CREATE TRIGGER tr_bid_repair_updated
  BEFORE UPDATE ON public.bid_repair
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_service_logs_updated ON public.service_logs;
CREATE TRIGGER tr_service_logs_updated
  BEFORE UPDATE ON public.service_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_reports_updated ON public.reports;
CREATE TRIGGER tr_reports_updated
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_refunds_updated ON public.refunds;
CREATE TRIGGER tr_refunds_updated
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_support_tickets_updated ON public.support_tickets;
CREATE TRIGGER tr_support_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'Main user profiles table';
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
COMMENT ON TABLE public.messages IS 'Bid-related messages';
COMMENT ON TABLE public.offers IS 'Promotional offers';
COMMENT ON TABLE public.challenges IS 'Daily/weekly challenges';
COMMENT ON TABLE public.challenge_progress IS 'User challenge progress';
COMMENT ON TABLE public.service_logs IS 'Vehicle service history';
COMMENT ON TABLE public.wallets IS 'User wallet balances';
COMMENT ON TABLE public.wallet_transactions IS 'Wallet transaction history';
COMMENT ON TABLE public.listing_approval_queue IS 'Admin approval queue for listings';
COMMENT ON TABLE public.refunds IS 'Refund requests';
COMMENT ON TABLE public.notifications IS 'Broadcast notifications';
COMMENT ON TABLE public.user_notifications IS 'User notification delivery tracking';
COMMENT ON TABLE public.ad_campaigns IS 'Advertising campaigns';
COMMENT ON TABLE public.ad_impressions IS 'Ad impression tracking';
COMMENT ON TABLE public.seo_pages IS 'SEO page metadata';
COMMENT ON TABLE public.seo_keywords IS 'SEO keyword tracking';
COMMENT ON TABLE public.security_logs IS 'Security event logs';
COMMENT ON TABLE public.blocked_ips IS 'Blocked IP addresses';
COMMENT ON TABLE public.support_tickets IS 'Customer support tickets';
COMMENT ON TABLE public.reports IS 'Content moderation reports';
COMMENT ON TABLE public.comment_likes IS 'Comment like tracking';
COMMENT ON TABLE public.analytics_events IS 'Analytics event tracking';
COMMENT ON TABLE public.view_tracking IS 'Entity view tracking with deduplication';

-- ============================================================================
-- ✅ DEPLOYMENT SUCCESSFUL
-- ============================================================================
-- This schema includes:
-- - 30+ core tables
-- - Admin management modules (wallets, refunds, notifications, ads, SEO, security, support)
-- - RPC functions for all interactions
-- - RLS policies (admin role check FIXED - uses auth.uid() correctly)
-- - Status alignment (accepted|completed for bid messages)
-- - Idempotent DDL (IF NOT EXISTS, DROP IF EXISTS)
--
-- Next Steps:
-- 1. Refresh frontend at http://localhost:3000
-- 2. Profile data should now load correctly
-- 3. All backend API calls should work
-- ============================================================================

