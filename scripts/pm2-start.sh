#!/usr/bin/env bash
# Build + start (or restart) WillohBets under PM2 on port 5173.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app"
cd "$ROOT"

mkdir -p "$ROOT/logs"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not found — installing globally..."
  npm install -g pm2
fi

# Free 5173 if a stray process (not pm2 willohbets) holds it
if command -v ss >/dev/null 2>&1; then
  PIDS=$(ss -ltnp 2>/dev/null | grep ':5173' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u || true)
  for p in $PIDS; do
    if ! pm2 pid willohbets 2>/dev/null | grep -qx "$p"; then
      echo "Killing process $p on port 5173..."
      kill "$p" 2>/dev/null || true
    fi
  done
  sleep 0.5
fi

if [ ! -d "$APP/node_modules" ]; then
  echo "Installing app dependencies..."
  (cd "$APP" && npm install)
fi

echo "Building production bundle..."
(cd "$APP" && npm run build)

# Delete + recreate so ecosystem config changes always apply
if pm2 describe willohbets >/dev/null 2>&1; then
  echo "Deleting old willohbets process (config refresh)..."
  pm2 delete willohbets || true
fi

echo "Starting willohbets (vite preview on :5173)..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 status willohbets

echo ""
echo "UI:   http://0.0.0.0:5173/"
echo "Logs: pm2 logs willohbets"
echo ""
echo "Note: after code changes, re-run:  npm run pm2:start   (rebuilds + restarts)"
