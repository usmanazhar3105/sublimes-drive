#!/bin/bash
set -e

echo "🔧 Applying Communities Fix SQL..."
echo ""

# Apply the SQL
cat APPLY_COMMUNITIES_FIX.sql | supabase db execute

echo ""
echo "✅ SQL Applied!"
echo ""
echo "🔍 Verifying tables were created..."
echo ""

# Verify tables exist
supabase db execute <<SQL
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('post_likes', 'post_saves', 'post_shares', 'reports', 'comment_likes')
ORDER BY table_name;
SQL

echo ""
echo "🔍 Verifying RPC functions were created..."
echo ""

# Verify functions exist
supabase db execute <<SQL
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'fn_%'
ORDER BY routine_name;
SQL

echo ""
echo "✅ Verification Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Refresh your browser at http://localhost:3000"
echo "2. Test like/save/share buttons"
echo "3. Check console for errors (should be none)"
