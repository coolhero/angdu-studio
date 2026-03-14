# F008-mcp Pre-Context

## Feature Overview

| Field | Value |
|-------|-------|
| Feature ID | F008-mcp |
| Title | MCP Server Management |
| Tier | 2 (Supporting) |
| Risk Group | RG-3 |
| Dependencies | F003-providers, F001-shell |
| SBI Range | B109 - B130 |

## Scope

MCP (Model Context Protocol) server management including client initialization (stdio/SSE/HTTP transports), tool discovery and invocation, prompt and resource access, OAuth flow for HTTP servers, DXT package installation, built-in MCP servers (filesystem, browser, hub), and the MCP configuration store.

## Migration Notes

- **Original**: Cherry Studio
- **Target**: Angdu Studio (Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7)
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- **State management**: Redux MCP slice migrates to Zustand store

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| src/main/services/MCPService.ts | MCP client management (init, tools, prompts, resources) |
| src/main/services/mcp/ | MCP OAuth handler, DXT service |
| src/main/mcpServers/filesystem/ | Built-in filesystem MCP server |
| src/main/mcpServers/browser/ | Built-in browser MCP server |
| src/main/mcpServers/hub/ | Built-in hub MCP server |
| src/renderer/src/store/mcp.ts | MCP Redux slice (server config CRUD) |
| src/renderer/src/types/mcp.ts | MCP type definitions |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B109 | main/services/MCPService.ts | initClient() | Initializes MCP client (stdio/sse/http) | P1 | extracted |
| B110 | main/services/MCPService.ts | listTools() | Gets available tools from server (cached 5min) | P1 | extracted |
| B111 | main/services/MCPService.ts | callTool() | Executes MCP tool with arguments | P1 | extracted |
| B112 | main/services/MCPService.ts | listPrompts() | Gets available prompts from server | P2 | extracted |
| B113 | main/services/MCPService.ts | getPrompt() | Executes prompt template | P2 | extracted |
| B114 | main/services/MCPService.ts | listResources() | Gets available resources from server | P2 | extracted |
| B115 | main/services/MCPService.ts | getResource() | Fetches resource content | P2 | extracted |
| B116 | main/services/MCPService.ts | removeServer() | Stops and removes MCP server | P1 | extracted |
| B117 | main/services/MCPService.ts | restartServer() | Restarts MCP server process | P2 | extracted |
| B118 | main/services/MCPService.ts | abortTool() | Cancels running tool invocation | P2 | extracted |
| B119 | main/services/MCPService.ts | checkMcpConnectivity() | Tests server connection | P2 | extracted |
| B120 | main/services/MCPService.ts | getServerLogs() | Gets server log output | P3 | extracted |
| B121 | main/services/mcp/ | handleOAuth() | Handles OAuth flow for HTTP MCP servers | P2 | extracted |
| B122 | main/services/mcp/ | installDxt() | Installs DXT package (MCP extension) | P2 | extracted |
| B123 | store/mcp.ts | addServer() | Adds MCP server configuration | P1 | extracted |
| B124 | store/mcp.ts | removeServer() | Removes server from config | P1 | extracted |
| B125 | store/mcp.ts | updateServer() | Updates server configuration | P1 | extracted |
| B126 | store/mcp.ts | setServerActive() | Enables/disables MCP server | P1 | extracted |
| B127 | main/mcpServers/filesystem/ | filesystemServer | Built-in filesystem MCP server | P2 | extracted |
| B128 | main/mcpServers/browser/ | browserServer | Built-in browser MCP server | P3 | extracted |
| B129 | main/mcpServers/hub/ | hubServer | Built-in hub MCP server | P3 | extracted |
| B130 | types/mcp.ts | McpServerConfig interface | MCP server configuration type | P1 | extracted |

## Priority Breakdown

| Priority | Count | IDs |
|----------|-------|-----|
| P1 | 8 | B109, B110, B111, B116, B123, B124, B125, B126, B130 |
| P2 | 11 | B112, B113, B114, B115, B117, B118, B119, B121, B122, B127 |
| P3 | 3 | B120, B128, B129 |

## Dependency Graph

```
F003-providers ──┐
                 ├──> F008-mcp ──> F009-agents (tool invocation)
F001-shell ──────┘
```

- **F003-providers**: MCP tool results feed into LLM conversations; tool schemas are injected into provider API calls.
- **F001-shell**: MCP servers run as child processes (stdio) or HTTP connections, requiring shell/process management.

## Key Design Decisions for Angdu Studio

1. **Transport support**: Three transports -- stdio (local processes), SSE (legacy), HTTP with streamable-http (modern). All initialized through the same `initClient()` interface.
2. **Tool cache**: Tool list cached for 5 minutes per server to avoid repeated `tools/list` calls. Cache invalidated on server restart.
3. **Built-in servers**: Filesystem, browser, and hub servers ship with the app. They run as in-process MCP servers (not spawned processes).
4. **DXT packages**: Desktop extension packages that bundle an MCP server with metadata. Installed to a dedicated directory.
5. **OAuth flow**: HTTP-transport MCP servers may require OAuth. The flow opens a browser window, captures the callback, and stores tokens.
6. **Zustand store**: Server configurations (name, transport, command/URL, env vars, active state) stored in Zustand with persistence.
