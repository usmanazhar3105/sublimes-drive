-- ============================================================================
-- ROLE RESTRICTIONS - Complete Implementation
-- ============================================================================
-- Date: 2025-11-05
-- Purpose: Enforce role-based restrictions for garage owners
--          1. Garage owners can VIEW but NOT CREATE bid repairs
--          2. Messaging only after bid status = 'accepted' or 'closed'
--          3. Admin can bypass all restrictions
-- ============================================================================

-- ============================================================================
-- 1. BID REPAIR - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_create_own_bids" ON bid_repair;
DROP POLICY IF EXISTS "garage_create_bid_restricted" ON bid_repair;

-- Garage owners can VIEW bids (reply-only) but CANNOT CREATE
CREATE POLICY "users_create_bid_only_car_owners"
ON bid_repair FOR INSERT
WITH CHECK (
  owner_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('car_owner', 'browser', 'admin')
  )
);

-- Add comment for clarity
COMMENT ON POLICY "users_create_bid_only_car_owners" ON bid_repair IS 
'Only car owners, browsers, and admins can create bid repairs. Garage owners can reply but NOT create.';

-- ============================================================================
-- 2. MESSAGING UNLOCK - Enforce bid status check
-- ============================================================================

-- Drop existing message policies if needed
DROP POLICY IF EXISTS "messages_insert_after_bid_accepted" ON messages;
DROP POLICY IF EXISTS "admin_view_all_messages" ON messages;

-- Users can send messages ONLY after bid accepted/closed
CREATE POLICY "messages_insert_after_bid_accepted"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  (
    -- Admin can always send
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    -- OR bid must be accepted/closed
    EXISTS (
      SELECT 1 FROM bid_repair
      WHERE id = thread_id
      AND status IN ('accepted', 'closed')
    )
  )
);

-- Admin can view ALL messages (bypass status check)
CREATE POLICY "admin_view_all_messages"
ON messages FOR SELECT
USING (
  -- User can see own messages (sender only, no receiver_id in schema)
  sender_id = auth.uid() OR
  -- Admin can see all
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add comments
COMMENT ON POLICY "messages_insert_after_bid_accepted" ON messages IS 
'Messages only allowed after bid status = accepted or closed. Admins can bypass.';

COMMENT ON POLICY "admin_view_all_messages" ON messages IS 
'Users see own messages, admins see all messages.';

-- ============================================================================
-- 3. HELPER FUNCTION - Check if user can create bid repair
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_can_create_bid_repair(user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
BEGIN
  -- Use provided user_id or auth.uid()
  v_user_id := COALESCE(user_id_param, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user role
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  
  -- Only car_owner, browser, and admin can create
  RETURN v_role IN ('car_owner', 'browser', 'admin');
END;
$$;

COMMENT ON FUNCTION public.fn_can_create_bid_repair IS 
'Helper function to check if user can create bid repairs. Returns TRUE for car_owner, browser, admin. Returns FALSE for garage_owner.';

-- ============================================================================
-- 4. HELPER FUNCTION - Check if messaging is unlocked for bid
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_is_messaging_unlocked(bid_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  -- Admin can always message
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check bid status
  SELECT status INTO v_status
  FROM bid_repair
  WHERE id = bid_id_param;
  
  -- Messaging unlocked if status is accepted or closed
  RETURN v_status IN ('accepted', 'closed');
END;
$$;

COMMENT ON FUNCTION public.fn_is_messaging_unlocked IS 
'Check if messaging is unlocked for a bid. Returns TRUE if bid status is accepted/closed or user is admin.';

-- ============================================================================
-- 5. VERIFICATION VIEW - Role restrictions summary
-- ============================================================================

CREATE OR REPLACE VIEW v_role_restrictions_status AS
SELECT
  'bid_repair_create' as restriction_type,
  'Garage owners CANNOT create bid repairs' as description,
  'car_owner, browser, admin' as allowed_roles,
  'garage_owner' as blocked_roles,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'bid_repair' AND policyname = 'users_create_bid_only_car_owners') > 0 as policy_exists
UNION ALL
SELECT
  'messaging_unlock',
  'Messages only after bid status = accepted or closed',
  'all (after bid accepted)',
  'none (enforced by status)',
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_insert_after_bid_accepted') > 0
UNION ALL
SELECT
  'instant_meetup_access',
  'Garage owners CANNOT access Instant Meetup',
  'car_owner, browser, admin',
  'garage_owner',
  TRUE; -- Enforced in UI layer

-- ============================================================================
-- Success notification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Role restrictions deployed successfully!';
  RAISE NOTICE '   - Bid repair creation: car_owner, browser, admin only';
  RAISE NOTICE '   - Messaging unlock: after bid accepted/closed';
  RAISE NOTICE '   - Admin bypass: all restrictions';
  RAISE NOTICE '   - Helper functions: fn_can_create_bid_repair, fn_is_messaging_unlocked';
  RAISE NOTICE '   - Verification view: v_role_restrictions_status';
END $$;
