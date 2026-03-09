#!/bin/bash
# F005-chat-ui Demo Script
# Launches Angdu Studio with full chat UI for interactive testing
#
# Coverage:
#   FR-001 ✅ Rich text input with send shortcut
#   FR-002 ✅ File attachment preview
#   FR-003 ✅ 18 input tools with registry pattern
#   FR-004 ✅ Markdown rendering (react-markdown)
#   FR-005 ✅ Shiki code highlighting
#   FR-006 ✅ KaTeX/MathJax math rendering
#   FR-007 ✅ Mermaid diagram rendering
#   FR-008 ✅ Table with horizontal scroll
#   FR-009 ✅ Streaming response with smooth animation
#   FR-010 ⬜ (requires live AI provider connection)
#   FR-011 ✅ Thinking block display
#   FR-012 ✅ Tool block display
#   FR-013 ✅ Error block display
#   FR-014 ✅ Citation block display
#   FR-015 ✅ File/Image/Video block display
#   FR-016 ✅ Message action toolbar
#   FR-017 ✅ Inline message editing
#   FR-018 ⬜ (TTS requires browser speech API interaction)
#   FR-019 ✅ Streaming lifecycle management
#   FR-020 ✅ Tool approval workflow UI
#   FR-021 ✅ Infinite scroll with lazy loading
#   FR-022 ⬜ (branching requires multiple conversations)
#   FR-023 ✅ Message navigation controls
#   FR-024 ✅ Sidebar tabs (assistants/topics/sessions)
#   FR-025 ✅ System prompt display
#   FR-026 ✅ Multi-model message grouping
#   FR-027 ✅ Draft caching with 24h TTL
#   FR-028 ✅ Token count estimation
#   FR-029 ✅ Token usage per message
#   FR-030 ✅ Content search (Ctrl+F)
#   FR-031 ✅ Narrow viewport adaptation
#   FR-032 ⬜ (keyboard shortcuts require interactive testing)
#   FR-033 ✅ DnD tool ordering
#   FR-034 ✅ Context window filtering
#   FR-035 ✅ Empty state with prompt suggestions
#   FR-036 ✅ Translation block display
#   FR-037 ✅ SVG rendering
#   FR-038 ✅ Message attachments display
#   FR-039 ✅ Multi-select with drag selection
#   FR-040 ✅ React Flow conversation graph
#   SC-001 ⬜ (performance metrics require profiling)
#   SC-002 ✅ Code blocks render with syntax highlighting
#   SC-003 ✅ KaTeX renders without layout shift
#   SC-004 ✅ Input tools load within 100ms
#   SC-005 ⬜ (60fps scroll requires profiling)
#
# Demo Components:
#   HomePage          @demo-scaffold — will be extended by F004-settings-data
#   Chat              @demo-scaffold — will be extended by F006-mcp-tools
#   Inputbar          @demo-scaffold — will be extended by F007-knowledge
#   HomeTabs          @demo-scaffold — will be extended by F009-agents
#   MessageMenubar    @demo-scaffold — will be extended by F008-memory

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

CI_MODE=false
if [ "$1" = "--ci" ]; then
  CI_MODE=true
fi

echo "=== F005-chat-ui Demo ==="
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
  npx electron-vite dev &
  APP_PID=$!

  # Wait for app to start
  sleep 10

  # Stability window
  echo "Stability check (10s)..."
  sleep 10

  # Check if process is still alive
  if kill -0 $APP_PID 2>/dev/null; then
    echo "App running stable for 10 seconds"
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
    echo ""
    echo "✅ F005-chat-ui health check passed"
    exit 0
  else
    echo "❌ App exited prematurely"
    exit 1
  fi
fi

# Interactive mode
echo ""
echo "Starting Angdu Studio with full Chat UI..."
echo ""
echo "📋 Try these features:"
echo "  1. Send a message in the chat input"
echo "  2. View streaming response with block rendering"
echo "  3. Try the input toolbar (attach files, web search, new topic, etc.)"
echo "  4. Switch between assistants and topics in the sidebar"
echo "  5. Hover a message to see the action toolbar"
echo "  6. Use Ctrl+F to search within messages"
echo "  7. Try markdown: code blocks, math (LaTeX), tables"
echo "  8. Toggle message outline in settings"
echo "  9. Multi-model responses shown as groups"
echo ""
echo "Press Ctrl+C to stop."
echo ""

pnpm run dev
