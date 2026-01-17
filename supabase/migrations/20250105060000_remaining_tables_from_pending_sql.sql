-- ============================================================================
-- REMAINING TABLES FROM PENDING SQL
-- ============================================================================
-- This migration adds tables that were in the large SQL file but not yet created
-- ============================================================================

-- Marketplace Models
CREATE TABLE IF NOT EXISTS public.marketplace_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.marketplace_brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (brand_id, slug)
);

-- Marketplace Favorites
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

-- Job Messages (for repair jobs)
CREATE TABLE IF NOT EXISTS public.job_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.repair_jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_from_garage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.repair_jobs(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  vat_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garage Favorites
CREATE TABLE IF NOT EXISTS public.garage_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, garage_id)
);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE public.marketplace_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS marketplace_models_public ON public.marketplace_models;
CREATE POLICY marketplace_models_public ON public.marketplace_models FOR SELECT USING (is_active = TRUE);

ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS marketplace_favorites_owner ON public.marketplace_favorites;
CREATE POLICY marketplace_favorites_owner ON public.marketplace_favorites FOR ALL TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_messages_participants ON public.job_messages;
CREATE POLICY job_messages_participants ON public.job_messages FOR SELECT TO authenticated USING (
  auth.uid() = sender_id OR 
  EXISTS (SELECT 1 FROM public.repair_jobs WHERE id = job_id AND requester_id = auth.uid())
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_owner_garage ON public.invoices;
CREATE POLICY invoices_owner_garage ON public.invoices FOR SELECT TO authenticated USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.garages WHERE id = garage_id AND owner_id = auth.uid())
);

ALTER TABLE public.garage_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS garage_favorites_owner ON public.garage_favorites;
CREATE POLICY garage_favorites_owner ON public.garage_favorites FOR ALL TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Award bid function
DROP FUNCTION IF EXISTS public.fn_award_bid(UUID, UUID);
CREATE OR REPLACE FUNCTION public.fn_award_bid(p_bid_id UUID, p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_bid RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT * INTO v_bid FROM public.repair_bids WHERE id = p_bid_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;
  
  -- Update job
  UPDATE public.repair_jobs
  SET status = 'awarded', awarded_garage_id = v_bid.garage_id, updated_at = NOW()
  WHERE id = p_job_id AND requester_id = v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or not owned by user';
  END IF;
  
  -- Update bids
  UPDATE public.repair_bids SET status = 'accepted', updated_at = NOW() WHERE id = p_bid_id;
  UPDATE public.repair_bids SET status = 'expired', updated_at = NOW() WHERE job_id = p_job_id AND id != p_bid_id;
  
  RETURN jsonb_build_object('success', TRUE, 'garage_id', v_bid.garage_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_award_bid(UUID, UUID) TO authenticated;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_marketplace_models_brand ON public.marketplace_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user ON public.marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_listing ON public.marketplace_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_job ON public.job_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_garage_favorites_user ON public.garage_favorites(user_id);

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REMAINING TABLES FROM PENDING SQL - COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✅ marketplace_models';
  RAISE NOTICE '  ✅ marketplace_favorites';
  RAISE NOTICE '  ✅ job_messages';
  RAISE NOTICE '  ✅ invoices';
  RAISE NOTICE '  ✅ garage_favorites';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  ✅ fn_award_bid';
  RAISE NOTICE '';
  RAISE NOTICE '✅ ALL PENDING SQL COMPONENTS MIGRATED';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
