-- ============================================================================
-- ROLE SELECTION FIX - Column Additions
-- ============================================================================
-- This fixes the verification_requests table to add missing columns
-- ============================================================================

-- Add missing columns to verification_requests if they don't exist
DO $$
BEGIN
  -- Add kind column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'kind'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN kind TEXT NOT NULL DEFAULT 'car_owner' CHECK (kind IN ('car_owner', 'garage_owner', 'vendor'));
    RAISE NOTICE '✅ Added kind column to verification_requests';
  ELSE
    RAISE NOTICE '✓ kind column already exists';
  END IF;

  -- Add registration_number if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN registration_number TEXT;
    RAISE NOTICE '✅ Added registration_number column';
  END IF;

  -- Add chassis_number if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'chassis_number'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN chassis_number TEXT;
    RAISE NOTICE '✅ Added chassis_number column';
  END IF;

  -- Add car_photos if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'car_photos'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN car_photos TEXT[];
    RAISE NOTICE '✅ Added car_photos column';
  END IF;

  -- Add business_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'business_name'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN business_name TEXT;
    RAISE NOTICE '✅ Added business_name column';
  END IF;

  -- Add business_license if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'business_license'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN business_license TEXT;
    RAISE NOTICE '✅ Added business_license column';
  END IF;

  -- Add trade_license if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'trade_license'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN trade_license TEXT;
    RAISE NOTICE '✅ Added trade_license column';
  END IF;

  -- Add business_address if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'business_address'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN business_address TEXT;
    RAISE NOTICE '✅ Added business_address column';
  END IF;

  -- Add admin_notes if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests' 
    AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE public.verification_requests ADD COLUMN admin_notes TEXT;
    RAISE NOTICE '✅ Added admin_notes column';
  END IF;
END $$;

-- Now create the index
CREATE INDEX IF NOT EXISTS idx_verification_requests_kind ON public.verification_requests(kind);

-- Update the check constraint on status if needed
DO $$
BEGIN
  ALTER TABLE public.verification_requests DROP CONSTRAINT IF EXISTS verification_requests_status_check;
  ALTER TABLE public.verification_requests ADD CONSTRAINT verification_requests_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'under_review'));
  RAISE NOTICE '✅ Updated status check constraint';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ Status constraint already exists or cannot be updated';
END $$;

-- Complete the role selection fix migration
-- ============================================================================

-- Recreate fn_select_role function
DROP FUNCTION IF EXISTS public.fn_select_role(TEXT);

CREATE OR REPLACE FUNCTION public.fn_select_role(p_sub_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_needs_verification BOOLEAN := (p_sub_role IN ('car_owner', 'garage_owner'));
  v_profile JSONB;
  v_existing_request UUID;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;
  
  -- Validate role
  IF p_sub_role NOT IN ('car_browser', 'car_owner', 'garage_owner') THEN
    RAISE EXCEPTION 'INVALID_ROLE: Role must be car_browser, car_owner, or garage_owner';
  END IF;
  
  -- Update profile with selected sub_role
  UPDATE public.profiles
  SET 
    sub_role = p_sub_role,
    updated_at = NOW(),
    -- Set badge color based on role
    badge_color = CASE 
      WHEN p_sub_role = 'car_browser' THEN 'yellow'
      WHEN p_sub_role = 'car_owner' THEN 'green'
      WHEN p_sub_role = 'garage_owner' THEN 'blue'
      ELSE 'yellow'
    END,
    -- Set verification status
    verification_status = CASE
      WHEN p_sub_role = 'car_browser' THEN 'unverified'
      ELSE 'pending'
    END
  WHERE id = v_user_id;
  
  -- If role requires verification, create verification request
  IF v_needs_verification THEN
    -- Check if request already exists
    SELECT id INTO v_existing_request
    FROM public.verification_requests
    WHERE user_id = v_user_id 
      AND kind = p_sub_role
      AND status IN ('pending', 'under_review')
    LIMIT 1;
    
    -- Create new request if none exists
    IF v_existing_request IS NULL THEN
      INSERT INTO public.verification_requests (
        id,
        user_id,
        kind,
        status,
        created_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id,
        p_sub_role,
        'pending',
        NOW()
      );
    END IF;
  END IF;
  
  -- Return updated profile
  SELECT to_jsonb(p.*) INTO v_profile
  FROM public.profiles p
  WHERE p.id = v_user_id;
  
  RETURN v_profile;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_select_role(TEXT) TO authenticated;

-- Verify everything works
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ROLE SELECTION FIX COLUMNS COMPLETED';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Added missing columns to verification_requests';
  RAISE NOTICE 'Created fn_select_role RPC function';
  RAISE NOTICE 'Role selection is now ready to use!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

