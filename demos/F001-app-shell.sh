#!/usr/bin/env bash
set -euo pipefail

# F001 App Shell Demo
# Interactive: launches the Electron app in dev mode
# CI mode (--ci): quick health check and exit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

if [[ "${1:-}" == "--ci" ]]; then
  echo "=== F001 App Shell — CI Health Check ==="

  # Build first
  echo "[1/3] Building..."
  npx electron-vite build 2>&1 | tail -5

  # Launch Electron directly from built output
  echo "[2/3] Launching app (5s timeout)..."
  npx electron out/main/index.js &
  APP_PID=$!

  sleep 5

  # Check if process is still running (didn't crash)
  if kill -0 "$APP_PID" 2>/dev/null; then
    echo "[3/3] ✅ App launched successfully (PID $APP_PID alive after 5s)"
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
    echo "=== CI check passed ==="
    exit 0
  else
    echo "[3/3] ❌ App crashed or exited unexpectedly"
    exit 1
  fi
else
  echo "=== F001 App Shell — Interactive Demo ==="
  echo ""
  echo "Starting Angdu Studio in development mode..."
  echo ""
  echo "Try these features:"
  echo "  • Window management — drag, resize, minimize, maximize"
  echo "  • System tray — right-click tray icon for context menu"
  echo "  • Theme toggle — will sync across all windows"
  echo "  • Mini window — toggled via tray or global shortcut"
  echo "  • Single instance — try launching a second instance"
  echo ""
  echo "Press Ctrl+C to stop."
  echo ""

  exec pnpm run dev
fi
