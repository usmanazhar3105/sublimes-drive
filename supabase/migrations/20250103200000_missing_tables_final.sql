-- ============================================================================
-- MISSING TABLES - FINAL COMPREHENSIVE MIGRATION
-- ============================================================================
-- This migration creates all remaining missing tables with proper schema

-- Part 1: Garage Hub Tables
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    CREATE TABLE garages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      city TEXT,
      country TEXT DEFAULT 'UAE',
      phone TEXT,
      email TEXT,
      website TEXT,
      logo_url TEXT,
      cover_image_url TEXT,
      business_license TEXT,
      trade_license TEXT,
      operating_hours JSONB DEFAULT '{}'::JSONB,
      services TEXT[],
      specializations TEXT[],
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')),
      verified_at TIMESTAMPTZ,
      is_featured BOOLEAN DEFAULT FALSE,
      is_premium BOOLEAN DEFAULT FALSE,
      views_count INTEGER DEFAULT 0,
      meta JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_garages_user_id ON garages(user_id);
    CREATE INDEX idx_garages_verification_status ON garages(verification_status);
    CREATE INDEX idx_garages_city ON garages(city);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garage_media') THEN
    CREATE TABLE garage_media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
      media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_garage_media_garage_id ON garage_media(garage_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garage_services') THEN
    CREATE TABLE garage_services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
      service_name TEXT NOT NULL,
      description TEXT,
      price_min DECIMAL(10,2),
      price_max DECIMAL(10,2),
      duration_minutes INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_garage_services_garage_id ON garage_services(garage_id);
  END IF;
END $$;

-- Part 2: Bid Repair Enhancement Tables
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_threads') THEN
    CREATE TABLE bid_threads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID REFERENCES bid_requests(id) ON DELETE CASCADE NOT NULL,
      reply_id UUID REFERENCES bid_replies(id) ON DELETE CASCADE NOT NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_bid_threads_request_id ON bid_threads(request_id);
    CREATE INDEX idx_bid_threads_reply_id ON bid_threads(reply_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_messages') THEN
    CREATE TABLE bid_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_id UUID REFERENCES bid_threads(id) ON DELETE CASCADE NOT NULL,
      sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
      content TEXT,
      media_url TEXT,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_bid_messages_thread_id ON bid_messages(thread_id);
    CREATE INDEX idx_bid_messages_sender_id ON bid_messages(sender_id);
  END IF;
END $$;

-- Part 3: Notifications Hub - Push Notifications
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_templates') THEN
    CREATE TABLE push_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      title_template TEXT NOT NULL,
      body_template TEXT NOT NULL,
      icon TEXT,
      image TEXT,
      action_url TEXT,
      data JSONB DEFAULT '{}'::JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_campaigns') THEN
    CREATE TABLE push_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      template_id UUID REFERENCES push_templates(id) ON DELETE SET NULL,
      segment_filter JSONB,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      icon TEXT,
      image TEXT,
      action_url TEXT,
      schedule_for TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
      total_recipients INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      delivered_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      click_count INTEGER DEFAULT 0,
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_push_campaigns_status ON push_campaigns(status);
    CREATE INDEX idx_push_campaigns_schedule_for ON push_campaigns(schedule_for);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_deliveries') THEN
    CREATE TABLE push_deliveries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES push_campaigns(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      token_id UUID,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
      sent_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      clicked_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_push_deliveries_campaign_id ON push_deliveries(campaign_id);
    CREATE INDEX idx_push_deliveries_user_id ON push_deliveries(user_id);
    CREATE INDEX idx_push_deliveries_status ON push_deliveries(status);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_providers') THEN
    CREATE TABLE push_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      provider_type TEXT NOT NULL CHECK (provider_type IN ('fcm', 'apns', 'onesignal', 'expo')),
      api_key TEXT,
      config JSONB DEFAULT '{}'::JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Part 4: Notifications Hub - Email System
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
    CREATE TABLE email_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      subject_template TEXT NOT NULL,
      body_html TEXT NOT NULL,
      body_text TEXT,
      variables JSONB DEFAULT '[]'::JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns') THEN
    CREATE TABLE email_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
      segment_filter JSONB,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      body_text TEXT,
      from_email TEXT NOT NULL,
      from_name TEXT,
      reply_to TEXT,
      schedule_for TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
      total_recipients INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      delivered_count INTEGER DEFAULT 0,
      bounced_count INTEGER DEFAULT 0,
      opened_count INTEGER DEFAULT 0,
      clicked_count INTEGER DEFAULT 0,
      unsubscribed_count INTEGER DEFAULT 0,
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
    CREATE INDEX idx_email_campaigns_schedule_for ON email_campaigns(schedule_for);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_deliveries') THEN
    CREATE TABLE email_deliveries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'failed')),
      sent_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      opened_at TIMESTAMPTZ,
      clicked_at TIMESTAMPTZ,
      bounced_at TIMESTAMPTZ,
      unsubscribed_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_email_deliveries_campaign_id ON email_deliveries(campaign_id);
    CREATE INDEX idx_email_deliveries_user_id ON email_deliveries(user_id);
    CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
    CREATE INDEX idx_email_deliveries_email ON email_deliveries(email);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'smtp_configs') THEN
    CREATE TABLE smtp_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      host TEXT NOT NULL,
      port INTEGER NOT NULL DEFAULT 587,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      from_email TEXT NOT NULL,
      from_name TEXT,
      use_tls BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_suppressions') THEN
    CREATE TABLE email_suppressions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL CHECK (reason IN ('bounce', 'complaint', 'unsubscribe', 'manual')),
      suppressed_at TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT
    );
    CREATE INDEX idx_email_suppressions_email ON email_suppressions(email);
  END IF;
END $$;

-- Part 5: Offers Module
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    CREATE TABLE offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      terms TEXT,
      discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'other')),
      discount_value DECIMAL(10,2),
      code TEXT UNIQUE,
      image_url TEXT,
      category TEXT,
      valid_from TIMESTAMPTZ DEFAULT NOW(),
      valid_until TIMESTAMPTZ,
      max_redemptions INTEGER,
      redemption_count INTEGER DEFAULT 0,
      min_purchase_amount DECIMAL(10,2),
      is_featured BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
      views_count INTEGER DEFAULT 0,
      saves_count INTEGER DEFAULT 0,
      meta JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_offers_vendor_id ON offers(vendor_id);
    CREATE INDEX idx_offers_status ON offers(status);
    CREATE INDEX idx_offers_valid_until ON offers(valid_until);
    CREATE INDEX idx_offers_code ON offers(code);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_redemptions') THEN
    CREATE TABLE offer_redemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      offer_id UUID REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      redeemed_at TIMESTAMPTZ DEFAULT NOW(),
      amount_saved DECIMAL(10,2),
      transaction_ref TEXT,
      notes TEXT
    );
    CREATE INDEX idx_offer_redemptions_offer_id ON offer_redemptions(offer_id);
    CREATE INDEX idx_offer_redemptions_user_id ON offer_redemptions(user_id);
  END IF;
END $$;

-- Part 6: Support & Knowledge Base
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
    CREATE TABLE support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      subject TEXT NOT NULL,
      category TEXT CHECK (category IN ('technical', 'billing', 'account', 'feature', 'other')),
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
      assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
      resolved_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      meta JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
    CREATE INDEX idx_support_tickets_status ON support_tickets(status);
    CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_messages') THEN
    CREATE TABLE support_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
      sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      message TEXT NOT NULL,
      attachments TEXT[],
      is_staff_reply BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
    CREATE INDEX idx_support_messages_sender_id ON support_messages(sender_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kb_categories') THEN
    CREATE TABLE kb_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_kb_categories_slug ON kb_categories(slug);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kb_articles') THEN
    CREATE TABLE kb_articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID REFERENCES kb_categories(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      tags TEXT[],
      views_count INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMPTZ,
      meta JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_kb_articles_category_id ON kb_articles(category_id);
    CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
    CREATE INDEX idx_kb_articles_is_published ON kb_articles(is_published);
  END IF;
END $$;

-- Part 7: Legal & Compliance
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_pages') THEN
    CREATE TABLE legal_pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_type TEXT NOT NULL UNIQUE CHECK (page_type IN ('privacy', 'terms', 'cookies', 'gdpr', 'disclaimer', 'refund')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      version TEXT NOT NULL,
      effective_date TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_legal_pages_page_type ON legal_pages(page_type);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_consents') THEN
    CREATE TABLE user_consents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      legal_page_id UUID REFERENCES legal_pages(id) ON DELETE CASCADE NOT NULL,
      consent_given BOOLEAN DEFAULT TRUE,
      ip_address TEXT,
      user_agent TEXT,
      consented_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, legal_page_id)
    );
    CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
  END IF;
END $$;

-- Part 8: User Settings
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_push_tokens') THEN
    CREATE TABLE user_push_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      token TEXT NOT NULL UNIQUE,
      platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
      device_info JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      last_used_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_user_push_tokens_user_id ON user_push_tokens(user_id);
    CREATE INDEX idx_user_push_tokens_token ON user_push_tokens(token);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_push_settings') THEN
    CREATE TABLE user_push_settings (
      user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      enabled BOOLEAN DEFAULT TRUE,
      community_posts BOOLEAN DEFAULT TRUE,
      marketplace_updates BOOLEAN DEFAULT TRUE,
      bid_notifications BOOLEAN DEFAULT TRUE,
      event_reminders BOOLEAN DEFAULT TRUE,
      messages BOOLEAN DEFAULT TRUE,
      likes_comments BOOLEAN DEFAULT TRUE,
      admin_announcements BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_email_settings') THEN
    CREATE TABLE user_email_settings (
      user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      enabled BOOLEAN DEFAULT TRUE,
      marketing BOOLEAN DEFAULT TRUE,
      product_updates BOOLEAN DEFAULT TRUE,
      newsletters BOOLEAN DEFAULT TRUE,
      offers BOOLEAN DEFAULT TRUE,
      digest_frequency TEXT DEFAULT 'weekly' CHECK (digest_frequency IN ('never', 'daily', 'weekly', 'monthly')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Success Message
DO $$ BEGIN
  RAISE NOTICE '✅ All missing tables created successfully';
END $$;

