-- Notifications System RPCs
-- Created: 2025-01-05
-- Based on: Database-Wiring/text/sd_wiring_maps/Notifications_mapping.md

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION public.fn_mark_notification_read(
  p_notification_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET 
    read_at = NOW(),
    updated_at = NOW()
  WHERE id = p_notification_id
  AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Mark all notifications as read
CREATE OR REPLACE FUNCTION public.fn_mark_all_notifications_read()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE notifications
  SET 
    read_at = NOW(),
    updated_at = NOW()
  WHERE user_id = auth.uid()
  AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'count', v_count
  );
END;
$$;

-- Function: Create notification (for system/admin use)
CREATE OR REPLACE FUNCTION public.fn_create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notif_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    data,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_data,
    NOW()
  )
  RETURNING id INTO v_notif_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_notif_id
  );
END;
$$;

-- Function: Get unread notification count
CREATE OR REPLACE FUNCTION public.fn_get_unread_count()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = auth.uid()
  AND read_at IS NULL;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_unread_count TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_mark_notification_read IS 'Mark a single notification as read';
COMMENT ON FUNCTION public.fn_mark_all_notifications_read IS 'Mark all user notifications as read';
COMMENT ON FUNCTION public.fn_create_notification IS 'Create a notification (system/admin)';
COMMENT ON FUNCTION public.fn_get_unread_count IS 'Get count of unread notifications for current user';

