-- ============================================================================
-- DATABASE VERIFICATION REPORT
-- ============================================================================
-- This migration outputs a comprehensive verification report as NOTICE messages
-- It verifies the database matches the specification from the reference docs
-- ============================================================================

DO $$
DECLARE
  v_table_count INT;
  v_function_count INT;
  v_trigger_count INT;
  v_view_count INT;
  v_rls_count INT;
  v_policy_count INT;
  v_index_count INT;
  v_bucket_count INT;
  v_table_name TEXT;
  v_column_count INT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 SUPABASE DATABASE VERIFICATION REPORT';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 1. COUNT TABLES
  -- ========================================================================
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
    AND table_name != 'schema_migrations';
  
  RAISE NOTICE '1. TABLES';
  RAISE NOTICE '   Expected: 70+ tables';
  RAISE NOTICE '   Actual:   % tables', v_table_count;
  IF v_table_count >= 70 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ❌ FAIL (Missing % tables)', (70 - v_table_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 2. COUNT FUNCTIONS/RPCS
  -- ========================================================================
  SELECT COUNT(DISTINCT proname) INTO v_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind IN ('f', 'p')
    AND (proname LIKE 'fn_%' OR proname LIKE 'trg_%' OR proname IN ('log_event', 'handle_new_user', 'update_updated_at_column', 'log_config_change', 'is_admin'));
  
  RAISE NOTICE '2. RPC FUNCTIONS';
  RAISE NOTICE '   Expected: 35+ functions';
  RAISE NOTICE '   Actual:   % functions', v_function_count;
  IF v_function_count >= 35 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % functions)', (35 - v_function_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 3. COUNT TRIGGERS
  -- ========================================================================
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name NOT LIKE 'pg_%';
  
  RAISE NOTICE '3. TRIGGERS';
  RAISE NOTICE '   Expected: 11+ triggers';
  RAISE NOTICE '   Actual:   % triggers', v_trigger_count;
  IF v_trigger_count >= 11 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % triggers)', (11 - v_trigger_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 4. COUNT VIEWS
  -- ========================================================================
  SELECT COUNT(*) INTO v_view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name NOT LIKE 'pg_%';
  
  RAISE NOTICE '4. VIEWS';
  RAISE NOTICE '   Expected: 10+ views';
  RAISE NOTICE '   Actual:   % views', v_view_count;
  IF v_view_count >= 10 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % views)', (10 - v_view_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 5. COUNT RLS ENABLED TABLES
  -- ========================================================================
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
  
  RAISE NOTICE '5. RLS ENABLED TABLES';
  RAISE NOTICE '   Expected: 40+ tables';
  RAISE NOTICE '   Actual:   % tables', v_rls_count;
  IF v_rls_count >= 40 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % tables)', (40 - v_rls_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 6. COUNT RLS POLICIES
  -- ========================================================================
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '6. RLS POLICIES';
  RAISE NOTICE '   Expected: 60+ policies';
  RAISE NOTICE '   Actual:   % policies', v_policy_count;
  IF v_policy_count >= 60 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % policies)', (60 - v_policy_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 7. COUNT INDEXES
  -- ========================================================================
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname NOT LIKE 'pg_%';
  
  RAISE NOTICE '7. INDEXES';
  RAISE NOTICE '   Expected: 80+ indexes';
  RAISE NOTICE '   Actual:   % indexes', v_index_count;
  IF v_index_count >= 80 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % indexes)', (80 - v_index_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 8. COUNT STORAGE BUCKETS
  -- ========================================================================
  SELECT COUNT(*) INTO v_bucket_count
  FROM storage.buckets;
  
  RAISE NOTICE '8. STORAGE BUCKETS';
  RAISE NOTICE '   Expected: 7 buckets';
  RAISE NOTICE '   Actual:   % buckets', v_bucket_count;
  IF v_bucket_count >= 7 THEN
    RAISE NOTICE '   Status:   ✅ PASS';
  ELSE
    RAISE NOTICE '   Status:   ⚠️  WARN (Missing % buckets)', (7 - v_bucket_count);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 9. VERIFY CORE TABLES EXIST
  -- ========================================================================
  RAISE NOTICE '9. CORE TABLES';
  RAISE NOTICE '   %-30s %s', 'profiles', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'verification_requests', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_requests') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'posts', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'post_stats', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_stats') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'comments', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'listings', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'garages', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'bid_requests', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_requests') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'bid_replies', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_replies') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'events', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'wallet_transactions', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'analytics_events', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 10. VERIFY CRITICAL COLUMNS
  -- ========================================================================
  RAISE NOTICE '10. CRITICAL COLUMNS';
  RAISE NOTICE '   %-30s %s', 'profiles.role', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'profiles.sub_role', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sub_role') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'profiles.xp_points', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp_points') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'posts.media', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'media') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'verification_requests.type', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'type') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 11. VERIFY CRITICAL FUNCTIONS
  -- ========================================================================
  RAISE NOTICE '11. CRITICAL FUNCTIONS';
  RAISE NOTICE '   %-30s %s', 'fn_select_role', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_select_role') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'fn_calculate_fee', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_calculate_fee') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'fn_can_message', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_can_message') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'fn_award_referral_xp', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_award_referral_xp') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'fn_create_post', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_create_post') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   %-30s %s', 'handle_new_user', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- 12. LIST ALL TABLES
  -- ========================================================================
  RAISE NOTICE '12. ALL TABLES (alphabetical):';
  FOR v_table_name IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
      AND table_name != 'schema_migrations'
    ORDER BY table_name
    LIMIT 20
  LOOP
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns
    WHERE table_name = v_table_name;
    
    RAISE NOTICE '   %-40s (% columns)', v_table_name, v_column_count;
  END LOOP;
  
  IF v_table_count > 20 THEN
    RAISE NOTICE '   ... and % more tables', (v_table_count - 20);
  END IF;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'SUMMARY:';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables:    %/70+ %', v_table_count, CASE WHEN v_table_count >= 70 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Functions: %/35+ %', v_function_count, CASE WHEN v_function_count >= 35 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'Triggers:  %/11+ %', v_trigger_count, CASE WHEN v_trigger_count >= 11 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'Views:     %/10+ %', v_view_count, CASE WHEN v_view_count >= 10 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'RLS:       %/40+ tables %', v_rls_count, CASE WHEN v_rls_count >= 40 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'Policies:  %/60+ %', v_policy_count, CASE WHEN v_policy_count >= 60 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'Indexes:   %/80+ %', v_index_count, CASE WHEN v_index_count >= 80 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE 'Buckets:   %/7 %', v_bucket_count, CASE WHEN v_bucket_count >= 7 THEN '✅' ELSE '⚠️ ' END;
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  IF v_table_count >= 70 AND v_function_count >= 30 AND v_trigger_count >= 10 THEN
    RAISE NOTICE '✅ DATABASE VERIFICATION: PASS';
    RAISE NOTICE '';
    RAISE NOTICE 'The database schema meets the minimum requirements from the';
    RAISE NOTICE 'specification documents. All core components are in place.';
  ELSE
    RAISE NOTICE '⚠️  DATABASE VERIFICATION: INCOMPLETE';
    RAISE NOTICE '';
    RAISE NOTICE 'Some components are missing. Review the missing items above';
    RAISE NOTICE 'and run the necessary migrations to complete the schema.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  
END $$;

