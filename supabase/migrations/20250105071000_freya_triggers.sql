-- ============================================================================
-- FREYA TRIGGERS - Auto-invoke dispatch on new posts
-- ============================================================================

-- Create storage bucket for freya attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('freya-attachments', 'freya-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for freya-attachments
DROP POLICY IF EXISTS "Freya attachments service write" ON storage.objects;
CREATE POLICY "Freya attachments service write" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'freya-attachments')
  WITH CHECK (bucket_id = 'freya-attachments');

DROP POLICY IF EXISTS "Freya attachments admin read" ON storage.objects;
CREATE POLICY "Freya attachments admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'freya-attachments' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to enqueue Freya job
CREATE OR REPLACE FUNCTION public.fn_freya_enqueue_auto_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a queued run for this post
  INSERT INTO public.freya_runs (post_id, action, status, reason)
  VALUES (NEW.id, 'auto_comment', 'queued', 'new post created')
  ON CONFLICT DO NOTHING;
  
  -- Note: Edge Function invocation would happen via webhook or external trigger
  -- For now, we just create the run record
  
  RETURN NEW;
END;
$$;

-- Trigger on community_posts insert
DROP TRIGGER IF EXISTS trg_freya_on_new_post ON public.posts;
CREATE TRIGGER trg_freya_on_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_freya_enqueue_auto_comment();

-- Function to detect replies to Freya
CREATE OR REPLACE FUNCTION public.fn_freya_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_freya_comment_id UUID;
  v_post_id UUID;
BEGIN
  -- Check if this is a reply to Freya's comment
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Get the post_id and check if parent is Freya's auto-comment
    SELECT c.post_id, ps.auto_comment_id INTO v_post_id, v_freya_comment_id
    FROM public.comments c
    JOIN public.freya_post_state ps ON ps.post_id = c.post_id
    WHERE c.id = NEW.parent_comment_id
      AND c.is_bot = TRUE;
    
    -- If this is a reply to Freya's comment and we haven't done summary reply yet
    IF v_freya_comment_id IS NOT NULL THEN
      INSERT INTO public.freya_runs (post_id, action, status, reason)
      VALUES (v_post_id, 'summary_reply', 'queued', 'user replied to Freya')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on comments insert (for replies)
DROP TRIGGER IF EXISTS trg_freya_on_reply ON public.comments;
CREATE TRIGGER trg_freya_on_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW
  WHEN (NEW.is_bot = FALSE)
  EXECUTE FUNCTION public.fn_freya_on_reply();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Freya triggers created successfully!';
  RAISE NOTICE '   - Storage bucket: freya-attachments';
  RAISE NOTICE '   - Trigger: trg_freya_on_new_post';
  RAISE NOTICE '   - Trigger: trg_freya_on_reply';
END $$;

