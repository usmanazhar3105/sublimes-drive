-- ============================================================================
-- STORAGE BUCKETS & POLICIES (Idempotent)
-- Creates required buckets and RLS policies for public/private access
-- ============================================================================

-- Create buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('community-media','community-media', true),
  ('offers-media','offers-media', true),
  ('marketplace-media','marketplace-media', true),
  ('events-media','events-media', true),
  ('garagehub-media','garagehub-media', false),
  ('bidrepair-media','bidrepair-media', false),
  ('import-media','import-media', false),
  ('profile-images','profile-images', false),
  ('system-settings','system-settings', false)
ON CONFLICT (id) DO NOTHING;

-- RLS is managed by Supabase for storage.objects; do not alter here to avoid ownership errors on hosted projects.

-- Helper: create policy if missing
-- (Wrap each in DO $$ to make idempotent)

-- PUBLIC READ BUCKETS --------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public read - community-media'
  ) THEN
    CREATE POLICY "public read - community-media"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'community-media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='auth upload own - community-media'
  ) THEN
    CREATE POLICY "auth upload own - community-media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'community-media' AND position((auth.uid())::text || '/' in name) = 1
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public read - offers-media'
  ) THEN
    CREATE POLICY "public read - offers-media"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'offers-media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='auth upload own - offers-media'
  ) THEN
    CREATE POLICY "auth upload own - offers-media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'offers-media' AND position((auth.uid())::text || '/' in name) = 1
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public read - marketplace-media'
  ) THEN
    CREATE POLICY "public read - marketplace-media"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'marketplace-media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='auth upload own - marketplace-media'
  ) THEN
    CREATE POLICY "auth upload own - marketplace-media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'marketplace-media' AND position((auth.uid())::text || '/' in name) = 1
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='public read - events-media'
  ) THEN
    CREATE POLICY "public read - events-media"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'events-media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='auth upload own - events-media'
  ) THEN
    CREATE POLICY "auth upload own - events-media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'events-media' AND position((auth.uid())::text || '/' in name) = 1
      );
  END IF;
END $$;

-- PRIVATE BUCKETS ------------------------------------------------------------
-- garagehub-media
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private read - garagehub-media'
  ) THEN
    CREATE POLICY "private read - garagehub-media"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'garagehub-media' AND (
          position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt()->>'role') = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private manage own - garagehub-media'
  ) THEN
    CREATE POLICY "private manage own - garagehub-media"
      ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'garagehub-media' AND position((auth.uid())::text || '/' in name) = 1)
      WITH CHECK (bucket_id = 'garagehub-media' AND position((auth.uid())::text || '/' in name) = 1);
  END IF;
END $$;

-- bidrepair-media
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private read - bidrepair-media'
  ) THEN
    CREATE POLICY "private read - bidrepair-media"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'bidrepair-media' AND (
          position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt()->>'role') = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private manage own - bidrepair-media'
  ) THEN
    CREATE POLICY "private manage own - bidrepair-media"
      ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'bidrepair-media' AND position((auth.uid())::text || '/' in name) = 1)
      WITH CHECK (bucket_id = 'bidrepair-media' AND position((auth.uid())::text || '/' in name) = 1);
  END IF;
END $$;

-- import-media
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private read - import-media'
  ) THEN
    CREATE POLICY "private read - import-media"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'import-media' AND (
          position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt()->>'role') = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private manage own - import-media'
  ) THEN
    CREATE POLICY "private manage own - import-media"
      ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'import-media' AND position((auth.uid())::text || '/' in name) = 1)
      WITH CHECK (bucket_id = 'import-media' AND position((auth.uid())::text || '/' in name) = 1);
  END IF;
END $$;

-- profile-images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private read - profile-images'
  ) THEN
    CREATE POLICY "private read - profile-images"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'profile-images' AND (
          position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt()->>'role') = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private manage own - profile-images'
  ) THEN
    CREATE POLICY "private manage own - profile-images"
      ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'profile-images' AND position((auth.uid())::text || '/' in name) = 1)
      WITH CHECK (bucket_id = 'profile-images' AND position((auth.uid())::text || '/' in name) = 1);
  END IF;
END $$;

-- system-settings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private read - system-settings'
  ) THEN
    CREATE POLICY "private read - system-settings"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'system-settings' AND (
          position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt()->>'role') = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='private manage own - system-settings'
  ) THEN
    CREATE POLICY "private manage own - system-settings"
      ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'system-settings' AND position((auth.uid())::text || '/' in name) = 1)
      WITH CHECK (bucket_id = 'system-settings' AND position((auth.uid())::text || '/' in name) = 1);
  END IF;
END $$;
