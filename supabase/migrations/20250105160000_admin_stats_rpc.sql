-- Admin statistics RPC
CREATE OR REPLACE FUNCTION fn_admin_get_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_posts', (SELECT COUNT(*) FROM community_posts),
    'total_listings', (SELECT COUNT(*) FROM marketplace_listings),
    'total_events', (SELECT COUNT(*) FROM events),
    'total_garages', (SELECT COUNT(*) FROM garages),
    'total_bids', (SELECT COUNT(*) FROM bid_repair),
    'total_offers', (SELECT COUNT(*) FROM offers),
    'pending_verifications', (SELECT COUNT(*) FROM verification_requests WHERE status = 'pending')
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Complete challenge function
CREATE OR REPLACE FUNCTION fn_complete_challenge(p_challenge_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp INT;
BEGIN
  SELECT xp_reward INTO v_xp FROM daily_challenges WHERE id = p_challenge_id;
  
  UPDATE challenge_progress 
  SET status = 'completed', completed_at = NOW()
  WHERE challenge_id = p_challenge_id AND user_id = p_user_id;
  
  INSERT INTO xp_events (user_id, points, source, description)
  VALUES (p_user_id, v_xp, 'challenge', 'Completed daily challenge');
  
  UPDATE profiles SET xp = xp + v_xp WHERE id = p_user_id;
END;
$$;

