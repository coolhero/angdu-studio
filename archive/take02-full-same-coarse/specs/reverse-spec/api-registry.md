# API Registry

**Source**: `/Users/coolhero/Study/oss/cherry-studio`
**Generated**: 2026-03-02
**Total Endpoints**: 21 REST routes + ~260 IPC invoke/handle channels + ~30 IPC push events

> Used as a preliminary reference when writing contracts/ during spec-kit /speckit.plan.
> When writing the plan for each Feature, directly reflect provided APIs into contracts/,
> and check contracts for consumed APIs in this registry to ensure compatibility.

---

## API Surface Overview

Cherry Studio exposes two distinct API surfaces:

1. **Express REST API** -- An HTTP server (default `localhost:7777`) providing OpenAI-compatible and Anthropic-compatible chat endpoints, model listing, MCP proxy, and agent CRUD. 21 routes total.
2. **Electron IPC Channels** -- Bidirectional communication between the main process and renderer via `ipcMain.handle`/`ipcRenderer.invoke` (~260 channels) and push events via `webContents.send` (~30 channels).

---

## Part 1: Express REST API

### Global Configuration

| Setting | Value |
|---------|-------|
| Default host | `127.0.0.1` (configurable via Redux `settings.apiServer.host`) |
| Default port | `7777` (configurable via Redux `settings.apiServer.port`) |
| Body parser limit | `50mb` JSON |
| CORS | `origin: *`, methods `GET, POST, PUT, DELETE, OPTIONS` |
| Request timeout | 5 min (global), 120 min (messages/streaming routes) |
| Headers timeout | Request timeout + 5s |
| Keep-alive timeout | 60s |
| API key format | `cs-sk-<uuid>` (auto-generated if missing) |
| Request ID header | `X-Request-ID` (UUID, set on every response) |

### Authentication

All `/v1/*` and `/:provider/v1/messages` routes require authentication. Two mechanisms accepted (checked in priority order):

1. **x-api-key header**: `x-api-key: cs-sk-<uuid>`
2. **Bearer token**: `Authorization: Bearer cs-sk-<uuid>`

Timing-safe comparison is used for token validation.

**Error responses**:
- `401 Unauthorized` -- Missing credentials, empty token, or invalid format
- `403 Forbidden` -- Invalid token value or no API key configured

### Endpoint Index

| Method | Path | Feature | Auth | Description |
|--------|------|---------|------|-------------|
| GET | `/` | F007-extensions | Public | API info (name, version, endpoints) |
| GET | `/health` | F007-extensions | Public | Health check (status, timestamp, version) |
| GET | `/api-docs` | F007-extensions | Public | Swagger UI |
| GET | `/api-docs.json` | F007-extensions | Public | OpenAPI 3.0 JSON spec |
| POST | `/v1/chat/completions` | F007-extensions | Bearer/x-api-key | OpenAI-compatible chat completion |
| POST | `/v1/messages` | F007-extensions | Bearer/x-api-key | Anthropic Messages API (model has provider prefix) |
| POST | `/:provider_id/v1/messages` | F007-extensions | Bearer/x-api-key | Anthropic Messages API (provider in path) |
| GET | `/v1/models` | F007-extensions | Bearer/x-api-key | List available models |
| GET | `/v1/mcps` | F007-extensions | Bearer/x-api-key | List MCP servers |
| GET | `/v1/mcps/:server_id` | F007-extensions | Bearer/x-api-key | Get MCP server info with tools |
| ALL | `/v1/mcps/:server_id/mcp` | F007-extensions | Bearer/x-api-key | StreamableHTTP MCP transport |
| POST | `/v1/agents` | F007-extensions | Bearer/x-api-key | Create agent |
| GET | `/v1/agents` | F007-extensions | Bearer/x-api-key | List agents (paginated) |
| GET | `/v1/agents/:agentId` | F007-extensions | Bearer/x-api-key | Get agent by ID |
| PUT | `/v1/agents/:agentId` | F007-extensions | Bearer/x-api-key | Replace agent (full update) |
| PATCH | `/v1/agents/:agentId` | F007-extensions | Bearer/x-api-key | Update agent (partial) |
| DELETE | `/v1/agents/:agentId` | F007-extensions | Bearer/x-api-key | Delete agent (cascades sessions) |
| POST | `/v1/agents/:agentId/sessions` | F007-extensions | Bearer/x-api-key | Create session for agent |
| GET | `/v1/agents/:agentId/sessions` | F007-extensions | Bearer/x-api-key | List sessions for agent |
| GET | `/v1/agents/:agentId/sessions/:sessionId` | F007-extensions | Bearer/x-api-key | Get session with messages |
| PUT | `/v1/agents/:agentId/sessions/:sessionId` | F007-extensions | Bearer/x-api-key | Replace session |
| PATCH | `/v1/agents/:agentId/sessions/:sessionId` | F007-extensions | Bearer/x-api-key | Update session (partial) |
| DELETE | `/v1/agents/:agentId/sessions/:sessionId` | F007-extensions | Bearer/x-api-key | Delete session (auto-recreates if last) |
| POST | `/v1/agents/:agentId/sessions/:sessionId/messages` | F007-extensions | Bearer/x-api-key | Create message (SSE stream) |
| DELETE | `/v1/agents/:agentId/sessions/:sessionId/messages/:messageId` | F007-extensions | Bearer/x-api-key | Delete message |

### Cross-Feature API Dependencies

| API | Provider | Consumer(s) | Call Purpose |
|-----|----------|-------------|-------------|
| IPC `app:info` | F001-platform | F007-extensions (REST `/`) | App version for API info endpoint |
| Redux `state.settings.apiServer` | F001-platform | F007-extensions | API server config (port, host, apiKey) |
| Redux `state.llm.providers` | F001-platform | F007-extensions (REST models, chat, messages) | Provider list for model resolution |
| Redux MCP servers | F003-chat | F007-extensions (REST `/v1/mcps/*`) | MCP server list and proxy |
| `MCPService.initClient()` | F003-chat | F007-extensions (REST `/v1/mcps/:id`) | MCP client connection for tool listing |
| `AnthropicService.getValidAccessToken()` | F001-platform (OAuth) | F007-extensions (REST `/v1/messages`) | OAuth token for Anthropic API calls |
| `agentService` / `sessionService` | F007-extensions | F007-extensions (REST agents CRUD) | Agent/session persistence (SQLite) |
| `sessionMessageService` | F007-extensions | F007-extensions (REST messages) | Message persistence and streaming |

---

### F007-extensions APIs (REST)

#### GET /

**Original Source**: `src/main/apiServer/app.ts:118`
**Authentication**: Public (no authentication required)

##### Request

**Headers**: None required

##### Response

**200 OK**:
```json
{
  "name": "Cherry Studio API",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health"
  }
}
```

##### Dependencies
- **Entity**: None
- **Cross-Feature Consumers**: External clients for API discovery

---

#### GET /health

**Original Source**: `src/main/apiServer/app.ts:85`
**Authentication**: Public (no authentication required)

##### Request

**Headers**: None required

##### Response

**200 OK**:
```json
{
  "status": "ok",
  "timestamp": "string (ISO 8601)",
  "version": "string (npm_package_version or '1.0.0')"
}
```

##### Dependencies
- **Entity**: None
- **Cross-Feature Consumers**: Monitoring, health probes

---

#### GET /api-docs

**Original Source**: `src/main/apiServer/middleware/openapi.ts:188`
**Authentication**: Public (no authentication required)

##### Request

**Headers**: None required

##### Response

**200 OK**: Swagger UI HTML page

---

#### GET /api-docs.json

**Original Source**: `src/main/apiServer/middleware/openapi.ts:182`
**Authentication**: Public (no authentication required)

##### Request

**Headers**: None required

##### Response

**200 OK**: OpenAPI 3.0 JSON specification document

---

#### POST /v1/chat/completions

**Original Source**: `src/main/apiServer/routes/chat.ts:183`
**Authentication**: Bearer token or x-api-key (required)

OpenAI-compatible chat completion endpoint. Supports both streaming and non-streaming modes. Only works with `openai`-type providers.

##### Request

**Headers**:
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Y |
| Authorization | Bearer {api_key} | Y (or x-api-key) |
| x-api-key | {api_key} | Y (or Authorization) |

**Body**:
```json
{
  "model": "string (required, format: 'provider_id:model_id', e.g. 'my-openai:gpt-4')",
  "messages": [
    {
      "role": "string (required, enum: system|user|assistant|tool)",
      "content": "string | array of content parts",
      "name": "string (optional)",
      "tool_calls": [
        {
          "id": "string",
          "type": "string",
          "function": {
            "name": "string",
            "arguments": "string (JSON)"
          }
        }
      ]
    }
  ],
  "temperature": "number (optional, 0-2, default 1)",
  "max_tokens": "integer (optional, min 1)",
  "stream": "boolean (optional, default false)",
  "tools": [
    {
      "type": "string",
      "function": {
        "name": "string",
        "description": "string",
        "parameters": "object (JSON Schema)"
      }
    }
  ]
}
```

##### Response

**200 OK** (non-streaming):
```json
{
  "id": "string",
  "object": "chat.completion",
  "created": "integer (unix timestamp)",
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "string"
      },
      "finish_reason": "string (stop|length|tool_calls)"
    }
  ],
  "usage": {
    "prompt_tokens": "integer",
    "completion_tokens": "integer",
    "total_tokens": "integer"
  }
}
```

**200 OK** (streaming, `Content-Type: text/event-stream`):
```
data: {"id":"...","object":"chat.completion.chunk","created":...,"model":"...","choices":[{"index":0,"delta":{"content":"..."},"finish_reason":null}]}

data: [DONE]
```

**400 Bad Request**:
```json
{
  "error": {
    "message": "string (validation details or model error)",
    "type": "invalid_request_error",
    "code": "validation_failed | invalid_model_format | provider_not_found | model_not_available | unsupported_provider_type"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": {
    "message": "string",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}
```

**429 Rate Limit**:
```json
{
  "error": {
    "message": "string",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**500/502 Server Error**:
```json
{
  "error": {
    "message": "string",
    "type": "server_error",
    "code": "internal_error | upstream_error"
  }
}
```

##### Dependencies
- **Entity**: Provider (read), Model (read)
- **Called APIs**: Upstream OpenAI-compatible provider API
- **Cross-Feature Consumers**: External clients, IDE integrations

---

#### POST /v1/messages

**Original Source**: `src/main/apiServer/routes/messages.ts:208`
**Authentication**: Bearer token or x-api-key (required)

Anthropic Messages API-compatible endpoint. Model ID must include the provider prefix (format: `provider_id:model_id`). Provider is resolved from the model string. Supports streaming via SSE when `stream: true`.

##### Request

**Headers**:
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Y |
| Authorization | Bearer {api_key} | Y (or x-api-key) |

Additional headers (except `host`, `x-api-key`, `authorization`, `sentry-trace`, `baggage`, `content-length`, `connection`) are forwarded to the upstream Anthropic API.

**Body**:
```json
{
  "model": "string (required, format: 'provider_id:model_id', e.g. 'my-anthropic:claude-3-5-sonnet-20241022')",
  "max_tokens": "integer (required, min 1)",
  "messages": [
    {
      "role": "string (required, enum: user|assistant)",
      "content": "string | array of content blocks"
    }
  ],
  "system": "string (optional, system message)",
  "temperature": "number (optional, 0-1)",
  "top_p": "number (optional, 0-1)",
  "top_k": "integer (optional, min 0)",
  "stream": "boolean (optional)",
  "tools": "array (optional, tool definitions)"
}
```

##### Response

**200 OK** (non-streaming):
```json
{
  "id": "string",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "string"
    }
  ],
  "model": "string",
  "stop_reason": "string (end_turn|max_tokens|stop_sequence|tool_use)",
  "stop_sequence": "string | null",
  "usage": {
    "input_tokens": "integer",
    "output_tokens": "integer"
  }
}
```

**200 OK** (streaming, `Content-Type: text/event-stream`):
```
event: message_start
data: {"type":"message_start","message":{...}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"..."}}

data: [DONE]
```

**400 Bad Request**:
```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "string"
  }
}
```

**401/403/429/500**: Same error structure as above

##### Dependencies
- **Entity**: Provider (read)
- **Called APIs**: Upstream Anthropic API (or compatible)
- **Service**: `AnthropicService.getValidAccessToken()` for OAuth providers
- **Cross-Feature Consumers**: External clients (e.g. Claude Code, Cursor)

---

#### POST /:provider_id/v1/messages

**Original Source**: `src/main/apiServer/routes/messages.ts:362`
**Authentication**: Bearer token or x-api-key (required)

Same as `POST /v1/messages` but provider is specified in the URL path instead of the model string. The `model` field in the body does NOT need the provider prefix.

##### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| provider_id | string | Y | Provider ID (e.g. `my-anthropic`) |

**Body**: Same as `/v1/messages` except `model` does not need provider prefix (e.g. `claude-3-5-sonnet-20241022` instead of `my-anthropic:claude-3-5-sonnet-20241022`).

##### Response

Same as `POST /v1/messages`.

---

#### GET /v1/models

**Original Source**: `src/main/apiServer/routes/models.ts:78`
**Authentication**: Bearer token or x-api-key (required)

Returns available AI models from all configured and enabled providers (openai and anthropic types). Models are deduplicated by full ID. Supports optional filtering and pagination.

##### Request

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| providerType | string | N | - | Filter: `openai`, `openai-response`, `anthropic`, `gemini` |
| offset | integer | N | 0 | Pagination offset (min 0) |
| limit | integer | N | - | Max models to return (min 1) |

##### Response

**200 OK**:
```json
{
  "object": "list",
  "data": [
    {
      "id": "string (format: provider_id:model_id)",
      "object": "model",
      "name": "string",
      "created": "integer (unix timestamp)",
      "owned_by": "string (provider display name)",
      "provider": "string (provider ID)",
      "provider_name": "string",
      "provider_type": "string (openai|anthropic)",
      "provider_model_id": "string (raw model ID without provider prefix)"
    }
  ],
  "total": "integer (present when pagination used)",
  "offset": "integer (present when pagination used)",
  "limit": "integer (present when pagination used)"
}
```

**400 Bad Request**:
```json
{
  "error": {
    "message": "Invalid query parameters",
    "type": "invalid_request_error",
    "code": "invalid_parameters",
    "details": [
      { "field": "string", "message": "string" }
    ]
  }
}
```

**503 Service Unavailable**:
```json
{
  "error": {
    "message": "Failed to retrieve models from available providers",
    "type": "service_unavailable",
    "code": "models_unavailable"
  }
}
```

##### Dependencies
- **Entity**: Provider (read), Model (read) via Redux
- **Cross-Feature Consumers**: External clients for model discovery

---

#### GET /v1/mcps

**Original Source**: `src/main/apiServer/routes/mcp.ts:45`
**Authentication**: Bearer token or x-api-key (required)

Lists all active (enabled) MCP servers from the Redux store.

##### Response

**200 OK**:
```json
{
  "success": true,
  "data": {
    "servers": {
      "<server_id>": {
        "id": "string",
        "name": "string",
        "type": "streamableHttp",
        "description": "string",
        "url": "string (e.g. http://localhost:7777/v1/mcps/<id>/mcp)"
      }
    }
  }
}
```

**503 Service Unavailable**:
```json
{
  "success": false,
  "error": {
    "message": "Failed to retrieve MCP servers: ...",
    "type": "service_unavailable",
    "code": "servers_unavailable"
  }
}
```

---

#### GET /v1/mcps/:server_id

**Original Source**: `src/main/apiServer/routes/mcp.ts:105`
**Authentication**: Bearer token or x-api-key (required)

Gets detailed information about a specific MCP server, including its available tools (by connecting to the server via MCPService).

##### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| server_id | string | Y | MCP server ID |

##### Response

**200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "type": "string (stdio|sse|streamableHttp)",
    "description": "string",
    "tools": [
      {
        "name": "string",
        "description": "string",
        "inputSchema": "object (JSON Schema)"
      }
    ]
  }
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "message": "MCP server not found",
    "type": "not_found",
    "code": "server_not_found"
  }
}
```

---

#### ALL /v1/mcps/:server_id/mcp

**Original Source**: `src/main/apiServer/routes/mcp.ts:140`
**Authentication**: Bearer token or x-api-key (required)

StreamableHTTP transport endpoint for MCP protocol communication. Proxies JSON-RPC messages to the actual MCP server. Supports session management via `mcp-session-id` header.

##### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| server_id | string | Y | MCP server ID |

**Headers**:
| Header | Value | Required |
|--------|-------|----------|
| mcp-session-id | string (UUID) | N (assigned on first request) |

**Body**: JSON-RPC message(s) per MCP protocol specification.

##### Response

Per MCP StreamableHTTP transport specification (JSON-RPC responses, SSE for notifications).

---

#### POST /v1/agents

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:53`
**Authentication**: Bearer token or x-api-key (required)

Creates a new autonomous agent. Automatically provisions an initial default session that mirrors the agent settings. If session creation fails, the agent is rolled back.

##### Request

**Body**:
```json
{
  "type": "string (required, enum: claude-code)",
  "name": "string (required, minLength 1)",
  "model": "string (required, minLength 1, main model ID)",
  "description": "string (optional)",
  "accessible_paths": ["string (optional, directory paths)"],
  "instructions": "string (optional, system prompt)",
  "plan_model": "string (optional, planning model ID)",
  "small_model": "string (optional, small/fast model ID)",
  "mcps": ["string (optional, MCP tool IDs)"],
  "allowed_tools": ["string (optional, whitelist of tool IDs)"],
  "configuration": {
    "permission_mode": "string (optional, enum: default|acceptEdits|bypassPermissions|plan, default: default)",
    "max_turns": "integer (optional, default: 10)"
  }
}
```

##### Response

**201 Created**:
```json
{
  "id": "string (UUID)",
  "type": "claude-code",
  "name": "string",
  "model": "string",
  "description": "string",
  "accessible_paths": ["string"],
  "instructions": "string",
  "plan_model": "string",
  "small_model": "string",
  "mcps": ["string"],
  "allowed_tools": ["string"],
  "configuration": { "permission_mode": "string", "max_turns": "integer" },
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

**400 Bad Request**: Validation error or model validation error
**500 Internal Error**: Agent or session creation failure

---

#### GET /v1/agents

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:184`
**Authentication**: Bearer token or x-api-key (required)

##### Request

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | N | 20 | Items per page (1-100) |
| offset | integer | N | 0 | Items to skip (min 0) |
| sortBy | string | N | created_at | Sort field: `created_at`, `updated_at`, `name` |
| orderBy | string | N | desc | Sort direction: `asc`, `desc` |

##### Response

**200 OK**:
```json
{
  "data": [ "...AgentEntity objects" ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```

---

#### GET /v1/agents/:agentId

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:253`
**Authentication**: Bearer token or x-api-key (required)

##### Response

**200 OK**: AgentEntity object (same as POST response)
**404 Not Found**: `{ "error": { "message": "Agent not found", "type": "not_found", "code": "agent_not_found" } }`

---

#### PUT /v1/agents/:agentId

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:331`
**Authentication**: Bearer token or x-api-key (required)

Full replacement of agent. All fields from ReplaceAgentRequest are applied (requires `model` and `accessible_paths`).

##### Request

**Body**: Same schema as AgentBase (model and accessible_paths required).

##### Response

**200 OK**: Updated AgentEntity
**400/404/500**: Error responses

---

#### PATCH /v1/agents/:agentId

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:477`
**Authentication**: Bearer token or x-api-key (required)

Partial update. Only provided fields are changed.

##### Request

**Body**: Any subset of AgentBase fields (all optional).

##### Response

**200 OK**: Updated AgentEntity
**400/404/500**: Error responses

---

#### DELETE /v1/agents/:agentId

**Original Source**: `src/main/apiServer/routes/agents/handlers/agents.ts:554`
**Authentication**: Bearer token or x-api-key (required)

Deletes agent and all associated sessions and logs.

##### Response

**204 No Content**: Success (empty body)
**404 Not Found**: Agent not found

---

#### POST /v1/agents/:agentId/sessions

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:19`
**Authentication**: Bearer token or x-api-key (required)

##### Request

**Body**:
```json
{
  "model": "string (required, minLength 1)",
  "name": "string (optional)",
  "description": "string (optional)",
  "accessible_paths": ["string (optional)"],
  "instructions": "string (optional)",
  "plan_model": "string (optional)",
  "small_model": "string (optional)",
  "mcps": ["string (optional)"],
  "allowed_tools": ["string (optional)"],
  "configuration": { "permission_mode": "string", "max_turns": "integer" }
}
```

##### Response

**201 Created**:
```json
{
  "id": "string (UUID)",
  "agent_id": "string",
  "agent_type": "claude-code",
  "model": "string",
  "name": "string",
  "description": "string",
  "accessible_paths": ["string"],
  "instructions": "string",
  "configuration": {},
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

#### GET /v1/agents/:agentId/sessions

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:54`
**Authentication**: Bearer token or x-api-key (required)

##### Request

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | N | 20 | Items per page (1-100) |
| offset | integer | N | 0 | Items to skip |
| status | string | N | - | Filter: `idle`, `running`, `completed`, `failed`, `stopped` |

##### Response

**200 OK**:
```json
{
  "data": [ "...SessionEntity objects" ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```

---

#### GET /v1/agents/:agentId/sessions/:sessionId

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:90`
**Authentication**: Bearer token or x-api-key (required)

Returns session details with full message history included.

##### Response

**200 OK**:
```json
{
  "id": "string",
  "agent_id": "string",
  "agent_type": "claude-code",
  "...other session fields",
  "messages": [
    {
      "id": "number",
      "session_id": "string",
      "role": "string (assistant|user|system|tool)",
      "content": "object (AI SDK format)",
      "agent_session_id": "string",
      "metadata": "object",
      "created_at": "string (ISO 8601)",
      "updated_at": "string (ISO 8601)"
    }
  ]
}
```

---

#### PUT /v1/agents/:agentId/sessions/:sessionId

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:143`
**Authentication**: Bearer token or x-api-key (required)

Full session replacement. Verifies session belongs to agent.

---

#### PATCH /v1/agents/:agentId/sessions/:sessionId

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:204`
**Authentication**: Bearer token or x-api-key (required)

Partial session update. Merges provided fields with existing session.

---

#### DELETE /v1/agents/:agentId/sessions/:sessionId

**Original Source**: `src/main/apiServer/routes/agents/handlers/sessions.ts:263`
**Authentication**: Bearer token or x-api-key (required)

Deletes a session. If it was the last session for the agent, a new default session is automatically created.

##### Response

**204 No Content**: Success
**404 Not Found**: Session not found for agent
**500 Internal Error**: Session recovery failure (if last session auto-recreation fails)

---

#### POST /v1/agents/:agentId/sessions/:sessionId/messages

**Original Source**: `src/main/apiServer/routes/agents/handlers/messages.ts:32`
**Authentication**: Bearer token or x-api-key (required)

Creates a new message in a session. Always streams the response via SSE. The stream timeout is 120 minutes. Handles client disconnect detection and cleanup.

##### Request

**Body**:
```json
{
  "content": "string (required, minLength 1)"
}
```

##### Response

**SSE Stream** (`Content-Type: text/event-stream`):
```
data: {"type":"...","...":"..."}

data: [DONE]
```

SSE events include agent processing updates. On error:
```
data: {"type":"error","error":{"message":"...","type":"timeout_error|stream_error|not_found","code":"stream_timeout|stream_processing_failed|stream_creation_failed"}}
```

---

#### DELETE /v1/agents/:agentId/sessions/:sessionId/messages/:messageId

**Original Source**: `src/main/apiServer/routes/agents/handlers/messages.ts:264`
**Authentication**: Bearer token or x-api-key (required)

##### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messageId | integer | Y | Message ID (numeric) |

##### Response

**204 No Content**: Success
**404 Not Found**: Agent, session, or message not found

---

## Part 2: Electron IPC Channels

IPC channels use Electron's `ipcMain.handle` / `ipcRenderer.invoke` pattern for request-response, and `webContents.send` / `ipcRenderer.on` for push events from main to renderer.

### IPC Channel Index by Feature

#### F001-platform -- App, File, Window, System

> **✅ Plan finalized**: See `specs/001-platform/contracts/ipc-channels.md` for the 40 channels being implemented in F001. The full original channel listing below serves as reference; the plan contracts define the simplified subset with typed parameters and return types.

##### app:* namespace (46 channels, 13 finalized in plan)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `app:get-cache-size` | invoke/handle | Get cache size |
| `app:clear-cache` | invoke/handle | Clear application cache |
| `app:set-launch-on-boot` | invoke/handle | Enable/disable launch at login |
| `app:set-language` | invoke/handle | Set application language |
| `app:set-enable-spell-check` | invoke/handle | Toggle spell check |
| `app:set-spell-check-languages` | invoke/handle | Set spell check languages |
| `app:check-for-update` | invoke/handle | Check for app updates |
| `app:quit-and-install` | invoke/handle | Install pending update and restart |
| `app:reload` | invoke/handle | Reload the application window |
| `app:quit` | invoke/handle | Quit the application |
| `app:info` | invoke/handle | Get app info (version, paths, etc.) |
| `app:proxy` | invoke/handle | Set proxy configuration |
| `app:set-launch-to-tray` | invoke/handle | Set launch-to-tray behavior |
| `app:set-tray` | invoke/handle | Enable/disable system tray |
| `app:set-tray-on-close` | invoke/handle | Minimize to tray on close |
| `app:set-theme` | invoke/handle | Set application theme |
| `app:set-auto-update` | invoke/handle | Enable/disable auto-update |
| `app:set-test-plan` | invoke/handle | Set test plan configuration |
| `app:set-test-channel` | invoke/handle | Set update channel (stable/beta) |
| `app:handle-zoom-factor` | invoke/handle | Set window zoom factor |
| `app:select` | invoke/handle | Show native select dialog |
| `app:has-write-permission` | invoke/handle | Check write permission for path |
| `app:resolve-path` | invoke/handle | Resolve a file path |
| `app:is-path-inside` | invoke/handle | Check if path is inside another |
| `app:copy` | invoke/handle | Copy to clipboard |
| `app:set-stop-quit-app` | invoke/handle | Prevent app from quitting |
| `app:set-app-data-path` | invoke/handle | Set custom app data path |
| `app:get-data-path-from-args` | invoke/handle | Get data path from CLI args |
| `app:flush-app-data` | invoke/handle | Flush app data to disk |
| `app:is-not-empty-dir` | invoke/handle | Check if directory is non-empty |
| `app:relaunch-app` | invoke/handle | Relaunch the application |
| `app:reset-data` | invoke/handle | Reset all application data |
| `app:is-binary-exist` | invoke/handle | Check if a binary exists |
| `app:get-binary-path` | invoke/handle | Get path to a binary |
| `app:install-uv-binary` | invoke/handle | Install uv binary |
| `app:install-bun-binary` | invoke/handle | Install bun binary |
| `app:install-ovms-binary` | invoke/handle | Install OVMS binary |
| `app:log-to-main` | invoke/handle | Forward renderer log to main |
| `app:save-data` | invoke/handle | Persist data to storage |
| `app:get-disk-info` | invoke/handle | Get disk space info |
| `app:set-full-screen` | invoke/handle | Toggle fullscreen mode |
| `app:is-full-screen` | invoke/handle | Check if window is fullscreen |
| `app:get-system-fonts` | invoke/handle | List system fonts |
| `app:get-ip-country` | invoke/handle | Get IP geolocation country |
| `app:crash-render-process` | invoke/handle | Crash renderer (dev/debug) |
| `app:mac-is-process-trusted` | invoke/handle | macOS: check accessibility trust |
| `app:mac-request-process-trust` | invoke/handle | macOS: request accessibility trust |
| `app:quote-to-main` | invoke/handle | Forward quote data to main |
| `app:set-disable-hardware-acceleration` | invoke/handle | Toggle hardware acceleration |
| `app:set-use-system-title-bar` | invoke/handle | Toggle system title bar |

##### file:* namespace (46 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `file:open` | invoke/handle | Open file dialog |
| `file:openPath` | invoke/handle | Open a specific file path |
| `file:save` | invoke/handle | Save file dialog |
| `file:select` | invoke/handle | Select file(s) dialog |
| `file:upload` | invoke/handle | Upload file to app storage |
| `file:clear` | invoke/handle | Clear file storage |
| `file:read` | invoke/handle | Read file from app storage |
| `file:readExternal` | invoke/handle | Read external file |
| `file:delete` | invoke/handle | Delete a file |
| `file:deleteDir` | invoke/handle | Delete a directory |
| `file:deleteExternalFile` | invoke/handle | Delete external file |
| `file:deleteExternalDir` | invoke/handle | Delete external directory |
| `file:move` | invoke/handle | Move a file |
| `file:moveDir` | invoke/handle | Move a directory |
| `file:rename` | invoke/handle | Rename a file |
| `file:renameDir` | invoke/handle | Rename a directory |
| `file:get` | invoke/handle | Get file metadata |
| `file:selectFolder` | invoke/handle | Select folder dialog |
| `file:createTempFile` | invoke/handle | Create temporary file |
| `file:mkdir` | invoke/handle | Create directory |
| `file:write` | invoke/handle | Write content to file |
| `file:writeWithId` | invoke/handle | Write content with ID |
| `file:saveImage` | invoke/handle | Save image to storage |
| `file:base64Image` | invoke/handle | Get image as base64 |
| `file:saveBase64Image` | invoke/handle | Save base64 data as image |
| `file:savePastedImage` | invoke/handle | Save pasted image |
| `file:download` | invoke/handle | Download file from URL |
| `file:copy` | invoke/handle | Copy file |
| `file:binaryImage` | invoke/handle | Get image as binary |
| `file:base64File` | invoke/handle | Get file as base64 |
| `file:getPdfInfo` | invoke/handle | Get PDF metadata |
| `fs:read` | invoke/handle | Read from filesystem |
| `fs:readText` | invoke/handle | Read text file |
| `file:openWithRelativePath` | invoke/handle | Open file with relative path |
| `file:isTextFile` | invoke/handle | Check if file is text |
| `file:isDirectory` | invoke/handle | Check if path is directory |
| `file:listDirectory` | invoke/handle | List directory contents |
| `file:getDirectoryStructure` | invoke/handle | Get full directory tree |
| `file:checkFileName` | invoke/handle | Validate file name |
| `file:validateNotesDirectory` | invoke/handle | Validate notes directory |
| `file:startWatcher` | invoke/handle | Start file watcher |
| `file:stopWatcher` | invoke/handle | Stop file watcher |
| `file:pauseWatcher` | invoke/handle | Pause file watcher |
| `file:resumeWatcher` | invoke/handle | Resume file watcher |
| `file:batchUploadMarkdown` | invoke/handle | Batch upload markdown files |
| `file:showInFolder` | invoke/handle | Show file in system file manager |

##### window:* namespace (8 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `window:reset-minimum-size` | invoke/handle | Reset window minimum size |
| `window:set-minimum-size` | invoke/handle | Set window minimum size |
| `window:resize` | invoke/handle | Resize window |
| `window:get-size` | invoke/handle | Get current window size |
| `window:minimize` | invoke/handle | Minimize window |
| `window:maximize` | invoke/handle | Maximize window |
| `window:unmaximize` | invoke/handle | Unmaximize window |
| `window:close` | invoke/handle | Close window |

##### Other F001-platform channels

| Channel | Direction | Description |
|---------|-----------|-------------|
| `open:path` | invoke/handle | Open path in system |
| `open:website` | invoke/handle | Open URL in browser |
| `config:set` | invoke/handle | Set configuration value |
| `config:get` | invoke/handle | Get configuration value |
| `notification:send` | invoke/handle | Send system notification |
| `notification:on-click` | push (main->renderer) | Notification clicked |
| `webview:set-open-link-external` | invoke/handle | Set external link behavior |
| `webview:set-spell-check-enabled` | invoke/handle | Toggle webview spell check |
| `webview:search-hotkey` | invoke/handle | Handle search hotkey |
| `webview:print-to-pdf` | invoke/handle | Print webview to PDF |
| `webview:save-as-html` | invoke/handle | Save webview as HTML |
| `miniwindow:show` | invoke/handle | Show mini window |
| `miniwindow:hide` | invoke/handle | Hide mini window |
| `miniwindow:close` | invoke/handle | Close mini window |
| `miniwindow:toggle` | invoke/handle | Toggle mini window |
| `miniwindow:set-pin` | invoke/handle | Pin/unpin mini window |
| `system:getDeviceType` | invoke/handle | Get device type |
| `system:getHostname` | invoke/handle | Get system hostname |
| `system:getCpuName` | invoke/handle | Get CPU name |
| `system:checkGitBash` | invoke/handle | Check if Git Bash available |
| `system:getGitBashPath` | invoke/handle | Get Git Bash path |
| `system:getGitBashPathInfo` | invoke/handle | Get Git Bash path info |
| `system:setGitBashPath` | invoke/handle | Set Git Bash path |
| `system:toggleDevTools` | invoke/handle | Toggle DevTools |
| `shortcuts:update` | invoke/handle | Update keyboard shortcuts |
| `zip:compress` | invoke/handle | Compress files to zip |
| `zip:decompress` | invoke/handle | Decompress zip file |
| `export:word` | invoke/handle | Export to Word document |
| `aes:encrypt` | invoke/handle | AES encrypt data |
| `aes:decrypt` | invoke/handle | AES decrypt data |
| `search-window:open` | invoke/handle | Open search window |
| `search-window:close` | invoke/handle | Close search window |
| `search-window:open-url` | invoke/handle | Open URL in search window |
| `analytics:track-token-usage` | invoke/handle | Track token usage analytics |
| `minapp` | invoke/handle | Launch mini application |
| `provider:add-key` | invoke/handle | Add provider API key |

---

#### F003-chat -- MCP, Memory, Trace, Selection, Store Sync

##### mcp:* namespace (15 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `mcp:add-server` | invoke/handle | Register MCP server |
| `mcp:remove-server` | invoke/handle | Remove MCP server |
| `mcp:restart-server` | invoke/handle | Restart MCP server |
| `mcp:stop-server` | invoke/handle | Stop MCP server |
| `mcp:list-tools` | invoke/handle | List tools from MCP server |
| `mcp:call-tool` | invoke/handle | Call an MCP tool |
| `mcp:list-prompts` | invoke/handle | List MCP prompts |
| `mcp:get-prompt` | invoke/handle | Get specific MCP prompt |
| `mcp:list-resources` | invoke/handle | List MCP resources |
| `mcp:get-resource` | invoke/handle | Get specific MCP resource |
| `mcp:get-install-info` | invoke/handle | Get MCP install info |
| `mcp:check-connectivity` | invoke/handle | Check MCP server connectivity |
| `mcp:upload-dxt` | invoke/handle | Upload DXT extension |
| `mcp:abort-tool` | invoke/handle | Abort running MCP tool |
| `mcp:get-server-version` | invoke/handle | Get MCP server version |

##### memory:* namespace (12 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `memory:add` | invoke/handle | Add memory entry |
| `memory:search` | invoke/handle | Search memories |
| `memory:list` | invoke/handle | List all memories |
| `memory:delete` | invoke/handle | Delete memory entry |
| `memory:update` | invoke/handle | Update memory entry |
| `memory:get` | invoke/handle | Get specific memory |
| `memory:set-config` | invoke/handle | Set memory configuration |
| `memory:delete-user` | invoke/handle | Delete user |
| `memory:delete-all-memories-for-user` | invoke/handle | Delete all memories for user |
| `memory:get-users-list` | invoke/handle | Get list of users |
| `memory:migrate-memory-db` | invoke/handle | Migrate memory database |
| `memory:get-server-logs` | N/A | (Listed under mcp namespace) |

##### trace:* namespace (13 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `trace:saveData` | invoke/handle | Save trace data |
| `trace:getData` | invoke/handle | Get trace data |
| `trace:saveEntity` | invoke/handle | Save trace entity |
| `trace:getEntity` | invoke/handle | Get trace entity |
| `trace:bindTopic` | invoke/handle | Bind trace to topic |
| `trace:cleanTopic` | invoke/handle | Clean topic traces |
| `trace:tokenUsage` | invoke/handle | Record token usage trace |
| `trace:cleanHistory` | invoke/handle | Clean trace history |
| `trace:openWindow` | invoke/handle | Open trace window |
| `trace:setTitle` | invoke/handle | Set trace window title |
| `trace:addEndMessage` | invoke/handle | Add end message to trace |
| `trace:cleanLocalData` | invoke/handle | Clean local trace data |
| `trace:addStreamMessage` | invoke/handle | Add streaming message to trace |

##### selection:* namespace (14 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `selection:text-selected` | push (main->renderer) | Text selected in OS |
| `selection:toolbar-hide` | invoke/handle | Hide selection toolbar |
| `selection:toolbar-visibility-change` | invoke/handle | Toggle toolbar visibility |
| `selection:toolbar-determine-size` | invoke/handle | Auto-size toolbar |
| `selection:write-to-clipboard` | invoke/handle | Write to clipboard |
| `selection:set-enabled` | invoke/handle | Enable/disable selection assistant |
| `selection:set-trigger-mode` | invoke/handle | Set trigger mode |
| `selection:set-filter-mode` | invoke/handle | Set filter mode |
| `selection:set-filter-list` | invoke/handle | Set filter list |
| `selection:set-follow-toolbar` | invoke/handle | Toggle follow toolbar |
| `selection:set-remeber-win-size` | invoke/handle | Remember window size |
| `selection:action-window-close` | invoke/handle | Close action window |
| `selection:action-window-minimize` | invoke/handle | Minimize action window |
| `selection:action-window-pin` | invoke/handle | Pin action window |
| `selection:action-window-resize` | invoke/handle | Resize action window (Windows workaround) |
| `selection:process-action` | invoke/handle | Process selected text action |
| `selection:update-action-data` | invoke/handle | Update action data |

##### store-sync:* namespace (3 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `store-sync:subscribe` | invoke/handle | Subscribe to store changes |
| `store-sync:unsubscribe` | invoke/handle | Unsubscribe from store changes |
| `store-sync:on-update` | push (main->renderer) | Store state updated |

---

#### F004-knowledge -- Knowledge Base

##### knowledge-base:* namespace (7 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `knowledge-base:create` | invoke/handle | Create knowledge base |
| `knowledge-base:reset` | invoke/handle | Reset knowledge base |
| `knowledge-base:delete` | invoke/handle | Delete knowledge base |
| `knowledge-base:add` | invoke/handle | Add document to knowledge base |
| `knowledge-base:remove` | invoke/handle | Remove document from knowledge base |
| `knowledge-base:search` | invoke/handle | Search knowledge base |
| `knowledge-base:rerank` | invoke/handle | Re-rank search results |

---

#### F005-data-mgmt -- Backup, Local Transfer, Nutstore

##### backup:* namespace (19 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `backup:backup` | invoke/handle | Create local backup |
| `backup:restore` | invoke/handle | Restore from local backup |
| `backup:backupToWebdav` | invoke/handle | Backup to WebDAV |
| `backup:restoreFromWebdav` | invoke/handle | Restore from WebDAV |
| `backup:listWebdavFiles` | invoke/handle | List WebDAV backup files |
| `backup:checkConnection` | invoke/handle | Check WebDAV connection |
| `backup:createDirectory` | invoke/handle | Create WebDAV directory |
| `backup:deleteWebdavFile` | invoke/handle | Delete WebDAV backup file |
| `backup:backupToLocalDir` | invoke/handle | Backup to local directory |
| `backup:restoreFromLocalBackup` | invoke/handle | Restore from local backup file |
| `backup:listLocalBackupFiles` | invoke/handle | List local backup files |
| `backup:deleteLocalBackupFile` | invoke/handle | Delete local backup file |
| `backup:backupToS3` | invoke/handle | Backup to S3 |
| `backup:restoreFromS3` | invoke/handle | Restore from S3 |
| `backup:listS3Files` | invoke/handle | List S3 backup files |
| `backup:deleteS3File` | invoke/handle | Delete S3 backup file |
| `backup:checkS3Connection` | invoke/handle | Check S3 connection |
| `backup:createLanTransferBackup` | invoke/handle | Create backup for LAN transfer |
| `backup:deleteTempBackup` | invoke/handle | Delete temporary backup |

##### local-transfer:* namespace (7 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `local-transfer:list` | invoke/handle | List discovered LAN services |
| `local-transfer:start-scan` | invoke/handle | Start LAN discovery scan |
| `local-transfer:stop-scan` | invoke/handle | Stop LAN discovery scan |
| `local-transfer:connect` | invoke/handle | Connect to LAN peer |
| `local-transfer:disconnect` | invoke/handle | Disconnect from LAN peer |
| `local-transfer:send-file` | invoke/handle | Send file to LAN peer |
| `local-transfer:cancel-transfer` | invoke/handle | Cancel file transfer |

##### nutstore:* namespace (3 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `nutstore:get-sso-url` | invoke/handle | Get Nutstore SSO URL |
| `nutstore:decrypt-token` | invoke/handle | Decrypt Nutstore token |
| `nutstore:get-directory-contents` | invoke/handle | List Nutstore directory |

---

#### F007-extensions -- API Server, Code Tools, OpenClaw, Claude Code, Agent, OCR, OVMS

##### api-server:* namespace (4 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `api-server:start` | invoke/handle | Start the REST API server |
| `api-server:stop` | invoke/handle | Stop the REST API server |
| `api-server:restart` | invoke/handle | Restart the REST API server |
| `api-server:get-status` | invoke/handle | Get API server running status |

##### code-tools:* namespace (5 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `code-tools:run` | invoke/handle | Execute code tool |
| `code-tools:get-available-terminals` | invoke/handle | List available terminal emulators |
| `code-tools:set-custom-terminal-path` | invoke/handle | Set custom terminal path |
| `code-tools:get-custom-terminal-path` | invoke/handle | Get custom terminal path |
| `code-tools:remove-custom-terminal-path` | invoke/handle | Remove custom terminal path |

##### openclaw:* namespace (14 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `openclaw:check-installed` | invoke/handle | Check if OpenClaw installed |
| `openclaw:check-node-version` | invoke/handle | Check Node.js version |
| `openclaw:check-git-available` | invoke/handle | Check Git availability |
| `openclaw:get-node-download-url` | invoke/handle | Get Node.js download URL |
| `openclaw:get-git-download-url` | invoke/handle | Get Git download URL |
| `openclaw:install` | invoke/handle | Install OpenClaw |
| `openclaw:uninstall` | invoke/handle | Uninstall OpenClaw |
| `openclaw:start-gateway` | invoke/handle | Start OpenClaw gateway |
| `openclaw:stop-gateway` | invoke/handle | Stop OpenClaw gateway |
| `openclaw:restart-gateway` | invoke/handle | Restart OpenClaw gateway |
| `openclaw:get-status` | invoke/handle | Get gateway status |
| `openclaw:check-health` | invoke/handle | Health check gateway |
| `openclaw:get-dashboard-url` | invoke/handle | Get dashboard URL |
| `openclaw:sync-config` | invoke/handle | Sync configuration |
| `openclaw:get-channels` | invoke/handle | Get OpenClaw channels |

##### claude-code-plugin:* namespace (7 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `claudeCodePlugin:install` | invoke/handle | Install Claude Code plugin |
| `claudeCodePlugin:uninstall` | invoke/handle | Uninstall Claude Code plugin |
| `claudeCodePlugin:uninstall-package` | invoke/handle | Uninstall plugin package |
| `claudeCodePlugin:list-installed` | invoke/handle | List installed plugins |
| `claudeCodePlugin:write-content` | invoke/handle | Write plugin content |
| `claudeCodePlugin:install-from-zip` | invoke/handle | Install plugin from ZIP |
| `claudeCodePlugin:install-from-directory` | invoke/handle | Install plugin from directory |

##### Agent and tool channels

| Channel | Direction | Description |
|---------|-----------|-------------|
| `agent-message:persist-exchange` | invoke/handle | Persist agent message exchange |
| `agent-message:get-history` | invoke/handle | Get agent message history |
| `agent-tool-permission:request` | invoke/handle | Request tool permission from user |
| `agent-tool-permission:response` | push (renderer->main) | User responds to tool permission |
| `agent-tool-permission:result` | push (main->renderer) | Tool permission result |

##### Other extension channels

| Channel | Direction | Description |
|---------|-----------|-------------|
| `external-apps:detect-installed` | invoke/handle | Detect installed external apps |
| `ocr:ocr` | invoke/handle | Perform OCR on image |
| `ocr:list-providers` | invoke/handle | List OCR providers |
| `ovms:is-supported` | invoke/handle | Check OVMS support |
| `ovms:add-model` | invoke/handle | Add OVMS model |
| `ovms:stop-addmodel` | invoke/handle | Cancel model addition |
| `ovms:get-models` | invoke/handle | List OVMS models |
| `ovms:is-running` | invoke/handle | Check if OVMS running |
| `ovms:get-status` | invoke/handle | Get OVMS status |
| `ovms:run-ovms` | invoke/handle | Start OVMS server |
| `ovms:stop-ovms` | invoke/handle | Stop OVMS server |
| `python:execute` | invoke/handle | Execute Python code |

---

#### Auth/OAuth IPC Channels

| Channel | Direction | Feature | Description |
|---------|-----------|---------|-------------|
| `copilot:get-auth-message` | invoke/handle | Auth | Get Copilot auth message |
| `copilot:get-copilot-token` | invoke/handle | Auth | Get Copilot token |
| `copilot:save-copilot-token` | invoke/handle | Auth | Save Copilot token |
| `copilot:get-token` | invoke/handle | Auth | Get stored token |
| `copilot:logout` | invoke/handle | Auth | Logout from Copilot |
| `copilot:get-user` | invoke/handle | Auth | Get Copilot user info |
| `cherryin:save-token` | invoke/handle | Auth | Save CherryIN token |
| `cherryin:has-token` | invoke/handle | Auth | Check CherryIN token exists |
| `cherryin:get-balance` | invoke/handle | Auth | Get CherryIN balance |
| `cherryin:logout` | invoke/handle | Auth | Logout from CherryIN |
| `cherryin:start-oauth-flow` | invoke/handle | Auth | Start CherryIN OAuth |
| `cherryin:exchange-token` | invoke/handle | Auth | Exchange CherryIN auth code |
| `anthropic:start-oauth-flow` | invoke/handle | Auth | Start Anthropic OAuth |
| `anthropic:complete-oauth-with-code` | invoke/handle | Auth | Complete Anthropic OAuth |
| `anthropic:cancel-oauth-flow` | invoke/handle | Auth | Cancel Anthropic OAuth |
| `anthropic:get-access-token` | invoke/handle | Auth | Get Anthropic access token |
| `anthropic:has-credentials` | invoke/handle | Auth | Check Anthropic credentials |
| `anthropic:clear-credentials` | invoke/handle | Auth | Clear Anthropic credentials |
| `vertexai:get-auth-headers` | invoke/handle | Auth | Get Vertex AI auth headers |
| `vertexai:get-access-token` | invoke/handle | Auth | Get Vertex AI access token |
| `vertexai:clear-auth-cache` | invoke/handle | Auth | Clear Vertex AI auth cache |
| `obsidian:get-vaults` | invoke/handle | Auth | List Obsidian vaults |
| `obsidian:get-files` | invoke/handle | Auth | List Obsidian files |
| `file-service:upload` | invoke/handle | Auth | Upload to file service |
| `file-service:list` | invoke/handle | Auth | List file service files |
| `file-service:delete` | invoke/handle | Auth | Delete from file service |
| `file-service:retrieve` | invoke/handle | Auth | Retrieve from file service |
| `cherryai:get-signature` | invoke/handle | Auth | Get CherryAI signature |
| `gemini:upload-file` | invoke/handle | Auth | Upload file to Gemini |
| `gemini:base64-file` | invoke/handle | Auth | Get Gemini file as base64 |
| `gemini:retrieve-file` | invoke/handle | Auth | Retrieve Gemini file |
| `gemini:list-files` | invoke/handle | Auth | List Gemini files |
| `gemini:delete-file` | invoke/handle | Auth | Delete Gemini file |

---

### Push Events (main -> renderer, ~30 channels)

| Channel | Feature | Description |
|---------|---------|-------------|
| `window:maximized-changed` | F001-platform | Window maximize state changed |
| `window:is-maximized` | F001-platform | Window maximized check result |
| `window:navigate-to-about` | F001-platform | Navigate to about page |
| `theme:updated` | F001-platform | Theme changed |
| `update-error` | F001-platform | Update error occurred |
| `update-available` | F001-platform | Update available |
| `update-not-available` | F001-platform | No update available |
| `download-progress` | F001-platform | Update download progress |
| `update-downloaded` | F001-platform | Update downloaded |
| `download-update` | F001-platform | Trigger update download |
| `fullscreen-status-changed` | F001-platform | Fullscreen state changed |
| `hide-mini-window` | F001-platform | Hide mini window |
| `show-mini-window` | F001-platform | Show mini window |
| `redux-store-ready` | F001-platform | Redux store initialized |
| `backup-progress` | F005-data-mgmt | Backup progress update |
| `restore-progress` | F005-data-mgmt | Restore progress update |
| `directory-processing-percent` | F001-platform | Directory scan progress |
| `store-sync:on-update` | F003-chat | Redux store sync update |
| `store-sync:broadcast-sync` | F003-chat | Broadcast store sync |
| `selection:text-selected` | F003-chat | Text selected in OS |
| `selection:update-action-data` | F003-chat | Selection action data update |
| `mcp:servers-changed` | F003-chat | MCP servers config changed |
| `mcp:servers-updated` | F003-chat | MCP servers state updated |
| `mcp:progress` | F003-chat | MCP operation progress |
| `mcp:server-log` | F003-chat | MCP server log entry |
| `local-transfer:services-updated` | F005-data-mgmt | LAN services discovered |
| `local-transfer:client-event` | F005-data-mgmt | LAN transfer client event |
| `openclaw:install-progress` | F007-extensions | OpenClaw install progress |
| `api-server:ready` | F007-extensions | API server started and ready |
| `agent-tool-permission:request` | F007-extensions | Agent requests tool permission |
| `agent-tool-permission:result` | F007-extensions | Tool permission result |
| `notification:on-click` | F001-platform | Notification click event |
