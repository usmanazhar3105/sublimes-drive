-- Comprehensive admin RPC functions
CREATE OR REPLACE FUNCTION fn_admin_approve_post(p_post_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET status = 'approved' WHERE id = p_post_id;
  INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (auth.uid(), 'approve_post', 'post', p_post_id);
END $$;

CREATE OR REPLACE FUNCTION fn_admin_approve_listing(p_listing_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE marketplace_listings SET status = 'approved' WHERE id = p_listing_id;
  INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (auth.uid(), 'approve_listing', 'listing', p_listing_id);
END $$;

CREATE OR REPLACE FUNCTION fn_admin_approve_event(p_event_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE events SET status = 'approved' WHERE id = p_event_id;
  INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (auth.uid(), 'approve_event', 'event', p_event_id);
END $$;

CREATE OR REPLACE FUNCTION fn_admin_get_stats() RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_posts', (SELECT COUNT(*) FROM posts),
    'total_listings', (SELECT COUNT(*) FROM marketplace_listings),
    'total_events', (SELECT COUNT(*) FROM events),
    'pending_posts', (SELECT COUNT(*) FROM posts WHERE status = 'pending'),
    'pending_listings', (SELECT COUNT(*) FROM marketplace_listings WHERE status = 'pending'),
    'pending_events', (SELECT COUNT(*) FROM events WHERE status = 'pending')
  ) INTO v_result;
  RETURN v_result;
END $$;

