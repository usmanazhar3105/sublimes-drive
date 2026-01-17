-- =====================================================
-- ENTERPRISE CONFIG SYSTEM - VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_core_app_config_count INTEGER;
  v_feature_flags_count INTEGER;
  v_design_tokens_count INTEGER;
  v_i18n_strings_count INTEGER;
  v_seo_defaults_count INTEGER;
  v_system_constants_count INTEGER;
  v_notification_templates_count INTEGER;
  v_media_assets_count INTEGER;
  v_experiment_variants_count INTEGER;
  v_audit_log_count INTEGER;
BEGIN
  -- Count records in each table
  SELECT count(*) INTO v_core_app_config_count FROM core_app_config;
  SELECT count(*) INTO v_feature_flags_count FROM feature_flags;
  SELECT count(*) INTO v_design_tokens_count FROM design_tokens;
  SELECT count(*) INTO v_i18n_strings_count FROM i18n_strings;
  SELECT count(*) INTO v_seo_defaults_count FROM seo_defaults;
  SELECT count(*) INTO v_system_constants_count FROM system_constants;
  SELECT count(*) INTO v_notification_templates_count FROM notification_templates_unified;
  SELECT count(*) INTO v_media_assets_count FROM media_assets_registry;
  SELECT count(*) INTO v_experiment_variants_count FROM experiment_variants;
  SELECT count(*) INTO v_audit_log_count FROM audit_log_enterprise;

  -- Print verification results
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ENTERPRISE CONFIG MIGRATION - VERIFICATION RESULTS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RECORD COUNTS:';
  RAISE NOTICE '';
  RAISE NOTICE 'core_app_config:              % records (Expected: 30+)', v_core_app_config_count;
  RAISE NOTICE 'feature_flags:                % records (Expected: 20+)', v_feature_flags_count;
  RAISE NOTICE 'design_tokens:                % records (Expected: 60+)', v_design_tokens_count;
  RAISE NOTICE 'i18n_strings:                 % records (Expected: 50+)', v_i18n_strings_count;
  RAISE NOTICE 'seo_defaults:                 % records (Expected: 5+)', v_seo_defaults_count;
  RAISE NOTICE 'system_constants:             % records (Expected: 14+)', v_system_constants_count;
  RAISE NOTICE 'notification_templates_unified: % records', v_notification_templates_count;
  RAISE NOTICE 'media_assets_registry:        % records', v_media_assets_count;
  RAISE NOTICE 'experiment_variants:          % records', v_experiment_variants_count;
  RAISE NOTICE 'audit_log_enterprise:         % records', v_audit_log_count;
  RAISE NOTICE '';
  
  -- Verification checks
  IF v_core_app_config_count >= 30 THEN
    RAISE NOTICE '✅ core_app_config: PASS (% >= 30)', v_core_app_config_count;
  ELSE
    RAISE WARNING '⚠️  core_app_config: FAIL (% < 30)', v_core_app_config_count;
  END IF;
  
  IF v_feature_flags_count >= 20 THEN
    RAISE NOTICE '✅ feature_flags: PASS (% >= 20)', v_feature_flags_count;
  ELSE
    RAISE WARNING '⚠️  feature_flags: FAIL (% < 20)', v_feature_flags_count;
  END IF;
  
  IF v_design_tokens_count >= 60 THEN
    RAISE NOTICE '✅ design_tokens: PASS (% >= 60)', v_design_tokens_count;
  ELSE
    RAISE WARNING '⚠️  design_tokens: FAIL (% < 60)', v_design_tokens_count;
  END IF;
  
  IF v_i18n_strings_count >= 50 THEN
    RAISE NOTICE '✅ i18n_strings: PASS (% >= 50)', v_i18n_strings_count;
  ELSE
    RAISE WARNING '⚠️  i18n_strings: FAIL (% < 50)', v_i18n_strings_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Detailed breakdown queries
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 DESIGN TOKENS BY PALETTE:';
  FOR rec IN 
    SELECT mode, palette, count(*) as token_count 
    FROM design_tokens 
    GROUP BY mode, palette 
    ORDER BY mode, palette
  LOOP
    RAISE NOTICE '  • % (%) - % tokens', rec.mode, rec.palette, rec.token_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🌍 I18N STRINGS BY LOCALE:';
  FOR rec IN 
    SELECT locale, count(*) as string_count 
    FROM i18n_strings 
    GROUP BY locale 
    ORDER BY locale
  LOOP
    RAISE NOTICE '  • % - % strings', rec.locale, rec.string_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🚩 FEATURE FLAGS BY CATEGORY:';
  FOR rec IN 
    SELECT category, count(*) as flag_count, 
           SUM(CASE WHEN enabled THEN 1 ELSE 0 END) as enabled_count
    FROM feature_flags 
    GROUP BY category 
    ORDER BY category
  LOOP
    RAISE NOTICE '  • % - % flags (% enabled)', rec.category, rec.flag_count, rec.enabled_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 SYSTEM CONSTANTS BY CATEGORY:';
  FOR rec IN 
    SELECT category, count(*) as constant_count
    FROM system_constants
    GROUP BY category
    ORDER BY category
  LOOP
    RAISE NOTICE '  • % - % constants', rec.category, rec.constant_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ALL VERIFICATION QUERIES COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

