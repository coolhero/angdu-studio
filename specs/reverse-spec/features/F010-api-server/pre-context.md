# F010 - api-server: Pre-Context

> REST API server, agent CRUD, sessions, OpenAI/Anthropic-compatible endpoints
> Tier 3, RG-6 | Dependencies: F001, F004, F005

---

## 1. Runtime Exploration Results

| Observation | Detail |
|---|---|
| Express server | Express.js app with CORS, JSON body parsing (50MB limit), request logging |
| Routes | agents, chat, mcp, messages, models — organized by domain |
| Middleware | Auth (API key), error handler, OpenAPI documentation |
| Chat endpoint | POST /completions for chat completions (OpenAI-compatible) |
| Messages endpoint | POST / for messages (Anthropic-compatible) |
| Agent system | Full agent CRUD with Drizzle ORM, SQLite database |
| Agent services | AgentService (CRUD), SessionService, SessionMessageService |
| Claude Code integration | Dedicated claudecode plugin/integration |
| API server config | Configurable port, API key auth |
| Health check | GET /health — unauthenticated status endpoint |
| Request ID | X-Request-ID header with UUID for tracing |
| Long poll timeout | Extended timeout for message streaming endpoints |
| MCP routes | MCP tool access via REST API |
| Models routes | List available models via REST API |
| Agent database | Drizzle ORM with separate database for agents |
| Agent plugins | Plugin system for agent extensions |
| OpenAPI docs | Swagger/OpenAPI documentation middleware |

## 2. Source Reference

| File Path (Cherry Studio) | Role | Rebuild Target |
|---|---|---|
| src/main/apiServer/app.ts | Express app setup, middleware, route mounting | [TBD] |
| src/main/apiServer/index.ts | Server entry point | [TBD] |
| src/main/apiServer/server.ts | HTTP server lifecycle (start, stop) | [TBD] |
| src/main/apiServer/config.ts | API server configuration | [TBD] |
| src/main/apiServer/config/ | Configuration directory | [TBD] |
| src/main/apiServer/routes/agents/ | Agent CRUD routes | [TBD] |
| src/main/apiServer/routes/chat.ts | Chat completions route (POST /completions) | [TBD] |
| src/main/apiServer/routes/messages.ts | Messages route (POST /) | [TBD] |
| src/main/apiServer/routes/models.ts | Models listing route | [TBD] |
| src/main/apiServer/routes/mcp.ts | MCP tool routes | [TBD] |
| src/main/apiServer/services/chat-completion.ts | Chat completion service | [TBD] |
| src/main/apiServer/services/messages.ts | Messages service | [TBD] |
| src/main/apiServer/services/models.ts | Models service | [TBD] |
| src/main/apiServer/services/mcp.ts | MCP service (API layer) | [TBD] |
| src/main/apiServer/middleware/auth.ts | API key authentication | [TBD] |
| src/main/apiServer/middleware/error.ts | Error handler middleware | [TBD] |
| src/main/apiServer/middleware/openapi.ts | OpenAPI/Swagger docs | [TBD] |
| src/main/apiServer/utils/ | API server utilities | [TBD] |
| src/main/apiServer/generated/ | Generated types/schemas | [TBD] |
| src/main/services/agents/index.ts | Agent module entry | [TBD] |
| src/main/services/agents/BaseService.ts | Agent base service class | [TBD] |
| src/main/services/agents/services/AgentService.ts | Agent CRUD service | [TBD] |
| src/main/services/agents/services/SessionService.ts | Session management | [TBD] |
| src/main/services/agents/services/SessionMessageService.ts | Session message management | [TBD] |
| src/main/services/agents/database/ | Drizzle schema and migrations | [TBD] |
| src/main/services/agents/interfaces/ | Agent type interfaces | [TBD] |
| src/main/services/agents/plugins/ | Agent plugins | [TBD] |
| src/main/services/agents/services/claudecode/ | Claude Code integration | [TBD] |
| src/main/services/agents/drizzle.config.ts | Drizzle ORM config | [TBD] |
| src/main/services/agents/errors.ts | Agent-specific errors | [TBD] |
| src/renderer/src/pages/settings/ToolSettings/ApiServerSettings/ | API server settings UI | [TBD] |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location |
|---|---|---|
| B291 | Start API server on configured port | server.ts |
| B292 | Stop API server | server.ts |
| B293 | Health check endpoint (GET /health) | app.ts |
| B294 | API key authentication middleware | middleware/auth.ts |
| B295 | Request ID generation (X-Request-ID header) | app.ts middleware |
| B296 | Request logging (method, path, status, duration) | app.ts middleware |
| B297 | CORS configuration (allow all origins) | app.ts cors() |
| B298 | Error handling middleware | middleware/error.ts |
| B299 | OpenAPI documentation generation | middleware/openapi.ts |
| B300 | Chat completions endpoint (OpenAI-compatible) | routes/chat.ts, services/chat-completion.ts |
| B301 | Messages endpoint (Anthropic-compatible) | routes/messages.ts, services/messages.ts |
| B302 | Extended timeout for streaming endpoints | extendMessagesTimeout middleware |
| B303 | List available models | routes/models.ts, services/models.ts |
| B304 | MCP tool access via REST API | routes/mcp.ts, services/mcp.ts |
| B305 | Agent — create agent | AgentService (create) |
| B306 | Agent — read/get agent | AgentService (get) |
| B307 | Agent — update agent | AgentService (update) |
| B308 | Agent — delete agent | AgentService (delete) |
| B309 | Agent — list agents | AgentService (list) |
| B310 | Session — create session for agent | SessionService (create) |
| B311 | Session — get session | SessionService (get) |
| B312 | Session — list sessions for agent | SessionService (list) |
| B313 | Session — delete session | SessionService (delete) |
| B314 | Session message — add message to session | SessionMessageService (add) |
| B315 | Session message — get messages for session | SessionMessageService (get) |
| B316 | Session message — delete message | SessionMessageService (delete) |
| B317 | Agent database — Drizzle schema and migrations | database/ |
| B318 | Agent base service — shared CRUD patterns | BaseService.ts |
| B319 | Agent plugins — extensible agent behavior | plugins/ |
| B320 | Claude Code — dedicated integration plugin | claudecode/ |
| B321 | MCP tools from Redux — access MCP server configs | utils/mcp (getMCPServersFromRedux) |
| B322 | API server settings — configure port and API key | ApiServerSettings UI |
| B323 | JSON body parsing with 50MB limit | app.ts express.json |
| B324 | Agent interfaces — type definitions | interfaces/ |
| B325 | Agent error types — domain-specific errors | errors.ts |
| B326 | Generated types — auto-generated schemas | generated/ |
| B327 | Long poll timeout — configurable timeout for streaming | config/timeouts.ts |
| B328 | Messages provider routes — provider-specific message handling | routes/messages.ts (messagesProviderRoutes) |
| B329 | Agent — session message streaming | SessionMessageService (streaming support) |
| B330 | API server config — port, auth, timeout settings | config.ts |

## 4. UI Component Features

| Component | Feature |
|---|---|
| ApiServerSettings | Configure API server: port, API key, enable/disable |
| Server status indicator | Shows running/stopped state |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Enable API server | Toggle in settings, server starts on configured port |
| Set API key | Enter API key in settings, used for auth middleware |
| Set port | Configure listening port |
| External API call | External client sends request, authenticated, routed to handler |
| Chat completion | POST /completions → chat service → provider → streamed response |
| Agent management | CRUD operations on agents via REST API |
| Session management | Create/list/delete sessions for agents |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| HTTP framework | Express.js (keep) | Standard, well-supported, no reason to change |
| Agent database | better-sqlite3 + Drizzle ORM | Aligns with new stack (better-sqlite3); Drizzle is already used |
| API compatibility | OpenAI + Anthropic compatible endpoints | Industry standard API formats |
| State access | Zustand (replacing Redux for getMCPServersFromRedux) | New stack decision |

## 7. Foundation Dependencies

| Dependency | Feature | What is needed |
|---|---|---|
| F001 (shell) | Server lifecycle management | Start/stop server from main process |
| F004 (provider-engine) | Model access for chat completions | Provider API for generating responses |
| F005 (chat-core) | Chat completion logic | Message processing, streaming, context management |
| F007 (mcp-tools) | MCP tool access via REST | MCP tool execution for API consumers |

## 8. Naming Remapping

| Cherry Studio | Angdu Studio |
|---|---|
| CherryHQ references | AngduStudio references |
| cherry-studio API paths | angdu-studio API paths |
| getMCPServersFromRedux | getMCPServersFromStore (Zustand) |

## 9. Static Resources

| Resource | Location | Notes |
|---|---|---|
| Agent database | {userData}/agents.db | SQLite database for agents, sessions, messages |
| Drizzle migrations | src/main/services/agents/database/ | Schema migration files |
| OpenAPI spec | Generated at runtime | Swagger documentation |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| API_SERVER_PORT | Listening port | Configurable via settings UI |
| API_SERVER_KEY | Authentication key | Required for non-health endpoints |

## 11. Feature Contracts

### Provided Contracts (F010 provides to others)

| Contract | Consumer | Description |
|---|---|---|
| REST API | External clients | OpenAI/Anthropic-compatible chat API |
| Agent CRUD API | External clients | Create and manage agents programmatically |
| MCP API | External clients | Access MCP tools via REST |

### Required Contracts (F010 requires from others)

| Contract | Provider | Description |
|---|---|---|
| Process lifecycle | F001 (shell) | Start/stop server with app lifecycle |
| Provider API | F004 (provider-engine) | Model access for chat completions |
| Chat logic | F005 (chat-core) | Message processing and streaming |
| MCP tools | F007 (mcp-tools) | Tool execution for MCP REST endpoints |

## 12. For /speckit.specify

- API server must support OpenAI-compatible chat completions endpoint
- API server must support Anthropic-compatible messages endpoint
- API key authentication required for all endpoints except health check
- Agent CRUD must persist to better-sqlite3 via Drizzle ORM
- Sessions and messages must support full lifecycle (create, list, get, delete)
- Streaming responses must work with extended timeouts
- OpenAPI documentation must be auto-generated
- Server must start/stop cleanly with application lifecycle
- CORS must be configurable (currently allow-all)

## 13. For /speckit.plan

- Phase 1: Express server setup (app, middleware, health check)
- Phase 2: Auth middleware + error handling
- Phase 3: Agent database schema (Drizzle + better-sqlite3)
- Phase 4: Agent CRUD service + routes
- Phase 5: Session and message services + routes
- Phase 6: Chat completions endpoint (OpenAI-compatible)
- Phase 7: Messages endpoint (Anthropic-compatible)
- Phase 8: Models and MCP routes
- Phase 9: OpenAPI documentation
- Phase 10: Settings UI for server configuration
- Phase 11: Claude Code integration plugin (if in scope)

## 14. For /speckit.analyze

- API server is well-structured with clear separation (routes → services → middleware)
- Agent system has its own Drizzle database — already uses SQLite, natural fit for better-sqlite3
- getMCPServersFromRedux utility needs to become getMCPServersFromStore for Zustand migration
- Claude Code integration (claudecode/) is specialized — evaluate if core scope
- Agent plugins system adds extensibility — keep the pattern but may not need all plugins initially
- Generated types in generated/ suggest code generation tooling — check if still applicable
- The dual OpenAI + Anthropic compatibility is valuable for ecosystem interoperability
- LONG_POLL_TIMEOUT_MS config is important for streaming — must be properly configured
- Agent BaseService provides shared CRUD patterns — good DRY pattern to maintain
- Express error handler must properly handle streaming errors (different from standard JSON errors)
