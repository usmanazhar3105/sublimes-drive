/**
 * EXPORT RPC FUNCTIONS
 * 
 * Functions for exporting data with date ranges
 * 
 * Date: 2025-11-02
 */

-- Export users with date range
CREATE OR REPLACE FUNCTION fn_export_users(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMP,
  verification_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.verification_status
  FROM profiles p
  WHERE (p_start_date IS NULL OR p.created_at >= p_start_date)
    AND (p_end_date IS NULL OR p.created_at <= p_end_date)
  ORDER BY p.created_at DESC;
END;
$$;

-- Export posts with date range
CREATE OR REPLACE FUNCTION fn_export_posts(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  body TEXT,
  status TEXT,
  created_at TIMESTAMP,
  like_count INTEGER,
  comment_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    pr.email,
    p.body,
    p.status,
    p.created_at,
    COALESCE(ps.like_count, 0)::INTEGER,
    COALESCE(ps.comment_count, 0)::INTEGER
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN post_stats ps ON p.id = ps.post_id
  WHERE (p_start_date IS NULL OR p.created_at >= p_start_date)
    AND (p_end_date IS NULL OR p.created_at <= p_end_date)
  ORDER BY p.created_at DESC;
END;
$$;

-- Export marketplace listings with date range
CREATE OR REPLACE FUNCTION fn_export_listings(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  seller_email TEXT,
  listing_type TEXT,
  title TEXT,
  price DECIMAL,
  status TEXT,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    pr.email,
    l.listing_type,
    l.title,
    l.price,
    l.status,
    l.created_at
  FROM market_listings l
  LEFT JOIN profiles pr ON l.user_id = pr.id
  WHERE (p_start_date IS NULL OR l.created_at >= p_start_date)
    AND (p_end_date IS NULL OR l.created_at <= p_end_date)
  ORDER BY l.created_at DESC;
END;
$$;

-- Export verification requests with date range
CREATE OR REPLACE FUNCTION fn_export_verifications(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  verification_type TEXT,
  status TEXT,
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    pr.email,
    v.verification_type,
    v.status,
    v.created_at,
    v.reviewed_at
  FROM verification_requests v
  LEFT JOIN profiles pr ON v.user_id = pr.id
  WHERE (p_start_date IS NULL OR v.created_at >= p_start_date)
    AND (p_end_date IS NULL OR v.created_at <= p_end_date)
  ORDER BY v.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION fn_export_users TO authenticated;
GRANT EXECUTE ON FUNCTION fn_export_posts TO authenticated;
GRANT EXECUTE ON FUNCTION fn_export_listings TO authenticated;
GRANT EXECUTE ON FUNCTION fn_export_verifications TO authenticated;
