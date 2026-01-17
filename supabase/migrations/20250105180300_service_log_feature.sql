-- Vehicle Service Log Feature
-- Created: 2025-01-05
-- Allows users to track maintenance history for their vehicles

-- Create service_log table
CREATE TABLE IF NOT EXISTS public.service_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES profiles(id), -- Link to user's vehicle
  service_type text NOT NULL, -- 'oil_change', 'tire_rotation', 'brake_service', etc.
  service_provider text,
  service_date date NOT NULL,
  mileage int,
  cost_amount int, -- In minor currency units (fils)
  cost_currency text DEFAULT 'AED',
  notes text,
  next_service_date date,
  next_service_mileage int,
  attachments jsonb DEFAULT '[]'::jsonb, -- Receipt images, etc.
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_service_log_user_id ON public.service_log(user_id);
CREATE INDEX IF NOT EXISTS idx_service_log_service_date ON public.service_log(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_log_next_service ON public.service_log(next_service_date) WHERE next_service_date IS NOT NULL;

-- RLS Policies
ALTER TABLE public.service_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_service_log" ON public.service_log;
DROP POLICY IF EXISTS "users_create_own_service_log" ON public.service_log;
DROP POLICY IF EXISTS "users_update_own_service_log" ON public.service_log;
DROP POLICY IF EXISTS "users_delete_own_service_log" ON public.service_log;
DROP POLICY IF EXISTS "admin_read_all_service_log" ON public.service_log;

-- Users can read their own service logs
CREATE POLICY "users_read_own_service_log"
ON public.service_log
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own service logs
CREATE POLICY "users_create_own_service_log"
ON public.service_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own service logs
CREATE POLICY "users_update_own_service_log"
ON public.service_log
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own service logs
CREATE POLICY "users_delete_own_service_log"
ON public.service_log
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can read all service logs
CREATE POLICY "admin_read_all_service_log"
ON public.service_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Function: Create service log entry
CREATE OR REPLACE FUNCTION public.fn_create_service_log(
  p_service_type text,
  p_service_date date,
  p_mileage int DEFAULT NULL,
  p_cost_amount int DEFAULT NULL,
  p_service_provider text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_next_service_date date DEFAULT NULL,
  p_next_service_mileage int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
  v_result jsonb;
BEGIN
  INSERT INTO service_log (
    user_id,
    service_type,
    service_date,
    mileage,
    cost_amount,
    service_provider,
    notes,
    next_service_date,
    next_service_mileage,
    created_at
  ) VALUES (
    auth.uid(),
    p_service_type,
    p_service_date,
    p_mileage,
    p_cost_amount,
    p_service_provider,
    p_notes,
    p_next_service_date,
    p_next_service_mileage,
    NOW()
  )
  RETURNING id INTO v_log_id;

  v_result := jsonb_build_object(
    'success', true,
    'id', v_log_id,
    'message', 'Service log created'
  );

  RETURN v_result;
END;
$$;

-- Function: Get upcoming service reminders
CREATE OR REPLACE FUNCTION public.fn_get_service_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reminders jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(t))
  INTO v_reminders
  FROM (
    SELECT
      id,
      service_type,
      service_provider,
      next_service_date,
      next_service_mileage,
      CASE
        WHEN next_service_date IS NOT NULL AND next_service_date <= CURRENT_DATE + INTERVAL '7 days'
        THEN 'urgent'
        WHEN next_service_date IS NOT NULL AND next_service_date <= CURRENT_DATE + INTERVAL '30 days'
        THEN 'soon'
        ELSE 'scheduled'
      END AS priority
    FROM service_log
    WHERE user_id = auth.uid()
    AND next_service_date IS NOT NULL
    AND next_service_date >= CURRENT_DATE
    ORDER BY next_service_date ASC
    LIMIT 10
  ) t;

  RETURN COALESCE(v_reminders, '[]'::jsonb);
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_create_service_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_service_reminders TO authenticated;

-- Comments
COMMENT ON TABLE public.service_log IS 'User vehicle service/maintenance history';
COMMENT ON FUNCTION public.fn_create_service_log IS 'Create a service log entry for user vehicle';
COMMENT ON FUNCTION public.fn_get_service_reminders IS 'Get upcoming service reminders for current user';

