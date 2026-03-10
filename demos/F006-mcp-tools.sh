#!/bin/bash
# Demo: F006 MCP Tools
# Starts the app and provides instructions for testing MCP functionality

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ "$1" = "--ci" ]; then
  echo "=== F006 MCP Tools — CI Health Check ==="
  cd "$PROJECT_DIR"
  pnpm run build
  pnpm run test
  echo "✅ F006 MCP Tools health check passed"
  exit 0
fi

echo "=== F006 MCP Tools — Demo ==="
echo ""
echo "Starting Angdu Studio..."
cd "$PROJECT_DIR"

echo ""
echo "📋 Try it:"
echo "  1. Open Settings → MCP Servers"
echo "  2. Click 'Add Server'"
echo "  3. Enter: npx @modelcontextprotocol/server-filesystem /tmp"
echo "  4. The server should connect and tools should appear"
echo "  5. Try enabling a built-in server (e.g., filesystem)"
echo "  6. Open a chat and test tool execution"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run dev server in foreground so the script stays alive until Ctrl+C
# (pnpm run dev spawns child processes; backgrounding it can cause premature exit)
exec pnpm run dev
