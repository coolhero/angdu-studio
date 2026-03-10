# Implementation Plan: F006 MCP Tools

**Branch**: `006-mcp-tools` | **Date**: 2026-03-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-mcp-tools/spec.md`

## Summary

MCP (Model Context Protocol) integration providing server lifecycle management, tool execution, built-in servers, DXT package support, OAuth authentication, tool permission management, and marketplace discovery. The implementation spans both Electron main process (MCPService, built-in servers, IPC handlers) and renderer process (Zustand stores, settings UI with shadcn/ui).

## Technical Context

**Language/Version**: TypeScript 5.8, targeting ES2022
**Primary Dependencies**: @modelcontextprotocol/sdk, Electron 40, React 19, Zustand 5.x, shadcn/ui, Tailwind CSS 4, react-hook-form, zod, @hello-pangea/dnd, Sonner, lucide-react, i18next
**Storage**: Zustand (persisted to electron-store via IPC) for MCPServer list; runtime state for tools/prompts/resources/permissions
**Testing**: Vitest for unit tests, Playwright for E2E
**Target Platform**: Desktop (macOS, Windows, Linux) via Electron
**Project Type**: Desktop application (Electron)
**Performance Goals**: Server connection < 5s, tool call overhead < 2s, settings page load < 1s, real-time log streaming < 1s latency
**Constraints**: IPC boundary (structured-cloneable data only), shell environment resolution for stdio, ring buffer cap 200 entries
**Scale/Scope**: ~40 source files (20 main process, 20 renderer), 22 IPC channels, 3 REST routes, 9 built-in servers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Singleton Services | ✅ | MCPService is main-process singleton |
| II. IPC Bridge Pattern | ✅ | All mcp:* channels defined in shared IpcChannel enum |
| III. Middleware Pipeline | ✅ | MCP tools integrate via F002 middleware pipeline |
| IV. Registry & Factory Patterns | ✅ | Built-in server factory, server registry store |
| V. Dual Database Architecture | ✅ | MCPServer in electron-store (Zustand persist), no DB tables needed |
| VI. Test-First Development | ✅ | Tests before implementation |
| VII. Demo-Ready Delivery | ✅ | Demo script with stdio server test |
| VIII. Internationalization | ✅ | All UI text via i18next (ko/en) |

## Project Structure

### Documentation (this feature)

```text
specs/006-mcp-tools/
├── plan.md              # This file
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity schemas and store definitions
├── quickstart.md        # Setup and testing guide
├── contracts/
│   └── ipc-channels.md  # IPC and REST API contracts
└── tasks.md             # Task breakdown (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── services/
│   │   ├── MCPService.ts              # Core MCP client manager (~1200 lines)
│   │   ├── DxtService.ts             # DXT package handling
│   │   └── mcp/
│   │       ├── ServerLogBuffer.ts     # Ring buffer (200 entries/server)
│   │       └── oauth/
│   │           ├── provider.ts        # OAuth client provider
│   │           └── callback.ts        # OAuth callback server
│   ├── ipc/
│   │   └── mcp-handlers.ts           # IPC handler registrations
│   └── mcpServers/
│       ├── factory.ts                 # Built-in server factory
│       ├── filesystem/                # @angdu/filesystem
│       │   └── index.ts
│       ├── browser/                   # @angdu/browser
│       │   └── index.ts
│       ├── brave-search.ts           # @angdu/brave-search
│       ├── fetch.ts                   # @angdu/fetch
│       ├── python.ts                  # @angdu/python
│       ├── memory.ts                  # @angdu/memory
│       ├── sequentialthinking.ts      # @angdu/sequentialthinking
│       ├── dify-knowledge.ts          # @angdu/dify-knowledge
│       ├── didi-mcp.ts               # @angdu/didi-mcp
│       └── hub/                       # @angdu/hub
│           ├── index.ts
│           └── toolname.ts
├── renderer/src/
│   ├── stores/
│   │   ├── useMCPStore.ts             # Server list state (persisted)
│   │   └── useToolPermissionStore.ts  # Permission state machine
│   ├── hooks/
│   │   ├── useMCPServers.ts           # Server management hook
│   │   └── useMCPServerTrust.ts       # Trust verification hook
│   ├── pages/settings/MCPSettings/
│   │   ├── index.tsx                  # Router layout + sidebar
│   │   ├── McpServersList.tsx         # Server list (search, DnD, toggles)
│   │   ├── McpServerCard.tsx          # Server card component
│   │   ├── McpSettings.tsx            # Server detail page (tabbed)
│   │   ├── McpTool.tsx                # Tool viewer (enable/disable, auto-approve)
│   │   ├── McpPrompt.tsx              # Prompt viewer
│   │   ├── McpResource.tsx            # Resource viewer
│   │   ├── McpDescription.tsx         # Server description
│   │   ├── AddMcpServerModal.tsx      # Add server dialog (JSON/DXT)
│   │   ├── EditMcpJsonPopup.tsx       # JSON config editor
│   │   ├── McpMarketList.tsx          # Marketplace browser
│   │   ├── NpxSearch.tsx              # NPX package search
│   │   ├── InstallNpxUv.tsx           # Install helper
│   │   ├── BuiltinMCPServerList.tsx   # Built-in server listing
│   │   └── LogViewerDialog.tsx        # Server log viewer
│   └── types/
│       └── mcp.ts                     # MCP type definitions
└── shared/
    └── types/
        └── mcp.ts                     # Shared MCP types (main + renderer)

tests/
└── unit/
    ├── main/
    │   ├── mcp-service.test.ts
    │   ├── server-log-buffer.test.ts
    │   └── mcp-handlers.test.ts
    └── stores/
        ├── useMCPStore.test.ts
        └── useToolPermissionStore.test.ts
```

**Structure Decision**: Electron desktop app with main/renderer split. Main process owns MCPService (singleton), built-in servers, and IPC handlers. Renderer owns Zustand stores, hooks, and settings UI pages. Shared types in `src/shared/types/`.

## Implementation Phases

### Phase 1: Types & Shared Infrastructure
- Define MCP type definitions in `src/shared/types/mcp.ts`
- Define `BuiltinMCPServerNames` constant with `@angdu/` namespace
- Add MCP IPC channel names to shared `IpcChannel` enum
- Create `MCPServer`, `MCPTool`, `MCPPrompt`, `MCPResource`, `MCPToolResponse`, `MCPToolResultContent` interfaces

### Phase 2: Main Process — MCPService Core
- Implement `MCPService` singleton with client connection pool (`Map<string, Client>`)
- Implement transport factory (stdio, SSE, StreamableHTTP, InMemoryTransport)
- Implement shell environment resolution for stdio commands
- Implement `initClient()` with pending connection dedup and ping health checks
- Implement `callTool()` with timeout, abort, progress events, and sensitive field redaction
- Implement `abortTool()` via AbortController pool
- Implement `listTools()`, `listPrompts()`, `getPrompt()`, `listResources()`, `readResource()`
- Implement `getServerVersion()`, `checkConnectivity()`
- Implement cleanup on app quit
- Implement MCP notification handlers (tool/prompt/resource list changes, logging, cancellation)

### Phase 3: Main Process — Server Log Buffer
- Implement `ServerLogBuffer` class with per-server ring buffer (200 entries)
- Implement IPC forwarding of log entries to renderer
- Implement `getServerLogs()` for history retrieval

### Phase 4: Main Process — Built-in Server Factory
- Implement `createInMemoryMCPServer()` factory with InMemoryTransport pairs
- Implement built-in servers: filesystem, fetch, memory, sequentialthinking, brave-search, browser, python, dify-knowledge, didi-mcp, hub
- Use `@angdu/` namespace for all built-in server names

### Phase 5: Main Process — DXT & OAuth
- Implement `DxtService` for DXT package upload, extraction, validation, and cleanup
- Implement MCP OAuth client provider for SSE/HTTP authenticated connections
- Implement OAuth callback server for auth code exchange

### Phase 6: Main Process — IPC Handlers
- Register all `mcp:*` IPC handlers in `mcp-handlers.ts`
- Register `code-tools:*` and `python:*` handlers
- Wire MCPService methods to IPC channels
- Add preload API surface for `window.api.mcp`

### Phase 7: Renderer — Zustand Stores
- Implement `useMCPStore` with server CRUD, active toggle, package manager tracking
- Configure electron-store persistence via IPC
- Implement `useToolPermissionStore` with permission state machine (BL-027)
- Implement selectors: `getActiveServers`, `getAllServers`, `getActivePermission`

### Phase 8: Renderer — Hooks
- Implement `useMCPServers` hook wrapping store actions with IPC calls
- Implement `useMCPServerTrust` hook with trust verification dialog logic

### Phase 9: Renderer — Settings UI (Core Pages)
- Implement `MCPSettings/index.tsx` router layout with sidebar navigation
- Implement `McpServersList.tsx` with search, DnD reorder (@hello-pangea/dnd), add button
- Implement `McpServerCard.tsx` with name, status indicator, enable/disable switch
- Implement `McpSettings.tsx` server detail page with tabbed layout (settings, tools, prompts, resources, description)
- Implement settings form with react-hook-form + zod validation
- Implement `AddMcpServerModal.tsx` (stdio command, SSE URL, JSON config, DXT upload)
- Implement `EditMcpJsonPopup.tsx` JSON config editor

### Phase 10: Renderer — Settings UI (Tools, Prompts, Resources)
- Implement `McpTool.tsx` with name, description, input schema, enable/disable toggle, auto-approve toggle
- Implement `McpPrompt.tsx` with argument display
- Implement `McpResource.tsx` with URI and description
- Implement `McpDescription.tsx` for marketplace description
- Implement `LogViewerDialog.tsx` with real-time log streaming

### Phase 11: Renderer — Marketplace & Discovery
- Implement `McpMarketList.tsx` marketplace browser
- Implement `NpxSearch.tsx` npm package search
- Implement `InstallNpxUv.tsx` install helper
- Implement `BuiltinMCPServerList.tsx` built-in server listing with install buttons

### Phase 12: Integration & Demo
- Wire MCP tool injection into F002 AI provider pipeline
- Add MCP settings navigation entry to F004 settings layout
- Create demo script `demos/F006-mcp-tools.sh`
- i18n keys for all MCP UI text (ko + en)

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-027 | Click "Add Server" | onAddServer() | — | Dialog opens | Add server modal appears | verify-state .add-server-dialog visible |
| FR-027 | Submit stdio command | onSubmit(form) | mcpStore.addServer(server) | Dialog closes, card appears | New server in list | verify-state .server-card count "> 0" |
| FR-028 | Toggle server switch | onToggle(id) | mcpStore.setServerActive(id, value) | Switch updates, status badge changes | Server shows active/inactive | verify-effect .server-switch checked |
| FR-028 | Drag server card | onDragEnd(result) | mcpStore.setServers(reordered) | Cards reorder | Server list reordered | verify-effect .server-list order |
| FR-028 | Type in search | onSearch(query) | — (local filter) | List filters | Only matching servers shown | verify-effect .server-list filtered |
| FR-017 | Toggle tool enable | onToolToggle(name) | mcpStore.updateServer(id, { disabledTools }) | Switch updates | Tool shows enabled/disabled | verify-effect .tool-switch checked |
| FR-018 | Toggle auto-approve | onAutoApprove(name) | mcpStore.updateServer(id, { disabledAutoApproveTools }) | Switch updates | Auto-approve indicator changes | verify-effect .auto-approve-switch checked |
| FR-029 | Click tab (tools/prompts/resources) | onTabChange(tab) | — | Tab content switches | Selected tab content shown | verify-state .tab-content visible |
| FR-019 | Enable untrusted server | onTrust(server) | mcpStore.updateServer(id, { isTrusted, trustedAt }) | Trust dialog → switch enables | Server trusted and enabled | verify-effect .trust-dialog resolved |

## UX Behavior Contract

| Scenario | Expected Behavior | Failure Behavior | Verify Method |
|----------|-------------------|------------------|---------------|
| Server connecting | Status badge shows "connecting" spinner; switch disabled until connected | User can double-toggle; no feedback on connection state | verify-state .status-badge text "connecting" |
| Server connection failed | Error toast with message; switch reverts to off; retry available | Silent failure; switch stuck in wrong state | verify-state .server-switch checked "false" |
| Tool call in progress | Progress indicator in chat; abort button visible | No progress feedback; user can't cancel | verify-state .tool-progress visible |
| Tool call timeout | Timeout error displayed inline; tool marked as timed out | Silent hang; no indication of timeout | verify-state .tool-error visible |
| Log viewer streaming | New log entries appear at bottom; auto-scroll; timestamps formatted | Logs don't update; manual refresh needed | verify-effect .log-list scroll "bottom" |
| DXT upload | Upload progress indicator; success toast; server appears in list | No progress; no feedback on completion | verify-state .upload-progress visible |
| Permission request | Permission card appears with tool details and approve/deny buttons | Tool executes without permission; no UI shown | verify-state .permission-card visible |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **External store + React** (Zustand + React 19) | `useMCPStore` and `useToolPermissionStore` selectors MUST return referentially stable values. No `filter()` or `map()` creating new arrays per call. Use `useMemo` in components or select primitive values | Zustand uses `useSyncExternalStore` internally — unstable selectors cause infinite re-render loops |
| **Concurrent rendering** (React 19) | No side effects in render path. MCPService calls and IPC invocations MUST be in `useEffect` or event handlers, never during render | React 19 may invoke render multiple times before commit in concurrent mode |
| **IPC serialization** (Electron) | All data crossing IPC boundary MUST be structured-cloneable. No `Client` instances, `AbortController` refs, or functions in IPC payloads | Electron IPC uses structured clone algorithm — non-cloneable values cause silent failures |
| **Error Boundary** | Every route-level component in MCPSettings MUST be wrapped with an Error Boundary. Server connection failures must not crash the settings page | Uncaught render errors from MCP data (malformed tool schemas, null server fields) must be caught and shown as error state |
| **Event handler + state update** (React) | Batch state updates within MCP event handlers. `onServersChanged` and `onProgress` IPC events that update store MUST not trigger multiple sequential state updates | Unbatched updates from rapid IPC events (e.g., multiple servers starting) cause intermediate renders with inconsistent state |

## Bug Prevention Checks (B-1)

### Runtime Compatibility
- ✅ Electron 40 includes Node.js 20+ — `structuredClone`, `AbortController`, `fetch` all available
- ✅ `@modelcontextprotocol/sdk` uses standard Node.js APIs compatible with Electron main process
- ⚠️ Shell environment resolution (`shell-env` or equivalent) must handle macOS (zsh), Linux (bash), and Windows (PowerShell) — platform-specific logic needed

### State Management Anti-patterns
- ✅ `useMCPStore` and `useToolPermissionStore` are independent — no circular dependencies
- ✅ Permission store is runtime-only — no persistence race conditions
- ⚠️ `useMCPStore` init depends on electron-store data loaded via IPC — ensure store hydration completes before UI renders

### Async & Concurrency
- ⚠️ Multiple tool calls can be concurrent — `activeToolCalls` Map with AbortController per callId handles this
- ⚠️ Connection dedup via `pendingClients` Map prevents race conditions on concurrent init
- ✅ IPC event listeners in components cleaned up on unmount via returned unsubscribe function
- ⚠️ Log viewer real-time updates — throttle DOM updates if log entries arrive faster than 60fps

### Dependency Safety
- ✅ `@modelcontextprotocol/sdk` — actively maintained, standard MCP implementation
- ⚠️ DXT package handling — validate package contents before extraction (path traversal prevention)
- ✅ Built-in servers are bundled — no external dependency at runtime (except Python for python server)
