-- Fix freya_budget table - add missing tokens_limit column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'freya_budget' 
    AND column_name = 'tokens_limit'
  ) THEN
    ALTER TABLE public.freya_budget ADD COLUMN tokens_limit INT NOT NULL DEFAULT 300000;
    RAISE NOTICE '✅ Added tokens_limit column to freya_budget';
  ELSE
    RAISE NOTICE '✅ tokens_limit column already exists';
  END IF;
END $$;

-- Now seed today's budget safely
INSERT INTO public.freya_budget (day, tokens_used, tokens_limit)
VALUES (CURRENT_DATE, 0, 300000)
ON CONFLICT (day) DO UPDATE SET tokens_limit = 300000;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Freya budget fixed and seeded';
END $$;

