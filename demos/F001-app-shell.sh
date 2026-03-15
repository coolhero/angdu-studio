#!/bin/bash
# Demo: F001 App Shell — Angdu Studio
#
# Launches the Electron app with default configuration.
# The user can interact with:
#   - Frameless window with custom title bar (drag, minimize, maximize, close)
#   - System tray icon (show/hide, quit)
#   - Theme switching (light/dark via DevTools console)
#   - Window state persistence (resize, restart, verify)
#
# Usage:
#   ./demos/F001-app-shell.sh         # Interactive demo
#   ./demos/F001-app-shell.sh --ci    # CI health check (launch → verify → exit)
#
# Demo Components:
#   - Category: Promotable | Fate: Extended by F002-navigation (adds tab routing)
#     src/renderer/src/App.tsx (root shell)
#     src/renderer/src/components/TitleBar.tsx (custom title bar)

set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--ci" ]; then
  echo "🔍 CI mode: quick health check"
  timeout 15 npx electron . --no-sandbox &
  PID=$!
  sleep 5
  if kill -0 "$PID" 2>/dev/null; then
    echo "✅ App launched successfully (PID: $PID)"
    kill "$PID" 2>/dev/null || true
    exit 0
  else
    echo "❌ App failed to launch"
    exit 1
  fi
fi

echo "🚀 Starting Angdu Studio (F001 App Shell Demo)"
echo ""
echo "Try it:"
echo "  • Drag the title bar to move the window"
echo "  • Click minimize/maximize/close buttons (Windows/Linux)"
echo "  • Resize the window, then restart to verify state persistence"
echo "  • Check the system tray icon — click to toggle window"
echo "  • Open DevTools (Ctrl+Shift+I) and run:"
echo "    window.api.invoke['theme:set']('dark')"
echo "    window.api.invoke['theme:set']('light')"
echo ""
echo "Press Ctrl+C to stop."
echo ""

npx electron . --no-sandbox
