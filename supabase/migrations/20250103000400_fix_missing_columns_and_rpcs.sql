-- Migration: Fix Missing Columns and RPC Functions
-- Date: 2025-01-03
-- Purpose: Fix 404 and 400 errors by creating missing columns and RPC functions

-- ============================================================================
-- 1. FIX XP_EVENTS TABLE - Add missing 'type' column
-- ============================================================================

-- Check if xp_events table exists and add 'type' column if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'xp_events') THEN
    -- Add 'type' column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'xp_events' AND column_name = 'type'
    ) THEN
      ALTER TABLE public.xp_events ADD COLUMN type TEXT DEFAULT 'general';
      COMMENT ON COLUMN public.xp_events.type IS 'Type of XP event: general, referral_reward, daily_challenge, post_approved, etc.';
    END IF;
    
    -- Add 'event_type' column as alias if needed (some code might use event_type)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'xp_events' AND column_name = 'event_type'
    ) THEN
      ALTER TABLE public.xp_events ADD COLUMN event_type TEXT;
      COMMENT ON COLUMN public.xp_events.event_type IS 'Alias for type column for backward compatibility';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. FIX WALLET_TRANSACTIONS TABLE - Add missing columns
-- ============================================================================

-- Check if wallet_transactions table exists and add missing columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
    -- Add 'ref_type' column if it doesn't exist (alias for 'source')
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' AND column_name = 'ref_type'
    ) THEN
      ALTER TABLE public.wallet_transactions ADD COLUMN ref_type TEXT;
      COMMENT ON COLUMN public.wallet_transactions.ref_type IS 'Reference type: referral, stripe, refund, admin, bid_acceptance (same as source)';
      
      -- Copy existing 'source' values to 'ref_type' if source column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' AND column_name = 'source'
      ) THEN
        UPDATE public.wallet_transactions SET ref_type = source WHERE ref_type IS NULL;
      END IF;
    END IF;
    
    -- Ensure 'type' column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' AND column_name = 'type'
    ) THEN
      ALTER TABLE public.wallet_transactions ADD COLUMN type TEXT DEFAULT 'credit' CHECK (type IN ('credit', 'debit', 'refund'));
    END IF;
    
    -- Ensure 'amount_cents' column exists (some code uses amount, some uses amount_cents)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' AND column_name = 'amount_cents'
    ) THEN
      -- If 'amount' column exists, create amount_cents as computed or copy
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' AND column_name = 'amount'
      ) THEN
        ALTER TABLE public.wallet_transactions ADD COLUMN amount_cents INTEGER;
        -- Copy amount to amount_cents (multiply by 100 if decimal)
        UPDATE public.wallet_transactions SET amount_cents = ROUND(amount * 100)::INTEGER WHERE amount_cents IS NULL;
      ELSE
        ALTER TABLE public.wallet_transactions ADD COLUMN amount_cents INTEGER DEFAULT 0;
      END IF;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE MISSING RPC FUNCTION - log_event
-- ============================================================================

-- Drop existing if any
DROP FUNCTION IF EXISTS public.log_event(TEXT, TEXT, JSONB);

-- Create log_event RPC function for analytics tracking
CREATE OR REPLACE FUNCTION public.log_event(
  p_event_name TEXT,
  p_entity TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID (if authenticated)
  v_user_id := auth.uid();
  
  -- Insert into analytics_events table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    INSERT INTO public.analytics_events (
      user_id, 
      event_name, 
      entity,
      metadata,
      created_at
    )
    VALUES (
      v_user_id,
      p_event_name,
      p_entity,
      p_metadata,
      NOW()
    )
    RETURNING id INTO v_event_id;
  ELSE
    -- If table doesn't exist, return a dummy UUID (graceful degradation)
    v_event_id := gen_random_uuid();
  END IF;
  
  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.log_event IS 'Log analytics events - tracks user actions for analytics';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, JSONB) TO anon;

