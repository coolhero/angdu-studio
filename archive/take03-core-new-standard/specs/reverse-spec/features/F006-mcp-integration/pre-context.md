# Pre-Context: MCP Integration

**Feature ID**: F006-mcp-integration
**Tier**: Tier 2
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/MCPService.ts` | Main process MCP service (server lifecycle management) |
| `src/main/services/mcp/` | All MCP sub-services (transport, tool execution, logging) |
| `src/main/mcpServers/` | All built-in MCP server implementations |
| `src/renderer/src/store/mcp.ts` | MCP Redux slice (source reference for state shape) |
| `src/renderer/src/hooks/useMCPServers.ts` | React hook for MCP server state access |
| `src/renderer/src/types/mcp.ts` | MCP type definitions (MCPServer, MCPTool, MCPPrompt, MCPResource) |
| `src/renderer/src/types/tool.ts` | Tool type definitions for function calling |
| `packages/shared/mcp.ts` | Shared MCP utilities and constants |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **MCP server lifecycle management, transport layer selection (stdio/SSE/StreamableHTTP/InMemory), tool calling protocol, tool caching patterns, OAuth authentication flow, server logging, and built-in MCP server implementations**
- Do not reference: Redux slice patterns in `mcp.ts` (migrating to Zustand), Ant Design components in MCP settings UI (migrating to shadcn/ui + Radix), styled-components in MCP pages (migrating to Tailwind-only)
- **Extract**: MCP server lifecycle state machine (add -> start -> running -> stop -> remove -> restart), transport layer factory pattern (stdio, SSE, StreamableHTTP, InMemory), tool call request/response protocol, tool caching strategy, OAuth flow for authenticated MCP servers, server logging pipeline, built-in MCP server registration
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Table` / `Modal` / `Switch` components, styled-components wrappers

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
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for renderer-side MCP state updates |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F006-mcp-integration implements the Model Context Protocol (MCP) server lifecycle management and tool calling infrastructure. It manages MCP server instances with full lifecycle control (add, remove, start, stop, restart), supports 4 transport layers (stdio for local processes, SSE for legacy servers, StreamableHTTP for modern servers, InMemory for built-in servers), handles tool discovery and caching, supports OAuth authentication for protected MCP servers, provides server logging, and includes built-in MCP server implementations. Tools discovered from MCP servers are made available to the AI chat system for function calling.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Add MCP server | User adds a new MCP server by specifying transport type, command/URL, and configuration; server starts and tools become available |
| P1 | Tool calling | During chat, AI model requests a tool call; system routes the call to the appropriate MCP server and returns the result |
| P1 | Server lifecycle | User starts, stops, or restarts an MCP server; server status updates in real-time |
| P2 | Transport selection | User selects transport type (stdio/SSE/StreamableHTTP) based on server type; system creates appropriate transport |
| P2 | Tool caching | System caches discovered tools from MCP servers to avoid repeated discovery calls |
| P2 | OAuth authentication | User authenticates with an OAuth-protected MCP server; tokens are stored and refreshed |
| P3 | Server logging | User views logs from MCP server interactions for debugging |
| P3 | Built-in servers | System provides built-in MCP servers (InMemory transport) for core functionality |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: MCP server lifecycle management (add, remove, start, stop, restart)
- **FR-002**: Tool calling protocol (discover tools, execute tool calls, return results)
- **FR-003**: Transport layer selection (stdio, SSE, StreamableHTTP, InMemory)
- **FR-004**: Tool caching for discovered tools with invalidation
- **FR-005**: OAuth authentication support for protected MCP servers
- **FR-006**: Server logging and debugging output

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: MCP server starts and discovers tools within 5 seconds for stdio transport
- **SC-002**: Tool call execution completes and returns results within 10 seconds for standard operations
- **SC-003**: Server lifecycle transitions (start -> running -> stop) work correctly without orphaned processes
- **SC-004**: OAuth flow completes and stores tokens for subsequent authenticated tool calls
- **SC-005**: Tool cache invalidates correctly when server restarts

### Edge Cases

- MCP server process crashes; automatic restart or graceful error reporting
- Tool call timeout; configurable timeout with graceful cancellation
- OAuth token refresh failure; re-authentication prompt
- Server with hundreds of tools; pagination or lazy loading of tool list
- Concurrent tool calls to the same server; queuing or parallel execution strategy
- Stdio server binary not found on PATH; clear error message with resolution guidance
- Network failure during SSE/StreamableHTTP transport; reconnection strategy
- Server returns malformed tool results; graceful error handling

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process communication, app:* channels for process management, file system access |

### Related Entities (data-model.md draft)

#### Owned Entities

**MCPServer** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique server identifier |
| name | string | required | Display name |
| type | string | required | Transport type (stdio, sse, streamablehttp, inmemory) |
| command | string | optional | Command to launch (stdio transport) |
| args | string[] | optional | Command arguments (stdio transport) |
| url | string | optional | Server URL (SSE/StreamableHTTP transport) |
| env | object | optional | Environment variables for the server process |
| enabled | boolean | required | Whether server is active |
| status | string | required | Server status (stopped, starting, running, error) |
| oauthConfig | object | optional | OAuth configuration for authenticated servers |

**MCPTool** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique tool identifier |
| serverId | string | FK -> MCPServer | Owning server ID |
| name | string | required | Tool name |
| description | string | optional | Tool description |
| inputSchema | object | required | JSON Schema for tool input parameters |

**MCPPrompt** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique prompt identifier |
| serverId | string | FK -> MCPServer | Owning server ID |
| name | string | required | Prompt name |
| description | string | optional | Prompt description |
| arguments | object | optional | Prompt arguments schema |

**MCPResource** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique resource identifier |
| serverId | string | FK -> MCPServer | Owning server ID |
| uri | string | required | Resource URI |
| name | string | required | Resource name |
| mimeType | string | optional | Resource MIME type |
| description | string | optional | Resource description |

**MCPConfig** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| servers | MCPServer[] | required | Configured MCP servers |
| globalTimeout | number | optional | Global tool call timeout in milliseconds |

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
| IPC | `mcp:list-tools` | List tools from a server (cached) |
| IPC | `mcp:call-tool` | Execute a tool call on a server |
| IPC | `mcp:list-prompts` | List prompts from a server |
| IPC | `mcp:list-resources` | List resources from a server |
| Zustand | `useMCPStore` | MCP server state management |
| Hook | `useMCPServers()` | React hook for MCP server state access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, process management, shell environment |
| IPC | `file:*` | F001-core-platform | File system access for server configuration |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: MCP integration is primarily main process logic (server lifecycle, transport management, tool calling). The renderer side manages server configuration state via Redux slice and displays server status. Transport layers (stdio, SSE, StreamableHTTP, InMemory) are implemented in main process services. Tool caching reduces discovery overhead. OAuth flow handles authenticated servers.
- **Recommended implementation approach**: Replace Redux `mcp` slice with Zustand store for renderer-side state. Replace Ant Design components in MCP settings UI with shadcn/ui equivalents. Keep ALL main process logic intact (MCPService, transport layers, tool calling, OAuth) as it is entirely stack-independent.
- **Caveats**: Minimal migration impact since most MCP logic is in the main process (Node.js, no UI framework dependencies). Only the renderer-side state management (Redux -> Zustand) and settings UI (Ant Design -> shadcn/ui) need migration.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Tool listing for chat | F005-ai-chat | Verify F005 correctly calls mcp:list-tools to get available tools for function calling |
| Tool call execution | F005-ai-chat | Verify F005 correctly calls mcp:call-tool when AI model requests a tool call, and handles the result |
| Tool call block rendering | F005-ai-chat | Verify F005's MessageBlock (tool_call type) correctly displays MCP tool call results |
| IPC channel availability | F001-core-platform | Verify F006's mcp:* IPC channels are registered in F001's IPC handler |
| Zustand store integration | F001-core-platform | Verify F006's MCP Zustand store integrates correctly with F001's store infrastructure |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If mcp:list-tools or mcp:call-tool IPC signatures change, F005's tool calling pipeline needs modification |
| F005-ai-chat | Entity change impact | If MCPTool schema changes, F005's tool call block rendering needs modification |
| F012-agent-framework | API change impact | If MCP server lifecycle or tool calling API changes, F012's agent tool execution needs modification |
| F008-settings-ui | Entity change impact | If MCPServer configuration schema changes, F008's MCP settings page needs modification |
