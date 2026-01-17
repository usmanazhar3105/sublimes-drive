-- === STORAGE: Buckets + RLS policies (extended) ===
SET search_path = public;

-- Buckets (idempotent creates)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'community-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'offers-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('offers-media', 'offers-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'marketplace-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-media', 'marketplace-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'events-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('events-media', 'events-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'garagehub-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('garagehub-media', 'garagehub-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'bidrepair-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('bidrepair-media', 'bidrepair-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'import-media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('import-media', 'import-media', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', FALSE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'system-settings') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('system-settings', 'system-settings', FALSE);
  END IF;
END $$;

-- Community media: auth users read, owner-scoped write/delete
DROP POLICY IF EXISTS "community-media_read_authenticated" ON storage.objects;
CREATE POLICY "community-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'community-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "community-media_owner_write" ON storage.objects;
CREATE POLICY "community-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'community-media'
    AND (
      (position('posts/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
      OR (position('comments/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
    )
  );

DROP POLICY IF EXISTS "community-media_owner_update" ON storage.objects;
CREATE POLICY "community-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'community-media'
    AND (
      (position('posts/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
      OR (position('comments/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
    )
  )
  WITH CHECK (
    bucket_id = 'community-media'
    AND (
      (position('posts/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
      OR (position('comments/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
    )
  );

DROP POLICY IF EXISTS "community-media_owner_delete" ON storage.objects;
CREATE POLICY "community-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'community-media'
    AND (
      (position('posts/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
      OR (position('comments/' in storage.foldername(name)) = 1 AND split_part(name, '/', 2) = auth.uid()::text)
    )
  );

-- Profile images: public read, owner-scoped write/delete under avatars/<uid>/...
DROP POLICY IF EXISTS "profile-images_read_public" ON storage.objects;
CREATE POLICY "profile-images_read_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "profile-images_owner_write" ON storage.objects;
CREATE POLICY "profile-images_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND position('avatars/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile-images_owner_update" ON storage.objects;
CREATE POLICY "profile-images_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND position('avatars/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-images'
    AND position('avatars/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile-images_owner_delete" ON storage.objects;
CREATE POLICY "profile-images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND position('avatars/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Events media
DROP POLICY IF EXISTS "events-media_read_authenticated" ON storage.objects;
CREATE POLICY "events-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'events-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "events-media_owner_write" ON storage.objects;
CREATE POLICY "events-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'events-media'
    AND position('events/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "events-media_owner_update" ON storage.objects;
CREATE POLICY "events-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'events-media'
    AND position('events/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'events-media'
    AND position('events/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "events-media_owner_delete" ON storage.objects;
CREATE POLICY "events-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'events-media'
    AND position('events/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Marketplace media
DROP POLICY IF EXISTS "marketplace-media_read_authenticated" ON storage.objects;
CREATE POLICY "marketplace-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'marketplace-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "marketplace-media_owner_write" ON storage.objects;
CREATE POLICY "marketplace-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'marketplace-media'
    AND position('listings/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "marketplace-media_owner_update" ON storage.objects;
CREATE POLICY "marketplace-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'marketplace-media'
    AND position('listings/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'marketplace-media'
    AND position('listings/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "marketplace-media_owner_delete" ON storage.objects;
CREATE POLICY "marketplace-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'marketplace-media'
    AND position('listings/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Offers media
DROP POLICY IF EXISTS "offers-media_read_authenticated" ON storage.objects;
CREATE POLICY "offers-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'offers-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "offers-media_owner_write" ON storage.objects;
CREATE POLICY "offers-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'offers-media'
    AND position('offers/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "offers-media_owner_update" ON storage.objects;
CREATE POLICY "offers-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'offers-media'
    AND position('offers/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'offers-media'
    AND position('offers/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "offers-media_owner_delete" ON storage.objects;
CREATE POLICY "offers-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'offers-media'
    AND position('offers/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Garagehub media
DROP POLICY IF EXISTS "garagehub-media_read_authenticated" ON storage.objects;
CREATE POLICY "garagehub-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'garagehub-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "garagehub-media_owner_write" ON storage.objects;
CREATE POLICY "garagehub-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'garagehub-media'
    AND position('garages/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "garagehub-media_owner_update" ON storage.objects;
CREATE POLICY "garagehub-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'garagehub-media'
    AND position('garages/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'garagehub-media'
    AND position('garages/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "garagehub-media_owner_delete" ON storage.objects;
CREATE POLICY "garagehub-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'garagehub-media'
    AND position('garages/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Bidrepair media
DROP POLICY IF EXISTS "bidrepair-media_read_authenticated" ON storage.objects;
CREATE POLICY "bidrepair-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'bidrepair-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bidrepair-media_owner_write" ON storage.objects;
CREATE POLICY "bidrepair-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'bidrepair-media'
    AND position('bidrepair/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "bidrepair-media_owner_update" ON storage.objects;
CREATE POLICY "bidrepair-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'bidrepair-media'
    AND position('bidrepair/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'bidrepair-media'
    AND position('bidrepair/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "bidrepair-media_owner_delete" ON storage.objects;
CREATE POLICY "bidrepair-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'bidrepair-media'
    AND position('bidrepair/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Import media
DROP POLICY IF EXISTS "import-media_read_authenticated" ON storage.objects;
CREATE POLICY "import-media_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING ((bucket_id = 'import-media') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "import-media_owner_write" ON storage.objects;
CREATE POLICY "import-media_owner_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'import-media'
    AND position('imports/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "import-media_owner_update" ON storage.objects;
CREATE POLICY "import-media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'import-media'
    AND position('imports/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'import-media'
    AND position('imports/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "import-media_owner_delete" ON storage.objects;
CREATE POLICY "import-media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'import-media'
    AND position('imports/' in storage.foldername(name)) = 1
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- System settings: admin/editor only
DROP POLICY IF EXISTS "system-settings_admin_all" ON storage.objects;
CREATE POLICY "system-settings_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'system-settings'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  )
  WITH CHECK (
    bucket_id = 'system-settings'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','editor')
    )
  );
