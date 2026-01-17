-- Ensure all location_point columns exist before functions use them
DO $$
BEGIN
  -- marketplace_listings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'location_point') THEN
      ALTER TABLE public.marketplace_listings ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to marketplace_listings';
    END IF;
  END IF;

  -- garages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'location_point') THEN
      ALTER TABLE public.garages ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to garages';
    END IF;
  END IF;

  -- events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_point') THEN
      ALTER TABLE public.events ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to events';
    END IF;
  END IF;

  -- meetups (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetups') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetups' AND column_name = 'location_point') THEN
      ALTER TABLE public.meetups ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to meetups';
    END IF;
  END IF;

  -- offers (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'location_point') THEN
      ALTER TABLE public.offers ADD COLUMN location_point GEOGRAPHY(Point, 4326);
      RAISE NOTICE '✅ Added location_point to offers';
    END IF;
  END IF;
END $$;

-- Create GIST indexes if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_marketplace_listings_location ON public.marketplace_listings USING GIST (location_point);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garages' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_garages_location ON public.garages USING GIST (location_point);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_events_location ON public.events USING GIST (location_point);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetups' AND column_name = 'location_point') THEN
    CREATE INDEX IF NOT EXISTS gist_meetups_location ON public.meetups USING GIST (location_point);
  END IF;
END $$;
