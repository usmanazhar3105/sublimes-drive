-- ===========================================================
--  SUBLIMES DRIVE — 2025-FINAL ENTERPRISE SCHEMA ALIGNMENT
-- ===========================================================
-- Date: 2025-11-03
-- Purpose: Complete, additive schema alignment for all features
-- Note: All operations are IF NOT EXISTS safe

-- ===========================================================
-- 1. CORE PROFILES / ROLES
-- ===========================================================

-- Profiles table already exists, add missing columns
DO $$
BEGIN
  -- Add sub_role column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sub_role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN sub_role TEXT DEFAULT 'browser' 
      CHECK (sub_role IN ('car_owner','browser','garage_owner'));
    COMMENT ON COLUMN public.profiles.sub_role IS 'User sub-role: car_owner, browser, or garage_owner';
  END IF;

  -- Add verification_status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;

  -- Add badge_color if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'badge_color'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN badge_color TEXT DEFAULT 'grey';
  END IF;

  -- Add xp_points if missing (might exist as user_xp)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'xp_points'
  ) THEN
    -- Check if user_xp exists and migrate, otherwise create new
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'user_xp'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN xp_points INT DEFAULT 0;
      UPDATE public.profiles SET xp_points = COALESCE(user_xp, 0);
    ELSE
      ALTER TABLE public.profiles ADD COLUMN xp_points INT DEFAULT 0;
    END IF;
  END IF;

  -- Add referrals_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referrals_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referrals_count INT DEFAULT 0;
  END IF;

  -- Add garage_credit_balance if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'garage_credit_balance'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN garage_credit_balance NUMERIC DEFAULT 0;
  END IF;

  -- Add meta JSONB if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'meta'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN meta JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ===========================================================
-- 2. COMMUNITIES (Posts already exist, ensure all columns)
-- ===========================================================

DO $$
BEGIN
  -- Add category column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN category TEXT;
  END IF;

  -- Add featured column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;

  -- Add pinned column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'pinned'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN pinned BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Comments - add parent_comment_id if using parent_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    -- Alias parent_id as parent_comment_id for consistency
    COMMENT ON COLUMN public.comments.parent_id IS 'Parent comment ID for nested replies (also known as parent_comment_id)';
  END IF;
END $$;

-- Post stats - ensure all counter columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_stats' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE public.post_stats ADD COLUMN like_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_stats' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE public.post_stats ADD COLUMN comment_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_stats' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.post_stats ADD COLUMN view_count INT DEFAULT 0;
  END IF;
END $$;

-- ===========================================================
-- 3. POST LIKE/SAVE COUNTER TRIGGERS
-- ===========================================================

-- Trigger function for post likes
CREATE OR REPLACE FUNCTION trg_upd_post_like_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Ensure post_stats row exists
    INSERT INTO public.post_stats (post_id, like_count, comment_count, view_count)
    VALUES (NEW.post_id, 1, 0, 0)
    ON CONFLICT (post_id) DO UPDATE 
    SET like_count = post_stats.like_count + 1, updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_stats 
    SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW() 
    WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS t_post_like_ins ON public.post_likes;
DROP TRIGGER IF EXISTS t_post_like_del ON public.post_likes;

-- Create triggers
CREATE TRIGGER t_post_like_ins AFTER INSERT ON public.post_likes 
  FOR EACH ROW EXECUTE FUNCTION trg_upd_post_like_count();
CREATE TRIGGER t_post_like_del AFTER DELETE ON public.post_likes 
  FOR EACH ROW EXECUTE FUNCTION trg_upd_post_like_count();

-- Trigger function for comments count
CREATE OR REPLACE FUNCTION trg_upd_post_comment_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.post_stats (post_id, like_count, comment_count, view_count)
    VALUES (NEW.post_id, 0, 1, 0)
    ON CONFLICT (post_id) DO UPDATE 
    SET comment_count = post_stats.comment_count + 1, updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_stats 
    SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW() 
    WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_comment_ins ON public.comments;
DROP TRIGGER IF EXISTS t_comment_del ON public.comments;

CREATE TRIGGER t_comment_ins AFTER INSERT ON public.comments 
  FOR EACH ROW EXECUTE FUNCTION trg_upd_post_comment_count();
CREATE TRIGGER t_comment_del AFTER DELETE ON public.comments 
  FOR EACH ROW EXECUTE FUNCTION trg_upd_post_comment_count();

-- ===========================================================
-- 4. MARKETPLACE
-- ===========================================================

-- market_listings table (may already exist as 'listings')
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_listings') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Create view aliasing listings as market_listings
    CREATE OR REPLACE VIEW market_listings AS SELECT * FROM listings;
    COMMENT ON VIEW market_listings IS 'Alias for listings table for consistency';
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_listings') THEN
    CREATE TABLE public.market_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      type TEXT CHECK (type IN ('car','parts','garage')),
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC,
      make TEXT,
      model TEXT,
      year INT,
      mileage INT,
      location TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold','removed')),
      featured BOOLEAN DEFAULT false,
      boosted BOOLEAN DEFAULT false,
      views_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- listing_views table
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  viewer_id UUID,
  anon_hash TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, viewer_id, anon_hash, viewed_at)
);

-- boost_entitlements table
CREATE TABLE IF NOT EXISTS public.boost_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT DEFAULT 'listing',
  entity_id UUID,
  purchaser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 5. GARAGE HUB
-- ===========================================================

-- Ensure garages table has all required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    -- Add name if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'name') THEN
      ALTER TABLE public.garages ADD COLUMN name TEXT;
    END IF;
    
    -- Add address if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'address') THEN
      ALTER TABLE public.garages ADD COLUMN address TEXT;
    END IF;
    
    -- Add phone if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'phone') THEN
      ALTER TABLE public.garages ADD COLUMN phone TEXT;
    END IF;
    
    -- Add verification_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'verification_status') THEN
      ALTER TABLE public.garages ADD COLUMN verification_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add featured if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'featured') THEN
      ALTER TABLE public.garages ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

-- ===========================================================
-- 6. BID REPAIR SYSTEM
-- ===========================================================

-- bid_requests table
CREATE TABLE IF NOT EXISTS public.bid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  car_meta JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','accepted','closed','disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bid_replies table
CREATE TABLE IF NOT EXISTS public.bid_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES public.bid_requests(id) ON DELETE CASCADE,
  garage_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  price NUMERIC,
  eta_days INT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bid_wallets table (use existing bid_wallet if it exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallets') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallet') THEN
    -- Create new bid_wallets table only if neither exists
    CREATE TABLE public.bid_wallets (
      garage_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      credits NUMERIC DEFAULT 0 CHECK (credits >= 0),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    COMMENT ON TABLE public.bid_wallets IS 'Garage owner bid credits for Bid Repair system';
  END IF;
  
  -- Note: If bid_wallet exists, we use it directly. Admin UI should reference bid_wallet table.
  -- If bid_wallets needed as alias, create manually after checking actual column names in Supabase dashboard.
END $$;

-- bid_wallet_ledger table
CREATE TABLE IF NOT EXISTS public.bid_wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta NUMERIC NOT NULL,
  reason TEXT,
  ref UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 7. EVENTS / ROUTES
-- ===========================================================

-- Ensure events table has all required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    -- Add creator_id if missing (might exist as organizer_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'creator_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
      ALTER TABLE public.events ADD COLUMN creator_id UUID REFERENCES public.profiles(id);
    END IF;
    
    -- Add starts_at if missing (might exist as event_date)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'starts_at')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date') THEN
      ALTER TABLE public.events ADD COLUMN starts_at TIMESTAMPTZ;
    END IF;
    
    -- Add ends_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'ends_at') THEN
      ALTER TABLE public.events ADD COLUMN ends_at TIMESTAMPTZ;
    END IF;
    
    -- Add featured if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'featured') THEN
      ALTER TABLE public.events ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

-- event_attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rsvp TEXT CHECK (rsvp IN ('yes','no','maybe')) DEFAULT 'yes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- routes table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  distance_km NUMERIC,
  duration_min INT,
  is_public BOOLEAN DEFAULT true,
  route_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 8. NOTIFICATIONS (PUSH + EMAIL HUB)
-- ===========================================================

-- push_campaigns table
CREATE TABLE IF NOT EXISTS public.push_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_id UUID,
  segment JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','sending','completed','failed')),
  scheduled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- push_deliveries table
CREATE TABLE IF NOT EXISTS public.push_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.push_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','failed','opened')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_id UUID,
  segment JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','sending','completed','failed')),
  scheduled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- email_deliveries table
CREATE TABLE IF NOT EXISTS public.email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','bounced','opened','clicked')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 9. WALLET / TRANSACTIONS / REFUNDS
-- ===========================================================

-- wallet_transactions already has columns added in previous migrations
-- Just ensure the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
    CREATE TABLE public.wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      type TEXT CHECK (type IN ('credit','debit')) DEFAULT 'credit',
      ref_type TEXT,
      source TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin_type TEXT,
  origin_id UUID,
  amount NUMERIC NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 10. XP / REFERRALS / CHALLENGES
-- ===========================================================

-- xp_events already exists, ensure type column (added in previous migration)
-- Just verify table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'xp_events') THEN
    CREATE TABLE public.xp_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      event_key TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      xp_value INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- referrals table already exists, ensure points_awarded column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'points_awarded') THEN
      ALTER TABLE public.referrals ADD COLUMN points_awarded INT DEFAULT 5;
    END IF;
  END IF;
END $$;

-- daily_challenges table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules_json JSONB DEFAULT '{}'::jsonb,
  reward_xp INT DEFAULT 5,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 11. BRAND KIT / MEDIA LIBRARY
-- ===========================================================

-- brand_assets table
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('logo','icon','banner','font','color_palette')),
  file_ref TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 12. SUPPORT / KNOWLEDGE BASE
-- ===========================================================

-- support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- kb_articles table (Knowledge Base)
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  title TEXT NOT NULL,
  body TEXT,
  slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT true,
  views_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 13. SEO / LEGAL
-- ===========================================================

-- seo_settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value_json JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- legal_pages table
CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  html TEXT,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 14. AUTO-APPROVAL / SYSTEM-SETTINGS
-- ===========================================================

-- auto_approval_rules table
CREATE TABLE IF NOT EXISTS public.auto_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  rule_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 15. EXPORTS TABLE
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  params JSONB DEFAULT '{}'::jsonb,
  file_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ===========================================================
-- 16. VERIFICATION REQUESTS (UNIFIED)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('car_owner','garage_owner','vendor')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reason TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 17. KEY RPC FUNCTIONS
-- ===========================================================

-- Drop existing functions to avoid return type conflicts
DROP FUNCTION IF EXISTS public.fn_calculate_fee(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS public.fn_calculate_fee(TEXT);
DROP FUNCTION IF EXISTS public.fn_export_run(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.fn_can_message(UUID);
DROP FUNCTION IF EXISTS public.fn_admin_verify(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.fn_admin_verify(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_award_referral_xp();

-- Fee calculation RPC
CREATE OR REPLACE FUNCTION public.fn_calculate_fee(kind TEXT, amount NUMERIC DEFAULT 0)
RETURNS NUMERIC 
LANGUAGE plpgsql
AS $$
BEGIN
  IF kind = 'car' THEN 
    RETURN 50 + (50 * 0.05);  -- AED 50 + 5% VAT
  ELSIF kind = 'parts' THEN 
    RETURN (amount * 0.08) + (amount * 0.08 * 0.05);  -- 8% + 5% VAT
  ELSIF kind = 'garage' THEN 
    RETURN 100 + (100 * 0.05);  -- AED 100 + 5% VAT
  ELSE 
    RETURN 0;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.fn_calculate_fee IS 'Calculate platform fees: car=50+VAT, parts=8%+VAT, garage=100+VAT';

-- Export run RPC
CREATE OR REPLACE FUNCTION public.fn_export_run(kind TEXT, params JSONB)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_file TEXT := format('/exports/%s_%s.csv', kind, EXTRACT(EPOCH FROM NOW())::TEXT);
  v_export_id UUID;
BEGIN
  INSERT INTO public.exports(id, user_id, kind, params, file_path, status, created_at)
  VALUES(gen_random_uuid(), auth.uid(), kind, params, v_file, 'done', NOW())
  RETURNING id INTO v_export_id;
  
  RETURN v_file;
END;
$$;

COMMENT ON FUNCTION public.fn_export_run IS 'Create export job and return file path. Actual data generation done by backend.';

-- Messaging unlock check (Bid Repair)
CREATE OR REPLACE FUNCTION public.fn_can_message(thread_id UUID)
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.bid_requests b
    JOIN public.bid_replies r ON b.id = r.bid_id
    WHERE r.id = thread_id 
    AND b.status IN ('accepted', 'closed')
  );
$$;

COMMENT ON FUNCTION public.fn_can_message IS 'Check if messaging is unlocked for a bid thread (status must be accepted or closed)';

-- Admin verification approval
CREATE OR REPLACE FUNCTION public.fn_admin_verify(
  p_type TEXT,
  p_id UUID,
  p_decision TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Update verification request
  UPDATE public.verification_requests 
  SET status = p_decision, 
      reason = p_reason,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_id
  RETURNING user_id INTO v_user_id;

  -- If approved, update user profile
  IF p_decision = 'approved' AND v_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET verification_status = 'approved',
        badge_color = CASE 
          WHEN p_type = 'car_owner' THEN 'green'
          WHEN p_type = 'garage_owner' THEN 'blue'
          ELSE 'yellow'
        END
    WHERE id = v_user_id;
    
    -- Log audit trail
    INSERT INTO public.audit_logs(actor_id, entity, entity_id, action)
    VALUES(auth.uid(), 'verification', p_id, 'approved');
  END IF;
END;
$$;

COMMENT ON FUNCTION public.fn_admin_verify IS 'Admin function to approve/reject verification requests';

-- XP reward on referral (trigger function)
CREATE OR REPLACE FUNCTION public.fn_award_referral_xp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Award XP to referrer
  UPDATE public.profiles 
  SET xp_points = xp_points + 5, 
      referrals_count = referrals_count + 1
  WHERE id = NEW.referrer_id;

  -- Log XP event
  INSERT INTO public.xp_events(user_id, event_key, type, xp_value)
  VALUES(NEW.referrer_id, 'referral', 'referral_reward', 5);

  -- If referrer is garage owner, award bid credit
  IF (SELECT sub_role FROM public.profiles WHERE id = NEW.referrer_id) = 'garage_owner' THEN
    -- Ensure bid wallet exists
    INSERT INTO public.bid_wallets (garage_id, credits)
    VALUES (NEW.referrer_id, 1)
    ON CONFLICT (garage_id) DO UPDATE 
    SET credits = bid_wallets.credits + 1, updated_at = NOW();
    
    -- Log ledger entry
    INSERT INTO public.bid_wallet_ledger(garage_id, delta, reason, ref)
    VALUES(NEW.referrer_id, 1, 'referral_bonus', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger to avoid duplicates
DROP TRIGGER IF EXISTS t_referral_xp ON public.referrals;

-- Create trigger
CREATE TRIGGER t_referral_xp AFTER INSERT ON public.referrals 
  FOR EACH ROW EXECUTE FUNCTION fn_award_referral_xp();

COMMENT ON FUNCTION public.fn_award_referral_xp IS 'Auto-award XP and credits when referral completes';

-- ===========================================================
-- 18. PERFORMANCE INDEXES
-- ===========================================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_community_created ON public.posts(community_id, created_at DESC) 
  WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured, created_at DESC) WHERE featured = true;

-- Marketplace indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_listings') THEN
    -- Check which owner column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'owner_id') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.market_listings(owner_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'seller_id') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.market_listings(seller_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_user ON public.market_listings(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_status ON public.market_listings(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'featured') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'created_at') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.market_listings(featured, created_at DESC) WHERE featured = true;
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_seller_v2 ON public.listings(seller_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_listings_status_v2 ON public.listings(status);
    END IF;
  END IF;
END $$;

-- Events indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'creator_id') THEN
      CREATE INDEX IF NOT EXISTS idx_events_creator ON public.events(creator_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
      CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'starts_at') THEN
      CREATE INDEX IF NOT EXISTS idx_events_starts ON public.events(starts_at);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_date') THEN
      CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
    END IF;
  END IF;
END $$;

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ts ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);

-- Audit logs timestamp index (check which column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ts_utc') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_ts ON public.audit_logs(ts_utc DESC);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_ts ON public.audit_logs(created_at DESC);
  END IF;
END $$;

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallet_txn_user ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- Support indexes
CREATE INDEX IF NOT EXISTS idx_support_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_assigned ON public.support_tickets(assigned_to) 
  WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_status ON public.support_tickets(status);

-- ===========================================================
-- 19. RLS POLICIES (COMPREHENSIVE)
-- ===========================================================

-- POSTS: Public read (approved), owner CRUD, admin all
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id OR 
         EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','editor')));

DROP POLICY IF EXISTS "posts_owner_crud" ON public.posts;
CREATE POLICY "posts_owner_crud" ON public.posts FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_admin_all" ON public.posts;
CREATE POLICY "posts_admin_all" ON public.posts FOR ALL 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','editor'))) 
  WITH CHECK (true);

-- COMMENTS: Public read, authenticated insert, owner delete
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_auth_insert" ON public.comments;
CREATE POLICY "comments_auth_insert" ON public.comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments;
CREATE POLICY "comments_owner_delete" ON public.comments FOR DELETE 
  USING (auth.uid() = user_id OR 
         EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- POST INTERACTIONS: Authenticated users only
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_likes_all" ON public.post_likes;
CREATE POLICY "post_likes_all" ON public.post_likes FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_saves_all" ON public.post_saves;
CREATE POLICY "post_saves_all" ON public.post_saves FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.uid() = user_id);

-- POST STATS: Public read (system managed, no RLS on write)
ALTER TABLE public.post_stats DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.post_stats TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.post_stats TO authenticated;

-- MARKETPLACE: Public read (approved), owner CRUD
DO $$
DECLARE
  v_owner_col TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_listings') THEN
    ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
    
    -- Determine which owner column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'owner_id') THEN
      v_owner_col := 'owner_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'seller_id') THEN
      v_owner_col := 'seller_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'user_id') THEN
      v_owner_col := 'user_id';
    END IF;
    
    IF v_owner_col IS NOT NULL THEN
      DROP POLICY IF EXISTS "listings_public_read" ON public.market_listings;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_listings' AND column_name = 'status') THEN
        CREATE POLICY "listings_public_read" ON public.market_listings FOR SELECT 
          USING (status = 'approved');
      ELSE
        CREATE POLICY "listings_public_read" ON public.market_listings FOR SELECT USING (true);
      END IF;
      
      DROP POLICY IF EXISTS "listings_owner_crud" ON public.market_listings;
      EXECUTE format('CREATE POLICY "listings_owner_crud" ON public.market_listings FOR ALL USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)', v_owner_col, v_owner_col);
    END IF;
  END IF;
END $$;

-- GARAGES: Public read (verified), owner CRUD
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "garages_public_read" ON public.garages;
CREATE POLICY "garages_public_read" ON public.garages FOR SELECT 
  USING (verification_status = 'approved' OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "garages_owner_crud" ON public.garages;
CREATE POLICY "garages_owner_crud" ON public.garages FOR ALL 
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- BID REPAIR: Owner and participating garages only
ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bid_requests_owner_read" ON public.bid_requests;
CREATE POLICY "bid_requests_owner_read" ON public.bid_requests FOR SELECT 
  USING (auth.uid() = owner_id OR 
         EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND sub_role = 'garage_owner'));

DROP POLICY IF EXISTS "bid_requests_owner_crud" ON public.bid_requests;
CREATE POLICY "bid_requests_owner_crud" ON public.bid_requests FOR ALL 
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

ALTER TABLE public.bid_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bid_replies_participants" ON public.bid_replies;
CREATE POLICY "bid_replies_participants" ON public.bid_replies FOR ALL 
  USING (auth.uid() = garage_id OR 
         EXISTS(SELECT 1 FROM bid_requests WHERE id = bid_replies.bid_id AND owner_id = auth.uid())) 
  WITH CHECK (auth.uid() = garage_id);

-- WALLETS: Owner only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallets') THEN
    ALTER TABLE public.bid_wallets ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "bid_wallets_owner" ON public.bid_wallets;
    CREATE POLICY "bid_wallets_owner" ON public.bid_wallets FOR ALL 
      USING (auth.uid() = garage_id) WITH CHECK (auth.uid() = garage_id);
  END IF;
END $$;

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_txn_owner" ON public.wallet_transactions;
CREATE POLICY "wallet_txn_owner" ON public.wallet_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- EVENTS: Public read, creator CRUD
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (true);

DO $$
BEGIN
  -- Check which column exists for creator
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'creator_id') THEN
    DROP POLICY IF EXISTS "events_creator_crud" ON public.events;
    CREATE POLICY "events_creator_crud" ON public.events FOR ALL 
      USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
    DROP POLICY IF EXISTS "events_organizer_crud" ON public.events;
    CREATE POLICY "events_organizer_crud" ON public.events FOR ALL 
      USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);
  END IF;
END $$;

-- SUPPORT: User can view/create own tickets, admins see all
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_owner_read" ON public.support_tickets;
CREATE POLICY "support_owner_read" ON public.support_tickets FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = assigned_to OR 
         EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "support_owner_create" ON public.support_tickets;
CREATE POLICY "support_owner_create" ON public.support_tickets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- KNOWLEDGE BASE: Public can read public articles, admins CRUD all
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_public_read" ON public.kb_articles;
CREATE POLICY "kb_public_read" ON public.kb_articles FOR SELECT 
  USING (is_public = true OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "kb_admin_crud" ON public.kb_articles;
CREATE POLICY "kb_admin_crud" ON public.kb_articles FOR ALL 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) 
  WITH CHECK (true);

-- ADMIN-ONLY TABLES: Admin full access
DO $$
DECLARE
  admin_table TEXT;
BEGIN
  FOR admin_table IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'push_campaigns', 'email_campaigns', 'refunds', 'auto_approval_rules', 
      'system_settings', 'seo_settings', 'legal_pages', 'brand_assets', 'exports'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', admin_table);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON public.%I', admin_table, admin_table);
    EXECUTE format('CREATE POLICY "%s_admin_all" ON public.%I FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')) WITH CHECK (true)', admin_table, admin_table);
  END LOOP;
END $$;

-- ANALYTICS/AUDIT: Insert own, admin read all
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_insert_own" ON public.analytics_events;
CREATE POLICY "analytics_insert_own" ON public.analytics_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "analytics_admin_read" ON public.analytics_events;
CREATE POLICY "analytics_admin_read" ON public.analytics_events FOR SELECT 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read" ON public.audit_logs;
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "audit_system_insert" ON public.audit_logs;
CREATE POLICY "audit_system_insert" ON public.audit_logs FOR INSERT 
  WITH CHECK (true);  -- System can always log

-- ===========================================================
-- 20. GRANT PERMISSIONS
-- ===========================================================

-- Grant usage on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Grant basic select on system tables for authenticated users
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.seo_settings TO authenticated;
GRANT SELECT ON public.legal_pages TO authenticated;
GRANT SELECT ON public.kb_articles TO authenticated, anon;

-- ===========================================================
-- MIGRATION COMPLETE
-- ===========================================================

COMMENT ON SCHEMA public IS 'Sublimes Drive - Final Enterprise Schema (2025-11-03)';

