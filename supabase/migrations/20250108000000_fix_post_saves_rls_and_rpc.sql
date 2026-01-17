-- Fix post_saves RLS policy (remove admin check to prevent recursion)
-- Fix fn_toggle_save RPC function
-- Date: 2025-01-08
-- Priority: CRITICAL

-- ============================================================================
-- 1. FIX RLS POLICIES (Remove admin checks per project rules)
-- ============================================================================

-- Drop existing policies that check admin roles
DROP POLICY IF EXISTS "Admin can manage all saves" ON public.post_saves;

-- Recreate without admin check (admin access handled in application layer)
-- Users can only manage their own saves (already exists, but ensure it's correct)
DROP POLICY IF EXISTS "Users can manage own saves" ON public.post_saves;
CREATE POLICY "Users can manage own saves"
  ON public.post_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only view their own saves (privacy)
DROP POLICY IF EXISTS "Users can view own saves" ON public.post_saves;
CREATE POLICY "Users can view own saves"
  ON public.post_saves FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. ENSURE fn_toggle_save EXISTS WITH CORRECT SIGNATURE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_toggle_save(_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_saved BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if save exists
  SELECT EXISTS(
    SELECT 1 FROM public.post_saves 
    WHERE post_id = _post_id AND user_id = v_user_id
  ) INTO v_exists;
  
  IF v_exists THEN
    -- Remove save
    DELETE FROM public.post_saves 
    WHERE post_id = _post_id AND user_id = v_user_id;
    v_saved := FALSE;
  ELSE
    -- Add save
    INSERT INTO public.post_saves (post_id, user_id, created_at)
    VALUES (_post_id, v_user_id, NOW())
    ON CONFLICT (post_id, user_id) DO NOTHING;
    v_saved := TRUE;
  END IF;
  
  RETURN jsonb_build_object('saved', v_saved);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_toggle_save(UUID) TO authenticated;

-- ============================================================================
-- 3. VERIFY TABLE STRUCTURE
-- ============================================================================

-- Ensure post_saves table has correct structure
DO $$
BEGIN
  -- Check if table exists and has correct columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'post_saves'
  ) THEN
    RAISE EXCEPTION 'post_saves table does not exist. Run 20241101180000_communities_interactions.sql first.';
  END IF;
  
  -- Ensure unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ux_post_save'
  ) THEN
    ALTER TABLE public.post_saves 
    ADD CONSTRAINT ux_post_save UNIQUE(post_id, user_id);
  END IF;
END $$;


