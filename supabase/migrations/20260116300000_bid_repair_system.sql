-- ============================================================================
-- BID REPAIR SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This migration creates all tables needed for the Bid Repair Management system
-- including wallets, transactions, bid credits, and Stripe integration
-- ============================================================================

-- ============================================================================
-- 1. USER_WALLETS TABLE - Main wallet for each user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0 NOT NULL,
  bid_credits NUMERIC(12,2) DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'AED' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  stripe_customer_id TEXT,
  last_transaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallets' AND column_name = 'bid_credits') THEN
    ALTER TABLE public.user_wallets ADD COLUMN bid_credits NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallets' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE public.user_wallets ADD COLUMN stripe_customer_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallets' AND column_name = 'is_suspended') THEN
    ALTER TABLE public.user_wallets ADD COLUMN is_suspended BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallets' AND column_name = 'suspension_reason') THEN
    ALTER TABLE public.user_wallets ADD COLUMN suspension_reason TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_stripe ON public.user_wallets(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_wallets_active ON public.user_wallets(is_active) WHERE is_active = true;

-- ============================================================================
-- 2. WALLET_TRANSACTIONS TABLE - All wallet transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.user_wallets(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED' NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'topup', 'payment', 'refund', 'withdrawal', 'deposit', 'bid_credit', 'bid_debit', 'transfer_in', 'transfer_out', 'bonus', 'fee', 'adjustment')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  balance_before NUMERIC(12,2),
  balance_after NUMERIC(12,2),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_refund_id TEXT,
  metadata JSONB DEFAULT '{}',
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'wallet_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN wallet_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'balance_before') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN balance_before NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'balance_after') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN balance_after NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'stripe_payment_intent_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'stripe_charge_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN stripe_charge_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'stripe_refund_id') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN stripe_refund_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'processed_by') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN processed_by UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'processed_at') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN processed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_pi ON public.wallet_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- ============================================================================
-- 3. BID_REPAIR_REQUESTS TABLE - Bid repair service requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bid_repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID,
  vehicle_info JSONB DEFAULT '{}',
  repair_type TEXT NOT NULL CHECK (repair_type IN ('minor', 'major', 'cosmetic', 'mechanical', 'electrical', 'bodywork', 'inspection', 'custom')),
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  estimated_cost NUMERIC(12,2),
  final_cost NUMERIC(12,2),
  bid_credits_used NUMERIC(12,2) DEFAULT 0,
  wallet_amount_used NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_garage_id UUID,
  admin_notes TEXT,
  rejection_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bid_repair_requests_user ON public.bid_repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_repair_requests_status ON public.bid_repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_bid_repair_requests_priority ON public.bid_repair_requests(priority);
CREATE INDEX IF NOT EXISTS idx_bid_repair_requests_created ON public.bid_repair_requests(created_at DESC);

-- ============================================================================
-- 4. BID_CREDIT_PACKAGES TABLE - Available credit packages for purchase
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bid_credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits NUMERIC(12,2) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  bonus_credits NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'AED',
  stripe_price_id TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  valid_days INTEGER DEFAULT 365,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bid_credit_packages_active ON public.bid_credit_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bid_credit_packages_sort ON public.bid_credit_packages(sort_order);

-- Insert default packages if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.bid_credit_packages LIMIT 1) THEN
    INSERT INTO public.bid_credit_packages (name, description, credits, price, bonus_credits, is_popular, sort_order)
    VALUES
      ('Starter Pack', 'Perfect for first-time users', 100, 99, 0, false, 1),
      ('Popular Pack', 'Most popular choice', 500, 449, 50, true, 2),
      ('Pro Pack', 'Best value for professionals', 1000, 849, 150, false, 3),
      ('Enterprise Pack', 'For dealers and businesses', 5000, 3999, 1000, false, 4);
  END IF;
END $$;

-- ============================================================================
-- 5. STRIPE_PAYMENTS TABLE - Track all Stripe payments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE NOT NULL,
  charge_id TEXT,
  customer_id TEXT,
  amount INTEGER NOT NULL, -- in smallest currency unit (fils for AED)
  amount_received INTEGER,
  currency TEXT DEFAULT 'aed',
  status TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled', 'failed')),
  payment_method_type TEXT,
  description TEXT,
  receipt_url TEXT,
  refunded BOOLEAN DEFAULT false,
  refund_id TEXT,
  refund_amount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user ON public.stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_intent ON public.stripe_payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_customer ON public.stripe_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_created ON public.stripe_payments(created_at DESC);

-- ============================================================================
-- 6. WALLET_SETTINGS TABLE - Admin settings for wallet system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.wallet_settings WHERE setting_key = 'min_topup_amount') THEN
    INSERT INTO public.wallet_settings (setting_key, setting_value, description)
    VALUES
      ('min_topup_amount', '{"value": 50, "currency": "AED"}'::jsonb, 'Minimum amount for wallet top-up'),
      ('max_topup_amount', '{"value": 50000, "currency": "AED"}'::jsonb, 'Maximum amount for wallet top-up'),
      ('min_withdrawal_amount', '{"value": 100, "currency": "AED"}'::jsonb, 'Minimum amount for withdrawal'),
      ('withdrawal_fee_percentage', '{"value": 2.5}'::jsonb, 'Fee percentage for withdrawals'),
      ('bid_credit_conversion_rate', '{"value": 1, "currency": "AED"}'::jsonb, '1 bid credit = X AED'),
      ('auto_approve_threshold', '{"value": 1000, "currency": "AED"}'::jsonb, 'Auto-approve payments below this amount'),
      ('stripe_enabled', '{"value": true}'::jsonb, 'Enable/disable Stripe payments'),
      ('wallet_enabled', '{"value": true}'::jsonb, 'Enable/disable wallet system');
  END IF;
END $$;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_settings ENABLE ROW LEVEL SECURITY;

-- user_wallets policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'user_wallets_select') THEN
    CREATE POLICY user_wallets_select ON public.user_wallets FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'user_wallets_insert') THEN
    CREATE POLICY user_wallets_insert ON public.user_wallets FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'user_wallets_update') THEN
    CREATE POLICY user_wallets_update ON public.user_wallets FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- wallet_transactions policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_select') THEN
    CREATE POLICY wallet_transactions_select ON public.wallet_transactions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_insert') THEN
    CREATE POLICY wallet_transactions_insert ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'wallet_transactions_update') THEN
    CREATE POLICY wallet_transactions_update ON public.wallet_transactions FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- bid_repair_requests policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_repair_requests' AND policyname = 'bid_repair_requests_select') THEN
    CREATE POLICY bid_repair_requests_select ON public.bid_repair_requests FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_repair_requests' AND policyname = 'bid_repair_requests_insert') THEN
    CREATE POLICY bid_repair_requests_insert ON public.bid_repair_requests FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_repair_requests' AND policyname = 'bid_repair_requests_update') THEN
    CREATE POLICY bid_repair_requests_update ON public.bid_repair_requests FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- bid_credit_packages policies (read-only for users)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_credit_packages' AND policyname = 'bid_credit_packages_select') THEN
    CREATE POLICY bid_credit_packages_select ON public.bid_credit_packages FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_credit_packages' AND policyname = 'bid_credit_packages_insert') THEN
    CREATE POLICY bid_credit_packages_insert ON public.bid_credit_packages FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_credit_packages' AND policyname = 'bid_credit_packages_update') THEN
    CREATE POLICY bid_credit_packages_update ON public.bid_credit_packages FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bid_credit_packages' AND policyname = 'bid_credit_packages_delete') THEN
    CREATE POLICY bid_credit_packages_delete ON public.bid_credit_packages FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- stripe_payments policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_payments' AND policyname = 'stripe_payments_select') THEN
    CREATE POLICY stripe_payments_select ON public.stripe_payments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_payments' AND policyname = 'stripe_payments_insert') THEN
    CREATE POLICY stripe_payments_insert ON public.stripe_payments FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_payments' AND policyname = 'stripe_payments_update') THEN
    CREATE POLICY stripe_payments_update ON public.stripe_payments FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- wallet_settings policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_settings' AND policyname = 'wallet_settings_select') THEN
    CREATE POLICY wallet_settings_select ON public.wallet_settings FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_settings' AND policyname = 'wallet_settings_update') THEN
    CREATE POLICY wallet_settings_update ON public.wallet_settings FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- 8. FUNCTIONS FOR WALLET OPERATIONS
-- ============================================================================

-- Function to get or create user wallet
CREATE OR REPLACE FUNCTION public.fn_get_or_create_wallet(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Try to get existing wallet
  SELECT id INTO v_wallet_id
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  -- Create if not exists
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance, bid_credits)
    VALUES (p_user_id, 0, 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  RETURN v_wallet_id;
END;
$$;

-- Function to credit wallet
CREATE OR REPLACE FUNCTION public.fn_credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT DEFAULT 'credit',
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get or create wallet
  v_wallet_id := public.fn_get_or_create_wallet(p_user_id);

  -- Get current balance
  SELECT balance INTO v_balance_before
  FROM public.user_wallets
  WHERE id = v_wallet_id;

  v_balance_after := v_balance_before + p_amount;

  -- Update wallet balance
  UPDATE public.user_wallets
  SET balance = v_balance_after,
      last_transaction_at = NOW(),
      updated_at = NOW()
  WHERE id = v_wallet_id;

  -- Create transaction record
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, status, description,
    reference_type, reference_id, balance_before, balance_after,
    stripe_payment_intent_id, processed_at
  )
  VALUES (
    p_user_id, v_wallet_id, p_amount, p_type, 'completed', p_description,
    p_reference_type, p_reference_id, v_balance_before, v_balance_after,
    p_stripe_payment_intent_id, NOW()
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Function to debit wallet
CREATE OR REPLACE FUNCTION public.fn_debit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT DEFAULT 'debit',
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get wallet
  SELECT id, balance INTO v_wallet_id, v_balance_before
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_balance_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_balance_before, p_amount;
  END IF;

  v_balance_after := v_balance_before - p_amount;

  -- Update wallet balance
  UPDATE public.user_wallets
  SET balance = v_balance_after,
      last_transaction_at = NOW(),
      updated_at = NOW()
  WHERE id = v_wallet_id;

  -- Create transaction record
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, status, description,
    reference_type, reference_id, balance_before, balance_after,
    processed_at
  )
  VALUES (
    p_user_id, v_wallet_id, -p_amount, p_type, 'completed', p_description,
    p_reference_type, p_reference_id, v_balance_before, v_balance_after,
    NOW()
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Function to add bid credits
CREATE OR REPLACE FUNCTION public.fn_add_bid_credits(
  p_user_id UUID,
  p_credits NUMERIC,
  p_description TEXT DEFAULT 'Bid credits added'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_credits_before NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get or create wallet
  v_wallet_id := public.fn_get_or_create_wallet(p_user_id);

  -- Get current credits
  SELECT bid_credits INTO v_credits_before
  FROM public.user_wallets
  WHERE id = v_wallet_id;

  -- Update bid credits
  UPDATE public.user_wallets
  SET bid_credits = bid_credits + p_credits,
      last_transaction_at = NOW(),
      updated_at = NOW()
  WHERE id = v_wallet_id;

  -- Create transaction record
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, status, description, processed_at
  )
  VALUES (
    p_user_id, v_wallet_id, p_credits, 'bid_credit', 'completed', p_description, NOW()
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Function to get wallet stats for admin
CREATE OR REPLACE FUNCTION public.fn_get_wallet_stats()
RETURNS TABLE (
  total_wallets BIGINT,
  active_wallets BIGINT,
  suspended_wallets BIGINT,
  total_balance NUMERIC,
  total_bid_credits NUMERIC,
  total_transactions BIGINT,
  pending_transactions BIGINT,
  failed_transactions BIGINT,
  refunded_transactions BIGINT,
  total_revenue NUMERIC,
  pending_amount NUMERIC,
  failed_amount NUMERIC,
  refunded_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.user_wallets)::BIGINT AS total_wallets,
    (SELECT COUNT(*) FROM public.user_wallets WHERE is_active = true AND is_suspended = false)::BIGINT AS active_wallets,
    (SELECT COUNT(*) FROM public.user_wallets WHERE is_suspended = true)::BIGINT AS suspended_wallets,
    COALESCE((SELECT SUM(balance) FROM public.user_wallets), 0)::NUMERIC AS total_balance,
    COALESCE((SELECT SUM(bid_credits) FROM public.user_wallets), 0)::NUMERIC AS total_bid_credits,
    (SELECT COUNT(*) FROM public.wallet_transactions)::BIGINT AS total_transactions,
    (SELECT COUNT(*) FROM public.wallet_transactions WHERE status = 'pending')::BIGINT AS pending_transactions,
    (SELECT COUNT(*) FROM public.wallet_transactions WHERE status = 'failed')::BIGINT AS failed_transactions,
    (SELECT COUNT(*) FROM public.wallet_transactions WHERE status = 'refunded' OR type = 'refund')::BIGINT AS refunded_transactions,
    COALESCE((SELECT SUM(ABS(amount)) FROM public.wallet_transactions WHERE status = 'completed' AND type IN ('credit', 'topup', 'deposit')), 0)::NUMERIC AS total_revenue,
    COALESCE((SELECT SUM(ABS(amount)) FROM public.wallet_transactions WHERE status = 'pending'), 0)::NUMERIC AS pending_amount,
    COALESCE((SELECT SUM(ABS(amount)) FROM public.wallet_transactions WHERE status = 'failed'), 0)::NUMERIC AS failed_amount,
    COALESCE((SELECT SUM(ABS(amount)) FROM public.wallet_transactions WHERE status = 'refunded' OR type = 'refund'), 0)::NUMERIC AS refunded_amount;
END;
$$;

-- ============================================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_wallets_updated') THEN
    CREATE TRIGGER trg_user_wallets_updated
    BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_wallet_transactions_updated') THEN
    CREATE TRIGGER trg_wallet_transactions_updated
    BEFORE UPDATE ON public.wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bid_repair_requests_updated') THEN
    CREATE TRIGGER trg_bid_repair_requests_updated
    BEFORE UPDATE ON public.bid_repair_requests
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'BID REPAIR SYSTEM MIGRATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. user_wallets - User wallet balances and bid credits';
  RAISE NOTICE '  2. wallet_transactions - All wallet transactions';
  RAISE NOTICE '  3. bid_repair_requests - Bid repair service requests';
  RAISE NOTICE '  4. bid_credit_packages - Credit packages for purchase';
  RAISE NOTICE '  5. stripe_payments - Stripe payment tracking';
  RAISE NOTICE '  6. wallet_settings - Admin settings';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - fn_get_or_create_wallet';
  RAISE NOTICE '  - fn_credit_wallet';
  RAISE NOTICE '  - fn_debit_wallet';
  RAISE NOTICE '  - fn_add_bid_credits';
  RAISE NOTICE '  - fn_get_wallet_stats';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;



