-- ============================================================================
-- ENABLE POSTGIS FOR ALL MODULES - Safe Minimal Migration
-- ============================================================================
-- This migration ONLY enables PostGIS and creates geo search functions
-- Does NOT recreate existing tables - only adds geo capabilities
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE POSTGIS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================================
-- PART 2: ADD LOCATION COLUMNS TO EXISTING TABLES (if missing)
-- ============================================================================

-- Marketplace listings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'location_point') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to marketplace_listings';
    END IF;
  END IF;
END $$;

-- Garages
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'location_point') THEN
      ALTER TABLE public.garages ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to garages';
    END IF;
  END IF;
END $$;

-- Repair jobs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'repair_jobs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repair_jobs' AND column_name = 'location_point') THEN
      ALTER TABLE public.repair_jobs ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to repair_jobs';
    END IF;
  END IF;
END $$;

-- Meetups
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetups') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetups' AND column_name = 'location_point') THEN
      ALTER TABLE public.meetups ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to meetups';
    END IF;
  END IF;
END $$;

-- Events  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_point') THEN
      ALTER TABLE public.events ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to events';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 3: CREATE GIST SPATIAL INDEXES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_marketplace_listings_location ON public.marketplace_listings USING GIST (location_point);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_garages_location ON public.garages USING GIST (location_point);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repair_jobs' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_repair_jobs_location ON public.repair_jobs USING GIST (location_point);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetups' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_meetups_location ON public.meetups USING GIST (location_point);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_events_location ON public.events USING GIST (location_point);
  END IF;
  
  RAISE NOTICE '✅ GIST spatial indexes created';
END $$;

-- ============================================================================
-- PART 4: GEO SEARCH FUNCTIONS
-- ============================================================================

-- Marketplace radius search
CREATE OR REPLACE FUNCTION public.fn_marketplace_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (listing_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    ROUND((ST_Distance(
      l.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.marketplace_listings l
  WHERE l.location_point IS NOT NULL
    AND ST_DWithin(
      l.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Garage radius search
CREATE OR REPLACE FUNCTION public.fn_garage_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (garage_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    ROUND((ST_Distance(
      g.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.garages g
  WHERE g.location_point IS NOT NULL
    AND ST_DWithin(
      g.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Meetup radius search
CREATE OR REPLACE FUNCTION public.fn_meetup_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (meetup_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    ROUND((ST_Distance(
      m.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.meetups m
  WHERE m.location_point IS NOT NULL
    AND m.starts_at > NOW()
    AND ST_DWithin(
      m.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- Events radius search
CREATE OR REPLACE FUNCTION public.fn_events_search_radius(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (event_id UUID, distance_km NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    ROUND((ST_Distance(
      e.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::NUMERIC, 2) AS distance_km
  FROM public.events e
  WHERE e.location_point IS NOT NULL
    AND e.starts_at > NOW()
    AND ST_DWithin(
      e.location_point,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_marketplace_search_radius TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_garage_search_radius TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_meetup_search_radius TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_events_search_radius TO authenticated, anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_postgis BOOLEAN;
  v_gist_count INT;
  v_geo_funcs INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'postgis') INTO v_postgis;
  SELECT COUNT(*) INTO v_gist_count FROM pg_indexes WHERE indexname LIKE 'gist_%';
  SELECT COUNT(*) INTO v_geo_funcs FROM pg_proc WHERE proname LIKE '%_search_radius%';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ POSTGIS ENABLED FOR ALL MODULES';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'PostGIS: %', CASE WHEN v_postgis THEN '✅ ENABLED' ELSE '❌ DISABLED' END;
  RAISE NOTICE 'GIST Indexes: %', v_gist_count;
  RAISE NOTICE 'Geo Functions: %', v_geo_funcs;
  RAISE NOTICE '';
  RAISE NOTICE 'Geo Search Functions Created:';
  RAISE NOTICE '  ✅ fn_marketplace_search_radius';
  RAISE NOTICE '  ✅ fn_garage_search_radius';
  RAISE NOTICE '  ✅ fn_meetup_search_radius';
  RAISE NOTICE '  ✅ fn_events_search_radius';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

