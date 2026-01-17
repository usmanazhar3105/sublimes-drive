-- ====================================================================
-- Sublimes Drive — Admin RLS & RPCs (Idempotent)
-- ====================================================================

-- 0) Guard rails
CREATE SCHEMA IF NOT EXISTS app;

-- 1) Role enum + profiles.role alignment (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin','superadmin','editor','vendor','garage_owner','car_owner','user','browser');
  END IF;
END$$;

-- Ensure profiles.role column exists and uses enum (non-destructive: add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role public.user_role DEFAULT 'user'::public.user_role NOT NULL;
  END IF;
END$$;

-- 2) Helpers for auth context (stable + SECURITY DEFINER for admin checks)
CREATE OR REPLACE FUNCTION app.current_uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$ SELECT auth.uid() $$;

-- is_admin() checks both JWT and DB role; works for service role too.
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_jwt jsonb := auth.jwt();
  v_claim_admin boolean := COALESCE( (v_jwt->>'is_admin')::boolean, false );
  v_claim_role text := NULLIF(auth.role(), '');
  v_db_admin boolean := false;
BEGIN
  -- Service role always bypasses
  IF v_claim_role = 'service_role' THEN
    RETURN true;
  END IF;

  -- JWT claim hint
  IF v_claim_admin THEN
    RETURN true;
  END IF;

  -- DB-backed role check
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = v_uid
      AND p.role IN ('admin','superadmin')
  ) INTO v_db_admin;

  RETURN v_db_admin;
END$$;

-- Convenience: truthy for service role as well
CREATE OR REPLACE FUNCTION app.is_service()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.role() = 'service_role' $$;

-- 3) Common predicates (inlineable)
-- Owner check for tables that have a user_id column
CREATE OR REPLACE FUNCTION app.is_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.uid() IS NOT NULL AND user_id = auth.uid() $$;

-- 4) RPCs (SECURITY DEFINER), audited where relevant

-- 4.1 Admin: set a user's role
CREATE OR REPLACE FUNCTION app.admin_set_role(p_user_id uuid, p_role public.user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT app.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = p_user_id;

  -- optional: write audit
  INSERT INTO public.audit_log(actor_id, action, entity, entity_id, meta)
  SELECT auth.uid(), 'admin_set_role', 'profiles', p_user_id::text, jsonb_build_object('role', p_role)
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_log');
END$$;

-- 4.2 Admin: moderate listing state
-- expects listings(state text, ... , user_id uuid)
CREATE OR REPLACE FUNCTION app.admin_upsert_listing_state(p_listing_id uuid, p_state text, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT app.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.listings
     SET state = p_state,
         updated_at = NOW()
   WHERE id = p_listing_id;

  INSERT INTO public.audit_log(actor_id, action, entity, entity_id, meta)
  SELECT auth.uid(), 'admin_update_state', 'listings', p_listing_id::text,
         jsonb_build_object('state', p_state, 'reason', p_reason)
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_log');
END$$;

-- 4.3 Admin: delete an arbitrary row by table + id (safe variant)
-- Requires tables use UUID primary key column named "id"
CREATE OR REPLACE FUNCTION app.admin_delete_row(p_table regclass, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sql text;
BEGIN
  IF NOT app.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  sql := format('DELETE FROM %s WHERE id = $1', p_table);
  EXECUTE sql USING p_id;

  INSERT INTO public.audit_log(actor_id, action, entity, entity_id)
  SELECT auth.uid(), 'admin_delete_row', p_table::text, p_id::text
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_log');
END$$;

-- 4.4 User RPCs (like toggles) — SECURITY DEFINER but enforce ownership with auth.uid()
-- Toggle post like
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid)
RETURNS TABLE(liked boolean, like_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF EXISTS (SELECT 1 FROM public.community_post_likes WHERE post_id=p_post_id AND user_id=v_user) THEN
    DELETE FROM public.community_post_likes WHERE post_id=p_post_id AND user_id=v_user;
    liked := false;
  ELSE
    INSERT INTO public.community_post_likes (post_id,user_id)
    VALUES (p_post_id,v_user)
    ON CONFLICT (post_id,user_id) DO NOTHING;
    liked := true;
  END IF;

  SELECT COUNT(*)::bigint INTO like_count
  FROM public.community_post_likes
  WHERE post_id=p_post_id;

  RETURN NEXT;
END$$;

-- Toggle comment like
CREATE OR REPLACE FUNCTION public.toggle_comment_like(p_comment_id uuid)
RETURNS TABLE(liked boolean, like_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF EXISTS (SELECT 1 FROM public.community_comment_likes WHERE comment_id=p_comment_id AND user_id=v_user) THEN
    DELETE FROM public.community_comment_likes WHERE comment_id=p_comment_id AND user_id=v_user;
    liked := false;
  ELSE
    INSERT INTO public.community_comment_likes (comment_id,user_id)
    VALUES (p_comment_id,v_user)
    ON CONFLICT (comment_id,user_id) DO NOTHING;
    liked := true;
  END IF;

  SELECT COUNT(*)::bigint INTO like_count
  FROM public.community_comment_likes
  WHERE comment_id=p_comment_id;

  RETURN NEXT;
END$$;

-- 5) RLS — Policy sets
-- Helper: enable RLS idempotently
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
      AND table_name IN (
        'profiles','community_posts','community_comments','community_post_likes',
        'community_comment_likes','listings','listing_images','offers','offer_images',
        'events','event_attendees','garages','garage_services','repair_bids',
        'wallets','wallet_transactions','notifications','audit_log'
      )
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.table_schema, r.table_name);
  END LOOP;
END$$;

-- 5.1 Public-ish content: everyone (authenticated) can read; owners write; admin bypass
-- community_posts(user_id)
DROP POLICY IF EXISTS "cp_admin_all" ON public.community_posts;
CREATE POLICY "cp_admin_all" ON public.community_posts
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "cp_read_all_auth" ON public.community_posts;
CREATE POLICY "cp_read_all_auth" ON public.community_posts
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());

DROP POLICY IF EXISTS "cp_owner_write" ON public.community_posts;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='community_posts' AND column_name='user_id'
  ) THEN
    CREATE POLICY "cp_owner_write" ON public.community_posts FOR INSERT WITH CHECK (app.is_owner(user_id));
    CREATE POLICY "cp_owner_update" ON public.community_posts FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));
    CREATE POLICY "cp_owner_delete" ON public.community_posts FOR DELETE USING (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='community_posts' AND column_name='author_id'
  ) THEN
    CREATE POLICY "cp_owner_write" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "cp_owner_update" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "cp_owner_delete" ON public.community_posts FOR DELETE USING (auth.uid() = author_id);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='community_posts' AND column_name='created_by'
  ) THEN
    CREATE POLICY "cp_owner_write" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = created_by);
    CREATE POLICY "cp_owner_update" ON public.community_posts FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
    CREATE POLICY "cp_owner_delete" ON public.community_posts FOR DELETE USING (auth.uid() = created_by);
  ELSE
    -- Fallback: allow only admin/service to modify
    CREATE POLICY "cp_owner_write" ON public.community_posts FOR INSERT WITH CHECK (app.is_admin() OR app.is_service());
    CREATE POLICY "cp_owner_update" ON public.community_posts FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
    CREATE POLICY "cp_owner_delete" ON public.community_posts FOR DELETE USING (app.is_admin() OR app.is_service());
  END IF;
END $$;

-- community_comments(user_id)
DROP POLICY IF EXISTS "cc_admin_all" ON public.community_comments;
CREATE POLICY "cc_admin_all" ON public.community_comments
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "cc_read_all_auth" ON public.community_comments;
CREATE POLICY "cc_read_all_auth" ON public.community_comments
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());

DROP POLICY IF EXISTS "cc_owner_insert" ON public.community_comments;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='community_comments' AND column_name='user_id'
  ) THEN
    CREATE POLICY "cc_owner_insert" ON public.community_comments FOR INSERT WITH CHECK (app.is_owner(user_id));
    CREATE POLICY "cc_owner_update" ON public.community_comments FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));
    CREATE POLICY "cc_owner_delete" ON public.community_comments FOR DELETE USING (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='community_comments' AND column_name='author_id'
  ) THEN
    CREATE POLICY "cc_owner_insert" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "cc_owner_update" ON public.community_comments FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "cc_owner_delete" ON public.community_comments FOR DELETE USING (auth.uid() = author_id);
  ELSE
    CREATE POLICY "cc_owner_insert" ON public.community_comments FOR INSERT WITH CHECK (app.is_admin() OR app.is_service());
    CREATE POLICY "cc_owner_update" ON public.community_comments FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
    CREATE POLICY "cc_owner_delete" ON public.community_comments FOR DELETE USING (app.is_admin() OR app.is_service());
  END IF;
END $$;

-- community_post_likes(user_id)
DROP POLICY IF EXISTS "cpl_admin_all" ON public.community_post_likes;
CREATE POLICY "cpl_admin_all" ON public.community_post_likes
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "cpl_read_all_auth" ON public.community_post_likes;
CREATE POLICY "cpl_read_all_auth" ON public.community_post_likes
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());

DROP POLICY IF EXISTS "cpl_owner_write" ON public.community_post_likes;
CREATE POLICY "cpl_owner_write" ON public.community_post_likes
  FOR INSERT WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "cpl_owner_delete" ON public.community_post_likes;
CREATE POLICY "cpl_owner_delete" ON public.community_post_likes
  FOR DELETE USING (app.is_owner(user_id));

-- community_comment_likes(user_id)
DROP POLICY IF EXISTS "ccl_admin_all" ON public.community_comment_likes;
CREATE POLICY "ccl_admin_all" ON public.community_comment_likes
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "ccl_read_all_auth" ON public.community_comment_likes;
CREATE POLICY "ccl_read_all_auth" ON public.community_comment_likes
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());

DROP POLICY IF EXISTS "ccl_owner_write" ON public.community_comment_likes;
CREATE POLICY "ccl_owner_write" ON public.community_comment_likes
  FOR INSERT WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "ccl_owner_delete" ON public.community_comment_likes;
CREATE POLICY "ccl_owner_delete" ON public.community_comment_likes
  FOR DELETE USING (app.is_owner(user_id));

-- listings(user_id), listing_images(user_id)
-- listings
DROP POLICY IF EXISTS "li_admin_all" ON public.listings;
CREATE POLICY "li_admin_all" ON public.listings
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "li_read_all_auth" ON public.listings;
CREATE POLICY "li_read_all_auth" ON public.listings
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());

DROP POLICY IF EXISTS "li_owner_insert" ON public.listings;
CREATE POLICY "li_owner_insert" ON public.listings
  FOR INSERT WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "li_owner_update" ON public.listings;
CREATE POLICY "li_owner_update" ON public.listings
  FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "li_owner_delete" ON public.listings;
CREATE POLICY "li_owner_delete" ON public.listings
  FOR DELETE USING (app.is_owner(user_id));

-- listing_images (guarded if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='listing_images'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "limg_admin_all" ON public.listing_images';
    EXECUTE 'CREATE POLICY "limg_admin_all" ON public.listing_images FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())';

    EXECUTE 'DROP POLICY IF EXISTS "limg_read_all_auth" ON public.listing_images';
    EXECUTE 'CREATE POLICY "limg_read_all_auth" ON public.listing_images FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service())';

    EXECUTE 'DROP POLICY IF EXISTS "limg_owner_write" ON public.listing_images';
    EXECUTE 'CREATE POLICY "limg_owner_write" ON public.listing_images FOR INSERT WITH CHECK (app.is_owner(user_id))';

    EXECUTE 'DROP POLICY IF EXISTS "limg_owner_update" ON public.listing_images';
    EXECUTE 'CREATE POLICY "limg_owner_update" ON public.listing_images FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id))';

    EXECUTE 'DROP POLICY IF EXISTS "limg_owner_delete" ON public.listing_images';
    EXECUTE 'CREATE POLICY "limg_owner_delete" ON public.listing_images FOR DELETE USING (app.is_owner(user_id))';
  END IF;
END $$;

-- offers policies (guarded for schema differences)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='offers'
  ) THEN
    -- Base offers table exists
    EXECUTE 'DROP POLICY IF EXISTS "of_admin_all" ON public.offers';
    EXECUTE 'CREATE POLICY "of_admin_all" ON public.offers FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())';

    EXECUTE 'DROP POLICY IF EXISTS "of_read_all_auth" ON public.offers';
    EXECUTE 'CREATE POLICY "of_read_all_auth" ON public.offers FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service())';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offers' AND column_name='user_id'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_insert" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_insert" ON public.offers FOR INSERT WITH CHECK (app.is_owner(user_id))';
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_update" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_update" ON public.offers FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id))';
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_delete" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_delete" ON public.offers FOR DELETE USING (app.is_owner(user_id))';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offers' AND column_name='owner_id'
    ) THEN
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_insert" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_insert" ON public.offers FOR INSERT WITH CHECK (owner_id = auth.uid())';
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_update" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_update" ON public.offers FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid())';
      EXECUTE 'DROP POLICY IF EXISTS "of_owner_delete" ON public.offers';
      EXECUTE 'CREATE POLICY "of_owner_delete" ON public.offers FOR DELETE USING (owner_id = auth.uid())';
    END IF;
  ELSE
    -- No base offers table: likely using offers_full; skip offers policies
    NULL;
  END IF;
END $$;

-- offer_images policies only if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='offer_images'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "oimg_admin_all" ON public.offer_images';
    EXECUTE 'CREATE POLICY "oimg_admin_all" ON public.offer_images FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())';
    EXECUTE 'DROP POLICY IF EXISTS "oimg_read_all_auth" ON public.offer_images';
    EXECUTE 'CREATE POLICY "oimg_read_all_auth" ON public.offer_images FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service())';
    EXECUTE 'DROP POLICY IF EXISTS "oimg_owner_write" ON public.offer_images';
    EXECUTE 'CREATE POLICY "oimg_owner_write" ON public.offer_images FOR INSERT WITH CHECK (app.is_owner(user_id))';
    EXECUTE 'DROP POLICY IF EXISTS "oimg_owner_update" ON public.offer_images';
    EXECUTE 'CREATE POLICY "oimg_owner_update" ON public.offer_images FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id))';
    EXECUTE 'DROP POLICY IF EXISTS "oimg_owner_delete" ON public.offer_images';
    EXECUTE 'CREATE POLICY "oimg_owner_delete" ON public.offer_images FOR DELETE USING (app.is_owner(user_id))';
  END IF;
END $$;

-- events(user_id), event_attendees(user_id)
DROP POLICY IF EXISTS "ev_admin_all" ON public.events;
CREATE POLICY "ev_admin_all" ON public.events
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());
DROP POLICY IF EXISTS "ev_read_all_auth" ON public.events;
CREATE POLICY "ev_read_all_auth" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());
DROP POLICY IF EXISTS "ev_owner_insert" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ev_owner_insert" ON public.events FOR INSERT WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ev_owner_insert" ON public.events FOR INSERT WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ev_owner_insert" ON public.events FOR INSERT WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "ev_owner_insert" ON public.events FOR INSERT WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "ev_owner_update" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ev_owner_update" ON public.events FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ev_owner_update" ON public.events FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ev_owner_update" ON public.events FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "ev_owner_update" ON public.events FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "ev_owner_delete" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ev_owner_delete" ON public.events FOR DELETE USING (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ev_owner_delete" ON public.events FOR DELETE USING (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='events' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ev_owner_delete" ON public.events FOR DELETE USING (created_by = auth.uid());
  ELSE
    CREATE POLICY "ev_owner_delete" ON public.events FOR DELETE USING (app.is_admin() OR app.is_service());
  END IF;
END $$;

DROP POLICY IF EXISTS "eva_admin_all" ON public.event_attendees;
CREATE POLICY "eva_admin_all" ON public.event_attendees
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());
DROP POLICY IF EXISTS "eva_owner_insert" ON public.event_attendees;
CREATE POLICY "eva_owner_insert" ON public.event_attendees
  FOR INSERT WITH CHECK (app.is_owner(user_id));
DROP POLICY IF EXISTS "eva_owner_delete" ON public.event_attendees;
CREATE POLICY "eva_owner_delete" ON public.event_attendees
  FOR DELETE USING (app.is_owner(user_id));
DROP POLICY IF EXISTS "eva_read_self_or_admin" ON public.event_attendees;
CREATE POLICY "eva_read_self_or_admin" ON public.event_attendees
  FOR SELECT USING (app.is_owner(user_id) OR app.is_admin() OR app.is_service());

-- 5.2 Sensitive: profiles (self), garages, repair_bids, wallets, wallet_transactions, notifications, audit_log

-- profiles: user sees self; admin sees all
DROP POLICY IF EXISTS "pr_admin_all" ON public.profiles;
CREATE POLICY "pr_admin_all" ON public.profiles
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

DROP POLICY IF EXISTS "pr_read_self" ON public.profiles;
CREATE POLICY "pr_read_self" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "pr_update_self" ON public.profiles;
CREATE POLICY "pr_update_self" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- garages(user_id)
DROP POLICY IF EXISTS "ga_admin_all" ON public.garages;
CREATE POLICY "ga_admin_all" ON public.garages
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());
DROP POLICY IF EXISTS "ga_read_auth" ON public.garages;
CREATE POLICY "ga_read_auth" ON public.garages
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());
DROP POLICY IF EXISTS "ga_owner_write" ON public.garages;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ga_owner_write" ON public.garages FOR INSERT WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ga_owner_write" ON public.garages FOR INSERT WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ga_owner_write" ON public.garages FOR INSERT WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "ga_owner_write" ON public.garages FOR INSERT WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "ga_owner_update" ON public.garages;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ga_owner_update" ON public.garages FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ga_owner_update" ON public.garages FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ga_owner_update" ON public.garages FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "ga_owner_update" ON public.garages FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "ga_owner_delete" ON public.garages;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='user_id'
  ) THEN
    CREATE POLICY "ga_owner_delete" ON public.garages FOR DELETE USING (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "ga_owner_delete" ON public.garages FOR DELETE USING (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garages' AND column_name='created_by'
  ) THEN
    CREATE POLICY "ga_owner_delete" ON public.garages FOR DELETE USING (created_by = auth.uid());
  ELSE
    CREATE POLICY "ga_owner_delete" ON public.garages FOR DELETE USING (app.is_admin() OR app.is_service());
  END IF;
END $$;

-- garage_services(user_id)
DROP POLICY IF EXISTS "gsvc_admin_all" ON public.garage_services;
CREATE POLICY "gsvc_admin_all" ON public.garage_services
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());
DROP POLICY IF EXISTS "gsvc_read_auth" ON public.garage_services;
CREATE POLICY "gsvc_read_auth" ON public.garage_services
  FOR SELECT USING (auth.uid() IS NOT NULL OR app.is_service());
DROP POLICY IF EXISTS "gsvc_owner_write" ON public.garage_services;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='user_id'
  ) THEN
    CREATE POLICY "gsvc_owner_write" ON public.garage_services FOR INSERT WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "gsvc_owner_write" ON public.garage_services FOR INSERT WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='created_by'
  ) THEN
    CREATE POLICY "gsvc_owner_write" ON public.garage_services FOR INSERT WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "gsvc_owner_write" ON public.garage_services FOR INSERT WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "gsvc_owner_update" ON public.garage_services;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='user_id'
  ) THEN
    CREATE POLICY "gsvc_owner_update" ON public.garage_services FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "gsvc_owner_update" ON public.garage_services FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='created_by'
  ) THEN
    CREATE POLICY "gsvc_owner_update" ON public.garage_services FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  ELSE
    CREATE POLICY "gsvc_owner_update" ON public.garage_services FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "gsvc_owner_delete" ON public.garage_services;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='user_id'
  ) THEN
    CREATE POLICY "gsvc_owner_delete" ON public.garage_services FOR DELETE USING (app.is_owner(user_id));
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='owner_id'
  ) THEN
    CREATE POLICY "gsvc_owner_delete" ON public.garage_services FOR DELETE USING (owner_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='garage_services' AND column_name='created_by'
  ) THEN
    CREATE POLICY "gsvc_owner_delete" ON public.garage_services FOR DELETE USING (created_by = auth.uid());
  ELSE
    CREATE POLICY "gsvc_owner_delete" ON public.garage_services FOR DELETE USING (app.is_admin() OR app.is_service());
  END IF;
END $$;

-- repair_bids(user_id) — users see own bids; listing owner may read bids to their listing; admin sees all
DROP POLICY IF EXISTS "rb_admin_all" ON public.repair_bids;
CREATE POLICY "rb_admin_all" ON public.repair_bids
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

-- Reader: bidder or listing owner
DROP POLICY IF EXISTS "rb_read_bidder_or_listing_owner" ON public.repair_bids;
DO $$
DECLARE
  v_has_listings boolean;
  v_owner_col text;
  v_has_listing_id boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='listings'
  ) INTO v_has_listings;

  IF v_has_listings THEN
    -- Determine owner column on listings
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listings' AND column_name='user_id') THEN
      v_owner_col := 'user_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listings' AND column_name='seller_id') THEN
      v_owner_col := 'seller_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listings' AND column_name='owner_id') THEN
      v_owner_col := 'owner_id';
    ELSE
      v_owner_col := NULL;
    END IF;

    -- Check repair_bids has listing_id to join
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='repair_bids' AND column_name='listing_id'
    ) INTO v_has_listing_id;

    IF v_owner_col IS NOT NULL AND v_has_listing_id THEN
      EXECUTE format($p$
        CREATE POLICY "rb_read_bidder_or_listing_owner" ON public.repair_bids
          FOR SELECT USING (
            app.is_owner(user_id)
            OR EXISTS (
              SELECT 1 FROM public.listings l
              WHERE l.id = repair_bids.listing_id
                AND l.%I = auth.uid()
            )
            OR app.is_service()
          )
      $p$, v_owner_col);
    ELSE
      -- Fallback: bidder (owner) or service/admin
      CREATE POLICY "rb_read_bidder_or_listing_owner" ON public.repair_bids
        FOR SELECT USING (
          app.is_owner(user_id) OR app.is_admin() OR app.is_service()
        );
    END IF;
  ELSE
    -- No listings table; fallback to bidder or service/admin
    CREATE POLICY "rb_read_bidder_or_listing_owner" ON public.repair_bids
      FOR SELECT USING (
        app.is_owner(user_id) OR app.is_admin() OR app.is_service()
      );
  END IF;
END $$;

DROP POLICY IF EXISTS "rb_owner_insert" ON public.repair_bids;
CREATE POLICY "rb_owner_insert" ON public.repair_bids
  FOR INSERT WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "rb_owner_update" ON public.repair_bids;
CREATE POLICY "rb_owner_update" ON public.repair_bids
  FOR UPDATE USING (app.is_owner(user_id)) WITH CHECK (app.is_owner(user_id));

DROP POLICY IF EXISTS "rb_owner_delete" ON public.repair_bids;
CREATE POLICY "rb_owner_delete" ON public.repair_bids
  FOR DELETE USING (app.is_owner(user_id));

-- wallets(owner) and wallet_transactions(wallet_id) (guarded)
DO $$
DECLARE v_owner_col text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='wallets'
  ) THEN
    -- Determine owner column on wallets
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallets' AND column_name='owner_id') THEN
      v_owner_col := 'owner_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallets' AND column_name='user_id') THEN
      v_owner_col := 'user_id';
    ELSE
      v_owner_col := NULL;
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS "wa_admin_all" ON public.wallets';
    EXECUTE 'CREATE POLICY "wa_admin_all" ON public.wallets FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())';

    IF v_owner_col IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "wa_read_owner" ON public.wallets');
      EXECUTE format('CREATE POLICY "wa_read_owner" ON public.wallets FOR SELECT USING (%I = auth.uid())', v_owner_col);
      EXECUTE format('DROP POLICY IF EXISTS "wa_update_owner" ON public.wallets');
      EXECUTE format('CREATE POLICY "wa_update_owner" ON public.wallets FOR UPDATE USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())', v_owner_col, v_owner_col);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='wallet_transactions'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "wtx_admin_all" ON public.wallet_transactions';
    EXECUTE 'CREATE POLICY "wtx_admin_all" ON public.wallet_transactions FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallet_transactions' AND column_name='wallet_id'
    ) AND v_owner_col IS NOT NULL THEN
      EXECUTE format($p$
        DROP POLICY IF EXISTS "wtx_read_owner" ON public.wallet_transactions;
        CREATE POLICY "wtx_read_owner" ON public.wallet_transactions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.wallets w
              WHERE w.id = wallet_transactions.wallet_id
                AND w.%I = auth.uid()
            ) OR app.is_service()
          )
      $p$, v_owner_col);
    END IF;
  END IF;
END $$;

-- notifications(recipient_id)
DROP POLICY IF EXISTS "nt_admin_all" ON public.notifications;
CREATE POLICY "nt_admin_all" ON public.notifications
  FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());
DROP POLICY IF EXISTS "nt_read_recipient" ON public.notifications;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='recipient_id'
  ) THEN
    CREATE POLICY "nt_read_recipient" ON public.notifications FOR SELECT USING (recipient_id = auth.uid() OR app.is_service());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='user_id'
  ) THEN
    CREATE POLICY "nt_read_recipient" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR app.is_service());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='created_for'
  ) THEN
    CREATE POLICY "nt_read_recipient" ON public.notifications FOR SELECT USING (created_for = auth.uid() OR app.is_service());
  ELSE
    CREATE POLICY "nt_read_recipient" ON public.notifications FOR SELECT USING (app.is_admin() OR app.is_service());
  END IF;
END $$;
DROP POLICY IF EXISTS "nt_update_recipient" ON public.notifications;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='recipient_id'
  ) THEN
    CREATE POLICY "nt_update_recipient" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='user_id'
  ) THEN
    CREATE POLICY "nt_update_recipient" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='created_for'
  ) THEN
    CREATE POLICY "nt_update_recipient" ON public.notifications FOR UPDATE USING (created_for = auth.uid()) WITH CHECK (created_for = auth.uid());
  ELSE
    CREATE POLICY "nt_update_recipient" ON public.notifications FOR UPDATE USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service());
  END IF;
END $$;

-- audit_log: admin/service only (guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_log'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "al_admin_service_read" ON public.audit_log';
    EXECUTE 'CREATE POLICY "al_admin_service_read" ON public.audit_log FOR SELECT USING (app.is_admin() OR app.is_service())';
    EXECUTE 'DROP POLICY IF EXISTS "al_admin_service_write" ON public.audit_log';
    EXECUTE 'CREATE POLICY "al_admin_service_write" ON public.audit_log FOR ALL USING (app.is_admin() OR app.is_service()) WITH CHECK (app.is_admin() OR app.is_service())';
  END IF;
END $$;

-- 6) Storage policies (storage.objects)
-- Buckets expected (update names if envs differ):
-- community-media, offers-media, marketplace-media, events-media, garagehub-media,
-- bidrepair-media, import-media, profile-images, system-settings

-- Helper predicates for storage
CREATE OR REPLACE FUNCTION app.storage_is_owner(u uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.uid() IS NOT NULL AND u = auth.uid() $$;

-- Admin shortcut policy for all objects
DROP POLICY IF EXISTS "so_admin_all" ON storage.objects;
CREATE POLICY "so_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (app.is_admin())
  WITH CHECK (app.is_admin());

-- Public-ish read for selected buckets by authenticated users
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY[
    'community-media','offers-media','marketplace-media','events-media','garagehub-media','bidrepair-media'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b||'_read_all_auth');
    EXECUTE format($p$
      CREATE POLICY %I ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = %L)
    $p$, b||'_read_all_auth', b);
  END LOOP;
END$$;

-- Profile & system buckets: owner or admin
-- Assumes metadata JSON has uploader_id for ownership; else store path convention "user/{uid}/..."
-- Read
DROP POLICY IF EXISTS "profile_read_self_admin" ON storage.objects;
CREATE POLICY "profile_read_self_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('profile-images','system-settings')
    AND (
      (COALESCE((metadata->>'uploader_id')::uuid, NULL) = auth.uid())
      OR app.is_admin() OR app.is_service()
    )
  );
-- Write
DROP POLICY IF EXISTS "profile_write_self_admin" ON storage.objects;
CREATE POLICY "profile_write_self_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images','system-settings')
    AND (
      (COALESCE((metadata->>'uploader_id')::uuid, NULL) = auth.uid())
      OR app.is_admin() OR app.is_service()
    )
  );
DROP POLICY IF EXISTS "profile_update_self_admin" ON storage.objects;
CREATE POLICY "profile_update_self_admin" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('profile-images','system-settings')
    AND (
      (COALESCE((metadata->>'uploader_id')::uuid, NULL) = auth.uid())
      OR app.is_admin() OR app.is_service()
    )
  )
  WITH CHECK (
    bucket_id IN ('profile-images','system-settings')
    AND (
      (COALESCE((metadata->>'uploader_id')::uuid, NULL) = auth.uid())
      OR app.is_admin() OR app.is_service()
    )
  );
DROP POLICY IF EXISTS "profile_delete_self_admin" ON storage.objects;
CREATE POLICY "profile_delete_self_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('profile-images','system-settings')
    AND (
      (COALESCE((metadata->>'uploader_id')::uuid, NULL) = auth.uid())
      OR app.is_admin() OR app.is_service()
    )
  );

-- 7) Grants — function EXECUTE to authenticated; admin checks live inside
GRANT EXECUTE ON FUNCTION
  app.admin_set_role(uuid, public.user_role),
  app.admin_upsert_listing_state(uuid, text, text),
  app.admin_delete_row(regclass, uuid),
  public.toggle_post_like(uuid),
  public.toggle_comment_like(uuid),
  app.current_uid(),
  app.is_admin(),
  app.is_service(),
  app.storage_is_owner(uuid)
TO authenticated;

-- 8) Optional: verify helper SELECTs (safe to run manually)
-- SELECT app.is_admin(), app.is_service(), app.current_uid();

-- ====================================================================
-- End of script
-- ====================================================================

