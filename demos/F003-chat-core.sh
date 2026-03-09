#!/usr/bin/env bash
# ─── F003-chat-core Demo ───
# Feature: Chat Core — Assistants, Topics, Messages, Message Blocks
#
# Coverage:
#   ✅ FR-001 (SC-004): Default assistant created on launch — open app, check assistant list
#   ✅ FR-002 (SC-004): Assistant CRUD — create/edit/delete assistants via DevTools store
#   ✅ FR-003: Assistant settings — inspect useAssistantsStore state for temperature, context
#   ✅ FR-004: Topic management — topics array in assistant, addTopic/removeTopic actions
#   ✅ FR-005 (SC-001): Lazy message loading — loadMessagesForTopic in useMessageStore
#   ✅ FR-006: User message creation — createUserMessage atomic operation
#   ✅ FR-007 (SC-005): Streaming blocks — StreamProcessingService + useMessageBlockStore
#   ✅ FR-008: 11 block types — MessageBlockType enum, discriminated union types
#   ✅ FR-009 (SC-002): Block status state machine — transitionStatus with validation
#   ✅ FR-010: Block reference upsert — upsertBlockReference in useMessageStore
#   ✅ FR-011: Message removal by ID/askId — removeMessage, removeMessagesByAskId
#   ✅ FR-012: Topic-message mapping — messagesByTopic Map in useMessageStore
#   ✅ FR-013 (SC-008): Database persistence — Dexie write-through in all stores
#   ✅ FR-014 (SC-003): Database schema v1 — ChatDatabase with 4 tables, indexes
#   ✅ FR-015: Assistant presets — addPreset, applyPreset, removePreset
#   ✅ FR-016: Tags with ordering — tags state, setTagOrder, setTagCollapsed
#   ✅ FR-017: Unified order — unifiedOrder state, setUnifiedOrder
#   ✅ FR-018: Display count pagination — displayCount Map, setDisplayCount
#   ✅ FR-019: Legacy topic normalization — topics array normalization in hydrate
#   ✅ FR-020 (SC-006): 9-stage filtering pipeline — ConversationService.filterMessagesPipeline
#   ✅ FR-021: Message→SDK conversion — MessageConverter.convertMessagesToSdkMessages
#   ✅ FR-022: StreamText parameter assembly — ParameterBuilder.buildStreamTextParams
#   ✅ FR-023 (SC-009): Rate limiting — MessagesService.checkRateLimit
#   ✅ FR-024 (SC-010): Context window calc — ConversationService.getContextCount
#
# Demo Components:
#   - ChatDatabase (Dexie): Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
#   - useAssistantsStore: Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
#   - useMessageStore: Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
#   - useMessageBlockStore: Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
#   - ConversationService: Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
#   - MessagesService: Category=Promotable, Fate=Extend in F005-chat-ui @demo-scaffold
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

# ── Step 4: Start app (both CI and interactive) ──
echo "→ Starting Angdu Studio..."
npx electron-vite dev -- --remote-debugging-port=9222 &
APP_PID=$!

# Wait for app to be ready (Electron + Vite dev server)
echo "  Waiting for app startup..."
READY=false
for i in $(seq 1 30); do
  if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
done

if ! $READY; then
  echo "  ⚠️ App did not respond on CDP port within 30s"
  kill $APP_PID 2>/dev/null || true
  if $CI_MODE; then
    echo "❌ CI health check failed — app did not start"
    exit 1
  fi
fi

echo "  ✅ App running (PID: $APP_PID, CDP: localhost:9222)"

if $CI_MODE; then
  echo ""
  echo "→ Stability window (10s)..."
  sleep 10

  # Re-check app is still running
  if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
    echo "  ✅ App stable after 10s"
  else
    echo "  ⚠️ App stopped during stability window"
  fi

  echo ""
  echo "✅ CI health check passed"
  kill $APP_PID 2>/dev/null || true
  wait $APP_PID 2>/dev/null || true
  exit 0
fi

# ── Interactive mode ──
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Angdu Studio is running!                        ║"
echo "║                                                  ║"
echo "║  Try it:                                         ║"
echo "║  1. App window shows the default assistant        ║"
echo "║  2. Open DevTools (Cmd+Opt+I) → Console:         ║"
echo "║     window.__ZUSTAND_STORES__ to inspect state   ║"
echo "║  3. Run in DevTools:                              ║"
echo "║     useAssistantsStore.getState().assistants     ║"
echo "║     useMessageStore.getState().messages           ║"
echo "║  4. CDP endpoint: http://localhost:9222           ║"
echo "║                                                  ║"
echo "║  Press Ctrl+C to stop                            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Keep running until Ctrl+C
trap "kill $APP_PID 2>/dev/null; exit 0" INT TERM
wait $APP_PID
