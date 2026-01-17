-- ============================================================================
-- Stripe Billing Schema + Webhook Idempotency + Wallet Credit RPC
-- Date: 2026-01-14
-- Notes:
-- - Additive-only (no drops/renames of columns)
-- - Avoid admin role checks in RLS policies (per project rules)
-- ============================================================================

-- Extensions (safe no-op if already present)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Core billing tables
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.billing_customers (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_products (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.billing_products(id),
  nickname TEXT,
  currency TEXT DEFAULT 'AED',
  unit_amount BIGINT,
  interval TEXT NULL,
  active BOOLEAN DEFAULT TRUE,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  kind TEXT NOT NULL,
  status TEXT CHECK (status IN ('initiated','pending','requires_action','succeeded','failed','refunded','expired')) DEFAULT 'initiated',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  currency TEXT DEFAULT 'AED',
  amount BIGINT,
  target_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  meta JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  price_id TEXT REFERENCES public.billing_prices(id),
  quantity INT DEFAULT 1,
  unit_amount BIGINT,
  name TEXT,
  meta JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  stripe_invoice_id TEXT UNIQUE,
  hosted_invoice_url TEXT,
  pdf_url TEXT,
  status TEXT,
  total BIGINT,
  currency TEXT DEFAULT 'AED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets: support both user and garage ownership
CREATE TABLE IF NOT EXISTS public.billing_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL,
  owner_id UUID NOT NULL,
  currency TEXT DEFAULT 'AED',
  balance BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_type, owner_id)
);

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.billing_wallets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  amount BIGINT NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook idempotency guard
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Compatibility: widen any legacy CHECK constraints (safe if they don't exist)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- billing_wallets.owner_type
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'billing_wallets_owner_type_check'
  ) THEN
    ALTER TABLE public.billing_wallets DROP CONSTRAINT billing_wallets_owner_type_check;
  END IF;
  -- Ensure desired constraint exists (drop/recreate pattern, but only if absent)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'billing_wallets_owner_type_check'
  ) THEN
    ALTER TABLE public.billing_wallets
      ADD CONSTRAINT billing_wallets_owner_type_check
      CHECK (owner_type IN ('user','garage'));
  END IF;

  -- orders.kind
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_kind_check'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_kind_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_kind_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_kind_check
      CHECK (kind IN ('parts','boost_marketplace','boost_garage','wallet_credit','listing_fee','premium_subscription','offer_purchase'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_session ON public.orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_billing_wallets_owner ON public.billing_wallets(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet ON public.wallet_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON public.stripe_events(stripe_event_id);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Public read for active products/prices
DROP POLICY IF EXISTS billing_products_public_read ON public.billing_products;
CREATE POLICY billing_products_public_read
  ON public.billing_products
  FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS billing_prices_public_read ON public.billing_prices;
CREATE POLICY billing_prices_public_read
  ON public.billing_prices
  FOR SELECT
  USING (active = TRUE);

-- User read for their own orders/invoices
DROP POLICY IF EXISTS orders_owner_read ON public.orders;
CREATE POLICY orders_owner_read
  ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS billing_invoices_owner_read ON public.billing_invoices;
CREATE POLICY billing_invoices_owner_read
  ON public.billing_invoices
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Wallet read: allow users to read their own user wallet rows
DROP POLICY IF EXISTS billing_wallets_owner_read_user ON public.billing_wallets;
CREATE POLICY billing_wallets_owner_read_user
  ON public.billing_wallets
  FOR SELECT TO authenticated
  USING (owner_type = 'user' AND owner_id = auth.uid());

-- Wallet read: allow garage owners to read wallets owned by garages they own (no role checks)
DROP POLICY IF EXISTS billing_wallets_owner_read_garage ON public.billing_wallets;
CREATE POLICY billing_wallets_owner_read_garage
  ON public.billing_wallets
  FOR SELECT TO authenticated
  USING (
    owner_type = 'garage'
    AND EXISTS (
      SELECT 1
      FROM public.garages g
      WHERE g.id = public.billing_wallets.owner_id
        AND g.owner_id = auth.uid()
    )
  );

-- Wallet ledger read mirrors wallet ownership
DROP POLICY IF EXISTS wallet_ledger_owner_read ON public.wallet_ledger;
CREATE POLICY wallet_ledger_owner_read
  ON public.wallet_ledger
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.billing_wallets w
      WHERE w.id = public.wallet_ledger.wallet_id
        AND (
          (w.owner_type = 'user' AND w.owner_id = auth.uid())
          OR (
            w.owner_type = 'garage'
            AND EXISTS (
              SELECT 1
              FROM public.garages g
              WHERE g.id = w.owner_id
                AND g.owner_id = auth.uid()
            )
          )
        )
    )
  );

-- ----------------------------------------------------------------------------
-- RPC: credit wallet (used by Stripe webhook)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_credit_wallet(
  p_wallet_id UUID,
  p_amount BIGINT,
  p_ref_type TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.billing_wallets%ROWTYPE;
  v_new_balance BIGINT;
BEGIN
  IF p_wallet_id IS NULL THEN
    RAISE EXCEPTION 'p_wallet_id is required';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount must be > 0';
  END IF;

  SELECT * INTO v_wallet
  FROM public.billing_wallets
  WHERE id = p_wallet_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  v_new_balance := COALESCE(v_wallet.balance, 0) + p_amount;

  UPDATE public.billing_wallets
  SET balance = v_new_balance
  WHERE id = p_wallet_id;

  INSERT INTO public.wallet_ledger (
    wallet_id,
    kind,
    amount,
    ref_type,
    ref_id,
    meta
  ) VALUES (
    p_wallet_id,
    'credit_purchase',
    p_amount,
    p_ref_type,
    p_ref_id,
    COALESCE(p_meta, '{}'::jsonb)
  );

  RETURN jsonb_build_object(
    'wallet_id', p_wallet_id,
    'credited', p_amount,
    'balance', v_new_balance
  );
END;
$$;

-- Webhook executes via service_role
GRANT EXECUTE ON FUNCTION public.fn_credit_wallet(UUID, BIGINT, TEXT, UUID, JSONB) TO service_role;

DO $$
BEGIN
  RAISE NOTICE '✅ Stripe billing schema + wallet RPC ready';
END $$;


