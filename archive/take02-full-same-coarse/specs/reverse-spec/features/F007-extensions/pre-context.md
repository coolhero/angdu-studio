# Pre-Context: Extensions & Tools

**Feature ID**: F007-extensions
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/agents/` | Agent system services (CRUD, sessions, messages) |
| `src/main/services/ApiServerService.ts` | API server lifecycle management |
| `src/main/apiServer/` | Express API server (routes, middleware, app setup) |
| `src/main/apiServer/app.ts` | Express app setup |
| `src/main/apiServer/routes/` | API routes (agents, sessions, messages, chat completions) |
| `src/main/apiServer/middleware/` | Auth middleware (timing-safe comparison) |
| `src/renderer/src/types/agent.ts` | Agent type definitions and Zod schemas |
| `src/renderer/src/pages/agents/` | Agent UI pages |
| `src/renderer/src/services/NotesService.ts` | Notes service (renderer) |
| `src/renderer/src/pages/notes/` | Notes editor pages |
| `src/renderer/src/pages/apps/` | Mini apps page |
| `src/renderer/src/pages/code/` | Code tools page |
| `src/renderer/src/store/agents.ts` | Agents Redux slice |
| `src/renderer/src/store/notes.ts` | Notes Redux slice |
| `src/preload/index.ts` | IPC bridge for notes, DXT, agent operations |
| `src/main/services/DxtService.ts` | DXT plugin management |
| `packages/shared/IpcChannel.ts` | IPC channel definitions |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Agent system with Drizzle ORM + SQLite persistence; Express-based REST API server with OpenAI/Anthropic compatibility; TipTap rich text editor for notes with file watcher sync; DXT plugin format for MCP server extensions; Zod schema validation for agent CRUD
- **Reusable code**:
  - `src/main/services/agents/:AgentService` — Agent CRUD with Drizzle ORM; reuse for agent lifecycle management
  - `src/main/services/ApiServerService.ts:ApiServerService` — Express server lifecycle (start/stop/restart); reuse for API server management
  - `src/main/apiServer/app.ts` — Express app with auth middleware and route registration; reuse for REST API patterns
  - `src/renderer/src/types/agent.ts` — Zod schemas for agent validation; reuse for type-safe API contracts
  - `src/renderer/src/services/NotesService.ts:NotesService` — Notes service with file watcher and auto-save; reuse for notes lifecycle
  - `src/main/services/DxtService.ts:DxtService` — DXT plugin installation and management; reuse for MCP extension handling

### Static Resources

None

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `RENDERER_VITE_AIHUBMIX_SECRET` | secret | No | AihubMix OAuth AES decryption secret (build-time injection) | — |
| `CLAUDE_CODE_GIT_BASH_PATH` | config | No | Git Bash path override for Windows (for Claude Code agent) | `C:\Program Files\Git\bin\bash.exe` |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `NODE_OPTIONS` | F001-platform | Node.js memory limit for API server and agent operations |
| `CSLOGGER_MAIN_LEVEL` | F001-platform | Log level for agent and API server main process logging |
| `CHERRY_AUTO_ALLOW_TOOLS` | F003-chat | Auto-approve tool calls for Claude Code agent integration |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F007-extensions provides a collection of peripheral features that extend Cherry Studio beyond core chat. It includes an autonomous agent system (Claude Code type) with Drizzle ORM + SQLite persistence, an Express-based REST API server exposing OpenAI/Anthropic-compatible chat completion endpoints, a TipTap-powered notes editor with Obsidian vault integration and file watcher sync, MCP DXT plugin management for installing external tool servers, mini apps, code tools, and a selection assistant for OS-level text selection actions.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create agent | User creates an autonomous agent with type, model, instructions, and accessible file paths; default session auto-created |
| P1 | Agent conversation | User sends messages to an agent session; agent processes with configured model and streams response via SSE |
| P1 | API server | User starts the API server; external tools can call OpenAI-compatible chat/completions endpoint |
| P2 | Notes editor | User creates and edits rich text notes using TipTap editor with auto-save |
| P2 | Obsidian integration | User connects Obsidian vault; vault files available for browsing and import |
| P2 | DXT plugin install | User installs MCP server plugins from DXT packages, ZIP files, or directories |
| P3 | Mini apps | User accesses built-in mini applications (browser tools, utilities) |
| P3 | Code tools | User uses code-related tools (formatting, diff, etc.) |
| P3 | Selection assistant | User selects text in any app; selection assistant provides AI-powered actions |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Agent CRUD with Drizzle ORM + SQLite persistence (type: claude-code)
- **FR-002**: Agent sessions with message streaming via SSE and conversation persistence
- **FR-003**: REST API server (Express) with OpenAI and Anthropic-compatible endpoints
- **FR-004**: API authentication with timing-safe string comparison
- **FR-005**: TipTap rich text notes editor with file-based storage and auto-save
- **FR-006**: Obsidian vault integration (vault discovery, folder/file browsing, import)
- **FR-007**: MCP DXT plugin management (install from ZIP/directory/DXT, metadata tracking, trust management)
- **FR-008**: Mini apps framework for built-in utilities
- **FR-009**: Selection assistant for OS-level text selection AI actions

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Agent creation with auto-session completes within 1 second
- **SC-002**: Agent message streaming begins within 2 seconds
- **SC-003**: API server starts and accepts requests within 3 seconds
- **SC-004**: API authentication rejects invalid keys with constant-time comparison
- **SC-005**: Notes auto-save persists content within 2 seconds of last edit
- **SC-006**: DXT plugin installation completes and MCP server becomes available

### Edge Cases

- Agent session with model that becomes unavailable (provider disabled)
- API server port already in use at startup
- Concurrent API requests exceeding server capacity
- Notes file watcher detecting external modifications during edit
- Obsidian vault path changed or deleted while connected
- DXT plugin with incompatible MCP protocol version
- Agent accessible_paths pointing to non-existent directories
- SSE connection dropped during agent response streaming
- Large note files (>10MB) affecting editor performance

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC bridge | Uses file:* for notes storage, app:* for server config, system:* for selection assistant |
| F001-platform | File system | Uses file system APIs for notes storage, agent workspace, and DXT plugin management |
| F001-platform | Redux store | Agents and notes slices integrate into F001's Redux store |
| F002-ai-foundation | Entity reference | References Model entities for agent model selection; references Provider for API resolution |
| F003-chat | API call | API server exposes chat completion endpoints that delegate to F003's chat pipeline |
| F003-chat | Entity reference | References MCPServer entities for agent MCP tool configuration |

### Related Entities (data-model.md draft)

#### Owned Entities

**AgentEntity** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique agent identifier |
| name | string | required, min 1 char | Agent display name |
| type | AgentType | required | Agent type (currently 'claude-code') |
| model | string | required, min 1 char | Model identifier |
| instructions | string | optional | System instructions for agent behavior |
| accessible_paths | string[] | required, non-empty | Directories the agent can access |
| mcps | object[] | optional | MCP tool configurations |
| max_turns | number | optional | Maximum conversation turns |
| createdAt | string | required | Creation timestamp |
| updatedAt | string | required | Last update timestamp |

**AgentSessionEntity** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique session identifier |
| agent_id | string | FK → AgentEntity | Parent agent |
| name | string | required | Session display name |
| model | string | required | Model for this session (inherits from agent) |
| instructions | string | optional | Session-level instructions |
| createdAt | string | required | Creation timestamp |
| updatedAt | string | required | Last update timestamp |

**AgentSessionMessageEntity** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique message identifier |
| agent_session_id | string | FK → AgentSessionEntity | Parent session |
| role | SessionMessageRole | required | Role (assistant, user, system, tool) |
| content | string | required, min 1 char | Message content |
| createdAt | string | required | Creation timestamp |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-foundation | Read access | Provider resolution for agent model |
| Model | F002-ai-foundation | Read access | Model selection for agents |
| MCPServer | F003-chat | Read access | MCP tool configuration for agents |
| Message | F003-chat | Read access | API server delegates to chat completion pipeline |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| REST | `POST /v1/chat/completions` | OpenAI-compatible chat completions (for external clients) |
| REST | `POST /v1/messages` | Anthropic-compatible messages API |
| REST | `GET /v1/agents` | List all agents |
| REST | `POST /v1/agents` | Create an agent |
| REST | `GET /v1/agents/:id` | Get agent details |
| REST | `PUT /v1/agents/:id` | Update agent |
| REST | `DELETE /v1/agents/:id` | Delete agent |
| REST | `GET /v1/agents/:id/sessions` | List agent sessions |
| REST | `POST /v1/agents/:id/sessions/:sessionId/messages` | Send message to session (SSE stream) |
| IPC | `notes:*` | Notes CRUD, file watcher, directory structure |
| IPC | `dxt:*` | DXT plugin install, uninstall, list |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Service | `fetchChatCompletion()` | F003-chat | Chat completion for API server endpoints |
| Redux | `llmSlice` | F002-ai-foundation | Provider and model data for agent model resolution |
| IPC | `file:*` | F001-platform | File operations for notes and DXT plugins |
| IPC | `mcp:*` | F003-chat | MCP server management for agent tool access |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Drizzle ORM with SQLite for agent persistence; Express with modular router for REST API; TipTap editor configuration with custom extensions; File watcher pattern for notes sync; Zod schema validation for API contracts
- **Existing libraries**: `drizzle-orm` + `@libsql/client` — Agent persistence; `express` — REST API server; `@tiptap/react` + `@tiptap/starter-kit` — Rich text editor; `zod` — Schema validation; `@anthropic-ai/sdk` + `openai` — API compatibility
- **Existing architecture decisions**: Agent system uses Drizzle ORM for structured persistence separate from Dexie; API server runs in main process with Express for direct model access; Notes use file-based storage (not Dexie) for Obsidian compatibility; DXT plugins stored in app data with metadata tracking; Agent sessions auto-created on agent creation for immediate usability

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Agent model compatibility | F002-ai-foundation | Verify that agent model field correctly references Model entities from F002 |
| API server chat delegation | F003-chat | Verify that API server /v1/chat/completions correctly delegates to F003's fetchChatCompletion |
| MCP tool access | F003-chat | Verify that agent MCP tool configurations reference MCPServer entities managed by F003 |
| File system integration | F001-platform | Verify that notes file operations use F001's file:* IPC channels |
| Redux store integration | F001-platform | Verify that agents and notes slices integrate correctly with F001's Redux store |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-chat | MCP impact | If DXT plugin management changes, F003's MCP server list (used in chat) may be affected |
| F005-data-mgmt | Data format impact | If agent or notes storage format changes, F005's backup/restore must handle new format |
| F005-data-mgmt | Connection impact | If notes file watcher lifecycle changes, F005's closeAllDataConnections during restore needs modification |
