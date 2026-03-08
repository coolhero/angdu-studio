# F009-agents — Pre-Context

> Feature: Agent Framework
> Ring: RG-4 | Tier: T3
> Generated: 2026-03-08

---

## 1. Runtime Exploration Results

### Screen: Agent Sessions (internal)

**Layout**: Agent management interface with session-based interactions

**UI Elements**:
- Agent list with type, name, description
- Session view with message history
- Tool permission management (allowed tools whitelist)
- MCP server assignment per agent
- Model configuration (main, plan, small models)
- Plugin management interface
- API Server status indicator and controls (start/stop/restart)

**User Flows**:
| Flow | Steps | Observations |
|------|-------|--------------|
| Create agent | Define type, name, model, instructions | Persisted in Drizzle/SQLite |
| Start session | Select agent → New session | Creates session row linked to agent |
| Send message | Type in session → Send | Message streamed via Claude Code SDK or provider |
| Manage plugins | Install/uninstall plugins | PluginService manages lifecycle |
| Configure tools | Select allowed tools for agent | Tool permission whitelist |
| Start API server | Settings → API Server → Start | Express server on configurable port |
| API chat | POST /v1/chat/completions (OpenAI-compatible) | Routes through agent framework |

---

## 2. Source Reference

### Main Process (Electron)

| File | Purpose |
|------|---------|
| `src/main/services/agents/index.ts` | Agent module entry point |
| `src/main/services/agents/BaseService.ts` | Base service abstraction |
| `src/main/services/agents/errors.ts` | Agent-specific error classes |
| `src/main/services/agents/interfaces/AgentStreamInterface.ts` | Streaming interface definition |
| `src/main/services/agents/services/AgentService.ts` | Agent CRUD operations |
| `src/main/services/agents/services/SessionService.ts` | Session CRUD operations |
| `src/main/services/agents/services/SessionMessageService.ts` | Session message CRUD |
| `src/main/services/agents/services/index.ts` | Service exports |
| `src/main/services/agents/services/claudecode/index.ts` | Claude Code SDK integration entry |
| `src/main/services/agents/services/claudecode/commands.ts` | Claude Code command definitions |
| `src/main/services/agents/services/claudecode/tool-permissions.ts` | Tool permission management |
| `src/main/services/agents/services/claudecode/transform.ts` | Message format transformation |
| `src/main/services/agents/services/claudecode/tools.ts` | Tool definitions for Claude Code |
| `src/main/services/agents/services/claudecode/utils.ts` | Claude Code utilities |
| `src/main/services/agents/services/claudecode/claude-stream-state.ts` | Stream state management |
| `src/main/services/agents/database/DatabaseManager.ts` | SQLite database manager |
| `src/main/services/agents/database/index.ts` | Database module entry |
| `src/main/services/agents/database/MigrationService.ts` | Schema migration service |
| `src/main/services/agents/database/DataMigrationService.ts` | Data migration service |
| `src/main/services/agents/database/sessionMessageRepository.ts` | Message repository |
| `src/main/services/agents/database/migrateBlockReferences.ts` | Block reference migration |
| `src/main/services/agents/database/migrateBlockReferences.utils.ts` | Migration utilities |
| `src/main/services/agents/database/schema/agents.schema.ts` | Agent table schema (Drizzle) |
| `src/main/services/agents/database/schema/sessions.schema.ts` | Session table schema (Drizzle) |
| `src/main/services/agents/database/schema/messages.schema.ts` | SessionMessage table schema (Drizzle) |
| `src/main/services/agents/database/schema/migrations.schema.ts` | Migration tracking schema |
| `src/main/services/agents/database/schema/index.ts` | Schema exports |
| `src/main/services/agents/plugins/PluginService.ts` | Plugin lifecycle management |
| `src/main/services/agents/plugins/PluginInstaller.ts` | Plugin installation |
| `src/main/services/agents/plugins/PluginCacheStore.ts` | Plugin cache management |
| `src/main/services/agents/drizzle.config.ts` | Drizzle ORM configuration |

### API Server

| File | Purpose |
|------|---------|
| `src/main/apiServer/index.ts` | API server module entry |
| `src/main/apiServer/server.ts` | Express server setup |
| `src/main/apiServer/app.ts` | Express app configuration |
| `src/main/apiServer/config.ts` | Server configuration |
| `src/main/apiServer/config/timeouts.ts` | Timeout configuration |
| `src/main/apiServer/middleware/auth.ts` | Authentication middleware |
| `src/main/apiServer/middleware/error.ts` | Error handling middleware |
| `src/main/apiServer/middleware/openapi.ts` | OpenAPI validation middleware |
| `src/main/apiServer/routes/chat.ts` | Chat completions route |
| `src/main/apiServer/routes/models.ts` | Models listing route |
| `src/main/apiServer/routes/messages.ts` | Messages route |
| `src/main/apiServer/routes/mcp.ts` | MCP tools route |
| `src/main/apiServer/routes/agents/index.ts` | Agent API routes |
| `src/main/apiServer/routes/agents/handlers/agents.ts` | Agent handlers |
| `src/main/apiServer/routes/agents/handlers/sessions.ts` | Session handlers |
| `src/main/apiServer/routes/agents/handlers/messages.ts` | Message handlers |
| `src/main/apiServer/routes/agents/validators/agents.ts` | Agent validators |
| `src/main/apiServer/routes/agents/validators/sessions.ts` | Session validators |
| `src/main/apiServer/routes/agents/validators/messages.ts` | Message validators |
| `src/main/apiServer/routes/agents/validators/common.ts` | Common validators |
| `src/main/apiServer/routes/agents/validators/zodValidator.ts` | Zod validation helpers |
| `src/main/apiServer/routes/agents/middleware/common.ts` | Agent route middleware |
| `src/main/apiServer/utils/index.ts` | API server utilities |
| `src/main/apiServer/utils/mcp.ts` | MCP integration utilities |
| `src/main/apiServer/utils/createStreamAbortController.ts` | Stream abort handling |
| `src/main/apiServer/generated/openapi-spec.json` | OpenAPI specification |

### Renderer (React)

| File | Purpose |
|------|---------|
| (Agent UI components are primarily managed via the API server and IPC) | |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B166 | Create agent with type, name, model, instructions | P1 | Drizzle insert into agents table |
| B167 | Update agent configuration | P1 | Drizzle update |
| B168 | Delete agent (cascade deletes sessions) | P1 | FK cascade |
| B169 | List agents with filtering by type | P2 | Index on type |
| B170 | Create session linked to agent | P1 | Copies agent config to session |
| B171 | Send message in session and stream response | P1 | Core agent interaction |
| B172 | Store session messages (user, agent, system, tool roles) | P1 | SessionMessage with JSON content |
| B173 | Claude Code SDK integration for agent streaming | P1 | claude-stream-state, transform |
| B174 | Tool permission management (allowed tools whitelist) | P2 | Per-agent/session tool control |
| B175 | MCP server assignment to agents | P2 | JSON array of MCP tool IDs |
| B176 | Plugin installation and lifecycle management | P2 | PluginInstaller, PluginService |
| B177 | Plugin cache management | P3 | PluginCacheStore |
| B178 | API server start/stop/restart | P1 | Express server lifecycle |
| B179 | OpenAI-compatible chat completions endpoint | P1 | POST /v1/chat/completions |
| B180 | Anthropic-compatible endpoint | P2 | Anthropic API format |
| B181 | Models listing endpoint | P2 | GET /v1/models |
| B182 | Agent CRUD via REST API | P2 | REST endpoints for agents |
| B183 | Session CRUD via REST API | P2 | REST endpoints for sessions |
| B184 | Message streaming via REST API | P1 | SSE streaming |
| B185 | API authentication middleware | P1 | Bearer token auth |
| B186 | OpenAPI spec validation | P2 | Request/response validation |
| B187 | Database migration service | P2 | Schema versioning |
| B188 | Data migration (block references) | P3 | Legacy data migration |
| B189 | Stream abort handling | P2 | Cancellation support |
| B190 | Slash commands from SDK init | P3 | Session-level slash commands |

---

## 4. UI Component Features

### AntD Components Used (to migrate to shadcn/ui)

| AntD Component | Usage | shadcn/ui Target |
|----------------|-------|------------------|
| `Switch` | API server toggle | `Switch` |
| `Button` | Start/stop/restart API server | `Button` |
| `Input` | Server port, auth token | `Input` |
| `Tag` | Server status indicator | `Badge` |
| `message` | Status notifications | `toast` (sonner) |

---

## 5. Naming Remapping

| Original (Cherry) | Target (Angdu) |
|--------------------|----------------|
| `IpcChannel.ApiServer_*` | `IpcChannel.ApiServer_*` (no change needed) |
| `api-server:providers` (cache key) | `api-server:providers` (internal, no rename) |
| `api-server:mcp-servers` (cache key) | `api-server:mcp-servers` (internal, no rename) |
| Cherry Studio API docs references | Angdu Studio API docs references |

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| `openapi-spec.json` | `src/main/apiServer/generated/openapi-spec.json` | OpenAPI spec — update title/description |
| No custom UI assets | — | Agent management uses standard components |

---

## 7. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| API server port | Express server listen port | Yes (default configurable) |
| API server auth token | Bearer token for API authentication | Yes |
| Provider API keys | Model access for agent interactions | Yes (shared with F003-provider) |

---

## 8. For /speckit.specify

### Summary
Agent framework provides a structured system for creating AI agents with configurable models, tools, and permissions. Agents interact through sessions with message history persisted in SQLite via Drizzle ORM. Includes Claude Code SDK integration for advanced agent capabilities, a plugin system for extensibility, and a REST API server (Express) exposing OpenAI/Anthropic-compatible endpoints for external access.

### Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-090 | User creates an agent with model and instructions | B166 |
| SC-091 | User starts a session and sends messages | B170, B171, B172 |
| SC-092 | Agent streams response via Claude Code SDK | B173 |
| SC-093 | User configures tool permissions for agent | B174, B175 |
| SC-094 | User installs/manages plugins | B176, B177 |
| SC-095 | User starts API server for external access | B178 |
| SC-096 | External client sends chat completion request | B179, B185 |
| SC-097 | External client manages agents via REST API | B182, B183 |
| SC-098 | User aborts a streaming response | B189 |
| SC-099 | Database migration runs on app update | B187, B188 |

### Draft Functional Requirements

| FR-ID | Requirement |
|-------|-------------|
| FR-090 | The system shall support creating agents with type, name, model, and instructions |
| FR-091 | The system shall persist agent data in SQLite via Drizzle ORM |
| FR-092 | The system shall support session-based message history per agent |
| FR-093 | The system shall integrate with Claude Code SDK for agent streaming |
| FR-094 | The system shall support tool permission whitelisting per agent |
| FR-095 | The system shall provide an Express-based REST API server |
| FR-096 | The system shall expose OpenAI-compatible chat completions endpoint |
| FR-097 | The system shall support API authentication via bearer tokens |
| FR-098 | The system shall support plugin installation and lifecycle management |
| FR-099 | The system shall support database schema migrations |

---

## 9. For /speckit.plan

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| F001-app-core | Hard | Electron shell, IPC infrastructure |
| F003-provider | Hard | Model providers for agent interactions |
| F006-mcp | Soft | MCP server integration for agent tools |
| `drizzle-orm` | NPM | ORM for SQLite |
| `better-sqlite3` | NPM | SQLite driver |
| `express` | NPM | REST API server |
| `@anthropic-ai/claude-code` | NPM | Claude Code agent SDK |
| `zod` | NPM | Request validation |

### Contracts

| Contract | Direction | Consumers |
|----------|-----------|-----------|
| `IpcChannel.ApiServer_GetStatus` | main ← renderer | Settings UI |
| `IpcChannel.ApiServer_Start` | main ← renderer | Settings UI |
| `IpcChannel.ApiServer_Stop` | main ← renderer | Settings UI |
| `IpcChannel.ApiServer_Restart` | main ← renderer | Settings UI |
| `IpcChannel.ApiServer_Ready` | main → renderer | Status notification |
| `agentsTable` (Drizzle schema) | database | AgentService |
| `sessionsTable` (Drizzle schema) | database | SessionService |
| `sessionMessagesTable` (Drizzle schema) | database | SessionMessageService |
| REST `/v1/chat/completions` | HTTP | External clients |
| REST `/v1/models` | HTTP | External clients |
| REST `/agents/*` | HTTP | External clients |
| REST `/sessions/*` | HTTP | External clients |

---

## 10. For /speckit.analyze

### Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| API server settings in global settings | F009 ↔ F002-settings | Settings page section |
| Provider config for agent models | F009 ↔ F003-provider | Model selection |
| MCP servers assigned to agents | F009 ↔ F006-mcp | MCP tool IDs in agent config |
| Agent messages may use knowledge base | F009 ↔ F007-knowledge | Knowledge retrieval in agent flow |
| Agent messages may use memory | F009 ↔ F008-memory | Memory retrieval in agent flow |
| Claude Code SDK dependency | F009 | Verify `@anthropic-ai/claude-code` availability |
| OpenAPI spec branding | F009 | Update spec title from Cherry to Angdu |
| Drizzle migration separate from main app DB | F009 | Agents use their own SQLite database |
| Plugin system security | F009 | Plugin sandboxing considerations |
