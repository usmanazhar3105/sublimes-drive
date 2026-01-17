#!/usr/bin/env bash
# Freya AI Health Check Script
# Verifies all Freya components are deployed and operational

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 FREYA AI HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
  fi
}

echo "📦 DATABASE TABLES"
echo "==================="

# Check Freya Enhanced tables
for table in freya_settings freya_secrets freya_budget freya_post_state freya_runs freya_image_assets; do
  npx supabase db query "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='$table'" >/dev/null 2>&1
  check "Table: $table"
done

# Check Freya Basic tables (if present)
for table in ai_agents_freya ai_agent_settings_freya ai_post_responses_freya ai_comment_threads_freya ai_activity_log_freya ai_rate_limits_freya; do
  npx supabase db query "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='$table'" >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found legacy table: $table (can be dropped if unused)${NC}"
  fi
done

echo ""
echo "🔧 DATABASE FUNCTIONS"
echo "===================="

for func in fn_freya_enqueue_auto_comment fn_freya_on_reply; do
  npx supabase db query "SELECT 1 FROM information_schema.routines WHERE routine_schema='public' AND routine_name='$func'" >/dev/null 2>&1
  check "Function: $func"
done

echo ""
echo "⚡ EDGE FUNCTIONS"
echo "================="

# Check deployed functions
for func in freya-dispatch freya-generate freya-image-annotator freya-admin-rpc; do
  npx supabase functions list 2>/dev/null | grep -q "$func"
  check "Function deployed: $func"
done

echo ""
echo "💾 STORAGE BUCKETS"
echo "================="

npx supabase storage list-buckets 2>/dev/null | grep -q "freya-attachments"
check "Bucket: freya-attachments"

echo ""
echo "🔐 RLS POLICIES"
echo "==============="

for table in freya_settings freya_budget freya_runs; do
  COUNT=$(npx supabase db query "SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='$table'" 2>/dev/null | tail -1 || echo "0")
  if [ "$COUNT" -gt "0" ]; then
    check "RLS policies on $table ($COUNT policies)"
  else
    echo -e "${RED}❌ No RLS policies on $table${NC}"
    ((FAIL++))
  fi
done

echo ""
echo "📊 DATA SEEDING"
echo "==============="

# Check if settings exist
SETTINGS_COUNT=$(npx supabase db query "SELECT COUNT(*) FROM freya_settings" 2>/dev/null | tail -1 || echo "0")
if [ "$SETTINGS_COUNT" -gt "0" ]; then
  check "Default settings seeded ($SETTINGS_COUNT rows)"
else
  echo -e "${YELLOW}⚠️  No settings found - run seed.sql${NC}"
fi

# Check if budget exists for today
BUDGET_COUNT=$(npx supabase db query "SELECT COUNT(*) FROM freya_budget WHERE day = CURRENT_DATE" 2>/dev/null | tail -1 || echo "0")
if [ "$BUDGET_COUNT" -gt "0" ]; then
  check "Budget initialized for today"
else
  echo -e "${YELLOW}⚠️  No budget for today - will be created on first run${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 HEALTH SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
  echo "Freya AI is fully operational."
  exit 0
else
  echo -e "${RED}⚠️  SOME CHECKS FAILED${NC}"
  echo "Please review errors above."
  exit 1
fi

