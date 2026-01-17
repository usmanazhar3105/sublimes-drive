#!/bin/bash
# Auto-monitor script - runs every 30s

while true; do
  echo "=== $(date) ==="
  echo "Migration files: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l)"
  echo "Push log (last 5 lines):"
  tail -5 /tmp/supabase_push.log 2>/dev/null || echo "No log yet"
  echo "---"
  sleep 30
done

