-- Fixed RLS policies using profiles table directly
DROP POLICY IF EXISTS "Anyone can read non-secret config" ON core_app_config;
DROP POLICY IF EXISTS "Only admins can write config" ON core_app_config;
CREATE POLICY "Anyone can read non-secret config" ON core_app_config FOR SELECT USING (is_secret = FALSE);
CREATE POLICY "Authenticated can read all config" ON core_app_config FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Only admins can write config" ON core_app_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Only admins can manage feature flags" ON feature_flags;
CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage feature flags" ON feature_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read design tokens" ON design_tokens;
DROP POLICY IF EXISTS "Only admins can manage design tokens" ON design_tokens;
CREATE POLICY "Anyone can read design tokens" ON design_tokens FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage design tokens" ON design_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read i18n strings" ON i18n_strings;
DROP POLICY IF EXISTS "Only admins can manage i18n strings" ON i18n_strings;
CREATE POLICY "Anyone can read i18n strings" ON i18n_strings FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage i18n strings" ON i18n_strings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read public media assets" ON media_assets;
DROP POLICY IF EXISTS "Only admins can manage media assets" ON media_assets;
CREATE POLICY "Anyone can read public media assets" ON media_assets FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Authenticated can read all media" ON media_assets FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Only admins can manage media assets" ON media_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read SEO defaults" ON seo_defaults;
DROP POLICY IF EXISTS "Only admins can manage SEO defaults" ON seo_defaults;
CREATE POLICY "Anyone can read SEO defaults" ON seo_defaults FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage SEO defaults" ON seo_defaults FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Skip audit_log if it doesn't exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Only admins can read audit log" ON audit_log';
    EXECUTE 'DROP POLICY IF EXISTS "System can insert audit log" ON audit_log';
    EXECUTE 'CREATE POLICY "Only admins can read audit log" ON audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin''))';
    EXECUTE 'CREATE POLICY "System can insert audit log" ON audit_log FOR INSERT WITH CHECK (TRUE)';
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can read active system constants" ON system_constants;
DROP POLICY IF EXISTS "Only admins can manage system constants" ON system_constants;
CREATE POLICY "Anyone can read active system constants" ON system_constants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Only admins can manage system constants" ON system_constants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read active templates" ON notification_templates;
DROP POLICY IF EXISTS "Only admins can manage templates" ON notification_templates;
CREATE POLICY "Anyone can read active templates" ON notification_templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Only admins can manage templates" ON notification_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can read active experiments" ON experiment_variants;
DROP POLICY IF EXISTS "Only admins can manage experiments" ON experiment_variants;
CREATE POLICY "Anyone can read active experiments" ON experiment_variants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Only admins can manage experiments" ON experiment_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

