# API Registry

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-02
**Total Endpoints**: 232 IPC channels + 18 REST endpoints

> Used as a preliminary reference when writing contracts/ during spec-kit /speckit.plan.
> In this Electron app, "APIs" primarily means IPC channels between main/renderer processes.

---

## Endpoint Index

### IPC Channels by Feature

| Feature | Channel Prefix | Count | Description |
|---------|---------------|-------|-------------|
| F001-app-core | app:*, file:*, fs:*, zip:*, system:*, window:*, shortcuts:* | ~90 | App lifecycle, file management, window controls |
| F002-settings-theme | config:* | 2 | Config get/set |
| F003-provider-management | vertexai:*, copilot:*, cherryin:*, anthropic:*, aes:* | ~23 | OAuth flows, auth tokens, encryption |
| F004-chat-conversation | store-sync:* | 4 | Cross-window Redux state sync |
| F006-knowledge-base | knowledge-base:* | 7 | KB CRUD, search, rerank |
| F007-mcp | mcp:* | 16 | MCP server management, tool calls |
| F008-memory | memory:* | 11 | Memory CRUD, search, config |
| F009-backup-sync | backup:* | 17 | Backup/restore to WebDAV/S3/local/LAN |
| F012-api-server-agents | api-server:*, agent-tool-permission:*, agent-message:*, claudeCodePlugin:*, code-tools:* | ~25 | API server, agent system, plugins |
| F013-utilities | ocr:*, ovms:*, search-window:*, selection:*, webview:*, notification:*, export:*, obsidian:*, nutstore:*, local-transfer:*, openclaw:*, analytics:*, python:* | ~50 | Various utility services |

### REST API Endpoints

| Method | Path | Feature | Auth | Description |
|--------|------|---------|------|-------------|
| GET | / | F012 | Public | API info |
| GET | /health | F012 | Public | Health check |
| GET | /api-docs | F012 | Public | Swagger docs |
| POST | /v1/chat/completions | F012 | Bearer/API Key | OpenAI-compatible chat completion |
| POST | /v1/messages | F012 | Bearer/API Key | Anthropic-compatible messages |
| POST | /:provider_id/v1/messages | F012 | Bearer/API Key | Provider-prefixed messages |
| GET | /v1/models | F012 | Bearer/API Key | List available models |
| GET | /v1/mcps | F012 | Bearer/API Key | List MCP servers |
| GET | /v1/mcps/:server_id | F012 | Bearer/API Key | Get MCP server info |
| ALL | /v1/mcps/:server_id/mcp | F012 | Bearer/API Key | MCP proxy |
| POST | /v1/agents | F012 | Bearer/API Key | Create agent |
| GET | /v1/agents | F012 | Bearer/API Key | List agents |
| GET | /v1/agents/:agentId | F012 | Bearer/API Key | Get agent |
| PUT | /v1/agents/:agentId | F012 | Bearer/API Key | Update agent |
| DELETE | /v1/agents/:agentId | F012 | Bearer/API Key | Delete agent |
| POST | /v1/agents/:agentId/sessions | F012 | Bearer/API Key | Create session |
| POST | /v1/agents/:agentId/sessions/:sessionId/messages | F012 | Bearer/API Key | Create message (triggers agent) |
| DELETE | /v1/agents/:agentId/sessions/:sessionId/messages/:messageId | F012 | Bearer/API Key | Delete message |

---

## Cross-Feature API Dependencies

| API | Provider | Consumer(s) | Call Purpose |
|-----|----------|-------------|-------------|
| IPC `config:get/set` | F001-app-core | All Features | Read/write app configuration |
| IPC `file:read/write/upload/delete` | F001-app-core | F004, F006, F009, F010 | File operations |
| IPC `file:select` | F001-app-core | F004, F006 | File picker dialog |
| IPC `knowledge-base:search` | F006-knowledge-base | F005 | RAG retrieval for chat context injection |
| IPC `knowledge-base:rerank` | F006-knowledge-base | F005 | Rerank search results |
| IPC `mcp:list-tools` | F007-mcp | F005, F012 | Discover MCP tools for function calling |
| IPC `mcp:call-tool` | F007-mcp | F005, F012 | Execute MCP tool during completion |
| IPC `memory:search` | F008-memory | F005 | Search memories for context |
| IPC `memory:add` | F008-memory | F005 | Auto-add memories from conversations |
| IPC `backup:*` | F009-backup-sync | F002 (settings UI) | Trigger backup/restore |
| IPC `store-sync:broadcast-sync` | F004-chat-conversation | All windows | Cross-window Redux sync |
| REST `POST /v1/chat/completions` | F012-api-server-agents | External clients | Chat via REST API |

---

## F001-app-core IPC APIs

### IPC: app:info
**Original Source**: `src/main/ipc.ts`
**Authentication**: Internal IPC (no auth)

#### Request
No parameters.

#### Response
```json
{
  "version": "string",
  "isPackaged": "boolean",
  "appPath": "string",
  "filesPath": "string",
  "notesPath": "string",
  "configPath": "string",
  "appDataPath": "string",
  "resourcesPath": "string",
  "logsPath": "string",
  "arch": "string",
  "isPortable": "boolean",
  "installPath": "string"
}
```

### IPC: file:select
**Original Source**: `src/main/services/FileStorage.ts`

#### Request
`options?: OpenDialogOptions` (Electron dialog options)

#### Response
`FileMetadata[] | null`

### IPC: file:upload
**Original Source**: `src/main/services/FileStorage.ts`

#### Request
`file: FileMetadata`

#### Response
void

### IPC: file:read
**Original Source**: `src/main/services/FileStorage.ts`

#### Request
`fileId: string, detectEncoding?: boolean`

#### Response
`string` (file content)

### IPC: file:download
**Original Source**: `src/main/services/FileStorage.ts`

#### Request
`url: string, isUseContentType?: boolean`

#### Response
`FileMetadata`

---

## F003-provider-management IPC APIs

### IPC: vertexai:get-auth-headers
**Original Source**: `src/main/services/VertexAIService.ts`

#### Request
```json
{
  "projectId": "string",
  "serviceAccount": {
    "privateKey": "string",
    "clientEmail": "string"
  }
}
```

#### Response
Auth headers object for Vertex AI API calls.

### IPC: copilot:get-auth-message
**Original Source**: `src/main/services/CopilotService.ts`

#### Request
`headers?: Record<string, string>`

#### Response
GitHub Copilot device code auth message (user_code, verification_uri, etc.)

### IPC: copilot:get-copilot-token
**Original Source**: `src/main/services/CopilotService.ts`

#### Request
`device_code: string, headers?: Record<string, string>`

#### Response
Copilot access token after device code exchange.

### IPC: cherryin:start-oauth-flow
**Original Source**: `src/main/services/CherryINOAuthService.ts`

#### Request
`oauthServer: string, apiHost?: string`

#### Response
OAuth authorization result.

### IPC: anthropic:start-oauth-flow
**Original Source**: `src/main/services/AnthropicService.ts`

#### Request
None.

#### Response
Anthropic OAuth authorization result.

---

## F006-knowledge-base IPC APIs

### IPC: knowledge-base:create
**Original Source**: `src/main/services/KnowledgeService.ts`

#### Request
`base: KnowledgeBaseParams, context?: SpanContext`

#### Response
Created knowledge base.

### IPC: knowledge-base:add
**Original Source**: `src/main/services/KnowledgeService.ts`

#### Request
```json
{
  "base": "KnowledgeBaseParams",
  "item": "KnowledgeItem",
  "userId": "string (optional)",
  "forceReload": "boolean (optional)"
}
```

#### Response
void (processes asynchronously, sends progress events)

### IPC: knowledge-base:search
**Original Source**: `src/main/services/KnowledgeService.ts`

#### Request
```json
{
  "search": "string",
  "base": "KnowledgeBaseParams"
}
```

#### Response
`KnowledgeSearchResult[]`

### IPC: knowledge-base:rerank
**Original Source**: `src/main/services/KnowledgeService.ts`

#### Request
```json
{
  "search": "string",
  "base": "KnowledgeBaseParams",
  "results": "KnowledgeSearchResult[]"
}
```

#### Response
`KnowledgeSearchResult[]` (reranked)

---

## F007-mcp IPC APIs

### IPC: mcp:list-tools
**Original Source**: `src/main/services/MCPService.ts`

#### Request
`server: MCPServer, context?: SpanContext`

#### Response
`MCPTool[]`

### IPC: mcp:call-tool
**Original Source**: `src/main/services/MCPService.ts`

#### Request
```json
{
  "server": "MCPServer",
  "name": "string",
  "args": "any",
  "callId": "string (optional, for abort support)"
}
```

#### Response
Tool execution result.

### IPC: mcp:abort-tool
**Original Source**: `src/main/services/MCPService.ts`

#### Request
`callId: string`

#### Response
void

---

## F008-memory IPC APIs

### IPC: memory:add
**Original Source**: `src/main/services/memory/MemoryService.ts`

#### Request
`messages: string | AssistantMessage[], options?: AddMemoryOptions`

#### Response
void

### IPC: memory:search
**Original Source**: `src/main/services/memory/MemoryService.ts`

#### Request
`query: string, options: MemorySearchOptions`

#### Response
`MemoryItem[]` with relevance scores.

---

## F009-backup-sync IPC APIs

### IPC: backup:backupToWebdav
**Original Source**: `src/main/services/BackupManager.ts`

#### Request
`data: string, webdavConfig: WebDavConfig`

#### Response
void (sends progress events)

### IPC: backup:restoreFromWebdav
**Original Source**: `src/main/services/BackupManager.ts`

#### Request
`webdavConfig: WebDavConfig`

#### Response
`string` (backup data)

### IPC: backup:backupToS3
**Original Source**: `src/main/services/BackupManager.ts`

#### Request
`data: string, s3Config: S3Config`

#### Response
void

---

## F012-api-server-agents REST APIs

### POST /v1/chat/completions
**Original Source**: `src/main/apiServer/routes/chat.ts`
**Authentication**: Bearer Token or x-api-key header

#### Request
**Headers**: `Authorization: Bearer {token}` or `x-api-key: {key}`

**Body** (OpenAI format):
```json
{
  "model": "provider_id:model_id",
  "messages": [
    {"role": "system", "content": "string"},
    {"role": "user", "content": "string"}
  ],
  "stream": "boolean (optional)",
  "temperature": "number (optional)",
  "max_tokens": "number (optional)"
}
```

#### Response
**200 OK** (non-streaming):
```json
{
  "id": "string",
  "object": "chat.completion",
  "choices": [{"message": {"role": "assistant", "content": "string"}}],
  "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
}
```

**200 OK** (streaming): SSE `text/event-stream` with `data: {...}` chunks.

### POST /v1/messages
**Original Source**: `src/main/apiServer/routes/messages.ts`
**Authentication**: Bearer Token or x-api-key header

#### Request
**Body** (Anthropic format):
```json
{
  "model": "provider_id:model_id",
  "max_tokens": "number",
  "messages": [{"role": "user", "content": "string"}],
  "system": "string (optional)",
  "stream": "boolean (optional)"
}
```

#### Response
Anthropic message response format.

### GET /v1/models
**Original Source**: `src/main/apiServer/routes/models.ts`
**Authentication**: Bearer Token or x-api-key header

#### Request
**Query**: `providerType?` (openai/anthropic/gemini), `offset?`, `limit?`

#### Response
```json
{
  "object": "list",
  "data": [{"id": "string", "object": "model", "owned_by": "string"}],
  "total": "number",
  "offset": "number",
  "limit": "number"
}
```
