-- Events - Minimal Safe Addition
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  qr_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS event_tickets_owner ON public.event_tickets;
CREATE POLICY event_tickets_owner ON public.event_tickets FOR SELECT USING (owner_id = auth.uid());

ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ticket_tiers_public ON public.ticket_tiers;
CREATE POLICY ticket_tiers_public ON public.ticket_tiers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'approved')
  OR auth.uid() IS NOT NULL
);

