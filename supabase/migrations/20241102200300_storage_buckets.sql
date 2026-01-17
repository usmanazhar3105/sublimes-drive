-- Migration: Storage Buckets and Policies
-- Date: 2025-11-02
-- Purpose: Create all required Supabase storage buckets with proper policies

-- ============================================================================
-- CREATE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('community-media', 'community-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']),
  ('offers-media', 'offers-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('marketplace-media', 'marketplace-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']),
  ('events-media', 'events-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('garagehub-media', 'garagehub-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('bidrepair-media', 'bidrepair-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('import-media', 'import-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']),
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('brand-assets', 'brand-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']),
  ('system-settings', 'system-settings', false, 5242880, ARRAY['application/json', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DROP EXISTING STORAGE POLICIES (to avoid conflicts)
-- ============================================================================

-- Drop all existing storage policies
DO $$
BEGIN
  -- Drop community media policies
  DROP POLICY IF EXISTS "community_media_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "community_media_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "community_media_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "community_media_owner_delete" ON storage.objects;
  
  -- Drop offers media policies
  DROP POLICY IF EXISTS "offers_media_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "offers_media_admin_upload" ON storage.objects;
  DROP POLICY IF EXISTS "offers_media_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "offers_media_admin_delete" ON storage.objects;
  
  -- Drop marketplace media policies
  DROP POLICY IF EXISTS "marketplace_media_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "marketplace_media_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "marketplace_media_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "marketplace_media_owner_delete" ON storage.objects;
  
  -- Drop events media policies
  DROP POLICY IF EXISTS "events_media_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "events_media_admin_upload" ON storage.objects;
  DROP POLICY IF EXISTS "events_media_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "events_media_admin_delete" ON storage.objects;
  
  -- Drop garagehub media policies
  DROP POLICY IF EXISTS "garagehub_media_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "garagehub_media_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "garagehub_media_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "garagehub_media_owner_delete" ON storage.objects;
  
  -- Drop bidrepair media policies
  DROP POLICY IF EXISTS "bidrepair_media_auth_read" ON storage.objects;
  DROP POLICY IF EXISTS "bidrepair_media_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "bidrepair_media_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "bidrepair_media_owner_delete" ON storage.objects;
  
  -- Drop import media policies
  DROP POLICY IF EXISTS "import_media_auth_read" ON storage.objects;
  DROP POLICY IF EXISTS "import_media_auth_upload" ON storage.objects;
  DROP POLICY IF EXISTS "import_media_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "import_media_owner_delete" ON storage.objects;
  
  -- Drop profile images policies
  DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_owner_upload" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
  
  -- Drop brand assets policies
  DROP POLICY IF EXISTS "brand_assets_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "brand_assets_admin_upload" ON storage.objects;
  DROP POLICY IF EXISTS "brand_assets_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "brand_assets_admin_delete" ON storage.objects;
  
  -- Drop system settings policies
  DROP POLICY IF EXISTS "system_settings_admin_read" ON storage.objects;
  DROP POLICY IF EXISTS "system_settings_admin_upload" ON storage.objects;
  DROP POLICY IF EXISTS "system_settings_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "system_settings_admin_delete" ON storage.objects;
END $$;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Community Media
CREATE POLICY "community_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-media');

CREATE POLICY "community_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY "community_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "community_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Offers Media
CREATE POLICY "offers_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'offers-media');

CREATE POLICY "offers_media_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'offers-media' AND auth.role() = 'authenticated');

CREATE POLICY "offers_media_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'offers-media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'offers-media' AND auth.role() = 'authenticated');

CREATE POLICY "offers_media_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'offers-media' AND auth.role() = 'authenticated');

-- Marketplace Media
CREATE POLICY "marketplace_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketplace-media');

CREATE POLICY "marketplace_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'marketplace-media' AND auth.role() = 'authenticated');

CREATE POLICY "marketplace_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'marketplace-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'marketplace-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "marketplace_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'marketplace-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Events Media
CREATE POLICY "events_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events-media');

CREATE POLICY "events_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'events-media' AND auth.role() = 'authenticated');

CREATE POLICY "events_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'events-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'events-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "events_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'events-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Garage Hub Media
CREATE POLICY "garagehub_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'garagehub-media');

CREATE POLICY "garagehub_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'garagehub-media' AND auth.role() = 'authenticated');

CREATE POLICY "garagehub_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'garagehub-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'garagehub-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "garagehub_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'garagehub-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bid Repair Media
CREATE POLICY "bidrepair_media_auth_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bidrepair-media' AND auth.role() = 'authenticated');

CREATE POLICY "bidrepair_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bidrepair-media' AND auth.role() = 'authenticated');

CREATE POLICY "bidrepair_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'bidrepair-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'bidrepair-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "bidrepair_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bidrepair-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Import Media
CREATE POLICY "import_media_auth_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'import-media' AND auth.role() = 'authenticated');

CREATE POLICY "import_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'import-media' AND auth.role() = 'authenticated');

CREATE POLICY "import_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'import-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'import-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "import_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'import-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile Images
CREATE POLICY "profile_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_owner_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "profile_images_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "profile_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Brand Assets
CREATE POLICY "brand_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-assets');

CREATE POLICY "brand_assets_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

CREATE POLICY "brand_assets_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

CREATE POLICY "brand_assets_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

-- System Settings (Private)
CREATE POLICY "system_settings_admin_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-settings' AND auth.role() = 'authenticated');

CREATE POLICY "system_settings_admin_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'system-settings' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'system-settings' AND auth.role() = 'authenticated');


