-- ============================================================================
-- COMPAT MISSING TABLES (non-destructive, additive, idempotent)
-- Date: 2025-11-08
-- Purpose: Create legacy/compat tables referenced by policies when absent
-- Tables: listing_images, wallets, wallet_transactions, audit_log
-- ============================================================================

-- listing_images (legacy) -----------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='listing_images'
  ) THEN
    CREATE TABLE public.listing_images (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id uuid,
      user_id uuid,
      url text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- add FK to listings if both tables/columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='listing_images'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='listings'
  ) THEN
    BEGIN
      ALTER TABLE public.listing_images
      ADD CONSTRAINT listing_images_listing_fk
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON public.listing_images(listing_id);
  CREATE INDEX IF NOT EXISTS idx_listing_images_user ON public.listing_images(user_id);
END $$;

-- wallets --------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='wallets'
  ) THEN
    CREATE TABLE public.wallets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid,
      balance numeric(14,2) DEFAULT 0,
      currency text DEFAULT 'AED',
      created_at timestamptz DEFAULT now()
    );
  END IF;
  CREATE INDEX IF NOT EXISTS idx_wallets_owner ON public.wallets(owner_id);
END $$;

-- wallet_transactions ---------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='wallet_transactions'
  ) THEN
    CREATE TABLE public.wallet_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_id uuid NOT NULL,
      amount numeric(14,2) NOT NULL,
      currency text DEFAULT 'AED',
      kind text CHECK (kind IN ('credit','debit')),
      reference text,
      meta jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- FK to wallets when available
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='wallets'
  ) THEN
    BEGIN
      -- Ensure wallet_id column exists
      ALTER TABLE public.wallet_transactions
      ADD COLUMN IF NOT EXISTS wallet_id uuid;

      ALTER TABLE public.wallet_transactions
      ADD CONSTRAINT wallet_tx_wallet_fk
      FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id, created_at DESC);
END $$;

-- audit_log ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='audit_log'
  ) THEN
    CREATE TABLE public.audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id uuid,
      action text NOT NULL,
      entity text,
      entity_id text,
      meta jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );
  END IF;
  CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_id, created_at DESC);
END $$;
