# Pre-Context: Agent Framework

**Feature ID**: F012-agent-framework
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/agents/` | Agent services (CRUD, sessions, message management) |
| `src/main/services/agents/services/claudecode/` | Claude Code integration (slash commands, tool permissions) |
| `src/main/services/agents/drizzle.config.ts` | Drizzle ORM config for agent SQLite database |
| `src/main/apiServer/routes/` | REST API routes for agents (CRUD + sessions + messages) |
| `src/renderer/src/pages/agents/` | Agent UI (list, create, session view) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **agent CRUD (create, read, update, delete), agent sessions with status lifecycle (active, completed, error, cancelled), session message management with tool call/result tracking, Claude Code integration (slash commands, tool permissions), tool permission system (auto-approve, request/response flow), Drizzle ORM with SQLite for agent persistence (separate from Dexie), REST API for external agent access (CRUD + sessions + messages), agent configuration (model, instructions, MCP servers, max turns)**
- Do not reference: Ant Design components in agent UI (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind), Redux state patterns (migrating to Zustand)
- **Extract**: Agent CRUD operations with Drizzle ORM schema definitions, session lifecycle state machine (active -> completed | error | cancelled), session message schema with tool call/result JSON fields, Claude Code slash command registration and dispatching, tool permission system (auto-approve list, request/response approval flow), Drizzle schema definitions (agents, agent_sessions, agent_session_messages tables), REST API route handlers for agent CRUD/sessions/messages, agent configuration validation (model, instructions, MCP server assignment, max turns), token usage tracking per message
- **Ignore**: Redux state patterns, Ant Design Form/Table/Modal/List components, styled-components wrappers

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Agent framework has no static resources; all data is runtime-generated |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F012) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-core-platform | Log level for main process agent services |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F012-agent-framework implements an autonomous agent system with Claude Code-style integration. Agents are persisted in a dedicated SQLite database via Drizzle ORM (separate from the Dexie IndexedDB used by other features). Each agent has configurable model, instructions, MCP server assignments, and max turns. Agents operate through sessions with a lifecycle state machine (active -> completed | error | cancelled). Session messages track tool call/result pairs and token usage. The Claude Code integration provides slash command support and a tool permission system with auto-approve lists and request/response approval flow. A REST API exposes agent CRUD, session management, and message operations for external access.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Agent CRUD | User creates, views, updates, and deletes agent definitions with model, instructions, and MCP server configuration |
| P1 | Agent sessions | User starts an agent session; system manages lifecycle (active -> completed/error/cancelled) |
| P1 | Session messages | User interacts with agent via messages; tool calls and results are tracked per message |
| P2 | Claude Code integration | User invokes slash commands within agent sessions; system handles tool permissions |
| P2 | Tool permissions | System manages auto-approve lists and prompts user for approval on unapproved tool calls |
| P2 | REST API | External clients manage agents, sessions, and messages via REST endpoints |
| P3 | Agent configuration | User configures model, instructions, MCP servers, and max turns for each agent |
| P3 | Token tracking | System tracks token usage (prompt/completion/total) per agent session message |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Agent CRUD (create, read, update, delete)
- **FR-002**: Agent sessions with status lifecycle (active, completed, error, cancelled)
- **FR-003**: Session message management with tool call/result tracking
- **FR-004**: Claude Code integration (slash commands, tool permissions)
- **FR-005**: Tool permission system (auto-approve, request/response flow)
- **FR-006**: Drizzle ORM with SQLite for agent persistence (separate from Dexie)
- **FR-007**: REST API for external agent access (CRUD + sessions + messages)
- **FR-008**: Agent configuration (model, instructions, MCP servers, max turns)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Agent CRUD operations persist correctly in SQLite via Drizzle ORM
- **SC-002**: Session lifecycle transitions (active -> completed/error/cancelled) work correctly; only active sessions accept new messages
- **SC-003**: Tool calls and results are correctly tracked and associated with session messages
- **SC-004**: Claude Code slash commands execute and return results within agent sessions
- **SC-005**: Tool permission auto-approve allows pre-approved tools; unapproved tools prompt for user approval
- **SC-006**: REST API endpoints return correct responses for all CRUD, session, and message operations
- **SC-007**: Agent configuration (model, instructions, MCP servers, max turns) validates and persists correctly

### Edge Cases

- Agent session with max turns exceeded; session transitions to completed status
- Tool call to an MCP server that is offline; graceful error with session status preserved
- Concurrent session updates from REST API and UI; conflict resolution
- Agent deletion while sessions are active; cascade behavior (delete sessions and messages)
- Claude Code slash command not recognized; error response with available commands
- Tool permission request timeout; session pauses until user responds
- REST API request for non-existent agent/session/message; proper 404 responses
- SQLite database corruption; recovery or re-creation strategy
- Very long agent sessions with thousands of messages; query performance
- Agent with no MCP servers configured; tool calls disabled gracefully

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework, file system for SQLite DB storage, config persistence |
| F002-provider-management | Entity | Uses Provider and Model entities for agent model configuration |
| F003-ai-core-engine | API | Uses aiCore RuntimeExecutor for agent LLM interactions |
| F006-mcp-integration | API + MCP | Uses MCP tool calling API for agent tool execution; agents reference MCPServer entities |

### Related Entities (data-model.md draft)

#### Owned Entities (Drizzle tables)

**AgentEntity** (15 fields) -- Refer to E16 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK, UUID | Unique agent identifier |
| name | string | required | Agent display name |
| model | string | required | Model ID string |
| instructions | string | required | Agent system instructions |
| description | string | optional | Agent description |
| maxTurns | number | optional | Maximum conversation turns |
| toolPermissions | JSON | required | Allowed/denied tool permissions map |
| mcpServerId | string | optional, FK to MCPServer | Associated MCP server |
| providerId | string | optional, FK to Provider | Associated provider |
| connectionType | string | optional | Connection type for external agents |
| connectionConfig | JSON | optional | Connection configuration |
| createdAt | string | ISO 8601 | Creation timestamp |
| updatedAt | string | ISO 8601 | Last update timestamp |
| enableRealTimeStreaming | boolean | default false | Enable real-time streaming output |

**AgentSessionEntity** (6 fields) -- Refer to E17 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK, UUID | Unique session identifier |
| agentId | string | FK to AgentEntity | Parent agent |
| status | string | enum: active, completed, error, cancelled | Session lifecycle status |
| metadata | JSON | optional | Session metadata |
| createdAt | string | ISO 8601 | Creation timestamp |
| updatedAt | string | ISO 8601 | Last update timestamp |

**AgentSessionMessageEntity** (8 fields) -- Refer to E18 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK, UUID | Unique message identifier |
| sessionId | string | FK to AgentSessionEntity | Parent session |
| role | string | enum: user, assistant, system, tool | Message author role |
| content | string | required | Message text content |
| toolCalls | JSON | optional | Array of tool call objects |
| toolResults | JSON | optional | Array of tool result objects |
| tokenUsage | JSON | optional | Token count breakdown (prompt/completion/total) |
| createdAt | string | ISO 8601 | Creation timestamp |

**AgentConfiguration** -- Embedded configuration within AgentEntity defining model, instructions, MCP servers, and max turns.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Agent provider configuration |
| Model | F002-provider-management | Read access | Agent model selection |
| MCPServer | F006-mcp-integration | Read access | Agent MCP server assignment for tool access |
| MCPTool | F006-mcp-integration | Read access | Tool listing for permission management |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| REST | `GET /v1/agents` | List all agents |
| REST | `POST /v1/agents` | Create a new agent |
| REST | `GET /v1/agents/:id` | Get agent by ID |
| REST | `PUT /v1/agents/:id` | Update agent |
| REST | `DELETE /v1/agents/:id` | Delete agent |
| REST | `POST /v1/agents/:id/sessions` | Create a new session |
| REST | `GET /v1/agents/:id/sessions` | List sessions for agent |
| REST | `GET /v1/agents/:id/sessions/:sessionId` | Get session details |
| REST | `POST /v1/agents/:id/sessions/:sessionId/messages` | Send message to session |
| REST | `GET /v1/agents/:id/sessions/:sessionId/messages` | List messages in session |
| IPC | Agent-related channels | Agent management from renderer |
| Zustand | `useAgentStore` | Agent state management |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, data paths for SQLite DB |
| IPC | `config:*` | F001-core-platform | Config persistence |
| IPC | `mcp:list-tools` | F006-mcp-integration | Get available tools for agent tool execution |
| IPC | `mcp:call-tool` | F006-mcp-integration | Execute tool calls during agent sessions |
| aiCore | RuntimeExecutor | F003-ai-core-engine | LLM streaming/generation for agent conversations |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Agent framework uses Drizzle ORM with SQLite (separate from Dexie) for persistence. Main process handles agent CRUD, session lifecycle, message management, and Claude Code integration. Express REST API routes expose agent operations externally. Renderer side manages agent UI with Redux state and Ant Design components.
- **Recommended implementation approach**: Keep ALL main process agent services intact (Drizzle ORM, SQLite, session management, Claude Code integration -- all framework-agnostic). Keep Express REST API routes intact (framework-agnostic). Replace Ant Design components in agent UI with shadcn/ui equivalents (Form, Table, List, Modal -> Dialog). Replace Redux state with Zustand store.
- **Caveats**: The Drizzle ORM + SQLite persistence is entirely separate from the Dexie IndexedDB used by other features. This separation should be maintained in the new stack. The REST API (Express) and main process services are completely framework-agnostic. Migration effort is limited to the renderer-side agent UI.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| MCP tool calling | F006-mcp-integration | Verify F012 correctly calls mcp:list-tools and mcp:call-tool for agent tool execution |
| Tool ID parsing | F006-mcp-integration | Verify F012 correctly parses `serverId__toolName` composite tool IDs |
| Provider resolution | F002-provider-management | Verify F012 correctly resolves provider and model for agent configuration |
| AI execution | F003-ai-core-engine | Verify F012 correctly uses F003's RuntimeExecutor for agent LLM interactions |
| Settings integration | F008-settings-ui | Verify agent settings page correctly configures agent parameters |
| Backup inclusion | F007-backup-sync | Verify agent SQLite DB is included in backup/restore operations |
| IPC channel availability | F001-core-platform | Verify F012's agent IPC channels are registered in F001's IPC handler |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| External clients | API contract | If REST API endpoints or response schemas change, external clients must adapt |
| F006-mcp-integration | Tool usage | If agent tool permission system changes, F006's tool calling flow may need adaptation |
| F008-settings-ui | Config schema | If agent configuration schema changes, settings page must update |
