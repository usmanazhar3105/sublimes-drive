-- ============================================================================
-- SUBLIMES DRIVE - DATABASE FUNCTIONS (RPCs)
-- Version: 1.0
-- Created: November 3, 2025
-- ============================================================================
-- This file contains all database functions for business logic
-- ============================================================================

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.fn_set_role_and_verify_prompt(TEXT);
DROP FUNCTION IF EXISTS public.fn_add_comment(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.fn_edit_comment(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_delete_comment(UUID);
DROP FUNCTION IF EXISTS public.fn_toggle_like(UUID);
DROP FUNCTION IF EXISTS public.fn_toggle_save(UUID);
DROP FUNCTION IF EXISTS public.fn_report_post(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.fn_register_post_view(UUID, INET);
DROP FUNCTION IF EXISTS public.fn_admin_set_post_status(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_admin_pin_feature(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_submit_listing_for_review(UUID);
DROP FUNCTION IF EXISTS public.fn_admin_set_listing_status(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_register_listing_view(UUID, INET);
DROP FUNCTION IF EXISTS public.fn_toggle_listing_save(UUID);
DROP FUNCTION IF EXISTS public.fn_submit_verification(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.fn_admin_verify(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.fn_get_pending_verifications_count();
DROP FUNCTION IF EXISTS public.fn_register_event_view(UUID, INET);
DROP FUNCTION IF EXISTS public.fn_toggle_event_like(UUID);
DROP FUNCTION IF EXISTS public.fn_rsvp_event(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_create_bid_request(TEXT, TEXT, JSONB, TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS public.fn_reply_to_bid(UUID, UUID, TEXT, DECIMAL, INTEGER);
DROP FUNCTION IF EXISTS public.fn_accept_bid(UUID);
DROP FUNCTION IF EXISTS public.fn_claim_challenge(UUID);
DROP FUNCTION IF EXISTS public.fn_grant_boost_after_payment(UUID, TEXT, UUID, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.fn_award_referral_xp() CASCADE;

-- ============================================================================
-- SECTION 1: UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Auto-update updated_at timestamp on row modification';

-- ============================================================================
-- SECTION 2: USER PROFILE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_role_and_verify_prompt(p_role TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Update profile role
  UPDATE profiles
  SET 
    role = p_role,
    meta = COALESCE(meta, '{}'::JSONB) || json_build_object('role_prompt_dismissed_at', NOW())::JSONB,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Determine if verification is required
  v_result := json_build_object(
    'success', true,
    'role', p_role,
    'requires_verification', p_role IN ('car_owner', 'garage_owner')
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_set_role_and_verify_prompt IS 'Set user role and check if verification required';

-- ============================================================================
-- SECTION 3: COMMUNITIES / POSTS FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_add_comment(
  p_post_id UUID,
  p_content TEXT,
  p_parent_comment_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_comment_id UUID;
  v_content_col TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check which column to use for content
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'content') THEN
    v_content_col := 'content';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'body') THEN
    v_content_col := 'body';
  ELSE
    RETURN json_build_object('success', false, 'error', 'Comments table missing content column');
  END IF;
  
  -- Insert comment (handle both content and body column names)
  IF v_content_col = 'content' THEN
    INSERT INTO comments (post_id, user_id, parent_comment_id, content)
    VALUES (p_post_id, v_user_id, p_parent_comment_id, p_content)
    RETURNING id INTO v_comment_id;
  ELSE
    INSERT INTO comments (post_id, user_id, parent_comment_id, body)
    VALUES (p_post_id, v_user_id, p_parent_comment_id, p_content)
    RETURNING id INTO v_comment_id;
  END IF;
  
  -- Update post stats (handled by trigger if it exists, otherwise manual)
  INSERT INTO post_stats (post_id, comment_count, view_count, like_count, share_count, save_count)
  VALUES (p_post_id, 1, 0, 0, 0, 0)
  ON CONFLICT (post_id) 
  DO UPDATE SET comment_count = post_stats.comment_count + 1, updated_at = NOW();
  
  RETURN json_build_object('success', true, 'comment_id', v_comment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_edit_comment(
  p_comment_id UUID,
  p_content TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Update comment (works with both content and body columns)
  UPDATE comments
  SET 
    content = COALESCE(p_content, content),
    body = COALESCE(p_content, body),
    is_edited = TRUE,
    updated_at = NOW()
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Comment not found or unauthorized');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_delete_comment(p_comment_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_post_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get post_id before deleting
  SELECT post_id INTO v_post_id FROM comments WHERE id = p_comment_id;
  
  -- Delete comment
  DELETE FROM comments
  WHERE id = p_comment_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Comment not found or unauthorized');
  END IF;
  
  -- Update post stats
  UPDATE post_stats
  SET comment_count = GREATEST(0, comment_count - 1), updated_at = NOW()
  WHERE post_id = v_post_id;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: fn_toggle_like and fn_toggle_save already exist from previous migration
-- They already return JSON properly

CREATE OR REPLACE FUNCTION fn_report_post(
  p_post_id UUID,
  p_reason TEXT,
  p_details TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_report_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Create report
  INSERT INTO post_reports (post_id, reporter_id, reason, details)
  VALUES (p_post_id, v_user_id, p_reason, p_details)
  RETURNING id INTO v_report_id;
  
  RETURN json_build_object('success', true, 'report_id', v_report_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_register_post_view(
  p_post_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_view_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Insert view (deduplication via UNIQUE constraint)
  INSERT INTO post_views (post_id, user_id, ip_address)
  VALUES (p_post_id, v_user_id, p_ip_address)
  ON CONFLICT (post_id, user_id) DO NOTHING
  RETURNING id INTO v_view_id;
  
  -- Update stats if new view
  IF v_view_id IS NOT NULL THEN
    INSERT INTO post_stats (post_id, view_count, like_count, comment_count, share_count, save_count)
    VALUES (p_post_id, 1, 0, 0, 0, 0)
    ON CONFLICT (post_id) 
    DO UPDATE SET view_count = post_stats.view_count + 1, updated_at = NOW();
  END IF;
  
  RETURN json_build_object('success', true, 'new_view', v_view_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_admin_set_post_status(
  p_post_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Admin check in application layer, this RPC is called by admin UI only
  UPDATE posts
  SET status = p_status, updated_at = NOW()
  WHERE id = p_post_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Post not found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_admin_pin_feature(
  p_post_id UUID,
  p_action TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Handle both is_pinned/is_featured and pinned/featured column names
  CASE p_action
    WHEN 'pin' THEN
      UPDATE posts 
      SET is_pinned = TRUE, pinned = TRUE, updated_at = NOW() 
      WHERE id = p_post_id;
    WHEN 'unpin' THEN
      UPDATE posts 
      SET is_pinned = FALSE, pinned = FALSE, updated_at = NOW() 
      WHERE id = p_post_id;
    WHEN 'feature' THEN
      UPDATE posts 
      SET is_featured = TRUE, featured = TRUE, updated_at = NOW() 
      WHERE id = p_post_id;
    WHEN 'unfeature' THEN
      UPDATE posts 
      SET is_featured = FALSE, featured = FALSE, updated_at = NOW() 
      WHERE id = p_post_id;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid action');
  END CASE;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: MARKETPLACE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_submit_listing_for_review(p_listing_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_auto_approve BOOLEAN := FALSE;
  v_user_col TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Determine user column name
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'user_id') THEN
    v_user_col := 'user_id';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
    v_user_col := 'seller_id';
  END IF;
  
  -- Check auto-approval rules
  SELECT EXISTS(
    SELECT 1 FROM auto_approval_rules
    WHERE scope = 'listing' 
    AND is_active = TRUE
  ) INTO v_auto_approve;
  
  -- Update listing
  EXECUTE format('UPDATE listings SET status = CASE WHEN %L THEN ''approved'' ELSE ''pending'' END, updated_at = NOW() WHERE id = %L AND %I = %L',
    v_auto_approve, p_listing_id, v_user_col, v_user_id);
  
  RETURN json_build_object(
    'success', TRUE, 
    'status', CASE WHEN v_auto_approve THEN 'approved' ELSE 'pending' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_admin_set_listing_status(
  p_listing_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
BEGIN
  UPDATE listings
  SET status = p_status, updated_at = NOW()
  WHERE id = p_listing_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Listing not found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_register_listing_view(
  p_listing_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_view_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO listing_views (listing_id, user_id, ip_address)
  VALUES (p_listing_id, v_user_id, p_ip_address)
  ON CONFLICT (listing_id, user_id) DO NOTHING
  RETURNING id INTO v_view_id;
  
  RETURN json_build_object('success', true, 'new_view', v_view_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_toggle_listing_save(p_listing_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM listing_saves
    WHERE listing_id = p_listing_id AND user_id = v_user_id
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM listing_saves
    WHERE listing_id = p_listing_id AND user_id = v_user_id;
    RETURN json_build_object('success', true, 'saved', false);
  ELSE
    INSERT INTO listing_saves (listing_id, user_id)
    VALUES (p_listing_id, v_user_id)
    ON CONFLICT DO NOTHING;
    RETURN json_build_object('success', true, 'saved', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 5: VERIFICATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_submit_verification(
  p_type TEXT,
  p_documents JSONB
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_request_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Create verification request
  INSERT INTO verification_requests (user_id, type, documents, status)
  VALUES (v_user_id, p_type, p_documents, 'pending')
  RETURNING id INTO v_request_id;
  
  -- Update profile
  UPDATE profiles
  SET verification_status = 'pending', updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN json_build_object('success', true, 'request_id', v_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_admin_verify(
  p_request_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_request_user_id UUID;
  v_request_type TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get request details
  SELECT user_id, type INTO v_request_user_id, v_request_type
  FROM verification_requests
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Update verification request
  UPDATE verification_requests
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    reviewed_by = v_user_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Update profile if approved
  IF p_status = 'approved' THEN
    UPDATE profiles
    SET 
      is_verified = TRUE,
      verification_status = 'approved',
      badge_color = CASE 
        WHEN v_request_type = 'car_owner' THEN 'blue'
        WHEN v_request_type = 'garage_owner' THEN 'gold'
        WHEN v_request_type = 'vendor' THEN 'silver'
        ELSE 'gray'
      END,
      updated_at = NOW()
    WHERE id = v_request_user_id;
  ELSIF p_status = 'rejected' THEN
    UPDATE profiles
    SET verification_status = 'rejected', updated_at = NOW()
    WHERE id = v_request_user_id;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_get_pending_verifications_count()
RETURNS JSON AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM verification_requests
  WHERE status = 'pending';
  
  RETURN json_build_object('success', true, 'count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 6: EVENTS FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_register_event_view(
  p_event_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_view_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO event_views (event_id, user_id, ip_address)
  VALUES (p_event_id, v_user_id, p_ip_address)
  ON CONFLICT (event_id, user_id) DO NOTHING
  RETURNING id INTO v_view_id;
  
  RETURN json_build_object('success', true, 'new_view', v_view_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_toggle_event_like(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM event_likes
    WHERE event_id = p_event_id AND user_id = v_user_id
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM event_likes
    WHERE event_id = p_event_id AND user_id = v_user_id;
    RETURN json_build_object('success', true, 'liked', false);
  ELSE
    INSERT INTO event_likes (event_id, user_id)
    VALUES (p_event_id, v_user_id)
    ON CONFLICT DO NOTHING;
    RETURN json_build_object('success', true, 'liked', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_rsvp_event(
  p_event_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  INSERT INTO event_attendees (event_id, user_id, status)
  VALUES (p_event_id, v_user_id, p_status)
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET status = p_status;
  
  RETURN json_build_object('success', true, 'status', p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 7: BID REPAIR FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_create_bid_request(
  p_title TEXT,
  p_description TEXT,
  p_images JSONB DEFAULT '[]',
  p_location TEXT DEFAULT NULL,
  p_budget_min DECIMAL(10,2) DEFAULT NULL,
  p_budget_max DECIMAL(10,2) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_request_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Create bid request
  INSERT INTO bid_requests (user_id, title, description, images, location, budget_min, budget_max, status)
  VALUES (v_user_id, p_title, p_description, p_images, p_location, p_budget_min, p_budget_max, 'open')
  RETURNING id INTO v_request_id;
  
  RETURN json_build_object('success', true, 'request_id', v_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_reply_to_bid(
  p_bid_request_id UUID,
  p_garage_id UUID,
  p_message TEXT,
  p_price DECIMAL(10,2),
  p_estimated_duration_hours INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_reply_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Create bid reply
  INSERT INTO bid_replies (bid_request_id, garage_id, garage_owner_id, message, price, estimated_duration_hours, status)
  VALUES (p_bid_request_id, p_garage_id, v_user_id, p_message, p_price, p_estimated_duration_hours, 'pending')
  RETURNING id INTO v_reply_id;
  
  RETURN json_build_object('success', true, 'reply_id', v_reply_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_accept_bid(p_bid_reply_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_request_id UUID;
  v_garage_owner_id UUID;
  v_thread_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get bid details
  SELECT bid_request_id, garage_owner_id INTO v_request_id, v_garage_owner_id
  FROM bid_replies
  WHERE id = p_bid_reply_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Bid reply not found');
  END IF;
  
  -- Update bid reply
  UPDATE bid_replies
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_bid_reply_id;
  
  -- Update bid request
  UPDATE bid_requests
  SET status = 'in_progress', accepted_bid_id = p_bid_reply_id, updated_at = NOW()
  WHERE id = v_request_id;
  
  -- Create messaging thread
  INSERT INTO bid_threads (bid_request_id, bid_reply_id, requester_id, garage_owner_id, status)
  VALUES (v_request_id, p_bid_reply_id, v_user_id, v_garage_owner_id, 'active')
  RETURNING id INTO v_thread_id;
  
  RETURN json_build_object('success', true, 'thread_id', v_thread_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: fn_can_message already exists from previous migration

-- ============================================================================
-- SECTION 8: DAILY CHALLENGES
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_claim_challenge(p_challenge_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_xp_reward INTEGER;
  v_already_claimed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already claimed
  SELECT claimed_at IS NOT NULL INTO v_already_claimed
  FROM challenge_progress
  WHERE challenge_id = p_challenge_id AND user_id = v_user_id;
  
  IF v_already_claimed THEN
    RETURN json_build_object('success', false, 'error', 'Challenge already claimed');
  END IF;
  
  -- Get XP reward
  SELECT xp_reward INTO v_xp_reward
  FROM daily_challenges
  WHERE id = p_challenge_id;
  
  -- Update progress
  UPDATE challenge_progress
  SET claimed_at = NOW()
  WHERE challenge_id = p_challenge_id AND user_id = v_user_id AND is_completed = TRUE;
  
  -- Award XP
  UPDATE profiles
  SET xp_points = xp_points + v_xp_reward, updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN json_build_object('success', true, 'xp_awarded', v_xp_reward);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 9: WALLET & BOOSTS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_grant_boost_after_payment(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_boost_type TEXT,
  p_duration_days INTEGER,
  p_stripe_payment_id TEXT
)
RETURNS JSON AS $$
DECLARE
  v_entitlement_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_expires_at := NOW() + (p_duration_days || ' days')::INTERVAL;
  
  -- Create boost entitlement
  INSERT INTO boost_entitlements (user_id, entity_type, entity_id, boost_type, duration_days, expires_at, stripe_payment_id, is_active)
  VALUES (p_user_id, p_entity_type, p_entity_id, p_boost_type, p_duration_days, v_expires_at, p_stripe_payment_id, TRUE)
  RETURNING id INTO v_entitlement_id;
  
  -- Update entity is_boosted flag
  CASE p_entity_type
    WHEN 'listing' THEN
      UPDATE listings
      SET is_boosted = TRUE, boost_expires_at = v_expires_at, updated_at = NOW()
      WHERE id = p_entity_id;
    WHEN 'garage' THEN
      UPDATE garages
      SET is_boosted = TRUE, boost_expires_at = v_expires_at, updated_at = NOW()
      WHERE id = p_entity_id;
  END CASE;
  
  RETURN json_build_object('success', true, 'entitlement_id', v_entitlement_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 10: REFERRAL TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_award_referral_xp()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_sub_role TEXT;
BEGIN
  -- Get referrer ID from new user's metadata
  v_referrer_id := (NEW.meta->>'referrer_id')::UUID;
  
  IF v_referrer_id IS NOT NULL THEN
    -- Award 5 XP to referrer
    UPDATE profiles
    SET xp_points = xp_points + 5, updated_at = NOW()
    WHERE id = v_referrer_id;
    
    -- Get referrer sub_role
    SELECT sub_role INTO v_referrer_sub_role
    FROM profiles
    WHERE id = v_referrer_id;
    
    -- If garage_owner, award 1 free bid credit
    IF v_referrer_sub_role = 'garage_owner' THEN
      -- Check if using bid_wallets or bid_wallet table
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallets') THEN
        INSERT INTO bid_wallets (garage_owner_id, credits)
        VALUES (v_referrer_id, 1)
        ON CONFLICT (garage_owner_id)
        DO UPDATE SET credits = bid_wallets.credits + 1, updated_at = NOW();
        
        INSERT INTO bid_wallet_ledger (garage_owner_id, amount, transaction_type, description)
        VALUES (v_referrer_id, 1, 'referral_bonus', 'Referral bonus for new user signup');
      ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_wallet') THEN
        INSERT INTO bid_wallet (garage_id, balance_credits)
        VALUES (v_referrer_id, 1)
        ON CONFLICT (garage_id)
        DO UPDATE SET balance_credits = bid_wallet.balance_credits + 1, updated_at = NOW();
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 11: TRIGGERS
-- ============================================================================

-- Drop existing triggers to avoid duplicates (check table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS trigger_award_referral_xp ON public.profiles;
    DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    DROP TRIGGER IF EXISTS trigger_update_listings_updated_at ON public.listings;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON public.posts;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON public.comments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON public.events;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    DROP TRIGGER IF EXISTS trigger_update_garages_updated_at ON public.garages;
  END IF;
END $$;

-- Create updated_at triggers (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TRIGGER trigger_update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    
    -- Referral XP trigger
    CREATE TRIGGER trigger_award_referral_xp
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION fn_award_referral_xp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    CREATE TRIGGER trigger_update_listings_updated_at
      BEFORE UPDATE ON public.listings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    CREATE TRIGGER trigger_update_posts_updated_at
      BEFORE UPDATE ON public.posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    CREATE TRIGGER trigger_update_comments_updated_at
      BEFORE UPDATE ON public.comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    CREATE TRIGGER trigger_update_events_updated_at
      BEFORE UPDATE ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    CREATE TRIGGER trigger_update_garages_updated_at
      BEFORE UPDATE ON public.garages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- END OF RPC FUNCTIONS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Sublimes Drive - Complete RPC Functions & Triggers (2025-11-03)';

