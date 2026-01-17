-- =====================================================
-- SUBLIMES DRIVE: ENTERPRISE CONFIG SYSTEM SCHEMA
-- Phase 1: Database Foundation for Zero-Hardcode Architecture
-- =====================================================

-- =====================================================
-- 1. CORE APP CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS core_app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',  -- global|role|cohort|client|platform
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'string', -- string|number|boolean|json|url
  is_secret BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE core_app_config IS 'Central configuration store for all app settings';
COMMENT ON COLUMN core_app_config.scope IS 'Configuration scope: global, role-based, cohort-based, client-specific, or platform (mobile/desktop)';
COMMENT ON COLUMN core_app_config.is_secret IS 'If true, value should be masked in admin UI';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_core_app_config_scope ON core_app_config(scope);
CREATE INDEX IF NOT EXISTS idx_core_app_config_updated_at ON core_app_config(updated_at DESC);

-- =====================================================
-- 2. FEATURE FLAGS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  targeting JSONB DEFAULT '{}'::JSONB, -- role, cohort, locale, platform, percentage rollout
  environment TEXT DEFAULT 'production', -- development|staging|production
  category TEXT DEFAULT 'general', -- general|marketplace|community|garage|events|offers|admin
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE feature_flags IS 'Feature flag system for gradual rollouts and A/B testing';
COMMENT ON COLUMN feature_flags.targeting IS 'Targeting rules: {"roles": ["car_owner"], "locales": ["en"], "platforms": ["mobile"], "rollout_percentage": 50}';

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

-- =====================================================
-- 3. DESIGN TOKENS (THEME SYSTEM)
-- =====================================================

CREATE TABLE IF NOT EXISTS design_tokens (
  token TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'light', -- light|dark|high_contrast
  palette TEXT DEFAULT 'default', -- default|warm_greige|neutral_slate|soft_taupe
  value TEXT NOT NULL,
  group_name TEXT NOT NULL, -- color|space|radius|shadow|font|gradient|animation
  subgroup TEXT, -- e.g., for colors: background, text, border, etc.
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (token, mode, palette)
);

COMMENT ON TABLE design_tokens IS 'Design system tokens for theming (colors, spacing, typography, etc.)';
COMMENT ON COLUMN design_tokens.palette IS 'Color palette variant for light mode: warm_greige (default), neutral_slate, soft_taupe';

CREATE INDEX IF NOT EXISTS idx_design_tokens_group ON design_tokens(group_name, subgroup);
CREATE INDEX IF NOT EXISTS idx_design_tokens_mode_palette ON design_tokens(mode, palette);

-- =====================================================
-- 4. I18N STRINGS (INTERNATIONALIZATION)
-- =====================================================

CREATE TABLE IF NOT EXISTS i18n_strings (
  key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  text TEXT NOT NULL,
  context JSONB DEFAULT '{}'::JSONB, -- metadata about usage, placeholders, etc.
  category TEXT DEFAULT 'general', -- navigation|cta|form|error|success|empty_state|email|sms
  is_html BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (key, locale)
);

COMMENT ON TABLE i18n_strings IS 'Internationalization strings - all UI copy';
COMMENT ON COLUMN i18n_strings.context IS 'Context metadata: {"placeholders": ["name", "count"], "max_length": 50, "usage": "button"}';

CREATE INDEX IF NOT EXISTS idx_i18n_strings_locale ON i18n_strings(locale);
CREATE INDEX IF NOT EXISTS idx_i18n_strings_category ON i18n_strings(category);
CREATE INDEX IF NOT EXISTS idx_i18n_strings_key_search ON i18n_strings USING gin(to_tsvector('english', key || ' ' || text));

-- =====================================================
-- 5. MEDIA ASSETS REGISTRY
-- =====================================================

CREATE TABLE IF NOT EXISTS media_assets_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL, -- hero.home, logo.header, avatar.default, icon.marketplace, etc.
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text JSONB DEFAULT '{}'::JSONB, -- {en: "Description", ar: "وصف"}
  metadata JSONB DEFAULT '{}'::JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(purpose, bucket)
);

COMMENT ON TABLE media_assets_registry IS 'Central registry for all media assets (images, videos, documents)';
COMMENT ON COLUMN media_assets_registry.purpose IS 'Unique purpose identifier for the asset (e.g., hero.home.banner, logo.header.light)';

CREATE INDEX IF NOT EXISTS idx_media_assets_registry_purpose ON media_assets_registry(purpose);
CREATE INDEX IF NOT EXISTS idx_media_assets_registry_bucket ON media_assets_registry(bucket);
CREATE INDEX IF NOT EXISTS idx_media_assets_registry_mime_type ON media_assets_registry(mime_type);

-- =====================================================
-- 6. SEO DEFAULTS & META TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS seo_defaults (
  route TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image_id UUID REFERENCES media_assets_registry(id),
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  schema_markup JSONB,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (route, locale)
);

COMMENT ON TABLE seo_defaults IS 'SEO metadata for all routes';

CREATE INDEX IF NOT EXISTS idx_seo_defaults_locale ON seo_defaults(locale);

-- =====================================================
-- 7. AUDIT LOG (Enterprise)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log_enterprise (
  id BIGSERIAL PRIMARY KEY,
  actor UUID REFERENCES auth.users(id),
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_log_enterprise IS 'Comprehensive audit log for all config/content changes';

CREATE INDEX IF NOT EXISTS idx_audit_log_enterprise_actor ON audit_log_enterprise(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_enterprise_entity ON audit_log_enterprise(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_enterprise_action ON audit_log_enterprise(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_enterprise_created_at ON audit_log_enterprise(created_at DESC);

-- =====================================================
-- 8. EXPERIMENT VARIANTS (A/B TESTING)
-- =====================================================

CREATE TABLE IF NOT EXISTS experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_key TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  traffic_allocation INTEGER DEFAULT 50, -- percentage
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_key, variant_name)
);

COMMENT ON TABLE experiment_variants IS 'A/B test experiment variants configuration';

CREATE INDEX IF NOT EXISTS idx_experiment_variants_key ON experiment_variants(experiment_key);
CREATE INDEX IF NOT EXISTS idx_experiment_variants_active ON experiment_variants(is_active);

-- =====================================================
-- 9. SYSTEM CONSTANTS (ENUMS, REFERENCE DATA)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_constants (
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  label JSONB NOT NULL DEFAULT '{}'::JSONB, -- multilingual labels
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::JSONB,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (category, key)
);

COMMENT ON TABLE system_constants IS 'System-wide constants and reference data (status codes, categories, etc.)';
COMMENT ON COLUMN system_constants.label IS 'Multilingual labels: {"en": "Active", "ar": "نشط"}';

CREATE INDEX IF NOT EXISTS idx_system_constants_category ON system_constants(category);
CREATE INDEX IF NOT EXISTS idx_system_constants_active ON system_constants(is_active);

-- =====================================================
-- 10. NOTIFICATION TEMPLATES (Unified)
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL, -- email|sms|push|in_app
  locale TEXT NOT NULL DEFAULT 'en',
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::JSONB, -- array of variable names
  category TEXT DEFAULT 'transactional',
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_key, locale, channel)
);

COMMENT ON TABLE notification_templates_unified IS 'Templates for emails, SMS, push notifications';

CREATE INDEX IF NOT EXISTS idx_notification_templates_unified_key ON notification_templates_unified(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_unified_channel ON notification_templates_unified(channel);

-- =====================================================
-- RLS POLICIES (NO RECURSION - Using is_admin() function)
-- =====================================================

-- Core App Config
ALTER TABLE core_app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read non-secret config" ON core_app_config;
CREATE POLICY "Anyone can read non-secret config" 
  ON core_app_config FOR SELECT 
  USING (is_secret = FALSE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can write config" ON core_app_config;
CREATE POLICY "Only admins can write config" 
  ON core_app_config FOR ALL 
  TO authenticated
  USING (is_admin())  -- Uses SECURITY DEFINER function, no recursion
  WITH CHECK (is_admin());

-- Feature Flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
CREATE POLICY "Anyone can read feature flags" 
  ON feature_flags FOR SELECT 
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can manage feature flags" ON feature_flags;
CREATE POLICY "Only admins can manage feature flags" 
  ON feature_flags FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Design Tokens
ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read design tokens" ON design_tokens;
CREATE POLICY "Anyone can read design tokens" 
  ON design_tokens FOR SELECT 
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can manage design tokens" ON design_tokens;
CREATE POLICY "Only admins can manage design tokens" 
  ON design_tokens FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- I18n Strings
ALTER TABLE i18n_strings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read i18n strings" ON i18n_strings;
CREATE POLICY "Anyone can read i18n strings" 
  ON i18n_strings FOR SELECT 
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can manage i18n strings" ON i18n_strings;
CREATE POLICY "Only admins can manage i18n strings" 
  ON i18n_strings FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Media Assets Registry
ALTER TABLE media_assets_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read public media assets" ON media_assets_registry;
CREATE POLICY "Anyone can read public media assets" 
  ON media_assets_registry FOR SELECT 
  USING (is_public = TRUE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can manage media assets" ON media_assets_registry;
CREATE POLICY "Only admins can manage media assets" 
  ON media_assets_registry FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SEO Defaults
ALTER TABLE seo_defaults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read SEO defaults" ON seo_defaults;
CREATE POLICY "Anyone can read SEO defaults" 
  ON seo_defaults FOR SELECT 
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can manage SEO defaults" ON seo_defaults;
CREATE POLICY "Only admins can manage SEO defaults" 
  ON seo_defaults FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Audit Log Enterprise (read-only for most, write by admins)
ALTER TABLE audit_log_enterprise ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can read audit log" ON audit_log_enterprise;
CREATE POLICY "Only admins can read audit log" 
  ON audit_log_enterprise FOR SELECT 
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "System can insert audit log" ON audit_log_enterprise;
CREATE POLICY "System can insert audit log" 
  ON audit_log_enterprise FOR INSERT 
  WITH CHECK (TRUE);

-- System Constants
ALTER TABLE system_constants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active system constants" ON system_constants;
CREATE POLICY "Anyone can read active system constants" 
  ON system_constants FOR SELECT 
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Only admins can manage system constants" ON system_constants;
CREATE POLICY "Only admins can manage system constants" 
  ON system_constants FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Notification Templates Unified
ALTER TABLE notification_templates_unified ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active templates" ON notification_templates_unified;
CREATE POLICY "Anyone can read active templates" 
  ON notification_templates_unified FOR SELECT 
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Only admins can manage templates" ON notification_templates_unified;
CREATE POLICY "Only admins can manage templates" 
  ON notification_templates_unified FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Experiment Variants
ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active experiments" ON experiment_variants;
CREATE POLICY "Anyone can read active experiments" 
  ON experiment_variants FOR SELECT 
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Only admins can manage experiments" ON experiment_variants;
CREATE POLICY "Only admins can manage experiments" 
  ON experiment_variants FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to log config changes
CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entity_id TEXT;
BEGIN
  -- Determine entity ID based on table structure
  v_entity_id := CASE TG_TABLE_NAME
    WHEN 'design_tokens' THEN 
      CASE WHEN TG_OP = 'DELETE' 
        THEN OLD.token::TEXT 
        ELSE NEW.token::TEXT 
      END
    WHEN 'i18n_strings' THEN 
      CASE WHEN TG_OP = 'DELETE' 
        THEN OLD.key::TEXT || ':' || OLD.locale::TEXT
        ELSE NEW.key::TEXT || ':' || NEW.locale::TEXT
      END
    ELSE 
      CASE WHEN TG_OP = 'DELETE' 
        THEN (row_to_json(OLD)->>'key')
        ELSE (row_to_json(NEW)->>'key')
      END
  END;

  INSERT INTO audit_log_enterprise (
    actor, 
    actor_email,
    action, 
    entity, 
    entity_id, 
    old_value, 
    new_value,
    details
  )
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    v_entity_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Triggers for audit logging
DROP TRIGGER IF EXISTS audit_core_app_config ON core_app_config;
CREATE TRIGGER audit_core_app_config
  AFTER INSERT OR UPDATE OR DELETE ON core_app_config
  FOR EACH ROW EXECUTE FUNCTION log_config_change();

DROP TRIGGER IF EXISTS audit_feature_flags ON feature_flags;
CREATE TRIGGER audit_feature_flags
  AFTER INSERT OR UPDATE OR DELETE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION log_config_change();

DROP TRIGGER IF EXISTS audit_design_tokens ON design_tokens;
CREATE TRIGGER audit_design_tokens
  AFTER INSERT OR UPDATE OR DELETE ON design_tokens
  FOR EACH ROW EXECUTE FUNCTION log_config_change();

-- Apply updated_at triggers to all config tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
    AND table_name IN (
      'core_app_config', 'feature_flags', 'design_tokens', 
      'i18n_strings', 'media_assets_registry', 'seo_defaults',
      'system_constants', 'notification_templates_unified', 'experiment_variants'
    )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END;
$$;

-- =====================================================
-- HELPER VIEWS FOR ADMIN
-- =====================================================

-- View for config overview
CREATE OR REPLACE VIEW v_config_overview AS
SELECT 
  'core_app_config' as source,
  key,
  scope,
  description,
  updated_at
FROM core_app_config
UNION ALL
SELECT 
  'feature_flags' as source,
  key,
  category as scope,
  description,
  updated_at
FROM feature_flags;

-- View for i18n completion status
CREATE OR REPLACE VIEW v_i18n_completion AS
SELECT 
  key,
  COUNT(DISTINCT locale) as locale_count,
  array_agg(DISTINCT locale ORDER BY locale) as available_locales,
  MAX(updated_at) as last_updated
FROM i18n_strings
GROUP BY key;

COMMENT ON VIEW v_i18n_completion IS 'Shows translation completion status for each i18n key';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- =====================================================
-- COMPLETION
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Enterprise config system schema created successfully';
  RAISE NOTICE '📊 Created tables: core_app_config, feature_flags, design_tokens, i18n_strings';
  RAISE NOTICE '🔒 RLS policies applied using is_admin() function (no recursion)';
  RAISE NOTICE '📝 Audit logging configured';
  RAISE NOTICE '🎯 Ready for seed data';
END $$;

