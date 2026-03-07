# Pre-Context: MCP

**Feature ID**: F006-mcp
**Tier**: Tier 2
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/MCPService.ts` | MCP server lifecycle, transport layer, tool calling, caching |
| `src/main/mcpServers/` | Built-in MCP server implementations (browser/, filesystem/, hub/) |
| `src/main/services/mcp/` | MCP sub-services (oauth/) |
| `packages/shared/mcp.ts` | Shared MCP types and constants |
| `packages/mcp-trace/` | MCP trace/debug instrumentation |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **MCP server lifecycle management (add/remove/restart/stop), 4 transport types (stdio/SSE/streamableHTTP/inMemory), client health check (1000ms ping), pending client deduplication, tool calling with timeouts (60s default, 10min long-running), cache with TTLs (tools=5min, prompts=60min, resources=60min, get=30min), sensitive field redaction, npx/uvx fallback to bundled bun, OAuth authentication flow (5-min timeout, callback server), built-in browser MCP tools, built-in filesystem MCP tools, hub server discovery, server log buffer (200 entries), transport detection logic, notification handling, tool ID format (serverId__toolName)**
- Do not reference: Redux slice patterns (migrating to Zustand), Ant Design components in MCP settings UI (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only)
- **Extract**: MCP server lifecycle state machine, transport layer factory pattern (5 conditions: inMemory for built-in, SSE if URL contains `/sse`, streamableHTTP if HTTP(S) URL, stdio for command-based, default to stdio), tool call request/response protocol, tool caching strategy with TTL invalidation, OAuth flow with 5-minute timeout, server logging with circular buffer (200 entries), sensitive field redaction logic, npx/uvx/bun fallback chain, tool ID format (`serverId__toolName`), disabled tools filtering, cache invalidation on `list_changed` notifications, browser MCP tool implementations (navigate, screenshot, click, type, etc.), filesystem MCP tool implementations (read, write, list, search, etc.)
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Table` / `Modal` / `Switch` / `Form` components, styled-components wrappers

### Naming Remapping

No naming remapping required for F006-mcp. MCP is a protocol-level concept with no Cherry-specific branding.

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | MCP integration has no static resources; all configuration is user-generated at runtime |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F006) | | | MCP servers receive env from user config | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-app-core | Log level for main process MCP server management |

---

## SBI Coverage

**SBI Range**: B166-B210

| SBI ID | Priority | Description |
|--------|----------|-------------|
| B166 | P1 | MCPService.addServer -- register new MCP server configuration |
| B167 | P1 | MCPService.removeServer -- remove server, disconnect client, cleanup |
| B168 | P1 | MCPService.listTools -- discover tools from server (cached, 5min TTL) |
| B169 | P1 | MCPService.callTool -- execute tool call with timeout (60s default, 10min long-running) |
| B170 | P2 | MCPService.listResources -- list resources from server (cached, 60min TTL) |
| B171 | P2 | MCPService.getPrompt -- get prompt from server (cached, 60min TTL) |
| B172 | P2 | Browser MCP: navigate -- navigate to URL in managed browser |
| B173 | P2 | Browser MCP: screenshot -- capture page screenshot |
| B174 | P2 | Browser MCP: click -- click element by selector |
| B175 | P2 | Browser MCP: type -- type text into element |
| B176 | P1 | Filesystem MCP: readFile -- read file contents |
| B177 | P1 | Filesystem MCP: writeFile -- write content to file |
| B178 | P1 | Filesystem MCP: listDirectory -- list directory contents |
| B179 | P1 | Filesystem MCP: createDirectory -- create directory recursively |
| B180 | P1 | Filesystem MCP: deleteFile -- delete file or directory |
| B181 | P1 | Filesystem MCP: moveFile -- move/rename file |
| B182 | P1 | Filesystem MCP: searchFiles -- search files by pattern |
| B183 | P3 | ServerLogBuffer -- circular log buffer (200 entries) per server |
| B184 | P1 | Transport detection -- 5-condition factory (inMemory/SSE/streamableHTTP/stdio/default) |
| B185 | P2 | Notification handling -- list_changed triggers cache invalidation |
| B186 | P2 | Tool caching -- TTL-based cache (tools=5min, prompts=60min, resources=60min, get=30min) |
| B187-B210 | P2-P3 | Additional MCP behaviors: client health check (1000ms ping), pending client dedup, npx/uvx fallback to bun, OAuth auth flow (5-min timeout), sensitive field redaction, disabled tools filtering, tool ID format (serverId__toolName), bun proxy variable removal, NPM registry override, DXT server management, hub server discovery, tool input/output validation, server restart on config change, multi-server concurrent startup, error recovery and reconnection |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F006-mcp implements the Model Context Protocol (MCP) server lifecycle management and tool calling infrastructure. It manages MCP server instances with full lifecycle control (add, remove, start, stop, restart), supports 4 transport layers (stdio for local processes, SSE for legacy servers, streamableHTTP for modern servers, inMemory for built-in servers), handles tool discovery and caching with configurable TTLs, supports OAuth authentication for protected MCP servers (5-minute timeout with callback server), provides server logging with sensitive field redaction, and includes built-in MCP servers for browser automation and filesystem access. Tools discovered from MCP servers are made available to the AI chat system for function calling, with a composite ID format (`serverId__toolName`) ensuring global uniqueness.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | MCP server CRUD | User adds, removes, restarts, or stops MCP servers; server status updates in real-time |
| P1 | Tool calling | During chat, AI model requests a tool call; system routes the call to the appropriate MCP server with timeout enforcement (60s default, 10min long-running) and returns the result |
| P1 | Transport selection | System selects transport type based on 5 conditions (inMemory, SSE, streamableHTTP, stdio, default) |
| P1 | Filesystem tools | Built-in filesystem MCP server provides read, write, list, search, create, delete, move operations |
| P2 | Browser tools | Built-in browser MCP server provides navigation, screenshots, clicking, typing |
| P2 | Client health check | System pings MCP server with 1000ms timeout; stale clients are cleaned up |
| P2 | Tool caching | System caches discovered tools (5min TTL), prompts (60min), and resources (60min); cache invalidated on server notifications |
| P2 | OAuth authentication | User authenticates with an OAuth-protected MCP server; 5-minute timeout enforced |
| P3 | Server logging | MCP server interactions logged with sensitive field redaction; circular buffer of 200 entries per server |
| P3 | npx/uvx fallback | System falls back from npx to bundled bun, or from uvx to uv, when primary runners are unavailable |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: MCP server CRUD (add, remove, restart, stop)
- **FR-002**: 4 transport types (stdio, SSE, streamableHTTP, inMemory)
- **FR-003**: Client health check (1000ms ping, stale client cleanup)
- **FR-004**: Pending client deduplication (await in-flight init)
- **FR-005**: Tool calling with timeouts (60s default, 10min long-running with progress reset)
- **FR-006**: Cache with TTLs (tools=5min, prompts=60min, resources=60min, get=30min)
- **FR-007**: Sensitive field redaction in logs
- **FR-008**: npx/uvx fallback to bundled bun
- **FR-009**: OAuth authentication flow (5-min timeout, callback server)
- **FR-010**: Built-in browser MCP server (navigate, screenshot, click, type)
- **FR-011**: Built-in filesystem MCP server (read, write, list, search, create, delete, move)
- **FR-012**: Server log buffer (circular, 200 entries per server)
- **FR-013**: Notification handling with cache invalidation on list_changed
- **FR-014**: Tool ID format (serverId__toolName) with disabled tools filtering

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: MCP server starts and discovers tools within 5 seconds for stdio transport
- **SC-002**: Tool call execution completes and returns results within configured timeout (60s default)
- **SC-003**: Server lifecycle transitions (add -> start -> running -> stop -> remove) work correctly without orphaned processes
- **SC-004**: OAuth flow completes and stores tokens for subsequent authenticated tool calls within 5 minutes
- **SC-005**: Tool cache invalidates correctly on server restart and list_changed notifications
- **SC-006**: Health check detects stale clients within 1000ms and triggers reconnection
- **SC-007**: Built-in filesystem MCP tools correctly read, write, list, and search files
- **SC-008**: Built-in browser MCP tools correctly navigate, screenshot, click, and type
- **SC-009**: npx/uvx fallback to bun activates seamlessly when primary runners are not found

### Edge Cases

- MCP server process crashes; automatic restart or graceful error reporting
- Tool call timeout exceeded; configurable timeout with graceful cancellation and progress reset for long-running tools
- OAuth token refresh failure; re-authentication prompt within 5-minute window
- Server with hundreds of tools; tool list caching (5min TTL) prevents excessive discovery calls
- Concurrent tool calls to the same server; pending client deduplication prevents duplicate connections
- Stdio server binary not found on PATH; npx/uvx fallback chain with clear error if all runners fail
- Network failure during SSE/StreamableHTTP transport; reconnection with health check
- Server returns malformed tool results; output schema validation with warnings
- Sensitive fields in server environment variables; redaction in logs for authorization/apiKey/token/secret/password/credential fields
- Bun proxy variable interference; automatic removal of HTTP_PROXY/HTTPS_PROXY when using bun runner
- Filesystem MCP access to restricted paths; permission validation
- Browser MCP navigation to malicious URLs; URL validation and sandboxing

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework for main process communication, file system access, config persistence for MCP server settings |
| F002-ai-provider | Integration | Tool calling results fed back to AI provider during chat completions |

### Related Entities (data-model.md draft)

#### Owned Entities

**MCPServer** -- MCP server configuration and state

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique server identifier |
| name | string | required | Display name |
| description | string | optional | Server description |
| baseUrl | string | optional | Server URL (for SSE/HTTP types) |
| command | string | optional | Executable command (for stdio type) |
| args | string[] | optional | Command arguments (for stdio type) |
| env | Record<string, string> | optional | Environment variables passed to server |
| type | McpServerType | enum, required | `sse`, `streamableHttp`, `stdio`, `inMemory` |
| isActive | boolean | required | Whether server is currently active |
| provider | string | optional | Associated provider identifier |
| timeout | number | optional | Request timeout in ms (default 60000) |
| longRunning | boolean | default false | Enable extended timeout (10min) |
| disabledTools | string[] | optional | Tool names to disable |
| registryUrl | string | optional | Registry URL for discovery |
| autoApprove | string[] | optional | Tool names auto-approved for execution |
| headers | Record<string, string> | optional | Custom HTTP headers |

**MCPTool** -- Discovered tool from an MCP server

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| name | string | required | Tool name (unique within server) |
| description | string | required | Human-readable tool description |
| inputSchema | JSON Schema | required | JSON Schema for tool input parameters |
| serverId | string | FK -> MCPServer | Owning MCP server |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| (none) | | | F006 is relatively independent; it only depends on F001 infrastructure |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `mcp:list-servers` | List all configured MCP servers |
| IPC | `mcp:add-server` | Add a new MCP server configuration |
| IPC | `mcp:remove-server` | Remove an MCP server |
| IPC | `mcp:start-server` | Start an MCP server |
| IPC | `mcp:stop-server` | Stop a running MCP server |
| IPC | `mcp:restart-server` | Restart an MCP server |
| IPC | `mcp:list-tools` | List tools from a server (cached, 5min TTL) |
| IPC | `mcp:call-tool` | Execute a tool call on a server (60s/10min timeout) |
| IPC | `mcp:list-prompts` | List prompts from a server (cached, 60min TTL) |
| IPC | `mcp:list-resources` | List resources from a server (cached, 60min TTL) |
| IPC | ~8 additional channels | OAuth, logging, health check, hub discovery |
| Zustand | `useMCPStore` | MCP server state management |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-app-core | App info, process management, shell environment |
| IPC | `file:*` | F001-app-core | File system access for built-in servers |
| IPC | `config:*` | F001-app-core | Config get/set for MCP server persistence |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: MCP integration is primarily main process logic (server lifecycle, transport management, tool calling, OAuth, built-in servers). The renderer side manages server configuration state via Redux slice and displays server status. Transport layers (stdio, SSE, StreamableHTTP, InMemory) are implemented in main process services. Tool caching with TTLs reduces discovery overhead. OAuth flow handles authenticated servers with callback server. Built-in servers (browser, filesystem) run as inMemory transports.
- **Recommended implementation approach**: Replace Redux `mcp` slice with Zustand store for renderer-side state. Keep ALL main process logic intact (MCPService, transport layers, tool calling, OAuth, built-in servers) as it is entirely stack-independent. No naming changes required.
- **Caveats**: Minimal migration impact since most MCP logic is in the main process (Node.js, no UI framework dependencies). Only the renderer-side state management (Redux -> Zustand) needs migration. MCP settings UI migration is handled by F009-settings-ui.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Tool listing for chat | F002-ai-provider | Verify AI provider can retrieve available tools from F006 for function calling |
| Tool call execution | F002-ai-provider | Verify AI provider correctly calls mcp:call-tool when model requests a tool call |
| IPC channel registration | F001-app-core | Verify F006's mcp:* IPC channels are registered in F001's IPC handler |
| Agent tool execution | F010-agent | Verify F010 correctly uses F006's tool calling API for agent tool execution |
| MCP settings UI | F009-settings-ui | Verify F009 correctly displays and configures MCP servers through F006's API |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F002-ai-provider | API change impact | If mcp:list-tools or mcp:call-tool IPC signatures change, AI provider's tool calling pipeline needs modification |
| F010-agent | API change impact | If MCP server lifecycle or tool calling API changes, agent tool execution needs modification |
| F009-settings-ui | Entity change impact | If MCPServer configuration schema changes, settings MCP page needs modification |
