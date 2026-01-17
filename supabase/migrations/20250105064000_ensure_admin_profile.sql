-- Ensure admin profile exists for testing
INSERT INTO public.profiles (id, email, full_name, username, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@sublimesdrive.com' LIMIT 1),
  'admin@sublimesdrive.com',
  'Admin User',
  'admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET email = 'admin@sublimesdrive.com', 
    full_name = 'Admin User',
    role = 'admin';

-- Verify
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@sublimesdrive.com';
  
  IF v_admin_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id) THEN
      RAISE NOTICE '✅ Admin profile exists for %', v_admin_id;
    ELSE
      RAISE NOTICE '⚠️ Admin user exists in auth but no profile';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Admin user not found in auth.users';
  END IF;
END $$;
