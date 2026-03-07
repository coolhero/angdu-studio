# API Registry

**Project**: Angdu Studio (rebuild of Cherry Studio)
**Source**: `/Users/coolhero/Develop/cherry-studio`
**Total Endpoints**: 26 REST + 280+ IPC channels
**Generated**: 2026-03-07

> Canonical index of every API surface discovered during deep analysis of Cherry Studio.
> Organized by transport (REST vs IPC) and grouped by feature.

---

## 1. API Surface Summary

| Transport | Count | Process | Auth | Protocol |
|-----------|-------|---------|------|----------|
| REST (Express) | 26 endpoints | Main (API server) | API key (x-api-key / Bearer) | HTTP/1.1 |
| IPC (Electron) | 280+ channels | Main <-> Renderer | Implicit (same app) | ipcMain.handle / ipcRenderer.invoke |

---

## 2. REST API Endpoints (Express Server)

The embedded Express server exposes an OpenAI/Anthropic-compatible API for local and LAN access.

### 2.1 Authentication

All REST endpoints (except health) require authentication via one of:

| Method | Header | Format |
|--------|--------|--------|
| API Key Header | `x-api-key` | Plain API key string |
| Bearer Token | `Authorization` | `Bearer <api-key>` |

The API key is configured in app settings. Unauthenticated requests receive `401 Unauthorized`.

---

### 2.2 Health

| Method | Path | Auth | Description | Request Body | Response |
|--------|------|------|-------------|-------------|----------|
| GET | `/health` | No | Health check | — | `{ "status": "ok" }` |
| GET | `/` | No | Root / health alias | — | `{ "status": "ok" }` |

---

### 2.3 Chat Completions (OpenAI-compatible)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/chat/completions` | Yes | OpenAI-compatible chat completions |

**Request Body** (OpenAI format):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model identifier |
| messages | array | Yes | Array of `{ role, content }` objects |
| stream | boolean | No | Enable SSE streaming (default: false) |
| temperature | number | No | Sampling temperature |
| top_p | number | No | Nucleus sampling threshold |
| max_tokens | number | No | Maximum response tokens |
| tools | array | No | Tool/function definitions |
| tool_choice | string/object | No | Tool selection strategy |

**Response** (non-streaming): OpenAI ChatCompletion object
**Response** (streaming): SSE stream of `data: {...}` chunks, terminated by `data: [DONE]`

---

### 2.4 Messages (Anthropic-compatible)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/messages` | Yes | Anthropic-compatible messages API |
| POST | `/{provider_id}/v1/messages` | Yes | Provider-specific messages endpoint |

**Request Body** (Anthropic format):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model identifier |
| messages | array | Yes | Array of Anthropic message objects |
| max_tokens | number | Yes | Maximum response tokens |
| stream | boolean | No | Enable SSE streaming |
| system | string/array | No | System prompt |
| temperature | number | No | Sampling temperature |
| tools | array | No | Tool definitions |

**Response**: Anthropic Message object or SSE stream of server-sent events.

The `/{provider_id}/v1/messages` variant routes through a specific provider, enabling multi-provider setups.

---

### 2.5 Models

| Method | Path | Auth | Description | Response |
|--------|------|------|-------------|----------|
| GET | `/v1/models` | Yes | List available models | `{ "data": [Model...], "object": "list" }` |

Returns all models from all enabled providers in OpenAI-compatible format.

---

### 2.6 MCP (Model Context Protocol)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/mcps` | Yes | List all MCP servers and their status |
| GET | `/v1/mcps/{server_id}` | Yes | Get details of a specific MCP server |
| ALL | `/v1/mcps/{server_id}/mcp` | Yes | Proxy all MCP protocol traffic to a specific server |

The `ALL /v1/mcps/{server_id}/mcp` endpoint acts as an MCP protocol proxy, forwarding any HTTP method to the target MCP server. This enables external clients to invoke MCP tools through the API server.

---

### 2.7 Agents

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/agents` | Yes | List all agents |
| POST | `/v1/agents` | Yes | Create a new agent |
| GET | `/v1/agents/{id}` | Yes | Get agent by ID |
| PUT | `/v1/agents/{id}` | Yes | Update agent |
| DELETE | `/v1/agents/{id}` | Yes | Delete agent |
| GET | `/v1/agents/{id}/sessions` | Yes | List sessions for an agent |
| POST | `/v1/agents/{id}/sessions` | Yes | Create a new session |
| GET | `/v1/agents/{id}/sessions/{sid}` | Yes | Get session by ID |
| PUT | `/v1/agents/{id}/sessions/{sid}` | Yes | Update session |
| DELETE | `/v1/agents/{id}/sessions/{sid}` | Yes | Delete session |
| GET | `/v1/agents/{id}/sessions/{sid}/messages` | Yes | List messages in a session |
| POST | `/v1/agents/{id}/sessions/{sid}/messages` | Yes | Send a message to a session |

**Agent CRUD Request Body** (POST/PUT):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Agent name |
| type | string | Yes | Agent type |
| description | string | No | Agent description |
| instructions | string | No | System instructions |
| model | string | No | Primary model |
| plan_model | string | No | Planning model |
| small_model | string | No | Lightweight model |
| mcps | string[] | No | MCP server IDs |
| allowed_tools | string[] | No | Tool whitelist |
| accessible_paths | string[] | No | File system paths |
| configuration | object | No | Additional config |

**Session Message Request Body** (POST):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Message content |
| role | string | No | Role (default: "user") |

---

### 2.8 REST API Summary Table

| # | Method | Path | Feature | Description |
|---|--------|------|---------|-------------|
| 1 | GET | `/` | F001 | Root health check |
| 2 | GET | `/health` | F001 | Health check |
| 3 | POST | `/v1/chat/completions` | F002 | OpenAI-compatible chat |
| 4 | POST | `/v1/messages` | F002 | Anthropic-compatible messages |
| 5 | POST | `/{provider_id}/v1/messages` | F002 | Provider-specific messages |
| 6 | GET | `/v1/models` | F002 | List models |
| 7 | GET | `/v1/mcps` | F006 | List MCP servers |
| 8 | GET | `/v1/mcps/{server_id}` | F006 | Get MCP server |
| 9 | ALL | `/v1/mcps/{server_id}/mcp` | F006 | MCP protocol proxy |
| 10 | GET | `/v1/agents` | F010 | List agents |
| 11 | POST | `/v1/agents` | F010 | Create agent |
| 12 | GET | `/v1/agents/{id}` | F010 | Get agent |
| 13 | PUT | `/v1/agents/{id}` | F010 | Update agent |
| 14 | DELETE | `/v1/agents/{id}` | F010 | Delete agent |
| 15 | GET | `/v1/agents/{id}/sessions` | F010 | List sessions |
| 16 | POST | `/v1/agents/{id}/sessions` | F010 | Create session |
| 17 | GET | `/v1/agents/{id}/sessions/{sid}` | F010 | Get session |
| 18 | PUT | `/v1/agents/{id}/sessions/{sid}` | F010 | Update session |
| 19 | DELETE | `/v1/agents/{id}/sessions/{sid}` | F010 | Delete session |
| 20 | GET | `/v1/agents/{id}/sessions/{sid}/messages` | F010 | List session messages |
| 21 | POST | `/v1/agents/{id}/sessions/{sid}/messages` | F010 | Send session message |

---

## 3. IPC Channels (Electron)

IPC channels use `ipcMain.handle` (request/response) or `ipcMain.on` (fire-and-forget) in the main process, invoked from the renderer via `ipcRenderer.invoke` or `ipcRenderer.send` through the preload bridge.

### 3.1 F001 — App Core

Core application lifecycle, configuration, window management, and system operations.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `app:info` | Renderer -> Main | Get app version and metadata | — | `{ version, name, platform }` |
| `app:proxy` | Renderer -> Main | Get/set proxy configuration | `{ url? }` | `{ url }` |
| `app:reload` | Renderer -> Main | Reload the application | — | — |
| `config:get` | Renderer -> Main | Read a config value | `{ key }` | `{ value }` |
| `config:set` | Renderer -> Main | Write a config value | `{ key, value }` | — |
| `window:create` | Renderer -> Main | Open a new window | `{ type, options }` | `{ windowId }` |
| `window:close` | Renderer -> Main | Close a window | `{ windowId? }` | — |
| `window:minimize` | Renderer -> Main | Minimize window | — | — |
| `window:maximize` | Renderer -> Main | Toggle maximize | — | — |
| `window:fullscreen` | Renderer -> Main | Toggle fullscreen | — | `{ isFullscreen }` |
| `window:set-always-on-top` | Renderer -> Main | Pin window on top | `{ flag }` | — |
| `system:get-locale` | Renderer -> Main | Get OS locale | — | `{ locale }` |
| `system:get-theme` | Renderer -> Main | Get OS theme (light/dark) | — | `{ theme }` |
| `system:open-url` | Renderer -> Main | Open URL in default browser | `{ url }` | — |
| `system:open-path` | Renderer -> Main | Open path in file manager | `{ path }` | — |
| `system:get-hostname` | Renderer -> Main | Get machine hostname | — | `{ hostname }` |
| `system:get-cpu-info` | Renderer -> Main | Get CPU info | — | `{ cores, model }` |
| `system:get-memory-info` | Renderer -> Main | Get memory info | — | `{ total, free }` |
| `notification:show` | Renderer -> Main | Show OS notification | `{ title, body }` | — |
| `notification:clear` | Renderer -> Main | Clear notifications | — | — |

---

### 3.2 F002 — AI Provider

Provider-specific authentication and token management.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `vertexai:get-access-token` | Renderer -> Main | Get Vertex AI OAuth token | `{ credentials }` | `{ token, expiry }` |
| `vertexai:refresh-token` | Renderer -> Main | Refresh Vertex AI token | `{ refreshToken }` | `{ token, expiry }` |
| `gemini:get-api-key` | Renderer -> Main | Retrieve stored Gemini key | — | `{ apiKey }` |
| `copilot:get-token` | Renderer -> Main | Get GitHub Copilot token | — | `{ token }` |

Note: Most AI provider operations (model listing, chat completion, streaming) happen via direct HTTP from the main process, not IPC. The IPC channels here handle credential management only.

---

### 3.3 F003 — Chat

Chat message handling is primarily client-side (Dexie + Zustand). No dedicated IPC channels -- message CRUD operates in the renderer process. AI streaming is triggered from the renderer, with the main process handling HTTP connections to providers.

Key interactions with other features via IPC:
- Uses `mcp:call-tool` (F006) for tool execution during chat
- Uses `knowledge-base:search` (F007) for RAG context injection
- Uses `memory:search` (F011) for memory context injection
- Uses `file:read` (F008) for file attachment processing

---

### 3.4 F004 — Editor

Editor operations are entirely client-side (TipTap + CodeMirror in the renderer). No IPC channels.

---

### 3.5 F005 — Auth

OAuth flows and credential management for third-party providers.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `anthropic:auth-start` | Renderer -> Main | Start Anthropic OAuth flow | — | `{ authUrl }` |
| `anthropic:auth-callback` | Main -> Renderer | OAuth callback with code | `{ code }` | — |
| `anthropic:auth-token` | Renderer -> Main | Exchange code for token | `{ code }` | `{ accessToken, refreshToken }` |
| `anthropic:auth-refresh` | Renderer -> Main | Refresh Anthropic token | `{ refreshToken }` | `{ accessToken }` |
| `anthropic:auth-revoke` | Renderer -> Main | Revoke Anthropic credentials | — | — |
| `copilot:auth-start` | Renderer -> Main | Start GitHub Copilot OAuth | — | `{ deviceCode, userCode, verificationUri }` |
| `copilot:auth-poll` | Renderer -> Main | Poll for Copilot auth completion | `{ deviceCode }` | `{ accessToken }` |
| `copilot:auth-revoke` | Renderer -> Main | Revoke Copilot credentials | — | — |
| `cherryin:auth-start` | Renderer -> Main | Start AngduIN OAuth flow | — | `{ authUrl }` |
| `cherryin:auth-callback` | Main -> Renderer | AngduIN OAuth callback | `{ code }` | — |
| `cherryin:auth-token` | Renderer -> Main | Exchange code for AngduIN token | `{ code }` | `{ accessToken }` |
| `cherryin:auth-refresh` | Renderer -> Main | Refresh AngduIN token | `{ refreshToken }` | `{ accessToken }` |
| `cherryin:auth-revoke` | Renderer -> Main | Revoke AngduIN credentials | — | — |

Note: `cherryin:*` channels map to the original CherryIN service; renamed to AngduIN in the new build.

---

### 3.6 F006 — MCP (Model Context Protocol)

MCP server lifecycle management, tool execution, and resource access.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `mcp:add-server` | Renderer -> Main | Register a new MCP server | `MCPServer` config | `{ serverId }` |
| `mcp:remove-server` | Renderer -> Main | Unregister an MCP server | `{ serverId }` | — |
| `mcp:update-server` | Renderer -> Main | Update MCP server config | `{ serverId, config }` | — |
| `mcp:start-server` | Renderer -> Main | Start an MCP server process | `{ serverId }` | `{ status }` |
| `mcp:stop-server` | Renderer -> Main | Stop an MCP server process | `{ serverId }` | — |
| `mcp:restart-server` | Renderer -> Main | Restart an MCP server | `{ serverId }` | `{ status }` |
| `mcp:get-server-status` | Renderer -> Main | Get server runtime status | `{ serverId }` | `{ status, uptime }` |
| `mcp:list-tools` | Renderer -> Main | List tools from a server | `{ serverId }` | `Tool[]` |
| `mcp:call-tool` | Renderer -> Main | Execute a tool on a server | `{ serverId, toolName, args }` | `{ result }` |
| `mcp:list-resources` | Renderer -> Main | List resources from a server | `{ serverId }` | `Resource[]` |
| `mcp:read-resource` | Renderer -> Main | Read a specific resource | `{ serverId, resourceUri }` | `{ content }` |
| `mcp:list-prompts` | Renderer -> Main | List prompts from a server | `{ serverId }` | `Prompt[]` |
| `mcp:get-prompt` | Renderer -> Main | Get a prompt by name | `{ serverId, promptName }` | `{ prompt }` |
| `mcp:subscribe-resource` | Renderer -> Main | Subscribe to resource updates | `{ serverId, resourceUri }` | — |
| `mcp:unsubscribe-resource` | Renderer -> Main | Unsubscribe from resource | `{ serverId, resourceUri }` | — |

---

### 3.7 F007 — Knowledge

Knowledge base management, embedding, and RAG search.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `knowledge-base:create` | Renderer -> Main | Create a knowledge base | `{ name, model, dimensions, chunkSize, chunkOverlap }` | `{ id }` |
| `knowledge-base:delete` | Renderer -> Main | Delete a knowledge base | `{ id }` | — |
| `knowledge-base:update` | Renderer -> Main | Update KB metadata | `{ id, updates }` | — |
| `knowledge-base:add` | Renderer -> Main | Add item to knowledge base | `{ baseId, type, content, sourceUrl? }` | `{ itemId }` |
| `knowledge-base:remove` | Renderer -> Main | Remove item from KB | `{ baseId, itemId }` | — |
| `knowledge-base:search` | Renderer -> Main | Semantic search in KB | `{ baseId, query, topK?, threshold? }` | `{ results: [{ content, score }] }` |
| `knowledge-base:reindex` | Renderer -> Main | Re-embed all items in a KB | `{ baseId }` | — |
| `knowledge-base:get-status` | Renderer -> Main | Get processing status | `{ baseId }` | `{ totalItems, processed, errors }` |
| `knowledge-base:preprocess` | Renderer -> Main | Preprocess a document | `{ itemId }` | `{ chunks, tokens }` |

---

### 3.8 F008 — File Management

File operations, backup/restore, and data import/export.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `file:open` | Renderer -> Main | Open file dialog | `{ filters?, multiple? }` | `{ filePaths }` |
| `file:save` | Renderer -> Main | Save file dialog | `{ defaultPath?, filters? }` | `{ filePath }` |
| `file:upload` | Renderer -> Main | Upload file to app storage | `{ sourcePath, purpose }` | `FileMetadata` |
| `file:delete` | Renderer -> Main | Delete a managed file | `{ fileId }` | — |
| `file:read` | Renderer -> Main | Read file content | `{ fileId or path }` | `{ content, encoding }` |
| `file:write` | Renderer -> Main | Write content to file | `{ path, content }` | — |
| `file:get-metadata` | Renderer -> Main | Get file metadata | `{ fileId }` | `FileMetadata` |
| `file:open-folder` | Renderer -> Main | Open folder in OS file manager | `{ path }` | — |
| `backup:export` | Renderer -> Main | Export app data to backup | `{ format, path }` | `{ backupPath }` |
| `backup:import` | Renderer -> Main | Import app data from backup | `{ path }` | `{ result }` |
| `backup:list` | Renderer -> Main | List available backups | — | `Backup[]` |
| `backup:sync-webdav` | Renderer -> Main | Sync to WebDAV | `{ url, credentials }` | `{ status }` |
| `backup:sync-s3` | Renderer -> Main | Sync to S3-compatible | `{ bucket, credentials }` | `{ status }` |
| `backup:sync-local` | Renderer -> Main | Sync to local directory | `{ path }` | `{ status }` |
| `zip:compress` | Renderer -> Main | Compress files to ZIP | `{ files, outputPath }` | `{ zipPath }` |
| `zip:extract` | Renderer -> Main | Extract ZIP archive | `{ zipPath, outputDir }` | `{ extractedPaths }` |

---

### 3.9 F009 — Settings UI

Settings UI has no dedicated IPC channels. It reads and writes configuration through the F001 channels:

- `config:get` — read setting values
- `config:set` — write setting values
- Provider settings flow through the Zustand store and persist middleware

---

### 3.10 F010 — Agent

Agent system, code tool execution, and plugin management.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `code-tools:run` | Renderer -> Main | Execute a code tool | `{ toolName, args, sessionId }` | `{ result, output, exitCode }` |
| `code-tools:cancel` | Renderer -> Main | Cancel a running tool | `{ executionId }` | — |
| `code-tools:list` | Renderer -> Main | List available code tools | — | `Tool[]` |
| `agent-message:send` | Renderer -> Main | Send message to agent session | `{ sessionId, content }` | Stream of events |
| `agent-message:cancel` | Renderer -> Main | Cancel agent message generation | `{ sessionId }` | — |
| `agent-message:history` | Renderer -> Main | Get message history for session | `{ sessionId, limit? }` | `SessionMessage[]` |
| `agent-tool-permission:request` | Main -> Renderer | Request user permission for tool | `{ toolName, args, sessionId }` | — |
| `agent-tool-permission:respond` | Renderer -> Main | User responds to permission request | `{ requestId, approved }` | — |
| `agent-tool-permission:auto-approve` | Renderer -> Main | Set auto-approve rules | `{ sessionId, rules }` | — |
| `claudeCodePlugin:install` | Renderer -> Main | Install a plugin | `{ sourcePath }` | `Plugin` |
| `claudeCodePlugin:uninstall` | Renderer -> Main | Uninstall a plugin | `{ pluginName }` | — |
| `claudeCodePlugin:list` | Renderer -> Main | List installed plugins | — | `Plugin[]` |
| `claudeCodePlugin:update` | Renderer -> Main | Update a plugin | `{ pluginName }` | `Plugin` |

---

### 3.11 F011 — Memory

Long-term vector memory for conversation context.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `memory:add` | Renderer -> Main | Store a memory entry | `{ content, metadata?, tags? }` | `{ memoryId }` |
| `memory:search` | Renderer -> Main | Semantic search in memory | `{ query, topK?, threshold? }` | `{ results: [{ content, score, metadata }] }` |
| `memory:list` | Renderer -> Main | List all memory entries | `{ offset?, limit? }` | `{ entries, total }` |
| `memory:delete` | Renderer -> Main | Delete a memory entry | `{ memoryId }` | — |
| `memory:update` | Renderer -> Main | Update a memory entry | `{ memoryId, content?, metadata? }` | — |
| `memory:clear` | Renderer -> Main | Clear all memories | — | — |
| `memory:stats` | Renderer -> Main | Get memory usage statistics | — | `{ count, vectorSize }` |

---

### 3.12 F012 — Extensions

Mini applications, selection assistant, API server control, and LAN transfer.

| Channel | Direction | Description | Payload | Response |
|---------|-----------|-------------|---------|----------|
| `local-transfer:start-server` | Renderer -> Main | Start LAN transfer server | `{ port? }` | `{ port, addresses }` |
| `local-transfer:stop-server` | Renderer -> Main | Stop LAN transfer server | — | — |
| `local-transfer:send` | Renderer -> Main | Send data to peer | `{ targetAddress, data }` | `{ status }` |
| `local-transfer:receive` | Main -> Renderer | Data received from peer | `{ data, senderAddress }` | — |
| `openclaw:search` | Renderer -> Main | Search OpenClaw registry | `{ query }` | `{ results }` |
| `openclaw:install` | Renderer -> Main | Install from OpenClaw | `{ packageId }` | `{ status }` |
| `selection:activate` | Renderer -> Main | Activate selection assistant | `{ text }` | — |
| `selection:deactivate` | Renderer -> Main | Deactivate selection assistant | — | — |
| `selection:process` | Renderer -> Main | Process selected text | `{ text, action }` | `{ result }` |
| `miniwindow:open` | Renderer -> Main | Open a mini window/app | `{ type, config }` | `{ windowId }` |
| `miniwindow:close` | Renderer -> Main | Close a mini window | `{ windowId }` | — |
| `miniwindow:send-data` | Renderer -> Main | Send data to mini window | `{ windowId, data }` | — |
| `api-server:start` | Renderer -> Main | Start the REST API server | `{ port?, apiKey? }` | `{ port, status }` |
| `api-server:stop` | Renderer -> Main | Stop the REST API server | — | — |
| `api-server:status` | Renderer -> Main | Get API server status | — | `{ running, port, connections }` |
| `api-server:set-config` | Renderer -> Main | Update API server config | `{ port?, apiKey?, maxPayload? }` | — |

---

## 4. Cross-Feature API Dependencies

This table maps which features provide APIs consumed by other features.

| API Surface | Provider Feature | Consumer Features | Transport | Purpose |
|-------------|-----------------|-------------------|-----------|---------|
| `config:get/set` | F001-app-core | All | IPC | Configuration read/write |
| `file:open/save/upload/read` | F008-file-management | F003, F007, F012 | IPC | File operations for attachments, knowledge docs, exports |
| `mcp:call-tool` | F006-mcp | F003, F010 | IPC | Tool execution during chat and agent sessions |
| `mcp:list-tools` | F006-mcp | F003, F009, F010 | IPC | Tool discovery for UI and agent configuration |
| `knowledge-base:search` | F007-knowledge | F003 | IPC | RAG context injection into chat messages |
| `knowledge-base:add/remove` | F007-knowledge | F008 | IPC | Knowledge item management triggered by file operations |
| `memory:search` | F011-memory | F003 | IPC | Memory context injection into chat messages |
| `memory:add` | F011-memory | F003 | IPC | Auto-memorization from conversations |
| `code-tools:run` | F010-agent | F003 | IPC | Code execution triggered from chat |
| `agent-tool-permission:*` | F010-agent | F003 | IPC | Permission flow for agent tool execution |
| `backup:sync-*` | F008-file-management | F009 | IPC | Backup sync triggered from settings UI |
| `window:create` | F001-app-core | F012 | IPC | Mini window creation for extensions |
| `notification:show` | F001-app-core | F003, F007, F010 | IPC | User notifications for completions, errors, permissions |
| `/v1/chat/completions` | F002-ai-provider | F012 (API server) | REST | External clients access chat via API server |
| `/v1/models` | F002-ai-provider | F012 (API server) | REST | External clients list available models |
| `/v1/mcps/{id}/mcp` | F006-mcp | F012 (API server) | REST | External clients invoke MCP tools via proxy |
| `/v1/agents/*` | F010-agent | F012 (API server) | REST | External clients manage agents and sessions |

---

## 5. IPC Channel Naming Conventions

| Pattern | Description | Examples |
|---------|-------------|---------|
| `{domain}:{action}` | Standard request/response | `config:get`, `file:open`, `memory:add` |
| `{domain}:{entity}-{action}` | Entity-scoped operations | `knowledge-base:create`, `agent-message:send` |
| `{provider}:{auth-action}` | OAuth flow channels | `anthropic:auth-start`, `copilot:auth-poll` |
| `{domain}:{sub}:{action}` | Namespaced sub-operations | — (not currently used, reserved) |

Direction conventions:
- **Renderer -> Main**: `ipcRenderer.invoke(channel, payload)` returns a Promise
- **Main -> Renderer**: `webContents.send(channel, payload)` pushes events to renderer
- **Bidirectional**: Some channels (e.g., permission flows) use both directions

---

## 6. Error Handling

All IPC handlers follow a consistent error pattern:

| Field | Type | Description |
|-------|------|-------------|
| code | string | Machine-readable error code (e.g., "MCP_SERVER_NOT_FOUND") |
| message | string | Human-readable error message |
| details | object | Optional additional context |

REST API errors follow standard HTTP status codes with JSON error bodies:

| Status | Usage |
|--------|-------|
| 400 | Invalid request body (Zod validation failure) |
| 401 | Missing or invalid API key |
| 404 | Resource not found (agent, session, MCP server) |
| 429 | Rate limited (proxied from upstream provider) |
| 500 | Internal server error |
| 502 | Upstream provider error |

---

## 7. Payload Constraints

| Constraint | Value | Applies To |
|------------|-------|-----------|
| Max JSON body | 50 MB | REST API (Express `express.json({ limit })`) |
| Max IPC payload | No hard limit (Electron) | IPC channels (practical limit ~256 MB) |
| SSE keepalive | 15 seconds | Streaming endpoints |
| Request timeout | 300 seconds | Long-running chat completions |
| MCP tool timeout | Configurable per server (default 30s) | `mcp:call-tool` |

---

**Version**: 0.1.0 | **Generated**: 2026-03-07
