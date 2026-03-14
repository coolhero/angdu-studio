# F013-agent — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Agent System & API Server
> Tier: 3 (Optional) | Demo Group: D3-Extras
> Dependencies: F004-ai-core, F005-assistant

---

## Feature Overview

Claude Code-style agent system with an Express-based API server exposing OpenAI-compatible endpoints (`/v1/chat/completions`). Agents have sessions with message history, configurable MCP server integrations, and tool permission management. The API server runs within the Electron main process, enabling external clients (CLI tools, scripts, other apps) to interact with Angdu Studio's AI capabilities programmatically.

---

## Runtime Exploration Results

From `runtime-exploration.md` — Settings:

- **Location**: Settings sidebar > Features group > "API Server"
- **Configuration**: API server enable/disable toggle, port setting (default 39878), API key authentication
- **Related**: Settings > Tools group for tool permission management

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| API server | `src/main/apiServer/` | Express server with OpenAI-compatible routes |
| Agent services | `src/main/services/agents/` | Agent lifecycle, session management |
| API server service | `src/main/services/ApiServerService.ts` | Server start/stop, config |
| Tool permissions store | `src/renderer/src/store/toolPermissions.ts` | Redux slice (tool permission state) |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B242 | Express API server with start/stop lifecycle | P1 | Embedded Express server in main process. Start/stop via settings toggle. Configurable port. |
| B243 | OpenAI-compatible /v1/chat/completions endpoint | P1 | Accept OpenAI-format chat completion requests. Stream or non-stream responses. |
| B244 | API key authentication | P1 | Require API key in Authorization header. Key configured in settings. |
| B245 | Agent CRUD (Drizzle ORM + SQLite) | P1 | Create, read, update, delete agents. Stored in SQLite via Drizzle ORM. |
| B246 | Agent session management | P2 | Create sessions within agents. Each session has its own message history. |
| B247 | Session message persistence | P2 | Persist messages per session in SQLite. Support conversation history retrieval. |
| B248 | MCP integration for agents | P2 | Agents can configure MCP servers. Tools available during API completions. |
| B249 | Tool permission modes (always_ask, auto_approve, per_tool) | P2 | Three permission modes for tool execution. Per-tool approve/deny lists. |
| B250 | Agent configuration (model, MCPs, custom settings) | P2 | Per-agent model selection, MCP config, and custom parameters stored as JSON. |
| B251 | API server settings UI | P1 | Settings page for API server: enable toggle, port, API key display/copy. |

---

## Business Rules

No dedicated BR entries for F013 in business-logic-map.md. Agent system uses the same AI completion pipeline (BR-001, BR-002) and MCP integration (BR-021-025) as the chat feature.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| API server port | Configurable in settings | 39878 |
| API server API key | Authentication key for external clients | "" (must be set) |

---

## For /speckit.specify

- **Entities**: Agent, Session, SessionMessage (Drizzle ORM), ToolPermissionsState (see entity-registry.md)
- **Key screens**: Settings > API Server (server config), Settings > Tools (permissions)
- **API endpoints**: `GET /v1/models`, `POST /v1/chat/completions`, `GET /v1/agents`, `POST /v1/agents`, `GET /v1/agents/:id/sessions`
- **Cross-feature**: Reuses F004-ai-core completion engine and F008-mcp tool integration

## For /speckit.plan

- **Migration impact**: Low UI, Low state (see stack-migration.md)
- **UI migration**: Minimal — settings form only, AntD -> shadcn/ui
- **State migration**: `toolPermissions` Redux slice -> part of `useMcpStore` or standalone store
- **Main process**: Express server, Drizzle ORM, agent services are Node.js — no UI migration
- **Dependencies**: Requires F004-ai-core for completion engine, F008-mcp for tool integration
- **Database**: Agent/Session/SessionMessage tables in SQLite via Drizzle ORM (separate from Redux/Zustand state)

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| HTTP API `/v1/chat/completions` | External clients | OpenAI-compatible chat completion endpoint |
| HTTP API `/v1/models` | External clients | List available models |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| AI completion pipeline | F004-ai-core | Agents use the same completion engine as chat |
| MCP tool integration | F008-mcp | Agents can use MCP servers for tool calls |
| Model listing | F003-provider | API returns models from configured providers |
| Settings (port, key) | F002-settings | API server config stored in SettingsState |
