#!/usr/bin/env bash
# ─── F003-chat-core Demo ───
# Feature: Chat Core — Assistants, Topics, Messages, Message Blocks
#
# Demo Components:
#   - ChatDatabase (Dexie): Category=Promotable, Fate=Extend in F005-chat-ui
#   - useAssistantsStore: Category=Promotable, Fate=Extend in F005-chat-ui
#   - useMessageStore: Category=Promotable, Fate=Extend in F005-chat-ui
#   - useMessageBlockStore: Category=Promotable, Fate=Extend in F005-chat-ui
#   - ConversationService: Category=Promotable, Fate=Extend in F005-chat-ui
#   - MessagesService: Category=Promotable, Fate=Extend in F005-chat-ui
#
# Usage:
#   ./demos/F003-chat-core.sh         # Interactive — starts dev server
#   ./demos/F003-chat-core.sh --ci    # CI mode — quick health check

set -euo pipefail
cd "$(dirname "$0")/.."

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

echo "╔══════════════════════════════════════════════════╗"
echo "║  F003-chat-core: Chat Core Demo                  ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Assistants, Topics, Messages, Message Blocks    ║"
echo "║  3 Zustand stores, 6 services, Dexie persistence ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Type check ──
echo "→ Type checking..."
npx tsc --noEmit
echo "  ✅ Types OK"

# ── Step 2: Run tests ──
echo "→ Running F003 tests..."
npx vitest run tests/unit/stores/useAssistantsStore.test.ts \
  tests/unit/stores/useMessageBlockStore.test.ts \
  tests/unit/services/ConversationService.test.ts \
  --reporter=verbose 2>&1 | tail -20
echo "  ✅ Tests pass"

# ── Step 3: Build check ──
echo "→ Build check..."
npx electron-vite build 2>&1 | tail -5
echo "  ✅ Build OK"

if $CI_MODE; then
  echo ""
  echo "✅ CI health check passed"
  exit 0
fi

# ── Interactive mode ──
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Starting Angdu Studio in dev mode...            ║"
echo "║                                                  ║"
echo "║  Try it:                                         ║"
echo "║  • App will open with a default assistant         ║"
echo "║  • F003 data layer is ready for F005-chat-ui     ║"
echo "║  • Check DevTools console for store state        ║"
echo "║                                                  ║"
echo "║  Press Ctrl+C to stop                            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

npx electron-vite dev
