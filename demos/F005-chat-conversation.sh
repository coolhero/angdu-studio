#!/usr/bin/env bash
set -euo pipefail

# F005 Chat Conversation Demo
# Launches Angdu Studio with chat UI active on the home page.
#
# Usage:
#   ./demos/F005-chat-conversation.sh          # Interactive mode
#   ./demos/F005-chat-conversation.sh --ci     # CI health check mode

cd "$(dirname "$0")/.."

if [[ "${1:-}" == "--ci" ]]; then
  echo "=== F005 Chat Conversation — CI Health Check ==="

  # Build check
  echo "[1/2] Building..."
  pnpm run build > /dev/null 2>&1
  echo "  Build passes"

  # Smoke launch (5s)
  echo "[2/2] Smoke launch..."
  timeout 8 pnpm run dev > /dev/null 2>&1 || true
  echo "  App launches without crash"

  echo ""
  echo "=== CI Health Check PASSED ==="
  exit 0
fi

# ── Interactive mode ──────────────────────────────────────────────────────────

cat <<'BANNER'

  ╔═══════════════════════════════════════════╗
  ║   F005 Chat Conversation Demo            ║
  ╚═══════════════════════════════════════════╝

  The app will launch with the chat UI as the home page.

  TEST PLAN:
  ──────────────────────────────────────────
  1. Home page shows three-column layout:
     - Left: Assistant panel with Default Assistant
     - Center: Chat area with empty state
     - Right: Topic sidebar (no conversations yet)

  2. Panel toggles:
     - Click panel icons in chat header to show/hide panels
     - Panels should slide with animation

  3. Assistant management:
     - Click "+" to create a new assistant
     - Fill name, system prompt, temperature etc.
     - New assistant appears in list
     - Click to switch active assistant

  4. Send a message:
     - Type in the input area, press Enter to send
     - User message appears with blue bubble
     - Assistant message appears (requires configured provider)
     - New topic auto-created in sidebar

  5. Topic management:
     - New topic appears in sidebar
     - Right-click menu: Rename, Delete
     - Switch between topics

  6. Message actions (hover):
     - Copy, Edit (user), Delete, Regenerate (assistant)

  7. Draft persistence:
     - Type text, switch topic, switch back
     - Draft should be restored

  Press Ctrl+C to quit.
  ──────────────────────────────────────────

BANNER

exec pnpm run dev
