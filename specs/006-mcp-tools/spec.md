# Feature Specification: MCP Tools

**Feature Branch**: `006-mcp-tools`
**Created**: 2026-03-10
**Status**: Draft
**Input**: MCP (Model Context Protocol) integration providing server lifecycle management, tool execution, built-in servers, DXT package support, OAuth authentication, tool permission management, and marketplace for discovering MCP servers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Connect an MCP Server (Priority: P1)

A user wants to extend the AI assistant's capabilities by connecting an external MCP server. They navigate to MCP settings, click "Add Server", enter the server's stdio command (e.g., `npx @modelcontextprotocol/server-filesystem /path/to/dir`), and the server connects automatically. The server's available tools appear in the tools tab, ready for use in chat.

**Why this priority**: Core functionality — without connecting servers, no MCP tools are available. This is the entry point for the entire MCP feature.

**Independent Test**: Can be tested by adding a stdio-based MCP server and verifying tools are listed in the settings UI.

**Acceptance Scenarios**:

1. **Given** the user is on the MCP settings page, **When** they click "Add Server" and enter a valid stdio command, **Then** the server connects and its tools appear in the tools tab within 5 seconds.
2. **Given** the user is on the MCP settings page, **When** they enter an invalid command, **Then** an error message is displayed indicating the connection failure.
3. **Given** the user has an SSE-based MCP server URL, **When** they select "SSE" transport type and enter the URL, **Then** the server connects via Server-Sent Events.
4. **Given** the user has a StreamableHTTP MCP server, **When** they configure the HTTP endpoint, **Then** the server connects via HTTP streaming.

---

### User Story 2 - Execute MCP Tools in Chat (Priority: P1)

During a chat conversation with an AI assistant, the AI determines that an MCP tool is needed (e.g., reading a file, searching the web). The tool call is executed against the connected MCP server, and the result is displayed inline in the chat stream. The user can see what tool was called, with what arguments, and the result.

**Why this priority**: This is the primary value proposition — MCP tools extend AI capabilities. Without execution, connected servers serve no purpose.

**Independent Test**: Can be tested by sending a chat message that triggers a tool call and verifying the result appears in the conversation.

**Acceptance Scenarios**:

1. **Given** an active MCP server with tools, **When** the AI decides to call a tool during streaming, **Then** the tool executes and results display inline in the response.
2. **Given** a tool call is in progress, **When** the user clicks abort, **Then** the tool call is cancelled and a cancellation notice is shown.
3. **Given** a tool call exceeds the configured timeout, **Then** the call is aborted and a timeout error is displayed.

---

### User Story 3 - Manage Tool Permissions (Priority: P1)

A user wants control over which tools the AI can use. They open the MCP server's detail page, view the tools tab, and can enable/disable individual tools. They can also configure auto-approve for trusted tools so they execute without permission prompts, or require manual approval for sensitive tools.

**Why this priority**: Security-critical — users must be able to control what actions the AI can take on their behalf.

**Independent Test**: Can be tested by toggling tool permissions and verifying the AI respects the enabled/disabled state.

**Acceptance Scenarios**:

1. **Given** a server with multiple tools, **When** the user disables a specific tool, **Then** that tool is excluded from the AI's available tools listing.
2. **Given** an untrusted server, **When** the user tries to enable it, **Then** a trust verification dialog appears requiring explicit confirmation.
3. **Given** a tool with auto-approve enabled, **When** the AI calls that tool, **Then** it executes without a permission prompt.
4. **Given** a tool without auto-approve, **When** the AI calls that tool, **Then** a permission request appears for the user to approve or deny.

---

### User Story 4 - Use Built-in MCP Servers (Priority: P2)

The application comes with pre-installed built-in MCP servers (filesystem, fetch, memory, sequential-thinking, brave-search, etc.). The user navigates to the built-in servers section, enables the ones they want, and they become available immediately without installing anything externally (except Python runtime for the Python server).

**Why this priority**: Built-in servers provide immediate value without requiring external server setup.

**Independent Test**: Can be tested by enabling a built-in server (e.g., filesystem) and verifying its tools become available.

**Acceptance Scenarios**:

1. **Given** the built-in servers listing page, **When** the user enables the filesystem server, **Then** it starts via in-memory transport and its tools (read, write, list, search) appear.
2. **Given** the Python built-in server, **When** the user enables it without Python installed, **Then** a clear error message indicates Python runtime is required.
3. **Given** a built-in server is running, **When** the user disables it, **Then** the server stops and its tools are removed from the available tools list.

---

### User Story 5 - Install DXT Packages (Priority: P2)

A user has a `.dxt` (Desktop Extension) package file for an MCP server. They upload it through the MCP settings UI, the package is extracted and installed, and the server becomes available without restarting the application.

**Why this priority**: DXT packages enable easy distribution and installation of third-party MCP servers.

**Independent Test**: Can be tested by uploading a valid DXT file and verifying the server appears in the server list.

**Acceptance Scenarios**:

1. **Given** the user has a valid `.dxt` file, **When** they upload it via the add server dialog, **Then** the server is installed and appears in the server list.
2. **Given** the user uploads an invalid or corrupted `.dxt` file, **When** the upload completes, **Then** an error message describes the issue.
3. **Given** a DXT server is installed, **When** the user starts it, **Then** it operates using the configuration from the DXT package.

---

### User Story 6 - Browse MCP Marketplace (Priority: P2)

A user wants to discover new MCP servers. They open the marketplace section, browse available servers by category, read descriptions, and install servers directly from the marketplace. They can also search for NPX/UV packages to install MCP servers.

**Why this priority**: Marketplace enables discovery of new capabilities, expanding the ecosystem value.

**Independent Test**: Can be tested by browsing the marketplace listing and installing a server from it.

**Acceptance Scenarios**:

1. **Given** the marketplace page, **When** the user browses available servers, **Then** servers are displayed with name, description, and install action.
2. **Given** the NPX search page, **When** the user searches for an MCP server package, **Then** matching npm packages are displayed with install buttons.
3. **Given** a marketplace server entry, **When** the user clicks install, **Then** the server is configured and added to the server list.

---

### User Story 7 - View Server Logs (Priority: P3)

A user encounters an issue with an MCP server and wants to debug it. They open the server's detail page and access the log viewer, which shows real-time log entries from the server including timestamps, severity levels, and messages.

**Why this priority**: Debugging capability — important for power users and troubleshooting but not needed for core functionality.

**Independent Test**: Can be tested by viewing logs from a running server and verifying real-time updates appear.

**Acceptance Scenarios**:

1. **Given** a running MCP server, **When** the user opens the log viewer, **Then** existing log entries are displayed with timestamps and severity.
2. **Given** the log viewer is open, **When** the server emits new log entries, **Then** they appear in real-time without manual refresh.
3. **Given** a server has emitted more than 200 log entries, **Then** only the most recent 200 are retained (ring buffer).

---

### User Story 8 - Configure MCP Server Settings (Priority: P2)

A user wants to configure an MCP server's connection details and behavior. They open the server's settings page with a form containing name, description, transport type, connection parameters (command/URL), arguments, environment variables, HTTP headers, timeout, and advanced options like provider URL and logo.

**Why this priority**: Configuration management is essential for servers to function correctly with different setups.

**Independent Test**: Can be tested by modifying server settings and verifying the changes take effect.

**Acceptance Scenarios**:

1. **Given** the server settings form, **When** the user changes the timeout value and saves, **Then** the new timeout applies to subsequent tool calls.
2. **Given** a stdio server, **When** the user modifies environment variables, **Then** the server restarts with the new environment.
3. **Given** the server detail page, **When** the user navigates between tabs (settings, tools, prompts, resources), **Then** each tab displays the relevant content.

---

### Edge Cases

- What happens when an MCP server crashes during a tool call? — The system detects the disconnection, shows an error for the in-progress call, and offers reconnection.
- What happens when the network drops during an SSE connection? — The system detects the connection loss and attempts auto-reconnect.
- What happens when two tool calls target the same server simultaneously? — Both calls are dispatched; the MCP protocol handles concurrent requests.
- What happens when a server's stdio process exits unexpectedly? — The system marks the server as disconnected and notifies the user.
- What happens when the user deletes a server while tools from it are in-flight? — In-flight calls are aborted before the server is removed.
- What happens when the shell environment cannot be resolved for a stdio command? — A clear error indicates the shell resolution failure with guidance.
- What happens when OAuth token expires during an SSE connection? — The system initiates token refresh or prompts re-authentication.

## Requirements *(mandatory)*

### Functional Requirements

**Server Connection & Transport**
- **FR-001**: System MUST connect to MCP servers via stdio transport by spawning a local process with the specified command and arguments [source: B111]
- **FR-002**: System MUST connect to MCP servers via SSE (Server-Sent Events) transport using an HTTP endpoint URL with optional headers [source: B112]
- **FR-003**: System MUST connect to MCP servers via StreamableHTTP transport for HTTP-based streaming connections [source: B113]
- **FR-004**: System MUST connect to built-in MCP servers via InMemoryTransport for zero-latency local communication [source: B114]
- **FR-005**: System MUST resolve the user's login shell environment before executing stdio commands, ensuring PATH and other variables are available [source: B138]

**Tool Discovery & Execution**
- **FR-006**: System MUST list all available tools from a connected MCP server, displaying name, description, and input schema [source: B115]
- **FR-007**: System MUST execute MCP tool calls with JSON-serialized arguments, configurable timeout (default 60s), and progress event support [source: B116]
- **FR-008**: System MUST support aborting in-progress tool calls by call ID via AbortController [source: B117]
- **FR-009**: System MUST aggregate tools from all active servers using a hub pattern, with tool IDs in `serverId__toolName` format [source: B115, BL-026]
- **FR-010**: System MUST filter disabled tools from the aggregated tool listing per server's `disabledTools` configuration [source: B130]
- **FR-011**: System MUST redact sensitive fields (authorization, apiKey, token, access_token) from tool call arguments before logging [source: BL-026]

**Server Lifecycle**
- **FR-012**: System MUST manage MCP server lifecycle including start, stop, and restart operations [source: B118]
- **FR-013**: System MUST perform connection health checks using ping with a 1-second timeout to detect stale connections [source: B129, BL-025]
- **FR-014**: System MUST automatically reconnect when a transport failure is detected [source: B118]
- **FR-015**: System MUST handle pending connection deduplication to prevent race conditions when multiple init requests target the same server [source: BL-025]
- **FR-016**: System MUST gracefully cleanup all MCP client connections on application quit [source: B137]

**Tool Permissions**
- **FR-017**: System MUST allow users to enable or disable individual tools per server via a `disabledTools` list [source: B130]
- **FR-018**: System MUST support per-tool auto-approve configuration via `disabledAutoApproveTools`, where approved tools execute without user permission prompts [source: B131]
- **FR-019**: System MUST require trust verification (explicit user confirmation with trust flag and timestamp) before enabling untrusted servers [source: B132]
- **FR-020**: System MUST implement a permission request state machine: pending → submitting-allow/deny → invoking (on allow) or removal (on deny), with FIFO ordering [source: BL-027]

**Built-in Servers**
- **FR-021**: System MUST provide built-in MCP servers via an in-memory transport factory, including: filesystem (file read/write/list/search), fetch (HTTP requests), memory (conversation memory), sequential-thinking (reasoning), brave-search (web search), browser (web automation), python (code execution), dify-knowledge (Dify integration), and didi-mcp [source: B119, B120, B121, B122]
- **FR-022**: System MUST use `@angdu/` namespace for all built-in server names (e.g., `@angdu/filesystem`, `@angdu/memory`) [source: naming remapping]

**MCP Protocol Features**
- **FR-023**: System MUST list prompts from MCP servers, displaying name, description, and arguments [source: B126]
- **FR-024**: System MUST retrieve prompt content from MCP servers by name with arguments [source: B127]
- **FR-025**: System MUST list and read resources from MCP servers by URI [source: B128]
- **FR-026**: System MUST handle MCP notification subscriptions for tool list changes, prompt list changes, resource list changes, resource updates, logging messages, and cancellations [source: B139]

**Server Configuration & UI**
- **FR-027**: System MUST allow users to add MCP servers via: stdio command, SSE URL, JSON configuration, or DXT package upload [source: B133]
- **FR-028**: System MUST display a server list with search, drag-and-drop reorder, and per-server enable/disable toggles [source: B133, B140]
- **FR-029**: System MUST provide a server detail page with tabs for settings (configuration form), tools, prompts, resources, and description [source: B133]
- **FR-030**: System MUST support DXT (Desktop Extension) package upload and installation for MCP servers [source: B123]

**Logging**
- **FR-031**: System MUST buffer server log entries in a per-server ring buffer capped at 200 entries, forwarding them to the UI in real-time via IPC [source: B125, BL-028]

**OAuth**
- **FR-032**: System MUST handle MCP OAuth authentication flows for SSE and StreamableHTTP server connections [source: B124]

**Marketplace & Discovery**
- **FR-033**: System MUST provide a marketplace browser for discovering and installing MCP servers [source: B134]
- **FR-034**: System MUST provide NPX/UV package search for finding and installing MCP server packages [source: B135]

### Key Entities

- **MCPServer**: Represents a configured MCP server with connection parameters (transport type, command/URL, args, env, headers), metadata (name, description, logo, provider, tags), state (active, trusted, installed timestamp), and permission configuration (disabled tools, auto-approve settings).
- **MCPTool**: A tool exposed by an MCP server with name, description, input schema, and reference to its parent server.
- **MCPPrompt**: A prompt template exposed by an MCP server with name, description, and typed arguments.
- **MCPResource**: A resource exposed by an MCP server with URI, name, description, and MIME type.
- **MCPToolResponse**: Tracks the lifecycle of a tool call including status (pending/streaming/invoking/done/error/cancelled), arguments, partial arguments during streaming, and the final response.
- **ToolPermissionRequest**: A pending permission request with request ID, tool details, input preview, auto-approve flag, and expiration time.
- **ServerLogEntry**: A log entry with timestamp, severity level, message content, and optional structured data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add and connect an MCP server (stdio, SSE, or HTTP) and see its tools listed within 5 seconds of configuration.
- **SC-002**: Tool call results appear inline in the chat stream during an active AI conversation, with no more than 2 seconds of additional latency beyond the tool's own execution time.
- **SC-003**: Built-in MCP servers (filesystem, fetch, memory) start and list their tools without requiring any external software installation.
- **SC-004**: Server logs stream to the log viewer in real-time, with new entries appearing within 1 second of being emitted by the server.
- **SC-005**: DXT package uploads result in the server appearing in the server list and being startable without application restart.
- **SC-006**: Disabled tools are completely excluded from the AI's available tools, preventing any execution of disabled tools.
- **SC-007**: The MCP settings page loads the server list with search, reorder, and toggle functionality within 1 second.
- **SC-008**: Users can browse the MCP marketplace, view server descriptions, and initiate installation from the listing.
- **SC-009**: Auto-approved tools execute without any user interaction; non-approved tools always show a permission prompt before execution.
- **SC-010**: Server detail page displays all tabs (settings, tools, prompts, resources, logs) with accurate, current data for the selected server.

## Scope

### In Scope

- MCP server connection management (all 4 transport types)
- Tool discovery, execution, and abort
- Built-in MCP servers (9 types with `@angdu/` namespace)
- DXT package installation
- Tool-level permissions (enable/disable, auto-approve, trust verification)
- Permission request state machine (approve/deny flow)
- MCP prompts and resources listing/retrieval
- Server lifecycle management (start/stop/restart/health check/auto-reconnect)
- Server configuration UI (settings form, server list, detail page)
- Server log buffering and real-time streaming to UI
- MCP OAuth authentication for SSE/HTTP servers
- Marketplace browser and NPX/UV package search
- MCP notification subscription handling
- Shell environment resolution for stdio commands
- Drag-and-drop server reordering
- Sensitive field redaction in tool call logs
- `@angdu/` identity namespace (remapped from `@cherry/`)

### Out of Scope

- Chat UI rendering of tool results (owned by F005-chat-ui)
- AI request pipeline tool injection (owned by F002-ai-provider)
- Tool result storage as MessageBlocks (owned by F003-chat-core)
- Agent-specific MCP tool management (owned by F009-agents)
- Provider-specific MCP server configurations (ModelScope, TokenFlux, Lanyun, etc.) — deferred to future iteration
- MCP server sync across devices
- Custom MCP server SDK/framework for building new servers

### Assumptions

- The `@modelcontextprotocol/sdk` npm package provides the MCP client implementation and transport classes.
- The IPC bridge from F001 is available for all `mcp.*` channel communications.
- The AI provider pipeline from F002 supports injecting external tools (MCP tools) into the request.
- Built-in server implementations are self-contained Node.js modules bundled with the application.
- The MCP marketplace has a publicly accessible API or registry for server discovery.
- DXT packages follow a standard format with manifest, server code, and configuration samples.

### Dependencies

- **F001 (app-core)**: IPC bridge for renderer↔main communication, protocol handler for `angdu-studio://mcp-install` deep links, proxy settings for HTTP-based transports, graceful shutdown coordination.
- **F002 (ai-provider)**: Tool-calling pipeline integration for injecting MCP tools into AI requests, model capability detection for function-calling support.
