-- ============================================================================
-- MISSING RPCs PART 2: Garage Hub & Bid Repair
-- Date: 2025-01-03
-- ============================================================================

-- ============================================================================
-- 1. GARAGE HUB RPCs
-- ============================================================================

-- Create garage
CREATE OR REPLACE FUNCTION public.fn_create_garage(
  p_name TEXT,
  p_description TEXT,
  p_location TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_services TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_garage_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO public.garages (owner_id, name, description, location, phone, email, services, status)
  VALUES (v_user_id, p_name, p_description, p_location, p_phone, p_email, p_services, 'pending')
  RETURNING id INTO v_garage_id;
  
  -- Log analytics event
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id)
  VALUES (v_user_id, 'create_garage', 'garage', v_garage_id);
  
  RETURN v_garage_id;
END;
$$;

-- Submit verification request
CREATE OR REPLACE FUNCTION public.fn_submit_verification(
  p_type TEXT,
  p_documents JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_request_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO public.verification_requests (user_id, type, documents, status)
  VALUES (v_user_id, p_type, p_documents, 'pending')
  RETURNING id INTO v_request_id;
  
  -- Log analytics event
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id)
  VALUES (v_user_id, 'submit_verification', 'verification', v_request_id);
  
  RETURN v_request_id;
END;
$$;

-- Admin verify (approve/reject)
CREATE OR REPLACE FUNCTION public.fn_admin_verify(
  p_request_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_user_id UUID;
  v_type TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Note: Admin check in application layer
  
  -- Get verification details
  SELECT user_id, type INTO v_user_id, v_type
  FROM public.verification_requests
  WHERE id = p_request_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Verification request not found';
  END IF;
  
  -- Update verification request
  UPDATE public.verification_requests
  SET status = p_status, reviewed_by = v_admin_id, reviewed_at = NOW(), admin_notes = p_notes
  WHERE id = p_request_id;
  
  -- If approved, update profile
  IF p_status = 'approved' THEN
    UPDATE public.profiles
    SET 
      verification_status = 'approved',
      is_verified = TRUE,
      verified_at = NOW(),
      badge_color = CASE
        WHEN v_type = 'car_owner' THEN 'green'
        WHEN v_type = 'garage_owner' THEN 'blue'
        WHEN v_type = 'vendor' THEN 'purple'
        ELSE badge_color
      END
    WHERE id = v_user_id;
  END IF;
  
  -- Log audit event
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_admin_id, 'verify_user', 'verification', p_request_id,
          jsonb_build_object('status', p_status, 'user_id', v_user_id, 'type', v_type));
  
  RETURN jsonb_build_object('success', TRUE, 'request_id', p_request_id, 'status', p_status);
END;
$$;

-- ============================================================================
-- 2. BID REPAIR RPCs
-- ============================================================================

-- Create bid request
CREATE OR REPLACE FUNCTION public.fn_create_bid_request(
  p_title TEXT,
  p_description TEXT,
  p_vehicle_info JSONB DEFAULT '{}'::JSONB,
  p_media JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_request_id UUID;
  v_owner_col TEXT;
  v_desc_col TEXT;
  v_vehicle_col TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Determine column names
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'user_id') THEN
    v_owner_col := 'user_id';
  ELSE
    v_owner_col := 'owner_id';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'description') THEN
    v_desc_col := 'description';
  ELSE
    v_desc_col := 'body';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bid_requests' AND column_name = 'vehicle_info') THEN
    v_vehicle_col := 'vehicle_info';
  ELSE
    v_vehicle_col := 'car_meta';
  END IF;
  
  -- Insert using dynamic SQL
  EXECUTE format('
    INSERT INTO public.bid_requests (%I, title, %I, %I, media, status)
    VALUES ($1, $2, $3, $4, $5, ''open'')
    RETURNING id
  ', v_owner_col, v_desc_col, v_vehicle_col)
  USING v_user_id, p_title, p_description, p_vehicle_info, p_media
  INTO v_request_id;
  
  -- Log analytics event
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id)
  VALUES (v_user_id, 'create_bid_request', 'bid_request', v_request_id);
  
  RETURN v_request_id;
END;
$$;

-- Reply to bid (garage owner only)
CREATE OR REPLACE FUNCTION public.fn_reply_to_bid(
  p_bid_request_id UUID,
  p_estimated_cost DECIMAL,
  p_estimated_hours INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_garage_id UUID;
  v_reply_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user's garage
  SELECT id INTO v_garage_id
  FROM public.garages
  WHERE owner_id = v_user_id AND status = 'approved'
  LIMIT 1;
  
  IF v_garage_id IS NULL THEN
    RAISE EXCEPTION 'No approved garage found for user';
  END IF;
  
  INSERT INTO public.bid_replies (bid_request_id, garage_id, estimated_cost, estimated_hours, notes, status)
  VALUES (p_bid_request_id, v_garage_id, p_estimated_cost, p_estimated_hours, p_notes, 'pending')
  RETURNING id INTO v_reply_id;
  
  -- Log analytics event
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id)
  VALUES (v_user_id, 'reply_to_bid', 'bid_reply', v_reply_id);
  
  RETURN v_reply_id;
END;
$$;

-- Accept bid (unlock messaging)
CREATE OR REPLACE FUNCTION public.fn_accept_bid(
  p_bid_request_id UUID,
  p_bid_reply_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_garage_id UUID;
  v_thread_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify ownership of bid request
  IF NOT EXISTS (
    SELECT 1 FROM public.bid_requests
    WHERE id = p_bid_request_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Bid request not found or not authorized';
  END IF;
  
  -- Get garage from reply
  SELECT garage_id INTO v_garage_id
  FROM public.bid_replies
  WHERE id = p_bid_reply_id AND bid_request_id = p_bid_request_id;
  
  IF v_garage_id IS NULL THEN
    RAISE EXCEPTION 'Bid reply not found';
  END IF;
  
  -- Update bid request status
  UPDATE public.bid_requests
  SET status = 'accepted', accepted_reply_id = p_bid_reply_id, updated_at = NOW()
  WHERE id = p_bid_request_id;
  
  -- Update reply status
  UPDATE public.bid_replies
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_bid_reply_id;
  
  -- Create messaging thread
  INSERT INTO public.bid_threads (bid_request_id, user_id, garage_id, status)
  VALUES (p_bid_request_id, v_user_id, v_garage_id, 'active')
  RETURNING id INTO v_thread_id;
  
  -- Log audit event
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'accept_bid', 'bid_request', p_bid_request_id,
          jsonb_build_object('reply_id', p_bid_reply_id, 'thread_id', v_thread_id));
  
  RETURN jsonb_build_object('success', TRUE, 'thread_id', v_thread_id);
END;
$$;

-- Check if user can message in thread
CREATE OR REPLACE FUNCTION public.fn_can_message(
  p_thread_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_can_message BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is participant in thread AND thread is active AND bid is accepted/closed
  SELECT EXISTS (
    SELECT 1 FROM public.bid_threads bt
    JOIN public.bid_requests br ON bt.bid_request_id = br.id
    WHERE bt.id = p_thread_id
    AND bt.status = 'active'
    AND br.status IN ('accepted', 'closed')
    AND (bt.user_id = v_user_id OR
         EXISTS (SELECT 1 FROM public.garages WHERE id = bt.garage_id AND owner_id = v_user_id))
  ) INTO v_can_message;
  
  RETURN v_can_message;
END;
$$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PART 2 RPCs CREATED: Garage Hub & Bid Repair';
END $$;

