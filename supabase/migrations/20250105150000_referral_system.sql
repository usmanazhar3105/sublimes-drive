-- Referral system tables
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_id UUID REFERENCES auth.users(id),
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  xp_awarded INT DEFAULT 0,
  credits_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  points INT NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON public.xp_events(user_id, created_at);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_referrals" ON public.referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "user_own_xp" ON public.xp_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_all_referrals" ON public.referrals FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_xp" ON public.xp_events FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Function to award referral rewards
CREATE OR REPLACE FUNCTION fn_complete_referral(p_referred_id UUID, p_referral_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_role TEXT;
BEGIN
  SELECT referrer_id INTO v_referrer_id FROM referrals WHERE referral_code = p_referral_code;
  IF v_referrer_id IS NULL THEN RETURN jsonb_build_object('success', FALSE); END IF;
  
  SELECT role INTO v_referrer_role FROM profiles WHERE id = v_referrer_id;
  
  -- Award XP to all referrers
  INSERT INTO xp_events (user_id, points, source, description)
  VALUES (v_referrer_id, 5, 'referral', 'Referral signup bonus');
  
  UPDATE referrals SET status = 'completed', referred_id = p_referred_id, completed_at = NOW(), xp_awarded = 5
  WHERE referral_code = p_referral_code;
  
  -- If garage owner, award bid credit
  IF v_referrer_role = 'garage_owner' THEN
    UPDATE bid_wallet SET balance = balance + 1 WHERE user_id = v_referrer_id;
    UPDATE referrals SET credits_awarded = 1 WHERE referral_code = p_referral_code;
  END IF;
  
  RETURN jsonb_build_object('success', TRUE, 'xp_awarded', 5);
END;
$$;

