# Angdu Studio - Business Logic Map

> Reverse-spec Phase 4 deliverable. Key business rules and workflows extracted from Cherry Studio.

---

## BL-001: Provider API Key Management and Validation

**Feature**: F003-providers

### Flow

```
1. User adds Provider in Settings UI
   -> Selects provider type (openai, anthropic, gemini, etc.)
   -> Enters API key, API host, optional API version
   -> For OAuth providers (Copilot, Anthropic, CherryIN): starts OAuth flow via IPC

2. API Key Storage
   -> Renderer sends key via IPC `provider:add-key`
   -> Main process stores encrypted key (AES via `aes:encrypt`)
   -> Provider object persisted to Redux/Zustand store

3. Model Fetching
   -> On provider add/edit, models are fetched from provider API
   -> Each model gets capabilities auto-detected (text, vision, embedding, reasoning, etc.)
   -> Models stored in Provider.models array

4. API Key Validation (implicit)
   -> No explicit validation endpoint; validation occurs on first API call
   -> Failed calls surface as authentication errors in chat response
   -> Provider.enabled flag controls whether provider is usable
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-001-01 | System providers (50+) have predefined IDs from `SystemProviderIdSchema`; custom providers use user-defined IDs |
| BR-001-02 | API keys are encrypted via AES before persistence; decrypted only in main process for API calls |
| BR-001-03 | Each provider type maps to a specific SDK adapter (`ProviderType` enum determines which AI SDK provider to instantiate) |
| BR-001-04 | Provider `apiOptions` flags control feature negotiation (array content support, stream options, developer role, etc.) |
| BR-001-05 | `serviceTier` is provider-specific: OpenAI supports `auto/default/flex/priority`, Groq supports `auto/on_demand/flex` |
| BR-001-06 | VertexAI providers require Google credentials (`privateKey`, `clientEmail`, `project`, `location`) |
| BR-001-07 | Azure OpenAI providers require `apiVersion` field |
| BR-001-08 | Rate limiting is per-provider via `rateLimit` field |
| BR-001-09 | OAuth providers (Copilot, Anthropic) use separate IPC flows for token exchange; tokens cached in main process |

---

## BL-002: Message Streaming and Chunk Processing

**Feature**: F005-chat

### Flow

```
1. User Input
   -> User types message in chat input
   -> Attaches optional files, knowledge bases, MCP servers
   -> Selects model (from assistant default or explicit selection)

2. Pre-processing (External Tools)
   -> If webSearch enabled: execute web search provider -> WebSearchCompleteChunk
   -> If knowledge bases attached: search knowledge base -> KnowledgeSearchCompleteChunk
   -> If MCP mode != 'disabled': prepare MCP tools
   -> If memories enabled: search relevant memories
   -> All external results bundled into ExternalToolResult

3. LLM Request
   -> Build messages array with context (contextCount from AssistantSettings)
   -> Include system prompt from Assistant.prompt
   -> Apply model parameters: temperature, topP, maxTokens, reasoning_effort
   -> Call provider API via Vercel AI SDK streamText()

4. Chunk Pipeline (streaming)
   -> LLM_RESPONSE_CREATED -> create Message with status 'processing'
   -> TEXT_START -> create MainTextMessageBlock
   -> TEXT_DELTA -> append text to block.content
   -> THINKING_START -> create ThinkingMessageBlock
   -> THINKING_DELTA -> append reasoning text
   -> MCP_TOOL_CREATED -> LLM requests tool call
   -> MCP_TOOL_PENDING -> await user approval (if not auto-approved)
   -> MCP_TOOL_IN_PROGRESS -> tool executing
   -> MCP_TOOL_COMPLETE -> tool result returned, fed back to LLM
   -> LLM_WEB_SEARCH_IN_PROGRESS -> model-native web search
   -> LLM_WEB_SEARCH_COMPLETE -> search results attached
   -> IMAGE_COMPLETE -> image generation result
   -> LLM_RESPONSE_COMPLETE -> finalize response
   -> BLOCK_COMPLETE -> set block status to 'success'
   -> ERROR -> set message status to 'error'

5. Post-processing
   -> Calculate Usage (prompt_tokens, completion_tokens, thoughts_tokens)
   -> Calculate Metrics (time_first_token, time_completion, time_thinking)
   -> If enableTopicNaming: auto-name topic using LLM
   -> If enableMemory: extract and store memory from conversation
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-002-01 | Message status lifecycle: `pending -> processing -> searching -> streaming -> success/error/paused` |
| BR-002-02 | MessageBlocks are stored separately and referenced by Message.blocks ID array (normalized design) |
| BR-002-03 | Multi-model messages (`@mentions`) generate parallel completions; display style configured by `multiModelMessageStyle` |
| BR-002-04 | Context window is controlled by `AssistantSettings.contextCount` -- only last N messages sent to LLM |
| BR-002-05 | Stream output can be disabled per-assistant via `AssistantSettings.streamOutput` |
| BR-002-06 | MCP tools can be auto-approved or require manual approval per-server (`disabledAutoApproveTools`) |
| BR-002-07 | Tool invocation mode is `'function'` (native function calling) or `'prompt'` (inject tool descriptions into prompt) |
| BR-002-08 | Reasoning effort maps to provider-specific parameters via `ThinkingModelType` dispatch |
| BR-002-09 | Custom parameters (`AssistantSettingCustomParameters`) are passed directly to provider API |
| BR-002-10 | `clear` type messages act as context window separators |
| BR-002-11 | Messages can be paused during streaming and resumed |

---

## BL-003: Knowledge Base Document Preprocessing and Embedding Pipeline

**Feature**: F007-knowledge

### Flow

```
1. Create Knowledge Base
   -> User selects embedding model (from configured providers)
   -> Sets chunkSize (default varies), chunkOverlap, threshold
   -> Optionally selects rerank model
   -> Optionally configures preprocessProvider (doc2x, mistral, mineru, paddleocr)
   -> IPC `knowledge-base:create` -> main process creates vector store

2. Add Documents
   -> User adds items: file, URL, note, sitemap, directory, video
   -> Each item gets processingStatus: 'pending'
   -> IPC `knowledge-base:add`

3. Document Preprocessing (optional)
   -> If preprocessProvider configured:
     - doc2x: sends document to Doc2X API for OCR/parsing
     - mistral: uses Mistral's document processing
     - mineru/open-mineru: MinerU document extraction
     - paddleocr: PaddleOCR for image-based documents
   -> Result: cleaned text content

4. Chunking
   -> Text split into chunks of chunkSize with chunkOverlap
   -> Each chunk gets unique ID

5. Embedding
   -> Chunks sent to embedding model (from Provider)
   -> Vectors stored in local vector DB (EmbedJS)
   -> dimensions field tracks vector size

6. Search (at query time)
   -> IPC `knowledge-base:search`
   -> Query text embedded using same model
   -> Vector similarity search with threshold filter
   -> Returns top documentCount results

7. Reranking (optional)
   -> If rerankModel configured:
   -> IPC `knowledge-base:rerank`
   -> Results reranked using rerank model (Jina, etc.)
   -> Final results returned as KnowledgeReference[]
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-003-01 | Knowledge base version field enables schema migrations |
| BR-003-02 | Processing is asynchronous with progress tracking (`processingProgress: 0-100`) |
| BR-003-03 | Failed processing can be retried (`retryCount` tracked per item) |
| BR-003-04 | Multiple item types supported: `file`, `url`, `note`, `sitemap`, `directory`, `memory`, `video` |
| BR-003-05 | File items use FileMetadata reference; URL/note items store content as string |
| BR-003-06 | Video items support multiple FileMetadata (frames/segments) |
| BR-003-07 | `uniqueId`/`uniqueIds` prevent duplicate ingestion |
| BR-003-08 | Embedding dimensions can be auto-detected from the model or explicitly set |
| BR-003-09 | Reset clears all vectors but preserves knowledge base metadata |

---

## BL-004: MCP Server Lifecycle Management

**Feature**: F008-mcp

### Flow

```
1. Server Registration
   -> User adds MCP server via Settings UI
   -> Configures: type (stdio/sse/streamableHttp), command, args, env, headers
   -> Or installs from registry/DXT package
   -> Or uses built-in inMemory server
   -> Server saved to store with isActive: false

2. Server Startup
   -> IPC `mcp:add-server`
   -> For stdio: spawns child process with command + args + env
   -> For SSE: establishes SSE connection to baseUrl
   -> For streamableHttp: connects via HTTP to baseUrl
   -> For inMemory: activates built-in implementation
   -> Sets isActive: true on success
   -> Fires `mcp:servers-changed` event

3. Tool Discovery
   -> IPC `mcp:list-tools` -> returns MCPTool[] for server
   -> Tools can be disabled per-server via disabledTools
   -> Auto-approval controlled via disabledAutoApproveTools

4. Tool Invocation
   -> IPC `mcp:call-tool` with serverId, toolName, arguments
   -> Main process routes to correct server transport
   -> Supports streaming arguments (MCPToolStreamingChunk)
   -> Returns MCPCallToolResponse with content array
   -> Content types: text, image, audio, resource

5. Prompt/Resource Access
   -> IPC `mcp:list-prompts` / `mcp:get-prompt`
   -> IPC `mcp:list-resources` / `mcp:get-resource`

6. Server Shutdown
   -> IPC `mcp:stop-server` -> gracefully terminates
   -> Sets isActive: false
   -> For stdio: kills child process
   -> For SSE/HTTP: closes connection

7. Trust & Security
   -> First-time servers require trust confirmation (isTrusted)
   -> Trust timestamp recorded (trustedAt)
   -> Tool calls can require per-call approval
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-004-01 | Built-in MCP servers (12) use `type: 'inMemory'` and have reserved `@cherry/*` names |
| BR-004-02 | Hub server (`@cherry/hub`) aggregates tools from multiple servers in `auto` mcpMode |
| BR-004-03 | Server connectivity checked via `mcp:check-connectivity` before tool calls |
| BR-004-04 | DXT packages are extracted to `dxtPath` with version tracking |
| BR-004-05 | Install source tracked: `builtin`, `manual`, `protocol`, `unknown` |
| BR-004-06 | Server logs accessible via `mcp:get-server-logs` for debugging |
| BR-004-07 | Tool abort supported via `mcp:abort-tool` for long-running operations |
| BR-004-08 | Server type auto-detected from URL: URLs ending with `/mcp` -> `streamableHttp`, else `sse` |
| BR-004-09 | `longRunning` flag indicates server should not be auto-terminated |
| BR-004-10 | Timeout defaults to 60 seconds, configurable per-server |
| BR-004-11 | Assistant's MCP mode: `disabled` (no MCP), `auto` (hub only), `manual` (user selects servers) |
| BR-004-12 | Backward compatibility: legacy assistants without `mcpMode` default based on `mcpServers` presence |

---

## BL-005: Backup and Restore Workflows

**Feature**: F012-infra

### WebDAV Flow

```
1. Configuration
   -> User sets webdavHost, webdavUser, webdavPass, webdavPath
   -> Test connection via `backup:checkConnection`
   -> Ensure remote directory exists via `backup:createDirectory`

2. Backup
   -> IPC `backup:backupToWebdav`
   -> Serialize app state (assistants, topics, messages, settings, providers)
   -> Optionally skip backup file (skipBackupFile)
   -> Optionally disable streaming upload (disableStream)
   -> Compress data -> upload to WebDAV path
   -> Progress reported via `backup-progress` event

3. Restore
   -> IPC `backup:listWebdavFiles` -> list available backups
   -> User selects backup
   -> IPC `backup:restoreFromWebdav` -> download + decompress
   -> Merge/replace app state
   -> Progress reported via `restore-progress` event
   -> App reloads after restore

4. Auto-sync
   -> If webdavAutoSync enabled:
   -> Timer runs at webdavSyncInterval
   -> Max webdavMaxBackups maintained (old ones auto-deleted)
```

### S3 Flow

```
1. Configuration
   -> User sets endpoint, region, bucket, accessKeyId, secretAccessKey
   -> Optional root path prefix
   -> Test connection via `backup:checkS3Connection`

2. Backup/Restore
   -> Same pattern as WebDAV but using S3 APIs
   -> IPC: backupToS3, restoreFromS3, listS3Files, deleteS3File

3. Auto-sync
   -> Controlled by s3.autoSync, s3.syncInterval, s3.maxBackups
```

### LAN Transfer Flow

```
1. Discovery
   -> IPC `local-transfer:start-scan` -> mDNS/bonjour scan
   -> `local-transfer:services-updated` event fires with discovered peers

2. Transfer
   -> Create temp backup via `backup:createLanTransferBackup`
   -> Connect to peer via `local-transfer:connect`
   -> Send file via `local-transfer:send-file`
   -> Receiver restores from received backup
   -> Clean up via `backup:deleteTempBackup`
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-005-01 | Backup includes: assistants, topics, messages, message blocks, providers, settings, knowledge base metadata |
| BR-005-02 | Backup does NOT include: knowledge base vectors (too large), cached data |
| BR-005-03 | Restore requires app reload (`app:reload`) |
| BR-005-04 | Auto-sync respects maxBackups limit; excess backups are auto-deleted (oldest first) |
| BR-005-05 | Backup files are compressed (zip) before upload |
| BR-005-06 | WebDAV streaming can be disabled for compatibility with some servers |
| BR-005-07 | LAN transfer uses temp backup that is cleaned up after transfer |
| BR-005-08 | Progress events fire for both backup and restore operations |
| BR-005-09 | Local backup supports a separate directory path and settings from WebDAV/S3 |

---

## BL-006: Auto-Update Flow

**Feature**: F012-infra (managed via F006-settings)

### Flow

```
1. Check for Updates
   -> On app start (if autoCheckUpdate enabled) or manual check
   -> IPC `app:check-for-update`
   -> electron-updater checks update server

2. Update Available
   -> `update-available` event -> show notification to user
   -> User can choose to download or skip

3. Download
   -> IPC `download-update` or auto-download
   -> `download-progress` events report percentage
   -> `update-downloaded` event when complete

4. Install
   -> IPC `app:quit-and-install`
   -> App quits and installer runs

5. Channels
   -> testPlan flag enables test channel
   -> testChannel selects upgrade channel (latest, beta, etc.)
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-006-01 | Auto-update is opt-in via `autoCheckUpdate` setting |
| BR-006-02 | Test plan users can select upgrade channel |
| BR-006-03 | Update errors are reported via `update-error` event |
| BR-006-04 | `update-not-available` fires when already on latest version |

---

## BL-007: Selection Toolbar Behavior

**Feature**: F012-infra

### Flow

```
1. Text Selection Detection
   -> User selects text in any application (system-wide on macOS with accessibility)
   -> Main process detects selection
   -> Fires `selection:text-selected` event to renderer

2. Toolbar Display
   -> Toolbar window appears near selection
   -> Position follows selection (if setFollowToolbar enabled)
   -> Window size remembered (if setRemeberWinSize enabled)

3. Action Processing
   -> User clicks action button (e.g., translate, explain, summarize)
   -> `selection:process-action` sends action + selected text
   -> Action window opens with result
   -> Result can be copied to clipboard via `selection:write-to-clipboard`

4. Configuration
   -> Enabled/disabled via `selection:set-enabled`
   -> Trigger mode: how selection triggers toolbar
   -> Filter mode: whitelist/blacklist applications
   -> Filter list: specific app identifiers
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-007-01 | macOS requires accessibility permission (`app:mac-is-process-trusted`) |
| BR-007-02 | Toolbar visibility changes fire `selection:toolbar-visibility-change` |
| BR-007-03 | Action window can be pinned, minimized, resized independently |
| BR-007-04 | Windows has a resize workaround due to Electron bug (electron/electron#48554) |

---

## BL-008: Assistant Template System

**Feature**: F004-assistants

### Flow

```
1. Default Assistants
   -> App ships with built-in assistant presets
   -> Each has: name, prompt, type, emoji, default settings

2. User Customization
   -> User creates new assistant or clones existing
   -> Sets: name, emoji, prompt (system message)
   -> Configures model selection
   -> Configures settings: temperature, topP, contextCount, maxTokens
   -> Optionally attaches: knowledge bases, MCP servers, quick phrases
   -> Tags for organization

3. Assistant Store/Library
   -> Subscribe to external assistant URLs (agentssubscribeUrl)
   -> Download community assistants
   -> AssistantPreset type: Omit<Assistant, 'model'> + group[]

4. Sort & Display
   -> Assistants can be sorted by tags or list order (AssistantsSortType)
   -> Icon display type: 'model' | 'emoji' | 'none'
   -> Click behavior: show topics or show assistant details

5. Default Agent
   -> Settings.defaultAgent stores default assistant preset ID
   -> New conversations start with this assistant

6. MCP Integration per Assistant
   -> mcpMode: 'disabled' (no MCP), 'auto' (hub aggregates), 'manual' (specific servers)
   -> Each assistant can have its own MCP server selection

7. Translate Assistant
   -> Special subtype with required: model, content, targetLanguage
   -> Used by translate feature (F011-tools)
```

### Business Rules

| Rule | Description |
|------|-------------|
| BR-008-01 | AssistantPreset omits model field -- model is selected at runtime |
| BR-008-02 | Assistant.messages provides few-shot examples (alternating user/assistant roles) |
| BR-008-03 | Settings are Partial -- unset fields inherit from defaults |
| BR-008-04 | reasoning_effort_cache preserves last effective reasoning effort across model switches |
| BR-008-05 | Custom parameters bypass SDK and pass directly to provider API |
| BR-008-06 | Knowledge recognition can be toggled per-assistant (`'off' \| 'on'`) |
| BR-008-07 | Regular phrases are quick-insert text snippets bound to an assistant |
| BR-008-08 | Tags support multi-dimensional organization; sort type switches between tag-grouped and flat list views |
| BR-008-09 | Memory feature is per-assistant opt-in via `enableMemory` |
| BR-008-10 | Web search is per-assistant: `enableWebSearch` + `webSearchProviderId` |
