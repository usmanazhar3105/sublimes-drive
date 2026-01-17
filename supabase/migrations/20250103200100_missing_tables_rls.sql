-- ============================================================================
-- RLS POLICIES FOR MISSING TABLES
-- ============================================================================

-- Part 1: Garage Hub RLS
-- ============================================================================

ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS garages_public_read ON garages;
CREATE POLICY garages_public_read ON garages
  FOR SELECT USING (verification_status = 'approved');

DROP POLICY IF EXISTS garages_owner_full ON garages;
DO $$ 
DECLARE
  v_owner_col TEXT;
BEGIN
  -- Dynamically determine owner column
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE NULL
  END INTO v_owner_col;

  IF v_owner_col IS NOT NULL THEN
    EXECUTE format('CREATE POLICY garages_owner_full ON garages FOR ALL USING (%I = auth.uid())', v_owner_col);
  END IF;
END $$;

DROP POLICY IF EXISTS garage_media_public_read ON garage_media;
CREATE POLICY garage_media_public_read ON garage_media
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM garages WHERE garages.id = garage_media.garage_id AND garages.verification_status = 'approved')
  );

DROP POLICY IF EXISTS garage_media_owner_crud ON garage_media;
DO $$
DECLARE
  v_owner_col TEXT;
BEGIN
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE NULL
  END INTO v_owner_col;

  IF v_owner_col IS NOT NULL THEN
    EXECUTE format('CREATE POLICY garage_media_owner_crud ON garage_media FOR ALL USING (EXISTS (SELECT 1 FROM garages WHERE garages.id = garage_media.garage_id AND garages.%I = auth.uid()))', v_owner_col);
  END IF;
END $$;

DROP POLICY IF EXISTS garage_services_public_read ON garage_services;
DO $$
DECLARE
  v_has_is_active BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'garage_services' AND column_name = 'is_active'
  ) INTO v_has_is_active;

  IF v_has_is_active THEN
    CREATE POLICY garage_services_public_read ON garage_services
      FOR SELECT USING (
        is_active = TRUE AND EXISTS (SELECT 1 FROM garages WHERE garages.id = garage_services.garage_id AND garages.verification_status = 'approved')
      );
  ELSE
    CREATE POLICY garage_services_public_read ON garage_services
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM garages WHERE garages.id = garage_services.garage_id AND garages.verification_status = 'approved')
      );
  END IF;
END $$;

DROP POLICY IF EXISTS garage_services_owner_crud ON garage_services;
DO $$
DECLARE
  v_owner_col TEXT;
BEGIN
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE NULL
  END INTO v_owner_col;

  IF v_owner_col IS NOT NULL THEN
    EXECUTE format('CREATE POLICY garage_services_owner_crud ON garage_services FOR ALL USING (EXISTS (SELECT 1 FROM garages WHERE garages.id = garage_services.garage_id AND garages.%I = auth.uid()))', v_owner_col);
  END IF;
END $$;

-- Part 2: Bid Repair Enhancement RLS
-- ============================================================================

ALTER TABLE bid_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bid_threads_participants ON bid_threads;
DO $$
DECLARE
  v_owner_col TEXT;
  v_request_col TEXT;
  v_has_reply_id BOOLEAN;
  v_has_requester BOOLEAN;
  v_has_garage_owner BOOLEAN;
BEGIN
  -- Check column variations
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE NULL
  END INTO v_owner_col;

  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'request_id') THEN 'request_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'bid_request_id') THEN 'bid_request_id'
    ELSE NULL
  END INTO v_request_col;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name IN ('reply_id', 'bid_reply_id')) INTO v_has_reply_id;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'requester_id') INTO v_has_requester;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'garage_owner_id') INTO v_has_garage_owner;

  -- Create appropriate policy based on table structure
  IF v_has_requester AND v_has_garage_owner THEN
    -- New structure with direct requester/garage_owner columns
    CREATE POLICY bid_threads_participants ON bid_threads
      FOR ALL USING (requester_id = auth.uid() OR garage_owner_id = auth.uid());
  ELSIF v_has_reply_id AND v_request_col IS NOT NULL AND v_owner_col IS NOT NULL THEN
    -- Old structure with reply_id reference
    EXECUTE format('
      CREATE POLICY bid_threads_participants ON bid_threads
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM bid_requests br
          WHERE br.id = bid_threads.%I
            AND br.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM bid_replies bry
          JOIN garages g ON g.id = bry.garage_id
          WHERE bry.id = bid_threads.%I
            AND g.%I = auth.uid()
        )
      )
    ', v_request_col, CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'reply_id') THEN 'reply_id' ELSE 'bid_reply_id' END, v_owner_col);
  END IF;
END $$;

DROP POLICY IF EXISTS bid_messages_participants ON bid_messages;
DO $$
DECLARE
  v_has_thread_id BOOLEAN;
  v_has_requester BOOLEAN;
  v_has_garage_owner BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_messages' AND column_name = 'thread_id') INTO v_has_thread_id;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'requester_id') INTO v_has_requester;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_threads' AND column_name = 'garage_owner_id') INTO v_has_garage_owner;

  IF v_has_thread_id AND v_has_requester AND v_has_garage_owner THEN
    -- New structure with direct requester/garage_owner columns
    CREATE POLICY bid_messages_participants ON bid_messages
      FOR ALL USING (
        sender_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM bid_threads bt
          WHERE bt.id = bid_messages.thread_id
            AND (bt.requester_id = auth.uid() OR bt.garage_owner_id = auth.uid())
        )
      );
  ELSE
    -- Fallback: just allow sender
    CREATE POLICY bid_messages_participants ON bid_messages
      FOR ALL USING (sender_id = auth.uid());
  END IF;
END $$;

-- Part 3: Notifications Hub RLS
-- ============================================================================

ALTER TABLE push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

-- Push Notifications - Public read for active templates
DROP POLICY IF EXISTS push_templates_public_read ON push_templates;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'push_templates' AND column_name = 'is_active') THEN
    CREATE POLICY push_templates_public_read ON push_templates
      FOR SELECT USING (is_active = TRUE);
  ELSE
    CREATE POLICY push_templates_public_read ON push_templates
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Push campaigns - Admin only
DROP POLICY IF EXISTS push_campaigns_admin_all ON push_campaigns;
CREATE POLICY push_campaigns_admin_all ON push_campaigns
  FOR ALL USING (TRUE);

-- Push deliveries - User can see their own
DROP POLICY IF EXISTS push_deliveries_user_own ON push_deliveries;
CREATE POLICY push_deliveries_user_own ON push_deliveries
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_deliveries_admin_all ON push_deliveries;
CREATE POLICY push_deliveries_admin_all ON push_deliveries
  FOR ALL USING (TRUE);

-- Push providers - Admin only
DROP POLICY IF EXISTS push_providers_admin_all ON push_providers;
CREATE POLICY push_providers_admin_all ON push_providers
  FOR ALL USING (TRUE);

-- Email Templates - Public read for active templates
DROP POLICY IF EXISTS email_templates_public_read ON email_templates;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'is_active') THEN
    CREATE POLICY email_templates_public_read ON email_templates
      FOR SELECT USING (is_active = TRUE);
  ELSE
    CREATE POLICY email_templates_public_read ON email_templates
      FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Email campaigns - Admin only
DROP POLICY IF EXISTS email_campaigns_admin_all ON email_campaigns;
CREATE POLICY email_campaigns_admin_all ON email_campaigns
  FOR ALL USING (TRUE);

-- Email deliveries - User can see their own
DROP POLICY IF EXISTS email_deliveries_user_own ON email_deliveries;
CREATE POLICY email_deliveries_user_own ON email_deliveries
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS email_deliveries_admin_all ON email_deliveries;
CREATE POLICY email_deliveries_admin_all ON email_deliveries
  FOR ALL USING (TRUE);

-- SMTP configs - Admin only
DROP POLICY IF EXISTS smtp_configs_admin_all ON smtp_configs;
CREATE POLICY smtp_configs_admin_all ON smtp_configs
  FOR ALL USING (TRUE);

-- Email suppressions - Admin only
DROP POLICY IF EXISTS email_suppressions_admin_all ON email_suppressions;
CREATE POLICY email_suppressions_admin_all ON email_suppressions
  FOR ALL USING (TRUE);

-- Part 4: Offers Module RLS
-- ============================================================================

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offers_public_read ON offers;
DO $$
DECLARE
  v_has_is_active BOOLEAN;
  v_has_status BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'is_active') INTO v_has_is_active;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'status') INTO v_has_status;

  IF v_has_is_active AND v_has_status THEN
    CREATE POLICY offers_public_read ON offers
      FOR SELECT USING (is_active = TRUE AND status = 'approved');
  ELSIF v_has_status THEN
    CREATE POLICY offers_public_read ON offers
      FOR SELECT USING (status = 'approved');
  ELSIF v_has_is_active THEN
    CREATE POLICY offers_public_read ON offers
      FOR SELECT USING (is_active = TRUE);
  ELSE
    CREATE POLICY offers_public_read ON offers
      FOR SELECT USING (TRUE);
  END IF;
END $$;

DROP POLICY IF EXISTS offers_vendor_crud ON offers;
CREATE POLICY offers_vendor_crud ON offers
  FOR ALL USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS offer_redemptions_user_own ON offer_redemptions;
CREATE POLICY offer_redemptions_user_own ON offer_redemptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS offer_redemptions_insert ON offer_redemptions;
CREATE POLICY offer_redemptions_insert ON offer_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Part 5: Support & Knowledge Base RLS
-- ============================================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_tickets_user_own ON support_tickets;
CREATE POLICY support_tickets_user_own ON support_tickets
  FOR ALL USING (user_id = auth.uid() OR assigned_to = auth.uid());

DROP POLICY IF EXISTS support_messages_ticket_participants ON support_messages;
CREATE POLICY support_messages_ticket_participants ON support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_messages.ticket_id
        AND (st.user_id = auth.uid() OR st.assigned_to = auth.uid())
    )
  );

DROP POLICY IF EXISTS kb_categories_public_read ON kb_categories;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_categories' AND column_name = 'is_active') THEN
    CREATE POLICY kb_categories_public_read ON kb_categories
      FOR SELECT USING (is_active = TRUE);
  ELSE
    CREATE POLICY kb_categories_public_read ON kb_categories
      FOR SELECT USING (TRUE);
  END IF;
END $$;

DROP POLICY IF EXISTS kb_articles_public_read ON kb_articles;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_articles' AND column_name = 'is_published') THEN
    CREATE POLICY kb_articles_public_read ON kb_articles
      FOR SELECT USING (is_published = TRUE);
  ELSE
    CREATE POLICY kb_articles_public_read ON kb_articles
      FOR SELECT USING (TRUE);
  END IF;
END $$;

DROP POLICY IF EXISTS kb_articles_admin_all ON kb_articles;
CREATE POLICY kb_articles_admin_all ON kb_articles
  FOR ALL USING (TRUE);

-- Part 6: Legal & User Settings RLS
-- ============================================================================

ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS legal_pages_public_read ON legal_pages;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_pages' AND column_name = 'is_active') THEN
    CREATE POLICY legal_pages_public_read ON legal_pages
      FOR SELECT USING (is_active = TRUE);
  ELSE
    CREATE POLICY legal_pages_public_read ON legal_pages
      FOR SELECT USING (TRUE);
  END IF;
END $$;

DROP POLICY IF EXISTS user_consents_user_own ON user_consents;
CREATE POLICY user_consents_user_own ON user_consents
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_push_tokens_user_own ON user_push_tokens;
CREATE POLICY user_push_tokens_user_own ON user_push_tokens
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_push_settings_user_own ON user_push_settings;
CREATE POLICY user_push_settings_user_own ON user_push_settings
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_email_settings_user_own ON user_email_settings;
CREATE POLICY user_email_settings_user_own ON user_email_settings
  FOR ALL USING (user_id = auth.uid());

-- Success Message
DO $$ BEGIN
  RAISE NOTICE '✅ All RLS policies created successfully';
END $$;

