# Pre-Context: API Server & Agents

**Feature ID**: F012
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/apiServer/` | Express API server (app, routes, middleware) |
| `src/main/apiServer/routes/chat.ts` | OpenAI-compatible chat completions |
| `src/main/apiServer/routes/messages.ts` | Anthropic-compatible messages |
| `src/main/apiServer/routes/models.ts` | Model listing |
| `src/main/apiServer/routes/mcp.ts` | MCP proxy endpoints |
| `src/main/apiServer/routes/agents/` | Agent CRUD + sessions + messages |
| `src/main/apiServer/middleware/auth.ts` | Bearer/API key auth middleware |
| `src/main/services/ApiServerService.ts` | API server lifecycle |
| `src/main/services/agents/` | Agent system (database, services, plugins) |
| `src/main/services/agents/database/schema/` | Drizzle agent/session/message schemas |
| `src/main/services/agents/plugins/PluginService.ts` | Plugin management |
| `src/main/services/CodeToolsService.ts` | External CLI tool integration |
| `src/renderer/src/store/codeTools.ts` | Code tools Redux slice |
| `src/renderer/src/types/agent.ts` | Agent Zod schemas |
| `src/renderer/src/types/apiServer.ts` | API server config type |
| `src/renderer/src/types/plugin.ts` | Plugin types |
| `resources/database/drizzle/` | Drizzle migration files |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: REST API endpoint contracts, agent session lifecycle, Drizzle schema definitions, auth middleware pattern, plugin installation/validation logic, code tool launch patterns
- Ignore: Redux codeTools slice, Ant Design API server settings UI

### Static Resources

None.

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `CHERRY_AUTO_ALLOW_TOOLS` | feature-flag | No | Auto-approve Claude Code tools | `1` |

---

## For /speckit.specify

### Existing Feature Summary

API Server & Agents provides a built-in OpenAI/Anthropic-compatible REST API, Claude Code agent system (with Drizzle ORM sessions/messages), plugin management (install/uninstall/validate), and external CLI tool integration (Claude Code, Qwen Code, Gemini CLI, etc.). The API server enables external tools and scripts to use Cherry Studio's AI providers.

### Draft Requirements

- **FR-076**: Implement Express REST API with OpenAI-compatible chat completions endpoint
- **FR-077**: Implement Anthropic-compatible messages endpoint
- **FR-078**: Implement model listing endpoint
- **FR-079**: Implement Bearer/API key authentication middleware
- **FR-080**: Implement Agent CRUD with Drizzle ORM (agents, sessions, session_messages tables)
- **FR-081**: Implement agent session execution (message → agent → response)
- **FR-082**: Implement plugin system (install, uninstall, validate with Zod)
- **FR-083**: Implement external CLI tool launcher (Claude Code, Qwen Code, etc.)

### Draft Acceptance Criteria

- **SC-045**: Chat completions endpoint returns valid OpenAI-format response
- **SC-046**: Streaming via SSE works for both OpenAI and Anthropic formats
- **SC-047**: Agent sessions persist across app restarts via SQLite
- **SC-048**: Plugins install and validate correctly

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC, DB | API server uses IPC, Drizzle uses better-sqlite3 |
| F003-provider-management | Provider config | Resolves providers for API calls |
| F005-ai-completion | Pipeline | Routes through AI completion for chat/messages |
| F007-mcp | Tool proxy | MCP endpoints proxy to MCP service |

### Related Entities

#### Owned Entities

**Agent (Drizzle)** — 14 fields
**Session (Drizzle)** — 16 fields
**SessionMessage (Drizzle)** — 8 fields
**ApiServerConfig** — 4 fields
**PluginMetadata** — 16 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Chat format | F005 | Verify API server correctly calls completion pipeline |
| MCP proxy | F007 | Verify MCP endpoints route correctly |
| Provider resolution | F003 | Verify model format `provider:model_id` resolves correctly |
