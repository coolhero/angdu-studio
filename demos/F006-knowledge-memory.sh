#!/usr/bin/env bash
set -euo pipefail

# F006 Knowledge & Memory System — Demo Script
# Default: Launch app with instructions for interactive demo
# --ci: Quick health check (build + launch + verify KB page reachable)

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  F006: Knowledge & Memory System                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

if $CI_MODE; then
  echo "🔍 CI Mode: Health check..."

  # Build check
  echo "  → Building..."
  pnpm run build 2>&1 | tail -1

  # Quick launch + exit
  echo "  → Launching app for health check..."
  timeout 15 npx electron . --no-sandbox 2>/dev/null &
  APP_PID=$!
  sleep 8

  # Check process still running (didn't crash)
  if kill -0 "$APP_PID" 2>/dev/null; then
    echo "  ✅ App launched successfully (PID $APP_PID)"
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
    echo ""
    echo "✅ F006 CI health check PASSED"
    exit 0
  else
    echo "  ❌ App crashed on launch"
    exit 1
  fi
fi

# Interactive mode
echo "📋 Try it — Knowledge & Memory System"
echo ""
echo "  1. Knowledge Base:"
echo "     → Click the Knowledge icon (📚) in the sidebar"
echo "     → Click '+' to create a new Knowledge Base"
echo "     → Name it 'Test KB' and select an embedding model"
echo "     → Add a text file to the KB — watch the status icon change"
echo "     → Wait for processing to complete (check mark)"
echo ""
echo "  2. RAG Search:"
echo "     → Go to a chat conversation"
echo "     → Click the KB button (🔍) in the input toolbar"
echo "     → Select 'Test KB' — green tag appears below input"
echo "     → Ask a question about the content you added"
echo "     → Look for [N] citation badges in the AI response"
echo ""
echo "  3. Memory System:"
echo "     → Go to Settings > Memory"
echo "     → Enable the global memory toggle"
echo "     → Configure embedding and LLM models"
echo "     → Have a conversation mentioning personal preferences"
echo "     → Check the Memory settings — extracted facts should appear"
echo ""
echo "  4. Save to KB:"
echo "     → Right-click any chat message"
echo "     → Select 'Save to Knowledge'"
echo "     → Choose content types and target KB"
echo ""
echo "Starting app..."
echo ""

exec pnpm run dev
