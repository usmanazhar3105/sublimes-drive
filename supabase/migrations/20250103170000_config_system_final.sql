-- Config System Schema
CREATE TABLE IF NOT EXISTS core_app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'string',
  is_secret BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_core_app_config_scope ON core_app_config(scope);
CREATE INDEX IF NOT EXISTS idx_core_app_config_updated_at ON core_app_config(updated_at DESC);

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  targeting JSONB DEFAULT '{}'::JSONB,
  environment TEXT DEFAULT 'production',
  category TEXT DEFAULT 'general',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

CREATE TABLE IF NOT EXISTS design_tokens (
  token TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'light',
  palette TEXT DEFAULT 'default',
  value TEXT NOT NULL,
  group_name TEXT NOT NULL,
  subgroup TEXT,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (token, mode, palette)
);

CREATE INDEX IF NOT EXISTS idx_design_tokens_group ON design_tokens(group_name, subgroup);
CREATE INDEX IF NOT EXISTS idx_design_tokens_mode_palette ON design_tokens(mode, palette);

CREATE TABLE IF NOT EXISTS i18n_strings (
  key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  text TEXT NOT NULL,
  context JSONB DEFAULT '{}'::JSONB,
  category TEXT DEFAULT 'general',
  is_html BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (key, locale)
);

CREATE INDEX IF NOT EXISTS idx_i18n_strings_locale ON i18n_strings(locale);
CREATE INDEX IF NOT EXISTS idx_i18n_strings_category ON i18n_strings(category);
CREATE INDEX IF NOT EXISTS idx_i18n_strings_key_search ON i18n_strings USING gin(to_tsvector('english', key || ' ' || text));

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(purpose, bucket)
);

CREATE INDEX IF NOT EXISTS idx_media_assets_purpose ON media_assets(purpose);
CREATE INDEX IF NOT EXISTS idx_media_assets_bucket ON media_assets(bucket);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON media_assets(mime_type);

CREATE TABLE IF NOT EXISTS experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_key TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  traffic_allocation INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_key, variant_name)
);

CREATE INDEX IF NOT EXISTS idx_experiment_variants_key ON experiment_variants(experiment_key);
CREATE INDEX IF NOT EXISTS idx_experiment_variants_active ON experiment_variants(is_active);

CREATE TABLE IF NOT EXISTS system_constants (
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  label JSONB NOT NULL DEFAULT '{}'::JSONB,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::JSONB,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (category, key)
);

CREATE INDEX IF NOT EXISTS idx_system_constants_category ON system_constants(category);
CREATE INDEX IF NOT EXISTS idx_system_constants_active ON system_constants(is_active);

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::JSONB,
  category TEXT DEFAULT 'transactional',
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_key, locale, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON notification_templates(channel);

-- RLS POLICIES (using is_admin() - no recursion)
ALTER TABLE core_app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read non-secret config" ON core_app_config;
CREATE POLICY "Anyone can read non-secret config" ON core_app_config FOR SELECT USING (is_secret = FALSE OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Only admins can write config" ON core_app_config;
CREATE POLICY "Only admins can write config" ON core_app_config FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Only admins can manage feature flags" ON feature_flags;
CREATE POLICY "Only admins can manage feature flags" ON feature_flags FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read design tokens" ON design_tokens;
CREATE POLICY "Anyone can read design tokens" ON design_tokens FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Only admins can manage design tokens" ON design_tokens;
CREATE POLICY "Only admins can manage design tokens" ON design_tokens FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE i18n_strings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read i18n strings" ON i18n_strings;
CREATE POLICY "Anyone can read i18n strings" ON i18n_strings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Only admins can manage i18n strings" ON i18n_strings;
CREATE POLICY "Only admins can manage i18n strings" ON i18n_strings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read public media assets" ON media_assets;
CREATE POLICY "Anyone can read public media assets" ON media_assets FOR SELECT USING (is_public = TRUE OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Only admins can manage media assets" ON media_assets;
CREATE POLICY "Only admins can manage media assets" ON media_assets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE system_constants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active system constants" ON system_constants;
CREATE POLICY "Anyone can read active system constants" ON system_constants FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Only admins can manage system constants" ON system_constants;
CREATE POLICY "Only admins can manage system constants" ON system_constants FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active templates" ON notification_templates;
CREATE POLICY "Anyone can read active templates" ON notification_templates FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Only admins can manage templates" ON notification_templates;
CREATE POLICY "Only admins can manage templates" ON notification_templates FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active experiments" ON experiment_variants;
CREATE POLICY "Anyone can read active experiments" ON experiment_variants FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Only admins can manage experiments" ON experiment_variants;
CREATE POLICY "Only admins can manage experiments" ON experiment_variants FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Views
CREATE OR REPLACE VIEW v_config_overview AS
SELECT 'core_app_config' as source, key, scope, description, updated_at FROM core_app_config
UNION ALL
SELECT 'feature_flags' as source, key, category as scope, description, updated_at FROM feature_flags;

CREATE OR REPLACE VIEW v_i18n_completion AS
SELECT key, COUNT(DISTINCT locale) as locale_count, array_agg(DISTINCT locale ORDER BY locale) as available_locales, MAX(updated_at) as last_updated
FROM i18n_strings GROUP BY key;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

