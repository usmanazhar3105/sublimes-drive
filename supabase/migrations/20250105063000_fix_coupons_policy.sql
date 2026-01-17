-- Fix coupons policy to handle missing is_active column
DROP POLICY IF EXISTS coupons_public ON public.coupons;
CREATE POLICY coupons_public ON public.coupons FOR SELECT USING (
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'is_active')
    THEN is_active = TRUE
    ELSE TRUE
  END
);
