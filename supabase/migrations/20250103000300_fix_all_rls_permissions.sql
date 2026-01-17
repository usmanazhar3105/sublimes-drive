-- Migration: Fix All RLS Permissions
-- Date: 2025-01-03
-- Purpose: Grant proper permissions for all system tables to prevent 401/403 errors

-- ============================================================================
-- 1. POST_STATS - System managed table, needs permissive access
-- ============================================================================

-- Ensure RLS is disabled on post_stats (system-managed table)
ALTER TABLE IF EXISTS public.post_stats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "post_stats_public_read" ON public.post_stats;
DROP POLICY IF EXISTS "post_stats_system_write" ON public.post_stats;
DROP POLICY IF EXISTS "post_stats_function_access" ON public.post_stats;

-- Grant full permissions to authenticated and anon users
GRANT ALL ON public.post_stats TO authenticated;
GRANT ALL ON public.post_stats TO anon;

-- ============================================================================
-- 2. REFERRALS - Fix permission errors
-- ============================================================================

-- Ensure table exists and has proper RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals') THEN
    -- Enable RLS
    ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "referrals_public_read" ON public.referrals;
    DROP POLICY IF EXISTS "referrals_user_crud" ON public.referrals;
    
    -- Allow public read
    CREATE POLICY "referrals_public_read"
      ON public.referrals FOR SELECT
      USING (true);
    
    -- Users can manage their own referrals
    CREATE POLICY "referrals_user_crud"
      ON public.referrals FOR ALL
      USING (auth.uid() = referrer_id OR auth.uid() = referred_id)
      WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;
END
$$;

-- ============================================================================
-- 3. PROFILES - Ensure proper access
-- ============================================================================

-- Drop and recreate policies for profiles
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;

-- Public can read all profiles
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_user_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for first-time setup)
DROP POLICY IF EXISTS "profiles_user_insert" ON public.profiles;
CREATE POLICY "profiles_user_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. POSTS - Ensure proper CRUD access
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
DROP POLICY IF EXISTS "posts_user_crud" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_update" ON public.posts;
DROP POLICY IF EXISTS "posts_delete" ON public.posts;

-- Public can read all posts
CREATE POLICY "posts_public_read"
  ON public.posts FOR SELECT
  USING (true);

-- Authenticated users can insert posts
CREATE POLICY "posts_insert"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "posts_update"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "posts_delete"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. WALLET TABLES - Ensure proper permissions
-- ============================================================================

-- wallet_balance
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_balance') THEN
    ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "wallet_balance_owner_read" ON public.wallet_balance;
    DROP POLICY IF EXISTS "wallet_balance_owner_update" ON public.wallet_balance;
    
    -- Users can read their own wallet balance
    CREATE POLICY "wallet_balance_owner_read"
      ON public.wallet_balance FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Users can update their own balance (for top-ups)
    CREATE POLICY "wallet_balance_owner_update"
      ON public.wallet_balance FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- wallet_transactions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
    ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "wallet_transactions_owner_read" ON public.wallet_transactions;
    DROP POLICY IF EXISTS "wallet_transactions_insert" ON public.wallet_transactions;
    
    -- Users can read their own transactions
    CREATE POLICY "wallet_transactions_owner_read"
      ON public.wallet_transactions FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Users can insert transactions
    CREATE POLICY "wallet_transactions_insert"
      ON public.wallet_transactions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================================================
-- 6. Grant sequence permissions
-- ============================================================================

-- Grant usage on all sequences to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Migration complete: Fix all RLS permission errors - grant proper access to system tables and user tables

