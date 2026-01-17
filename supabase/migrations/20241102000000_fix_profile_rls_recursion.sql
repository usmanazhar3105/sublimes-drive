/**
 * Migration: Fix Profile RLS Infinite Recursion
 * 
 * Fixes:
 * - Infinite recursion in RLS policies
 * - Profile not loading
 * - Admin role not working
 * 
 * Date: 2025-11-02
 */

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES (Clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "public_profiles_viewable" ON profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON profiles;

-- ============================================================================
-- 2. TEMPORARILY DISABLE RLS
-- ============================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RE-ENABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================================

-- Allow users to read their own profile (NO SUBQUERY - prevents recursion)
CREATE POLICY "users_read_own_profile" ON profiles
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (NO SUBQUERY)
CREATE POLICY "users_update_own_profile" ON profiles
FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "users_insert_own_profile" ON profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow public to view basic profile info (for displaying usernames, avatars, etc.)
CREATE POLICY "public_profiles_viewable" ON profiles
FOR SELECT 
USING (true);

-- ============================================================================
-- 5. UPDATE ADMIN USER ROLE
-- ============================================================================

-- Update admin user (change email to match your account)
UPDATE profiles 
SET 
  role = 'admin',
  display_name = COALESCE(display_name, 'Admin User'),
  updated_at = NOW()
WHERE email LIKE '%admin%' OR email LIKE '%sublimes%';

-- ============================================================================
-- 6. CREATE COMMENTS TABLE IF MISSING
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "anyone_can_read_comments" ON comments;
DROP POLICY IF EXISTS "users_can_create_comments" ON comments;
DROP POLICY IF EXISTS "users_can_update_own_comments" ON comments;
DROP POLICY IF EXISTS "users_can_delete_own_comments" ON comments;

-- Create RLS policies for comments
CREATE POLICY "anyone_can_read_comments" ON comments
FOR SELECT USING (true);

CREATE POLICY "users_can_create_comments" ON comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_comments" ON comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_comments" ON comments
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. CREATE ANALYTICS_EVENTS TABLE IF MISSING
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "users_insert_own_events" ON analytics_events;
DROP POLICY IF EXISTS "users_read_own_events" ON analytics_events;
DROP POLICY IF EXISTS "public_can_insert_events" ON analytics_events;

-- Create RLS policies
CREATE POLICY "users_insert_own_events" ON analytics_events
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_read_own_events" ON analytics_events
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "public_can_insert_events" ON analytics_events
FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

GRANT ALL ON comments TO authenticated;
GRANT SELECT ON comments TO anon;

GRANT ALL ON analytics_events TO authenticated;
GRANT INSERT ON analytics_events TO anon;

-- ============================================================================
-- 9. CREATE UPDATE TRIGGER FOR COMMENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at 
BEFORE UPDATE ON comments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Profile RLS policies fixed (no more infinite recursion)';
  RAISE NOTICE '✅ Comments table created with RLS';
  RAISE NOTICE '✅ Analytics events table created with RLS';
  RAISE NOTICE '✅ Admin users updated';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Admin users:';
END $$;

-- Show admin users
SELECT 
  '👤 ' || email || ' - Role: ' || role AS admin_user
FROM profiles 
WHERE role = 'admin';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
