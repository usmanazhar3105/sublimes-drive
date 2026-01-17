-- Fix Role Restrictions RLS - Remove admin checks
-- Date: 2025-01-08
-- Priority: CRITICAL
--
-- Role restrictions must be enforced in UI layer, not RLS.
-- RLS policies should only check basic ownership, not roles.

-- ============================================================================
-- 1. BID REPAIR - Fix RLS to remove admin/role checks
-- ============================================================================

-- Drop existing policy that checks roles in RLS
DROP POLICY IF EXISTS "users_create_bid_only_car_owners" ON bid_repair;

-- Create simple policy - ownership only (role check in application layer)
CREATE POLICY "users_create_own_bids"
ON bid_repair FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Users can view bids they own or are involved in
CREATE POLICY "users_view_own_bids"
ON bid_repair FOR SELECT
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM bid_replies
    WHERE bid_id = bid_repair.id AND garage_id = auth.uid()
  )
);

-- ============================================================================
-- 2. MESSAGING - Fix RLS to remove admin checks
-- ============================================================================

-- Drop existing policies with admin checks
DROP POLICY IF EXISTS "messages_insert_after_bid_accepted" ON messages;
DROP POLICY IF EXISTS "admin_view_all_messages" ON messages;

-- Simple policy - users can send messages in their own threads
-- Status check will be in application layer
CREATE POLICY "users_send_own_messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can view messages they sent
CREATE POLICY "users_view_own_messages"
ON messages FOR SELECT
USING (sender_id = auth.uid());

-- ============================================================================
-- NOTE: Role restrictions enforced in application layer
-- ============================================================================
--
-- In your React components, check roles before allowing actions:
--
-- ```typescript
-- const { data: profile } = await supabase
--   .from('profiles')
--   .select('role')
--   .eq('id', user.id)
--   .single();
--
-- // Garage owners cannot create bid repairs
-- if (profile?.role === 'garage_owner') {
--   // Hide/disable bid repair creation UI
--   return <div>Garage owners cannot create bid repairs</div>;
-- }
--
-- // Check messaging unlock
-- const { data: bid } = await supabase
--   .from('bid_repair')
--   .select('status')
--   .eq('id', bidId)
--   .single();
--
-- const canMessage = bid?.status === 'accepted' || bid?.status === 'closed';
-- if (!canMessage) {
--   // Disable message input
--   return <div>Messaging unlocked after bid is accepted</div>;
-- }
-- ```


