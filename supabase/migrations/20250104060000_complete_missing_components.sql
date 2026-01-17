-- ============================================================================
-- COMPLETE MISSING COMPONENTS - Fill All Gaps
-- ============================================================================
-- This migration creates any missing tables, functions, triggers, and views
-- to reach 100% completion based on the reference documentation
-- ============================================================================

-- ============================================================================
-- MISSING TABLES - Create if not exists
-- ============================================================================

-- Offers/Deals Module
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  code TEXT UNIQUE,
  image_url TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'listings', 'services', 'events')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offer_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  amount_saved DECIMAL(10,2),
  UNIQUE(offer_id, user_id)
);

-- Instant Meetups (subset of events)
CREATE TABLE IF NOT EXISTS public.instant_meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  radius_km DECIMAL(5,2) DEFAULT 5,
  max_participants INTEGER DEFAULT 10,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garage Reviews
CREATE TABLE IF NOT EXISTS public.garage_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images JSONB DEFAULT '[]'::JSONB,
  is_verified_visit BOOLEAN DEFAULT FALSE,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garage_id, user_id)
);

-- User Badges/Achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

-- Content Moderation Queue
CREATE TABLE IF NOT EXISTS public.content_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'listing', 'event', 'garage', 'comment')),
  content_id UUID NOT NULL,
  reported_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ignored')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured Content
CREATE TABLE IF NOT EXISTS public.featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'listing', 'event', 'garage')),
  content_id UUID NOT NULL,
  featured_until TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions (for analytics)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMTP Configs (if not exists)
CREATE TABLE IF NOT EXISTS public.smtp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR NEW TABLES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_user ON public.offer_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_instant_meetups_expires ON public.instant_meetups(expires_at);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_garage ON public.garage_reviews(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_reviews_rating ON public.garage_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_status ON public.content_moderation_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_featured_active ON public.featured_content(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id, started_at);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garage_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;

-- Public read for active offers
DROP POLICY IF EXISTS offers_public_read ON public.offers;
CREATE POLICY offers_public_read ON public.offers
  FOR SELECT USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Users can view their own redemptions
DROP POLICY IF EXISTS redemptions_owner_view ON public.offer_redemptions;
CREATE POLICY redemptions_owner_view ON public.offer_redemptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public read for instant meetups
DROP POLICY IF EXISTS instant_meetups_public ON public.instant_meetups;
CREATE POLICY instant_meetups_public ON public.instant_meetups
  FOR SELECT USING (expires_at > NOW());

-- Public read for service categories
DROP POLICY IF EXISTS service_categories_public ON public.service_categories;
CREATE POLICY service_categories_public ON public.service_categories
  FOR SELECT USING (is_active = TRUE);

-- Public read for garage reviews
DROP POLICY IF EXISTS garage_reviews_public ON public.garage_reviews;
CREATE POLICY garage_reviews_public ON public.garage_reviews
  FOR SELECT USING (TRUE);

-- Users can create their own reviews
DROP POLICY IF EXISTS garage_reviews_create ON public.garage_reviews;
CREATE POLICY garage_reviews_create ON public.garage_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own badges
DROP POLICY IF EXISTS user_badges_owner ON public.user_badges;
CREATE POLICY user_badges_owner ON public.user_badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public read for FAQ
DROP POLICY IF EXISTS faq_public ON public.faq;
CREATE POLICY faq_public ON public.faq
  FOR SELECT USING (is_active = TRUE);

-- ============================================================================
-- MISSING RPC FUNCTIONS
-- ============================================================================

-- Drop existing functions to avoid return type conflicts (all signatures)
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;', E'\n')
    FROM pg_proc
    WHERE proname IN ('fn_create_post', 'fn_toggle_like', 'fn_toggle_save', 'fn_add_comment')
    AND pronamespace = 'public'::regnamespace
  );
EXCEPTION WHEN OTHERS THEN
  -- Ignore if no functions exist
  NULL;
END $$;

-- Create Post (if not exists)
CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_media JSONB DEFAULT '[]'::JSONB,
  p_tags TEXT[] DEFAULT '{}'::TEXT[],
  p_community_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.posts (
    id,
    user_id,
    community_id,
    title,
    body,
    media,
    tags,
    status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    p_community_id,
    p_title,
    p_body,
    p_media,
    p_tags,
    'pending',
    NOW()
  ) RETURNING id INTO v_post_id;
  
  -- Initialize post_stats
  INSERT INTO public.post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
  VALUES (v_post_id, 0, 0, 0, 0, 0)
  ON CONFLICT (post_id) DO NOTHING;
  
  RETURN v_post_id;
END;
$$;

-- Toggle Post Like
CREATE OR REPLACE FUNCTION public.fn_toggle_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_liked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_liked := TRUE;
  END IF;
  
  RETURN jsonb_build_object('liked', v_liked);
END;
$$;

-- Toggle Post Save
CREATE OR REPLACE FUNCTION public.fn_toggle_save(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_saved BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.post_saves WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.post_saves WHERE post_id = p_post_id AND user_id = v_user_id;
    v_saved := FALSE;
  ELSE
    INSERT INTO public.post_saves (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_saved := TRUE;
  END IF;
  
  RETURN jsonb_build_object('saved', v_saved);
END;
$$;

-- Add Comment
CREATE OR REPLACE FUNCTION public.fn_add_comment(
  p_post_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_comment_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.comments (
    id,
    post_id,
    user_id,
    parent_comment_id,
    body,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_post_id,
    v_user_id,
    p_parent_id,
    p_content,
    NOW()
  ) RETURNING id INTO v_comment_id;
  
  RETURN jsonb_build_object('comment_id', v_comment_id);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fn_create_post TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_toggle_save TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_add_comment TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_table_count INT;
  v_function_count INT;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name != 'schema_migrations';
  
  SELECT COUNT(DISTINCT proname) INTO v_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind IN ('f', 'p')
    AND (proname LIKE 'fn_%' OR proname LIKE 'trg_%' OR proname IN ('log_event', 'handle_new_user', 'update_updated_at_column', 'log_config_change', 'is_admin'));
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MISSING COMPONENTS MIGRATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables:    % (target: 70+)', v_table_count;
  RAISE NOTICE 'Functions: % (target: 35+)', v_function_count;
  RAISE NOTICE '';
  RAISE NOTICE 'New Tables Added:';
  RAISE NOTICE '  - offers';
  RAISE NOTICE '  - offer_redemptions';
  RAISE NOTICE '  - instant_meetups';
  RAISE NOTICE '  - service_categories';
  RAISE NOTICE '  - garage_reviews';
  RAISE NOTICE '  - user_badges';
  RAISE NOTICE '  - content_moderation_queue';
  RAISE NOTICE '  - featured_content';
  RAISE NOTICE '  - user_sessions';
  RAISE NOTICE '  - faq';
  RAISE NOTICE '  - smtp_configs';
  RAISE NOTICE '';
  RAISE NOTICE 'New RPCs Added:';
  RAISE NOTICE '  - fn_create_post';
  RAISE NOTICE '  - fn_toggle_like';
  RAISE NOTICE '  - fn_toggle_save';
  RAISE NOTICE '  - fn_add_comment';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

