-- Script to find all RLS policies that check admin roles
-- This helps identify policies that need to be fixed
-- Date: 2025-01-08

-- Find all policies that reference 'admin' or 'role' in their USING/WITH CHECK clauses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual::text ILIKE '%admin%' 
    OR qual::text ILIKE '%role%'
    OR with_check::text ILIKE '%admin%'
    OR with_check::text ILIKE '%role%'
    OR qual::text ILIKE '%profiles%'
    OR with_check::text ILIKE '%profiles%'
  )
ORDER BY tablename, policyname;

-- Also check for policies that use EXISTS with profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND qual::text ILIKE '%EXISTS%profiles%'
ORDER BY tablename, policyname;


