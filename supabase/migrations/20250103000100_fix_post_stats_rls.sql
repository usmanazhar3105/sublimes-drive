-- Migration: Fix post_stats RLS Policies
-- Date: 2025-01-03
-- Purpose: Add RLS policies for post_stats to allow trigger functions to write

-- Drop existing policies if any
DROP POLICY IF EXISTS "post_stats_public_read" ON public.post_stats;
DROP POLICY IF EXISTS "post_stats_system_write" ON public.post_stats;

-- Public can read post_stats
CREATE POLICY "post_stats_public_read"
  ON public.post_stats FOR SELECT
  USING (true);

-- Allow authenticated users to manage their post stats
-- (This enables triggers and RPC functions to work)
CREATE POLICY "post_stats_system_write"
  ON public.post_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_stats.post_id
      AND posts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_stats.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Add a permissive policy for SECURITY DEFINER functions
-- This allows trigger functions to bypass RLS
CREATE POLICY "post_stats_function_access"
  ON public.post_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "post_stats_function_access" ON public.post_stats 
  IS 'Allows SECURITY DEFINER functions (triggers, RPCs) to manage post_stats';

