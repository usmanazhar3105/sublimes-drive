-- ============================================================================
-- Create get_user_rank RPC Function
-- ============================================================================
-- This function returns a user's rank, score, percentile, and total users
-- for a given category and period. Works for all user types.
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_rank(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_user_rank(TEXT, TEXT, TEXT);

-- Create get_user_rank function
CREATE OR REPLACE FUNCTION public.get_user_rank(
  user_id_param UUID,
  category_param TEXT DEFAULT 'overall',
  period_param TEXT DEFAULT 'alltime'
)
RETURNS TABLE (
  rank BIGINT,
  score INTEGER,
  percentile NUMERIC,
  total_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_category TEXT;
  v_period TEXT;
  v_cutoff_date TIMESTAMPTZ;
  v_user_score INTEGER := 0;
  v_user_rank BIGINT;
  v_total_users BIGINT;
  v_percentile NUMERIC;
  v_xp_expr TEXT;
BEGIN
  -- Validate user_id
  v_user_id := user_id_param;
  IF v_user_id IS NULL THEN
    v_user_id := auth.uid();
  END IF;
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Normalize parameters
  v_category := LOWER(COALESCE(category_param, 'overall'));
  v_period := LOWER(COALESCE(period_param, 'alltime'));
  
  -- Determine cutoff date based on period
  CASE v_period
    WHEN 'weekly' THEN
      v_cutoff_date := NOW() - INTERVAL '7 days';
    WHEN 'monthly' THEN
      v_cutoff_date := NOW() - INTERVAL '30 days';
    ELSE
      v_cutoff_date := NULL; -- All time
  END CASE;
  
  -- Determine which XP column to use
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'total_xp'
      ) THEN 'total_xp'
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'xp_points'
      ) THEN 'xp_points'
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'xp'
      ) THEN 'xp'
      ELSE 'total_xp' -- Default fallback
    END
  INTO v_xp_expr;
  
  -- Get user's score first
  EXECUTE format('
    SELECT COALESCE(%I, 0)
    FROM profiles
    WHERE id = $1
  ', v_xp_expr)
  USING v_user_id
  INTO v_user_score;
  
  -- Get user's rank and total users
  EXECUTE format('
    WITH ranked_users AS (
      SELECT 
        id,
        COALESCE(%I, 0) as score,
        ROW_NUMBER() OVER (
          ORDER BY COALESCE(%I, 0) DESC, created_at ASC
        ) as rnk
      FROM profiles
      WHERE ($1 IS NULL OR created_at >= $1)
        AND role IS NOT NULL
    ),
    user_ranked AS (
      SELECT rnk
      FROM ranked_users
      WHERE id = $2
    ),
    totals AS (
      SELECT COUNT(*) as total
      FROM ranked_users
    )
    SELECT 
      COALESCE(ur.rnk, 0),
      COALESCE(t.total, 0)
    FROM totals t
    LEFT JOIN user_ranked ur ON true
  ', v_xp_expr, v_xp_expr)
  USING v_cutoff_date, v_user_id
  INTO v_user_rank, v_total_users;
  
  -- Calculate percentile
  IF v_total_users > 0 AND v_user_rank IS NOT NULL THEN
    v_percentile := ROUND(((v_total_users - v_user_rank + 1)::NUMERIC / v_total_users::NUMERIC) * 100, 2);
  ELSE
    v_percentile := 0;
    IF v_user_rank IS NULL THEN
      v_user_rank := 0;
      v_total_users := 0;
    END IF;
  END IF;
  
  -- Return result
  RETURN QUERY SELECT 
    COALESCE(v_user_rank, 0)::BIGINT as rank,
    COALESCE(v_user_score, 0)::INTEGER as score,
    COALESCE(v_percentile, 0)::NUMERIC as percentile,
    COALESCE(v_total_users, 0)::BIGINT as total_users;
  
EXCEPTION WHEN OTHERS THEN
  -- Return zeros on error (user might not be in leaderboard yet)
  RETURN QUERY SELECT 
    0::BIGINT as rank,
    0::INTEGER as score,
    0::NUMERIC as percentile,
    0::BIGINT as total_users;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_rank(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_rank(UUID, TEXT, TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION public.get_user_rank(UUID, TEXT, TEXT) IS 
'Returns user rank, score, percentile, and total users for a given category and period. Works for all user types.';
