# Angdu Studio — API Registry

This document catalogs all REST API endpoints exposed by Cherry Studio's API server, extracted from the Express route definitions in `src/main/apiServer/`.

---

## Overview

The API server is an Express application embedded in the Electron main process. It provides OpenAI-compatible and Anthropic-compatible endpoints for external tool integration, plus a full CRUD API for agents and sessions.

**Base Configuration**:
- JSON body limit: 50MB
- CORS: all origins, methods GET/POST/PUT/DELETE/OPTIONS
- Auth: Bearer token or X-API-Key header (timing-safe comparison)
- Request ID: X-Request-ID header (UUID) on every response
- Documentation: Swagger/OpenAPI at /api-docs

---

## API-001: Health Check

**Owner**: F001 (app-shell)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /health |
| Auth | None |
| Tags | Health |

### Request

No parameters.

### Response (200)

```json
{
  "status": "ok",
  "timestamp": "2026-03-15T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Error Responses

None (always returns 200).

---

## API-002: API Information

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | / |
| Auth | None |
| Tags | General |

### Request

No parameters.

### Response (200)

```json
{
  "name": "Cherry Studio API",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health",
    "docs": "GET /api-docs",
    "docs_json": "GET /api-docs.json",
    "chat_completions": "POST /v1/chat/completions",
    "models": "GET /v1/models",
    "messages": "POST /v1/messages",
    "messages_provider": "POST /:provider/v1/messages",
    "mcps": "GET /v1/mcps",
    "mcp_server": "GET /v1/mcps/:server_id",
    "mcp_proxy": "ALL /v1/mcps/:server_id/mcp",
    "agents": "GET /v1/agents",
    "agent_sessions": "GET /v1/agents/:agentId/sessions",
    "session_messages": "GET /v1/agents/:agentId/sessions/:sessionId/messages"
  }
}
```

---

## API-003: Chat Completions (OpenAI-Compatible)

**Owner**: F005 (chat-conversation), F004 (model-provider)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /v1/chat/completions |
| Auth | Bearer token or X-API-Key |
| Tags | Chat |

### Request Body

OpenAI `ChatCompletionCreateParams` format:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model ID in format "provider:model_id" |
| messages | ChatCompletionMessage[] | Yes | Array of messages |
| stream | boolean | No | Enable SSE streaming |
| temperature | number | No | Sampling temperature (0-2) |
| max_tokens | number | No | Maximum output tokens |
| top_p | number | No | Nucleus sampling (0-1) |
| tools | Tool[] | No | Available tools |
| tool_choice | string \| object | No | Tool selection strategy |

### Response (200) — Non-Streaming

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "provider:model_id",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

### Response (200) — Streaming

Content-Type: `text/event-stream; charset=utf-8`
Headers: Cache-Control: no-cache, no-transform; Connection: keep-alive; X-Accel-Buffering: no

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: [DONE]
```

### Error Responses

| Status | Type | Code | Condition |
|--------|------|------|-----------|
| 400 | invalid_request_error | missing_body | Request body is empty |
| 400 | invalid_request_error | validation_failed | Request validation failed |
| 401 | authentication_error | invalid_api_key | Invalid API key |
| 429 | rate_limit_error | rate_limit_exceeded | Rate limit exceeded |
| 500 | server_error | internal_error | Internal server error |
| 502 | server_error | upstream_error | Timeout or connection error |

---

## API-004: Messages (Anthropic-Compatible)

**Owner**: F005 (chat-conversation), F004 (model-provider)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /v1/messages |
| Auth | Bearer token or X-API-Key |
| Tags | Messages |

### Request Body

Anthropic `MessageCreateParams` format:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model ID in format "provider:model_id" |
| max_tokens | integer | Yes | Maximum tokens to generate |
| messages | Message[] | Yes | Conversation messages |
| system | string | No | System message |
| temperature | number | No | Sampling temperature (0-1) |
| top_p | number | No | Nucleus sampling (0-1) |
| top_k | integer | No | Top-k sampling |
| stream | boolean | No | Enable SSE streaming |
| tools | Tool[] | No | Available tools |

### Response (200) — Non-Streaming

```json
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Response text"
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 100,
    "output_tokens": 50
  }
}
```

### Response (200) — Streaming

Content-Type: `text/event-stream`
Anthropic SSE event format.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Missing body, invalid model ID, validation failure |
| 401 | authentication_error | Missing or invalid credentials |
| 429 | rate_limit_error | Rate limit exceeded |
| 500 | server_error | Internal error |
| 502 | server_error | Upstream provider error |
| 529 | overloaded_error | Provider overloaded |

---

## API-005: Messages with Provider Path

**Owner**: F005 (chat-conversation), F004 (model-provider)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /:provider_id/v1/messages |
| Auth | Bearer token or X-API-Key |
| Tags | Messages |

Same as API-004, but provider is specified in the URL path instead of the model ID. The `model` field in the request body contains only the model name without provider prefix.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| provider_id | string | Yes | Provider ID (e.g., "my-anthropic") |

### Additional Error

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Provider ID not found or not enabled |

---

## API-006: List Models

**Owner**: F004 (model-provider)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/models |
| Auth | Bearer token or X-API-Key |
| Tags | Models |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| providerType | string | No | - | Filter by provider type (openai, anthropic, gemini, etc.) |
| offset | integer | No | 0 | Pagination offset |
| limit | integer | No | - | Maximum models to return |

### Response (200)

```json
{
  "object": "list",
  "data": [
    {
      "id": "provider:model_id",
      "object": "model",
      "created": 1710000000,
      "owned_by": "provider-name"
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 20
}
```

### Error Responses

| Status | Type | Code | Condition |
|--------|------|------|-----------|
| 400 | invalid_request_error | invalid_parameters | Invalid query parameters |
| 503 | service_unavailable | models_unavailable | Failed to retrieve models |

---

## API-007: List MCP Servers

**Owner**: F007 (mcp-tools)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/mcps |
| Auth | Bearer token or X-API-Key |
| Tags | MCP |

### Request

No parameters.

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "server-uuid",
      "name": "my-mcp-server",
      "type": "stdio",
      "description": "A useful MCP server",
      "isActive": true,
      "tools": [
        {
          "name": "tool_name",
          "description": "Tool description",
          "inputSchema": {}
        }
      ]
    }
  ]
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 503 | servers_unavailable | Failed to retrieve MCP servers |

---

## API-008: Get MCP Server Info

**Owner**: F007 (mcp-tools)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/mcps/:server_id |
| Auth | Bearer token or X-API-Key |
| Tags | MCP |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| server_id | string | Yes | MCP server ID |

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": "server-uuid",
    "name": "my-mcp-server",
    "type": "stdio",
    "isActive": true,
    "tools": [...]
  }
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | server_not_found | Server ID does not exist |
| 503 | server_info_unavailable | Failed to retrieve server info |

---

## API-009: MCP Protocol Proxy

**Owner**: F007 (mcp-tools)

| Property | Value |
|----------|-------|
| Method | ALL (GET, POST, DELETE, etc.) |
| Path | /v1/mcps/:server_id/mcp |
| Auth | Bearer token or X-API-Key |
| Tags | MCP |

Proxies MCP protocol (JSON-RPC) requests to the specified MCP server. The request body is forwarded as-is to the MCP server.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| server_id | string | Yes | MCP server ID |

### Request Body

JSON-RPC format (MCP protocol specific). Passed through to the MCP server.

### Response (200)

MCP protocol response (JSON-RPC format). Passed through from the MCP server.

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 404 | server_not_found | Server ID does not exist |

---

## API-010: Create Agent

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /v1/agents |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | AgentType | Yes | Agent type ('claude-code') |
| name | string | Yes | Agent name (min 1 char) |
| model | string | Yes | Primary model ID (min 1 char) |
| description | string | No | Agent description |
| accessible_paths | string[] | Yes | Allowed directory paths |
| instructions | string | No | System prompt |
| plan_model | string | No | Planning model ID |
| small_model | string | No | Fast model ID |
| mcps | string[] | No | MCP server IDs |
| allowed_tools | string[] | No | Whitelisted tool IDs |
| configuration | AgentConfiguration | No | Agent settings |

### Response (201)

AgentEntity JSON with `id`, `created_at`, `updated_at` added.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |

---

## API-011: List Agents

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/agents |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 20 | Items per page (1-100) |
| offset | integer | No | 0 | Skip count |
| status | string | No | - | Filter: idle, running, completed, failed, stopped |

### Response (200)

```json
{
  "data": [AgentEntity, ...],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

## API-012: Get Agent

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/agents/:agentId |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | Yes | Agent ID (min 1 char) |

### Response (200)

AgentEntity JSON, extended with:
- `tools`: Tool[] (all available tools)
- `installed_plugins`: InstalledPlugin[] (from .claude/plugins.json)

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent not found |

---

## API-013: Replace Agent (PUT)

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | PUT |
| Path | /v1/agents/:agentId |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

Full replacement of agent fields (AgentBase schema). All required fields must be provided.

### Request Body

Same as AgentBase schema (model and accessible_paths required).

### Response (200)

Updated AgentEntity JSON.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |
| 404 | not_found | Agent not found |

---

## API-014: Patch Agent (PATCH)

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | /v1/agents/:agentId |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

Partial update of agent fields. Only provided fields are updated.

### Request Body

Partial AgentBase schema (all fields optional).

### Response (200)

Updated AgentEntity JSON.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |
| 404 | not_found | Agent not found |

---

## API-015: Delete Agent

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | /v1/agents/:agentId |
| Auth | Bearer token or X-API-Key |
| Tags | Agents |

### Response (204)

No content.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent not found |

---

## API-016: Create Session

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /v1/agents/:agentId/sessions |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | Yes | Parent agent ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model ID (min 1 char) |
| accessible_paths | string[] | Yes | Allowed directories |
| name | string | No | Session name |
| description | string | No | Session description |
| instructions | string | No | System prompt |
| plan_model | string | No | Planning model |
| small_model | string | No | Fast model |
| mcps | string[] | No | MCP server IDs |
| allowed_tools | string[] | No | Tool whitelist |
| configuration | AgentConfiguration | No | Session settings |

### Response (201)

AgentSessionEntity JSON with `id`, `agent_id`, `agent_type`, `created_at`, `updated_at`.
Extended with `tools` and optionally `messages` and `plugins`.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |
| 404 | not_found | Agent not found |

---

## API-017: List Sessions

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/agents/:agentId/sessions |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

### Query Parameters

Same pagination as API-011 (limit, offset, status).

### Response (200)

```json
{
  "data": [AgentSessionEntity, ...],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent not found |

---

## API-018: Get Session

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /v1/agents/:agentId/sessions/:sessionId |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

### Response (200)

AgentSessionEntity JSON, extended with:
- `tools`: Tool[]
- `messages`: AgentSessionMessageEntity[]
- `plugins`: Plugin metadata array

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent or session not found |

---

## API-019: Replace Session (PUT)

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | PUT |
| Path | /v1/agents/:agentId/sessions/:sessionId |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

Full replacement. Same body as Create Session.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |
| 404 | not_found | Agent or session not found |

---

## API-020: Patch Session (PATCH)

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | /v1/agents/:agentId/sessions/:sessionId |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

Partial update. All fields optional.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Validation failed |
| 404 | not_found | Agent or session not found |

---

## API-021: Delete Session

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | /v1/agents/:agentId/sessions/:sessionId |
| Auth | Bearer token or X-API-Key |
| Tags | Sessions |

### Response (204)

No content.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent or session not found |

---

## API-022: Create Session Message

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /v1/agents/:agentId/sessions/:sessionId/messages |
| Auth | Bearer token or X-API-Key |
| Tags | Messages |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Message content (min 1 char) |
| effort | AgentEffort | No | Reasoning effort: 'low', 'medium', 'high', 'max' |
| thinking | AgentThinkingConfig | No | Thinking config: enabled (with budgetTokens), disabled, or adaptive |

### Response (201)

AgentSessionMessageEntity JSON:

```json
{
  "id": 1,
  "session_id": "session-uuid",
  "role": "user",
  "content": "...",
  "agent_session_id": "agent-session-uuid",
  "metadata": {},
  "created_at": "2026-03-15T12:00:00.000Z",
  "updated_at": "2026-03-15T12:00:00.000Z"
}
```

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 400 | invalid_request_error | Content is empty or invalid |
| 404 | not_found | Agent or session not found |

---

## API-023: Delete Session Message

**Owner**: F010 (api-server)

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | /v1/agents/:agentId/sessions/:sessionId/messages/:messageId |
| Auth | Bearer token or X-API-Key |
| Tags | Messages |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | Yes | Agent ID |
| sessionId | string | Yes | Session ID |
| messageId | integer | Yes | Message ID (positive integer) |

### Response (204)

No content.

### Error Responses

| Status | Type | Condition |
|--------|------|-----------|
| 404 | not_found | Agent, session, or message not found |

---

## Authentication Details

**Source**: `src/main/apiServer/middleware/auth.ts`

### Supported Methods

1. **X-API-Key header**: Direct API key comparison
2. **Authorization: Bearer <token>**: Bearer token extraction and comparison

### Security Properties

- Timing-safe comparison using `crypto.timingSafeEqual`
- Length check before comparison to prevent timing attacks
- API key stored in app configuration (not hardcoded)
- No auth required for: GET /health, GET /, GET /api-docs*

### Error Flow

| Condition | Status | Message |
|-----------|--------|---------|
| No credentials provided | 401 | missing credentials |
| Empty X-API-Key | 401 | empty x-api-key |
| Invalid X-API-Key | 403 | Forbidden |
| Invalid auth format | 401 | invalid authorization format |
| Empty bearer token | 401 | empty bearer token |
| Invalid bearer token | 403 | Forbidden |
| No API key configured | 403 | Forbidden |

---

## Middleware Stack

| Middleware | Scope | Description |
|-----------|-------|-------------|
| express.json({limit: '50mb'}) | Global | Parse JSON request bodies |
| Request logging | Global | Log method, path, status, duration on response finish |
| X-Request-ID | Global | Attach UUID to every response |
| CORS | Global | Allow all origins, standard headers and methods |
| Auth | /v1/* routes | Validate Bearer token or X-API-Key |
| Extended timeout | /v1/messages, /:provider/v1/messages | Long poll timeout for streaming |
| Agent exists check | /v1/agents/:agentId/sessions/* | Verify agent exists before session operations |
| Validation | Per-route | Zod schema validation via express-validator chain |
| Error handler | Global (last) | Catch unhandled errors |
