/**
 * Migration: Bid Repair System
 * 
 * Implements:
 * - Bid creation (car_owner, browser)
 * - Bid replies (garage_owner)
 * - Wallet system for garage owners
 * - Wallet transactions
 * - Messaging system (unlocked after bid acceptance)
 * 
 * Date: 2025-11-01
 */

-- ============================================================================
-- 1. BID REPAIR TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bid_repair (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Bid details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  vehicle_info JSONB NOT NULL, -- {make, model, year, plate, etc}
  images TEXT[] DEFAULT '{}',
  location JSONB, -- {lat, lng, address}
  
  -- Status tracking
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'closed', 'cancelled')),
  accepted_reply_id UUID,
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bid_repair_owner ON bid_repair(owner_id);
CREATE INDEX IF NOT EXISTS idx_bid_repair_status ON bid_repair(status);
CREATE INDEX IF NOT EXISTS idx_bid_repair_created ON bid_repair(created_at DESC);

-- ============================================================================
-- 2. BID REPAIR REPLIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bid_repair_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES bid_repair(id) ON DELETE CASCADE,
  garage_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reply details
  message TEXT,
  quote_amount NUMERIC(10,2),
  estimated_time TEXT, -- e.g., "2-3 days"
  warranty_offered TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  
  -- Prevent duplicate replies from same garage
  UNIQUE(bid_id, garage_owner_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bid_replies_bid ON bid_repair_replies(bid_id);
CREATE INDEX IF NOT EXISTS idx_bid_replies_garage ON bid_repair_replies(garage_owner_id);
CREATE INDEX IF NOT EXISTS idx_bid_replies_status ON bid_repair_replies(status);

-- ============================================================================
-- 3. BID WALLET TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bid_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_owner_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Balance
  balance NUMERIC(10,2) DEFAULT 0 CHECK (balance >= 0),
  
  -- Metadata
  total_earned NUMERIC(10,2) DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_topup TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bid_wallet_garage ON bid_wallet(garage_owner_id);

-- ============================================================================
-- 4. WALLET TRANSACTIONS TABLE
-- ============================================================================

-- Check if wallet_transactions exists and has the right structure
DO $$
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wallet_transactions') THEN
    CREATE TABLE wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
      source TEXT NOT NULL CHECK (source IN ('stripe', 'referral', 'refund', 'admin', 'bid_acceptance')),
      related_bid_id UUID REFERENCES bid_repair(id),
      stripe_payment_intent_id TEXT,
      metadata JSONB DEFAULT '{}',
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS source TEXT;
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS related_bid_id UUID;
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT;
    
    -- Add foreign key if column was just created
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'wallet_transactions_related_bid_id_fkey'
    ) THEN
      ALTER TABLE wallet_transactions 
      ADD CONSTRAINT wallet_transactions_related_bid_id_fkey 
      FOREIGN KEY (related_bid_id) REFERENCES bid_repair(id);
    END IF;
  END IF;
END $$;

-- Indexes (with conditional checks)
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id, created_at DESC);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(type);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'source') THEN
    CREATE INDEX IF NOT EXISTS idx_wallet_tx_source ON wallet_transactions(source);
  END IF;
END $$;

-- ============================================================================
-- 5. MESSAGES TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_id UUID NOT NULL REFERENCES bid_repair(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      body TEXT,
      attachments TEXT[] DEFAULT '{}',
      message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji', 'location', 'system')),
      read_at TIMESTAMP,
      deleted_by_sender BOOLEAN DEFAULT FALSE,
      deleted_by_receiver BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id UUID;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;
    
    -- Add foreign key if needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'messages_thread_id_fkey'
    ) THEN
      ALTER TABLE messages 
      ADD CONSTRAINT messages_thread_id_fkey 
      FOREIGN KEY (thread_id) REFERENCES bid_repair(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Indexes (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'thread_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, read_at) WHERE read_at IS NULL;
  END IF;
END $$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Update bid replies count
CREATE OR REPLACE FUNCTION fn_update_bid_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bid_repair
    SET replies_count = replies_count + 1
    WHERE id = NEW.bid_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bid_repair
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.bid_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bid_replies_count ON bid_repair_replies;
CREATE TRIGGER trg_update_bid_replies_count
  AFTER INSERT OR DELETE ON bid_repair_replies
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_bid_replies_count();

-- Update bid updated_at
CREATE OR REPLACE FUNCTION fn_update_bid_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_bid_timestamp ON bid_repair;
CREATE TRIGGER trg_update_bid_timestamp
  BEFORE UPDATE ON bid_repair
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_bid_timestamp();

-- ============================================================================
-- 7. RPC FUNCTIONS
-- ============================================================================

-- Function: Create bid
CREATE OR REPLACE FUNCTION fn_create_bid(
  p_title TEXT,
  p_description TEXT,
  p_vehicle_info JSONB,
  p_images TEXT[] DEFAULT '{}',
  p_location JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_sub_role TEXT;
  v_bid_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check user role
  SELECT sub_role INTO v_sub_role
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_sub_role NOT IN ('car_owner', 'browser') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only car owners and browsers can create bids');
  END IF;
  
  -- Create bid
  INSERT INTO bid_repair (
    owner_id,
    title,
    description,
    vehicle_info,
    images,
    location
  ) VALUES (
    v_user_id,
    p_title,
    p_description,
    p_vehicle_info,
    p_images,
    p_location
  ) RETURNING id INTO v_bid_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'message', 'Bid created successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reply to bid
CREATE OR REPLACE FUNCTION fn_reply_to_bid(
  p_bid_id UUID,
  p_message TEXT,
  p_quote_amount NUMERIC,
  p_estimated_time TEXT DEFAULT NULL,
  p_warranty_offered TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_sub_role TEXT;
  v_verification_status TEXT;
  v_wallet_balance NUMERIC;
  v_reply_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check user role and verification
  SELECT sub_role, verification_status INTO v_sub_role, v_verification_status
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_sub_role != 'garage_owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only garage owners can reply to bids');
  END IF;
  
  IF v_verification_status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Verification required to reply to bids');
  END IF;
  
  -- Check wallet balance
  SELECT balance INTO v_wallet_balance
  FROM bid_wallet
  WHERE garage_owner_id = v_user_id;
  
  IF v_wallet_balance IS NULL THEN
    -- Create wallet if doesn't exist
    INSERT INTO bid_wallet (garage_owner_id, balance)
    VALUES (v_user_id, 0);
    v_wallet_balance := 0;
  END IF;
  
  IF v_wallet_balance < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits. Please top up your wallet.');
  END IF;
  
  -- Create reply
  INSERT INTO bid_repair_replies (
    bid_id,
    garage_owner_id,
    message,
    quote_amount,
    estimated_time,
    warranty_offered
  ) VALUES (
    p_bid_id,
    v_user_id,
    p_message,
    p_quote_amount,
    p_estimated_time,
    p_warranty_offered
  ) RETURNING id INTO v_reply_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'reply_id', v_reply_id,
    'message', 'Reply submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Accept bid reply
CREATE OR REPLACE FUNCTION fn_accept_bid_reply(
  p_bid_id UUID,
  p_reply_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_garage_id UUID;
  v_wallet_balance NUMERIC;
  v_bid_owner UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if user owns the bid
  SELECT owner_id INTO v_bid_owner
  FROM bid_repair
  WHERE id = p_bid_id;
  
  IF v_bid_owner != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Get garage owner ID
  SELECT garage_owner_id INTO v_garage_id
  FROM bid_repair_replies
  WHERE id = p_reply_id AND bid_id = p_bid_id;
  
  IF v_garage_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reply not found');
  END IF;
  
  -- Check wallet balance
  SELECT balance INTO v_wallet_balance
  FROM bid_wallet
  WHERE garage_owner_id = v_garage_id;
  
  IF v_wallet_balance < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Garage owner has insufficient credits');
  END IF;
  
  -- Update bid status
  UPDATE bid_repair
  SET 
    status = 'accepted',
    accepted_reply_id = p_reply_id,
    updated_at = NOW()
  WHERE id = p_bid_id;
  
  -- Update reply status
  UPDATE bid_repair_replies
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = p_reply_id;
  
  -- Reject other replies
  UPDATE bid_repair_replies
  SET status = 'rejected'
  WHERE bid_id = p_bid_id AND id != p_reply_id AND status = 'pending';
  
  -- Deduct credit from wallet
  UPDATE bid_wallet
  SET 
    balance = balance - 1,
    total_spent = total_spent + 1,
    updated_at = NOW()
  WHERE garage_owner_id = v_garage_id;
  
  -- Record transaction
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    source,
    related_bid_id,
    description
  ) VALUES (
    v_garage_id,
    1,
    'debit',
    'bid_acceptance',
    p_bid_id,
    'Credit deducted for accepted bid'
  );
  
  -- Create system message
  INSERT INTO messages (
    thread_id,
    sender_id,
    receiver_id,
    body,
    message_type
  ) VALUES (
    p_bid_id,
    v_user_id,
    v_garage_id,
    'Bid accepted! You can now communicate directly.',
    'system'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bid accepted successfully. Messaging unlocked!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Top up wallet (called by Stripe webhook)
CREATE OR REPLACE FUNCTION fn_topup_wallet(
  p_garage_owner_id UUID,
  p_amount NUMERIC,
  p_stripe_payment_intent_id TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  -- Update or create wallet
  INSERT INTO bid_wallet (garage_owner_id, balance, last_topup, total_earned)
  VALUES (p_garage_owner_id, p_amount, NOW(), p_amount)
  ON CONFLICT (garage_owner_id)
  DO UPDATE SET
    balance = bid_wallet.balance + p_amount,
    total_earned = bid_wallet.total_earned + p_amount,
    last_topup = NOW(),
    updated_at = NOW()
  RETURNING balance INTO v_new_balance;
  
  -- Record transaction
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    source,
    stripe_payment_intent_id,
    metadata,
    description
  ) VALUES (
    p_garage_owner_id,
    p_amount,
    'credit',
    'stripe',
    p_stripe_payment_intent_id,
    p_metadata,
    'Wallet top-up via Stripe'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'message', 'Wallet topped up successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Send message
CREATE OR REPLACE FUNCTION fn_send_message(
  p_thread_id UUID,
  p_receiver_id UUID,
  p_body TEXT,
  p_attachments TEXT[] DEFAULT '{}',
  p_message_type TEXT DEFAULT 'text'
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_bid_status TEXT;
  v_message_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if bid is accepted
  SELECT status INTO v_bid_status
  FROM bid_repair
  WHERE id = p_thread_id;
  
  IF v_bid_status NOT IN ('accepted', 'closed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Messaging only available for accepted bids');
  END IF;
  
  -- Create message
  INSERT INTO messages (
    thread_id,
    sender_id,
    receiver_id,
    body,
    attachments,
    message_type
  ) VALUES (
    p_thread_id,
    v_user_id,
    p_receiver_id,
    p_body,
    p_attachments,
    p_message_type
  ) RETURNING id INTO v_message_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message_id', v_message_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- Bid Repair Policies
CREATE POLICY "users_read_own_bids" ON bid_repair
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "users_create_own_bids" ON bid_repair
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "users_update_own_bids" ON bid_repair
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "garage_read_open_bids" ON bid_repair
FOR SELECT USING (
  status = 'open' OR
  EXISTS(SELECT 1 FROM bid_repair_replies r
         WHERE r.bid_id = bid_repair.id
         AND r.garage_owner_id = auth.uid())
);

-- Bid Replies Policies
CREATE POLICY "garage_create_replies" ON bid_repair_replies
FOR INSERT WITH CHECK (garage_owner_id = auth.uid());

CREATE POLICY "users_read_own_bid_replies" ON bid_repair_replies
FOR SELECT USING (
  EXISTS(SELECT 1 FROM bid_repair b
         WHERE b.id = bid_repair_replies.bid_id
         AND b.owner_id = auth.uid())
);

CREATE POLICY "garage_read_own_replies" ON bid_repair_replies
FOR SELECT USING (garage_owner_id = auth.uid());

-- Wallet Policies
CREATE POLICY "garage_read_own_wallet" ON bid_wallet
FOR SELECT USING (garage_owner_id = auth.uid());

CREATE POLICY "users_read_own_transactions" ON wallet_transactions
FOR SELECT USING (user_id = auth.uid());

-- Message Policies (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
    DROP POLICY IF EXISTS "users_read_own_messages" ON messages;
    CREATE POLICY "users_read_own_messages" ON messages
    FOR SELECT USING (
      sender_id = auth.uid() OR receiver_id = auth.uid()
    );
    
    DROP POLICY IF EXISTS "users_send_messages" ON messages;
    CREATE POLICY "users_send_messages" ON messages
    FOR INSERT WITH CHECK (
      sender_id = auth.uid() AND
      EXISTS(SELECT 1 FROM bid_repair b
             WHERE b.id = thread_id
             AND b.status IN ('accepted', 'closed')
             AND (b.owner_id = auth.uid() OR b.accepted_reply_id IN (
               SELECT id FROM bid_repair_replies WHERE garage_owner_id = auth.uid()
             )))
    );
  END IF;
END $$;

-- Admin policies
CREATE POLICY "admins_read_all_bids" ON bid_repair
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "admins_read_all_replies" ON bid_repair_replies
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "admins_read_all_wallets" ON bid_wallet
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "admins_read_all_transactions" ON wallet_transactions
FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE bid_repair IS 'Repair bids created by car owners and browsers';
COMMENT ON TABLE bid_repair_replies IS 'Replies from garage owners to repair bids';
COMMENT ON TABLE bid_wallet IS 'Credit wallet for garage owners';
COMMENT ON TABLE wallet_transactions IS 'Transaction history for wallet operations';
COMMENT ON TABLE messages IS 'Direct messages between bid owner and garage owner';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20241101211000_bid_repair_system completed successfully';
END $$;
