-- ============================================================================
-- SUBLIMES DRIVE - ROW LEVEL SECURITY (RLS) POLICIES
-- Version: 1.0
-- Created: November 3, 2025
-- ============================================================================
-- This file contains all RLS policies for securing database access
-- Note: Admin checks are avoided in RLS where possible to prevent recursion
-- ============================================================================

-- ============================================================================
-- CRITICAL: These policies complement existing ones, dropping only as needed
-- ============================================================================

-- ============================================================================
-- SECTION 1: NEW TABLE POLICIES
-- ============================================================================

-- Garage Media
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garage_media') THEN
    ALTER TABLE public.garage_media ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "garage_media_public_view" ON public.garage_media;
    DROP POLICY IF EXISTS "garage_media_owner_manage" ON public.garage_media;

    -- Public view policy (check if status column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'status') THEN
      CREATE POLICY "garage_media_public_view"
        ON public.garage_media FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.garages
            WHERE garages.id = garage_media.garage_id 
            AND garages.status = 'approved'
          )
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'verification_status') THEN
      CREATE POLICY "garage_media_public_view"
        ON public.garage_media FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.garages
            WHERE garages.id = garage_media.garage_id 
            AND garages.verification_status = 'approved'
          )
        );
    ELSE
      -- No status column, allow all public viewing
      CREATE POLICY "garage_media_public_view"
        ON public.garage_media FOR SELECT
        USING (TRUE);
    END IF;

    -- Owner manage policy
    CREATE POLICY "garage_media_owner_manage"
      ON public.garage_media FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.garages
          WHERE garages.id = garage_media.garage_id 
          AND garages.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.garages
          WHERE garages.id = garage_media.garage_id 
          AND garages.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Marketplace Categories
ALTER TABLE public.mk_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mk_categories_public_read" ON public.mk_categories;
CREATE POLICY "mk_categories_public_read"
  ON public.mk_categories FOR SELECT
  USING (is_active = TRUE);

-- Marketplace Attributes
ALTER TABLE public.mk_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mk_attributes_public_read" ON public.mk_attributes;
CREATE POLICY "mk_attributes_public_read"
  ON public.mk_attributes FOR SELECT
  USING (TRUE);

-- Listing Saves
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_saves_owner_manage" ON public.listing_saves;
CREATE POLICY "listing_saves_owner_manage"
  ON public.listing_saves FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Bid Threads
ALTER TABLE public.bid_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bid_threads_participants_only" ON public.bid_threads;
CREATE POLICY "bid_threads_participants_only"
  ON public.bid_threads FOR SELECT
  USING (requester_id = auth.uid() OR garage_owner_id = auth.uid());

-- Bid Messages  
ALTER TABLE public.bid_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bid_messages_thread_participants" ON public.bid_messages;
CREATE POLICY "bid_messages_thread_participants"
  ON public.bid_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_threads
      WHERE bid_threads.id = bid_messages.thread_id 
      AND (bid_threads.requester_id = auth.uid() OR bid_threads.garage_owner_id = auth.uid())
    )
  )
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bid_threads
      WHERE bid_threads.id = thread_id 
      AND (bid_threads.requester_id = auth.uid() OR bid_threads.garage_owner_id = auth.uid())
    )
  );

-- Event Likes
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_likes_public_read" ON public.event_likes;
DROP POLICY IF EXISTS "event_likes_owner_manage" ON public.event_likes;

CREATE POLICY "event_likes_public_read"
  ON public.event_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "event_likes_owner_manage"
  ON public.event_likes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Event Views (system managed)
ALTER TABLE public.event_views DISABLE ROW LEVEL SECURITY;

-- Challenge Progress
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_progress_owner_only" ON public.challenge_progress;
CREATE POLICY "challenge_progress_owner_only"
  ON public.challenge_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Push Templates (admin only)
ALTER TABLE public.push_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_templates_public_read" ON public.push_templates;

-- Check if is_active column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'push_templates' AND column_name = 'is_active') THEN
    CREATE POLICY "push_templates_public_read"
      ON public.push_templates FOR SELECT
      USING (is_active = TRUE);
  ELSE
    -- No is_active column, allow all SELECT (admin will manage via app layer)
    CREATE POLICY "push_templates_public_read"
      ON public.push_templates FOR SELECT
      USING (TRUE);
  END IF;
END $$;

-- Push Segments (admin only - no public access)
ALTER TABLE public.push_segments ENABLE ROW LEVEL SECURITY;
-- No policies - admin access via application layer

-- User Push Tokens (owner only)
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_push_tokens_owner" ON public.user_push_tokens;
CREATE POLICY "user_push_tokens_owner"
  ON public.user_push_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Push Settings (owner only)
ALTER TABLE public.user_push_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_push_settings_owner" ON public.user_push_settings;
CREATE POLICY "user_push_settings_owner"
  ON public.user_push_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Email Templates (public read active)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_public_read" ON public.email_templates;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'is_active') THEN
    CREATE POLICY "email_templates_public_read"
      ON public.email_templates FOR SELECT
      USING (is_active = TRUE);
  ELSE
    CREATE POLICY "email_templates_public_read"
      ON public.email_templates FOR SELECT
      USING (TRUE);
  END IF;
END $$;

-- Email Segments (admin only)
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
-- No policies - admin access via application layer

-- SMTP Configs (admin only)
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;
-- No policies - admin access via application layer

-- Email Suppressions (system managed)
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
-- No public policies - managed by system

-- User Email Settings (owner only)
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_email_settings_owner" ON public.user_email_settings;
CREATE POLICY "user_email_settings_owner"
  ON public.user_email_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- KB Categories (public read active)
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_categories_public_read" ON public.kb_categories;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_categories' AND column_name = 'is_active') THEN
    CREATE POLICY "kb_categories_public_read"
      ON public.kb_categories FOR SELECT
      USING (is_active = TRUE);
  ELSE
    CREATE POLICY "kb_categories_public_read"
      ON public.kb_categories FOR SELECT
      USING (TRUE);
  END IF;
END $$;

-- System Logs (no RLS - admin access via application layer)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
-- No public policies

-- Boost Packages (public read active)
ALTER TABLE public.boost_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boost_packages_public_read" ON public.boost_packages;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boost_packages' AND column_name = 'is_active') THEN
    CREATE POLICY "boost_packages_public_read"
      ON public.boost_packages FOR SELECT
      USING (is_active = TRUE);
  ELSE
    CREATE POLICY "boost_packages_public_read"
      ON public.boost_packages FOR SELECT
      USING (TRUE);
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: ENHANCED POLICIES FOR EXISTING TABLES
-- ============================================================================

-- Bid Requests - Enhance to allow garage owners to view open requests
DO $$
DECLARE
  v_owner_col TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_requests') THEN
    ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;
    
    -- Determine owner column name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'user_id') THEN
      v_owner_col := 'user_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'owner_id') THEN
      v_owner_col := 'owner_id';
    END IF;
    
    IF v_owner_col IS NOT NULL THEN
      DROP POLICY IF EXISTS "bid_requests_public_view_open" ON public.bid_requests;
      EXECUTE format('CREATE POLICY "bid_requests_public_view_open" ON public.bid_requests FOR SELECT USING (status = ''open'' OR %I = auth.uid())', v_owner_col);
      
      DROP POLICY IF EXISTS "bid_requests_owner_create_update" ON public.bid_requests;
      EXECUTE format('CREATE POLICY "bid_requests_owner_create_update" ON public.bid_requests FOR INSERT WITH CHECK (%I = auth.uid())', v_owner_col);
      
      DROP POLICY IF EXISTS "bid_requests_owner_update" ON public.bid_requests;
      EXECUTE format('CREATE POLICY "bid_requests_owner_update" ON public.bid_requests FOR UPDATE USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())', v_owner_col, v_owner_col);
    END IF;
  END IF;
END $$;

-- Bid Replies - Ensure proper access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_replies') THEN
    ALTER TABLE public.bid_replies ENABLE ROW LEVEL SECURITY;
    
    -- Check which columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_replies' AND column_name = 'bid_request_id') THEN
      DROP POLICY IF EXISTS "bid_replies_participants_view" ON public.bid_replies;
      CREATE POLICY "bid_replies_participants_view"
        ON public.bid_replies FOR SELECT
        USING (
          garage_owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.bid_requests
            WHERE bid_requests.id = bid_replies.bid_request_id 
            AND bid_requests.user_id = auth.uid()
          )
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_replies' AND column_name = 'bid_id') THEN
      DROP POLICY IF EXISTS "bid_replies_participants_view" ON public.bid_replies;
      CREATE POLICY "bid_replies_participants_view"
        ON public.bid_replies FOR SELECT
        USING (
          garage_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.bid_requests
            WHERE bid_requests.id = bid_replies.bid_id 
            AND bid_requests.owner_id = auth.uid()
          )
        );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: SYSTEM TABLE PERMISSIONS (No RLS)
-- ============================================================================

-- Disable RLS on system-managed tables
ALTER TABLE IF EXISTS public.post_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listing_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events DISABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions
GRANT SELECT, INSERT ON public.post_views TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.post_stats TO authenticated, anon;
GRANT SELECT, INSERT ON public.listing_views TO authenticated, anon;
GRANT SELECT, INSERT ON public.event_views TO authenticated, anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated, anon;

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================

COMMENT ON SCHEMA public IS 'Sublimes Drive - Complete RLS Policies Applied (2025-11-03)';

