# API Registry

> Reverse-engineered from Cherry Studio's Express API server.

---

## Server Configuration

| Setting | Value |
|---------|-------|
| Framework | Express 5.1 |
| Request Timeout | 5 minutes (300,000 ms) |
| Keep-Alive Timeout | 60 seconds |
| CORS | origin: `*` (all origins) |
| Documentation | OpenAPI 3.0 / Swagger UI |
| Default Port | 39878 (configurable via settings) |

## Authentication

| Method | Header | Format |
|--------|--------|--------|
| Bearer Token | `Authorization` | `Bearer cs-sk-<uuid>` |
| API Key | `x-api-key` | `cs-sk-<uuid>` |

- Token comparison uses **timing-safe** algorithm to prevent timing attacks.
- API key format: `cs-sk-` prefix followed by UUID v4.

### Public Routes (no auth required)

| Route | Description |
|-------|-------------|
| `GET /` | API info |
| `GET /health` | Health check |
| `GET /api-docs` | Swagger UI |

---

## Endpoints

### General

#### GET /

**Description:** API information and version.

**Auth:** None

**Response:**
```json
{
  "name": "Cherry Studio API",
  "version": "1.0.0",
  "description": "Cherry Studio API Server"
}
```

---

#### GET /health

**Description:** Health check endpoint.

**Auth:** None

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-14T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

#### GET /api-docs

**Description:** Swagger UI serving OpenAPI 3.0 documentation.

**Auth:** None

**Response:** HTML (Swagger UI)

---

### Chat Completions (OpenAI-compatible)

#### POST /v1/chat/completions

**Description:** OpenAI-compatible chat completions endpoint. Supports both streaming and non-streaming responses.

**Auth:** Required

**Request Body:**
```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 4096,
  "top_p": 1.0,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| model | string | Y | — | Model identifier |
| messages | ChatMessage[] | Y | — | Conversation messages |
| stream | boolean | N | false | Enable SSE streaming |
| temperature | number | N | 0.7 | Sampling temperature [0, 2] |
| max_tokens | number | N | 4096 | Maximum output tokens |
| top_p | number | N | 1.0 | Nucleus sampling [0, 1] |
| frequency_penalty | number | N | 0 | Frequency penalty [-2, 2] |
| presence_penalty | number | N | 0 | Presence penalty [-2, 2] |

**Response (non-streaming):**
```json
{
  "id": "chatcmpl-<uuid>",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hello! How can I help?" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}
```

**Response (streaming):** SSE stream of `data: {chunk}` events, terminated by `data: [DONE]`.

---

### Models

#### GET /v1/models

**Description:** List available models, optionally filtered by provider.

**Auth:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| providerType | string | N | — | Filter by provider type |
| offset | number | N | 0 | Pagination offset |
| limit | number | N | 50 | Results per page |

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1710000000,
      "owned_by": "openai",
      "capabilities": ["vision", "function_calling", "streaming"]
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 50
}
```

---

### Messages (Anthropic-compatible)

#### POST /v1/messages

**Description:** Anthropic-compatible messages API. Model format uses `"provider:model_id"` notation to route to the correct provider.

**Auth:** Required

**Request Body:**
```json
{
  "model": "anthropic:claude-sonnet-4-20250514",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "max_tokens": 4096,
  "stream": false,
  "system": "You are a helpful assistant.",
  "temperature": 0.7,
  "top_p": 1.0
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| model | string | Y | — | Format: `"provider:model_id"` |
| messages | AnthropicMessage[] | Y | — | Conversation messages |
| max_tokens | number | Y | — | Maximum output tokens |
| stream | boolean | N | false | Enable SSE streaming |
| system | string | N | — | System prompt |
| temperature | number | N | 1.0 | Sampling temperature |
| top_p | number | N | 1.0 | Nucleus sampling |

**Response (non-streaming):**
```json
{
  "id": "msg_<uuid>",
  "type": "message",
  "role": "assistant",
  "content": [
    { "type": "text", "text": "Hello! How can I help?" }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 20,
    "output_tokens": 10
  }
}
```

**Response (streaming):** SSE stream following Anthropic streaming format (`message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`).

---

#### POST /:provider/v1/messages

**Description:** Provider-prefixed variant of the messages endpoint. The provider is extracted from the URL path instead of the model string.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| provider | string | Provider identifier (e.g., "anthropic", "openai") |

**Request/Response:** Same as `POST /v1/messages`, but `model` field contains only the model ID (no provider prefix).

---

### MCP Servers

#### GET /v1/mcps

**Description:** List all configured MCP servers.

**Auth:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "mcp-001",
      "name": "filesystem",
      "type": "stdio",
      "isActive": true,
      "tools": ["read_file", "write_file", "list_directory"]
    }
  ]
}
```

---

#### GET /v1/mcps/:server_id

**Description:** Get details for a specific MCP server.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| server_id | string | MCP server ID |

**Response:**
```json
{
  "id": "mcp-001",
  "name": "filesystem",
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-filesystem"],
  "isActive": true,
  "tools": [
    {
      "name": "read_file",
      "description": "Read a file from the filesystem",
      "inputSchema": { "type": "object", "properties": { "path": { "type": "string" } } }
    }
  ]
}
```

---

#### ALL /v1/mcps/:server_id/mcp

**Description:** MCP protocol proxy endpoint. Forwards JSON-RPC messages to the specified MCP server. Supports all HTTP methods (GET, POST, PUT, DELETE, etc.) to handle various MCP transport protocols.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| server_id | string | MCP server ID |

**Request Body (JSON-RPC):**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": { "path": "/tmp/test.txt" }
  },
  "id": 1
}
```

**Response:** Proxied JSON-RPC response from the MCP server.

---

### Agents

#### POST /v1/agents

**Description:** Create a new agent.

**Auth:** Required

**Request Body:**
```json
{
  "name": "My Agent",
  "type": "assistant",
  "model": "gpt-4o",
  "mcps": [],
  "configuration": {}
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Y | — | Agent name |
| type | string | N | "assistant" | Agent type |
| model | string | N | "" | Default model |
| mcps | object[] | N | [] | MCP server configurations |
| configuration | object | N | {} | Agent-specific configuration |

**Response:** `201 Created`
```json
{
  "id": "agent-<uuid>",
  "name": "My Agent",
  "type": "assistant",
  "model": "gpt-4o",
  "mcps": [],
  "configuration": {},
  "createdAt": "2026-03-14T12:00:00.000Z",
  "updatedAt": "2026-03-14T12:00:00.000Z"
}
```

---

#### GET /v1/agents

**Description:** List all agents.

**Auth:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "agent-<uuid>",
      "name": "My Agent",
      "type": "assistant",
      "model": "gpt-4o",
      "createdAt": "2026-03-14T12:00:00.000Z",
      "updatedAt": "2026-03-14T12:00:00.000Z"
    }
  ]
}
```

---

#### GET /v1/agents/:id

**Description:** Get a specific agent by ID.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Response:** Agent object (same shape as POST response).

**Error:** `404 Not Found` if agent does not exist.

---

#### PUT /v1/agents/:id

**Description:** Full replacement update of an agent.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Request Body:** Full agent object (same as POST).

**Response:** Updated agent object.

**Error:** `404 Not Found` if agent does not exist.

---

#### PATCH /v1/agents/:id

**Description:** Partial update of an agent.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Request Body:** Partial agent fields to update.

**Response:** Updated agent object.

**Error:** `404 Not Found` if agent does not exist.

---

#### DELETE /v1/agents/:id

**Description:** Delete an agent and all associated sessions/messages (cascade).

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Response:** `204 No Content`

**Error:** `404 Not Found` if agent does not exist.

---

### Sessions

#### POST /v1/agents/:agentId/sessions

**Description:** Create a new session for an agent.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |

**Request Body:**
```json
{
  "name": "My Session",
  "model": "gpt-4o"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | N | "New Session" | Session name |
| model | string | N | "" | Model override |

**Response:** `201 Created` — Session object.

**Error:** `404 Not Found` if agent does not exist.

---

#### GET /v1/agents/:agentId/sessions

**Description:** List all sessions for an agent.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |

**Response:**
```json
{
  "data": [
    {
      "id": "session-<uuid>",
      "agent_id": "agent-<uuid>",
      "name": "My Session",
      "model": "gpt-4o",
      "createdAt": "2026-03-14T12:00:00.000Z",
      "updatedAt": "2026-03-14T12:00:00.000Z"
    }
  ]
}
```

---

#### GET /v1/agents/:agentId/sessions/:sessionId

**Description:** Get a specific session.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |
| sessionId | string | Session ID |

**Response:** Session object.

**Error:** `404 Not Found` if session does not exist.

---

#### DELETE /v1/agents/:agentId/sessions/:sessionId

**Description:** Delete a session and all associated messages (cascade).

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |
| sessionId | string | Session ID |

**Response:** `204 No Content`

---

### Session Messages

#### POST /v1/agents/:agentId/sessions/:sessionId/messages

**Description:** Add a message to a session.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |
| sessionId | string | Parent session ID |

**Request Body:**
```json
{
  "role": "user",
  "content": "Hello, how are you?",
  "metadata": {}
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| role | "user" \| "assistant" \| "system" | Y | — | Message sender role |
| content | string | Y | — | Message content |
| metadata | object | N | {} | Arbitrary metadata (model, tokens, etc.) |

**Response:** `201 Created` — SessionMessage object.

---

#### GET /v1/agents/:agentId/sessions/:sessionId/messages

**Description:** List all messages in a session, ordered by creation time.

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |
| sessionId | string | Parent session ID |

**Response:**
```json
{
  "data": [
    {
      "id": "msg-<uuid>",
      "session_id": "session-<uuid>",
      "role": "user",
      "content": "Hello",
      "metadata": {},
      "createdAt": "2026-03-14T12:00:00.000Z"
    }
  ]
}
```

---

#### DELETE /v1/agents/:agentId/sessions/:sessionId/messages

**Description:** Delete all messages in a session (clear history).

**Auth:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Parent agent ID |
| sessionId | string | Parent session ID |

**Response:** `204 No Content`

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "Descriptive error message",
    "code": 400
  }
}
```

| HTTP Status | Type | Description |
|-------------|------|-------------|
| 400 | invalid_request_error | Malformed request or validation failure |
| 401 | authentication_error | Missing or invalid API key |
| 404 | not_found_error | Resource not found |
| 429 | rate_limit_error | Rate limit exceeded |
| 500 | internal_server_error | Unexpected server error |
| 504 | timeout_error | Request timeout (5 min exceeded) |
