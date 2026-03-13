# Business Logic Map

**Source**: /Users/coolhero/Develop/cherry-studio
**Generated**: 2026-03-13

---

## Logic Index

| Feature | Rules | Validations | Workflows | Cross-Feature Rules |
|---------|-------|-------------|-----------|---------------------|
| F001-app-shell | 6 | 3 | 3 | 3 |
| F002-navigation | 2 | 0 | 1 | 1 |
| F003-settings | 5 | 2 | 2 | 3 |
| F004-ai-engine | 8 | 4 | 4 | 5 |
| F005-assistant | 5 | 3 | 2 | 2 |
| F006-chat | 7 | 3 | 3 | 4 |
| F007-file-management | 4 | 4 | 2 | 2 |
| F008-mcp | 6 | 2 | 3 | 3 |
| F009-knowledge-base | 4 | 2 | 2 | 2 |
| F010-notes | 3 | 2 | 1 | 1 |
| F011-data-sync | 5 | 3 | 3 | 2 |
| F012-creative-tools | 3 | 1 | 2 | 1 |

---

## F001-app-shell

### Core Rules

**BR-001**: Window singleton enforcement
- Main window uses singleton pattern. If already exists and not destroyed, show + focus instead of creating new.
- Source: `WindowService.createMainWindow()` in `src/main/services/WindowService.ts`

**BR-002**: Shutdown save signal
- Before app quit, main process sends `App_SaveData` to renderer so it can persist Redux state.
- Source: `powerMonitorService.registerShutdownHandler()` in `src/main/ipc.ts:137-146`

**BR-003**: Prevent-quit guard
- Active operations (e.g., backup) can block app quit via `App_SetStopQuitApp`. A `before-quit` listener prevents exit and shows notification.
- Source: `src/main/ipc.ts:374-395`

**BR-004**: Proxy configuration three-mode
- Proxy supports three modes: `system` (OS proxy), custom (fixed_servers with bypass rules), empty string (direct/no proxy).
- Source: `src/main/ipc.ts:169-181`

**BR-005**: Platform-specific relaunch
- Linux AppImage: must set `execPath` to `APPIMAGE` env var and prepend `--appimage-extract-and-run` arg.
- Windows Portable: must set `execPath` to `PORTABLE_EXECUTABLE_FILE`.
- Source: `src/main/ipc.ts:475-495`

**BR-006**: Factory reset with graceful cleanup
- Reset closes all data connections first, then deletes data directory. Failures are logged but not thrown because the caller must always proceed to relaunch.
- Source: `src/main/ipc.ts:497-506`

### Validation Logic

**VL-001**: Main window existence check
- `checkMainWindow()` throws if main window is null or destroyed. Used by all Window_* IPC handlers.

**VL-002**: Path containment check
- `App_IsPathInside` uses `isPathInside(child, parent)` for proper parent-child path validation (prevents path traversal).

**VL-003**: Write permission check
- `App_HasWritePermission` tests filesystem write access before operations like data path change.

### Workflows

**WF-001**: App startup flow
1. Create main window (with window state keeper for position/size persistence)
2. Register IPC handlers
3. Register power monitor shutdown handlers
4. Set up store sync service
5. Apply theme, language, proxy from config
6. Check for updates (if auto-update enabled)

**WF-002**: Data path migration flow
1. User selects new path via `App_Select`
2. Validate write permission via `App_HasWritePermission`
3. Check not empty via `App_IsNotEmptyDir`
4. Copy data via `App_Copy` (with exclusion filters)
5. Flush all session data via `App_FlushAppData`
6. Set new path via `App_SetAppDataPath`
7. Relaunch via `App_RelaunchApp` with `--new-data-path=` arg

**WF-003**: Mini window lifecycle
1. Show: Create if not exists, position near tray/screen center
2. Pin: Prevent auto-hide on blur
3. Quote: Send selected text to main window via `App_QuoteToMain`
4. Hide/Close: Destroy or hide based on pin state

### Cross-Feature Rules

**XR-001**: Store sync across windows
- `StoreSyncService` broadcasts Redux actions from any window to all other subscribed windows. Actions tagged with `__storeSync` metadata to prevent infinite loops.
- Affects: All features with Redux state

**XR-002**: Selection assistant integration
- `SelectionService` registers IPC handlers for text selection from any app. Connected to mini window (F001) and chat (F006).

**XR-003**: Config notification system
- `configManager.set(key, value, isNotify)` — when isNotify=true, notifies all subscribers. Used by tray service, theme service, shortcut service to react to config changes.

---

## F002-navigation

### Core Rules

**BR-007**: Sidebar icon ordering
- `DEFAULT_SIDEBAR_ICONS` defines initial sidebar layout. Users can reorder; persisted in settings state.
- Source: `src/renderer/src/config/sidebar.ts`, `src/renderer/src/store/settings.ts`

**BR-008**: Tab management
- Tabs store tracks open tabs with active tab ID. Tab state persisted in Redux.
- Source: `src/renderer/src/store/tabs.ts`

### Workflows

**WF-004**: Navigation routing
1. Sidebar icons map to routes (chat, assistants, settings, knowledge, etc.)
2. Tab system allows multiple chat conversations open simultaneously
3. Active tab determines visible content

### Cross-Feature Rules

**XR-004**: Unified assistant/agent list ordering
- `unifiedListOrder` in assistants store maintains mixed ordering of assistants (F005) and agents, shared across navigation views.

---

## F003-settings

### Core Rules

**BR-009**: Config persistence via electron-store
- All settings stored via `ConfigManager` using `electron-store` (JSON file in userData).
- Source: `src/main/services/ConfigManager.ts`

**BR-010**: Language auto-detection
- Default language detected from `app.getLocale()`, falls back to `defaultLanguage` if locale not in supported list.
- Source: `ConfigManager.getLanguage()` in `src/main/services/ConfigManager.ts:64-66`

**BR-011**: Zoom factor management
- `handleZoomFactor` applies delta to all windows. Persisted via `ConfigKeys.ZoomFactor`. Has reset option.
- Source: `src/main/utils/zoom.ts`, `src/main/ipc.ts:329-333`

**BR-012**: Shortcut registration lifecycle
- On update: unregister all existing shortcuts, then re-register with new config. Includes zoom shortcuts by default.
- Source: `src/main/ipc.ts:695-702`, `src/main/services/ShortcutService.ts`

**BR-013**: Spell check propagation
- Spell check enable/disable propagated to ALL webContents (main window + webviews). Languages stored in config.
- Source: `src/main/ipc.ts:197-215`

### Validation Logic

**VL-004**: Spell check language guard
- Empty language array silently skipped (no-op) to prevent Electron crash.
- Source: `src/main/ipc.ts:207-209`

**VL-005**: Test channel change triggers download cancel
- Changing test plan or channel cancels any in-progress download before applying new setting.
- Source: `src/main/ipc.ts:243-257`

### Workflows

**WF-005**: Settings change propagation
1. Renderer dispatches Redux action (settings slice)
2. Settings change triggers IPC call to main process
3. Main process updates ConfigManager
4. ConfigManager notifies subscribers (tray, theme, shortcuts)
5. Store sync broadcasts to other windows

**WF-006**: Auto-update configuration
1. User toggles auto-update in settings
2. `App_SetAutoUpdate` → appUpdater.setAutoUpdate + configManager.setAutoUpdate
3. If enabled, periodic check via `App_CheckForUpdate`
4. Update found → download → `App_QuitAndInstall`

### Cross-Feature Rules

**XR-005**: Settings affect AI engine behavior
- `SettingsState` contains `apiServerConfig` (port, API key) that F004 uses to start/configure API server.

**XR-006**: Proxy settings propagate to all network
- Proxy config change via `App_Proxy` affects all Electron sessions, impacting AI API calls (F004), WebDAV backup (F011), and web search (F006).

**XR-007**: Theme affects all windows
- `themeService.setTheme()` applies to main window and mini window (F001).

---

## F004-ai-engine

### Core Rules

**BR-014**: Provider model registry
- `SYSTEM_PROVIDERS` defines initial provider list. Each provider has `type`, `apiKey`, `apiHost`, `models[]`. Users add custom providers.
- Source: `src/renderer/src/store/llm.ts`, `src/renderer/src/config/providers.ts`

**BR-015**: Model deduplication
- Models added to providers are deduplicated via `uniqBy(models, 'id')`.
- Source: `llm.ts` reducers

**BR-016**: Default model assignments
- Four default model slots: `defaultModel`, `quickModel`, `translateModel`, (deprecated) `topicNamingModel`.
- Source: `LlmState` in `src/renderer/src/store/llm.ts:56-65`

**BR-017**: Memory vector similarity threshold
- Memory search uses 1536-dimensional unified vectors with 0.85 similarity threshold for deduplication.
- Source: `MemoryService` in `src/main/services/memory/MemoryService.ts:55-56`

**BR-018**: Memory singleton with reload
- `MemoryService.reload()` closes existing DB connection and creates fresh instance. Used when embedding config changes.
- Source: `src/main/services/memory/MemoryService.ts:69-75`

**BR-019**: Trace span lifecycle
- Trace spans are bound to topics. Each inference creates a span with token usage tracking. Spans can be opened in a dedicated trace viewer window.
- Source: `src/main/services/SpanCacheService.ts`

**BR-020**: API server OpenAI compatibility
- Internal API server exposes OpenAI-compatible `/v1/chat/completions` endpoint. Model ID format: `provider_id:model_id` for routing.
- Source: `src/main/apiServer/routes/chat.ts`, `src/main/apiServer/services/chat-completion.ts`

**BR-021**: Multi-provider OAuth support
- Supports OAuth flows for: Anthropic (PKCE), GitHub Copilot (device code), CherryIN, Vertex AI (service account). Each has dedicated IPC channels.
- Source: `AnthropicService.ts`, `CopilotService.ts`, `CherryINOAuthService.ts`, `VertexAIService.ts`

### Validation Logic

**VL-006**: Chat completion request validation
- `ChatCompletionValidationError` for missing fields, `ChatCompletionModelError` for invalid model/provider.
- Error mapped to appropriate HTTP status: 400 (validation), 401 (auth), 429 (rate limit), 502 (upstream).
- Source: `src/main/apiServer/routes/chat.ts:24-102`

**VL-007**: Messages API model ID validation
- Model ID parsed as `provider_id:model_id`. Provider must exist and be enabled. Falls back to provider-from-path pattern.
- Source: `src/main/apiServer/utils.ts`

**VL-008**: Sensitive field redaction
- MCP service redacts authorization, apiKey, token fields in logs. Strings >300 chars truncated.
- Source: `MCPService.ts:72-97`

**VL-009**: OVMS platform guard
- OVMS channels throw `Error('OVMS is only supported on Windows with intel CPU.')` on unsupported platforms.
- Source: `src/main/ipc.ts:1035-1045`

### Workflows

**WF-007**: Chat completion flow (REST API)
1. Request arrives at `/v1/chat/completions`
2. Validate request body and model ID
3. Parse `provider_id:model_id` format
4. Route to appropriate provider service
5. If streaming: set SSE headers, stream chunks, send `[DONE]`
6. If non-streaming: return complete JSON response
7. Error handling maps to OpenAI error format

**WF-008**: Provider configuration flow
1. User adds provider in settings
2. Provider stored in Redux `llm.providers[]`
3. API key encrypted via `Aes_Encrypt` before storage
4. Models fetched from provider API or manually added
5. Provider config synced to API server if running

**WF-009**: Memory ingestion flow
1. Chat messages passed to `Memory_Add` with embedding config
2. MemoryService generates embeddings via configured provider
3. Vectors stored in LibSQL database
4. On subsequent chats, `Memory_Search` retrieves relevant memories
5. Retrieved memories injected into system prompt context

**WF-010**: Token usage tracking
1. During inference, streaming chunks carry usage data
2. `TRACE_TOKEN_USAGE` records per-span usage
3. `Analytics_TrackTokenUsage` sends to analytics service
4. Trace viewer displays usage breakdown

### Cross-Feature Rules

**XR-008**: AI engine serves all chat providers
- F006-chat depends on F004 for all AI completions. Provider selection, model routing, streaming all managed by F004.

**XR-009**: Memory context injection
- Memory search results (F004) injected into chat system prompt (F006) based on per-assistant memory settings.

**XR-010**: Knowledge base search integration
- F009 knowledge search called by F006 chat to include RAG context before AI completion.

**XR-011**: MCP tool injection into completions
- When MCP enabled, F008 tool definitions injected into API request parameters by F004.

**XR-012**: Provider config sync to OpenClaw
- `OpenClaw_SyncConfig` pushes provider credentials to OpenClaw gateway for unified API access.

---

## F005-assistant

### Core Rules

**BR-022**: Default assistant always exists
- `getDefaultAssistant()` creates initial assistant with default settings. Cannot be deleted.
- Source: `src/renderer/src/store/assistants.ts:37-39`

**BR-023**: Assistant settings defaults
- Default: `temperature=0.7`, `contextCount=5`, `enableMaxTokens=false`, `streamOutput=true`.
- Source: `src/renderer/src/services/AssistantService.ts`

**BR-024**: Topic normalization
- Topics array is always normalized: `Array.isArray(topics) ? topics : []`. Prevents corrupt state.
- Source: `assistants.ts:46`

**BR-025**: Assistant insertion bounds check
- `insertAssistant` throws if index is out of bounds `[0, assistants.length]`.
- Source: `assistants.ts:63-68`

**BR-026**: Tags ordering and collapse
- Assistants grouped by tags with independent tag ordering (`tagsOrder`) and collapse state (`collapsedTags`).

### Validation Logic

**VL-010**: Agent API validation
- Agent creation requires: `type` (claude-code), `name` (non-empty), `model` (non-empty), `accessible_paths`.
- Source: `src/main/apiServer/routes/agents/validators/`

**VL-011**: Session validation
- Session creation requires: `model` (non-empty). Optional overrides inherit from parent agent.

**VL-012**: Pagination validation
- `limit`: 1-100 (default 20), `offset`: >= 0 (default 0), `status`: enum [idle, running, completed, failed, stopped].

### Workflows

**WF-011**: Agent CRUD lifecycle (REST)
1. POST /agents → create agent with type, model, paths, instructions
2. POST /agents/:id/sessions → create session (inherits agent config)
3. POST /agents/:id/sessions/:sid/messages → execute message
4. Session tracks agent_session_id for resumability

**WF-012**: Assistant preset management
1. Presets stored in assistants slice
2. User can create assistant from preset
3. Preset groups with translations for i18n

### Cross-Feature Rules

**XR-013**: Assistant model binding
- Each assistant references models from F004 provider registry. Model deletion cascades to "model not found" in assistants.

**XR-014**: Assistant per-session settings
- Assistant settings (temperature, context count, max tokens) override global defaults per chat session in F006.

---

## F006-chat

### Core Rules

**BR-027**: Topic queue serialization
- Messages within a topic are processed via a topic-specific queue to prevent race conditions. `waitForTopicQueue` ensures ordering.
- Source: `src/renderer/src/store/thunk/messageThunk.ts:81-85`

**BR-028**: Agent session resumability
- Agent sessions store `agentSessionId` on messages. On resume, the last `agentSessionId` is extracted from message history for continuity.
- Source: `messageThunk.ts:98-120`

**BR-029**: Message streaming with block manager
- Streaming responses managed by `BlockManager` which creates message blocks (text, code, image, file). Each block has status (pending, streaming, done, error).
- Source: `src/renderer/src/services/messageStreaming/BlockManager.ts`

**BR-030**: Assistant message lifecycle states
- States: `pending` → `sending` → `streaming` → `success` | `error`. Reset via `resetAssistantMessage`.
- Source: `MessageBlockStatus` enum, `AssistantMessageStatus` enum in `src/renderer/src/types/newMessage.ts`

**BR-031**: Context window management
- `contextCount` on assistant settings controls how many previous messages included in API request. Default 5.
- Source: `src/renderer/src/services/ApiService.ts`

**BR-032**: Topic auto-naming with LRU cache
- Topics auto-named by sending first message to summary model. LRU cache prevents duplicate naming requests.
- Source: `messageThunk.ts` (agentSessionRenameLocks + LRU)

**BR-033**: Abort controller management
- Each message send registers an AbortController. `Mcp_AbortTool` can cancel tool calls. Cleanup on completion or user cancel.
- Source: `src/renderer/src/utils/abortController.ts`

### Validation Logic

**VL-013**: Empty content guard
- Messages with empty content are not sent. Topic loading state managed via `setTopicLoading`.

**VL-014**: Agent session topic ID format
- Agent session topics use special ID format: `buildAgentSessionTopicId()`. Validated by `isAgentSessionTopicId()`.

**VL-015**: Session message validation (REST)
- `content` required, non-empty string. Validated by express-validator middleware.

### Workflows

**WF-013**: Message send flow
1. User types message, hits send
2. Create user message + placeholder assistant message
3. Save to IndexedDB via `dbFacade`
4. Queue message processing for topic
5. Build API request: system prompt + memory context + KB context + MCP tools + message history
6. Stream response via `AiSdkToChunkAdapter`
7. `BlockManager` processes chunks into message blocks
8. Update blocks in Redux store (throttled)
9. On completion: save final message, update topic timestamp, end trace span

**WF-014**: Message translation flow
1. User requests translation of existing message
2. `createTranslationBlock` creates new block on the message
3. Uses configured translate model from F004
4. Translation result stored as additional block on same message

**WF-015**: Search/web integration
1. Chat can open search window via `SearchWindow_Open`
2. Web content loaded in search window
3. Content extracted and injected into chat context

### Cross-Feature Rules

**XR-015**: Chat depends on AI engine for completions
- All message processing routes through F004 provider system for model selection, API key management, and streaming.

**XR-016**: MCP tool execution in chat
- When MCP enabled on assistant, tool definitions injected. AI can request tool calls. Results flow back as tool-result blocks.

**XR-017**: Knowledge base RAG in chat
- If assistant has knowledge bases attached, search is performed before API call. Results injected as system context.

**XR-018**: File attachments in messages
- Files uploaded via F007, stored as `FileMessageBlock` or `ImageMessageBlock`. File metadata carried through message lifecycle.

---

## F007-file-management

### Core Rules

**BR-034**: UUID-based file storage
- Uploaded files renamed with UUID prefix to prevent collisions. Original name preserved in metadata.
- Source: `src/main/services/FileStorage.ts`

**BR-035**: File type detection by extension
- Files categorized by extension: image (png, jpg, etc.), document (pdf, docx, etc.), text, binary. Uses `isbinaryfile` for ambiguous cases.
- Source: `FileStorage.ts`, `src/main/utils/file.ts`

**BR-036**: Auto-encoding detection for text files
- `readTextFileWithAutoEncoding` uses `chardet` to detect encoding before reading. Handles UTF-8, GBK, Shift-JIS, etc.
- Source: `FileStorage.ts:124`

**BR-037**: File watcher lifecycle
- Chokidar-based file watcher with start/stop/pause/resume lifecycle. Used by notes feature for live reload.
- Source: `FileStorage.ts` watcher methods

### Validation Logic

**VL-016**: File name guard
- `fileNameGuard` validates file names (no special characters, path traversal). Used before file creation/rename.

**VL-017**: Notes directory validation
- `validateNotesDirectory` checks directory structure is valid for notes feature usage.

**VL-018**: PDF page count
- `pdfPageCount` via pdf-lib validates PDF structure and returns page count. Used before knowledge base ingestion.

**VL-019**: Binary file detection
- `isbinaryfile` checks prevent binary files from being treated as text in text-oriented operations.

### Workflows

**WF-016**: File upload flow
1. User selects file via native dialog (`File_Select`)
2. File copied to managed storage with UUID name (`File_Upload`)
3. Metadata (original name, type, size, hash) stored
4. File reference returned to renderer for message attachment or KB ingestion

**WF-017**: Export to Word flow
1. User triggers export from chat message
2. `ExportService.exportToWord` converts messages to .docx format
3. Save dialog shown for output location

### Cross-Feature Rules

**XR-019**: File service for AI providers
- `FileService_Upload/List/Delete/Retrieve` abstract per-provider file APIs (OpenAI files, etc.) used by F004 for file-based completions.

**XR-020**: File upload for knowledge base
- Knowledge base ingestion (F009) uses file upload (F007) for document processing pipeline.

---

## F008-mcp

### Core Rules

**BR-038**: MCP server transport types
- Three transport types: `stdio` (local process), `sse` (Server-Sent Events), `streamableHttp`. Transport selected based on server config.
- Source: `src/main/services/MCPService.ts`

**BR-039**: MCP server lifecycle management
- Servers have active/inactive state. Active servers maintain persistent connection. Restart kills and reconnects.
- Source: `mcpSlice` reducers in `src/renderer/src/store/mcp.ts`

**BR-040**: Tool name namespacing
- MCP tool names built with `buildFunctionCallToolName` to namespace by server, preventing collisions across servers.
- Source: `@shared/mcp`

**BR-041**: DXT extension support
- DXT files are ZIP packages containing MCP server definitions. Uploaded via temp file, processed by `DxtService`.
- Source: `src/main/services/DxtService.ts`, `src/main/ipc.ts:829-844`

**BR-042**: Built-in MCP server detection
- `isBuiltinMCPServer` checks against `BuiltinMCPServerNames`. Built-in servers get special treatment (no remove, auto-restart).
- Source: `@types`

**BR-043**: OAuth for MCP servers
- MCP servers can require OAuth. `McpOAuthClientProvider` + `CallBackServer` handle the OAuth flow with local callback.
- Source: `src/main/services/mcp/oauth/`

### Validation Logic

**VL-020**: MCP connectivity check
- `Mcp_CheckConnectivity` tests server reachability before activation. Prevents enabling unreachable servers.

**VL-021**: Binary dependency checks
- `isUvInstalled` and `isBunInstalled` tracked in MCP store. Install prompts shown if missing.
- Source: `mcp.ts:24-26`

### Workflows

**WF-018**: MCP server add flow
1. User configures server (command, args, env for stdio; URL for SSE/HTTP)
2. Server added to Redux store
3. On activate: `Mcp_RestartServer` → create transport → connect client
4. Tool/prompt/resource lists fetched and cached
5. Server status reported back to renderer

**WF-019**: MCP tool call flow
1. AI response contains tool_use block
2. Renderer calls `Mcp_CallTool` with server, tool name, args
3. MCPService routes to correct server client
4. Result returned as tool-result content
5. Tool results sent back to AI for next turn

**WF-020**: Plugin installation flow
1. User uploads DXT/ZIP file or selects directory
2. `PluginService.install*` extracts and validates
3. Plugin registered in agent's plugin list
4. Plugin's MCP servers auto-configured

### Cross-Feature Rules

**XR-021**: MCP tools in AI completions
- Active MCP server tools injected into chat API requests (F004/F006) when MCP enabled on assistant.

**XR-022**: MCP tool permissions
- `toolPermissions` store tracks user-granted permissions per tool. Checked before execution.
- Source: `src/renderer/src/store/toolPermissions.ts`

**XR-023**: MCP server logs
- `ServerLogBuffer` captures MCP server stdout/stderr. Accessible via `Mcp_GetServerLogs` for debugging in settings UI (F003).

---

## F009-knowledge-base

### Core Rules

**BR-044**: RAG pipeline with embedjs
- Knowledge bases use `RAGApplicationBuilder` from `@cherrystudio/embedjs` with `LibSqlDb` for vector storage.
- Source: `src/main/services/KnowledgeService.ts`

**BR-045**: Concurrent task processing
- Knowledge ingestion uses workload-based queue with concurrent task management. `LoaderTaskItem` tracks state (PENDING/PROCESSING/DONE).
- Source: `KnowledgeService.ts:63-96`

**BR-046**: Multi-source loaders
- Supports: files (via `addFileLoader`), URLs (`WebLoader`), sitemaps (`SitemapLoader`), notes (`NoteLoader`).
- Source: `KnowledgeService.ts:26-28`

**BR-047**: Preprocessing provider
- `PreprocessProvider` transforms documents before embedding. Handles chunking, cleaning, format conversion.
- Source: `src/main/knowledge/preprocess/PreprocessProvider.ts`

### Validation Logic

**VL-022**: File size limit
- Large files checked against `MB` constant limits before ingestion.

**VL-023**: Filename sanitization
- `sanitizeFilename` applied to knowledge base names for storage path safety.

### Workflows

**WF-021**: Knowledge base ingestion flow
1. User creates knowledge base (`KnowledgeBase_Create`)
2. Adds items: files, URLs, sitemaps, or notes (`KnowledgeBase_Add`)
3. Items queued for processing with workload evaluation
4. Loader processes content → preprocessor → embeddings → vector DB
5. Progress reported to renderer via IPC events

**WF-022**: Knowledge base search flow
1. Query text embedded using same embedding model
2. Vector similarity search in LibSQL
3. Optional reranking via `Reranker`
4. Results returned with relevance scores

### Cross-Feature Rules

**XR-024**: KB search injected into chat
- F006 chat calls `KnowledgeBase_Search` when assistant has knowledge bases configured. Results become system prompt context.

**XR-025**: Obsidian vault as KB source
- F010 Obsidian vaults can be imported as knowledge base items. Files read via `Obsidian_GetFiles`, processed by KB pipeline.

---

## F010-notes

### Core Rules

**BR-048**: File-based notes storage
- Notes stored as markdown files in `notesPath` directory. Tree structure mirrors filesystem hierarchy.
- Source: `src/renderer/src/store/note.ts`, `getNotesDir()` utility

**BR-049**: Obsidian vault discovery
- Obsidian vaults auto-discovered from standard Obsidian config locations per OS. Files listed per vault.
- Source: `src/main/services/ObsidianVaultService.ts`

**BR-050**: File watcher for live updates
- Notes directory watched via `File_StartWatcher`. Changes trigger tree refresh in renderer.
- Source: FileStorage watcher methods, consumed by notes store

### Validation Logic

**VL-024**: Notes directory validation
- `File_ValidateNotesDirectory` checks: exists, is directory, writable, valid structure.

**VL-025**: Note file name validation
- Uses same `fileNameGuard` as F007 for note creation/rename.

### Workflows

**WF-023**: Notes editing flow
1. Note tree loaded from filesystem
2. User selects/creates note
3. Content edited in markdown editor
4. Save triggers `File_Write`
5. File watcher detects change, updates tree if needed

### Cross-Feature Rules

**XR-026**: Notes as knowledge base source
- Notes can be added to knowledge bases (F009) via `NoteLoader`. Enables RAG over personal notes.

---

## F011-data-sync

### Core Rules

**BR-051**: Multi-backend backup
- Three backup backends: local directory, WebDAV, S3-compatible. Each has independent sync state (lastSyncTime, syncing, lastSyncError).
- Source: `src/renderer/src/store/backup.ts`, `src/main/services/BackupManager.ts`

**BR-052**: Archive-based backup format
- Backups use archiver (zip) for creation and node-stream-zip for extraction. Entire data directory archived.
- Source: `BackupManager.ts`

**BR-053**: Connection instance caching
- WebDAV and S3 client instances cached with connection config fingerprint. Re-created only when config changes.
- Source: `BackupManager.ts:42-60`

**BR-054**: LAN peer transfer
- Local transfer uses mDNS discovery (`LocalTransfer_StartScan`) for peer finding, then direct file transfer. Supports cancel.
- Source: `src/main/services/lanTransfer/`, `src/main/services/LocalTransferService.ts`

**BR-055**: Recursive permission fix
- Before restore, `setWritableRecursive` ensures all files/dirs have write permission. Platform-specific handling (Windows vs Unix).
- Source: `BackupManager.ts:81-99`

### Validation Logic

**VL-026**: WebDAV/S3 connection check
- `Backup_CheckConnection` / `Backup_CheckS3Connection` verify connectivity before backup/restore operations.

**VL-027**: Quit prevention during sync
- Active backup/restore sets `App_SetStopQuitApp(true)` to prevent data corruption from premature exit.

**VL-028**: Data connection cleanup
- `closeAllDataConnections()` called before restore to release file handles on databases.

### Workflows

**WF-024**: WebDAV backup flow
1. User triggers backup from settings
2. Set syncing state in Redux
3. Prevent app quit via `App_SetStopQuitApp(true)`
4. Create archive of data directory
5. Upload to WebDAV server
6. Update lastSyncTime
7. Allow quit via `App_SetStopQuitApp(false)`

**WF-025**: Restore flow
1. Close all data connections
2. Download/extract backup archive
3. Fix permissions recursively
4. Replace data directory
5. Relaunch app

**WF-026**: LAN transfer flow
1. Sender creates backup archive (`Backup_CreateLanTransferBackup`)
2. Start mDNS discovery (`LocalTransfer_StartScan`)
3. Select peer and connect (`LocalTransfer_Connect`)
4. Handshake establishes transfer parameters
5. Send file (`LocalTransfer_SendFile`)
6. Receiver restores from received backup
7. Cleanup temp backup (`Backup_DeleteTempBackup`)

### Cross-Feature Rules

**XR-027**: Backup includes all feature data
- Backup archive contains entire data directory: chat history, assistants, settings, knowledge bases, notes config, MCP config.

**XR-028**: Nutstore as WebDAV provider
- Nutstore integration (`Nutstore_*` IPC) provides SSO-based WebDAV credentials for backup.

---

## F012-creative-tools

### Core Rules

**BR-056**: Python script execution
- `PythonService.executeScript` runs Python scripts with optional context injection and timeout. Sandboxed execution.
- Source: `src/main/services/PythonService.ts`

**BR-057**: Code tools with terminal selection
- Code execution supports multiple terminal emulators per platform. Custom terminal paths configurable.
- Source: `src/main/services/CodeToolsService.ts`

**BR-058**: OCR multi-provider
- OCR supports multiple providers via `OcrService`. Provider IDs listed via `OCR_ListProviders`.
- Source: `src/main/services/ocr/OcrService.ts`

### Validation Logic

**VL-029**: Script timeout
- Python execution has configurable timeout parameter to prevent runaway scripts.

### Workflows

**WF-027**: Code execution flow
1. User triggers code run from chat code block
2. `CodeTools_Run` invoked with script content
3. Terminal selected (platform default or custom)
4. Script executed, output captured
5. Results displayed in chat

**WF-028**: OCR flow
1. User provides image/PDF file
2. `OCR_ocr` called with file and provider
3. Text extracted and returned
4. Result can be used in chat or knowledge base

### Cross-Feature Rules

**XR-029**: Creative tool results feed into chat
- Code execution output and OCR text results can be inserted into chat messages (F006).

---

## Cross-Feature Interaction Rules (XIR)

**XIR-001**: Provider config is the foundation
- F004 provider configuration (API keys, endpoints, models) is consumed by: F006 (chat), F008 (MCP tool calls), F009 (embeddings), F004-memory (embeddings), F012 (AI-powered OCR).

**XIR-002**: Redux state is the single source of truth
- All features store state in Redux (persisted to IndexedDB). State synced across windows via F001 StoreSyncService. Main process has limited state (config via electron-store).

**XIR-003**: IPC is the universal bridge
- All main-process capabilities (file I/O, native APIs, network, child processes) accessed exclusively through IPC. No direct main-process calls from renderer.

**XIR-004**: File management is a utility layer
- F007 provides file I/O to: F006 (message attachments), F009 (KB document ingestion), F010 (notes storage), F011 (backup archives), F012 (script files).

**XIR-005**: Backup captures holistic state
- F011 backup archives the entire userData directory, meaning all feature data is backed up together. No per-feature selective backup.
