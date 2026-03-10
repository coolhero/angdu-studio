# Quickstart: F006 MCP Tools

## Prerequisites

- Node.js 20+
- pnpm
- F001 (app-core) and F002 (ai-provider) completed

## Setup

```bash
# Install MCP SDK dependency
pnpm add @modelcontextprotocol/sdk

# Install development dependencies (if not already present)
pnpm add -D @types/node
```

## Key Files to Create

### Main Process (src/main/)

```
src/main/
├── services/
│   ├── MCPService.ts          # Core MCP client manager (singleton)
│   ├── DxtService.ts          # DXT package management
│   └── mcp/
│       ├── ServerLogBuffer.ts  # Per-server ring buffer (200 entries)
│       └── oauth/
│           ├── provider.ts     # OAuth client provider
│           └── callback.ts     # OAuth callback server
├── ipc/
│   └── mcp-handlers.ts        # IPC handler registrations
└── mcpServers/
    ├── factory.ts              # Built-in server factory
    ├── filesystem/             # @angdu/filesystem server
    ├── browser/                # @angdu/browser server
    ├── brave-search.ts         # @angdu/brave-search
    ├── fetch.ts                # @angdu/fetch
    ├── python.ts               # @angdu/python
    ├── memory.ts               # @angdu/memory
    ├── sequentialthinking.ts   # @angdu/sequentialthinking
    ├── dify-knowledge.ts       # @angdu/dify-knowledge
    ├── didi-mcp.ts             # @angdu/didi-mcp
    └── hub/                    # @angdu/hub (marketplace)
```

### Renderer Process (src/renderer/src/)

```
src/renderer/src/
├── stores/
│   ├── useMCPStore.ts          # MCP server state
│   └── useToolPermissionStore.ts # Permission state machine
├── hooks/
│   ├── useMCPServers.ts        # Server management hook
│   └── useMCPServerTrust.ts    # Trust verification hook
├── pages/settings/MCPSettings/
│   ├── index.tsx               # Router layout with sidebar
│   ├── McpServersList.tsx      # Server list with search/DnD
│   ├── McpServerCard.tsx       # Server card component
│   ├── McpSettings.tsx         # Server detail/config page
│   ├── McpTool.tsx             # Tool viewer component
│   ├── McpPrompt.tsx           # Prompt viewer
│   ├── McpResource.tsx         # Resource viewer
│   ├── AddMcpServerModal.tsx   # Add server dialog
│   ├── EditMcpJsonPopup.tsx    # JSON editor popup
│   ├── McpMarketList.tsx       # Marketplace browser
│   ├── NpxSearch.tsx           # NPX package search
│   ├── BuiltinMCPServerList.tsx # Built-in servers
│   └── McpDescription.tsx      # Server description
└── types/
    └── mcp.ts                  # MCP type definitions
```

## Running

```bash
# Development
pnpm dev

# Tests
pnpm test

# Build
pnpm build
```

## Testing an MCP Server

1. Start the app in dev mode
2. Navigate to Settings → MCP
3. Click "Add Server"
4. Enter: `npx @modelcontextprotocol/server-filesystem /tmp`
5. The server should connect and list filesystem tools
