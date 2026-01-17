-- ============================================================================
-- FIX COLUMN NAMES - Align with existing schema
-- Date: 2025-01-03
-- Purpose: Add missing columns to existing tables or create column aliases
-- ============================================================================

-- Fix market_listings to have both user_id and owner_id for compatibility
DO $$
BEGIN
  -- If table has owner_id but not user_id, add alias
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_listings' AND column_name = 'owner_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_listings' AND column_name = 'user_id'
  ) THEN
    -- Create a view or just note that we should use owner_id
    RAISE NOTICE 'market_listings uses owner_id';
  END IF;
  
  -- If table has user_id but not owner_id, we're good
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_listings' AND column_name = 'user_id'
  ) THEN
    RAISE NOTICE 'market_listings uses user_id';
  END IF;
END $$;

-- Fix bid_wallet to have user_id if it has garage_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallet') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bid_wallet' AND column_name = 'user_id'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bid_wallet' AND column_name = 'garage_id'
    ) THEN
      ALTER TABLE public.bid_wallet ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);
      -- Copy garage_id to user_id if needed
      UPDATE public.bid_wallet SET user_id = garage_id WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- Add referral_code to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
    -- Generate referral codes for existing users
    UPDATE public.profiles SET referral_code = LOWER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 8)) WHERE referral_code IS NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referrals_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referrals_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to audit_logs if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
    ALTER TABLE public.audit_logs ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type') THEN
    ALTER TABLE public.audit_logs ADD COLUMN entity_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'details') THEN
    ALTER TABLE public.audit_logs ADD COLUMN details JSONB;
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Column compatibility checks complete';
END $$;

