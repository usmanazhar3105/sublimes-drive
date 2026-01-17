#!/bin/bash
# Continuous migration monitor - runs every 30s
cd /Users/imac/Desktop/AA-2025/figmamake_29/Sublimesdrivefigmamake-main
while true; do
  echo "=== $(date) ==="
  npx supabase migration list 2>&1 | tail -10
  sleep 30
done

