-- Verification
DO $$ 
DECLARE
  config_count INTEGER;
  flags_count INTEGER;
  tokens_count INTEGER;
  i18n_count INTEGER;
BEGIN
  SELECT count(*) INTO config_count FROM core_app_config;
  SELECT count(*) INTO flags_count FROM feature_flags;
  SELECT count(*) INTO tokens_count FROM design_tokens;
  SELECT count(*) INTO i18n_count FROM i18n_strings;

  RAISE NOTICE '✅ Config: % rows', config_count;
  RAISE NOTICE '✅ Flags: % rows', flags_count;
  RAISE NOTICE '✅ Tokens: % rows', tokens_count;
  RAISE NOTICE '✅ i18n: % rows', i18n_count;
  
  IF config_count >= 15 AND flags_count >= 20 AND tokens_count >= 60 AND i18n_count >= 50 THEN
    RAISE NOTICE '✅ ALL CHECKS PASSED';
  ELSE
    RAISE WARNING '⚠️ INCOMPLETE';
  END IF;
END $$;

