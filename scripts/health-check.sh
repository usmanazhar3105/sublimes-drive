#!/bin/bash
#============================================================================
# HEALTH CHECK SCRIPT - Sublimes Drive
# Verifies database, Edge Functions, and storage buckets
#============================================================================

set -e

echo "🏥 SUBLIMES DRIVE - HEALTH CHECK"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment
source .env.local 2>/dev/null || echo "⚠️  No .env.local found"

# Check 1: Database Connection
echo "1️⃣  Checking Database Connection..."
npx supabase db remote commit 2>&1 | grep -q "Finished" && \
  echo -e "${GREEN}✅ Database connected${NC}" || \
  echo -e "${RED}❌ Database connection failed${NC}"

# Check 2: Critical Tables
echo ""
echo "2️⃣  Checking Critical Tables..."
cat > /tmp/health_tables.sql << 'EOF'
SELECT 
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ Core tables present'
    ELSE '⚠️ Missing tables: ' || (20 - COUNT(*))::TEXT
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'posts', 'comments', 'marketplace_listings', 
    'bid_requests', 'bid_replies', 'events', 'offers',
    'ai_agents_freya', 'freya_settings', 'freya_budget',
    'billing_customers', 'orders', 'boosts',
    'i18n_locales', 'i18n_keys', 'i18n_key_translations',
    'legal_documents', 'brand_assets', 'coupons'
  );
EOF
echo "  Run this query in SQL Editor: /tmp/health_tables.sql"

# Check 3: Edge Functions
echo ""
echo "3️⃣  Checking Edge Functions..."
FUNCTIONS=(
  "freya-dispatch"
  "freya-generate"
  "stripe-webhook"
  "stripe-create-checkout"
  "i18n-auto-translate"
)

for func in "${FUNCTIONS[@]}"; do
  if [ -d "supabase/functions/$func" ]; then
    echo -e "  ${GREEN}✅${NC} $func"
  else
    echo -e "  ${RED}❌${NC} $func (missing)"
  fi
done

# Check 4: Storage Buckets
echo ""
echo "4️⃣  Checking Storage Buckets..."
BUCKET_ENV_VARS=(
  "VITE_BUCKET_COMMUNITY"
  "VITE_BUCKET_OFFERS"
  "VITE_BUCKET_MARKETPLACE"
  "VITE_BUCKET_EVENTS"
  "VITE_BUCKET_GARAGE"
  "VITE_BUCKET_BIDREPAIR"
  "VITE_BUCKET_IMPORT"
  "VITE_BUCKET_PROFILE"
  "VITE_BUCKET_SYSTEM"
)

for var in "${BUCKET_ENV_VARS[@]}"; do
  value="${!var}"
  if [ -n "$value" ]; then
    echo -e "  ${GREEN}✅${NC} $var → $value"
  else
    echo -e "  ${YELLOW}⚠️${NC} $var not set (check .env)"
  fi
done

echo "  ℹ️  Validate bucket presence in Supabase Dashboard → Storage"

# Check 5: Environment Variables
echo ""
echo "5️⃣  Checking Environment Variables..."
REQUIRED_VARS=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "ADMIN_API_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -n "${!var}" ]; then
    echo -e "  ${GREEN}✅${NC} $var"
  else
    echo -e "  ${RED}❌${NC} $var (missing)"
  fi
done

# Check 6: Recent Migrations
echo ""
echo "6️⃣  Checking Recent Migrations..."
MIGRATION_COUNT=$(find supabase/migrations -name "*.sql" -mtime -1 | wc -l)
echo "  Migrations from last 24h: $MIGRATION_COUNT"
if [ $MIGRATION_COUNT -gt 0 ]; then
  echo -e "  ${GREEN}✅${NC} Active development"
else
  echo -e "  ${YELLOW}⚠️${NC}  No recent migrations"
fi

# Summary
echo ""
echo "================================"
echo "✅ Health check complete!"
echo ""
echo "Next Steps:"
echo "  1. Run SQL query: /tmp/health_tables.sql"
echo "  2. Verify buckets in Supabase Dashboard"
echo "  3. Check Edge Function logs"
echo ""

