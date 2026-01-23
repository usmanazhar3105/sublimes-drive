-- ============================================================================
-- VERIFY INDEX AND QUERY PERFORMANCE
-- ============================================================================

-- Check if index exists
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname = 'idx_profiles_role' THEN '✅ Index exists'
        ELSE 'Index: ' || indexname
    END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND indexname = 'idx_profiles_role';

-- ============================================================================
-- EXPLANATION OF QUERY PLAN
-- ============================================================================

-- Your query plan shows:
-- - Sequential Scan (Seq Scan) instead of Index Scan
-- - Execution Time: 0.049 ms (very fast!)
--
-- Why Sequential Scan?
-- 1. Small table size - PostgreSQL optimizer chooses seq scan for small tables
-- 2. Sequential scan can be faster than index scan for small datasets
-- 3. The index exists but optimizer decided seq scan is better
--
-- This is NORMAL and OPTIMAL for small tables!
-- As your table grows, PostgreSQL will automatically use the index.

-- ============================================================================
-- TEST WITH LARGER DATASET (to see index usage)
-- ============================================================================

-- Force index usage hint (PostgreSQL will use it if beneficial)
EXPLAIN ANALYZE
SELECT 
    id,
    email,
    role,
    system_role
FROM public.profiles
WHERE role = 'browser'
ORDER BY created_at DESC
LIMIT 100;

-- If you have many rows, you should see "Index Scan using idx_profiles_role"

-- ============================================================================
-- VERIFY INDEX IS WORKING (check index statistics)
-- ============================================================================

SELECT 
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname = 'profiles'
  AND indexrelname = 'idx_profiles_role';

-- This shows how many times the index has been used
-- If idx_scan > 0, the index is being used

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- ✅ Your query is working correctly
-- ✅ Execution time is excellent (0.049 ms)
-- ✅ Sequential scan is optimal for small tables
-- ✅ Index will be used automatically as table grows
--
-- No action needed - everything is working perfectly! 🎉




