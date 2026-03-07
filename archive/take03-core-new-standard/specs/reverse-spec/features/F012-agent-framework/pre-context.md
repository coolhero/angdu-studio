# Pre-Context: Agent Framework

**Feature ID**: F012
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/agents/AgentService.ts` | Agent CRUD service |
| `src/main/services/agents/SessionService.ts` | Session lifecycle management |
| `src/main/services/agents/SessionMessageService.ts` | Session message persistence |
| `src/main/services/agents/BaseService.ts` | Base service for shared agent logic |
| `src/main/services/agents/database/` | Drizzle ORM database schemas and migrations |
| `src/main/services/agents/plugins/` | Plugin management (install, validate, lifecycle) |
| `src/main/services/agents/services/claudecode/` | Claude Code builtin tool implementations |
| `src/main/apiServer/routes/agents/` | Agent REST API routes (all) |
| `src/renderer/src/hooks/agents/` | Agent-related React hooks (all) |
| `src/renderer/src/types/agent.ts` | Agent type definitions and Zod schemas |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Agent CRUD with model validation logic, session lifecycle (creation with inheritance from agent, auto-rename), tool permission flow (60-second timeout), Claude Code builtin tools (13 tool definitions and handlers), slash command registration (builtin + plugin-based), session message persistence and streaming, MCP tool ID normalization algorithm, Drizzle ORM schema definitions (agents, sessions, session_messages tables), plugin manifest validation (Zod), REST API endpoint contracts for agents
- Ignore: Redux agent-related slices (migrating to Zustand), Ant Design agent UI components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind)

### Static Resources

None.

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `CHERRY_AUTO_ALLOW_TOOLS` | feature-flag | No | Auto-approve tool calls for agent execution (skip user confirmation) | `1` |
| `CLAUDE_CODE_GIT_BASH_PATH` | config | No | Git Bash path override for Windows (Claude Code agent shell) | `C:\Program Files\Git\bin\bash.exe` |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Agent Framework provides an autonomous agent system centered around the Claude Code pattern. Agents are persisted via Drizzle ORM with SQLite, supporting full CRUD with Zod-validated model fields. Each agent has sessions that inherit configuration (model, instructions) from their parent agent. Sessions manage message streaming via SSE with tool calling support. The framework includes 13 builtin Claude Code tools (file read/write, bash, search, etc.), a tool permission flow with 60-second user approval timeout, slash command support (both builtin and plugin-provided), MCP tool ID normalization for consistent tool references, automatic session renaming, and a REST API for external agent management.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create Agent | User creates an agent with type, model, instructions, and accessible file paths; default session auto-created |
| P1 | Agent Conversation | User sends messages to an agent session; agent processes with configured model and streams response via SSE |
| P1 | Tool Execution | Agent invokes a builtin tool (e.g., file read, bash); user approves within 60s timeout or tool auto-approved |
| P2 | Session Management | User creates additional sessions for an agent; sessions inherit agent configuration |
| P2 | Slash Commands | User types slash command in agent session; builtin or plugin command executes |
| P2 | Session Auto-Rename | System auto-renames session based on conversation content after initial exchange |
| P2 | REST API | External tools manage agents via REST API (create, list, send messages) |
| P3 | Plugin Management | User installs agent plugins; plugin slash commands and tools become available |
| P3 | MCP Tool Access | Agent accesses MCP tools with normalized tool IDs |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement agent CRUD with Drizzle ORM + SQLite persistence and Zod model validation
- **FR-002**: Implement session lifecycle with inheritance from parent agent (model, instructions)
- **FR-003**: Implement tool permission flow with 60-second user approval timeout
- **FR-004**: Implement Claude Code builtin tools (13 tools: file read, file write, bash, search, glob, grep, list files, etc.)
- **FR-005**: Implement slash command system (builtin commands + plugin-provided commands)
- **FR-006**: Implement session message streaming via SSE with tool call/result round-trip
- **FR-007**: Implement session auto-rename based on conversation content
- **FR-008**: Implement MCP tool ID normalization for consistent tool references
- **FR-009**: Implement REST API endpoints for agent CRUD and session message operations
- **FR-010**: Implement plugin management (install, uninstall, validate with Zod manifest)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Agent creation with auto-session completes within 1 second
- **SC-002**: Agent message streaming begins within 2 seconds of user message
- **SC-003**: Tool permission prompt appears and times out correctly at 60 seconds
- **SC-004**: All 13 builtin Claude Code tools execute correctly and return results
- **SC-005**: Session inheritance correctly propagates agent model and instructions
- **SC-006**: REST API accepts and processes agent CRUD operations with correct status codes
- **SC-007**: Plugins install, validate, and register slash commands correctly

### Edge Cases

- Agent session with model that becomes unavailable (provider disabled)
- Tool permission timeout while user is away (auto-deny after 60s)
- Concurrent tool executions in same session
- SSE connection dropped during agent response streaming (reconnect handling)
- Agent accessible_paths pointing to non-existent directories
- MCP tool ID with special characters requiring normalization
- Plugin with incompatible manifest schema version
- Session auto-rename with very short or empty conversation
- REST API request with malformed agent creation payload (Zod validation)
- Drizzle migration from earlier database schema versions

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC, DB | Agent operations via IPC; Drizzle uses better-sqlite3 for persistence |
| F002-provider-management | Provider config | Resolves provider and model for agent execution |
| F003-ai-core-engine | AI pipeline | Agent message processing delegates to AI completion pipeline |
| F006-mcp-integration | Tool proxy | Agent MCP tool access routes through MCP service with tool ID normalization |

### Related Entities (data-model.md draft)

#### Owned Entities

**Agent (Drizzle)** -- Refer to the corresponding section in entity-registry.md

**Session (Drizzle)** -- Refer to the corresponding section in entity-registry.md

**SessionMessage (Drizzle)** -- Refer to the corresponding section in entity-registry.md

**AgentEntity (Zod)** -- Refer to the corresponding section in entity-registry.md

**AgentSessionEntity** -- Refer to the corresponding section in entity-registry.md

**PluginMetadata** -- Refer to the corresponding section in entity-registry.md

**PluginManifest** -- Refer to the corresponding section in entity-registry.md

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Provider resolution for agent model execution |
| Model | F002-provider-management | Read access | Model capabilities and endpoint type for agents |
| MCPServer | F006-mcp-integration | Read access | MCP server configuration for agent tool access |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| REST | `GET /v1/agents` | List all agents |
| REST | `POST /v1/agents` | Create an agent |
| REST | `GET /v1/agents/:id` | Get agent details |
| REST | `PUT /v1/agents/:id` | Update agent |
| REST | `DELETE /v1/agents/:id` | Delete agent |
| REST | `GET /v1/agents/:id/sessions` | List agent sessions |
| REST | `POST /v1/agents/:id/sessions` | Create a new session |
| REST | `POST /v1/agents/:id/sessions/:sessionId/messages` | Send message to session (SSE stream) |
| IPC | `agents:*` | Agent CRUD and session operations |

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| Service | AI completion pipeline | F003-ai-core-engine | Message processing for agent sessions |
| IPC | `mcp:*` | F006-mcp-integration | MCP tool invocation for agent tool calls |
| Store | Provider/Model data | F002-provider-management | Provider and model resolution for agents |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Agent system uses Drizzle ORM with SQLite for structured persistence (separate from Dexie). Sessions inherit from agents and manage message streaming via SSE. 13 builtin Claude Code tools handle file operations and shell commands. Plugin system validates manifests with Zod and registers slash commands. REST API routes are Express-based in the main process.
- **Recommended implementation approach**: Keep Drizzle ORM agent persistence (framework-agnostic). Keep Express REST API routes in main process. Replace Redux agent state with Zustand store. Replace Ant Design agent UI with shadcn/ui components. Core agent logic (tool execution, session lifecycle, plugin validation) is framework-agnostic.
- **Caveats**: The agent system has deep integration with MCP tools via F006; ensure MCP tool ID normalization is compatible with the new MCP integration feature. Claude Code builtin tools are tightly coupled to the main process shell environment (especially on Windows with Git Bash path).

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| AI pipeline delegation | F003-ai-core-engine | Verify agent message processing correctly delegates to AI completion pipeline |
| MCP tool routing | F006-mcp-integration | Verify agent MCP tool calls route correctly through MCP service |
| Provider resolution | F002-provider-management | Verify agent model field correctly resolves to provider and model entities |
| Backup inclusion | F007-backup-sync | Verify agent data (agents, sessions, messages) is included in backup/restore |
| Settings integration | F008-settings-ui | Verify agent settings page correctly configures agent defaults |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F006-mcp-integration | Tool ID format | If MCP tool ID normalization changes, MCP integration must adapt |
| F007-backup-sync | Data format | If Drizzle schema changes, backup must handle SQLite data migration |
| F010-auxiliary-features | API server | If agent REST API contracts change, API server routes in F010 must stay consistent |
