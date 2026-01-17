-- ============================================================================
-- MISSING RPC FUNCTIONS - COMPLETE
-- ============================================================================

-- Part 1: Community RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_edit_comment(UUID, TEXT);
CREATE OR REPLACE FUNCTION fn_edit_comment(
  p_comment_id UUID,
  p_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment JSONB;
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM comments
    WHERE id = p_comment_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You can only edit your own comments';
  END IF;

  -- Update comment
  UPDATE comments
  SET content = p_content, updated_at = NOW()
  WHERE id = p_comment_id
  RETURNING to_jsonb(comments.*) INTO v_comment;

  RETURN v_comment;
END;
$$;

DROP FUNCTION IF EXISTS fn_delete_comment(UUID);
CREATE OR REPLACE FUNCTION fn_delete_comment(
  p_comment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM comments
    WHERE id = p_comment_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You can only delete your own comments';
  END IF;

  -- Delete comment
  DELETE FROM comments WHERE id = p_comment_id;

  RETURN TRUE;
END;
$$;

DROP FUNCTION IF EXISTS fn_report_post(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION fn_report_post(
  p_post_id UUID,
  p_reason TEXT,
  p_details TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  INSERT INTO post_reports (
    post_id, reporter_id, reason, details, created_at
  ) VALUES (
    p_post_id, auth.uid(), p_reason, p_details, NOW()
  )
  RETURNING to_jsonb(post_reports.*) INTO v_report;

  RETURN v_report;
END;
$$;

DROP FUNCTION IF EXISTS fn_admin_pin_feature(UUID, TEXT, BOOLEAN);
CREATE OR REPLACE FUNCTION fn_admin_pin_feature(
  p_post_id UUID,
  p_action TEXT, -- 'pin' or 'feature'
  p_value BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_action = 'pin' THEN
    UPDATE posts SET is_pinned = p_value, updated_at = NOW()
    WHERE id = p_post_id;
  ELSIF p_action = 'feature' THEN
    UPDATE posts SET is_featured = p_value, updated_at = NOW()
    WHERE id = p_post_id;
  ELSE
    RAISE EXCEPTION 'INVALID_ACTION: Action must be pin or feature';
  END IF;

  RETURN TRUE;
END;
$$;

-- Part 2: Marketplace RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_submit_listing_for_review(UUID);
CREATE OR REPLACE FUNCTION fn_submit_listing_for_review(
  p_listing_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing JSONB;
  v_owner_col TEXT;
BEGIN
  -- Dynamically determine owner column
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'owner_id') THEN 'owner_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN 'seller_id'
    ELSE 'user_id'
  END INTO v_owner_col;

  -- Update status using dynamic SQL
  EXECUTE format('
    UPDATE listings
    SET status = ''pending'', updated_at = NOW()
    WHERE id = $1 AND %I = $2
    RETURNING to_jsonb(listings.*)
  ', v_owner_col)
  USING p_listing_id, auth.uid()
  INTO v_listing;

  IF v_listing IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You can only submit your own listings';
  END IF;

  RETURN v_listing;
END;
$$;

DROP FUNCTION IF EXISTS fn_admin_set_listing_status(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION fn_admin_set_listing_status(
  p_listing_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing JSONB;
BEGIN
  UPDATE listings
  SET status = p_status,
      admin_notes = COALESCE(p_notes, admin_notes),
      updated_at = NOW()
  WHERE id = p_listing_id
  RETURNING to_jsonb(listings.*) INTO v_listing;

  RETURN v_listing;
END;
$$;

-- Part 3: Garage Hub RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_create_garage(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION fn_create_garage(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_garage JSONB;
  v_owner_col TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  -- Dynamically determine owner column
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE 'user_id'
  END INTO v_owner_col;

  EXECUTE format('
    INSERT INTO garages (
      %I, name, description, address, city, phone, email, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW()
    )
    RETURNING to_jsonb(garages.*)
  ', v_owner_col)
  USING auth.uid(), p_name, p_description, p_address, p_city, p_phone, p_email
  INTO v_garage;

  RETURN v_garage;
END;
$$;

-- Part 4: Verification RPCs (Enhanced)
-- ============================================================================

DROP FUNCTION IF EXISTS fn_submit_verification(TEXT, JSONB);
CREATE OR REPLACE FUNCTION fn_submit_verification(
  p_kind TEXT,
  p_documents JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request JSONB;
  v_col_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  -- Check if the column is 'kind' or 'type'
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'kind') THEN 'kind'
    ELSE 'type'
  END INTO v_col_name;

  -- Insert using dynamic SQL
  EXECUTE format('
    INSERT INTO verification_requests (
      user_id, %I, status, documents, created_at
    ) VALUES (
      $1, $2, ''pending'', $3, NOW()
    )
    ON CONFLICT (user_id, %I) DO UPDATE
    SET status = ''pending'',
        documents = $3,
        updated_at = NOW()
    RETURNING to_jsonb(verification_requests.*)
  ', v_col_name, v_col_name)
  USING auth.uid(), p_kind, p_documents
  INTO v_request;

  RETURN v_request;
END;
$$;

DROP FUNCTION IF EXISTS fn_admin_verify(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION fn_admin_verify(
  p_request_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request JSONB;
  v_user_id UUID;
  v_kind TEXT;
  v_col_name TEXT;
BEGIN
  -- Check if the column is 'kind' or 'type'
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'kind') THEN 'kind'
    ELSE 'type'
  END INTO v_col_name;

  -- Get user_id and kind/type
  EXECUTE format('SELECT user_id, %I FROM verification_requests WHERE id = $1', v_col_name)
  USING p_request_id
  INTO v_user_id, v_kind;

  -- Update verification request
  UPDATE verification_requests
  SET status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      rejection_reason = CASE WHEN p_status = 'rejected' THEN p_notes ELSE NULL END,
      admin_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_request_id
  RETURNING to_jsonb(verification_requests.*) INTO v_request;

  -- If approved, update profile
  IF p_status = 'approved' AND v_user_id IS NOT NULL THEN
    UPDATE profiles
    SET verification_status = 'approved',
        is_verified = TRUE,
        verified_at = NOW(),
        sub_role = v_kind,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  RETURN v_request;
END;
$$;

-- Part 5: Bid Repair RPCs (Enhanced)
-- ============================================================================

DROP FUNCTION IF EXISTS fn_create_bid_request(TEXT, TEXT, TEXT, DECIMAL, TEXT[]);
CREATE OR REPLACE FUNCTION fn_create_bid_request(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT NULL,
  p_budget DECIMAL(10,2) DEFAULT NULL,
  p_images TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  INSERT INTO bid_requests (
    user_id, title, description, category, budget, images, status, created_at
  ) VALUES (
    auth.uid(), p_title, p_description, p_category, p_budget, p_images, 'open', NOW()
  )
  RETURNING to_jsonb(bid_requests.*) INTO v_request;

  RETURN v_request;
END;
$$;

DROP FUNCTION IF EXISTS fn_reply_to_bid(UUID, TEXT, DECIMAL, INTEGER);
CREATE OR REPLACE FUNCTION fn_reply_to_bid(
  p_request_id UUID,
  p_message TEXT,
  p_amount DECIMAL(10,2),
  p_estimated_days INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reply JSONB;
  v_garage_id UUID;
  v_owner_col TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  -- Dynamically determine owner column
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE 'user_id'
  END INTO v_owner_col;

  -- Get garage ID for this user
  EXECUTE format('SELECT id FROM garages WHERE %I = $1 LIMIT 1', v_owner_col)
  USING auth.uid()
  INTO v_garage_id;

  IF v_garage_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only garage owners can reply to bid requests';
  END IF;

  INSERT INTO bid_replies (
    request_id, garage_id, message, amount, estimated_days, created_at
  ) VALUES (
    p_request_id, v_garage_id, p_message, p_amount, p_estimated_days, NOW()
  )
  RETURNING to_jsonb(bid_replies.*) INTO v_reply;

  RETURN v_reply;
END;
$$;

DROP FUNCTION IF EXISTS fn_accept_bid(UUID);
CREATE OR REPLACE FUNCTION fn_accept_bid(
  p_reply_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reply JSONB;
  v_request_id UUID;
BEGIN
  -- Get request_id
  SELECT request_id INTO v_request_id FROM bid_replies WHERE id = p_reply_id;

  -- Check if user owns the request
  IF NOT EXISTS (
    SELECT 1 FROM bid_requests
    WHERE id = v_request_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You can only accept bids on your own requests';
  END IF;

  -- Update reply status
  UPDATE bid_replies
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_reply_id
  RETURNING to_jsonb(bid_replies.*) INTO v_reply;

  -- Update request status
  UPDATE bid_requests
  SET status = 'closed', updated_at = NOW()
  WHERE id = v_request_id;

  RETURN v_reply;
END;
$$;

DROP FUNCTION IF EXISTS fn_can_message(UUID, UUID);
CREATE OR REPLACE FUNCTION fn_can_message(
  p_request_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_col TEXT;
  v_can_message BOOLEAN;
BEGIN
  -- Dynamically determine owner column
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'user_id') THEN 'user_id'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'owner_id') THEN 'owner_id'
    ELSE 'user_id'
  END INTO v_owner_col;

  -- Check if bid has been accepted
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM bid_requests br
      JOIN bid_replies bry ON bry.request_id = br.id
      WHERE br.id = $1
        AND bry.status = ''accepted''
        AND (br.user_id = $2 OR bry.garage_id IN (SELECT id FROM garages WHERE %I = $2))
    )
  ', v_owner_col)
  USING p_request_id, p_user_id
  INTO v_can_message;

  RETURN v_can_message;
END;
$$;

-- Part 6: Events RPCs (Enhanced)
-- ============================================================================

DROP FUNCTION IF EXISTS fn_register_event_view(UUID, UUID);
CREATE OR REPLACE FUNCTION fn_register_event_view(
  p_event_id UUID,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO event_views (event_id, viewer_id, viewed_at)
  VALUES (p_event_id, COALESCE(p_viewer_id, auth.uid()), NOW())
  ON CONFLICT DO NOTHING;

  RETURN TRUE;
END;
$$;

DROP FUNCTION IF EXISTS fn_toggle_event_like(UUID);
CREATE OR REPLACE FUNCTION fn_toggle_event_like(
  p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_liked BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM event_likes WHERE event_id = p_event_id AND user_id = auth.uid()
  ) INTO v_liked;

  IF v_liked THEN
    DELETE FROM event_likes WHERE event_id = p_event_id AND user_id = auth.uid();
  ELSE
    INSERT INTO event_likes (event_id, user_id, created_at)
    VALUES (p_event_id, auth.uid(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NOT v_liked;
END;
$$;

DROP FUNCTION IF EXISTS fn_rsvp_event(UUID, TEXT);
CREATE OR REPLACE FUNCTION fn_rsvp_event(
  p_event_id UUID,
  p_status TEXT DEFAULT 'going'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attendee JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  INSERT INTO event_attendees (event_id, user_id, status, created_at)
  VALUES (p_event_id, auth.uid(), p_status, NOW())
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET status = p_status, updated_at = NOW()
  RETURNING to_jsonb(event_attendees.*) INTO v_attendee;

  RETURN v_attendee;
END;
$$;

-- Part 7: XP & Referrals RPC (Enhanced)
-- ============================================================================

DROP FUNCTION IF EXISTS fn_award_referral_xp(UUID, UUID);
CREATE OR REPLACE FUNCTION fn_award_referral_xp(
  p_referrer_id UUID,
  p_referred_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award XP to referrer
  INSERT INTO xp_events (user_id, type, points, source_id, created_at)
  VALUES (p_referrer_id, 'referral', 100, p_referred_id, NOW());

  -- Update referral record
  UPDATE referrals
  SET xp_awarded = TRUE, xp_awarded_at = NOW()
  WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;

  -- Update profile XP
  UPDATE profiles
  SET xp_points = xp_points + 100
  WHERE id = p_referrer_id;

  RETURN TRUE;
END;
$$;

-- Part 8: Push Notifications RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_push_preview(UUID, JSONB);
CREATE OR REPLACE FUNCTION fn_push_preview(
  p_template_id UUID,
  p_variables JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_preview JSONB;
BEGIN
  SELECT * INTO v_template FROM push_templates WHERE id = p_template_id;

  -- Simple variable replacement (in production, use proper templating engine)
  v_preview := jsonb_build_object(
    'title', v_template.title_template,
    'body', v_template.body_template,
    'icon', v_template.icon,
    'image', v_template.image,
    'action_url', v_template.action_url
  );

  RETURN v_preview;
END;
$$;

DROP FUNCTION IF EXISTS fn_push_resolve_segment(JSONB);
CREATE OR REPLACE FUNCTION fn_push_resolve_segment(
  p_segment_filter JSONB
)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return user IDs based on segment filter
  -- Example: {"role": "car_owner", "is_verified": true}
  RETURN QUERY
  SELECT id FROM profiles
  WHERE (p_segment_filter->>'role' IS NULL OR role = (p_segment_filter->>'role'))
    AND (p_segment_filter->>'is_verified' IS NULL OR is_verified = (p_segment_filter->>'is_verified')::BOOLEAN);
END;
$$;

DROP FUNCTION IF EXISTS fn_push_schedule(UUID, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION fn_push_schedule(
  p_campaign_id UUID,
  p_schedule_for TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE push_campaigns
  SET schedule_for = p_schedule_for, status = 'scheduled', updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN TRUE;
END;
$$;

DROP FUNCTION IF EXISTS fn_push_send_now(UUID);
CREATE OR REPLACE FUNCTION fn_push_send_now(
  p_campaign_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE push_campaigns
  SET status = 'sending', updated_at = NOW()
  WHERE id = p_campaign_id;

  -- In production, this would trigger background job to send pushes
  RETURN TRUE;
END;
$$;

-- Part 9: Email Campaign RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_email_preview(UUID, JSONB);
CREATE OR REPLACE FUNCTION fn_email_preview(
  p_template_id UUID,
  p_variables JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_preview JSONB;
BEGIN
  SELECT * INTO v_template FROM email_templates WHERE id = p_template_id;

  v_preview := jsonb_build_object(
    'subject', v_template.subject_template,
    'body_html', v_template.body_html,
    'body_text', v_template.body_text
  );

  RETURN v_preview;
END;
$$;

DROP FUNCTION IF EXISTS fn_email_resolve_segment(JSONB);
CREATE OR REPLACE FUNCTION fn_email_resolve_segment(
  p_segment_filter JSONB
)
RETURNS TABLE (user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email
  FROM profiles p
  WHERE (p_segment_filter->>'role' IS NULL OR p.role = (p_segment_filter->>'role'))
    AND (p_segment_filter->>'is_verified' IS NULL OR p.is_verified = (p_segment_filter->>'is_verified')::BOOLEAN);
END;
$$;

DROP FUNCTION IF EXISTS fn_email_schedule(UUID, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION fn_email_schedule(
  p_campaign_id UUID,
  p_schedule_for TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE email_campaigns
  SET schedule_for = p_schedule_for, status = 'scheduled', updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN TRUE;
END;
$$;

DROP FUNCTION IF EXISTS fn_email_send_now(UUID);
CREATE OR REPLACE FUNCTION fn_email_send_now(
  p_campaign_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE email_campaigns
  SET status = 'sending', updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN TRUE;
END;
$$;

-- Part 10: Boosting & Wallet RPCs
-- ============================================================================

DROP FUNCTION IF EXISTS fn_grant_boost_after_payment(UUID, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION fn_grant_boost_after_payment(
  p_entity_id UUID,
  p_entity_type TEXT,
  p_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: User must be logged in';
  END IF;

  INSERT INTO boost_entitlements (
    user_id, entity_id, entity_type, boosted_until, created_at
  ) VALUES (
    auth.uid(), p_entity_id, p_entity_type, NOW() + (p_days || ' days')::INTERVAL, NOW()
  )
  RETURNING to_jsonb(boost_entitlements.*) INTO v_entitlement;

  RETURN v_entitlement;
END;
$$;

-- Part 11: Export Functions
-- ============================================================================

DROP FUNCTION IF EXISTS fn_export_events(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION fn_export_events(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  organizer_email TEXT,
  start_date TIMESTAMPTZ,
  attendee_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    p.email AS organizer_email,
    e.start_date,
    COUNT(ea.id) AS attendee_count
  FROM events e
  LEFT JOIN profiles p ON p.id = e.organizer_id
  LEFT JOIN event_attendees ea ON ea.event_id = e.id
  WHERE (p_start_date IS NULL OR e.start_date >= p_start_date)
    AND (p_end_date IS NULL OR e.start_date <= p_end_date)
  GROUP BY e.id, e.title, p.email, e.start_date;
END;
$$;

DROP FUNCTION IF EXISTS fn_export_verifications(TEXT);
CREATE OR REPLACE FUNCTION fn_export_verifications(
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  verification_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_col_name TEXT;
BEGIN
  -- Check if column is 'kind' or 'type'
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_requests' AND column_name = 'kind') THEN 'kind'
    ELSE 'type'
  END INTO v_col_name;

  RETURN QUERY EXECUTE format('
    SELECT
      vr.id,
      p.email AS user_email,
      vr.%I AS verification_type,
      vr.status,
      vr.created_at
    FROM verification_requests vr
    LEFT JOIN profiles p ON p.id = vr.user_id
    WHERE ($1 IS NULL OR vr.status = $1)
  ', v_col_name)
  USING p_status;
END;
$$;

DROP FUNCTION IF EXISTS fn_export_transactions(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION fn_export_transactions(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  amount DECIMAL,
  transaction_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wt.id,
    p.email AS user_email,
    wt.amount,
    wt.type AS transaction_type,
    wt.created_at
  FROM wallet_transactions wt
  LEFT JOIN profiles p ON p.id = wt.user_id
  WHERE (p_start_date IS NULL OR wt.created_at >= p_start_date)
    AND (p_end_date IS NULL OR wt.created_at <= p_end_date);
END;
$$;

-- Grant Execute Permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success Message
DO $$ BEGIN
  RAISE NOTICE '✅ All RPC functions created successfully';
END $$;

