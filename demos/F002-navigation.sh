#!/bin/bash
# Demo: F002 Navigation — Angdu Studio
#
# Launches the Electron app with full navigation system.
# The user can interact with:
#   - Left sidebar with icons (Home, Settings, Chat, Translate, Knowledge, Files, Notes)
#   - Click sidebar icons to navigate between pages
#   - Top tab bar showing open tabs (switch navbarPosition to 'top' for tabs)
#   - Tab close (X button, middle-click)
#   - Tab context menu (right-click → Close, Close Others, Close All)
#   - Tab drag-to-reorder (drag tabs left/right)
#   - Window drag from navbar/sidebar empty space
#   - Tab persistence across restarts
#
# Usage:
#   ./demos/F002-navigation.sh         # Interactive demo
#   ./demos/F002-navigation.sh --ci    # CI health check (launch → verify → exit)

set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--ci" ]; then
  echo "🔍 CI mode: quick health check"

  # Build first
  pnpm run build 2>&1 | tail -3

  # Launch app
  npx electron . --no-sandbox &
  PID=$!
  sleep 8

  if kill -0 "$PID" 2>/dev/null; then
    echo "✅ App launched successfully (PID: $PID)"
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
    echo "✅ F002-navigation CI check passed"
    exit 0
  else
    echo "❌ App failed to launch"
    exit 1
  fi
fi

# Interactive mode
echo "🚀 Starting Angdu Studio with navigation..."
echo ""
echo "Try these interactions:"
echo "  1. Click sidebar icons → pages open in tabs"
echo "  2. Right-click a tab → context menu (Close, Close Others, Close All)"
echo "  3. Middle-click a tab → quick close"
echo "  4. Drag a tab → reorder tabs"
echo "  5. Drag empty navbar area → move the window"
echo "  6. Home tab cannot be closed (permanent)"
echo "  7. Quit and relaunch → tabs are restored"
echo ""
echo "Press Ctrl+C to stop."
echo ""

exec pnpm run dev
