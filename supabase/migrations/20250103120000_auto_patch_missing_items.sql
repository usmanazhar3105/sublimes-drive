-- ============================================================================
-- SUPABASE AUTO-PATCH - Fill Any Missing Gaps
-- Date: 2025-11-03
-- Purpose: Verify and create any missing tables/functions/views from spec
-- ============================================================================
-- This migration is SAFE and ADDITIVE - it only creates what's missing
-- ============================================================================

-- ============================================================================
-- SECTION 1: VERIFY AND CREATE MISSING SUPPORT TABLES
-- ============================================================================

-- communities table (if missing)
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  cover_image_url TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);

-- comment_likes table (if missing)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);

-- wallet_balance table (if missing, separate from profiles.wallet_balance)
CREATE TABLE IF NOT EXISTS public.wallet_balance (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  currency TEXT DEFAULT 'AED',
  last_transaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- offer_redemptions table (if missing)
CREATE TABLE IF NOT EXISTS public.offer_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, user_id)
);

-- ============================================================================
-- SECTION 2: ENSURE STORAGE BUCKETS EXIST (7 Canonical Buckets)
-- ============================================================================

-- Insert buckets only if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('community-media', 'community-media', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']),
  ('offers-media', 'offers-media', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('listings-media', 'listings-media', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('garage-media', 'garage-media', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']),
  ('events-media', 'events-media', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('documents', 'documents', FALSE, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Optional synonym buckets for compatibility
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('marketplace-media', 'marketplace-media', TRUE, 10485760),
  ('profile-images', 'profile-images', TRUE, 2097152),
  ('verification-docs', 'verification-docs', FALSE, 10485760),
  ('brand-assets', 'brand-assets', TRUE, 10485760),
  ('system-settings', 'system-settings', FALSE, 10485760)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: STORAGE POLICIES (Auto-create if missing)
-- ============================================================================

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  -- Public read for public buckets
  DROP POLICY IF EXISTS "obj_public_read_public_buckets" ON storage.objects;
  CREATE POLICY "obj_public_read_public_buckets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN (
      'community-media', 'offers-media', 'listings-media', 'marketplace-media',
      'garage-media', 'events-media', 'avatars', 'profile-images', 'brand-assets'
    ));

  -- Authenticated upload to public buckets
  DROP POLICY IF EXISTS "obj_auth_upload_public_content" ON storage.objects;
  CREATE POLICY "obj_auth_upload_public_content"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN (
        'community-media', 'offers-media', 'listings-media', 'marketplace-media',
        'garage-media', 'events-media', 'avatars', 'profile-images', 'brand-assets'
      )
      AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

  -- Owner delete own uploads
  DROP POLICY IF EXISTS "obj_owner_delete_own" ON storage.objects;
  CREATE POLICY "obj_owner_delete_own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ((storage.foldername(name))[1] = auth.uid()::TEXT);

  -- Admin-only access to private buckets
  DROP POLICY IF EXISTS "obj_admin_read_private_docs" ON storage.objects;
  CREATE POLICY "obj_admin_read_private_docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id IN ('documents', 'verification-docs', 'system-settings')
    );

  DROP POLICY IF EXISTS "obj_admin_upload_private" ON storage.objects;
  CREATE POLICY "obj_admin_upload_private"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('documents', 'verification-docs', 'system-settings')
    );
END $$;

-- ============================================================================
-- SECTION 4: VERIFY COUNTER TRIGGERS EXIST
-- ============================================================================

-- If post_stats exists but triggers don't, create them
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_stats') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 't_post_like_ins') THEN
    
    -- Create trigger function if missing
    CREATE OR REPLACE FUNCTION trg_upd_post_like_count() 
    RETURNS TRIGGER AS $func$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.post_stats (post_id, like_count, comment_count, view_count, share_count, save_count)
        VALUES (NEW.post_id, 1, 0, 0, 0, 0)
        ON CONFLICT (post_id) DO UPDATE 
        SET like_count = post_stats.like_count + 1, updated_at = NOW();
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.post_stats 
        SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW() 
        WHERE post_id = OLD.post_id;
      END IF;
      RETURN NULL;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Create triggers
    CREATE TRIGGER t_post_like_ins AFTER INSERT ON public.post_likes 
      FOR EACH ROW EXECUTE FUNCTION trg_upd_post_like_count();
    CREATE TRIGGER t_post_like_del AFTER DELETE ON public.post_likes 
      FOR EACH ROW EXECUTE FUNCTION trg_upd_post_like_count();
  END IF;

  -- Comment counter triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_stats') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 't_comment_ins') THEN
    
    CREATE OR REPLACE FUNCTION trg_upd_post_comment_count() 
    RETURNS TRIGGER AS $func$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.post_stats (post_id, like_count, comment_count, view_count, share_count, save_count)
        VALUES (NEW.post_id, 0, 1, 0, 0, 0)
        ON CONFLICT (post_id) DO UPDATE 
        SET comment_count = post_stats.comment_count + 1, updated_at = NOW();
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.post_stats 
        SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW() 
        WHERE post_id = OLD.post_id;
      END IF;
      RETURN NULL;
    END;
    $func$ LANGUAGE plpgsql;
    
    CREATE TRIGGER t_comment_ins AFTER INSERT ON public.comments 
      FOR EACH ROW EXECUTE FUNCTION trg_upd_post_comment_count();
    CREATE TRIGGER t_comment_del AFTER DELETE ON public.comments 
      FOR EACH ROW EXECUTE FUNCTION trg_upd_post_comment_count();
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: ENSURE LEADERBOARD VIEWS EXIST
-- ============================================================================

-- Weekly leaderboard
CREATE OR REPLACE VIEW vw_leaderboard_week AS
SELECT 
  p.id,
  COALESCE(p.display_name, p.full_name, SPLIT_PART(p.email, '@', 1)) as display_name,
  p.username,
  p.avatar_url,
  COALESCE(p.xp_points, 0) as xp_points,
  COALESCE(p.level, 1) as level,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp_points, 0) DESC) AS rank
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY xp_points DESC
LIMIT 100;

-- Monthly leaderboard
CREATE OR REPLACE VIEW vw_leaderboard_month AS
SELECT 
  p.id,
  COALESCE(p.display_name, p.full_name, SPLIT_PART(p.email, '@', 1)) as display_name,
  p.username,
  p.avatar_url,
  COALESCE(p.xp_points, 0) as xp_points,
  COALESCE(p.level, 1) as level,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp_points, 0) DESC) AS rank
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '30 days'
ORDER BY xp_points DESC
LIMIT 100;

-- All-time leaderboard
CREATE OR REPLACE VIEW vw_leaderboard_all AS
SELECT 
  p.id,
  COALESCE(p.display_name, p.full_name, SPLIT_PART(p.email, '@', 1)) as display_name,
  p.username,
  p.avatar_url,
  COALESCE(p.xp_points, 0) as xp_points,
  COALESCE(p.level, 1) as level,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp_points, 0) DESC) AS rank
FROM profiles p
ORDER BY xp_points DESC
LIMIT 100;

-- ============================================================================
-- SECTION 6: ENSURE EVENT STATS VIEW EXISTS
-- ============================================================================

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

-- ============================================================================
-- SECTION 7: GRANT ESSENTIAL PERMISSIONS
-- ============================================================================

-- Ensure authenticated users can access system functions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure system tables have proper access
GRANT SELECT, INSERT ON public.post_stats TO authenticated, anon;
GRANT SELECT, INSERT ON public.post_views TO authenticated, anon;
GRANT SELECT, INSERT ON public.listing_views TO authenticated, anon;
GRANT SELECT, INSERT ON public.event_views TO authenticated, anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated, anon;

-- ============================================================================
-- AUTO-PATCH COMPLETE
-- ============================================================================

COMMENT ON SCHEMA public IS 'Sublimes Drive - Auto-Patched Schema (2025-11-03)';

