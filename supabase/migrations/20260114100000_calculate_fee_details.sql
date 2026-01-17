-- ============================================================================
-- 20260114: Restore detailed fee breakdown for frontend payment UX
-- ============================================================================
-- This migration keeps the authoritative fee calculation centralized while
-- returning structured JSON so the UI can display base/ VAT/ total consistently.
-- ============================================================================

-- Drop existing function first (may have different return type or parameter names)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Drop all versions of fn_calculate_fee
  FOR func_record IN 
    SELECT pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'fn_calculate_fee'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.fn_calculate_fee(%s) CASCADE', func_record.args);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.fn_calculate_fee(
  p_kind TEXT,
  p_amount NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_base NUMERIC := 0;
  v_vat NUMERIC := 0;
  v_total NUMERIC := 0;
BEGIN
  CASE p_kind
    WHEN 'car' THEN
      v_base := 50.00;
    WHEN 'parts' THEN
      v_base := COALESCE(p_amount, 0) * 0.08;
    WHEN 'garage' THEN
      v_base := 100.00;
    ELSE
      v_base := 0;
  END CASE;

  v_vat := v_base * 0.05;
  v_total := v_base + v_vat;

  RETURN jsonb_build_object(
    'kind', p_kind,
    'base_fee', v_base,
    'vat', v_vat,
    'total', v_total,
    'currency', 'AED'
  );
END;
$$;

COMMENT ON FUNCTION public.fn_calculate_fee IS
  'Calculate platform fees: returns JSONB with kind/base vat/total. Car=50+VAT, Parts=8%+VAT, Garage=100+VAT';




