# Pre-Context: MCP Integration

**Feature ID**: F006-mcp-integration
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/MCPService.ts` | MCP server lifecycle, transport layer, tool calling |
| `src/main/services/DxtService.ts` | DXT package management (upload, install, cleanup) |
| `src/main/mcpServers/` | Built-in MCP server implementations (inMemory transport) |
| `src/renderer/src/hooks/useMCPServers.ts` | React hook for MCP server state access |
| `src/renderer/src/pages/settings/MCPSettings/` | MCP settings UI (server list, config forms) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **MCP server lifecycle management (add/remove/restart/stop), 4 transport types (stdio/SSE/streamableHTTP/inMemory), client health check (1000ms ping), pending client deduplication, tool calling with timeouts (60s default, 10min long-running), cache with TTLs (tools=5min, prompts=60min, resources=60min, get=30min), sensitive field redaction, npx/uvx fallback to bundled bun, OAuth authentication flow (5-min timeout, callback server), DXT server management**
- Do not reference: Redux slice patterns in `mcp.ts` (migrating to Zustand), Ant Design components in MCP settings UI (migrating to shadcn/ui + Radix), styled-components in MCP pages (migrating to Tailwind-only)
- **Extract**: MCP server lifecycle state machine, transport layer factory pattern (5 conditions: inMemory for built-in, SSE if URL contains `/sse`, streamableHTTP if HTTP(S) URL, stdio for command-based, default to stdio), tool call request/response protocol, tool caching strategy with TTL invalidation, OAuth flow with 5-minute timeout, server logging with circular buffer (200 entries), sensitive field redaction logic, npx/uvx/bun fallback chain, DXT install/cleanup lifecycle, tool ID format (`serverId__toolName`), disabled tools filtering, cache invalidation on `list_changed` notifications
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Table` / `Modal` / `Switch` / `Form` components, styled-components wrappers

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
| (none specific to F006) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-core-platform | Log level for main process MCP server management |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F006-mcp-integration implements the Model Context Protocol (MCP) server lifecycle management and tool calling infrastructure. It manages MCP server instances with full lifecycle control (add, remove, start, stop, restart), supports 4 transport layers (stdio for local processes, SSE for legacy servers, streamableHTTP for modern servers, inMemory for built-in servers), handles tool discovery and caching with configurable TTLs, supports OAuth authentication for protected MCP servers (5-minute timeout with callback server), provides server logging with sensitive field redaction, and includes DXT (Desktop Extension) server management for packaged MCP servers. Tools discovered from MCP servers are made available to the AI chat system for function calling, with a composite ID format (`serverId__toolName`) ensuring global uniqueness.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | MCP server CRUD | User adds, removes, restarts, or stops MCP servers; server status updates in real-time |
| P1 | Tool calling | During chat, AI model requests a tool call; system routes the call to the appropriate MCP server with timeout enforcement (60s default, 10min long-running) and returns the result |
| P1 | Transport selection | System selects transport type based on 5 conditions (inMemory, SSE, streamableHTTP, stdio, default) |
| P2 | Client health check | System pings MCP server with 1000ms timeout; stale clients are cleaned up |
| P2 | Tool caching | System caches discovered tools (5min TTL), prompts (60min), and resources (60min); cache invalidated on server notifications |
| P2 | OAuth authentication | User authenticates with an OAuth-protected MCP server; 5-minute timeout enforced |
| P2 | DXT server management | User uploads, installs, and manages DXT packaged MCP servers |
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
- **FR-010**: DXT server management (upload, install, cleanup)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: MCP server starts and discovers tools within 5 seconds for stdio transport
- **SC-002**: Tool call execution completes and returns results within configured timeout (60s default)
- **SC-003**: Server lifecycle transitions (add -> start -> running -> stop -> remove) work correctly without orphaned processes
- **SC-004**: OAuth flow completes and stores tokens for subsequent authenticated tool calls within 5 minutes
- **SC-005**: Tool cache invalidates correctly on server restart and `list_changed` notifications
- **SC-006**: Health check detects stale clients within 1000ms and triggers reconnection
- **SC-007**: DXT packages install, configure, and clean up correctly on removal
- **SC-008**: npx/uvx fallback to bun activates seamlessly when primary runners are not found

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
- DXT package with invalid manifest; validation and cleanup on failure
- Bun proxy variable interference; automatic removal of HTTP_PROXY/HTTPS_PROXY when using bun runner

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process communication, file system access for DXT management, config persistence for MCP server settings |

### Related Entities (data-model.md draft)

#### Owned Entities

**MCPServer** (28+ fields, 4 types) -- Refer to E13 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique server identifier |
| name | string | required | Display name |
| description | string | optional | Server description |
| baseUrl | string | optional | Server URL (for SSE/HTTP types) |
| command | string | optional | Executable command (for stdio type) |
| args | string[] | optional | Command arguments (for stdio type) |
| env | Record<string, string> | optional | Environment variables |
| type | McpServerType | enum, required | `sse`, `streamableHttp`, `stdio`, `inMemory` |
| isActive | boolean | required | Whether server is currently active |
| provider | string | optional | Associated provider identifier |
| timeout | number | optional | Request timeout in ms (default 60000) |
| longRunning | boolean | default false | Enable extended timeout (10min) |
| disabledTools | string[] | optional | Tool names to disable |
| registryUrl | string | optional | Registry URL for discovery |
| autoApprove | string[] | optional | Tool names auto-approved for execution |
| headers | Record<string, string> | optional | Custom HTTP headers |
| dxtPath | string | optional | Path to DXT extension definition |

**MCPTool** (name, description, inputSchema, serverId) -- Refer to E14 in entity-registry.md

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
| IPC | ~8 additional channels | DXT management, OAuth, logging, health check |
| Zustand | `useMCPStore` | MCP server state management |
| Hook | `useMCPServers()` | React hook for MCP server state access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, process management, shell environment |
| IPC | `file:*` | F001-core-platform | File system access for DXT server configuration |
| IPC | `config:*` | F001-core-platform | Config get/set for MCP server persistence |

### Business Rules

This feature owns **17 business rules** (BR-011 through BR-027):

| Rule ID | Rule Name | Description |
|---------|-----------|-------------|
| BR-011 | Client health check | Ping with 1000ms timeout; unhealthy clients reconnected |
| BR-012 | Pending client dedup | Deduplicate in-flight connection requests for same server ID |
| BR-013 | Transport selection | 5 conditions determine transport type |
| BR-014 | npx fallback to bun | Automatic fallback when npx not found |
| BR-015 | uvx/uv fallback | Automatic fallback when uvx not found |
| BR-016 | Bun proxy removal | Remove HTTP proxy vars when using bun |
| BR-017 | NPM registry override | Inject custom NPM registry for npx/npm commands |
| BR-018 | OAuth authentication flow | 5-minute timeout, callback server |
| BR-019 | Tool call timeout | 60s default, 10min for long-running |
| BR-020 | Cache TTLs | tools=5min, prompts=60min, resources=60min, get=30min |
| BR-021 | Disabled tools filtering | Filter out disabled tools from tool list |
| BR-022 | Tool ID format | `{serverId}__{toolName}` composite key |
| BR-023 | Sensitive field redaction | Redact authorization/apiKey/token/secret/password/credential |
| BR-024 | Server log buffer | Circular buffer of 200 entries per server |
| BR-025 | Tool input/output schema validation | Zod-based validation before send and after receive |
| BR-026 | DXT server cleanup on removal | Clean up installed files and config on uninstall |
| BR-027 | Cache invalidation on notifications | `list_changed` notifications trigger immediate cache invalidation |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: MCP integration is primarily main process logic (server lifecycle, transport management, tool calling, OAuth, DXT management). The renderer side manages server configuration state via Redux slice and displays server status. Transport layers (stdio, SSE, StreamableHTTP, InMemory) are implemented in main process services. Tool caching with TTLs reduces discovery overhead. OAuth flow handles authenticated servers with callback server.
- **Recommended implementation approach**: Replace Redux `mcp` slice with Zustand store for renderer-side state. Replace Ant Design components in MCP settings UI with shadcn/ui equivalents (Form, List, Modal -> Dialog, Switch). Keep ALL main process logic intact (MCPService, transport layers, tool calling, OAuth, DXT) as it is entirely stack-independent.
- **Caveats**: Minimal migration impact since most MCP logic is in the main process (Node.js, no UI framework dependencies). Only the renderer-side state management (Redux -> Zustand) and settings UI (Ant Design -> shadcn/ui) need migration.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Tool listing for chat | F005-ai-chat | Verify F005 correctly calls mcp:list-tools to get available tools for function calling |
| Tool call execution | F005-ai-chat | Verify F005 correctly calls mcp:call-tool when AI model requests a tool call, and handles the result |
| Tool call block rendering | F005-ai-chat | Verify F005's MessageBlock (ToolBlock type) correctly displays MCP tool call results using `serverId__toolName` format |
| IPC channel availability | F001-core-platform | Verify F006's mcp:* IPC channels are registered in F001's IPC handler |
| Zustand store integration | F001-core-platform | Verify F006's MCP Zustand store integrates correctly with F001's store infrastructure |
| Agent tool execution | F012-agent-framework | Verify F012 correctly uses F006's tool calling API for agent tool execution |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If mcp:list-tools or mcp:call-tool IPC signatures change, F005's tool calling pipeline needs modification |
| F005-ai-chat | Entity change impact | If MCPTool schema changes, F005's tool call block rendering needs modification |
| F012-agent-framework | API change impact | If MCP server lifecycle or tool calling API changes, F012's agent tool execution needs modification |
| F008-settings-ui | Entity change impact | If MCPServer configuration schema changes, F008's MCP settings page needs modification |
