# API Registry -- Cherry Studio Reverse-Spec

| Key        | Value                                        |
|------------|----------------------------------------------|
| Source     | `/Users/coolhero/Study/oss/cherry-studio`    |
| Generated  | 2026-03-04                                   |
| REST Endpoints | 20                                       |
| IPC Channels   | ~220                                     |
| Method     | Static analysis of Express routes, Electron IPC handlers, preload bridge |

---

## Part 1: REST API Endpoints

The built-in API server is an Express app running inside the Electron main process,
exposed on a configurable local port. All non-public endpoints require a Bearer token.

---

### Public Endpoints (4)

#### GET /

| Field | Value |
|-------|-------|
| Auth | None |
| Description | Root landing page; returns HTML welcome page |
| Response | `text/html` |
| Source | `src/main/server/routes/index.ts` |

#### GET /health

| Field | Value |
|-------|-------|
| Auth | None |
| Description | Health check endpoint |
| Response | `{ "status": "ok", "version": "<app-version>" }` |
| Source | `src/main/server/routes/index.ts` |

#### GET /api-docs

| Field | Value |
|-------|-------|
| Auth | None |
| Description | Swagger UI for interactive API documentation |
| Response | `text/html` (Swagger UI) |
| Source | `src/main/server/swagger.ts` |

#### GET /api-docs.json

| Field | Value |
|-------|-------|
| Auth | None |
| Description | OpenAPI 3.0 specification in JSON |
| Response | `application/json` (OpenAPI spec) |
| Source | `src/main/server/swagger.ts` |

---

### Chat Endpoints (1)

#### POST /v1/chat/completions

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | OpenAI-compatible chat completions endpoint. Proxies requests to the configured provider. Supports streaming via SSE. |
| Source | `src/main/server/routes/chat.ts` |

**Request Body:**

```json
{
  "model": "string (required)",
  "messages": [
    { "role": "system|user|assistant", "content": "string" }
  ],
  "temperature": "number (optional, 0-2)",
  "top_p": "number (optional, 0-1)",
  "max_tokens": "number (optional)",
  "stream": "boolean (optional, default: false)",
  "stop": "string[] (optional)",
  "tools": "Tool[] (optional)",
  "tool_choice": "string|object (optional)"
}
```

**Response (non-streaming):**

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "string" },
      "finish_reason": "stop|length|tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

**Response (streaming):** SSE stream of `data: {...}` chunks following OpenAI format.

---

### Messages Endpoints (2)

#### POST /v1/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Anthropic-compatible messages endpoint. Creates a message using the Anthropic wire format. |
| Source | `src/main/server/routes/messages.ts` |

**Request Body:**

```json
{
  "model": "string (required)",
  "messages": [
    { "role": "user|assistant", "content": "string|ContentBlock[]" }
  ],
  "system": "string (optional)",
  "max_tokens": "number (required)",
  "temperature": "number (optional)",
  "stream": "boolean (optional)",
  "tools": "Tool[] (optional)",
  "tool_choice": "object (optional)"
}
```

**Response:** Anthropic Messages API format.

#### POST /:provider_id/v1/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Provider-scoped Anthropic messages endpoint. Routes to a specific provider by ID. |
| Source | `src/main/server/routes/messages.ts` |

**Request/Response:** Same as `POST /v1/messages`, but uses the specified provider's configuration.

---

### Models Endpoint (1)

#### GET /v1/models

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Lists all available models across all enabled providers. OpenAI-compatible format. |
| Source | `src/main/server/routes/models.ts` |

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "string",
      "object": "model",
      "created": 0,
      "owned_by": "string (provider name)"
    }
  ]
}
```

---

### MCP Endpoints (3)

#### GET /v1/mcps

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Lists all configured MCP servers and their status |
| Source | `src/main/server/routes/mcp.ts` |

**Response:**

```json
{
  "servers": [
    {
      "id": "string",
      "name": "string",
      "type": "stdio|sse|streamable-http|inMemory",
      "isActive": true,
      "tools": ["tool-name-1", "tool-name-2"]
    }
  ]
}
```

#### GET /v1/mcps/:server_id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Gets details for a specific MCP server including tools, prompts, resources |
| Source | `src/main/server/routes/mcp.ts` |

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "isActive": true,
  "tools": [{ "name": "string", "description": "string", "inputSchema": {} }],
  "prompts": [{ "name": "string", "description": "string" }],
  "resources": [{ "uri": "string", "name": "string" }]
}
```

#### ALL /v1/mcps/:server_id/mcp

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | MCP protocol proxy. Forwards all HTTP methods to the MCP server's transport layer, enabling direct MCP protocol communication. |
| Source | `src/main/server/routes/mcp.ts` |

**Request/Response:** Raw MCP protocol messages (JSON-RPC 2.0 over HTTP).

---

### Agent Endpoints (6)

#### POST /v1/agents

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Create a new agent |
| Source | `src/main/server/routes/agents.ts` |

**Request Body:**

```json
{
  "name": "string (required)",
  "type": "string (required)",
  "model": "string (optional)",
  "prompt": "string (optional)",
  "accessible_paths": "string[] (optional)",
  "mcps": "string[] (optional)",
  "settings": "object (optional)"
}
```

**Response:** `201 Created` with the full Agent object.

#### GET /v1/agents

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | List all agents |
| Source | `src/main/server/routes/agents.ts` |

**Response:** `{ "agents": Agent[] }`

#### GET /v1/agents/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Get a single agent by ID |
| Source | `src/main/server/routes/agents.ts` |

**Response:** Agent object or `404`.

#### PUT /v1/agents/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Full replacement update of an agent |
| Source | `src/main/server/routes/agents.ts` |

**Request Body:** Full Agent object (all fields).
**Response:** Updated Agent object.

#### PATCH /v1/agents/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Partial update of an agent |
| Source | `src/main/server/routes/agents.ts` |

**Request Body:** Partial Agent object (only changed fields).
**Response:** Updated Agent object.

#### DELETE /v1/agents/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Delete an agent and all its sessions/messages |
| Source | `src/main/server/routes/agents.ts` |

**Response:** `204 No Content`.

---

### Session Endpoints (5)

#### POST /v1/agents/:agentId/sessions

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Create a new session for an agent |
| Source | `src/main/server/routes/sessions.ts` |

**Request Body:**

```json
{
  "name": "string (optional, auto-generated if omitted)",
  "model": "string (optional, inherits from agent)"
}
```

**Response:** `201 Created` with Session object.

#### GET /v1/agents/:agentId/sessions

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | List all sessions for an agent |
| Source | `src/main/server/routes/sessions.ts` |

**Response:** `{ "sessions": Session[] }`

#### GET /v1/agents/:agentId/sessions/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Get a specific session with its messages |
| Source | `src/main/server/routes/sessions.ts` |

**Response:** Session object with `messages` array included.

#### PUT /v1/agents/:agentId/sessions/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Full replacement update of a session |
| Source | `src/main/server/routes/sessions.ts` |

**Response:** Updated Session object.

#### PATCH /v1/agents/:agentId/sessions/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Partial update of a session |
| Source | `src/main/server/routes/sessions.ts` |

**Response:** Updated Session object.

#### DELETE /v1/agents/:agentId/sessions/:id

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Delete a session and all its messages |
| Source | `src/main/server/routes/sessions.ts` |

**Response:** `204 No Content`.

---

### Session Message Endpoints (2)

#### POST /v1/agents/:agentId/sessions/:sessionId/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Send a message in a session. Triggers agent processing and returns the assistant response. Supports streaming via SSE. |
| Source | `src/main/server/routes/session-messages.ts` |

**Request Body:**

```json
{
  "content": "string (required)",
  "role": "user (default)",
  "stream": "boolean (optional, default: false)"
}
```

**Response (non-streaming):** SessionMessage object with assistant response.
**Response (streaming):** SSE stream of message chunks.

#### DELETE /v1/agents/:agentId/sessions/:sessionId/messages

| Field | Value |
|-------|-------|
| Auth | Bearer token |
| Description | Clear all messages in a session |
| Source | `src/main/server/routes/session-messages.ts` |

**Response:** `204 No Content`.

---

## Part 2: IPC Channels

Electron IPC channels connect the renderer process (React UI) to the main process (Node.js).
Direction: **R->M** = Renderer invokes Main; **M->R** = Main pushes to Renderer.

Total estimated channels: **~220**

---

### IPC Channel Summary by Domain

| # | Domain | Channel Name Pattern | Direction | Description | Count |
|---|--------|---------------------|-----------|-------------|-------|
| 1 | **App** | `app:*` | R->M / M->R | Application lifecycle, system info, window management, theme, menu, tray, dock, updates, paths, proxy, cache, GPU, hardware info, protocol handlers | ~50 |
| 2 | **Config** | `config:get`, `config:set` | R->M | Read/write electron-store configuration values | 2 |
| 3 | **Notification** | `notification:show`, `notification:clear` | R->M | System notification display | 2 |
| 4 | **Window** | `window:*` | R->M / M->R | Window create, close, minimize, maximize, fullscreen, focus, set-title, set-size, toggle-devtools, show-context-menu, etc. | ~12 |
| 5 | **File** | `file:*` | R->M | File operations: open, save, read, write, delete, copy, move, compress, decompress, download, upload, select-folder, select-file, get-icon, create-temp, hash, base64, binary read/write, watch, metadata, thumbnail, etc. | ~40 |
| 6 | **Backup** | `backup:*` | R->M | Backup and restore: create-backup, restore-backup, list-backups, delete-backup, export, import, webdav-*, nutstore-*, auto-backup-*, schedule, validate, migrate | ~18 |
| 7 | **MCP** | `mcp:*` | R->M / M->R | MCP server management: start, stop, restart, list-servers, get-server, add-server, remove-server, update-server, list-tools, call-tool, list-prompts, get-prompt, list-resources, read-resource, install, marketplace, logs, status-change | ~18 |
| 8 | **Knowledge** | `knowledge:*` | R->M / M->R | Knowledge base operations: create-base, delete-base, add-item, remove-item, reindex, search, get-status, progress events | 7 |
| 9 | **Memory** | `memory:*` | R->M | Memory system: get-all, add, update, delete, search, clear, import, export, get-history, get-config, set-config | ~11 |
| 10 | **Agent Messages** | `agent:messages:*` | R->M | Agent message operations: send, stream, clear | 3 |
| 11 | **Copilot** | `copilot:*` | R->M / M->R | In-app copilot: suggest, accept, dismiss, configure, status, stream | 6 |
| 12 | **CherryIN** | `cherry-in:*` | R->M / M->R | Cherry Studio account/cloud: login, logout, get-user, sync-status, subscribe, check-entitlement | 6 |
| 13 | **Anthropic OAuth** | `anthropic-oauth:*` | R->M / M->R | Anthropic OAuth flow: start, callback, refresh, revoke, get-token, status | 6 |
| 14 | **VertexAI** | `vertex-ai:*` | R->M | Vertex AI auth: get-access-token, validate-service-account, list-models | 3 |
| 15 | **Gemini** | `gemini:*` | R->M | Gemini-specific: upload-file, get-file, list-files, delete-file, generate-content | 5 |
| 16 | **AES** | `aes:encrypt`, `aes:decrypt` | R->M | AES-256 encryption/decryption of strings | 2 |
| 17 | **Zip** | `zip:compress`, `zip:decompress` | R->M | ZIP archive creation and extraction | 2 |
| 18 | **System** | `system:*` | R->M | System operations: get-locale, get-platform, get-arch, get-memory, get-cpu, get-hostname, is-dark-mode, get-displays | 8 |
| 19 | **Webview** | `webview:*` | R->M / M->R | Webview management: create, destroy, navigate, inject-css, execute-js | 5 |
| 20 | **Open** | `open:url`, `open:path` | R->M | Open external URL in browser or path in file manager | 2 |
| 21 | **Export** | `export:*` | R->M | Export conversation/data: export-markdown (and variants) | 1 |
| 22 | **Shortcuts** | `shortcuts:register` | R->M | Register/update global keyboard shortcuts | 1 |
| 23 | **Obsidian** | `obsidian:export`, `obsidian:validate` | R->M | Export to Obsidian vault, validate vault path | 2 |
| 24 | **Nutstore** | `nutstore:upload`, `nutstore:download`, `nutstore:list` | R->M | Nutstore WebDAV sync operations | 3 |
| 25 | **Search Window** | `search-window:*` | R->M / M->R | Spotlight-like search: show, hide, query | 3 |
| 26 | **Store Sync** | `store-sync:*` | R->M / M->R | Cross-window Redux store synchronization: get-state, set-state, subscribe, dispatch | 4 |
| 27 | **Selection** | `selection:*` | R->M / M->R | Text selection actions: get-selection, translate, explain, summarize, improve, expand, custom, show-popup, hide-popup, copy-result, configure, get-config, get-history, clear-history, set-shortcut, get-shortcut | ~16 |
| 28 | **Trace** | `trace:*` | R->M | Tracing and debugging: start-trace, stop-trace, get-traces, clear-traces, export-traces, get-stats, log-event, set-level, get-level, flush, configure, is-enabled | ~12 |
| 29 | **API Server** | `api-server:*` | R->M / M->R | Built-in API server: start, stop, get-status, set-port, set-token, get-config | 6 |
| 30 | **Python** | `python:execute` | R->M | Execute Python code in sandboxed environment | 1 |
| 31 | **CodeTools** | `code-tools:*` | R->M | Code execution tools: run, lint, format, get-languages, get-config | 5 |
| 32 | **OCR** | `ocr:recognize`, `ocr:get-languages` | R->M | Optical character recognition on images | 2 |
| 33 | **OVMS** | `ovms:*` | R->M | OpenVINO Model Server: start, stop, get-status, list-models, load-model, unload-model, get-config, predict | 8 |
| 34 | **CherryAI** | `cherry-ai:process` | R->M | Internal AI processing pipeline | 1 |
| 35 | **Claude Code Plugin** | `claude-code:*` | R->M / M->R | Claude Code integration: start-session, send-message, stop-session, get-status, install, configure, stream | 7 |
| 36 | **Local Transfer** | `local-transfer:*` | R->M / M->R | Device-to-device transfer: discover, connect, disconnect, send, receive, accept, reject, get-status, progress | 9 |
| 37 | **OpenClaw** | `openclaw:*` | R->M / M->R | OpenClaw integration: search, install, uninstall, list, update, get-info, get-config, set-config, rate, review, publish, validate, get-categories, get-featured, get-trending, subscribe | ~16 |
| 38 | **External Apps** | `external-apps:launch` | R->M | Launch external applications | 1 |
| 39 | **Analytics** | `analytics:track` | R->M | Send analytics event (opt-in) | 1 |

---

### IPC Channel Detail -- Selected High-Traffic Domains

#### App Domain (~50 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `app:info` | R->M | Get app version, name, paths |
| `app:get-path` | R->M | Get Electron special paths (userData, temp, etc.) |
| `app:get-system-info` | R->M | CPU, memory, GPU, OS info |
| `app:get-locale` | R->M | System locale string |
| `app:quit` | R->M | Quit the application |
| `app:relaunch` | R->M | Restart the application |
| `app:set-login-item` | R->M | Configure launch-at-login |
| `app:get-login-item` | R->M | Check launch-at-login state |
| `app:check-for-updates` | R->M | Trigger update check |
| `app:download-update` | R->M | Download available update |
| `app:install-update` | R->M | Install downloaded update and restart |
| `app:update-available` | M->R | Notify renderer of available update |
| `app:update-progress` | M->R | Update download progress |
| `app:set-theme` | R->M | Set native theme (light/dark/auto) |
| `app:get-theme` | R->M | Get current native theme |
| `app:theme-changed` | M->R | Notify renderer of OS theme change |
| `app:set-proxy` | R->M | Configure HTTP/SOCKS proxy |
| `app:get-proxy` | R->M | Get current proxy settings |
| `app:clear-cache` | R->M | Clear HTTP cache and temp files |
| `app:get-cache-size` | R->M | Get cache directory size |
| `app:set-badge-count` | R->M | Set dock/taskbar badge count |
| `app:show-dock` | R->M | Show dock icon (macOS) |
| `app:hide-dock` | R->M | Hide dock icon (macOS) |
| `app:set-tray-title` | R->M | Set tray icon title/tooltip |
| `app:set-tray-icon` | R->M | Set tray icon image |
| `app:show-tray-menu` | R->M | Show tray context menu |
| `app:register-protocol` | R->M | Register custom URL protocol handler |
| `app:handle-protocol` | M->R | Incoming URL from protocol handler |
| `app:set-menu` | R->M | Set application menu |
| `app:set-context-menu` | R->M | Set right-click context menu |
| `app:gpu-info` | R->M | Get GPU renderer info |
| `app:get-displays` | R->M | Get connected displays info |
| `app:is-focused` | R->M | Check if app window is focused |
| `app:focus` | R->M | Focus the main window |
| `app:minimize-to-tray` | R->M | Minimize to system tray |
| `app:restore-from-tray` | R->M | Restore from system tray |
| `app:set-startup-url` | R->M | Set URL to open on next launch |
| `app:get-argv` | R->M | Get command-line arguments |
| `app:log` | R->M | Write to main process log |
| `app:get-logs` | R->M | Read log files |
| `app:open-log-folder` | R->M | Open logs directory in file manager |
| `app:set-progress-bar` | R->M | Set taskbar progress bar |
| `app:bounce-dock` | R->M | Bounce dock icon (macOS) |
| `app:set-window-button-visibility` | R->M | Show/hide traffic light buttons (macOS) |
| `app:get-safe-area` | R->M | Get safe area insets |
| `app:is-full-screen` | R->M | Check fullscreen state |
| `app:toggle-full-screen` | R->M | Toggle fullscreen |
| `app:set-always-on-top` | R->M | Set window always-on-top |
| `app:get-zoom-factor` | R->M | Get window zoom level |
| `app:set-zoom-factor` | R->M | Set window zoom level |

#### File Domain (~40 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `file:open` | R->M | Open file dialog and return selected path(s) |
| `file:save` | R->M | Save file dialog |
| `file:read` | R->M | Read file contents (text or binary) |
| `file:write` | R->M | Write content to file |
| `file:delete` | R->M | Delete a file |
| `file:copy` | R->M | Copy file to destination |
| `file:move` | R->M | Move/rename file |
| `file:exists` | R->M | Check if path exists |
| `file:stat` | R->M | Get file metadata (size, dates, etc.) |
| `file:mkdir` | R->M | Create directory recursively |
| `file:readdir` | R->M | List directory contents |
| `file:select-folder` | R->M | Open folder selection dialog |
| `file:select-file` | R->M | Open file selection dialog with filters |
| `file:get-icon` | R->M | Get system file icon as data URL |
| `file:create-temp` | R->M | Create temporary file |
| `file:hash` | R->M | Compute file hash (MD5/SHA-256) |
| `file:base64-encode` | R->M | Read file as base64 |
| `file:base64-decode` | R->M | Write base64 data to file |
| `file:binary-read` | R->M | Read file as ArrayBuffer |
| `file:binary-write` | R->M | Write ArrayBuffer to file |
| `file:compress` | R->M | Compress file (gzip) |
| `file:decompress` | R->M | Decompress file (gzip) |
| `file:download` | R->M | Download URL to local file |
| `file:upload` | R->M | Upload local file to URL |
| `file:watch` | R->M | Start watching file for changes |
| `file:unwatch` | R->M | Stop watching file |
| `file:changed` | M->R | Notify renderer of file change |
| `file:get-metadata` | R->M | Get extended file metadata |
| `file:thumbnail` | R->M | Generate thumbnail for image/video |
| `file:get-type` | R->M | Determine file type from path/extension |
| `file:append` | R->M | Append content to file |
| `file:truncate` | R->M | Truncate file |
| `file:rename` | R->M | Rename file/directory |
| `file:glob` | R->M | Glob pattern file search |
| `file:get-size` | R->M | Get file or directory size |
| `file:get-temp-path` | R->M | Get temp directory path |
| `file:get-downloads-path` | R->M | Get downloads directory path |
| `file:open-in-explorer` | R->M | Reveal file in OS file manager |
| `file:get-recent` | R->M | Get recently accessed files |
| `file:clear-recent` | R->M | Clear recent files list |

#### MCP Domain (~18 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `mcp:start-server` | R->M | Start an MCP server process |
| `mcp:stop-server` | R->M | Stop a running MCP server |
| `mcp:restart-server` | R->M | Restart an MCP server |
| `mcp:list-servers` | R->M | List all configured MCP servers |
| `mcp:get-server` | R->M | Get single server details |
| `mcp:add-server` | R->M | Add new MCP server config |
| `mcp:remove-server` | R->M | Remove MCP server config |
| `mcp:update-server` | R->M | Update MCP server config |
| `mcp:list-tools` | R->M | List tools for a server |
| `mcp:call-tool` | R->M | Invoke a tool on a server |
| `mcp:list-prompts` | R->M | List prompts for a server |
| `mcp:get-prompt` | R->M | Get a specific prompt |
| `mcp:list-resources` | R->M | List resources for a server |
| `mcp:read-resource` | R->M | Read a resource from a server |
| `mcp:install` | R->M | Install MCP server from registry/URL |
| `mcp:marketplace` | R->M | Browse MCP marketplace |
| `mcp:get-logs` | R->M | Get server process logs |
| `mcp:status-changed` | M->R | Notify renderer of server status change |

#### Backup Domain (~18 channels)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `backup:create` | R->M | Create a full backup archive |
| `backup:restore` | R->M | Restore from a backup archive |
| `backup:list` | R->M | List available local backups |
| `backup:delete` | R->M | Delete a local backup |
| `backup:export` | R->M | Export data to file (selective) |
| `backup:import` | R->M | Import data from file |
| `backup:validate` | R->M | Validate backup file integrity |
| `backup:migrate` | R->M | Run format migration on backup |
| `backup:webdav-connect` | R->M | Test WebDAV connection |
| `backup:webdav-upload` | R->M | Upload backup to WebDAV |
| `backup:webdav-download` | R->M | Download backup from WebDAV |
| `backup:webdav-list` | R->M | List backups on WebDAV |
| `backup:webdav-delete` | R->M | Delete backup from WebDAV |
| `backup:nutstore-sync` | R->M | Sync with Nutstore |
| `backup:nutstore-list` | R->M | List Nutstore backups |
| `backup:auto-backup-enable` | R->M | Enable scheduled auto-backup |
| `backup:auto-backup-disable` | R->M | Disable auto-backup |
| `backup:auto-backup-status` | R->M | Get auto-backup schedule status |

---

## Part 3: Cross-Feature API Dependencies

This table shows which features depend on APIs owned by other features.

| Consumer Feature | Consumed API | Owner Feature | Type | Description |
|-----------------|-------------|---------------|------|-------------|
| F005-ai-chat | POST /v1/chat/completions | F001-core-platform (server) | REST | Chat UI can use local API server |
| F005-ai-chat | `mcp:call-tool` | F006-mcp-integration | IPC | Chat invokes MCP tools during generation |
| F005-ai-chat | `mcp:list-tools` | F006-mcp-integration | IPC | Chat discovers available tools |
| F005-ai-chat | `knowledge:search` | F004-knowledge-base | IPC | RAG retrieval during message generation |
| F005-ai-chat | `memory:search` | F011-memory-system | IPC | Memory recall during generation |
| F005-ai-chat | `memory:add` | F011-memory-system | IPC | Auto-extract memories from conversations |
| F005-ai-chat | `file:read`, `file:base64-encode` | F001-core-platform | IPC | Read file attachments for upload |
| F005-ai-chat | `selection:*` | F010-auxiliary-features | IPC | Text selection actions trigger chat |
| F004-knowledge-base | `file:read`, `file:hash` | F001-core-platform | IPC | Read documents for indexing |
| F004-knowledge-base | Provider API (embedding) | F002-provider-management | Internal | Calls embedding models for vectorization |
| F006-mcp-integration | `file:*` | F001-core-platform | IPC | MCP servers may need filesystem access |
| F007-backup-sync | `backup:webdav-*` | F007-backup-sync (self) | IPC | WebDAV sync channels |
| F007-backup-sync | `file:compress`, `file:decompress` | F001-core-platform | IPC | Archive operations for backups |
| F007-backup-sync | `obsidian:*` | F007-backup-sync (self) | IPC | Obsidian export integration |
| F007-backup-sync | `nutstore:*` | F007-backup-sync (self) | IPC | Nutstore sync integration |
| F008-settings-ui | `config:get`, `config:set` | F001-core-platform | IPC | Read/write persistent settings |
| F008-settings-ui | `app:set-theme` | F001-core-platform | IPC | Apply theme changes |
| F008-settings-ui | `shortcuts:register` | F001-core-platform | IPC | Register keyboard shortcuts |
| F009-notes-editor | `file:write`, `file:read` | F001-core-platform | IPC | Persist notes to filesystem |
| F009-notes-editor | `obsidian:export` | F007-backup-sync | IPC | Export notes to Obsidian |
| F010-auxiliary-features | Provider API (generation) | F002-provider-management | Internal | Translation, painting use provider models |
| F010-auxiliary-features | `ocr:recognize` | F010-auxiliary-features (self) | IPC | OCR for image text extraction |
| F010-auxiliary-features | `code-tools:run` | F010-auxiliary-features (self) | IPC | Code execution sandbox |
| F011-memory-system | Provider API (extraction) | F002-provider-management | Internal | Uses LLM for memory extraction |
| F012-agent-framework | POST /v1/chat/completions | F001-core-platform (server) | REST | Agent uses chat completions API |
| F012-agent-framework | `mcp:call-tool` | F006-mcp-integration | IPC | Agent invokes MCP tools |
| F012-agent-framework | `agent:messages:*` | F012-agent-framework (self) | IPC | Agent message handling |
| F012-agent-framework | `claude-code:*` | F012-agent-framework | IPC | Claude Code plugin integration |
| F001-core-platform | `store-sync:*` | F001-core-platform (self) | IPC | Cross-window state sync |
| F001-core-platform | `analytics:track` | F001-core-platform (self) | IPC | Telemetry collection |

---

### API Authentication Summary

| Layer | Mechanism | Details |
|-------|-----------|---------|
| REST API | Bearer Token | Configured via settings; checked by Express middleware on all `/v1/*` routes |
| IPC | Implicit | Electron IPC is trusted (same-origin renderer to main process) |
| WebDAV | Basic Auth | Username + password from WebDavConfig |
| Nutstore | Token Auth | App-specific token from NutstoreConfig |
| Anthropic OAuth | OAuth 2.0 | PKCE flow with refresh tokens |
| Vertex AI | Service Account | GCP service account key JSON |
| CherryIN | Session Token | Proprietary auth for Cherry Studio cloud services |

---

### Rate Limiting & Throttling

| Scope | Mechanism | Configuration |
|-------|-----------|---------------|
| Provider-level | Concurrent request limiter | `Provider.rateLimit` field (per provider) |
| API Server | Express rate-limit middleware | Configurable via settings |
| MCP Tool Calls | Sequential per server | One tool call at a time per MCP server |
| Knowledge Indexing | Queue-based | Items processed sequentially per KB |
| Memory Extraction | Debounced | Triggered after conversation idle period |

---

*End of API Registry*
