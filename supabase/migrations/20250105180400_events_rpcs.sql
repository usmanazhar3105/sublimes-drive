-- Events & Instant Meetup RPCs
-- Created: 2025-01-05
-- Based on: Database-Wiring/text/sd_wiring_maps/Events_mapping.md

-- Function: RSVP to event (toggle)
CREATE OR REPLACE FUNCTION public.fn_toggle_event_rsvp(
  p_event_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_result jsonb;
BEGIN
  -- Check if already RSVP'd
  SELECT EXISTS (
    SELECT 1 FROM event_attendees 
    WHERE event_id = p_event_id 
    AND user_id = auth.uid()
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove RSVP
    DELETE FROM event_attendees 
    WHERE event_id = p_event_id 
    AND user_id = auth.uid();
    
    v_result := jsonb_build_object(
      'action', 'removed',
      'rsvp', false
    );
  ELSE
    -- Add RSVP
    INSERT INTO event_attendees (event_id, user_id, status, created_at)
    VALUES (p_event_id, auth.uid(), 'going', NOW())
    ON CONFLICT (event_id, user_id) DO NOTHING;
    
    v_result := jsonb_build_object(
      'action', 'added',
      'rsvp', true
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Admin: Set event status
CREATE OR REPLACE FUNCTION public.fn_admin_set_event_status(
  p_event_id uuid,
  p_status text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
BEGIN
  -- Only admins/moderators can change status
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin/Editor/Moderator only';
  END IF;

  -- Get old status
  SELECT status INTO v_old_status
  FROM events
  WHERE id = p_event_id;

  -- Update status
  UPDATE events
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_event_id;

  -- Log action
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'event_status_change',
    'event',
    p_event_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status,
      'reason', p_reason
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_status
  );
END;
$$;

-- Admin: Feature/Pin event
CREATE OR REPLACE FUNCTION public.fn_admin_feature_event(
  p_event_id uuid,
  p_featured boolean DEFAULT NULL,
  p_pinned boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can feature/pin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin only';
  END IF;

  UPDATE events
  SET 
    featured = COALESCE(p_featured, featured),
    pinned = COALESCE(p_pinned, pinned),
    updated_at = NOW()
  WHERE id = p_event_id;

  -- Log action
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    'event_feature_pin',
    'event',
    p_event_id,
    jsonb_build_object('featured', p_featured, 'pinned', p_pinned),
    NOW()
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_toggle_event_rsvp TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_set_event_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_feature_event TO authenticated;

-- Comments
COMMENT ON FUNCTION public.fn_toggle_event_rsvp IS 'Toggle RSVP status for an event';
COMMENT ON FUNCTION public.fn_admin_set_event_status IS 'Admin: Change event status';
COMMENT ON FUNCTION public.fn_admin_feature_event IS 'Admin: Feature or pin an event';

