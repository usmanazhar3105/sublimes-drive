-- Migration: Complete RPC Functions
-- Date: 2025-11-02
-- Purpose: Implement all missing RPC functions per wiring specifications
-- Note: Uses SECURITY DEFINER where appropriate

-- ============================================================================
-- 0. DROP EXISTING FUNCTIONS (to avoid return type conflicts)
-- ============================================================================

-- Drop functions that are being recreated with different return types
DROP FUNCTION IF EXISTS public.fn_toggle_like(UUID);
DROP FUNCTION IF EXISTS public.fn_toggle_save(UUID);
DROP FUNCTION IF EXISTS public.fn_toggle_event_like(UUID);
DROP FUNCTION IF EXISTS public.fn_register_event_view(UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_toggle_event_attendance(UUID);
DROP FUNCTION IF EXISTS public.fn_is_event_full(UUID);
DROP FUNCTION IF EXISTS public.fn_has_user_registered(UUID);
DROP FUNCTION IF EXISTS public.fn_toggle_offer_redeem(UUID);
DROP FUNCTION IF EXISTS public.fn_is_offer_redeemed(UUID);
DROP FUNCTION IF EXISTS public.fn_has_active_boost(UUID);
DROP FUNCTION IF EXISTS public.fn_submit_bid_reply(UUID, TEXT, DECIMAL, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS public.fn_accept_bid(UUID);

-- ============================================================================
-- 1. COMMUNITIES - Posts & Comments
-- ============================================================================

-- Create a post
CREATE OR REPLACE FUNCTION public.fn_create_post(
  p_title TEXT,
  p_body TEXT,
  p_community_id UUID DEFAULT NULL,
  p_media JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO public.posts (user_id, community_id, title, body, media, status)
  VALUES (auth.uid(), p_community_id, p_title, p_body, p_media, 'pending')
  RETURNING id INTO v_post_id;
  
  -- Initialize stats
  INSERT INTO public.post_stats (post_id) VALUES (v_post_id);
  
  -- Log analytics
  INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
  VALUES (auth.uid(), 'action', 'create_post', 'post', v_post_id);
  
  RETURN v_post_id;
END;
$$;

-- Add comment (with optional parent for threading)
CREATE OR REPLACE FUNCTION public.fn_add_comment(
  p_post_id UUID,
  p_body TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  INSERT INTO public.comments (post_id, user_id, parent_id, body)
  VALUES (p_post_id, auth.uid(), p_parent_id, p_body)
  RETURNING id INTO v_comment_id;
  
  -- Update post stats
  UPDATE public.post_stats
  SET comment_count = comment_count + 1, updated_at = NOW()
  WHERE post_id = p_post_id;
  
  -- Log analytics
  INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'action', 'add_comment', 'post', p_post_id, jsonb_build_object('comment_id', v_comment_id));
  
  RETURN v_comment_id;
END;
$$;

-- Edit comment
CREATE OR REPLACE FUNCTION public.fn_edit_comment(
  p_comment_id UUID,
  p_body TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM public.comments WHERE id = p_comment_id;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to edit this comment';
  END IF;
  
  UPDATE public.comments
  SET body = p_body, updated_at = NOW()
  WHERE id = p_comment_id;
  
  RETURN TRUE;
END;
$$;

-- Delete comment
CREATE OR REPLACE FUNCTION public.fn_delete_comment(
  p_comment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_post_id UUID;
BEGIN
  SELECT user_id, post_id INTO v_user_id, v_post_id
  FROM public.comments WHERE id = p_comment_id;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to delete this comment';
  END IF;
  
  DELETE FROM public.comments WHERE id = p_comment_id;
  
  -- Update post stats
  UPDATE public.post_stats
  SET comment_count = comment_count - 1, updated_at = NOW()
  WHERE post_id = v_post_id;
  
  RETURN TRUE;
END;
$$;

-- Toggle post like
CREATE OR REPLACE FUNCTION public.fn_toggle_like(
  _post_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _liked BOOLEAN;
  _like_count INTEGER;
BEGIN
  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes 
    WHERE post_id = _post_id AND user_id = auth.uid()
  ) INTO _liked;

  IF _liked THEN
    -- Unlike: delete the like record
    DELETE FROM public.post_likes WHERE post_id = _post_id AND user_id = auth.uid();
    _liked := FALSE;
  ELSE
    -- Like: insert new like record
    INSERT INTO public.post_likes (post_id, user_id) 
    VALUES (_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
    _liked := TRUE;
    
    -- Log analytics event
    INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
    VALUES (auth.uid(), 'action', 'like_post', 'post', _post_id);
  END IF;

  -- Get updated like count
  SELECT COUNT(*) INTO _like_count 
  FROM public.post_likes 
  WHERE post_id = _post_id;

  RETURN jsonb_build_object('liked', _liked, 'like_count', _like_count);
END;
$$;

-- Toggle post save
CREATE OR REPLACE FUNCTION public.fn_toggle_save(
  _post_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _saved BOOLEAN;
  _save_count INTEGER;
BEGIN
  -- Check if already saved
  SELECT EXISTS (
    SELECT 1 FROM public.post_saves 
    WHERE post_id = _post_id AND user_id = auth.uid()
  ) INTO _saved;

  IF _saved THEN
    -- Unsave: delete the save record
    DELETE FROM public.post_saves WHERE post_id = _post_id AND user_id = auth.uid();
    _saved := FALSE;
  ELSE
    -- Save: insert new save record
    INSERT INTO public.post_saves (post_id, user_id) 
    VALUES (_post_id, auth.uid())
    ON CONFLICT (post_id, user_id) DO NOTHING;
    _saved := TRUE;
    
    -- Log analytics event
    INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
    VALUES (auth.uid(), 'action', 'save_post', 'post', _post_id);
  END IF;

  -- Get updated save count
  SELECT COUNT(*) INTO _save_count 
  FROM public.post_saves 
  WHERE post_id = _post_id;

  RETURN jsonb_build_object('saved', _saved, 'save_count', _save_count);
END;
$$;

-- Register post view (with deduplication)
CREATE OR REPLACE FUNCTION public.fn_register_post_view(
  p_post_id UUID,
  p_anon_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_view BOOLEAN;
BEGIN
  -- Check if view already registered in last 10 minutes
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.post_views
      WHERE post_id = p_post_id AND user_id = auth.uid()
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.post_views
      WHERE post_id = p_post_id AND anon_hash = p_anon_hash
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  END IF;
  
  IF NOT v_recent_view THEN
    INSERT INTO public.post_views (post_id, user_id, anon_hash)
    VALUES (p_post_id, auth.uid(), p_anon_hash);
    
    UPDATE public.post_stats SET view_count = view_count + 1, updated_at = NOW()
    WHERE post_id = p_post_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Report post
CREATE OR REPLACE FUNCTION public.fn_report_post(
  p_post_id UUID,
  p_reason TEXT,
  p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
BEGIN
  INSERT INTO public.post_reports (post_id, user_id, reason, details)
  VALUES (p_post_id, auth.uid(), p_reason, p_details)
  RETURNING id INTO v_report_id;
  
  INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
  VALUES (auth.uid(), 'action', 'report_post', 'post', p_post_id);
  
  RETURN v_report_id;
END;
$$;

-- ============================================================================
-- 2. MARKETPLACE - Listings
-- ============================================================================

-- Toggle listing save
CREATE OR REPLACE FUNCTION public.fn_toggle_listing_save(
  p_listing_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.listing_saves WHERE listing_id = p_listing_id AND user_id = auth.uid()) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.listing_saves WHERE listing_id = p_listing_id AND user_id = auth.uid();
    UPDATE public.listing_stats SET save_count = save_count - 1, updated_at = NOW() WHERE listing_id = p_listing_id;
    RETURN FALSE;
  ELSE
    INSERT INTO public.listing_saves (listing_id, user_id) VALUES (p_listing_id, auth.uid())
    ON CONFLICT (listing_id, user_id) DO NOTHING;
    UPDATE public.listing_stats SET save_count = save_count + 1, updated_at = NOW() WHERE listing_id = p_listing_id;
    
    INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
    VALUES (auth.uid(), 'action', 'save_listing', 'listing', p_listing_id);
    
    RETURN TRUE;
  END IF;
END;
$$;

-- Register listing view
CREATE OR REPLACE FUNCTION public.fn_register_listing_view(
  p_listing_id UUID,
  p_anon_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_view BOOLEAN;
BEGIN
  -- Check if view already registered in last 10 minutes
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.listing_views
      WHERE listing_id = p_listing_id AND user_id = auth.uid()
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.listing_views
      WHERE listing_id = p_listing_id AND anon_hash = p_anon_hash
      AND viewed_at > NOW() - INTERVAL '10 minutes'
    ) INTO v_recent_view;
  END IF;
  
  IF NOT v_recent_view THEN
    INSERT INTO public.listing_views (listing_id, user_id, anon_hash)
    VALUES (p_listing_id, auth.uid(), p_anon_hash);
    
    UPDATE public.listing_stats SET view_count = view_count + 1, updated_at = NOW()
    WHERE listing_id = p_listing_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Calculate fees
CREATE OR REPLACE FUNCTION public.fn_calculate_fee(
  p_kind TEXT,
  p_amount DECIMAL DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_result JSONB;
  v_base DECIMAL;
  v_vat DECIMAL;
  v_total DECIMAL;
BEGIN
  CASE p_kind
    WHEN 'car' THEN
      v_base := 50.00;
      v_vat := v_base * 0.05;
      v_total := v_base + v_vat;
    WHEN 'parts' THEN
      v_base := COALESCE(p_amount, 0) * 0.08;
      v_vat := v_base * 0.05;
      v_total := v_base + v_vat;
    WHEN 'garage' THEN
      v_base := 100.00;
      v_vat := v_base * 0.05;
      v_total := v_base + v_vat;
    ELSE
      v_base := 0;
      v_vat := 0;
      v_total := 0;
  END CASE;
  
  v_result := jsonb_build_object(
    'kind', p_kind,
    'base_fee', v_base,
    'vat', v_vat,
    'total', v_total,
    'currency', 'AED'
  );
  
  RETURN v_result;
END;
$$;

-- ============================================================================
-- 3. ADMIN FUNCTIONS
-- ============================================================================

-- Set post status (admin only - check in app layer)
CREATE OR REPLACE FUNCTION public.fn_admin_set_post_status(
  p_post_id UUID,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET status = p_status, updated_at = NOW()
  WHERE id = p_post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'set_post_status', 'post', p_post_id, jsonb_build_object('status', p_status));
  
  RETURN TRUE;
END;
$$;

-- Set listing status (admin only)
CREATE OR REPLACE FUNCTION public.fn_admin_set_listing_status(
  p_listing_id UUID,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.market_listings
  SET status = p_status, updated_at = NOW()
  WHERE id = p_listing_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'set_listing_status', 'listing', p_listing_id, jsonb_build_object('status', p_status));
  
  RETURN TRUE;
END;
$$;

-- Pin/feature content
CREATE OR REPLACE FUNCTION public.fn_admin_pin_feature(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_is_pinned BOOLEAN DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE p_entity_type
    WHEN 'post' THEN
      UPDATE public.posts
      SET 
        is_pinned = COALESCE(p_is_pinned, is_pinned),
        is_featured = COALESCE(p_is_featured, is_featured),
        updated_at = NOW()
      WHERE id = p_entity_id;
    WHEN 'listing' THEN
      UPDATE public.market_listings
      SET 
        is_featured = COALESCE(p_is_featured, is_featured),
        updated_at = NOW()
      WHERE id = p_entity_id;
    WHEN 'event' THEN
      UPDATE public.events
      SET 
        is_featured = COALESCE(p_is_featured, is_featured),
        updated_at = NOW()
      WHERE id = p_entity_id;
  END CASE;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'pin_feature', p_entity_type, p_entity_id,
          jsonb_build_object('is_pinned', p_is_pinned, 'is_featured', p_is_featured));
  
  RETURN TRUE;
END;
$$;

-- Approve boost
CREATE OR REPLACE FUNCTION public.fn_admin_boost_approve(
  p_boost_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.boost_entitlements
  SET status = 'active', updated_at = NOW()
  WHERE id = p_boost_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'approve_boost', 'boost', p_boost_id, jsonb_build_object('status', 'active'));
  
  RETURN TRUE;
END;
$$;

-- Refund boost
CREATE OR REPLACE FUNCTION public.fn_admin_boost_refund(
  p_boost_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_price DECIMAL;
BEGIN
  SELECT user_id, price_paid INTO v_user_id, v_price
  FROM public.boost_entitlements WHERE id = p_boost_id;
  
  UPDATE public.boost_entitlements
  SET status = 'refunded', updated_at = NOW()
  WHERE id = p_boost_id;
  
  -- Create refund transaction
  INSERT INTO public.wallet_transactions (user_id, transaction_type, amount, description, status)
  VALUES (v_user_id, 'refund', v_price, 'Boost refund', 'completed');
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'refund_boost', 'boost', p_boost_id, jsonb_build_object('amount', v_price));
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 4. BID REPAIR FUNCTIONS
-- ============================================================================

-- Post a bid (user only)
CREATE OR REPLACE FUNCTION public.fn_post_bid(
  p_title TEXT,
  p_description TEXT,
  p_vehicle_info JSONB DEFAULT '{}'::jsonb,
  p_media TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bid_id UUID;
BEGIN
  INSERT INTO public.bid_repair (user_id, title, description, vehicle_info, media)
  VALUES (auth.uid(), p_title, p_description, p_vehicle_info, p_media)
  RETURNING id INTO v_bid_id;
  
  INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id)
  VALUES (auth.uid(), 'action', 'post_bid', 'bid_repair', v_bid_id);
  
  RETURN v_bid_id;
END;
$$;

-- Reply to bid (garage owner only - check in app)
CREATE OR REPLACE FUNCTION public.fn_reply_bid(
  p_bid_id UUID,
  p_message TEXT,
  p_estimated_price DECIMAL DEFAULT NULL,
  p_estimated_duration TEXT DEFAULT NULL,
  p_media TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reply_id UUID;
BEGIN
  INSERT INTO public.bid_repair_replies (bid_id, garage_id, message, estimated_price, estimated_duration, media)
  VALUES (p_bid_id, auth.uid(), p_message, p_estimated_price, p_estimated_duration, p_media)
  RETURNING id INTO v_reply_id;
  
  INSERT INTO public.analytics_events (user_id, event_type, event_name, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'action', 'reply_bid', 'bid_repair', p_bid_id,
          jsonb_build_object('reply_id', v_reply_id));
  
  RETURN v_reply_id;
END;
$$;

-- Accept bid reply
CREATE OR REPLACE FUNCTION public.fn_accept_bid(
  p_bid_id UUID,
  p_reply_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update bid status
  UPDATE public.bid_repair
  SET status = 'accepted', accepted_reply_id = p_reply_id, updated_at = NOW()
  WHERE id = p_bid_id AND user_id = auth.uid();
  
  -- Update reply status
  UPDATE public.bid_repair_replies
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_reply_id;
  
  -- Reject other replies
  UPDATE public.bid_repair_replies
  SET status = 'rejected', updated_at = NOW()
  WHERE bid_id = p_bid_id AND id != p_reply_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'accept_bid', 'bid_repair', p_bid_id,
          jsonb_build_object('reply_id', p_reply_id));
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 5. PUSH NOTIFICATION FUNCTIONS
-- ============================================================================

-- Preview push (simulate)
CREATE OR REPLACE FUNCTION public.fn_push_preview(
  p_template_id UUID,
  p_sample_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_template FROM public.push_templates WHERE id = p_template_id;
  
  v_result := jsonb_build_object(
    'title', v_template.title,
    'body', v_template.body,
    'data', v_template.data || p_sample_data
  );
  
  RETURN v_result;
END;
$$;

-- Resolve segment (count users)
CREATE OR REPLACE FUNCTION public.fn_push_resolve_segment(
  p_segment_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_rules JSONB;
BEGIN
  SELECT rules INTO v_rules FROM public.push_segments WHERE id = p_segment_id;
  
  -- Simplified: count all active users (in production, apply rules)
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE id IN (SELECT user_id FROM public.user_push_settings WHERE enabled = true);
  
  RETURN v_count;
END;
$$;

-- ============================================================================
-- 6. EMAIL FUNCTIONS
-- ============================================================================

-- Email preview
CREATE OR REPLACE FUNCTION public.fn_email_preview(
  p_template_id UUID,
  p_sample_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_template FROM public.email_templates WHERE id = p_template_id;
  
  v_result := jsonb_build_object(
    'subject', v_template.subject,
    'body_html', v_template.body_html,
    'body_text', v_template.body_text
  );
  
  RETURN v_result;
END;
$$;

-- Unsubscribe from emails
CREATE OR REPLACE FUNCTION public.fn_email_unsubscribe(
  p_email TEXT,
  p_reason TEXT DEFAULT 'unsubscribe'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.email_suppressions (email, reason)
  VALUES (p_email, p_reason)
  ON CONFLICT (email) DO NOTHING;
  
  UPDATE public.user_email_settings
  SET marketing_enabled = false, updated_at = NOW()
  WHERE user_id IN (SELECT id FROM public.profiles WHERE email = p_email);
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 7. EXPORT FUNCTION
-- ============================================================================

-- Export data (admin only - actual export logic handled by edge function)
CREATE OR REPLACE FUNCTION public.fn_export_run(
  p_export_type TEXT,
  p_parameters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_export_id UUID;
BEGIN
  INSERT INTO public.exports (user_id, export_type, parameters, status)
  VALUES (auth.uid(), p_export_type, p_parameters, 'pending')
  RETURNING id INTO v_export_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'export_run', 'export', v_export_id,
          jsonb_build_object('type', p_export_type, 'params', p_parameters));
  
  RETURN v_export_id;
END;
$$;

COMMENT ON FUNCTION public.fn_calculate_fee IS 'Calculate listing fees: Car AED 50+5% VAT, Parts 8%, Garage AED 100+5% VAT';
COMMENT ON FUNCTION public.fn_accept_bid IS 'Accept bid and unlock messaging between user and garage owner';
COMMENT ON FUNCTION public.fn_export_run IS 'Queue export job for admin - actual processing in edge function';

