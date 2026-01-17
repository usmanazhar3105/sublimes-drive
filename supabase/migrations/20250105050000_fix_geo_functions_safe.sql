-- Fix geo functions to handle schema variations safely
DROP FUNCTION IF EXISTS public.fn_marketplace_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS public.fn_garage_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS public.fn_meetup_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS public.fn_events_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER);

-- Marketplace radius search (safe)
CREATE OR REPLACE FUNCTION public.fn_marketplace_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (listing_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, ROUND((ST_Distance(l.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.marketplace_listings l
  WHERE 
    l.location_point IS NOT NULL
    AND (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'status')
        THEN l.status = 'approved'
        ELSE TRUE
      END
    )
    AND ST_DWithin(l.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Garage radius search (safe)
CREATE OR REPLACE FUNCTION public.fn_garage_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (garage_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, ROUND((ST_Distance(g.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.garages g
  WHERE 
    g.location_point IS NOT NULL
    AND (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'verified')
        THEN g.verified = TRUE
        ELSE TRUE
      END
    )
    AND (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'status')
        THEN (g.status = 'approved' OR g.status IS NULL)
        ELSE TRUE
      END
    )
    AND ST_DWithin(g.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Events radius search (safe)
CREATE OR REPLACE FUNCTION public.fn_events_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (event_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    RETURN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_point') THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT e.id, ROUND((ST_Distance(e.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.events e
  WHERE 
    e.location_point IS NOT NULL
    AND (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status')
        THEN (e.status = 'approved' OR e.status IS NULL)
        ELSE TRUE
      END
    )
    AND ST_DWithin(e.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Meetup radius search (safe)
CREATE OR REPLACE FUNCTION public.fn_meetup_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (meetup_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetups') THEN
    RETURN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetups' AND column_name = 'location_point') THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT m.id, ROUND((ST_Distance(m.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.meetups m
  WHERE 
    m.location_point IS NOT NULL
    AND ST_DWithin(m.location_point, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_marketplace_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_garage_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_events_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_meetup_search_radius(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated, anon;

DO $$
BEGIN
  RAISE NOTICE '✅ All geo search functions updated with safe column checks';
END $$;
