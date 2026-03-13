# F008-mcp Pre-Context

> Feature: MCP server lifecycle, tool injection into AI requests, MCP settings, built-in servers
> Tier: 2 | Risk Group: RG-4 | Dependencies: F001, F004

---

## 1. Runtime Exploration Results

### MCP Servers Popup (from chat toolbar)

**Layout**: Bottom popup panel triggered from chat input toolbar rocket icon

**UI Elements**:
- Three modes: Disabled (No MCP tools), Auto (AI discovers and uses tools automatically), Manual (Select specific MCP servers)
- Keyboard navigation: ESC Close, Up/Down Select, Cmd+Up/Down Page, Cmd+Left/Right Back/Forward, Enter Confirm

### Settings: MCP Settings Page

**Layout**: Settings sub-page with MCP server configuration

**UI Elements (from source directory)**:
- `McpSettings.tsx` -- main settings page
- `McpServersList.tsx` -- list of configured MCP servers
- `McpServerCard.tsx` -- individual server card with status/actions
- `BuiltinMCPServerList.tsx` -- built-in server catalog
- `AddMcpServerModal.tsx` -- modal to add new MCP server
- `EditMcpJsonPopup.tsx` -- JSON editor for server config
- `McpTool.tsx` / `McpPrompt.tsx` / `McpResource.tsx` -- tool/prompt/resource viewers
- `McpMarketList.tsx` -- marketplace for MCP servers
- `NpxSearch.tsx` -- search for NPX-based MCP packages
- `InstallNpxUv.tsx` -- install npx/uv runtime
- `SyncServersPopup.tsx` -- sync servers configuration
- `McpProviderSettings.tsx` -- provider-specific MCP settings
- `ProtocolInstallWarning.tsx` -- protocol installation warning

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| 1 | `src/main/services/MCPService.ts` | Main-process MCP client management, server lifecycle, tool calls | [TBD] |
| 2 | `src/renderer/src/store/mcp.ts` | Redux slice for MCP server state (Redux -> Zustand) | [TBD] |
| 3 | `src/main/mcpServers/factory.ts` | In-memory MCP server factory | [TBD] |
| 4 | `src/main/mcpServers/` (11 built-in servers) | Built-in MCP server implementations | [TBD] |
| 5 | `src/main/services/mcp/` | OAuth, ServerLogBuffer, MCP sub-services | [TBD] |
| 6 | `src/renderer/src/pages/settings/MCPSettings/` (18 files) | MCP settings UI | [TBD] |
| 7 | `src/main/services/DxtService.ts` | DXT extension service | [TBD] |
| 8 | `src/main/services/CacheService.ts` | Cache for MCP tool lists | [TBD] |

**[New Stack] Logic-Only Reference**: MCP protocol logic in MCPService.ts is stack-independent. Redux slice -> Zustand store. Settings UI: Ant Design -> shadcn/ui.

---

## 3. Source Behavior Inventory

### MCPService (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B187 | listAllActiveServerTools | `() => Promise<MCPTool[]>` | P1 |
| B188 | callToolById | `(toolId, params, callId?) => Promise<MCPCallToolResponse>` | P1 |
| B189 | callTool | `(_, {server, name, args, callId}) => Promise<MCPCallToolResponse>` | P1 |
| B190 | checkMcpConnectivity | `(_, server) => Promise<boolean>` | P1 |
| B191 | getInstallInfo | `() => Promise<...>` | P2 |
| B192 | listPrompts | `(_, server) => Promise<MCPPrompt[]>` | P2 |
| B193 | getPrompt | `(_, ...) => Promise<GetPromptResult>` | P2 |
| B194 | listResources | `(_, server) => Promise<MCPResource[]>` | P2 |
| B195 | getResource | `(_, ...) => Promise<GetResourceResponse>` | P3 |
| B196 | abortTool | `(_, callId) => Promise<void>` | P2 |
| B197 | getServerVersion | `(_, server) => Promise<string \| null>` | P3 |

### MCP Store (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B198 | setMCPServers | `(servers: MCPServer[]) => void` | P1 |
| B199 | addMCPServer | `(server: MCPServer) => void` | P1 |
| B200 | updateMCPServer | `(server: MCPServer) => void` | P1 |
| B201 | deleteMCPServer | `(id: string) => void` | P1 |
| B202 | setMCPServerActive | `({id, isActive}) => void` | P1 |
| B203 | getActiveServers | selector | P1 |
| B204 | getAllServers | selector | P1 |
| B205 | initializeMCPServers | `(existing, dispatch) => void` | P2 |
| B206 | builtinMCPServers | constant array (11 built-in servers) | P2 |
| B207 | hubMCPServer | constant (hub meta-server for auto mode) | P2 |
| B208 | setIsUvInstalled | `(installed: boolean) => void` | P3 |
| B209 | setIsBunInstalled | `(installed: boolean) => void` | P3 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| Modal (AddMcpServerModal) | Ant Design Modal | shadcn/ui Dialog |
| Card (McpServerCard) | Ant Design Card | shadcn/ui Card |
| Switch (server toggle) | Ant Design Switch | shadcn/ui Switch |
| Input, Select | Ant Design | shadcn/ui Input, Select |
| Popover, Tooltip | Ant Design | shadcn/ui Popover, Tooltip |
| Alert | Ant Design | shadcn/ui Alert |
| styled-components | styled-components | Tailwind CSS 4 |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| MCP mode toggle | Three-mode toggle popup: Disabled / Auto / Manual |
| Server card actions | Toggle active, edit config, delete, check connectivity |
| Keyboard navigation | ESC/arrows/Cmd shortcuts in MCP popup |
| Tool discovery | Auto mode: hub server aggregates all active server tools |
| Manual selection | Manual mode: user picks specific servers per request |
| Server status | Real-time connectivity check with visual indicator |
| Built-in install | One-click install of built-in MCP servers |
| JSON config edit | Raw JSON editor for advanced server configuration |
| Market browse | Browse and install MCP servers from marketplace |
| NPX search | Search npm registry for MCP server packages |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| `Cherry Studio` | MCPService.ts:298 (client name) | `Angdu Studio` |
| `APP: 'Cherry Studio'` | MCPService.ts:325 (env var) | `APP: 'Angdu Studio'` |
| `provider: 'CherryAI'` | store/mcp.ts (11 instances) | `provider: 'AngduAI'` |
| `@cherry/hub` | store/mcp.ts comment | `@angdu/hub` |
| `@cherry/didi-mcp` | store/mcp.ts:204 | `@angdu/didi-mcp` |
| `docs.cherry-ai.com` | store/mcp.ts:115 (reference URL) | Update to angdu docs URL |
| `CherryHQ/cherry-studio` | store/mcp.ts:13-14 (comments) | Remove/update |
| `HOME_CHERRY_DIR` | MCPService.ts:34 (import) | `HOME_ANGDU_DIR` |
| `BuiltinMCPServerNames` | types | Review for cherry references |
| `CherryAI` | builtinMCPServers provider field | `AngduAI` |

---

## 7. Static Resources

- **Icons**: Server status indicators, tool icons from MCP tool schemas
- **No custom images** specific to MCP feature

---

## 8. Environment Variables

- `MEMORY_FILE_PATH` -- built-in memory server
- `BRAVE_API_KEY` -- built-in Brave search server
- `DIFY_KEY` -- built-in Dify knowledge server
- `DIDI_API_KEY` -- built-in DiDi MCP server
- User-configurable env vars per server config

---

## 9. For /speckit.specify

### Summary
MCP (Model Context Protocol) feature manages the lifecycle of MCP servers, provides tool injection into AI chat requests, and offers a settings UI for configuring built-in and custom MCP servers. Supports stdio, SSE, streamable HTTP, and in-memory transport types.

### Key Scenarios
- SC-F008-01: User enables MCP in auto mode -- hub server aggregates all tools
- SC-F008-02: User selects manual mode and picks specific servers
- SC-F008-03: User adds a new MCP server via settings
- SC-F008-04: User installs a built-in MCP server
- SC-F008-05: AI request includes MCP tools based on mode selection
- SC-F008-06: Tool call execution with progress tracking and abort support
- SC-F008-07: Server connectivity check and status display

### Draft Functional Requirements
- FR-F008-01: MCP mode shall support Disabled/Auto/Manual toggle per chat session
- FR-F008-02: Auto mode shall inject all active server tools via hub aggregation
- FR-F008-03: Manual mode shall allow per-request server selection
- FR-F008-04: Server lifecycle shall manage connect/disconnect/reconnect
- FR-F008-05: Tool calls shall support progress events and cancellation
- FR-F008-06: Built-in servers shall be installable from settings with one click
- FR-F008-07: Server config shall support stdio, SSE, HTTP, in-memory transports

### Edge Cases
- Server crash during tool call -> graceful error with retry option
- Network timeout for SSE/HTTP transport -> configurable timeout
- Concurrent tool calls to same server -> queue management
- OAuth flow for authenticated MCP servers

---

## 10. For /speckit.plan

### Dependencies
- F001 (Core Infrastructure): IPC, window management, Redux/Zustand store
- F004 (AI Chat Engine): Tool injection into chat completion requests

### Entities Owned
- `MCPServer`: id, name, type, command, args, env, isActive, provider, installSource, isTrusted
- `MCPTool`: name, description, inputSchema, serverId
- `MCPPrompt`, `MCPResource`: MCP protocol entities

### Key APIs (IPC)
- `mcp.listTools`, `mcp.callTool`, `mcp.abortTool`
- `mcp.checkConnectivity`, `mcp.getServerVersion`
- `mcp.listPrompts`, `mcp.getPrompt`
- `mcp.listResources`, `mcp.getResource`
- `mcp.getInstallInfo`

### Tech Decisions
- MCP SDK: `@modelcontextprotocol/sdk` for client implementation
- Transport: stdio (StdioClientTransport), SSE, StreamableHTTP, InMemoryTransport
- Built-in servers run in-process via InMemoryTransport
- Tool name format: `buildFunctionCallToolName(serverId, toolName)`
- Server logs buffered via `ServerLogBuffer`

---

## 11. Feature Contracts

### Guarantees
- Active MCP servers are connected on app startup
- Tool lists are cached and refreshed on `ToolListChangedNotification`
- Tool calls are traceable via callId for abort support

### Dependencies on Other Features
- F001: Store persistence, IPC channels
- F004: AI provider integration for tool injection into completions

### Failure Modes
- Binary not found (npx/uv/bun): install prompt shown
- Server process crash: client detects disconnection, shows error status
- Tool call timeout: configurable, defaults vary by transport

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F008 <-> F004 (AI Chat): MCP tools injected via ParameterBuilder when mcpEnabled
- F008 <-> F012 (Code Tools): Code tools page checks isBunInstalled from MCP store
- F008 <-> F001 (Core): Server configs persisted in Redux/Zustand store

### Impact Scope
- MCP tool injection affects all AI request flows (chat, translate, etc.)
- Server lifecycle management is a long-running background process
- Built-in server catalog affects app bundle size
