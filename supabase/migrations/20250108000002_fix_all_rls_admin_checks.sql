-- Comprehensive RLS Fix - Remove ALL admin checks from RLS policies
-- Date: 2025-01-08
-- Priority: CRITICAL
-- 
-- This migration removes admin role checks from RLS policies to prevent recursion.
-- Admin access will be handled in the application layer only.

-- ============================================================================
-- 1. POST_SAVES (Already fixed in 20250108000000, but ensure it's correct)
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all saves" ON public.post_saves;

-- ============================================================================
-- 2. POST_LIKES / COMMUNITY_POST_LIKES
-- ============================================================================

-- Drop admin policies
DROP POLICY IF EXISTS "Admin can manage all likes" ON public.post_likes;
DROP POLICY IF EXISTS "Admin can manage all likes" ON public.community_post_likes;

-- ============================================================================
-- 3. COMMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all comments" ON public.comments;
DROP POLICY IF EXISTS "Admin can delete any comment" ON public.comments;

-- ============================================================================
-- 4. POSTS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can delete all posts" ON public.posts;

-- ============================================================================
-- 5. LISTINGS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all listings" ON public.listings;
DROP POLICY IF EXISTS "Admin can view all listings" ON public.listings;

-- ============================================================================
-- 6. GARAGES
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all garages" ON public.garages;
DROP POLICY IF EXISTS "Admin can view all garages" ON public.garages;

-- ============================================================================
-- 7. EVENTS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admin can view all events" ON public.events;

-- ============================================================================
-- 8. OFFERS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all offers" ON public.offers;
DROP POLICY IF EXISTS "Admin can view all offers" ON public.offers;

-- ============================================================================
-- 9. VERIFICATION REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admin can view all verification requests" ON public.verification_requests;

-- ============================================================================
-- 10. REPORTS
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all reports" ON public.post_reports;
DROP POLICY IF EXISTS "Admin can view all reports" ON public.post_reports;
DROP POLICY IF EXISTS "Admin can manage all reports" ON public.comment_reports;
DROP POLICY IF EXISTS "Admin can view all reports" ON public.comment_reports;

-- ============================================================================
-- NOTE: Admin access must be handled in application layer
-- ============================================================================
-- 
-- To check if a user is admin in your application code:
-- 
-- ```typescript
-- const { data: profile } = await supabase
--   .from('profiles')
--   .select('role')
--   .eq('id', user.id)
--   .single();
-- 
-- if (profile?.role === 'admin' || profile?.role === 'editor') {
--   // Admin actions
-- }
-- ```
-- 
-- For admin operations that need full database access, use the service_role key
-- in server-side code (Edge Functions, API routes, etc.)


