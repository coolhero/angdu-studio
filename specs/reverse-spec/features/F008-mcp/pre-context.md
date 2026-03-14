# F008-mcp — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: MCP Server Management & Tool Integration
> Tier: 2 (Recommended) | Demo Group: D2-Enhance
> Dependencies: F004-ai-core, F006-chat

---

## Feature Overview

Model Context Protocol (MCP) server management with multi-transport support (stdio, SSE, streamable-http, in-memory). Users configure MCP servers, discover available tools, and use them during AI chat. Hub mode aggregates tools from all active servers with namespaced IDs. Includes OAuth support, built-in bundled servers (filesystem, browser), command resolution with fallback to bundled runtimes, connection health checks, and tool definition caching.

---

## Runtime Exploration Results

From `runtime-exploration.md` — Settings > MCP Servers:

- **Location**: Settings sidebar > Features group > "MCP Servers"
- **Layout**: Settings content area with MCP server list and configuration
- **Related UI**: Input toolbar has MCP-related action buttons; assistant config has MCP server selection

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Main service | `src/main/services/MCPService.ts` | MCP lifecycle, IPC handlers |
| Client manager | `src/main/services/McpClientManager.ts` | Connection caching, health checks |
| Transport factory | `src/main/services/McpTransportFactory.ts` | Transport type selection |
| Command resolver | `src/main/services/McpCommandResolver.ts` | Command PATH + bundled runtime fallback |
| Hub | `src/main/services/McpHub.ts` | Tool aggregation with namespacing |
| Cache | `src/main/services/CacheService.ts` | Tool definition TTL caching |
| Built-in servers | `src/main/mcpServers/` | Bundled MCP servers (filesystem, browser) |
| Store | `src/renderer/src/store/mcp.ts` | Redux slice (MCP state) |
| Hooks | `src/renderer/src/hooks/useMCPServers.ts` | React hooks for MCP UI |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B188 | MCP server CRUD with settings UI | P1 | Add, edit, remove MCP server configurations. UI in Settings > MCP Servers. |
| B189 | Multi-transport connection (stdio, SSE, streamable-http, in-memory) | P1 | Connect to MCP servers via four transport types. Transport selected by server config. |
| B190 | Client connection caching with ping health check | P1 | Cache MCP client instances. Ping with 1s timeout before reuse. Reconnect on failure. |
| B191 | Tool discovery and listing | P1 | List available tools from connected MCP servers. Display tool names, descriptions, schemas. |
| B192 | Hub mode: aggregate tools from all active servers | P1 | Auto mode aggregates all active servers' tools with `serverId__toolName` namespacing. Route responses back by namespace prefix. |
| B193 | Manual mode: per-assistant server/tool selection | P2 | Assistants can select specific MCP servers and tools in manual mode. |
| B194 | Command resolution with bundled runtime fallback | P2 | Resolve stdio commands via PATH. Fall back to bundled bun/uv runtimes if not found. |
| B195 | Tool definition caching with TTL | P2 | Cache tool definitions per server with configurable TTL. Invalidate on reconnect or config change. |
| B196 | OAuth authentication flow | P3 | Support OAuth-based MCP server authentication. |
| B197 | Built-in MCP servers (filesystem, browser) | P2 | Ship bundled in-memory MCP servers for filesystem access and browser automation. |
| B198 | MCP server enable/disable toggle | P1 | Toggle individual servers active/inactive without deleting config. |
| B199 | Trust and auto-approve per server | P2 | Mark servers as trusted. Configure auto-approve tool lists per server. |

---

## Business Rules

- **BR-021**: MCP clients cached per config key with 1s ping-based health checks
- **BR-022**: Transport type (stdio/sse/streamable-http/in-memory) determined by server config, immutable per connection
- **BR-023**: Command resolution checks shell PATH first, then bundled runtimes (bun, uv)
- **BR-024**: Hub mode aggregates tools with `serverId__toolName` namespacing to prevent collisions
- **BR-025**: Tool definitions cached with TTL, invalidated on reconnect/config change

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| MCP server `env` field | Per-server environment variables passed to stdio child processes | {} |

---

## For /speckit.specify

- **Entities**: MCPServer, ToolPermissionsState (see entity-registry.md)
- **Business rules**: BR-021 through BR-025 (see business-logic-map.md)
- **Key screens**: Settings > MCP Servers (server list + config), Assistant config (MCP mode selection)
- **IPC channels**: `mcp:list-tools`, `mcp:call-tool`, `mcp:connect`, `mcp:disconnect`, `mcp:status`
- **Cross-feature**: BR-010 (F006-chat) determines which MCP tools are injected into completion requests

## For /speckit.plan

- **Migration impact**: Medium UI, Low state (see stack-migration.md)
- **UI migration**: MCP settings page uses AntD Form, List, Switch -> shadcn/ui equivalents
- **State migration**: `mcp` Redux slice -> `useMcpStore` Zustand store
- **Main process**: MCPService, ClientManager, Hub are Node.js — no UI migration needed
- **Dependencies**: Requires F004-ai-core for tool injection into completion pipeline
- **Zustand store**: `useMcpStore` absorbs `mcp` slice

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| `mcp:list-tools` IPC | F004-ai-core, F006-chat | Returns available tools (filtered by mode) |
| `mcp:call-tool` IPC | F004-ai-core | Executes a tool call, returns result |
| MCPServer entity | F005-assistant | Assistant references MCP server IDs |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| Assistant.mcpServers | F005-assistant | List of linked MCP server IDs per assistant |
| MCP mode setting | F005-assistant | disabled/auto/manual mode per assistant |
| Tool injection point | F004-ai-core | Completion pipeline injects MCP tools into request |
