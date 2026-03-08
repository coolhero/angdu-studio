# F006-mcp-tools — Pre-Context

**Feature**: MCP server management, tool execution, built-in servers, tool permissions, MCP marketplace
**Release Group**: RG-3 | **Tier**: T2

---

## 1. Runtime Exploration Results

- **MCP Service**: Main-process `MCPService` (~1200 lines) manages MCP client connections via `@modelcontextprotocol/sdk`. Supports four transport types: `stdio` (local process), `SSE` (HTTP server-sent events), `StreamableHTTP`, and `inMemory` (built-in servers).
- **Built-in Servers**: 12 built-in MCP servers -- filesystem, browser, brave-search, fetch, python, memory, sequential-thinking, dify-knowledge, didi-mcp, hub, nowledge-mem, mcp-auto-install. Created via `createInMemoryMCPServer()` factory using `InMemoryTransport`.
- **Tool Execution**: `callTool()` dispatches tool calls to connected MCP servers with argument serialization, timeout handling (configurable per-server, default 60s), progress events, and result formatting. Supports abort via `callId` and `AbortController`.
- **Server Lifecycle**: Start, stop, restart servers. Connection health checks. Auto-reconnect on transport failure. Server version tracking via `getServerVersion()`. Notification handlers for tool/prompt/resource list changes.
- **DXT Support**: Upload and install `.dxt` (Desktop Extension) packages for MCP servers.
- **OAuth**: MCP OAuth client provider for authenticated SSE/HTTP server connections.
- **Logging**: Per-server log buffering via `ServerLogBuffer` with real-time log streaming to renderer. Capped at 200 entries per server.
- **Hub**: MCP server marketplace/registry with tool name resolution.
- **Settings UI**: 17+ components for MCP configuration -- server list with search and DnD ordering, add server modal (JSON/DXT), JSON editor, NPX search, marketplace browser, tool/prompt/resource viewers, provider-specific settings pages with provider logos.
- **Tool Permissions**: Per-tool enable/disable via `disabledTools[]`, per-tool auto-approve via `disabledAutoApproveTools[]` on the `MCPServer` object. Trust model with `isTrusted` flag and `trustedAt` timestamp.
- **Prompts and Resources**: MCP prompt listing, retrieval (`getPrompt`), and resource listing/reading.
- **Tracing**: Request tracing integration via `@mcp-trace/trace-core` with `TraceMethod` and `withSpanFunc` decorators.

---

## 2. Source Reference

### Main Process (Backend)

| File | Role |
|------|------|
| `src/main/services/MCPService.ts` | Core MCP client manager (~1200 lines). Manages `Map<string, Client>` of active connections. Key methods: `initServer`, `removeServer`, `restartServer`, `stopServer`, `callTool`, `abortToolCall`, `listTools`, `listPrompts`, `getPrompt`, `listResources`, `readResource`, `getServerVersion`, `checkConnectivity`, `cleanup`. Uses `@modelcontextprotocol/sdk` Client with all four transport types. |
| `src/main/services/DxtService.ts` | Desktop Extension package management |
| `src/main/services/CacheService.ts` | Cache for MCP tool/prompt lists |
| `src/main/services/mcp/oauth/provider.ts` | MCP OAuth client provider |
| `src/main/services/mcp/oauth/callback.ts` | OAuth callback server |
| `src/main/services/mcp/ServerLogBuffer.ts` | Per-server log buffering with timestamp, level, message, data |
| `src/main/mcpServers/factory.ts` | Built-in server factory. Creates `InMemoryTransport` pair, connects `Client` to local `Server` instance. |
| `src/main/mcpServers/filesystem/` | Filesystem MCP server (read, write, list, search) |
| `src/main/mcpServers/browser/` | Browser automation MCP server |
| `src/main/mcpServers/brave-search.ts` | Brave search MCP server |
| `src/main/mcpServers/fetch.ts` | HTTP fetch MCP server |
| `src/main/mcpServers/python.ts` | Python execution MCP server |
| `src/main/mcpServers/memory.ts` | Memory MCP server |
| `src/main/mcpServers/sequentialthinking.ts` | Sequential thinking MCP server |
| `src/main/mcpServers/dify-knowledge.ts` | Dify knowledge base MCP server |
| `src/main/mcpServers/didi-mcp.ts` | DiDi MCP server |
| `src/main/mcpServers/hub/` | MCP marketplace/hub integration |
| `src/main/mcpServers/hub/toolname.ts` | Tool name resolution |

### Renderer (Frontend)

| File | Role |
|------|------|
| `src/renderer/src/store/mcp.ts` | Redux slice for MCP server list. Actions: `setMCPServers`, `addMCPServer`, `updateMCPServer`, `deleteMCPServer`, `setMCPServerActive`. Selectors: `getActiveServers`, `getAllServers`. |
| `src/renderer/src/store/toolPermissions.ts` | Tool permission state management |
| `src/renderer/src/hooks/useMCPServers.ts` | Hook wrapping MCP Redux actions (~52 lines) |
| `src/renderer/src/hooks/useMCPServerTrust.ts` | Trust verification hook (`ensureServerTrusted`) |
| `src/renderer/src/pages/settings/MCPSettings/index.tsx` | MCP settings layout with sidebar navigation. Routes: `servers`, `settings/:serverId`, `npx-search`, `mcp-install`, `builtin`, `marketplaces`, and provider-specific routes. |
| `src/renderer/src/pages/settings/MCPSettings/McpSettings.tsx` | Individual server config page. Tabs: settings (form), description, tools, prompts, resources. Form fields: name, description, serverType (stdio/sse/streamableHttp), baseUrl, command, args, env, headers, registryUrl, longRunning, timeout. Advanced: provider, providerUrl, logoUrl, tags. |
| `src/renderer/src/pages/settings/MCPSettings/McpServersList.tsx` | Server list with search, DnD ordering (`useDndReorder`), add button (JSON/DXT), cards with toggle. |
| `src/renderer/src/pages/settings/MCPSettings/McpServerCard.tsx` | Individual server card with name, status indicator, enable/disable switch. |
| `src/renderer/src/pages/settings/MCPSettings/AddMcpServerModal.tsx` | Add server dialog (JSON config or DXT upload) |
| `src/renderer/src/pages/settings/MCPSettings/EditMcpJsonPopup.tsx` | JSON config editor popup |
| `src/renderer/src/pages/settings/MCPSettings/McpTool.tsx` | Tool viewer: name, description, input schema, enable/disable toggle, auto-approve toggle. |
| `src/renderer/src/pages/settings/MCPSettings/McpPrompt.tsx` | Prompt viewer with argument display |
| `src/renderer/src/pages/settings/MCPSettings/McpResource.tsx` | Resource viewer with URI and description |
| `src/renderer/src/pages/settings/MCPSettings/McpDescription.tsx` | Server description from marketplace data |
| `src/renderer/src/pages/settings/MCPSettings/McpMarketList.tsx` | Marketplace browser for discovering servers |
| `src/renderer/src/pages/settings/MCPSettings/NpxSearch.tsx` | NPX/npm package search for MCP servers |
| `src/renderer/src/pages/settings/MCPSettings/InstallNpxUv.tsx` | NPX/UV install helper and instructions |
| `src/renderer/src/pages/settings/MCPSettings/BuiltinMCPServerList.tsx` | Built-in server listing with install buttons |
| `src/renderer/src/pages/settings/MCPSettings/McpProviderSettings.tsx` | Provider-specific MCP settings page |
| `src/renderer/src/pages/settings/MCPSettings/SyncServersPopup.tsx` | Server sync dialog |
| `src/renderer/src/pages/settings/MCPSettings/ProtocolInstallWarning.tsx` | Protocol install warning dialog |
| `src/renderer/src/pages/settings/MCPSettings/providers/` | Provider-specific config (ModelScope, TokenFlux, Lanyun, 302AI, Bailian, MCPRouter) |
| `src/renderer/src/pages/settings/MCPSettings/utils.ts` | MCP settings utilities |
| `src/renderer/src/types/mcp.ts` | MCP-specific type definitions (`MCPServerInstallSource`) |
| `src/renderer/src/types/index.ts` | Core MCP types: `MCPServer`, `MCPTool`, `MCPPrompt`, `MCPResource`, `MCPToolResponse`, `MCPToolResultContent`, `BuiltinMCPServerNames` |

---

## 3. Data Models and State

### MCPServer (`src/renderer/src/types/index.ts`)

```typescript
interface MCPServer {
  id: string                          // Internal ID
  name: string                        // MCP name, generally unique key
  type?: 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'
  description?: string
  baseUrl?: string                    // For SSE/StreamableHTTP
  command?: string                    // For stdio (e.g., 'npx', 'uvx')
  registryUrl?: string                // Package registry URL
  args?: string[]                     // Command arguments
  env?: Record<string, string>        // Environment variables
  headers?: Record<string, string>    // HTTP headers for SSE/HTTP
  provider?: string                   // Provider name (ModelScope, etc.)
  providerUrl?: string                // Provider website URL
  logoUrl?: string                    // Server logo URL
  tags?: string[]                     // Tags
  longRunning?: boolean               // Long-running server flag
  timeout?: number                    // Timeout in seconds (default 60)
  dxtVersion?: string                 // DXT package version
  dxtPath?: string                    // DXT extracted path
  reference?: string                  // Documentation link
  searchKey?: string                  // Marketplace search key
  configSample?: MCPConfigSample      // Sample configuration
  disabledTools?: string[]            // Disabled tool names
  disabledAutoApproveTools?: string[] // Tools without auto-approve
  shouldConfig?: boolean              // Built-in needs config flag
  isActive: boolean                   // Running state
  installSource?: MCPServerInstallSource  // 'builtin' | 'manual' | 'protocol'
  isTrusted?: boolean                 // User trust flag
  trustedAt?: number                  // Trust timestamp
  installedAt?: number                // Install timestamp
}
```

### Built-in Server Names

```typescript
BuiltinMCPServerNames = {
  mcpAutoInstall: '@cherry/mcp-auto-install',
  memory: '@cherry/memory',
  sequentialThinking: '@cherry/sequentialthinking',
  braveSearch: '@cherry/brave-search',
  fetch: '@cherry/fetch',
  filesystem: '@cherry/filesystem',
  difyKnowledge: '@cherry/dify-knowledge',
  python: '@cherry/python',
  didiMCP: '@cherry/didi-mcp',
  browser: '@cherry/browser',
  nowledgeMem: '@cherry/nowledge-mem',
  hub: '@cherry/hub'
}
```

> These `@cherry/` prefixed names need remapping to `@angdu/` in the rebuild.

### MCPTool, MCPPrompt, MCPResource

```typescript
interface MCPTool extends BaseTool {
  // From @modelcontextprotocol/sdk: name, description, inputSchema
  serverId: string
  serverName: string
}

interface MCPPrompt {
  id: string
  name: string
  description?: string
  arguments?: { name: string, description?: string, required?: boolean }[]
  serverId: string
  serverName: string
}

// MCPResource comes from SDK directly
```

### MCPToolResponse

```typescript
interface MCPToolResponse {
  id: string
  tool: MCPTool
  arguments: Record<string, unknown> | string | undefined
  status: 'pending' | 'streaming' | 'cancelled' | 'invoking' | 'done' | 'error'
  response?: any
  partialArguments?: string  // Accumulated partial JSON during streaming
  toolCallId?: string
  toolUseId?: string
  parentToolUseId?: string
}

interface MCPToolResultContent {
  type: 'text' | 'image' | 'audio' | 'resource'
  text?: string
  data?: string
  mimeType?: string
  resource?: { uri?, text?, mimeType?, blob? }
}
```

### Redux Store (`store/mcp.ts`)

```typescript
interface MCPConfig {
  servers: MCPServer[]
  isUvInstalled: boolean
  isBunInstalled: boolean
}

// Slice: 'mcp'
// Actions: setMCPServers, addMCPServer, updateMCPServer, deleteMCPServer,
//          setMCPServerActive, setIsUvInstalled, setIsBunInstalled
// Selectors: getActiveServers, getAllServers
```

### MCPService Internal State (Main Process)

```typescript
// MCPService manages:
private clients: Map<string, Client>           // serverId -> MCP Client
private activeCallIds: Map<string, AbortController>  // callId -> abort
private logBuffer: ServerLogBuffer              // Per-server logs
```

### IPC Channels

The MCP feature uses `window.api.mcp.*` which maps to IPC handlers:
- `mcp.listTools(server)` -> list available tools
- `mcp.callTool(server, toolName, args)` -> execute tool
- `mcp.abortTool(callId)` -> abort tool execution
- `mcp.listPrompts(server)` -> list prompts
- `mcp.getPrompt(server, name, args)` -> get prompt content
- `mcp.listResources(server)` -> list resources
- `mcp.readResource(server, uri)` -> read resource
- `mcp.restartServer(server)` -> restart server
- `mcp.stopServer(server)` -> stop server
- `mcp.removeServer(server)` -> remove server
- `mcp.getServerVersion(server)` -> get version string
- `mcp.getServerLogs(server)` -> get log history
- `mcp.onServerLog(callback)` -> subscribe to real-time logs
- `mcp.checkConnectivity(server)` -> verify connection
- `mcp.uploadDxt(file)` -> install DXT package

---

## 4. Component / Service Architecture

### Main Process Architecture

```
MCPService (singleton)
  +-- Client pool (Map<serverId, @modelcontextprotocol/sdk Client>)
  |     +-- StdioClientTransport (for stdio servers)
  |     +-- SSEClientTransport (for SSE servers)
  |     +-- StreamableHTTPClientTransport (for HTTP servers)
  |     +-- InMemoryTransport (for built-in servers)
  +-- ServerLogBuffer (per-server log collection)
  +-- AbortController pool (Map<callId, AbortController>)
  +-- Notification handlers
  |     +-- ToolListChangedNotification -> re-list tools
  |     +-- PromptListChangedNotification -> re-list prompts
  |     +-- ResourceListChangedNotification -> re-list resources
  |     +-- ResourceUpdatedNotification -> notify renderer
  |     +-- LoggingMessageNotification -> buffer logs
  |     +-- CancelledNotification -> handle cancellation
  +-- initServer(server) -> create transport, connect client, list tools
  +-- callTool(server, name, args) -> execute with timeout, progress, abort
  +-- cleanup() -> disconnect all clients on app quit

Built-in Server Factory (mcpServers/factory.ts)
  +-- createInMemoryMCPServer(name, args, env) -> Server + InMemoryTransport pair
  +-- Individual servers:
        +-- filesystem/ (read, write, list, search files)
        +-- browser/ (browser automation)
        +-- brave-search.ts
        +-- fetch.ts
        +-- python.ts
        +-- memory.ts
        +-- sequentialthinking.ts
        +-- dify-knowledge.ts
        +-- didi-mcp.ts
        +-- hub/ (marketplace integration)
```

### Renderer Architecture

```
MCPSettings (index.tsx -- router layout)
  +-- Sidebar navigation (servers, builtin, marketplaces, providers)
  +-- Routes:
        +-- McpServersList (server list with search, DnD, add)
        |     +-- McpServerCard (per-server: name, switch, navigate)
        |     +-- AddMcpServerModal (JSON/DXT)
        |     +-- EditMcpJsonPopup
        +-- McpSettings (individual server config)
        |     +-- Form (name, type, command/url, args, env, headers, timeout)
        |     +-- MCPToolsSection (tool list with enable/disable, auto-approve)
        |     +-- MCPPromptsSection (prompt list)
        |     +-- MCPResourcesSection (resource list)
        |     +-- MCPDescription (marketplace description)
        |     +-- Log viewer modal
        +-- BuiltinMCPServerList (install built-in servers)
        +-- McpMarketList (marketplace browser)
        +-- NpxSearch (npm package search)
        +-- InstallNpxUv (install helper)
        +-- ProviderDetail (per-provider MCP configs: ModelScope, etc.)

Chat Integration (in F005-chat-ui):
  +-- Inputbar/tools/mcpToolsTool.tsx (MCP server selector in toolbar)
  +-- Inputbar/tools/resourceTool.tsx (MCP resource selector)
  +-- Messages/Tools/MessageMcpTool.tsx (tool call display in chat)
  +-- Messages/Tools/ToolApprovalActions.tsx (approve/deny)
  +-- Messages/Tools/ToolPermissionRequestCard.tsx
  +-- Messages/Blocks/ToolBlock.tsx (tool block wrapper)
  +-- Messages/Blocks/ToolBlockGroup.tsx (grouped tool blocks)
```

---

## 5. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B111 | Connect to MCP server via stdio transport (spawn local process) | P1 | `MCPService.ts` `initServer` |
| B112 | Connect to MCP server via SSE transport (HTTP with headers) | P1 | `MCPService.ts` `initServer` |
| B113 | Connect to MCP server via StreamableHTTP transport | P1 | `MCPService.ts` `initServer` |
| B114 | Connect to built-in MCP server via InMemoryTransport | P1 | `MCPService.ts`, `factory.ts` |
| B115 | List available tools from connected MCP server | P1 | `MCPService.listTools()` |
| B116 | Execute MCP tool call with arguments, timeout, and progress events | P1 | `MCPService.callTool()` |
| B117 | Abort in-progress tool call by callId | P2 | `MCPService.abortToolCall()` |
| B118 | Start/stop/restart MCP server lifecycle | P1 | `MCPService.initServer/stopServer/restartServer` |
| B119 | Create built-in MCP servers via in-memory transport factory | P1 | `mcpServers/factory.ts` |
| B120 | Run filesystem MCP server (read, write, list, search files) | P2 | `mcpServers/filesystem/` |
| B121 | Run browser automation MCP server | P3 | `mcpServers/browser/` |
| B122 | Run Python execution MCP server | P2 | `mcpServers/python.ts` |
| B123 | Upload and install DXT packages | P2 | `DxtService.ts` |
| B124 | Handle MCP OAuth authentication flow | P2 | `mcp/oauth/` |
| B125 | Buffer and stream server logs to renderer (capped 200 entries) | P2 | `ServerLogBuffer.ts` |
| B126 | List prompts from MCP server | P2 | `MCPService.listPrompts()` |
| B127 | Get prompt content from MCP server | P2 | `MCPService.getPrompt()` |
| B128 | List and read resources from MCP server | P2 | `MCPService.listResources/readResource` |
| B129 | Check MCP server connectivity before enabling | P2 | `MCPService.checkConnectivity()` |
| B130 | Enable/disable individual tools per server (`disabledTools`) | P2 | `McpSettings.tsx`, `McpTool.tsx` |
| B131 | Toggle auto-approve per tool (`disabledAutoApproveTools`) | P2 | `McpSettings.tsx`, `McpTool.tsx` |
| B132 | Trust verification before enabling untrusted servers | P2 | `useMCPServerTrust.ts` |
| B133 | Add MCP server via UI (stdio command, SSE URL, JSON config, or DXT) | P1 | `AddMcpServerModal.tsx` |
| B134 | Browse and install from MCP marketplace | P2 | `McpMarketList.tsx` |
| B135 | Search and install NPX MCP packages | P2 | `NpxSearch.tsx` |
| B136 | Configure registry URL for npx/uv package managers | P3 | `McpSettings.tsx` |
| B137 | Cleanup all MCP connections on app quit | P1 | `MCPService.cleanup()` |
| B138 | Resolve shell environment for stdio command execution | P1 | `MCPService.ts` (`getLoginShellEnvironment`) |
| B139 | Handle notification subscriptions (tool/prompt/resource changes) | P2 | `MCPService.ts` notification handlers |
| B140 | Reorder MCP servers via drag-and-drop | P3 | `McpServersList.tsx` |
| B141 | Provider-specific MCP server configs (ModelScope, TokenFlux, etc.) | P3 | `providers/` directory |
| B142 | Display server version in settings | P3 | `McpSettings.tsx` |

---

## 6. UI Component Features

| AntD Component (Current) | shadcn/ui Replacement | Usage Context |
|---------------------------|----------------------|---------------|
| `Form`, `Form.Item` | Form (react-hook-form + zod) | Server settings form |
| `Input`, `TextArea` | Input, Textarea | Command, URL, args, env, headers |
| `Select` | Select | Server type, tags |
| `Switch` | Switch | Server enable/disable, longRunning |
| `Button` | Button | Save, delete, start, stop, install |
| `Tabs` | Tabs | Settings/tools/prompts/resources |
| `Modal` | Dialog | Add server, edit JSON, log viewer |
| `Tag`, `Badge` | Badge | Status indicators, version badge |
| `Tooltip` | Tooltip | Form field tooltips |
| `Radio`, `Radio.Group` | RadioGroup | Registry selection |
| `Popover` | Popover | Server description, install warning |
| `Collapse` | Collapsible | Advanced settings, tool details |
| `Empty` | Custom empty state | No servers configured |
| `Flex` | Native flexbox / Tailwind | Layout throughout |
| `Dropdown` | DropdownMenu | Add server options (JSON/DXT) |
| `Alert` | Alert | Connection errors, warnings |
| `Typography.Text` | Paragraph/text | Log viewer text |
| `styled-components` | Tailwind CSS | `Container`, `ServerName`, `LogList`, `LogItem`, etc. |

---

## 7. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| `HOME_CHERRY_DIR` | `MCPService.ts` (MCP data path) | `HOME_ANGDU_DIR` |
| `BuiltinMCPServerNames` `@cherry/*` | `types/index.ts` | `@angdu/*` |
| `cherry-studio://mcp-install` | Protocol handler | `angdu-studio://mcp-install` |
| `CherryStudio` in MCP client info | `MCPService.ts` client name | `AngduStudio` |
| `cherry` in built-in server names | `@cherry/memory`, `@cherry/fetch`, etc. | `@angdu/memory`, `@angdu/fetch`, etc. |
| `CherryHQ` in GitHub references | `store/mcp.ts` comments | `AngduHQ` or remove |

---

## 8. Migration Notes (Stack Changes)

### Redux Toolkit -> Zustand

- `store/mcp.ts` is a simple slice with 7 actions and 2 selectors -- straightforward Zustand conversion
- `store/toolPermissions.ts` -- simple permission state -- straightforward conversion
- `useMCPServers()` hook (52 lines) wraps Redux dispatch -- convert to Zustand hook
- The slice is marked `@deprecated Scheduled for removal in v2.0.0` with a notice about v2 refactoring

### Ant Design -> shadcn/ui + TailwindCSS 4

- **McpSettings.tsx** is the heaviest Ant Design consumer: `Form`, `Form.Item`, `Input`, `TextArea`, `Select`, `Switch`, `Button`, `Tabs`, `Modal`, `Tag`, `Badge`, `Radio`, `Flex`, `Typography`
- The settings form pattern (Ant Design `Form.useForm`) -> `react-hook-form` + `zod` validation
- `window.modal.confirm()` for delete confirmation -> shadcn `AlertDialog`
- `window.modal.error()` for connection errors -> shadcn `Dialog` with error styling
- `window.toast.success/error()` -> Sonner toast
- `Badge` with custom styled count -> shadcn `Badge` variant

### styled-components -> TailwindCSS

- Moderate surface area: `Container`, `ServerName`, `AdvancedSettingsButton`, `LogList`, `LogItem`, `LogHeader`, `Timestamp`, `LogMessage`, `PreBlock`, `VersionBadge`, `MenuList`, `RightContainer`, `ProviderIcon`, etc.
- CSS variables used: `--color-background`, `--color-border`, `--color-primary`, `--color-text-*`, `--navbar-height`, `--settings-width`, `--list-item-border-radius`
- Settings page shared components (`SettingContainer`, `SettingDivider`, `SettingGroup`, `SettingTitle`) from parent settings index

### MCPService (Main Process)

- **No UI framework migration needed** -- pure Node.js service
- Identity remapping: `CherryStudio` client name, `HOME_CHERRY_DIR` constant, `@cherry/*` server names
- `@modelcontextprotocol/sdk` library stays as-is
- Tracing decorators (`@TraceMethod`, `withSpanFunc`) stay as-is

### Built-in Servers

- Each built-in server is a standalone Node.js module -- no UI framework dependency
- Names need `@cherry/` -> `@angdu/` remapping
- `createInMemoryMCPServer` factory pattern stays the same

---

## 9. Complexity Assessment

**Overall: MEDIUM-HIGH**

| Dimension | Rating | Notes |
|---|---|---|
| MCPService (main process) | High | ~1200 lines, 4 transport types, connection lifecycle, abort, progress, notifications, shell env |
| Built-in servers | Medium | 12 servers, each self-contained, mostly thin wrappers |
| Settings UI | Medium-High | 17+ components, heavy Ant Design Form usage, multi-tab layout with routing |
| Redux surface | Low | Simple slice with 7 actions, 2 selectors |
| Ant Design surface | High | Form, Tabs, Modal, Switch, Select, Radio, Badge -- all need conversion |
| styled-components surface | Medium | ~15 styled components across settings pages |
| Cross-feature coupling | Medium | IPC bridge to F001, tool injection to F002/F003, display in F005 |
| Identity remapping | Medium | `@cherry/*` names in 12+ places, protocol URL, client name |

### Recommended Migration Order

1. **Types** (`MCPServer`, `MCPTool`, `MCPToolResponse`, etc.) -- update identity strings
2. **MCPService** (main process) -- identity remapping only, no framework changes
3. **Built-in servers** -- identity remapping (`@cherry/` -> `@angdu/`)
4. **Zustand store** -- convert `store/mcp.ts` and `store/toolPermissions.ts`
5. **Hooks** -- convert `useMCPServers`, `useMCPServerTrust`
6. **Settings UI components** -- Ant Design -> shadcn/ui (largest effort)
7. **Chat integration components** -- already covered in F005 migration

### Key Risks

- **MCPService stability**: The ~1200-line service has complex transport lifecycle management; avoid unnecessary refactoring beyond identity remapping
- **Form migration**: Ant Design `Form.useForm()` with `validateFields()` has a different API pattern than `react-hook-form` -- field-by-field migration needed
- **Registry URL handling**: Custom registry logic for npx/uv/bun is tightly coupled to the form
- **Server log viewer**: Uses `antd Modal` with real-time log streaming -- needs careful Dialog replacement with streaming subscription
- **Provider logos**: Static imports from `assets/images/providers/` -- verify all provider logos are included in rebuild

---

## 10. For /speckit.specify

**Feature Summary**: MCP (Model Context Protocol) integration providing server lifecycle management, tool execution, built-in servers (filesystem, browser, search), DXT package support, OAuth authentication, tool permission management, and a marketplace for discovering and installing MCP servers.

**User Scenarios**:
- US-033: User adds an MCP server via stdio command
- US-034: User browses MCP marketplace and installs a server
- US-035: User enables filesystem MCP server and uses it in chat
- US-036: AI assistant calls an MCP tool; user sees result in chat
- US-037: User configures tool permissions (allow/deny specific tools)
- US-038: User uploads a DXT package to install an MCP server
- US-039: User views MCP server logs for debugging

**Draft Requirements**:
- FR-045: System SHALL connect to MCP servers via stdio, SSE, StreamableHTTP, and inMemory transports
- FR-046: System SHALL list, execute, and abort MCP tool calls with configurable timeout
- FR-047: System SHALL provide 12 built-in MCP servers (filesystem, browser, search, etc.)
- FR-048: System SHALL support DXT package installation for MCP servers
- FR-049: System SHALL manage MCP server lifecycle (start, stop, restart, health check)
- FR-050: System SHALL enforce tool-level permissions (enable/disable, auto-approve)
- FR-051: System SHALL support MCP prompt and resource listing/retrieval
- FR-052: System SHALL provide a marketplace for discovering MCP servers
- FR-053: System SHALL handle MCP OAuth flows for authenticated servers
- FR-054: System SHALL buffer and stream server logs to the UI

**Success Criteria**:
- SC-022: MCP server connects within 5 seconds of start
- SC-023: Tool call results return and display within the streaming response
- SC-024: Built-in servers start without external dependencies (except Python server)
- SC-025: Server logs stream in real-time without UI lag
- SC-026: DXT package installs and server becomes available without app restart

---

## 11. For /speckit.plan

**Dependencies**:
- Upstream: F001 (IPC bridge, proxy for MCP HTTP connections, protocol handler for `mcp-install`), F002 (tool injection into AI pipeline), F003 (tool message blocks)
- Downstream: F005 (tool result rendering in chat UI)

**Entity/API Contracts**:
- `MCPServer` -- full schema documented in Section 3
- `MCPTool` -- `{ name, description, inputSchema, serverId, serverName }`
- `MCPPrompt` -- `{ id, name, description, arguments?, serverId, serverName }`
- `MCPResource` -- from SDK: `{ uri, name, description?, mimeType? }`
- `MCPToolResponse` -- `{ id, tool, arguments, status, response, partialArguments }`
- `MCPToolResultContent` -- `{ type, text?, data?, mimeType?, resource? }`
- IPC channel group: `mcp.*` (~15 channels) -- listTools, callTool, abortTool, listPrompts, getPrompt, listResources, readResource, restartServer, stopServer, removeServer, getServerVersion, getServerLogs, onServerLog, checkConnectivity, uploadDxt
- Redux store: `store/mcp.ts` (server list), `store/toolPermissions.ts` (permission rules)

---

## 12. For /speckit.analyze

**Cross-Feature Verification Points**:
- F006 <-> F001: Protocol handler processes `angdu-studio://mcp-install/*` deep links; proxy settings apply to SSE/HTTP transports; IPC bridge for all `mcp.*` channels
- F006 <-> F002: MCP tools injected into AI request pipeline; tool results flow back through streaming chunks
- F006 <-> F003: Tool call results stored as `TOOL` type MessageBlocks with `rawMcpToolResponse` metadata
- F006 <-> F005: Tool result blocks rendered in chat UI via `Messages/Tools/`; tool permission/approval UI displayed inline; MCP server selector in inputbar toolbar
- F006 <-> F004/F009: MCP settings page lives under settings layout; backup includes MCP server configurations
- Redux->Zustand: `store/mcp.ts` is a simple slice (7 actions, 2 selectors) -- straightforward conversion
- AntD->shadcn: **High migration surface** in settings UI -- Form, Tabs, Modal, Switch, Select, Radio, Badge, Typography all need conversion
- Identity remapping: 12+ `@cherry/*` references need systematic find-and-replace to `@angdu/*`
