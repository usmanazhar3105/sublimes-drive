-- Backfill missing profiles for existing auth.users and add auto-create trigger
-- NOTE: This script is idempotent and safe to re-run.

-- 1) Create columns if they don't exist (defensive)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'browser',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS xp_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- If your schema uses verification_status or is_banned, ensure they exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- 2) Backfill minimal profile rows for any auth user without a profile
INSERT INTO public.profiles (id, email, role, display_name, avatar_url, xp_points, created_at)
SELECT
  u.id,
  u.email,
  'browser'::text,
  split_part(u.email, '@', 1) AS display_name,
  NULL::text AS avatar_url,
  0::int AS xp_points,
  COALESCE(u.created_at, now()) AS created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3) Auto-create a profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name, avatar_url, xp_points, created_at)
  VALUES (NEW.id, NEW.email, 'browser', split_part(NEW.email, '@', 1), NULL, 0, COALESCE(NEW.created_at, now()))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) Verification — list any remaining users without a profile (should be zero rows)
-- SELECT u.id, u.email
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON p.id = u.id
-- WHERE p.id IS NULL
-- ORDER BY u.created_at DESC;
