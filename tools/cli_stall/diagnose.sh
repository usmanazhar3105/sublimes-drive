#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="logs/cli_stall_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"
echo "Logs: $LOG_DIR"

echo "== Versions ==" | tee "$LOG_DIR/00_versions.txt"
{ 
  date
  uname -a || true
  node -v || true
  npm -v || true
  python3 -V || true
  supabase --version
  psql --version || true
} | tee -a "$LOG_DIR/00_versions.txt"

echo "== Supabase link status ==" | tee "$LOG_DIR/01_link.txt"
{ 
  supabase status || true
  supabase projects list || true
  supabase link status || true
} | tee -a "$LOG_DIR/01_link.txt"

echo "== Dry-run plan (verbose) ==" | tee "$LOG_DIR/02_dryrun.txt"
set +e
supabase db push --debug --dry-run 2>&1 | tee "$LOG_DIR/02_dryrun.txt"
DRYRC=${PIPESTATUS[0]}
set -e
if [ "$DRYRC" -ne 0 ]; then
  echo "Dry-run had errors (see 02_dryrun.txt). Continuing to deeper diagnostics."
fi

echo "Diagnostics complete. Review logs in $LOG_DIR."
exit 0
