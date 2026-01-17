-- Offers Part 1: Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vendors_owner ON public.vendors(owner_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendors_public_approved ON public.vendors;
CREATE POLICY vendors_public_approved ON public.vendors FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS vendors_owner_all ON public.vendors;
CREATE POLICY vendors_owner_all ON public.vendors FOR ALL TO authenticated 
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
