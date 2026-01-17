-- ============================================================================
-- MISSING TABLES RLS POLICIES
-- Date: 2025-01-03
-- Purpose: Add RLS policies for all newly created tables
-- Note: Following RLS patterns from guidelines (owner_rw, public_read_approved, admin in app layer)
-- ============================================================================

-- ============================================================================
-- 1. GARAGE HUB RLS
-- ============================================================================

ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- Public can read approved garages
DROP POLICY IF EXISTS "garages_public_read" ON public.garages;
CREATE POLICY "garages_public_read" ON public.garages
  FOR SELECT USING (status = 'approved');

-- Owners can manage their garages
DROP POLICY IF EXISTS "garages_owner_rw" ON public.garages;
CREATE POLICY "garages_owner_rw" ON public.garages
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

ALTER TABLE public.garage_media ENABLE ROW LEVEL SECURITY;

-- Public can read media for approved garages
DROP POLICY IF EXISTS "garage_media_public_read" ON public.garage_media;
CREATE POLICY "garage_media_public_read" ON public.garage_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_media.garage_id AND garages.status = 'approved'
    )
  );

-- Owners can manage their garage media
DROP POLICY IF EXISTS "garage_media_owner_rw" ON public.garage_media;
CREATE POLICY "garage_media_owner_rw" ON public.garage_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_media.garage_id AND garages.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_media.garage_id AND garages.owner_id = auth.uid()
    )
  );

ALTER TABLE public.garage_services ENABLE ROW LEVEL SECURITY;

-- Public can read services for approved garages
DROP POLICY IF EXISTS "garage_services_public_read" ON public.garage_services;
CREATE POLICY "garage_services_public_read" ON public.garage_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_services.garage_id AND garages.status = 'approved'
    )
  );

-- Owners can manage their garage services
DROP POLICY IF EXISTS "garage_services_owner_rw" ON public.garage_services;
CREATE POLICY "garage_services_owner_rw" ON public.garage_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_services.garage_id AND garages.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = garage_services.garage_id AND garages.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. BID REPAIR RLS
-- ============================================================================

ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;

-- Dynamic owner column check
DO $$
DECLARE
  v_owner_col TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'user_id') THEN
    v_owner_col := 'user_id';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'owner_id') THEN
    v_owner_col := 'owner_id';
  ELSE
    RETURN;
  END IF;
  
  EXECUTE 'DROP POLICY IF EXISTS "bid_requests_owner_read" ON public.bid_requests';
  EXECUTE format('CREATE POLICY "bid_requests_owner_read" ON public.bid_requests FOR SELECT USING (auth.uid() = %I)', v_owner_col);
  
  EXECUTE 'DROP POLICY IF EXISTS "bid_requests_owner_rw" ON public.bid_requests';
  EXECUTE format('CREATE POLICY "bid_requests_owner_rw" ON public.bid_requests FOR ALL USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)', v_owner_col, v_owner_col);
END $$;

-- Garages can read open bid requests
DROP POLICY IF EXISTS "bid_requests_garage_read" ON public.bid_requests;
CREATE POLICY "bid_requests_garage_read" ON public.bid_requests
  FOR SELECT USING (status = 'open');

ALTER TABLE public.bid_replies ENABLE ROW LEVEL SECURITY;

-- Users can read replies to their bid requests
DROP POLICY IF EXISTS "bid_replies_user_read" ON public.bid_replies;
CREATE POLICY "bid_replies_user_read" ON public.bid_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests
      WHERE bid_requests.id = bid_replies.bid_request_id AND bid_requests.user_id = auth.uid()
    )
  );

-- Garages can manage their own replies
DROP POLICY IF EXISTS "bid_replies_garage_rw" ON public.bid_replies;
CREATE POLICY "bid_replies_garage_rw" ON public.bid_replies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = bid_replies.garage_id AND garages.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = bid_replies.garage_id AND garages.owner_id = auth.uid()
    )
  );

ALTER TABLE public.bid_threads ENABLE ROW LEVEL SECURITY;

-- Participants can read their threads
DROP POLICY IF EXISTS "bid_threads_participants_read" ON public.bid_threads;
CREATE POLICY "bid_threads_participants_read" ON public.bid_threads
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.garages
      WHERE garages.id = bid_threads.garage_id AND garages.owner_id = auth.uid()
    )
  );

ALTER TABLE public.bid_messages ENABLE ROW LEVEL SECURITY;

-- Participants can read messages in their threads
DROP POLICY IF EXISTS "bid_messages_participants_read" ON public.bid_messages;
CREATE POLICY "bid_messages_participants_read" ON public.bid_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bid_threads
      WHERE bid_threads.id = bid_messages.thread_id
      AND (bid_threads.user_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.garages WHERE garages.id = bid_threads.garage_id AND garages.owner_id = auth.uid()))
    )
  );

-- Participants can send messages
DROP POLICY IF EXISTS "bid_messages_participants_insert" ON public.bid_messages;
CREATE POLICY "bid_messages_participants_insert" ON public.bid_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- 3. NOTIFICATIONS RLS
-- ============================================================================

ALTER TABLE public.push_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_templates_public_read" ON public.push_templates;
CREATE POLICY "push_templates_public_read" ON public.push_templates
  FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;
-- No public access to campaigns

ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;
-- Users can read their own deliveries
DROP POLICY IF EXISTS "push_deliveries_user_read" ON public.push_deliveries;
CREATE POLICY "push_deliveries_user_read" ON public.push_deliveries
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.push_providers ENABLE ROW LEVEL SECURITY;
-- No public access to providers

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
-- Users can manage their own tokens
DROP POLICY IF EXISTS "user_push_tokens_owner_rw" ON public.user_push_tokens;
CREATE POLICY "user_push_tokens_owner_rw" ON public.user_push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_push_settings ENABLE ROW LEVEL SECURITY;
-- Users can manage their own settings
DROP POLICY IF EXISTS "user_push_settings_owner_rw" ON public.user_push_settings;
CREATE POLICY "user_push_settings_owner_rw" ON public.user_push_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_templates_public_read" ON public.email_templates;
CREATE POLICY "email_templates_public_read" ON public.email_templates
  FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
-- No public access to campaigns

ALTER TABLE public.email_deliveries ENABLE ROW LEVEL SECURITY;
-- Users can read their own deliveries
DROP POLICY IF EXISTS "email_deliveries_user_read" ON public.email_deliveries;
CREATE POLICY "email_deliveries_user_read" ON public.email_deliveries
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;
-- No public access to SMTP configs

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
-- System managed, no direct user access

ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;
-- Users can manage their own settings
DROP POLICY IF EXISTS "user_email_settings_owner_rw" ON public.user_email_settings;
CREATE POLICY "user_email_settings_owner_rw" ON public.user_email_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. OFFERS RLS
-- ============================================================================

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public can read active offers
DROP POLICY IF EXISTS "offers_public_read" ON public.offers;
CREATE POLICY "offers_public_read" ON public.offers
  FOR SELECT USING (is_active = TRUE AND start_date <= NOW() AND end_date >= NOW());

ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own redemptions
DROP POLICY IF EXISTS "offer_redemptions_owner_read" ON public.offer_redemptions;
CREATE POLICY "offer_redemptions_owner_read" ON public.offer_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own redemptions
DROP POLICY IF EXISTS "offer_redemptions_owner_insert" ON public.offer_redemptions;
CREATE POLICY "offer_redemptions_owner_insert" ON public.offer_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. SUPPORT & KB RLS
-- ============================================================================

ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb_categories_public_read" ON public.kb_categories;
CREATE POLICY "kb_categories_public_read" ON public.kb_categories
  FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb_articles_public_read" ON public.kb_articles;
CREATE POLICY "kb_articles_public_read" ON public.kb_articles
  FOR SELECT USING (is_published = TRUE);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tickets
DROP POLICY IF EXISTS "support_tickets_owner_rw" ON public.support_tickets;
CREATE POLICY "support_tickets_owner_rw" ON public.support_tickets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assigned staff can read tickets
DROP POLICY IF EXISTS "support_tickets_assigned_read" ON public.support_tickets;
CREATE POLICY "support_tickets_assigned_read" ON public.support_tickets
  FOR SELECT USING (auth.uid() = assigned_to);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Ticket participants can read messages
DROP POLICY IF EXISTS "support_messages_participants_read" ON public.support_messages;
CREATE POLICY "support_messages_participants_read" ON public.support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND (support_tickets.user_id = auth.uid() OR support_tickets.assigned_to = auth.uid())
    )
  );

-- Participants can send messages
DROP POLICY IF EXISTS "support_messages_participants_insert" ON public.support_messages;
CREATE POLICY "support_messages_participants_insert" ON public.support_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- 6. LEGAL RLS
-- ============================================================================

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "legal_pages_public_read" ON public.legal_pages;
CREATE POLICY "legal_pages_public_read" ON public.legal_pages
  FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
-- Users can read their own consents
DROP POLICY IF EXISTS "user_consents_owner_read" ON public.user_consents;
CREATE POLICY "user_consents_owner_read" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own consents
DROP POLICY IF EXISTS "user_consents_owner_insert" ON public.user_consents;
CREATE POLICY "user_consents_owner_insert" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. SECURITY RLS
-- ============================================================================

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
-- Users can read their own security events
DROP POLICY IF EXISTS "security_events_owner_read" ON public.security_events;
CREATE POLICY "security_events_owner_read" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert events
DROP POLICY IF EXISTS "security_events_system_insert" ON public.security_events;
CREATE POLICY "security_events_system_insert" ON public.security_events
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ALL RLS POLICIES CREATED SUCCESSFULLY!';
  RAISE NOTICE 'Policies follow guidelines: owner_rw, public_read_approved, admin checks in app layer';
END $$;

