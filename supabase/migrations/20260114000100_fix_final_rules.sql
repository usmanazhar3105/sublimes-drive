-- Final RLS Cleanup and Rule Enforcement
-- Date: 2026-01-14
-- Description: Removes all admin role checks from RLS to prevent recursion (Rule #1)
--              and enforces Messaging Unlock in RLS (Rule #3).

BEGIN;

-- ============================================================================
-- 1. DROP POLICIES WITH ADMIN ROLE CHECKS (Rule #1)
-- ============================================================================

-- Audit Logs
DROP POLICY IF EXISTS "admin_read_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can read audit log" ON public.audit_log;
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;

-- System Settings
DROP POLICY IF EXISTS "admin_all_settings" ON public.system_settings;

-- Content & Knowledge Base
DROP POLICY IF EXISTS "admin_all_content" ON public.content_pages;
DROP POLICY IF EXISTS "admin_all_kb" ON public.kb_articles;

-- Support Tickets
DROP POLICY IF EXISTS "user_own_tickets" ON public.support_tickets;

-- Referrals & XP
DROP POLICY IF EXISTS "admin_all_referrals" ON public.referrals;
DROP POLICY IF EXISTS "admin_all_xp" ON public.xp_events;

-- Push, Ads, SEO, Security
DROP POLICY IF EXISTS "admin_all_push" ON public.push_templates;
DROP POLICY IF EXISTS "admin_all_ads" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_seo" ON public.seo_settings;
DROP POLICY IF EXISTS "admin_all_security" ON public.security_events;

-- View Tracking
DROP POLICY IF EXISTS "view_tracking_admin_read" ON public.view_tracking;

-- Community Media
DROP POLICY IF EXISTS "community_posts_delete" ON public.community_posts;
DROP POLICY IF EXISTS "community_comments_delete" ON public.community_comments;
DROP POLICY IF EXISTS "community_post_media_delete" ON public.community_post_media;
DROP POLICY IF EXISTS "community_comment_media_delete" ON public.community_comment_media;

-- Marketplace (from 20250105000000_marketplace_postgis_complete.sql)
DROP POLICY IF EXISTS "admin_manage_listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "admin_manage_listing_media" ON public.marketplace_listing_media;

-- ============================================================================
-- 2. CREATE CLEAN POLICIES (OWNERSHIP ONLY)
-- ============================================================================

-- Community Posts (Delete own)
CREATE POLICY "community_posts_delete_own" ON public.community_posts 
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Community Comments (Delete own)
CREATE POLICY "community_comments_delete_own" ON public.community_comments 
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Support Tickets (Own only)
CREATE POLICY "support_tickets_own" ON public.support_tickets 
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- View Tracking (Own only)
CREATE POLICY "view_tracking_user_read_own" ON public.view_tracking 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- 3. MESSAGING UNLOCK ENFORCEMENT (Rule #3)
-- ============================================================================

-- Messages only allowed after bid status = 'accepted' or 'closed'
-- This does NOT cause recursion as it doesn't touch the profiles table.

DROP POLICY IF EXISTS "users_send_own_messages" ON public.messages;
DROP POLICY IF EXISTS "users_view_own_messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_post_accept" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_after_bid_accepted" ON public.messages;
DROP POLICY IF EXISTS "admin_view_all_messages" ON public.messages;
DROP POLICY IF EXISTS "messages_read_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_when_accepted" ON public.messages;

-- Policy: Users can read messages if they are the sender or the recipient (via bid_repair)
CREATE POLICY "messages_select_involved" ON public.messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.bid_repair br
      WHERE br.id = messages.bid_id
      AND (br.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.bid_replies r
        WHERE r.bid_id = br.id AND r.garage_id = auth.uid()
      ))
    )
  );

-- Policy: Users can insert messages ONLY if the bid is accepted or closed
CREATE POLICY "messages_insert_if_unlocked" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bid_repair
      WHERE id = messages.bid_id
      AND status IN ('accepted', 'closed')
    )
  );

-- ============================================================================
-- 4. FINAL CLEANUP FOR PROFILES RECURSION
-- ============================================================================

-- Ensure the profiles table itself doesn't have policies that check role
DROP POLICY IF EXISTS "admin_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_manage_all_posts" ON public.posts;
DROP POLICY IF EXISTS "admin_manage_all_listings" ON public.listings;
DROP POLICY IF EXISTS "admin_manage_all_garages" ON public.garages;
DROP POLICY IF EXISTS "admin_manage_all_events" ON public.events;
DROP POLICY IF EXISTS "admin_manage_all_offers" ON public.offers;

COMMIT;




