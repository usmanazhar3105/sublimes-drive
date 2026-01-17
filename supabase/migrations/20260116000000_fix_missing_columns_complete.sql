-- ============================================================================
-- FIX ALL MISSING COLUMNS AND DATABASE ERRORS
-- Migration: 20260116000000_fix_missing_columns_complete.sql
-- Purpose: Add missing columns causing HTTP 400 and 406 errors
-- ============================================================================

-- ============================================================================
-- 1. FIX PROFILES TABLE - Add Missing Columns
-- ============================================================================

-- Add wallet_balance if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'wallet_balance'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN wallet_balance NUMERIC(10,2) DEFAULT 0 CHECK (wallet_balance >= 0);
    CREATE INDEX IF NOT EXISTS idx_profiles_wallet_balance ON public.profiles(wallet_balance);
    COMMENT ON COLUMN public.profiles.wallet_balance IS 'User wallet balance for payments and credits';
  END IF;
END $$;

-- Add bid_wallet_balance if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bid_wallet_balance'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bid_wallet_balance NUMERIC(10,2) DEFAULT 0 CHECK (bid_wallet_balance >= 0);
    CREATE INDEX IF NOT EXISTS idx_profiles_bid_wallet_balance ON public.profiles(bid_wallet_balance);
    COMMENT ON COLUMN public.profiles.bid_wallet_balance IS 'Garage owner bid wallet balance';
  END IF;
END $$;

-- Add display_name if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
    COMMENT ON COLUMN public.profiles.display_name IS 'User display name for UI';
    
    -- Populate display_name from full_name for existing users
    UPDATE public.profiles 
    SET display_name = COALESCE(full_name, username, email) 
    WHERE display_name IS NULL;
  END IF;
END $$;

-- Add verification_status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'pending' 
      CHECK (verification_status IN ('pending', 'approved', 'rejected'));
    CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
  END IF;
END $$;

-- Add car_owner_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'car_owner_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN car_owner_verified BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_profiles_car_owner_verified ON public.profiles(car_owner_verified);
  END IF;
END $$;

-- Add garage_owner_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'garage_owner_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN garage_owner_verified BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_profiles_garage_owner_verified ON public.profiles(garage_owner_verified);
  END IF;
END $$;

-- ============================================================================
-- 2. FIX POST_SAVES TABLE - Ensure it exists with correct schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_saves_post_id_fkey'
  ) THEN
    ALTER TABLE public.post_saves 
    ADD CONSTRAINT post_saves_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_saves_user_id_fkey'
  ) THEN
    ALTER TABLE public.post_saves 
    ADD CONSTRAINT post_saves_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes for post_saves
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_post ON public.post_saves(user_id, post_id);

-- ============================================================================
-- 3. FIX MARKET_LISTINGS vs MARKETPLACE_LISTINGS
-- ============================================================================

-- Ensure marketplace_listings exists (not market_listings)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'AED',
  category TEXT,
  condition TEXT,
  images TEXT[],
  thumbnail_url TEXT,
  location TEXT,
  emirate TEXT,
  is_active BOOLEAN DEFAULT true,
  is_boosted BOOLEAN DEFAULT false,
  boost_package TEXT,
  boost_expires_at TIMESTAMPTZ,
  boost_payment_id TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON public.marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_is_boosted ON public.marketplace_listings(is_boosted);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);

-- ============================================================================
-- 4. FIX WALLET_TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'topup', 'purchase', 'refund', 'bid')),
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  balance_after NUMERIC(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);

-- ============================================================================
-- 5. FIX GARAGES TABLE - Add missing columns
-- ============================================================================

-- Add display_name to profiles reference (already done above)

-- Ensure garages table has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'garages' 
    AND column_name = 'is_boosted'
  ) THEN
    ALTER TABLE public.garages ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'garages' 
    AND column_name = 'boost_level'
  ) THEN
    ALTER TABLE public.garages ADD COLUMN boost_level TEXT CHECK (boost_level IN ('bronze', 'silver', 'gold', 'platinum'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'garages' 
    AND column_name = 'boost_expires_at'
  ) THEN
    ALTER TABLE public.garages ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 6. FIX RLS POLICIES FOR POST_SAVES
-- ============================================================================

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS post_saves_select ON public.post_saves;
DROP POLICY IF EXISTS post_saves_insert ON public.post_saves;
DROP POLICY IF EXISTS post_saves_delete ON public.post_saves;

-- Create new policies (no admin checks)
CREATE POLICY post_saves_select ON public.post_saves
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY post_saves_insert ON public.post_saves
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY post_saves_delete ON public.post_saves
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. FIX RLS POLICIES FOR PROFILES (Read Access)
-- ============================================================================

-- Drop and recreate select policy to allow proper filtering
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;

CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT TO authenticated
  USING (
    -- Allow users to read their own profile
    auth.uid() = id
    OR
    -- Allow reading public profile data (display_name, avatar_url, etc.)
    true
  );

-- ============================================================================
-- 8. FIX RLS POLICIES FOR MARKETPLACE_LISTINGS
-- ============================================================================

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS marketplace_listings_select ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_insert ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_update ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_delete ON public.marketplace_listings;

-- Create new policies
CREATE POLICY marketplace_listings_select ON public.marketplace_listings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY marketplace_listings_insert ON public.marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY marketplace_listings_update ON public.marketplace_listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY marketplace_listings_delete ON public.marketplace_listings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. FIX RLS POLICIES FOR WALLET_TRANSACTIONS
-- ============================================================================

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallet_transactions_select ON public.wallet_transactions;
DROP POLICY IF EXISTS wallet_transactions_insert ON public.wallet_transactions;

CREATE POLICY wallet_transactions_select ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY wallet_transactions_insert ON public.wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. FIX RLS POLICIES FOR GARAGES
-- ============================================================================

-- Ensure garages has proper RLS
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS garages_select ON public.garages;
DROP POLICY IF EXISTS garages_insert ON public.garages;
DROP POLICY IF EXISTS garages_update ON public.garages;

CREATE POLICY garages_select ON public.garages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY garages_insert ON public.garages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY garages_update ON public.garages
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- 11. GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.post_saves TO authenticated;
GRANT ALL ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.garages TO authenticated;

-- Service role gets full access
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.post_saves TO service_role;
GRANT ALL ON public.marketplace_listings TO service_role;
GRANT ALL ON public.wallet_transactions TO service_role;
GRANT ALL ON public.garages TO service_role;

-- ============================================================================
-- 12. UPDATE HANDLE_NEW_USER TRIGGER TO SET display_name
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_display_name TEXT;
  v_default_role TEXT := 'user';
BEGIN
  -- Extract full_name from metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Extract or generate display_name
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    v_full_name
  );

  -- Determine default role
  IF NEW.email LIKE '%@sublimesdrive.com%' OR NEW.email = 'sublimesdrive@gmail.com' THEN
    v_default_role := 'admin';
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    username,
    phone,
    role,
    avatar_url,
    wallet_balance,
    bid_wallet_balance,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_display_name,
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
    NEW.raw_user_meta_data->>'phone',
    v_default_role,
    NEW.raw_user_meta_data->>'avatar_url',
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 13. CREATE VERIFICATION VIEW FOR DEBUGGING
-- ============================================================================

CREATE OR REPLACE VIEW public.v_missing_columns_check AS
SELECT
  'profiles.wallet_balance' AS column_name,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='wallet_balance') AS exists,
  'Wallet balance for payments' AS description
UNION ALL
SELECT
  'profiles.bid_wallet_balance',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bid_wallet_balance'),
  'Bid wallet balance for garage owners'
UNION ALL
SELECT
  'profiles.display_name',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='display_name'),
  'Display name for UI'
UNION ALL
SELECT
  'post_saves table',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='post_saves'),
  'Table for saved posts'
UNION ALL
SELECT
  'marketplace_listings table',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='marketplace_listings'),
  'Table for marketplace listings'
UNION ALL
SELECT
  'wallet_transactions table',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wallet_transactions'),
  'Table for wallet transactions';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check the results
SELECT * FROM public.v_missing_columns_check;

-- ============================================================================
-- DONE
-- ============================================================================

-- Migration Summary:
-- Fixes all missing columns causing HTTP 400/406 errors:
-- - wallet_balance, bid_wallet_balance, display_name in profiles table
-- - Creates/fixes post_saves, marketplace_listings, wallet_transactions tables
-- - Ensures proper RLS policies without admin role checks
-- - Updates handle_new_user trigger to set display_name

