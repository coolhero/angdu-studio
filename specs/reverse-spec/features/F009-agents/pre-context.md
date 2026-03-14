# F009-agents Pre-Context

## Feature Overview

| Field | Value |
|-------|-------|
| Feature ID | F009-agents |
| Title | Agent Framework |
| Tier | 2 (Supporting) |
| Risk Group | RG-4 |
| Dependencies | F006-chat-core, F008-mcp, F003-providers |
| SBI Range | B131 - B155 |

## Scope

Agent framework including agent CRUD, session management, Claude Code SDK integration, tool permission management, and a REST API server. Agents are autonomous entities that combine a model, system prompt, MCP tools, and slash commands into a configurable execution environment. Sessions represent individual agent interactions with full message history.

## Migration Notes

- **Original**: Cherry Studio
- **Target**: Angdu Studio (Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7)
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- **ORM**: Drizzle ORM for agent database (separate from main app database)

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| src/main/services/agents/services/AgentService.ts | Agent CRUD with validation |
| src/main/services/agents/services/SessionService.ts | Session lifecycle management |
| src/main/services/agents/services/SessionMessageService.ts | Message streaming and history |
| src/main/services/agents/services/BaseService.ts | Base service with model validation |
| src/main/services/agents/claudecode/ | Claude Code SDK integration |
| src/main/services/agents/database/schema/ | Drizzle ORM schemas |
| src/main/apiServer/ | Express API server (REST endpoints) |
| src/main/ipc.ts | Agent IPC handlers (persist, history) |
| src/renderer/src/types/agent.ts | Agent type definitions |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B131 | services/agents/services/AgentService.ts | createAgent() | Creates agent with auto-ID, validates models | P1 | extracted |
| B132 | services/agents/services/AgentService.ts | getAgent() | Fetches agent with resolved MCP tools | P1 | extracted |
| B133 | services/agents/services/AgentService.ts | listAgents() | Paginated agent listing with sort | P1 | extracted |
| B134 | services/agents/services/AgentService.ts | updateAgent() | Updates agent configuration | P1 | extracted |
| B135 | services/agents/services/AgentService.ts | deleteAgent() | Deletes agent and cascades | P1 | extracted |
| B136 | services/agents/services/SessionService.ts | createSession() | Creates session inheriting agent config | P1 | extracted |
| B137 | services/agents/services/SessionService.ts | getSession() | Fetches session with tools and commands | P1 | extracted |
| B138 | services/agents/services/SessionService.ts | listSessions() | Lists sessions (all or by agent) | P1 | extracted |
| B139 | services/agents/services/SessionService.ts | deleteSession() | Deletes session with cascade | P1 | extracted |
| B140 | services/agents/services/SessionMessageService.ts | streamSessionMessage() | Streams agent interaction via Claude SDK | P1 | extracted |
| B141 | services/agents/services/SessionMessageService.ts | listSessionMessages() | Gets messages with pagination | P1 | extracted |
| B142 | services/agents/services/SessionMessageService.ts | deleteSessionMessage() | Deletes single message | P2 | extracted |
| B143 | services/agents/claudecode/ | handleClaudeCodeStream() | Transforms Claude Code SDK stream | P1 | extracted |
| B144 | services/agents/claudecode/ | manageToolPermissions() | Manages tool permission modes | P1 | extracted |
| B145 | services/agents/services/BaseService.ts | validateAgentModels() | Validates model IDs against registry | P2 | extracted |
| B146 | services/agents/services/SessionService.ts | listSlashCommands() | Merges builtin + plugin commands | P2 | extracted |
| B147 | main/apiServer/ | agentRoutes | REST API routes for agent CRUD | P1 | extracted |
| B148 | main/apiServer/ | sessionRoutes | REST API routes for session management | P1 | extracted |
| B149 | main/apiServer/ | messageRoutes | REST API for session messages (stream) | P1 | extracted |
| B150 | main/apiServer/ | healthRoute | API health check endpoint | P2 | extracted |
| B151 | main/apiServer/ | modelRoutes | API model listing endpoint | P2 | extracted |
| B152 | main/apiServer/ | chatRoute | API chat completion endpoint | P2 | extracted |
| B153 | main/ipc.ts | AgentMessage_PersistExchange() | Persists agent messages via IPC | P1 | extracted |
| B154 | main/ipc.ts | AgentMessage_GetHistory() | Gets session message history via IPC | P1 | extracted |
| B155 | types/agent.ts | AgentEntity interface | Agent entity type definition | P1 | extracted |

## Priority Breakdown

| Priority | Count | IDs |
|----------|-------|-----|
| P1 | 19 | B131-B141, B143, B144, B147-B149, B153-B155 |
| P2 | 6 | B142, B145, B146, B150, B151, B152 |
| P3 | 0 | -- |

## Dependency Graph

```
F006-chat-core ──┐
                 │
F008-mcp ────────┼──> F009-agents
                 │
F003-providers ──┘
```

- **F006-chat-core**: Agent sessions share the message rendering and streaming infrastructure with regular chat.
- **F008-mcp**: Agents invoke MCP tools during execution. Tool schemas and permissions are resolved at session creation.
- **F003-providers**: Agent streaming requires provider/model access for Claude SDK calls.

## Key Design Decisions for Angdu Studio

1. **Drizzle ORM**: Agents use their own SQLite database with Drizzle ORM schemas, separate from the main app database. This isolation simplifies the agent subsystem.
2. **Claude Code SDK**: The Claude Code integration uses the SDK's streaming API. The `handleClaudeCodeStream()` function transforms SDK events into the app's message block format.
3. **Tool permissions**: Three modes -- allow all, deny all, ask per tool. Permissions are stored per-agent and enforced at session level.
4. **REST API server**: An Express server runs in the main process, exposing agent CRUD, session management, and message streaming as REST endpoints. This enables external tooling and testing.
5. **Session inheritance**: Sessions inherit the agent's model, system prompt, and tool configuration at creation time. Changes to the agent after session creation do not affect existing sessions.
6. **Cascade deletes**: Deleting an agent cascades to all its sessions and messages. Deleting a session cascades to its messages.
