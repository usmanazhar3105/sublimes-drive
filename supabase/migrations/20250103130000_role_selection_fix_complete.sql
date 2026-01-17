-- ============================================================================
-- ROLE SELECTION FIX - Complete Solution
-- ============================================================================
-- This file ensures role selection works reliably for all user types
-- Addresses: profiles table, RLS policies, verification system, and RPC
-- ============================================================================

-- Step 1: Ensure profiles table exists with correct schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  
  -- Role system (role is system-level, sub_role is user-facing)
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('admin', 'editor', 'subscriber', 'moderator')),
  sub_role TEXT DEFAULT 'car_browser' CHECK (sub_role IN ('car_browser', 'car_owner', 'garage_owner')),
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'unverified')),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Badge system
  badge_color TEXT DEFAULT 'yellow',
  badge_tier TEXT DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  
  -- Gamification
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Wallet
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  
  -- Premium features
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  
  -- Preferences
  preferences JSONB DEFAULT '{}'::JSONB,
  meta JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_role ON public.profiles(sub_role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- Step 2: Auto-create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, last_login_at)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: RLS Policies for profiles
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;

-- Owner can read their own profile
CREATE POLICY profiles_owner_select 
  ON public.profiles
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Owner can update their own profile
CREATE POLICY profiles_owner_update 
  ON public.profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Owner can insert their own profile (fallback if trigger fails)
CREATE POLICY profiles_owner_insert
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins and editors have full access
CREATE POLICY profiles_admin_all 
  ON public.profiles
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
        AND p.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (TRUE);

-- Public can read basic profile info (for display purposes)
CREATE POLICY profiles_public_read
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Step 4: Verification requests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('car_owner', 'garage_owner', 'vendor')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  
  -- Supporting documents
  documents JSONB DEFAULT '[]'::JSONB,
  document_urls TEXT[],
  
  -- Car owner specific
  registration_number TEXT,
  chassis_number TEXT,
  car_photos TEXT[],
  
  -- Garage owner specific
  business_name TEXT,
  business_license TEXT,
  trade_license TEXT,
  business_address TEXT,
  
  -- Admin review
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_kind ON public.verification_requests(kind);

-- Step 5: RLS for verification_requests
-- ============================================================================

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS verif_owner_select ON public.verification_requests;
DROP POLICY IF EXISTS verif_owner_insert ON public.verification_requests;
DROP POLICY IF EXISTS verif_owner_update ON public.verification_requests;
DROP POLICY IF EXISTS verif_admin_all ON public.verification_requests;

-- Owner can read their own requests
CREATE POLICY verif_owner_select
  ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner can insert their own request
CREATE POLICY verif_owner_insert
  ON public.verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner can update their own pending request
CREATE POLICY verif_owner_update
  ON public.verification_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY verif_admin_all
  ON public.verification_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
        AND p.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (TRUE);

-- Step 6: Unified RPC for role selection
-- ============================================================================

-- Drop existing function if it exists
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_select_role(TEXT) TO authenticated;

-- Step 7: Storage policies for verification documents
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS obj_owner_read_verif ON storage.objects;
DROP POLICY IF EXISTS obj_owner_upload_verif ON storage.objects;
DROP POLICY IF EXISTS obj_auth_upload_avatars ON storage.objects;
DROP POLICY IF EXISTS obj_auth_read_avatars ON storage.objects;
DROP POLICY IF EXISTS obj_admin_all_storage ON storage.objects;

-- Owner can read their own verification docs
CREATE POLICY obj_owner_read_verif
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('verification-docs', 'documents')
    AND (
      owner = auth.uid()
      OR EXISTS (
        SELECT 1 
        FROM public.profiles p 
        WHERE p.id = auth.uid() 
          AND p.role IN ('admin', 'editor')
      )
    )
  );

-- Owner can upload verification docs
CREATE POLICY obj_owner_upload_verif
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('verification-docs', 'documents')
    AND owner = auth.uid()
  );

-- Anyone authenticated can upload avatars
CREATE POLICY obj_auth_upload_avatars
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images', 'avatars')
    AND owner = auth.uid()
  );

-- Anyone can read public avatars
CREATE POLICY obj_auth_read_avatars
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id IN ('profile-images', 'avatars'));

-- Admins have full access to all storage
CREATE POLICY obj_admin_all_storage
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
        AND p.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (TRUE);

-- Step 8: Helper function to check if user can update profile
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_can_update_profile(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- User can update their own profile
  IF auth.uid() = p_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Admin can update any profile
  IF EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_can_update_profile(UUID) TO authenticated;

-- Step 9: Update trigger for updated_at (if not exists)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- VERIFICATION & SANITY CHECKS
-- ============================================================================

-- Check 1: Verify profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE '✅ profiles table exists';
  ELSE
    RAISE EXCEPTION '❌ profiles table does not exist';
  END IF;
END $$;

-- Check 2: Verify verification_requests table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'verification_requests'
  ) THEN
    RAISE NOTICE '✅ verification_requests table exists';
  ELSE
    RAISE EXCEPTION '❌ verification_requests table does not exist';
  END IF;
END $$;

-- Check 3: Verify fn_select_role function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'fn_select_role'
  ) THEN
    RAISE NOTICE '✅ fn_select_role function exists';
  ELSE
    RAISE EXCEPTION '❌ fn_select_role function does not exist';
  END IF;
END $$;

-- Check 4: Verify trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ on_auth_user_created trigger exists';
  ELSE
    RAISE WARNING '⚠️ on_auth_user_created trigger does not exist';
  END IF;
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.fn_select_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_can_update_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- ============================================================================
-- COMPLETED
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ROLE SELECTION FIX COMPLETED SUCCESSFULLY';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update client code to call fn_select_role RPC';
  RAISE NOTICE '2. Test role selection flow';
  RAISE NOTICE '3. Verify bucket creation in Supabase Storage';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

