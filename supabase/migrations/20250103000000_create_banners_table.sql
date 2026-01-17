-- Migration: Create Banners Table
-- Date: 2025-01-03
-- Purpose: Create banners table for homepage slider feature

-- Create banners table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') THEN
    CREATE TABLE public.banners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT,
      link_text TEXT DEFAULT 'Learn More',
      is_active BOOLEAN DEFAULT true,
      priority INTEGER DEFAULT 0,
      start_date TIMESTAMPTZ DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      target_audience TEXT DEFAULT 'all', -- all, car_owners, garage_owners, vendors
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
    );

    -- Add indexes
    CREATE INDEX idx_banners_active ON public.banners(is_active, priority DESC);
    CREATE INDEX idx_banners_dates ON public.banners(start_date, end_date);
    CREATE INDEX idx_banners_audience ON public.banners(target_audience);
    
    -- Add trigger for updated_at
    CREATE TRIGGER update_banners_updated_at
      BEFORE UPDATE ON public.banners
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Insert sample banners for testing
    INSERT INTO public.banners (title, description, image_url, link_url, priority, target_audience) VALUES
    ('Welcome to Sublimes Drive', 'Join the UAE''s premier automotive community', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7', '/communities', 1, 'all'),
    ('List Your Car Today', 'Sell your car to thousands of buyers in the UAE', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', '/marketplace', 2, 'car_owners'),
    ('Garage Services Hub', 'Connect with verified garages across the UAE', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3', '/garage-hub', 3, 'all');

  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banners

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;
DROP POLICY IF EXISTS "banners_admin_all" ON public.banners;

-- Public can read active banners
CREATE POLICY "banners_public_read"
  ON public.banners FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date > NOW())
  );

-- Admin/Editor can manage all banners (check in application layer)
CREATE POLICY "banners_admin_all"
  ON public.banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- Add comment
COMMENT ON TABLE public.banners IS 'Homepage banner slider images and promotional content';

