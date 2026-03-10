# Tasks: MCP Tools

**Input**: Design documents from `/specs/006-mcp-tools/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ipc-channels.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: MCP type definitions, IPC channel declarations, and shared constants

- [ ] T001 [P] Define shared MCP type interfaces (MCPServer, MCPTool, MCPPrompt, MCPResource, MCPToolResponse, MCPToolResultContent, MCPToolResponseStatus, McpServerType, MCPServerInstallSource, MCPConfigSample) in `src/shared/types/mcp.ts`
- [ ] T002 [P] Define BuiltinMCPServerNames constant with `@angdu/` namespace (memory, sequentialthinking, brave-search, fetch, filesystem, dify-knowledge, python, didi-mcp, browser, hub, mcp-auto-install, nowledge-mem) in `src/shared/types/mcp.ts`
- [ ] T003 [P] Add MCP IPC channel names to shared IpcChannel enum — 16 mcp:* channels, 5 code-tools:* channels, 1 python:* channel in `src/shared/types/ipc.ts`
- [ ] T004 [P] Define renderer-side MCP types (ToolPermissionRequest, PermissionStatus, PermissionUpdate, ServerLogEntry) in `src/renderer/src/types/mcp.ts`

**Checkpoint**: All types defined — implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core MCPService singleton and ServerLogBuffer — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement MCPService singleton class scaffold in `src/main/services/MCPService.ts` — constructor, private client Map, private pendingClients Map, private activeToolCalls Map, singleton getter, cleanup method
- [ ] T006 Implement transport factory in MCPService — createTransport() method supporting stdio (StdioClientTransport), SSE (SSEClientTransport), StreamableHTTP (StreamableHTTPClientTransport), InMemory (InMemoryTransport) in `src/main/services/MCPService.ts`
- [ ] T007 Implement shell environment resolution for stdio transport — resolve user's login shell env (PATH, NVM_DIR, PYENV_ROOT) before spawning stdio processes, handle macOS/Linux/Windows in `src/main/services/MCPService.ts`
- [ ] T008 Implement initClient() in MCPService — pending connection dedup via pendingClients Map, transport creation, client.connect(), ping health check (1s timeout), MCP notification handler registration in `src/main/services/MCPService.ts`
- [ ] T009 Implement callTool() in MCPService — timeout handling, AbortController per callId, progress event forwarding via IPC, sensitive field redaction (authorization, apiKey, token, access_token, secret) in `src/main/services/MCPService.ts`
- [ ] T010 Implement abortTool() in MCPService — lookup AbortController by callId, abort, cleanup from activeToolCalls Map in `src/main/services/MCPService.ts`
- [ ] T011 Implement listTools(), listPrompts(), getPrompt(), listResources(), readResource() in MCPService in `src/main/services/MCPService.ts`
- [ ] T012 Implement getServerVersion(), checkConnectivity() in MCPService in `src/main/services/MCPService.ts`
- [ ] T013 Implement MCP notification handlers — tool/prompt/resource list changes, logging messages, cancellation notifications in `src/main/services/MCPService.ts`
- [ ] T014 Implement app quit cleanup — disconnect all clients, abort all active tool calls, clear maps in `src/main/services/MCPService.ts`
- [ ] T015 Implement ServerLogBuffer class — per-server ring buffer (200 entries), addLog(), getServerLogs(), clear(), IPC forwarding to renderer in `src/main/services/mcp/ServerLogBuffer.ts`
- [ ] T016 Implement unit tests for MCPService core methods (initClient, callTool, abortTool, cleanup) in `tests/unit/main/mcp-service.test.ts`
- [ ] T017 [P] Implement unit tests for ServerLogBuffer (ring buffer behavior, 200-entry cap, getServerLogs) in `tests/unit/main/server-log-buffer.test.ts`

**Checkpoint**: Foundation ready — MCPService singleton functional, log buffer operational

---

## Phase 3: User Story 1 — Add and Connect an MCP Server (Priority: P1) 🎯 MVP

**Goal**: Users can add MCP servers via UI (stdio/SSE/HTTP/JSON) and see connected servers with tools listed

**Independent Test**: Add a stdio-based MCP server and verify tools appear in the settings UI

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement useMCPStore Zustand store — servers array, CRUD actions (addServer, updateServer, deleteServer, setServers, setServerActive), package manager tracking (isUvInstalled, isBunInstalled), electron-store persistence via IPC in `src/renderer/src/stores/useMCPStore.ts`
- [ ] T019 [P] [US1] Implement unit tests for useMCPStore (CRUD operations, active toggle, selectors) in `tests/unit/stores/useMCPStore.test.ts`
- [ ] T020 [US1] Register MCP IPC handlers in mcp-handlers.ts — wire mcp:restart-server, mcp:stop-server, mcp:remove-server, mcp:list-tools, mcp:call-tool, mcp:abort-tool, mcp:list-prompts, mcp:get-prompt, mcp:list-resources, mcp:get-resource, mcp:get-server-version, mcp:get-server-logs, mcp:check-connectivity, mcp:upload-dxt to MCPService methods in `src/main/ipc/mcp-handlers.ts`
- [ ] T021 [US1] Add preload API surface for window.api.mcp — expose all 16 MCP IPC methods via contextBridge in `src/preload/index.ts`
- [ ] T022 [US1] Implement useMCPServers hook — wraps store actions with IPC calls (addServer triggers mcp:restart-server, removeServer triggers mcp:remove-server, toggleActive triggers mcp:restart-server/mcp:stop-server) in `src/renderer/src/hooks/useMCPServers.ts`
- [ ] T023 [P] [US1] Implement MCPSettings/index.tsx — router layout with sidebar showing server list and main content area for selected server detail in `src/renderer/src/pages/settings/MCPSettings/index.tsx`
- [ ] T024 [P] [US1] Implement McpServerCard.tsx — server card with name, status indicator (connecting/connected/error/inactive), enable/disable Switch in `src/renderer/src/pages/settings/MCPSettings/McpServerCard.tsx`
- [ ] T025 [US1] Implement McpServersList.tsx — server list with search input, DnD reorder (@hello-pangea/dnd DragDropContext/Droppable/Draggable), "Add Server" button in `src/renderer/src/pages/settings/MCPSettings/McpServersList.tsx`
- [ ] T026 [US1] Implement AddMcpServerModal.tsx — Dialog with tabs: stdio command input, SSE URL input, JSON config textarea, DXT file upload. Form via react-hook-form + zod validation in `src/renderer/src/pages/settings/MCPSettings/AddMcpServerModal.tsx`
- [ ] T027 [US1] Implement McpSettings.tsx — server detail page with Tabs component (settings, tools, prompts, resources, description). Settings tab: react-hook-form with fields for name, type, command/baseUrl, args, env (key-value pairs), headers (key-value pairs), timeout in `src/renderer/src/pages/settings/MCPSettings/McpSettings.tsx`
- [ ] T028 [US1] Implement EditMcpJsonPopup.tsx — Dialog with JSON editor textarea for raw server config editing in `src/renderer/src/pages/settings/MCPSettings/EditMcpJsonPopup.tsx`
- [ ] T029 [US1] Add MCP settings navigation entry to F004 settings layout — add "MCP Servers" tab to settings sidebar in `src/renderer/src/pages/settings/SettingsPage.tsx`
- [ ] T030 [US1] Add i18n keys for MCP server management UI (add/edit/delete/connect/disconnect, form labels, status messages, error messages) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Users can add, list, search, reorder, enable/disable MCP servers. MVP complete.

---

## Phase 4: User Story 2 — Execute MCP Tools in Chat (Priority: P1)

**Goal**: AI can call MCP tools during chat, results display inline, abort supported

**Independent Test**: Send a chat message triggering a tool call, verify result appears in conversation

### Implementation for User Story 2

- [ ] T031 [US2] Implement hub aggregation logic — collect tools from all active servers, format tool IDs as `serverId__toolName`, filter disabled tools per disabledTools config in MCPService in `src/main/services/MCPService.ts`
- [ ] T032 [US2] Wire MCP tool injection into F002 AI provider middleware pipeline — register MCP tools with the AI SDK tool system, handle tool call/result lifecycle in `src/main/services/MCPService.ts` (integration point with F002)
- [ ] T033 [US2] Implement IPC event forwarding for mcp:progress — emit progress events from MCPService to renderer during tool execution in `src/main/ipc/mcp-handlers.ts`
- [ ] T034 [US2] Add i18n keys for tool execution UI (tool call progress, abort, timeout, error messages) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: AI can discover and execute MCP tools during chat, with progress and abort

---

## Phase 5: User Story 3 — Manage Tool Permissions (Priority: P1)

**Goal**: Users can enable/disable tools, configure auto-approve, trust verification for untrusted servers

**Independent Test**: Toggle tool permissions and verify the AI respects enabled/disabled state

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement useToolPermissionStore Zustand store — requests array, addRequest, allowRequest, denyRequest, submissionFailed, clearAll actions, getActivePermission selector (FIFO), getRequestByToolCallId selector in `src/renderer/src/stores/useToolPermissionStore.ts`
- [ ] T036 [P] [US3] Implement unit tests for useToolPermissionStore (state machine: pending → submitting-allow/deny → invoking, FIFO ordering) in `tests/unit/stores/useToolPermissionStore.test.ts`
- [ ] T037 [US3] Implement McpTool.tsx — tool viewer with name, description, input schema display (collapsible JSON), enable/disable Switch, auto-approve Switch in `src/renderer/src/pages/settings/MCPSettings/McpTool.tsx`
- [ ] T038 [US3] Implement useMCPServerTrust hook — trust verification dialog logic, updates server with isTrusted=true and trustedAt timestamp on confirmation in `src/renderer/src/hooks/useMCPServerTrust.ts`
- [ ] T039 [US3] Wire tool permission checks into tool execution flow — check disabledTools before execution, check disabledAutoApproveTools to determine if permission prompt needed in `src/main/services/MCPService.ts`
- [ ] T040 [US3] Add i18n keys for permission UI (approve/deny buttons, trust dialog, tool enable/disable labels) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Tool permissions (enable/disable, auto-approve, trust) fully functional

---

## Phase 6: User Story 4 — Use Built-in MCP Servers (Priority: P2)

**Goal**: Pre-installed built-in servers available immediately via in-memory transport

**Independent Test**: Enable filesystem built-in server, verify its tools appear

### Implementation for User Story 4

- [ ] T041 [US4] Implement createInMemoryMCPServer() factory — creates InMemoryTransport pairs, connects MCP Server to Client, returns transport pair in `src/main/mcpServers/factory.ts`
- [ ] T042 [P] [US4] Implement @angdu/filesystem built-in server — file read, write, list, search, move, get info tools in `src/main/mcpServers/filesystem/index.ts`
- [ ] T043 [P] [US4] Implement @angdu/fetch built-in server — HTTP GET/POST with proxy support in `src/main/mcpServers/fetch.ts`
- [ ] T044 [P] [US4] Implement @angdu/memory built-in server — conversation memory storage and retrieval in `src/main/mcpServers/memory.ts`
- [ ] T045 [P] [US4] Implement @angdu/sequentialthinking built-in server — step-by-step reasoning tool in `src/main/mcpServers/sequentialthinking.ts`
- [ ] T046 [P] [US4] Implement @angdu/brave-search built-in server — web search via Brave Search API in `src/main/mcpServers/brave-search.ts`
- [ ] T047 [P] [US4] Implement @angdu/browser built-in server — web automation tools in `src/main/mcpServers/browser/index.ts`
- [ ] T048 [P] [US4] Implement @angdu/python built-in server — Python code execution tool in `src/main/mcpServers/python.ts`
- [ ] T049 [P] [US4] Implement @angdu/dify-knowledge built-in server — Dify knowledge base integration in `src/main/mcpServers/dify-knowledge.ts`
- [ ] T050 [P] [US4] Implement @angdu/didi-mcp built-in server in `src/main/mcpServers/didi-mcp.ts`
- [ ] T051 [P] [US4] Implement @angdu/hub built-in server — tool aggregation hub with toolname resolution in `src/main/mcpServers/hub/index.ts` and `src/main/mcpServers/hub/toolname.ts`
- [ ] T052 [US4] Implement BuiltinMCPServerList.tsx — built-in server listing with name, description, enable/disable buttons per server in `src/renderer/src/pages/settings/MCPSettings/BuiltinMCPServerList.tsx`
- [ ] T053 [US4] Register code-tools:* IPC handlers (run, get-available-terminals, set/get/remove-custom-terminal-path) and python:execute handler in `src/main/ipc/mcp-handlers.ts`
- [ ] T054 [US4] Add i18n keys for built-in server names and descriptions (ko + en) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Built-in servers (filesystem, fetch, memory, etc.) start and list tools without external installs

---

## Phase 7: User Story 5 — Install DXT Packages (Priority: P2)

**Goal**: Users can upload .dxt packages to install MCP servers

**Independent Test**: Upload a valid DXT file, verify server appears in list

### Implementation for User Story 5

- [ ] T055 [US5] Implement DxtService — upload (ArrayBuffer + fileName), extract (.dxt → directory), validate manifest, register as MCPServer, cleanup on uninstall in `src/main/services/DxtService.ts`
- [ ] T056 [US5] Wire mcp:upload-dxt IPC handler to DxtService in `src/main/ipc/mcp-handlers.ts`
- [ ] T057 [US5] Add DXT upload tab to AddMcpServerModal.tsx — file input for .dxt, upload progress, error handling in `src/renderer/src/pages/settings/MCPSettings/AddMcpServerModal.tsx`
- [ ] T058 [US5] Add i18n keys for DXT upload UI (upload, progress, success, error messages) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: DXT package upload and installation working

---

## Phase 8: User Story 6 — Browse MCP Marketplace (Priority: P2)

**Goal**: Users can discover and install MCP servers from marketplace and NPX search

**Independent Test**: Browse marketplace, install a server from listing

### Implementation for User Story 6

- [ ] T059 [P] [US6] Implement McpMarketList.tsx — marketplace browser with server cards (name, description, logo, install button), category filtering in `src/renderer/src/pages/settings/MCPSettings/McpMarketList.tsx`
- [ ] T060 [P] [US6] Implement NpxSearch.tsx — NPX/UV package search with search input, results list, install buttons in `src/renderer/src/pages/settings/MCPSettings/NpxSearch.tsx`
- [ ] T061 [P] [US6] Implement InstallNpxUv.tsx — install helper dialog for npx/uvx package installation with command preview in `src/renderer/src/pages/settings/MCPSettings/InstallNpxUv.tsx`
- [ ] T062 [US6] Implement McpDescription.tsx — server description display for marketplace entries in `src/renderer/src/pages/settings/MCPSettings/McpDescription.tsx`
- [ ] T063 [US6] Add i18n keys for marketplace UI (browse, search, install, categories) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Marketplace browsing and NPX search functional

---

## Phase 9: User Story 7 — View Server Logs (Priority: P3)

**Goal**: Real-time log viewer for debugging MCP server issues

**Independent Test**: View logs from a running server, verify real-time updates

### Implementation for User Story 7

- [ ] T064 [US7] Implement LogViewerDialog.tsx — Dialog with real-time log list, auto-scroll to bottom, timestamp formatting, severity level badges (debug/info/warn/error), throttled DOM updates in `src/renderer/src/pages/settings/MCPSettings/LogViewerDialog.tsx`
- [ ] T065 [US7] Wire mcp:server-log IPC event listener in LogViewerDialog — subscribe on mount, unsubscribe on unmount, append new entries in `src/renderer/src/pages/settings/MCPSettings/LogViewerDialog.tsx`
- [ ] T066 [US7] Add i18n keys for log viewer UI (log levels, timestamps, clear, close) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Log viewer shows real-time server logs with auto-scroll

---

## Phase 10: User Story 8 — Configure MCP Server Settings (Priority: P2)

**Goal**: Full server configuration form with all connection parameters

**Independent Test**: Modify server settings and verify changes take effect

### Implementation for User Story 8

- [ ] T067 [US8] Implement McpPrompt.tsx — prompt viewer with name, description, arguments list (name, type, required flag) in `src/renderer/src/pages/settings/MCPSettings/McpPrompt.tsx`
- [ ] T068 [US8] Implement McpResource.tsx — resource viewer with URI, name, description, MIME type in `src/renderer/src/pages/settings/MCPSettings/McpResource.tsx`
- [ ] T069 [US8] Add MCP REST API routes — GET /v1/mcps (list servers), GET /v1/mcps/:server_id (server detail), ALL /v1/mcps/:server_id/mcp (MCP JSON-RPC proxy) in `src/main/services/MCPService.ts` or dedicated route handler
- [ ] T070 [US8] Add i18n keys for server settings form (field labels, validation messages, tab names) in `src/renderer/src/i18n/locales/en.json` and `src/renderer/src/i18n/locales/ko.json`

**Checkpoint**: Full server configuration with prompts/resources viewer

---

## Phase 11: OAuth Authentication (Priority: P2)

**Purpose**: OAuth flows for authenticated SSE/HTTP MCP servers

- [ ] T071 Implement MCP OAuth client provider — OAuthClientProvider interface implementation for SSE/HTTP authenticated connections in `src/main/services/mcp/oauth/provider.ts`
- [ ] T072 Implement OAuth callback server — local HTTP server for redirect URI, auth code exchange, token storage in `src/main/services/mcp/oauth/callback.ts`
- [ ] T073 Wire OAuth transport option into MCPService initClient() — detect OAuth requirement, initiate OAuth flow before transport creation in `src/main/services/MCPService.ts`

**Checkpoint**: OAuth authentication flow working for SSE/HTTP servers

---

## Phase 12: MCP Notification Subscriptions

**Purpose**: Handle MCP protocol notification events

- [ ] T074 Implement mcp:servers-changed and mcp:servers-updated IPC event forwarding — emit to renderer when server list or status changes in `src/main/ipc/mcp-handlers.ts`
- [ ] T075 Wire IPC event listeners in renderer — subscribe to mcp:servers-changed, mcp:servers-updated, mcp:progress in useMCPServers hook, update store accordingly in `src/renderer/src/hooks/useMCPServers.ts`

**Checkpoint**: Real-time server status updates propagate to UI

---

## Phase 13: Integration & Demo

**Purpose**: Cross-feature integration, pattern audit, and demo script

- [ ] T076 [P] Implement IPC handler unit tests (handler registration, MCPService method wiring) in `tests/unit/main/mcp-handlers.test.ts`
- [ ] T077 Pattern Audit: verify all components comply with Pattern Constraints — check Zustand selector reference stability (no new array/object per render), verify no side effects in render path, verify IPC data is structured-cloneable, verify Error Boundary wrapping on MCPSettings route, verify batched state updates from IPC events
- [ ] T078 Visual fidelity check: compare MCP settings UI against original Cherry Studio MCP settings — verify layout structure (server list sidebar + detail panel), element count (tabs, switches, buttons), and spacing match
- [ ] T079 Integration smoke test: mount MCPSettings, McpServersList, McpServerCard, McpSettings with real store state — verify renders without infinite loops, console errors, or layout flicker
- [ ] T080 Create demo script `demos/F006-mcp-tools.sh` — start app, navigate to MCP settings, add stdio server (echo-based test server), verify tools listed, enable/disable server, view logs. Support `--ci` flag for quick health check
- [ ] T081 Run quickstart.md validation — verify setup steps, test commands, and build all work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP entry point
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 (needs servers to have tools)
- **US3 (Phase 5)**: Depends on Phase 2 — can run parallel to US1
- **US4 (Phase 6)**: Depends on Phase 2 — can run parallel to US1
- **US5 (Phase 7)**: Depends on Phase 2 + Phase 3 (needs add server flow)
- **US6 (Phase 8)**: Depends on Phase 2 + Phase 3 (needs server list UI)
- **US7 (Phase 9)**: Depends on Phase 2 (log buffer)
- **US8 (Phase 10)**: Depends on Phase 3 (settings page scaffold)
- **OAuth (Phase 11)**: Depends on Phase 2
- **Notifications (Phase 12)**: Depends on Phase 2 + Phase 3
- **Integration & Demo (Phase 13)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: After Foundational — no other story dependencies
- **US2 (P1)**: After US1 (needs connected servers with tools)
- **US3 (P1)**: After Foundational — can parallel with US1
- **US4 (P2)**: After Foundational — can parallel with US1
- **US5 (P2)**: After US1 (needs add server dialog)
- **US6 (P2)**: After US1 (needs server list UI)
- **US7 (P3)**: After Foundational — can parallel with US1
- **US8 (P2)**: After US1 (needs detail page scaffold)

### Parallel Opportunities

- Phase 1: T001, T002, T003, T004 all parallel
- Phase 2: T016, T017 parallel (tests)
- Phase 3: T018, T019 parallel; T023, T024 parallel
- Phase 6: T042–T051 all parallel (built-in servers are independent)
- Phase 8: T059, T060, T061 all parallel

---

## Parallel Example: User Story 4 (Built-in Servers)

```bash
# All built-in server implementations can run in parallel:
Task T042: "@angdu/filesystem in src/main/mcpServers/filesystem/index.ts"
Task T043: "@angdu/fetch in src/main/mcpServers/fetch.ts"
Task T044: "@angdu/memory in src/main/mcpServers/memory.ts"
Task T045: "@angdu/sequentialthinking in src/main/mcpServers/sequentialthinking.ts"
Task T046: "@angdu/brave-search in src/main/mcpServers/brave-search.ts"
Task T047: "@angdu/browser in src/main/mcpServers/browser/index.ts"
Task T048: "@angdu/python in src/main/mcpServers/python.ts"
Task T049: "@angdu/dify-knowledge in src/main/mcpServers/dify-knowledge.ts"
Task T050: "@angdu/didi-mcp in src/main/mcpServers/didi-mcp.ts"
Task T051: "@angdu/hub in src/main/mcpServers/hub/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, IPC channels)
2. Complete Phase 2: Foundational (MCPService core, log buffer)
3. Complete Phase 3: User Story 1 (add/connect servers, settings UI)
4. **STOP and VALIDATE**: Add a stdio MCP server, verify tools listed
5. Demo/deploy if ready

### Incremental Delivery

1. Setup + Foundational → MCPService operational
2. Add US1 (connect servers) → Test → MVP!
3. Add US2 (execute tools in chat) → Test → Core complete
4. Add US3 (permissions) → Test → Security layer
5. Add US4 (built-in servers) → Test → Immediate value
6. Add US5–US8 → Test → Full feature set
7. Integration & Demo → Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- MCPService is ~1200 lines — Phase 2 tasks are sequential (same file)
- Built-in servers (Phase 6) are highly parallelizable (10 independent files)
- Total: 81 tasks across 13 phases
