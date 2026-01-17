-- Create content moderation system
-- Date: 2025-01-08

-- Reports table (if not exists)
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'listing', 'user', 'garage', 'event')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_type ON public.content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON public.content_reports(reporter_id);

-- Moderation actions table
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.content_reports(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('warn', 'hide', 'delete', 'ban_user', 'no_action')),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON public.moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_type ON public.moderation_actions(content_type, content_id);

-- RLS Policies
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Public can view moderation actions (for transparency)
CREATE POLICY "Public can view moderation actions"
  ON public.moderation_actions FOR SELECT
  USING (true);

-- RPC Function: Submit report
CREATE OR REPLACE FUNCTION public.fn_submit_report(
  p_content_type TEXT,
  p_content_id UUID,
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
  INSERT INTO public.content_reports (
    reporter_id,
    content_type,
    content_id,
    reason,
    details
  ) VALUES (
    auth.uid(),
    p_content_type,
    p_content_id,
    p_reason,
    p_details
  ) RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_submit_report(TEXT, UUID, TEXT, TEXT) TO authenticated;

-- RPC Function: Moderate content
CREATE OR REPLACE FUNCTION public.fn_moderate_content(
  p_report_id UUID,
  p_action_type TEXT,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report RECORD;
  v_action_id UUID;
BEGIN
  -- Get report
  SELECT * INTO v_report
  FROM public.content_reports
  WHERE id = p_report_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Report not found');
  END IF;

  -- Create moderation action
  INSERT INTO public.moderation_actions (
    report_id,
    moderator_id,
    action_type,
    content_type,
    content_id,
    reason,
    notes
  ) VALUES (
    p_report_id,
    auth.uid(),
    p_action_type,
    v_report.content_type,
    v_report.content_id,
    p_reason,
    p_notes
  ) RETURNING id INTO v_action_id;

  -- Update report status
  UPDATE public.content_reports
  SET 
    status = 'resolved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    resolution = p_action_type
  WHERE id = p_report_id;

  -- Perform action based on type
  IF p_action_type = 'hide' THEN
    -- Hide content (set status to hidden)
    IF v_report.content_type = 'post' THEN
      UPDATE public.posts SET status = 'hidden' WHERE id = v_report.content_id;
    ELSIF v_report.content_type = 'comment' THEN
      UPDATE public.comments SET is_hidden = true WHERE id = v_report.content_id;
    END IF;
  ELSIF p_action_type = 'delete' THEN
    -- Delete content (soft delete or hard delete based on type)
    IF v_report.content_type = 'post' THEN
      UPDATE public.posts SET status = 'deleted' WHERE id = v_report.content_id;
    ELSIF v_report.content_type = 'comment' THEN
      DELETE FROM public.comments WHERE id = v_report.content_id;
    END IF;
  ELSIF p_action_type = 'ban_user' THEN
    -- Ban user
    UPDATE public.profiles 
    SET is_banned = true, banned_until = NOW() + INTERVAL '30 days'
    WHERE id = v_report.content_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'action_id', v_action_id);
END;
$$;

-- Note: Admin access checked in application layer (per project rules)
-- This function should only be called by admins via Edge Function or service role


