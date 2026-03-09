#!/bin/bash
# F004-settings-data Demo Script
# Launches Angdu Studio to demonstrate settings, backup, files, and mini apps
#
# Coverage:
#   FR-027 ✅ Settings UI with 6 categorized tabs (General, Display, Data, Shortcuts, Quick Phrases, About)
#   FR-028 ✅ Backup to local directory, WebDAV, S3 (UI + handlers)
#   FR-029 ✅ Restore from backup with progress tracking
#   FR-030 ✅ File management UI with upload, filter, breadcrumbs
#   FR-031 ✅ Mini app embedding with CRUD and drag-to-reorder
#   FR-032 ✅ Keyboard shortcut configuration with conflict detection
#   FR-033 ✅ Quick phrase management (add/edit/delete)
#   FR-034 ✅ Settings persist immediately via electron-store
#   FR-035 ⬜ Data directory migration (UI scaffold, IPC ready)
#   FR-036 ✅ Send message shortcut selector (Enter/Shift/Ctrl/Meta+Enter)
#   FR-037 ✅ Language switch with immediate UI update (ko/en)
#   FR-038 ✅ Proxy mode configuration (system/custom/none)
#   FR-039 ✅ Launch on boot / launch to tray toggles
#   FR-040 ✅ WebDAV/S3 connection test buttons
#   FR-041 ⬜ File download from URL (UI scaffold, handler ready)
#   FR-042 ⬜ Image base64/binary conversion (handler ready)
#   FR-043 ⬜ Sidebar icon visibility/order (store ready)
#   FR-044 ✅ Display settings (font size, theme colors, message dividers, code font)
#   SC-013 ✅ Language change updates UI immediately
#   SC-014 ✅ Backup/restore UI with progress tracking
#   SC-015 ✅ WebDAV/S3 test connection buttons present
#   SC-016 ✅ File list with rename/delete actions
#   SC-017 ✅ Mini app grid with add/edit/delete/reorder
#   SC-018 ✅ Shortcut table with capture input and conflict detection
#   SC-019 ✅ Quick phrase add/insert flow
#   SC-020 ⬜ Data directory migration (UI disabled, coming soon)
#   SC-021 ✅ Font size slider and theme color picker update immediately
#   SC-022 ✅ Proxy mode selector present
#
# Bug Fixes Applied During Verify:
#   - IPC channel names converted from camelCase to kebab-case (28 channels)
#   - useBackup hook: onBackupProgress → onProgress (preload API mismatch)
#   - useBackup hook: added guard for window.api availability

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

CI_MODE=false
if [ "$1" = "--ci" ]; then
  CI_MODE=true
fi

echo "=== F004-settings-data Demo ==="
echo ""

# Setup
echo "Checking dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install --prefer-offline 2>/dev/null || true

echo "Running type check..."
npx tsc --noEmit

echo "Running tests..."
npx vitest run

echo "Building..."
pnpm run build

if [ "$CI_MODE" = true ]; then
  echo ""
  echo "Starting app for health check..."
  npx electron-vite dev -- --remote-debugging-port=9222 &
  APP_PID=$!

  # Wait for app to start
  sleep 10

  # Check CDP is responding
  echo "Checking CDP endpoint..."
  if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
    echo "  ✅ CDP endpoint active"
  else
    echo "  ⚠ CDP endpoint not responding (non-blocking)"
  fi

  # Stability window
  echo "Stability check (10s)..."
  sleep 10

  # Check if process is still alive
  if kill -0 $APP_PID 2>/dev/null; then
    echo "App running stable for 10 seconds"
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
    echo ""
    echo "✅ F004-settings-data health check passed"
    exit 0
  else
    echo "❌ App exited prematurely"
    exit 1
  fi
fi

# Interactive mode
echo ""
echo "Starting Angdu Studio with Settings & Data features..."
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  F004-settings-data Demo                        ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Try these features:                             ║"
echo "║                                                  ║"
echo "║  1. Click ⚙ Settings in the navbar               ║"
echo "║     → Browse General, Display, Data tabs         ║"
echo "║     → Change language (ko ↔ en)                  ║"
echo "║     → Adjust font size with slider               ║"
echo "║     → Pick a theme color                         ║"
echo "║                                                  ║"
echo "║  2. Click 📁 Files in the navbar                  ║"
echo "║     → View file browser with type filter         ║"
echo "║                                                  ║"
echo "║  3. Click 📱 Mini Apps in the navbar              ║"
echo "║     → Add a mini app (name + URL)                ║"
echo "║     → Drag to reorder                            ║"
echo "║                                                  ║"
echo "║  4. Settings → Shortcuts tab                     ║"
echo "║     → Click Edit on any shortcut                 ║"
echo "║     → Press a key combination                    ║"
echo "║                                                  ║"
echo "║  5. Settings → Quick Phrases tab                 ║"
echo "║     → Add a quick phrase                         ║"
echo "║                                                  ║"
echo "║  6. Settings → Data tab                          ║"
echo "║     → Local backup/restore buttons               ║"
echo "║     → Expand WebDAV / S3 sections                ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop."
echo ""

pnpm run dev
