# Business Logic Map

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-02

> Used as a preliminary reference when writing acceptance criteria during spec-kit /speckit.specify.

---

## Logic Index

| Feature | Rules | Validations | Workflows | Cross-Feature Rules |
|---------|-------|-------------|-----------|-------------------|
| F001-app-core | 5 | 3 | 3 | 2 |
| F002-settings-theme | 3 | 2 | 1 | 1 |
| F003-provider-management | 6 | 4 | 4 | 3 |
| F004-chat-conversation | 8 | 5 | 5 | 4 |
| F005-ai-completion | 12 | 3 | 6 | 5 |
| F006-knowledge-base | 6 | 3 | 3 | 2 |
| F007-mcp | 7 | 4 | 4 | 3 |
| F008-memory | 4 | 2 | 2 | 2 |
| F009-backup-sync | 5 | 3 | 4 | 1 |
| F010-image-generation | 3 | 2 | 2 | 1 |
| F011-translation | 2 | 1 | 1 | 1 |
| F012-api-server-agents | 6 | 4 | 3 | 2 |
| F013-utilities | 5 | 3 | 3 | 1 |

---

## F001-app-core

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-001 | File IDs are UUID-based, generated on upload. Files stored in app data directory under `files/` | FileMetadata | `src/main/services/FileStorage.ts` |
| BR-002 | File reference counting: files track a `count` field. When count reaches 0, file can be garbage collected | FileMetadata | `src/main/services/FileStorage.ts` |
| BR-003 | IPC bridge must expose all main process services via the preload script. Renderer never accesses Node.js APIs directly | N/A | `src/preload/index.ts` |
| BR-004 | App data path can be customized. Portable builds use the executable directory as data root | N/A | `src/main/constant.ts` |
| BR-005 | Window minimum size enforced: 1000x600 for main window | N/A | `src/main/services/WindowService.ts` |

### Validation Logic

| Validation ID | Target | Condition | Original Location |
|---------------|--------|-----------|-------------------|
| VL-001 | File path | Must be a valid absolute path | `src/main/services/FileStorage.ts` |
| VL-002 | Directory path | Must exist and be writable | `src/main/ipc.ts` (hasWritePermission) |
| VL-003 | File name | No special characters that break OS file systems | `src/main/services/FileStorage.ts` |

### Workflows

#### App Initialization Flow
```
1. Parse command line args (data path, portable mode)
2. Initialize ConfigManager
3. Set up proxy from settings
4. Create main window
5. Register all IPC handlers
6. Initialize services (MCP, Knowledge, etc.)
7. Set theme based on settings
8. Check for updates if auto-update enabled
```
**Original Location**: `src/main/index.ts`

#### File Upload Flow
```
1. Show file picker dialog (or receive file from paste/drag)
2. Generate UUID file ID
3. Copy file to app data files/ directory
4. Create FileMetadata record
5. Return metadata to renderer
```
**Original Location**: `src/main/services/FileStorage.ts`

#### App Update Flow
```
1. Check for updates via electron-updater
2. If available: emit update-available event
3. Download update in background, emit download-progress
4. When downloaded: emit update-downloaded
5. User triggers quit-and-install
```
**Original Location**: `src/main/services/AppUpdater.ts`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-001 | All renderer-to-main communication must go through IPC channels defined in shared IpcChannel enum | All | `packages/shared/IpcChannel.ts` |
| XR-002 | File cleanup: when a topic/message is deleted, associated file references should be decremented | F004 | `src/main/services/FileStorage.ts` |

---

## F002-settings-theme

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-006 | Theme supports three modes: light, dark, system (follows OS). Custom accent color via colorPrimary | Settings | `src/renderer/src/store/settings.ts` |
| BR-007 | Proxy settings apply globally: system (use OS proxy), custom (user-defined URL), none | Settings | `src/main/services/ProxyManager.ts` |
| BR-008 | Settings are persisted via redux-persist to localStorage with 199 migration versions | Settings | `src/renderer/src/store/migrate.ts` |

### Workflows

#### Proxy Configuration Flow
```
1. User sets proxyMode (system/custom/none) + proxyUrl
2. ProxyManager.configureProxy() called via IPC
3. Sets session.defaultSession proxy config
4. Sets/clears HTTP_PROXY, HTTPS_PROXY env vars
5. Configures undici global dispatcher
```
**Original Location**: `src/main/services/ProxyManager.ts`

---

## F003-provider-management

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-009 | API keys can be comma-separated for rotation. getRotatedApiKey() cycles through them | Provider | `src/renderer/src/services/ApiService.ts` |
| BR-010 | Provider API hosts are normalized per type: Anthropic adds /v1, Gemini adds /v1beta, Azure formats deployment URL | Provider | `src/renderer/src/aiCore/provider/providerConfig.ts` |
| BR-011 | System providers are pre-configured and cannot be deleted, only disabled | Provider | `src/renderer/src/config/providers.ts` |
| BR-012 | OAuth providers (Copilot, CherryIN, Anthropic) store tokens securely in ConfigManager | Provider | `src/main/services/CopilotService.ts` |
| BR-013 | Provider type determines which AI SDK client is instantiated (ApiClientFactory pattern) | Provider, Model | `src/renderer/src/aiCore/legacy/clients/ApiClientFactory.ts` |
| BR-014 | NewAPI providers are resolved to their actual backend type before API calls | Provider | `src/renderer/src/aiCore/provider/providerConfig.ts` |

### Validation Logic

| Validation ID | Target | Condition | Original Location |
|---------------|--------|-----------|-------------------|
| VL-004 | apiKey | Must not be empty for non-OAuth providers | `src/renderer/src/services/ApiService.ts` |
| VL-005 | apiHost | Must be a valid URL | `src/renderer/src/aiCore/provider/providerConfig.ts` |
| VL-006 | Model ID | Must exist in provider's model list or be a valid custom ID | `src/renderer/src/services/ApiService.ts` |
| VL-007 | MCP server config | Zod strict validation: non-builtin servers cannot have type 'inMemory' | `src/renderer/src/types/index.ts` |

### Workflows

#### GitHub Copilot OAuth Flow
```
1. Request device code from GitHub API
2. Show user_code and verification_uri to user
3. Poll for token exchange with device_code
4. Store access_token via saveCopilotToken
5. Refresh token as needed via getToken
```
**Original Location**: `src/main/services/CopilotService.ts`

#### CherryIN OAuth PKCE Flow
```
1. Generate code_verifier and code_challenge
2. Open browser to oauthServer authorization URL
3. Start local callback server on random port
4. Receive authorization code via callback
5. Exchange code for access_token and refresh_token
6. Store tokens
```
**Original Location**: `src/main/services/CherryINOAuthService.ts`

#### Anthropic OAuth Flow
```
1. Start OAuth flow (generates state, PKCE verifier)
2. Open browser to Anthropic authorization URL
3. Capture authorization code via deep link callback
4. Exchange code for access token
5. Store credentials securely
```
**Original Location**: `src/main/services/AnthropicService.ts`

#### Provider Adaptation Pipeline
```
1. getActualProvider(model) resolves the real provider
2. handleSpecialProviders: NewAPI → actual backend type
3. formatProviderApiHost: normalize URL per provider type
4. providerToAiSdkConfig: map to AI SDK configuration
5. Apply provider-specific extras (Azure apiVersion, VertexAI creds, etc.)
```
**Original Location**: `src/renderer/src/aiCore/provider/providerConfig.ts`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-003 | All AI API calls must resolve provider config before execution | F005, F006, F010, F011 | `src/renderer/src/aiCore/provider/providerConfig.ts` |
| XR-004 | OAuth tokens must be refreshed before expiry; auto-refresh on 401 | F005, F012 | `src/main/services/CopilotService.ts` |
| XR-005 | Provider-specific headers (extra_headers) must be included in all API calls to that provider | F005 | `src/renderer/src/aiCore/provider/providerConfig.ts` |

---

## F004-chat-conversation

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-015 | Messages are normalized into Message + MessageBlock entities (post-v7 migration). Blocks stored separately in Dexie for efficient streaming updates | Message, MessageBlock | `src/renderer/src/databases/index.ts` |
| BR-016 | Each assistant message links to its triggering user message via askId | Message | `src/renderer/src/types/newMessage.ts` |
| BR-017 | Topics are owned by Assistants. Deleting an assistant removes all its topics | Topic, Assistant | `src/renderer/src/store/assistants.ts` |
| BR-018 | Message context is filtered through a 10-step preprocessing pipeline before sending to AI | Message | `src/renderer/src/services/ConversationService.ts` |
| BR-019 | Per-topic message queues ensure ordered processing. Only one completion can be active per topic | Topic | `src/renderer/src/store/thunk/messageThunk.ts` |
| BR-020 | Block updates during streaming are throttled (150ms) with requestAnimationFrame batching | MessageBlock | `src/renderer/src/store/thunk/messageThunk.ts` |
| BR-021 | Multi-model responses create one assistant message per mentioned model, all linked to the same askId | Message | `src/renderer/src/store/thunk/messageThunk.ts` |
| BR-022 | Topics auto-rename based on conversation summary using quickModel (configurable) | Topic | `src/renderer/src/services/ApiService.ts` |

### Validation Logic

| Validation ID | Target | Condition | Original Location |
|---------------|--------|-----------|-------------------|
| VL-008 | Message role | Must be user, assistant, or system | `src/renderer/src/types/newMessage.ts` |
| VL-009 | Topic ID | Must be unique (Dexie unique index) | `src/renderer/src/databases/index.ts` |
| VL-010 | Block type | Must be a valid MessageBlockType enum value | `src/renderer/src/types/newMessage.ts` |
| VL-011 | Context count | Must be positive integer, controls message window size | `src/renderer/src/types/index.ts` |
| VL-012 | Message blocks | blocks[] array must contain valid MessageBlock IDs | `src/renderer/src/types/newMessage.ts` |

### Workflows

#### Send Message Flow
```
1. User types message and hits send
2. Create user Message + MainTextBlock, save to Dexie
3. Dispatch addMessage to Redux store
4. Create assistant Message stub with pending status
5. Enqueue on per-topic queue
6. If multi-model: create one assistant message per mentioned model
7. Filter messages through context preprocessing pipeline
8. Call transformMessagesAndFetch (delegates to F005)
9. During streaming: update MessageBlocks via throttled dispatches
10. On complete: finalize message status, update topic timestamp
```
**Original Location**: `src/renderer/src/store/thunk/messageThunk.ts`

#### Message Context Preprocessing Pipeline
```
1. filterAfterContextClearMessages (remove messages before context clear)
2. filterUsefulMessages (remove system/utility)
3. filterErrorOnlyMessagesWithRelated (remove error pairs)
4. filterLastAssistantMessage (remove trailing incomplete)
5. filterAdjacentUserMessages (deduplicate adjacent user)
6. takeRight(contextCount + 2) (limit to context window)
7. filterAfterContextClearMessages (re-apply after trim)
8. filterEmptyMessages (remove empty)
9. filterUserRoleStartMessages (ensure starts with user)
10. convertMessagesToSdkMessages (convert to SDK format)
```
**Original Location**: `src/renderer/src/services/ConversationService.ts`

#### Topic Auto-Naming Flow
```
1. After first assistant response completes
2. Check if enableTopicNaming is true
3. Take last 5 messages, format as JSON
4. Send to quickModel with topicNamingPrompt
5. Clean result via removeSpecialCharactersForTopicName
6. Update topic name if not manually edited
```
**Original Location**: `src/renderer/src/services/ApiService.ts`

#### Redux Persist Migration
```
- 199 numbered migrations in migrate.ts (3266 lines)
- Handles schema changes across all 25 slices
- Runs on app startup when version mismatch detected
- Uses createMigrate from redux-persist
```
**Original Location**: `src/renderer/src/store/migrate.ts`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-006 | When knowledge bases are attached to an assistant, search results are injected into user messages before AI completion | F005, F006 | `src/renderer/src/services/ApiService.ts` |
| XR-007 | When MCP mode is auto, the hub server's tools are automatically included in AI completion | F005, F007 | `src/renderer/src/services/ApiService.ts` |
| XR-008 | Cross-window Redux sync: assistants/, settings/, llm/ slices are broadcast to all Electron windows | All | `src/main/services/StoreSyncService.ts` |
| XR-009 | When a message references files, FileMetadata must be resolved from Dexie files table | F001 | `src/renderer/src/store/thunk/messageThunk.ts` |

---

## F005-ai-completion

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-023 | Dual-layer architecture: Legacy AiProvider (raw SDK) and ModernAiProvider (Vercel AI SDK). Modern is preferred for new code | N/A | `src/renderer/src/aiCore/index.ts` |
| BR-024 | Streaming chunks are typed (TEXT_DELTA, THINKING_DELTA, TOOL_USE, TOOL_RESULT, WEB_SEARCH, IMAGE, etc.) | Chunk | `src/renderer/src/types/chunk.ts` |
| BR-025 | Legacy middleware chain processes right-to-left: 13 middleware layers from ErrorHandler to FinalChunkConsumer | N/A | `src/renderer/src/aiCore/legacy/middleware/register.ts` |
| BR-026 | Modern pipeline uses RuntimeExecutor with pluggable provider backends and plugin system | N/A | `packages/aiCore/src/core/runtime/` |
| BR-027 | Tool use supports two modes: function calling (native SDK) and prompt tool use (XML tags in prompt) | MCPTool | `src/renderer/src/services/ApiService.ts` |
| BR-028 | API key rotation: provider.apiKey may contain comma-separated keys. Each call cycles to next key | Provider | `src/renderer/src/services/ApiService.ts` |
| BR-029 | Special provider handling: Copilot token refresh, CherryAI signing, Anthropic OAuth applied before API call | Provider | `src/renderer/src/aiCore/index_new.ts` |
| BR-030 | Image generation endpoints route through legacy ImageGenerationMiddleware, not modern pipeline | N/A | `src/renderer/src/aiCore/index_new.ts` |
| BR-031 | AbortController created per completion. User can pause/cancel streaming at any time | N/A | `src/renderer/src/store/thunk/messageThunk.ts` |
| BR-032 | AiSdkToChunkAdapter converts Vercel AI SDK stream parts to Cherry Studio Chunk types | N/A | `src/renderer/src/aiCore/index_new.ts` |
| BR-033 | Prompt variables (%date%, %time%, etc.) are replaced before sending to AI | N/A | `src/renderer/src/services/ApiService.ts` |
| BR-034 | Middleware chain is dynamically configured based on provider type, features enabled, and call type | N/A | `src/renderer/src/aiCore/legacy/middleware/register.ts` |

### Validation Logic

| Validation ID | Target | Condition | Original Location |
|---------------|--------|-----------|-------------------|
| VL-013 | Model | Must exist and be configured in provider | `src/renderer/src/aiCore/index_new.ts` |
| VL-014 | Messages | Must have at least one user message | `src/renderer/src/services/ConversationService.ts` |
| VL-015 | Stream params | Temperature 0-2, maxTokens > 0 | `src/renderer/src/services/ApiService.ts` |

### Workflows

#### Modern Completion Flow
```
1. prepareSpecialProviderConfig (Copilot token, CherryAI signing, Anthropic OAuth)
2. createAiSdkProvider from provider config
3. Create model (language or image) from provider
4. If developer mode: wrap in trace span
5. buildPlugins(config) — web search, tool use, Google tools, logging
6. createExecutor(providerId, options, plugins)
7. executor.streamText(params)
8. AiSdkToChunkAdapter converts stream parts to Chunks
9. Chunks dispatched to BlockManager callbacks
10. Final usage/metrics collected
```
**Original Location**: `src/renderer/src/aiCore/index_new.ts`

#### Legacy Middleware Pipeline (right-to-left)
```
13. ErrorHandlerMiddleware — catch and normalize errors
12. TransformCoreToSdkParamsMiddleware — convert to SDK params
11. AbortHandlerMiddleware — manage abort signals
10. McpToolChunkMiddleware — handle MCP tool chunks
9. TextChunkMiddleware — process text deltas
8. WebSearchMiddleware — handle web search results
7. ToolUseExtractionMiddleware — extract prompt-based tool use
6. ThinkingTagExtractionMiddleware — extract <think> tags
5. ThinkChunkMiddleware — handle reasoning chunks
4. ResponseTransformMiddleware — transform to standard format
3. StreamAdapterMiddleware — adapt raw stream
2. RawStreamListenerMiddleware — listen to raw events
1. FinalChunkConsumerMiddleware — dispatch to callbacks
```
**Original Location**: `src/renderer/src/aiCore/legacy/middleware/register.ts`

#### Tool Calling Flow
```
1. Check if model supports function calling
2. If yes: pass tools as SDK parameters (function calling mode)
3. If no: inject tool descriptions into prompt (prompt tool use mode)
4. Model outputs tool call (native or XML tags)
5. Parse tool call: server + tool name + arguments
6. Check tool permissions (auto-approve or ask user)
7. Execute via IPC mcp:call-tool
8. Return result to model for next response
9. Repeat until model stops calling tools
```
**Original Location**: `src/renderer/src/services/ApiService.ts`, `src/renderer/src/aiCore/legacy/middleware/`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-010 | Knowledge search results are injected as context into user messages before completion | F006 | `src/renderer/src/services/ApiService.ts` |
| XR-011 | MCP tools are fetched and passed as function parameters to the AI model | F007 | `src/renderer/src/services/ApiService.ts` |
| XR-012 | Memory search results can be injected for personalized responses | F008 | `src/renderer/src/services/ApiService.ts` |
| XR-013 | Web search results are processed as special chunks and create citation blocks | F013 | `src/renderer/src/aiCore/legacy/middleware/` |
| XR-014 | Agent session completions route through a separate API server endpoint | F012 | `src/renderer/src/store/thunk/messageThunk.ts` |

---

## F006-knowledge-base

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-035 | Documents are split into chunks (configurable chunkSize/chunkOverlap) before embedding | KnowledgeItem | `src/main/knowledge/` |
| BR-036 | Embedding model is per-knowledge-base. Supports OpenAI-compatible, Ollama, and VoyageAI | KnowledgeBase | `src/main/knowledge/embedjs/embeddings/EmbeddingsFactory.ts` |
| BR-037 | PDF preprocessing: optional external services (Doc2X, MinerU, Mistral, PaddleOCR) with caching | KnowledgeItem | `src/main/knowledge/preprocess/PreprocessingService.ts` |
| BR-038 | Retrieval uses similarity threshold filtering. Results can be reranked with a separate model | KnowledgeBase | `src/main/services/KnowledgeService.ts` |
| BR-039 | Knowledge items support multiple types: file, URL, note, sitemap, directory, memory, video | KnowledgeItem | `src/renderer/src/types/knowledge.ts` |
| BR-040 | Processing status tracked per-item with retry support (retryCount field) | KnowledgeItem | `src/renderer/src/store/knowledge.ts` |

### Workflows

#### Document Ingestion Pipeline
```
1. User adds item (file/URL/note/sitemap) to knowledge base
2. If PDF and preprocessProvider configured: run preprocessing
3. Load document content (EPUB, OD, etc. via loaders)
4. Split into chunks (chunkSize/chunkOverlap)
5. Generate embeddings via configured model
6. Store vectors in vector database
7. Update processingStatus to completed
8. Send progress events to renderer
```
**Original Location**: `src/main/knowledge/`, `src/main/services/KnowledgeService.ts`

#### RAG Search Flow
```
1. User sends message with knowledge base attached
2. Extract search query from user message
3. Call knowledge-base:search via IPC
4. Vector similarity search against embeddings
5. Filter by similarity threshold
6. If rerankModel configured: call knowledge-base:rerank
7. Return ranked results
8. Inject results into user message as context
```
**Original Location**: `src/renderer/src/services/KnowledgeService.ts`, `src/main/services/KnowledgeService.ts`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-015 | Knowledge search results create citation MessageBlocks in the assistant response | F004, F005 | `src/renderer/src/services/KnowledgeService.ts` |
| XR-016 | Memory Feature (F008) reuses the embedding infrastructure from Knowledge Base | F008 | `src/main/services/memory/MemoryService.ts` |

---

## F007-mcp

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-041 | MCP servers connect via 4 transport types: stdio, SSE, streamableHTTP, inMemory | MCPServer | `src/main/services/MCPService.ts` |
| BR-042 | Hub server aggregates tools from all active non-hub servers. Used in auto mode | MCPServer | `src/renderer/src/store/mcp.ts` |
| BR-043 | Tool names are namespaced: mcp__serverName__toolName (max 63 chars) | MCPTool | `packages/shared/mcp.ts` |
| BR-044 | Stdio servers: npx/uvx commands resolved to system or bundled binaries | MCPServer | `src/main/services/MCPService.ts` |
| BR-045 | DXT packages support platform-specific overrides for command/args/env | MCPServer | `src/main/services/MCPService.ts` |
| BR-046 | Tool permission system: pending → submitting-allow/deny → invoking | MCPToolResponse | `src/renderer/src/store/toolPermissions.ts` |
| BR-047 | Clients are cached in Map. Concurrent init requests are deduplicated via pendingClients Map | MCPServer | `src/main/services/MCPService.ts` |

### Workflows

#### MCP Server Initialization
```
1. Check if client already cached in clients Map
2. If not, check pendingClients for in-flight init
3. Determine transport type (stdio/SSE/HTTP/inMemory)
4. For stdio: resolve command path, inject env vars, registry URLs
5. Create transport and Client instance
6. Connect and cache client
7. List tools (with caching)
```
**Original Location**: `src/main/services/MCPService.ts`

#### MCP Tool Execution
```
1. Receive tool call from AI completion pipeline
2. Resolve server from tool name namespace
3. Check tool permissions (auto-approve list vs user prompt)
4. If user approval needed: send permission request to renderer
5. Wait for user response (allow/deny/edit input)
6. Execute tool via client.callTool()
7. Return result to AI completion pipeline
8. Support abort via callId
```
**Original Location**: `src/main/services/MCPService.ts`, `src/renderer/src/store/toolPermissions.ts`

### Cross-Feature Rules

| Rule ID | Description | Related Features | Original Location |
|---------|-------------|-----------------|-------------------|
| XR-017 | MCP tools are passed as function calling parameters to AI models when enabled | F005 | `src/renderer/src/services/ApiService.ts` |
| XR-018 | API server can proxy MCP connections for external clients | F012 | `src/main/apiServer/routes/mcp.ts` |
| XR-019 | Tool results are rendered as ToolBlocks in the message UI | F004 | `src/renderer/src/types/newMessage.ts` |

---

## F008-memory

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-048 | Memories are extracted from conversations using configurable prompts for fact extraction | MemoryItem | `src/main/services/memory/MemoryService.ts` |
| BR-049 | Memory deduplication via content hash. Updates existing memory if similar content found | MemoryItem | `src/main/services/memory/MemoryService.ts` |
| BR-050 | Memory history tracks all changes (ADD/UPDATE/DELETE) with soft delete support | MemoryHistoryItem | `src/renderer/src/types/index.ts` |
| BR-051 | Memory search uses embedding-based similarity with configurable dimensions | MemoryItem | `src/main/services/memory/MemoryService.ts` |

### Workflows

#### Memory Addition Flow
```
1. After conversation, extract facts using custom prompt
2. Generate content hash for dedup check
3. If similar memory exists: update existing (create history entry)
4. If new: create MemoryItem with embeddings
5. Store in memory database
```
**Original Location**: `src/main/services/memory/MemoryService.ts`

---

## F009-backup-sync

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-052 | Backup data is serialized Redux state (compressed). Restore replaces state entirely | N/A | `src/main/services/BackupManager.ts` |
| BR-053 | Auto-sync configurable per destination with interval and max backup count | WebDavConfig, S3Config | `src/renderer/src/store/settings.ts` |
| BR-054 | WebDAV backup: creates directory if not exists, uploads compressed data | WebDavConfig | `src/main/services/BackupManager.ts` |
| BR-055 | S3 backup: uses standard S3 SDK with configurable endpoint for S3-compatible services | S3Config | `src/main/services/BackupManager.ts` |
| BR-056 | LAN transfer: uses mDNS for device discovery, direct TCP for file transfer | N/A | `src/main/services/LocalTransferService.ts` |

### Workflows

#### WebDAV Backup Flow
```
1. Serialize Redux state to JSON string
2. Compress data
3. Check WebDAV connection
4. Create directory if needed
5. Upload compressed file with timestamp name
6. Emit progress events
7. Clean up old backups if maxBackups exceeded
```
**Original Location**: `src/main/services/BackupManager.ts`

#### Auto-Sync Flow
```
1. Timer fires based on syncInterval setting
2. Check if syncing already in progress
3. Collect current state data
4. Upload to configured destination
5. Update lastSyncTime in backup store
6. Handle errors gracefully (set lastSyncError)
```
**Original Location**: `src/renderer/src/store/backup.ts`

---

## F010-image-generation

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-057 | Multiple painting providers with provider-specific parameters. Each provider has its own state slice | Painting variants | `src/renderer/src/store/paintings.ts` |
| BR-058 | Generated images stored as URLs and/or FileMetadata. Downloaded to local storage | Painting | `src/renderer/src/store/paintings.ts` |
| BR-059 | Some providers support async generation with polling (TokenFlux, PPIO) | TokenFluxPainting, PpioPainting | `src/renderer/src/types/index.ts` |

---

## F011-translation

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-060 | Translation uses the configured translateModel to translate text between languages | TranslateHistory | `src/renderer/src/store/translate.ts` |
| BR-061 | Translation history stored in Dexie with language codes (migrated from full words to locale codes in v8) | TranslateHistory | `src/renderer/src/databases/index.ts` |

---

## F012-api-server-agents

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-062 | API server provides OpenAI and Anthropic compatible endpoints. Model format: provider_id:model_id | ApiServerConfig | `src/main/apiServer/routes/chat.ts` |
| BR-063 | Authentication via Bearer token or x-api-key header with timing-safe comparison | ApiServerConfig | `src/main/apiServer/middleware/auth.ts` |
| BR-064 | Agent sessions use Drizzle ORM with SQLite. Sessions cascade-delete when agent is deleted | Agent, Session | `src/main/services/agents/database/schema/` |
| BR-065 | Agent messages persist via agentMessageRepository for session continuity | SessionMessage | `src/main/services/agents/database/` |
| BR-066 | Claude Code plugins: install, uninstall, manage via PluginService with Zod validation | PluginMetadata | `src/main/services/agents/plugins/PluginService.ts` |
| BR-067 | Code tools launch external CLI processes: Claude Code, Qwen Code, Gemini CLI, etc. | N/A | `src/main/services/CodeToolsService.ts` |

### Workflows

#### API Server Chat Completion
```
1. Receive POST /v1/chat/completions
2. Authenticate via Bearer/API Key
3. Parse model as provider_id:model_id
4. Resolve provider and model from Redux state
5. Route through AI completion pipeline (F005)
6. If stream=true: SSE response
7. If stream=false: JSON response
```
**Original Location**: `src/main/apiServer/routes/chat.ts`

---

## F013-utilities

### Core Rules

| Rule ID | Description | Related Entity | Original Location |
|---------|-------------|---------------|-------------------|
| BR-068 | Web search supports multiple providers: Tavily, SearXNG, Exa, Zhipu, local browser-based (Google/Bing/Baidu) | WebSearchProvider | `src/renderer/src/store/websearch.ts` |
| BR-069 | OCR supports Tesseract.js (local), system native, PaddleOCR, and OVMS backends | OcrProvider | `src/renderer/src/store/ocr.ts` |
| BR-070 | Selection assistant: detects text selection in any app, shows floating toolbar with configurable actions | N/A | `src/main/services/SelectionService.ts` |
| BR-071 | Notes: file-based note management with tree structure, TipTap rich text editor, Markdown support | NotesTreeNode | `src/renderer/src/store/note.ts` |
| BR-072 | Mini apps: webview-based embedded apps with configurable catalog (CN/Global region support) | MinAppType | `src/renderer/src/store/minapps.ts` |
