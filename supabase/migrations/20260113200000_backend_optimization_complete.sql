-- ============================================================================
-- COMPREHENSIVE BACKEND OPTIMIZATION
-- Date: 2026-01-13
-- 
-- IMPORTANT: This migration is designed to work within Supabase's transaction model
-- - No CONCURRENTLY keyword (not allowed in transaction blocks)
-- - All operations are idempotent with IF NOT EXISTS / IF EXISTS checks
-- - Compatible with existing schema from previous migrations
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS TO EXISTING TABLES (Safe additions)
-- ============================================================================

DO $$ 
BEGIN
  -- Posts table: ensure all optimization columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='community_id') THEN
    ALTER TABLE public.posts ADD COLUMN community_id UUID;
  END IF;
  
  -- Add author_id as alias for user_id if needed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='author_id') THEN
    ALTER TABLE public.posts ADD COLUMN author_id UUID;
  END IF;
  
  -- Add post_type column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='post_type') THEN
    ALTER TABLE public.posts ADD COLUMN post_type TEXT DEFAULT 'regular';
  END IF;
  
  -- Marketplace listings: ensure user_id alias exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_listings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='view_count') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='category') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='location') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='images') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
  END IF;
  
  -- Garages: ensure needed columns exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='garages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='services') THEN
      ALTER TABLE public.garages ADD COLUMN services TEXT[] DEFAULT '{}';
    END IF;
  END IF;
  
  -- Profiles: ensure needed columns for optimization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='xp_points') THEN
    ALTER TABLE public.profiles ADD COLUMN xp_points INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='verification_status') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Column additions partially failed: %', SQLERRM;
END $$;

-- Comments: ensure is_hidden column exists (separate block to ensure it's added)
DO $$ 
BEGIN
  -- Only add if table exists and column doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='comments')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='is_hidden') THEN
    ALTER TABLE public.comments ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If column already exists or table doesn't exist, that's okay
  NULL;
END $$;

-- Sync user_id with seller_id for marketplace_listings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='seller_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='user_id') THEN
    UPDATE public.marketplace_listings SET user_id = seller_id WHERE user_id IS NULL AND seller_id IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sync user_id failed: %', SQLERRM;
END $$;

-- Sync author_id with user_id for posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='author_id') THEN
    UPDATE public.posts SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sync author_id failed: %', SQLERRM;
END $$;

-- ============================================================================
-- PART 2: OPTIMIZED INDEXES (No CONCURRENTLY - runs in transaction)
-- ============================================================================

-- Posts feed indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_posts_feed_cursor 
  ON public.posts (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_posts_status_created 
  ON public.posts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_user_created 
  ON public.posts (user_id, created_at DESC);

-- Community-specific feed index (if community_id exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='community_id') THEN
    CREATE INDEX IF NOT EXISTS idx_posts_community_created ON public.posts (community_id, created_at DESC);
  END IF;
END $$;

-- Comments pagination index
CREATE INDEX IF NOT EXISTS idx_comments_post_created 
  ON public.comments (post_id, created_at ASC, id ASC);

-- Comments hidden index (only if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='is_hidden') THEN
    CREATE INDEX IF NOT EXISTS idx_comments_hidden ON public.comments (is_hidden, created_at DESC);
  END IF;
END $$;

-- Marketplace indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_listings') THEN
    CREATE INDEX IF NOT EXISTS idx_ml_status_created ON public.marketplace_listings (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ml_feed_cursor ON public.marketplace_listings (created_at DESC, id DESC);
    
    -- Category and price index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='category') THEN
      CREATE INDEX IF NOT EXISTS idx_ml_category ON public.marketplace_listings (category);
    END IF;
    
    -- Location index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='location_city') THEN
      CREATE INDEX IF NOT EXISTS idx_ml_location ON public.marketplace_listings (location_city, status);
    END IF;
  END IF;
END $$;

-- Garage indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='garages') THEN
    CREATE INDEX IF NOT EXISTS idx_garages_status_rating ON public.garages (status, rating DESC);
    CREATE INDEX IF NOT EXISTS idx_garages_location ON public.garages (location);
    CREATE INDEX IF NOT EXISTS idx_garages_featured ON public.garages (is_featured DESC, created_at DESC);
  END IF;
END $$;

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_verification 
  ON public.profiles (role, verification_status);

CREATE INDEX IF NOT EXISTS idx_profiles_xp 
  ON public.profiles (xp_points DESC);

-- Notifications index (if table exists and has required columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    -- Only create index if both user_id and is_read columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='is_read') THEN
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);
    -- If only user_id exists, create a simpler index
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 3: AUDIT LOGGING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (true); -- Allow authenticated users to read (admin check in application layer per project rules)

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

-- ============================================================================
-- PART 4: IMAGE PROCESSING QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.image_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'community-media',
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_type TEXT NOT NULL DEFAULT 'optimize' CHECK (processing_type IN ('thumbnail', 'optimize', 'resize')),
  original_size BIGINT,
  processed_size BIGINT,
  thumbnail_path TEXT,
  optimized_path TEXT,
  error_message TEXT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_image_queue_status ON public.image_processing_queue(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_image_queue_user ON public.image_processing_queue(user_id, created_at DESC);

ALTER TABLE public.image_processing_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "image_queue_user_access" ON public.image_processing_queue;
CREATE POLICY "image_queue_user_access" ON public.image_processing_queue
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.image_processing_queue TO authenticated;

-- ============================================================================
-- PART 5: RATE LIMITING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT DEFAULT 1,
  CONSTRAINT ux_rate_limit UNIQUE(identifier, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
  ON public.rate_limits(identifier, action, window_start DESC);

-- Auto-cleanup old rate limit entries
CREATE OR REPLACE FUNCTION fn_cleanup_rate_limits()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================================
-- PART 6: CURSOR-BASED PAGINATION FUNCTIONS
-- ============================================================================

-- Get Posts Feed with Cursor Pagination
CREATE OR REPLACE FUNCTION fn_get_posts_feed(
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_community_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  images TEXT[],
  media JSONB,
  tags TEXT[],
  post_type TEXT,
  status TEXT,
  view_count INT,
  like_count INT,
  comment_count INT,
  share_count INT,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  author_avatar TEXT,
  author_role TEXT,
  has_more BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH feed AS (
    SELECT 
      p.id,
      p.user_id,
      p.title,
      COALESCE(p.content, p.body) AS content,
      COALESCE(p.images, '{}') AS images,
      COALESCE(p.media, '[]'::jsonb) AS media,
      COALESCE(p.tags, '{}') AS tags,
      -- post_type column should exist (added in Part 1), default to 'regular' if NULL
      COALESCE(p.post_type, 'regular') AS post_type,
      COALESCE(p.status, 'active') AS status,
      COALESCE(p.view_count, 0) AS view_count,
      COALESCE(p.like_count, 0) AS like_count,
      COALESCE(p.comment_count, 0) AS comment_count,
      COALESCE(p.share_count, 0) AS share_count,
      p.created_at,
      pr.display_name AS author_name,
      pr.avatar_url AS author_avatar,
      pr.role AS author_role
    FROM posts p
    LEFT JOIN profiles pr ON pr.id = p.user_id
    WHERE (p.status = 'active' OR p.status IS NULL)
      AND (p_community_id IS NULL OR p.community_id = p_community_id)
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (
        p_cursor IS NULL 
        OR (p.created_at, p.id) < (p_cursor, COALESCE(p_cursor_id, '00000000-0000-0000-0000-000000000000'::uuid))
      )
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT p_limit + 1
  )
  SELECT 
    feed.id,
    feed.user_id,
    feed.title,
    feed.content,
    feed.images,
    feed.media,
    feed.tags,
    feed.post_type,
    feed.status,
    feed.view_count,
    feed.like_count,
    feed.comment_count,
    feed.share_count,
    feed.created_at,
    feed.author_name,
    feed.author_avatar,
    feed.author_role,
    (SELECT COUNT(*) FROM feed) > p_limit AS has_more
  FROM feed
  LIMIT p_limit;
END;
$$;

-- Get Comments with Cursor Pagination
CREATE OR REPLACE FUNCTION fn_get_comments_paginated(
  p_post_id UUID,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  post_id UUID,
  user_id UUID,
  content TEXT,
  parent_id UUID,
  like_count INT,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  author_avatar TEXT,
  has_more BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH comment_feed AS (
    SELECT 
      c.id,
      c.post_id,
      c.user_id,
      COALESCE(c.content, c.body) AS content,
      c.parent_id,
      COALESCE(c.like_count, 0) AS like_count,
      c.created_at,
      pr.display_name AS author_name,
      pr.avatar_url AS author_avatar
    FROM comments c
    LEFT JOIN profiles pr ON pr.id = c.user_id
    WHERE c.post_id = p_post_id
      -- Filter hidden comments only if column exists (it should exist after Part 1)
      -- Using COALESCE to default to FALSE if NULL
      AND COALESCE(c.is_hidden, FALSE) = FALSE
      AND (
        p_cursor IS NULL 
        OR (c.created_at, c.id) > (p_cursor, COALESCE(p_cursor_id, '00000000-0000-0000-0000-000000000000'::uuid))
      )
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT p_limit + 1
  )
  SELECT 
    cf.id,
    cf.post_id,
    cf.user_id,
    cf.content,
    cf.parent_id,
    cf.like_count,
    cf.created_at,
    cf.author_name,
    cf.author_avatar,
    (SELECT COUNT(*) FROM comment_feed) > p_limit AS has_more
  FROM comment_feed cf
  LIMIT p_limit;
END;
$$;

-- Get Marketplace Listings with Filters
CREATE OR REPLACE FUNCTION fn_get_marketplace_listings(
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_category TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  category TEXT,
  images JSONB,
  location TEXT,
  status TEXT,
  view_count INT,
  created_at TIMESTAMPTZ,
  seller_name TEXT,
  seller_avatar TEXT,
  has_more BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run if marketplace_listings table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='marketplace_listings') THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH listings AS (
    SELECT 
      ml.id,
      COALESCE(ml.user_id, ml.seller_id) AS user_id,
      ml.title,
      ml.description,
      ml.price,
      COALESCE(ml.category, 'general') AS category,
      COALESCE(ml.images, '[]'::jsonb) AS images,
      COALESCE(ml.location, ml.location_city, '') AS location,
      ml.status,
      COALESCE(ml.view_count, 0) AS view_count,
      ml.created_at,
      pr.display_name AS seller_name,
      pr.avatar_url AS seller_avatar
    FROM marketplace_listings ml
    LEFT JOIN profiles pr ON pr.id = COALESCE(ml.user_id, ml.seller_id)
    WHERE ml.status = 'approved'
      AND (p_category IS NULL OR ml.category = p_category)
      AND (p_min_price IS NULL OR ml.price >= p_min_price)
      AND (p_max_price IS NULL OR ml.price <= p_max_price)
      AND (p_location IS NULL OR ml.location ILIKE '%' || p_location || '%' OR ml.location_city ILIKE '%' || p_location || '%')
      AND (p_search IS NULL OR ml.title ILIKE '%' || p_search || '%' OR ml.description ILIKE '%' || p_search || '%')
      AND (
        p_cursor IS NULL 
        OR (ml.created_at, ml.id) < (p_cursor, COALESCE(p_cursor_id, '00000000-0000-0000-0000-000000000000'::uuid))
      )
    ORDER BY ml.created_at DESC, ml.id DESC
    LIMIT p_limit + 1
  )
  SELECT 
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.images,
    l.location,
    l.status,
    l.view_count,
    l.created_at,
    l.seller_name,
    l.seller_avatar,
    (SELECT COUNT(*) FROM listings) > p_limit AS has_more
  FROM listings l
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- PART 7: ADMIN DASHBOARD STATS (uses regular views, not materialized)
-- ============================================================================

-- Platform Stats View (refreshed on each query - consider caching in app layer)
DROP VIEW IF EXISTS v_platform_stats;
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_30d,
  (SELECT COUNT(*) FROM profiles) AS total_users,
  (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '7 days') AS posts_7d,
  (SELECT COUNT(*) FROM posts) AS total_posts,
  (SELECT COUNT(*) FROM marketplace_listings WHERE status = 'approved') AS active_listings,
  (SELECT COUNT(*) FROM garages WHERE status = 'approved') AS active_garages,
  (SELECT COALESCE(SUM(view_count), 0) FROM posts) AS total_views,
  (SELECT COUNT(*) FROM post_likes) AS total_likes,
  (SELECT COUNT(*) FROM comments) AS total_comments,
  NOW() AS refreshed_at;

-- Top Contributors View
DROP VIEW IF EXISTS v_top_contributors;
CREATE OR REPLACE VIEW v_top_contributors AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.avatar_url,
  p.role,
  COALESCE(p.xp_points, 0) AS xp_points,
  (SELECT COUNT(*) FROM posts WHERE user_id = p.id AND created_at > NOW() - INTERVAL '30 days') AS posts_count,
  (SELECT COUNT(*) FROM post_likes pl JOIN posts ps ON ps.id = pl.post_id WHERE ps.user_id = p.id) AS likes_received,
  (SELECT COUNT(*) FROM comments WHERE user_id = p.id AND created_at > NOW() - INTERVAL '30 days') AS comments_count
FROM profiles p
ORDER BY COALESCE(p.xp_points, 0) DESC
LIMIT 100;

GRANT SELECT ON v_platform_stats TO authenticated, anon;
GRANT SELECT ON v_top_contributors TO authenticated, anon;

-- Get Admin Dashboard Stats RPC
CREATE OR REPLACE FUNCTION fn_get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overview', jsonb_build_object(
      'total_users', (SELECT COUNT(*) FROM profiles),
      'new_users_30d', (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days'),
      'total_posts', (SELECT COUNT(*) FROM posts),
      'posts_7d', (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '7 days'),
      'active_listings', (SELECT COUNT(*) FROM marketplace_listings WHERE status = 'approved'),
      'active_garages', (SELECT COUNT(*) FROM garages WHERE status = 'approved'),
      'total_views', (SELECT COALESCE(SUM(view_count), 0) FROM posts),
      'total_likes', (SELECT COUNT(*) FROM post_likes),
      'total_comments', (SELECT COUNT(*) FROM comments)
    ),
    'pending_actions', jsonb_build_object(
      'pending_verifications', COALESCE((SELECT COUNT(*) FROM verification_requests WHERE status = 'pending'), 0),
      'pending_reports', COALESCE((SELECT COUNT(*) FROM post_reports WHERE status = 'pending'), 0),
      'pending_listings', (SELECT COUNT(*) FROM marketplace_listings WHERE status = 'pending')
    ),
    'cached_at', NOW()
  ) INTO v_stats;
  
  RETURN v_stats;
EXCEPTION WHEN OTHERS THEN
  -- Return partial stats if some tables don't exist
  RETURN jsonb_build_object(
    'overview', jsonb_build_object(
      'total_users', (SELECT COUNT(*) FROM profiles),
      'total_posts', (SELECT COUNT(*) FROM posts)
    ),
    'error', SQLERRM,
    'cached_at', NOW()
  );
END;
$$;

-- ============================================================================
-- PART 8: UTILITY FUNCTIONS
-- ============================================================================

-- Log Admin Action
CREATE OR REPLACE FUNCTION fn_log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_log_id UUID;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
  INSERT INTO audit_logs (
    actor_id, actor_email, action, entity_type, entity_id,
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    v_user_id, v_user_email, p_action, p_entity_type, p_entity_id,
    p_old_values, p_new_values, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Queue Image for Processing
CREATE OR REPLACE FUNCTION fn_queue_image_processing(
  p_storage_path TEXT,
  p_bucket TEXT DEFAULT 'community-media',
  p_processing_type TEXT DEFAULT 'optimize'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_queue_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO image_processing_queue (storage_path, bucket, user_id, processing_type)
  VALUES (p_storage_path, p_bucket, v_user_id, p_processing_type)
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$;

-- Check Rate Limit
CREATE OR REPLACE FUNCTION fn_check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_requests INT DEFAULT 100,
  p_window_minutes INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INT;
  v_allowed BOOLEAN;
BEGIN
  v_window_start := DATE_TRUNC('minute', NOW());
  
  INSERT INTO rate_limits (identifier, action, window_start, request_count)
  VALUES (p_identifier, p_action, v_window_start, 1)
  ON CONFLICT ON CONSTRAINT ux_rate_limit
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_current_count;
  
  v_allowed := v_current_count <= p_max_requests;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'max_requests', p_max_requests,
    'reset_at', v_window_start + (p_window_minutes || ' minutes')::interval
  );
END;
$$;

-- System Health Check
CREATE OR REPLACE FUNCTION fn_system_health_check()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_health JSONB;
BEGIN
  SELECT jsonb_build_object(
    'status', 'healthy',
    'timestamp', NOW(),
    'database', jsonb_build_object(
      'connected', true,
      'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
      'total_connections', (SELECT COUNT(*) FROM pg_stat_activity)
    ),
    'tables', jsonb_build_object(
      'profiles', (SELECT COUNT(*) FROM profiles),
      'posts', (SELECT COUNT(*) FROM posts),
      'marketplace_listings', COALESCE((SELECT COUNT(*) FROM marketplace_listings), 0)
    ),
    'queues', jsonb_build_object(
      'pending_images', COALESCE((SELECT COUNT(*) FROM image_processing_queue WHERE status = 'pending'), 0),
      'failed_images', COALESCE((SELECT COUNT(*) FROM image_processing_queue WHERE status = 'failed'), 0)
    )
  ) INTO v_health;
  
  RETURN v_health;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'status', 'degraded',
    'error', SQLERRM,
    'timestamp', NOW()
  );
END;
$$;

-- ============================================================================
-- PART 9: GRANTS
-- ============================================================================

-- Functions
GRANT EXECUTE ON FUNCTION fn_get_posts_feed TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fn_get_comments_paginated TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fn_get_marketplace_listings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fn_get_admin_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION fn_log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION fn_queue_image_processing TO authenticated;
GRANT EXECUTE ON FUNCTION fn_check_rate_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fn_system_health_check TO authenticated, anon;
GRANT EXECUTE ON FUNCTION fn_cleanup_rate_limits TO authenticated;

-- ============================================================================
-- VERIFICATION QUERY (Run this to verify migration was successful)
-- ============================================================================

-- SELECT fn_system_health_check();
-- SELECT fn_get_admin_dashboard_stats();
-- SELECT * FROM fn_get_posts_feed(NULL, NULL, 5, NULL, NULL);
