-- Garage Hub - Minimal Safe Addition
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  plate_number TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.garage_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'technician')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (garage_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.repair_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  location_city TEXT,
  location_point GEOGRAPHY(Point, 4326),
  status TEXT DEFAULT 'pending',
  awarded_garage_id UUID REFERENCES public.garages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.repair_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.repair_jobs(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  eta_days INTEGER,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicles_owner ON public.vehicles;
CREATE POLICY vehicles_owner ON public.vehicles FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

ALTER TABLE public.repair_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repair_jobs_public ON public.repair_jobs;
CREATE POLICY repair_jobs_public ON public.repair_jobs FOR SELECT USING (status = 'open' OR requester_id = auth.uid());

CREATE INDEX IF NOT EXISTS gist_repair_jobs_location ON public.repair_jobs USING GIST (location_point);

