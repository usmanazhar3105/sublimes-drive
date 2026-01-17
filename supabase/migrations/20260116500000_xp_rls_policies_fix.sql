-- ============================================================================
-- XP SYSTEM RLS POLICIES FIX
-- ============================================================================
-- Fixes permission denied errors for XP tables
-- ============================================================================

-- ============================================================================
-- DROP EXISTING POLICIES (if any) AND RECREATE
-- ============================================================================

-- user_xp policies
DROP POLICY IF EXISTS user_xp_select ON public.user_xp;
DROP POLICY IF EXISTS user_xp_insert ON public.user_xp;
DROP POLICY IF EXISTS user_xp_update ON public.user_xp;
DROP POLICY IF EXISTS user_xp_delete ON public.user_xp;
DROP POLICY IF EXISTS "Allow authenticated select on user_xp" ON public.user_xp;
DROP POLICY IF EXISTS "Allow authenticated insert on user_xp" ON public.user_xp;
DROP POLICY IF EXISTS "Allow authenticated update on user_xp" ON public.user_xp;

CREATE POLICY "Allow authenticated select on user_xp" ON public.user_xp
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on user_xp" ON public.user_xp
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on user_xp" ON public.user_xp
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on user_xp" ON public.user_xp
  FOR DELETE TO authenticated USING (true);

-- xp_transactions policies
DROP POLICY IF EXISTS xp_transactions_select ON public.xp_transactions;
DROP POLICY IF EXISTS xp_transactions_insert ON public.xp_transactions;
DROP POLICY IF EXISTS "Allow authenticated select on xp_transactions" ON public.xp_transactions;
DROP POLICY IF EXISTS "Allow authenticated insert on xp_transactions" ON public.xp_transactions;

CREATE POLICY "Allow authenticated select on xp_transactions" ON public.xp_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on xp_transactions" ON public.xp_transactions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on xp_transactions" ON public.xp_transactions
  FOR UPDATE TO authenticated USING (true);

-- xp_milestone_rewards policies
DROP POLICY IF EXISTS xp_milestones_select ON public.xp_milestone_rewards;
DROP POLICY IF EXISTS xp_milestones_all ON public.xp_milestone_rewards;
DROP POLICY IF EXISTS "Allow authenticated select on xp_milestone_rewards" ON public.xp_milestone_rewards;
DROP POLICY IF EXISTS "Allow authenticated all on xp_milestone_rewards" ON public.xp_milestone_rewards;

CREATE POLICY "Allow authenticated select on xp_milestone_rewards" ON public.xp_milestone_rewards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on xp_milestone_rewards" ON public.xp_milestone_rewards
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on xp_milestone_rewards" ON public.xp_milestone_rewards
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on xp_milestone_rewards" ON public.xp_milestone_rewards
  FOR DELETE TO authenticated USING (true);

-- xp_reward_claims policies
DROP POLICY IF EXISTS xp_claims_select ON public.xp_reward_claims;
DROP POLICY IF EXISTS xp_claims_all ON public.xp_reward_claims;
DROP POLICY IF EXISTS "Allow authenticated select on xp_reward_claims" ON public.xp_reward_claims;
DROP POLICY IF EXISTS "Allow authenticated all on xp_reward_claims" ON public.xp_reward_claims;

CREATE POLICY "Allow authenticated select on xp_reward_claims" ON public.xp_reward_claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on xp_reward_claims" ON public.xp_reward_claims
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on xp_reward_claims" ON public.xp_reward_claims
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on xp_reward_claims" ON public.xp_reward_claims
  FOR DELETE TO authenticated USING (true);

-- xp_settings policies
DROP POLICY IF EXISTS xp_settings_select ON public.xp_settings;
DROP POLICY IF EXISTS xp_settings_update ON public.xp_settings;
DROP POLICY IF EXISTS "Allow authenticated select on xp_settings" ON public.xp_settings;
DROP POLICY IF EXISTS "Allow authenticated update on xp_settings" ON public.xp_settings;

CREATE POLICY "Allow authenticated select on xp_settings" ON public.xp_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on xp_settings" ON public.xp_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on xp_settings" ON public.xp_settings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on xp_settings" ON public.xp_settings
  FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- GRANT TABLE PERMISSIONS TO AUTHENTICATED ROLE
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_xp TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.xp_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_milestone_rewards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_reward_claims TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_settings TO authenticated;

-- Also grant to anon for public read access if needed
GRANT SELECT ON public.user_xp TO anon;
GRANT SELECT ON public.xp_milestone_rewards TO anon;

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_milestone_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'XP RLS POLICIES FIXED';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Tables with policies: user_xp, xp_transactions,';
  RAISE NOTICE '                      xp_milestone_rewards, xp_reward_claims,';
  RAISE NOTICE '                      xp_settings';
  RAISE NOTICE '';
  RAISE NOTICE 'All authenticated users can now access these tables.';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;


