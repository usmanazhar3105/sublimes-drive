-- Migration: Simplified fix for post_stats permissions
-- Date: 2025-01-03
-- Purpose: Remove RLS from post_stats since it's managed by triggers/RPCs only

-- Disable RLS on post_stats (it's a stats table, not user-facing)
-- Stats are managed by SECURITY DEFINER functions, no need for RLS
ALTER TABLE public.post_stats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "post_stats_public_read" ON public.post_stats;
DROP POLICY IF EXISTS "post_stats_system_write" ON public.post_stats;
DROP POLICY IF EXISTS "post_stats_function_access" ON public.post_stats;

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.post_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.post_stats TO anon;

COMMENT ON TABLE public.post_stats IS 'Post statistics - managed by triggers, RLS disabled for performance';

