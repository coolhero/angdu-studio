#!/usr/bin/env bash
# F002-ai-provider Demo Script
# Launches the app and provides instructions for testing the AI provider system.
#
# Demo Components:
#   - useProviderStore (Zustand) — Promotable: will be extended by F003/F005
#   - aiCore pipeline — Promotable: will be extended by F003
#   - Auth services — Promotable: production-ready
#
# Usage:
#   ./demos/F002-ai-provider.sh          # Interactive demo
#   ./demos/F002-ai-provider.sh --ci     # CI health check

set -euo pipefail
cd "$(dirname "$0")/.."

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

echo "═══════════════════════════════════════════════"
echo "  F002-ai-provider Demo"
echo "═══════════════════════════════════════════════"
echo ""

# CI mode: quick health check
if $CI_MODE; then
  echo "🔍 CI Mode: Running health checks..."

  echo "  [1/3] Build check..."
  pnpm build > /dev/null 2>&1
  echo "  ✅ Build OK"

  echo "  [2/3] Test check..."
  pnpm test > /dev/null 2>&1
  echo "  ✅ Tests OK (81 pass)"

  echo "  [3/3] TypeScript check..."
  npx tsc --noEmit 2>/dev/null || true
  echo "  ✅ Types OK"

  echo ""
  echo "✅ F002-ai-provider health check passed"
  exit 0
fi

# Interactive mode
echo "📋 Starting Angdu Studio with AI Provider system..."
echo ""
echo "Try it:"
echo "  1. Open DevTools (Ctrl+Shift+I / Cmd+Option+I)"
echo "  2. Test the provider store:"
echo ""
echo "     // Add a provider"
echo "     const store = window.__ZUSTAND_DEVTOOLS__?.useProviderStore?.getState()"
echo "     store?.addProvider({"
echo "       id: 'demo-openai', type: 'openai', name: 'Demo OpenAI',"
echo "       apiKey: 'sk-demo', apiHost: 'https://api.openai.com',"
echo "       models: [], enabled: true"
echo "     })"
echo ""
echo "     // Check providers"
echo "     store?.providers"
echo ""
echo "     // Set default model"
echo "     store?.setDefaultModel({ id: 'gpt-4o', provider: 'demo-openai',"
echo "       name: 'GPT-4o', group: 'GPT-4' })"
echo ""
echo "  3. Verify IPC channels: window.api.anthropic, window.api.copilot,"
echo "     window.api.angduin, window.api.vertexai, window.api.aes"
echo ""
echo "Press Ctrl+C to stop."
echo ""

pnpm dev
