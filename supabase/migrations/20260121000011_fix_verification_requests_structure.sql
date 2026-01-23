-- ============================================================================
-- FIX VERIFICATION_REQUESTS TABLE STRUCTURE
-- Date: 2026-01-21
-- Priority: CRITICAL - Ensures verification requests are queryable
-- 
-- Problem: Table might have 'verification_type' or 'type' column, causing
--          query mismatches in admin panel.
-- Solution: Ensure table has both columns or standardize on one.
-- ============================================================================

-- ============================================================================
-- 1. CHECK AND ADD MISSING COLUMNS
-- ============================================================================

DO $$
BEGIN
    -- Add 'verification_type' column if it doesn't exist (for backward compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_requests' 
        AND column_name = 'verification_type'
    ) THEN
        -- If 'type' column exists, copy values to 'verification_type'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'verification_requests' 
            AND column_name = 'type'
        ) THEN
            ALTER TABLE public.verification_requests 
            ADD COLUMN verification_type TEXT;
            
            -- Map 'type' values to 'verification_type' values
            UPDATE public.verification_requests
            SET verification_type = CASE
                WHEN type = 'car_owner' THEN 'vehicle'
                WHEN type = 'garage_owner' THEN 'garage'
                WHEN type = 'vendor' THEN 'vendor'
                ELSE type
            END;
            
            -- Add constraint
            ALTER TABLE public.verification_requests
            ADD CONSTRAINT verification_requests_verification_type_check 
            CHECK (verification_type IN ('vehicle', 'garage', 'vendor'));
            
            RAISE NOTICE '✅ Added verification_type column and mapped from type column';
        ELSE
            -- Neither column exists, create verification_type
            ALTER TABLE public.verification_requests 
            ADD COLUMN verification_type TEXT DEFAULT 'vehicle';
            
            ALTER TABLE public.verification_requests
            ADD CONSTRAINT verification_requests_verification_type_check 
            CHECK (verification_type IN ('vehicle', 'garage', 'vendor'));
            
            RAISE NOTICE '✅ Created verification_type column';
        END IF;
    END IF;
    
    -- Ensure 'submitted_at' column exists (some tables use 'created_at')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_requests' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE public.verification_requests 
        ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Copy from created_at if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'verification_requests' 
            AND column_name = 'created_at'
        ) THEN
            UPDATE public.verification_requests
            SET submitted_at = created_at
            WHERE submitted_at IS NULL;
        END IF;
        
        RAISE NOTICE '✅ Added submitted_at column';
    END IF;
    
    -- Ensure 'documents' column exists (some tables use 'document_urls')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_requests' 
        AND column_name = 'documents'
    ) THEN
        ALTER TABLE public.verification_requests 
        ADD COLUMN documents TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        -- Copy from document_urls if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'verification_requests' 
            AND column_name = 'document_urls'
        ) THEN
            UPDATE public.verification_requests
            SET documents = document_urls
            WHERE documents IS NULL OR array_length(documents, 1) IS NULL;
        END IF;
        
        RAISE NOTICE '✅ Added documents column';
    END IF;
    
    -- Ensure 'data' column exists (for JSONB data)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_requests' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE public.verification_requests 
        ADD COLUMN data JSONB DEFAULT '{}'::JSONB;
        
        RAISE NOTICE '✅ Added data column';
    END IF;
    
    -- Ensure 'reviewer_id' column exists (some tables use 'reviewed_by')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_requests' 
        AND column_name = 'reviewer_id'
    ) THEN
        ALTER TABLE public.verification_requests 
        ADD COLUMN reviewer_id UUID REFERENCES public.profiles(id);
        
        -- Copy from reviewed_by if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'verification_requests' 
            AND column_name = 'reviewed_by'
        ) THEN
            UPDATE public.verification_requests
            SET reviewer_id = reviewed_by
            WHERE reviewer_id IS NULL;
        END IF;
        
        RAISE NOTICE '✅ Added reviewer_id column';
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE INDEXES IF MISSING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_verification_requests_verification_type 
ON public.verification_requests(verification_type);

CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at 
ON public.verification_requests(submitted_at DESC);

-- ============================================================================
-- 3. ENSURE RLS POLICIES ALLOW ADMIN ACCESS
-- ============================================================================

-- Drop old recursive policies
DROP POLICY IF EXISTS "verification_requests_select_admin" ON public.verification_requests;

-- Create new admin policy using check_is_admin function
CREATE POLICY "verification_requests_select_admin" ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
    OR COALESCE(auth.jwt()->>'user_role', '') IN ('admin','superadmin','editor')
    OR COALESCE(auth.jwt()->>'system_role', '') IN ('admin','superadmin','editor')
    OR public.check_is_admin() = true
  );

-- ============================================================================
-- 4. VERIFICATION QUERIES
-- ============================================================================

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'verification_requests'
ORDER BY ordinal_position;

-- Check if verification requests exist
SELECT 
    COUNT(*) as total_requests,
    COUNT(DISTINCT verification_type) as distinct_types,
    COUNT(DISTINCT status) as distinct_statuses
FROM public.verification_requests;

-- Sample verification requests
SELECT 
    id,
    user_id,
    verification_type,
    status,
    submitted_at,
    created_at
FROM public.verification_requests
ORDER BY submitted_at DESC
LIMIT 5;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- The verification_requests table now has:
-- - verification_type column (standardized)
-- - submitted_at column
-- - documents column
-- - data column
-- - reviewer_id column
-- - Proper RLS policies for admin access
-- ============================================================================

