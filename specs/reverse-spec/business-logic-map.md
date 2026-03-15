# Angdu Studio — Business Logic Map

This document catalogs the key business logic rules, workflows, and decision trees extracted from Cherry Studio's source code. Each rule is attributed to its owning Feature and source location.

---

## BL-001: API Server Authentication Flow

**Owner**: F010 (api-server)
**Source**: `src/main/apiServer/middleware/auth.ts`

### Rule Description

All API requests to /v1/* routes must be authenticated via either X-API-Key header or Authorization Bearer token. Public routes (/health, /, /api-docs) are exempt.

### Conditions and Logic

1. Check if either `Authorization` or `X-API-Key` header is present
2. If neither is present: reject with 401 "missing credentials"
3. Load the configured API key from app settings
4. If no API key is configured server-side: reject with 403 "Forbidden"
5. **X-API-Key takes priority**: if present, trim and compare using timing-safe equality
6. **Bearer token fallback**: if Authorization header present, extract token after "Bearer " prefix
7. Comparison uses `crypto.timingSafeEqual` with pre-check on buffer length equality

### Decision Tree

```
Request arrives
  |
  +-- No auth headers? --> 401 "missing credentials"
  |
  +-- No server-side API key configured? --> 403 "Forbidden"
  |
  +-- X-API-Key header present?
  |     +-- Empty? --> 401 "empty x-api-key"
  |     +-- Valid? --> PASS
  |     +-- Invalid? --> 403 "Forbidden"
  |
  +-- Authorization header present?
        +-- Not "Bearer " prefix? --> 401 "invalid authorization format"
        +-- Empty token? --> 401 "empty bearer token"
        +-- Valid? --> PASS
        +-- Invalid? --> 403 "Forbidden"
```

### Security Properties

- Timing-safe comparison prevents timing attacks
- Length pre-check before `timingSafeEqual` (required by Node.js API)
- X-API-Key has priority over Bearer token
- No rate limiting at auth middleware level (handled per-provider)

---

## BL-002: Model Routing and Provider Resolution

**Owner**: F004 (model-provider)
**Source**: `src/renderer/src/services/ProviderService.ts`, `src/main/apiServer/utils/`, `src/renderer/src/types/provider.ts`

### Rule Description

When a model is selected for any operation, the system must resolve the correct provider and determine the appropriate endpoint type for API communication.

### Conditions and Logic

1. **Model ID format in API**: `"provider_id:model_id"` — colon-separated provider and model
2. **Provider lookup**: Find provider in store by `provider` field on Model entity
3. **Provider type determines SDK**: ProviderType maps to specific AI SDK adapter
4. **Endpoint type routing**: Model's `endpoint_type` determines request format
   - `openai`: OpenAI chat completions format
   - `openai-response`: OpenAI responses format
   - `anthropic`: Anthropic messages format
   - `gemini`: Google Gemini format
   - `image-generation`: Image generation endpoint
   - `jina-rerank`: Jina rerank format
5. **Special provider handling**:
   - CherryAI provider remaps certain models (Qwen3-8B, Qwen3-Next) to CherryIN provider
   - Azure OpenAI appends `/v1` to base URL
   - Gemini appends `/openai` to base URL
   - Ollama strips `/api` suffix from base URL (for LangChain compatibility)

### Provider Type to SDK Mapping

| ProviderType | SDK / Client |
|-------------|-------------|
| openai | @ai-sdk/openai |
| openai-response | @ai-sdk/openai (responses API) |
| anthropic | @ai-sdk/anthropic |
| gemini | @ai-sdk/google |
| azure-openai | @ai-sdk/azure |
| vertexai | @ai-sdk/google-vertex |
| mistral | @ai-sdk/mistral |
| aws-bedrock | @ai-sdk/amazon-bedrock |
| vertex-anthropic | @anthropic-ai/vertex-sdk |
| new-api | @ai-sdk/openai (OpenAI-compatible) |
| gateway | @ai-sdk/gateway |
| ollama | @ai-sdk/openai (OpenAI-compatible) |

### API Key Validation

- Some providers do not require API keys: ollama, lmstudio, ovms, gpustack
- Some provider types skip API key validation: new-api (when using specific hosts)
- `NOT_SUPPORT_API_KEY_PROVIDERS` and `NOT_SUPPORT_API_KEY_PROVIDER_TYPES` constants control this

---

## BL-003: Chat Streaming Pipeline

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/services/ApiService.ts`, `src/renderer/src/services/ConversationService.ts`, `src/renderer/src/services/StreamProcessingService.ts`

### Rule Description

The chat streaming pipeline handles the full lifecycle of a user message: from input through model invocation to rendering streamed output as message blocks.

### Pipeline Stages

```
1. User Input
   |
2. Context Assembly
   |-- Select assistant and model
   |-- Load topic messages
   |-- Apply context window (settings.contextCount)
   |-- Inject system prompt (with variable replacement)
   |-- Inject knowledge base search results (if enabled)
   |-- Inject web search results (if enabled)
   |-- Inject memory recall (if enabled)
   |
3. Tool Discovery
   |-- Determine MCP mode (disabled/auto/manual)
   |-- Fetch available MCP tools from active servers
   |-- Filter out disabled tools per server
   |-- Include hub server tools if mode is 'auto'
   |
4. Request Building
   |-- Build StreamTextParams via AI SDK
   |-- Apply model-specific parameters (temperature, topP, maxTokens)
   |-- Apply reasoning effort settings
   |-- Apply provider-specific options (service tier, cache control, etc.)
   |-- Set tool use mode (function calling vs prompt-based)
   |
5. Streaming Execution
   |-- Create abort controller for cancellation
   |-- Stream text via Vercel AI SDK streamText()
   |-- Process chunks as they arrive
   |
6. Chunk Processing → Message Blocks
   |-- TEXT chunks → MainTextMessageBlock
   |-- THINKING chunks → ThinkingMessageBlock
   |-- TOOL_USE chunks → ToolMessageBlock
   |-- Error events → ErrorMessageBlock
   |-- Web search results → CitationMessageBlock
   |-- Knowledge refs → CitationMessageBlock
   |-- Memory items → CitationMessageBlock
   |
7. Finalization
   |-- Record usage metrics (tokens, timing)
   |-- Update message status to 'success' or 'error'
   |-- Auto-generate topic name (if first message)
   |-- Persist to database
```

### MCP Mode Resolution

```typescript
function getMcpServersForAssistant(assistant):
  mode = getEffectiveMcpMode(assistant)
  switch mode:
    'disabled' → return []
    'auto'    → return [hubMCPServer]  // single hub server
    'manual'  → return activeMCPs filtered by assistant.mcpServers
```

### Abort and Pause

- Each message gets an AbortController registered by message ID
- User can pause/abort streaming at any time
- Paused messages retain status 'paused' and blocks received so far
- Aborted messages clean up the controller and mark as error

---

## BL-004: Knowledge Base RAG Pipeline

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/services/KnowledgeService.ts`, `src/main/knowledge/`

### Rule Description

When a chat message references knowledge bases, the system performs retrieval-augmented generation (RAG) by searching the knowledge base and injecting relevant context into the prompt.

### Pipeline Stages

```
1. Knowledge Base Configuration
   |-- User creates KnowledgeBase with embedding model
   |-- User adds KnowledgeItems (files, URLs, notes, directories, sitemaps, videos)
   |-- Items are processed: chunked, embedded, stored in vector DB
   |
2. Item Processing
   |-- Determine chunk size (respect embedding model's max context)
   |-- Apply chunk overlap
   |-- Optional preprocessing (doc2x, mistral, mineru, paddleocr)
   |-- Generate embeddings using configured model
   |-- Store vectors in LibSQL-based vector storage
   |-- Track processing status: pending → processing → completed/failed
   |-- Retry on failure (with retryCount tracking)
   |
3. Search (at chat time)
   |-- User message triggers search across attached knowledge bases
   |-- Embed the query using same embedding model
   |-- Perform vector similarity search
   |-- Apply similarity threshold filter (default from config)
   |-- Limit results to documentCount (default from config)
   |-- Optional: re-rank results using rerank model
   |
4. Context Injection
   |-- Format search results as KnowledgeReference[]
   |-- Inject into user message using REFERENCE_PROMPT template
   |-- Create CitationMessageBlock with knowledge references
   |
5. Provider-Specific URL Handling
   |-- Azure OpenAI: append /v1 to base URL
   |-- Gemini: append /openai to base URL
   |-- Ollama: strip /api suffix from base URL
```

### Configuration Defaults

| Parameter | Default Source |
|-----------|--------------|
| documentCount | DEFAULT_KNOWLEDGE_DOCUMENT_COUNT constant |
| threshold | DEFAULT_KNOWLEDGE_THRESHOLD constant |
| chunkSize | Capped by embedding model's max context |
| chunkOverlap | User-configured per knowledge base |

### Processing Status State Machine

```
pending → processing → completed
                    ↘ failed (retryCount incremented, may return to pending)
```

---

## BL-005: Memory Service

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/services/MemoryService.ts`, `src/renderer/src/services/MemoryProcessor.ts`, `src/main/services/memory/`

### Rule Description

The memory service extracts and stores persistent facts from conversations, enabling the assistant to recall user preferences and context across sessions.

### Workflow

1. **Fact Extraction**: After each conversation turn, an LLM extracts facts from the conversation
   - Uses configurable `customFactExtractionPrompt`
   - Processes conversation content to identify persistent facts

2. **Memory Storage**: Extracted facts are stored with embeddings
   - Each memory item gets a content hash for deduplication
   - Embeddings generated using configured `embeddingModel`
   - Stored in vector database with metadata

3. **Memory Recall**: At chat time, relevant memories are retrieved
   - Query embedding generated from user message
   - Vector similarity search against stored memories
   - Results injected as MemoryItem[] into CitationMessageBlock

4. **Memory Updates**: Memories can be added, updated, or deleted
   - History tracking via MemoryHistoryItem (ADD, UPDATE, DELETE)
   - Each change creates an audit trail entry

### Entity Relationships

- **MemoryConfig**: Links embedding model, LLM model, and custom prompts
- **MemoryEntity**: Identity context (userId, agentId, runId) for scoping memories
- **MemorySearchFilters**: Scoping criteria for search queries

---

## BL-006: Backup and Restore

**Owner**: F003 (settings)
**Source**: `src/renderer/src/services/BackupService.ts`, `src/main/services/BackupManager.ts`

### Rule Description

The application supports full state backup and restore with multiple storage backends.

### Backup Flow

1. **Data Collection**: Serialize full application state to JSON
   - All Redux store data
   - Database contents
   - Optionally: user files (can be skipped via `skipBackupFile`)

2. **Packaging**: Create ZIP archive
   - Include serialized JSON data
   - Include Data directory (unless skipped)
   - Filename format: `cherry-studio.YYYYMMDDHHmm.zip`

3. **Storage Backends**:
   - **Local**: Save to user-selected folder
   - **WebDAV**: Upload via WebDAV protocol (PUT with content length)
   - **S3**: Upload to S3-compatible storage
   - **Local Auto-Sync**: Automated periodic backup to configured directory

4. **Retention**: Old backups managed with configurable `maxBackups`
   - S3 and WebDAV: delete old files with retry logic (3 attempts, random delay)

### Restore Flow

1. **File Selection**: User selects .zip or .bak backup file
2. **Extraction**: Unzip to temp directory
3. **Data Parsing**: Parse JSON data, run database upgrades if needed (upgradeToV7, upgradeToV8)
4. **State Restoration**: Load data into Redux store and database
5. **Notification**: Show success/failure notification

### Error Handling

- S3 and WebDAV delete operations retry up to 3 times with exponential backoff
- Random delay (1-2s per attempt) to avoid thundering herd
- Failures are logged but do not block the backup process

---

## BL-007: MCP Tool Execution Pipeline

**Owner**: F007 (mcp-tools)
**Source**: `src/main/services/MCPService.ts`, `src/main/mcpServers/`, `src/renderer/src/services/ApiService.ts`

### Rule Description

MCP (Model Context Protocol) enables models to use external tools. The system manages MCP server lifecycle, tool discovery, and execution with user approval.

### Server Lifecycle

```
1. Server Registration
   |-- User adds server (stdio, SSE, streamableHttp, or inMemory)
   |-- Configuration validated via McpServerConfigSchema (Zod)
   |-- Type inference: URL ending in /mcp → streamableHttp, other URL → SSE
   |
2. Server Activation
   |-- Start server process (stdio: spawn, SSE/streamableHttp: connect)
   |-- Discover available tools via MCP protocol
   |-- Mark server as isActive: true
   |
3. Tool Discovery
   |-- List tools from server
   |-- Filter out disabled tools (server.disabledTools)
   |-- Return MCPTool[] with inputSchema/outputSchema
```

### Tool Execution Flow

```
1. Model requests tool use (via function calling or prompt-based)
   |
2. Tool approval check
   |-- Is tool in server.disabledAutoApproveTools? → Require user approval
   |-- Is server trusted (isTrusted)? → May auto-approve
   |-- Otherwise → Require user approval
   |
3. Execute tool via MCP protocol
   |-- Send JSON-RPC call to MCP server
   |-- Receive MCPCallToolResponse (content: text/image/audio/resource)
   |-- Track status: pending → invoking → done/error
   |
4. Result processing
   |-- Create ToolMessageBlock with arguments and response
   |-- Feed result back to model for next turn
   |-- Multi-turn: model may call multiple tools in sequence
```

### Tool Use Mode

Two modes for passing tools to models:
- **function**: Native function calling (model supports tool_use)
- **prompt**: Tools described in system prompt text (fallback for models without function calling)

Determined by `assistant.settings.toolUseMode` (default: 'function').

### Builtin MCP Servers

12 built-in servers with type 'inMemory':
- memory, sequentialthinking, brave-search, fetch, filesystem, dify-knowledge, python, browser, hub, etc.
- These run in-process without spawning external processes
- Hub server (`@cherry/hub`) is used in 'auto' MCP mode

---

## BL-008: Web Search Integration

**Owner**: F009 (web-search)
**Source**: `src/renderer/src/services/WebSearchService.ts`

### Rule Description

Web search augments chat responses with real-time information from the internet. Multiple search providers are supported, and results are either injected into the prompt or processed via RAG.

### Search Flow

```
1. Trigger
   |-- Assistant has enableWebSearch: true (model built-in search)
   |-- OR assistant has webSearchProviderId set (external provider)
   |
2. Provider Selection
   |-- API-based: tavily, exa, exa-mcp, bocha, zhipu
   |-- Self-hosted: searxng
   |-- Local browser: local-google, local-bing, local-baidu
   |
3. Search Execution
   |-- Query the search provider API
   |-- Receive WebSearchProviderResponse (title, content, url per result)
   |-- Track status phases: default → fetch_complete → rag → rag_complete
   |
4. Result Processing
   |-- Fetch full web content from URLs (fetchWebContents)
   |-- Apply compression/summarization if configured
   |-- Consolidate references by URL (dedup)
   |-- Select top references
   |-- Slice by token limit (tokenx)
   |
5. Injection
   |-- Create CitationMessageBlock with WebSearchResponse
   |-- Inject search results into user message context
   |-- Model generates response informed by search results
```

### Search Status Phases

| Phase | Description |
|-------|-------------|
| default | Search initiated |
| fetch_complete | Web content fetched |
| rag | RAG processing started |
| rag_complete | RAG processing done |
| rag_failed | RAG processing failed |
| cutoff | Results truncated |

### Web Search Sources

Results can come from multiple source types:
- `websearch`: External search provider
- `openai`, `openai-response`: OpenAI native search
- `anthropic`: Anthropic native search
- `gemini`: Google grounding
- `perplexity`: Perplexity native search
- `ai-sdk`: AI SDK integrated search

### Abort Support

Each search request gets its own AbortController, keyed by request/message ID. Supports per-request cancellation without affecting other ongoing searches.

---

## BL-009: Multi-Model Message Handling

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`, `src/renderer/src/types/newMessage.ts`

### Rule Description

Users can mention multiple models in a single message using @ syntax. Each mentioned model generates its own response, displayed side-by-side.

### Logic

1. User types `@model-name` in message input
2. System resolves mentioned models from `mentions` field
3. Message is sent to each mentioned model independently
4. Responses are collected as separate assistant messages
5. Display mode controlled by `multiModelMessageStyle`:
   - `horizontal`: Side-by-side columns
   - `vertical`: Stacked vertically
   - `fold`: Collapsed accordion (only selected visible)
   - `grid`: Grid layout

### Message Linking

- User message has `mentions: Model[]`
- Each assistant response links back via `askId` to the user message
- `foldSelected` marks which response is shown in fold mode

---

## BL-010: Topic Auto-Naming

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/services/ApiService.ts`

### Rule Description

When a new topic receives its first message exchange, the system automatically generates a descriptive topic name.

### Logic

1. After first assistant response completes successfully
2. Check `topic.isNameManuallyEdited` — skip if user set the name
3. Extract main text content from assistant response
4. Use a quick/small model to generate a short title
5. Clean the title: `removeSpecialCharactersForTopicName()`
6. Update topic name in store

---

## BL-011: Assistant MCP Mode Resolution

**Owner**: F005 (chat-conversation), F007 (mcp-tools)
**Source**: `src/renderer/src/types/index.ts`

### Rule Description

Each assistant has an MCP mode that determines which MCP servers are available during chat.

### Logic (getEffectiveMcpMode)

```
if assistant.mcpMode is set:
  return assistant.mcpMode  // explicit setting wins
else:
  // Legacy compatibility
  if assistant.mcpServers has items:
    return 'manual'
  else:
    return 'disabled'
```

### Server Selection by Mode

| Mode | Servers Used |
|------|-------------|
| disabled | None |
| auto | Hub server only (@cherry/hub) |
| manual | Active servers matching assistant.mcpServers list |

---

## BL-012: Reasoning Effort Control

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`

### Rule Description

Models that support thinking/reasoning can have their effort level controlled. The system maps a unified reasoning effort setting across different model types.

### Effort Levels

| Level | Ratio | Meaning |
|-------|-------|---------|
| default | 0 | Use model defaults, don't set any reasoning params |
| none | 0.01 | Disable reasoning (also "off" for on/off models) |
| minimal | 0.05 | Minimal reasoning (GPT-5 specific) |
| low | 0.05 | Low reasoning effort |
| medium | 0.5 | Medium reasoning effort |
| high | 0.8 | High reasoning effort |
| xhigh | 0.9 | Extra high reasoning effort |
| auto | 2 | Automatic / "on" for on/off models |

### Effort Caching

When user switches between thinking and non-thinking models:
- `reasoning_effort_cache` stores the last effective effort level
- When switching back to a thinking model, cached effort is restored
- Prevents loss of user preference during model switching

### Model-Specific Mappings

30+ thinking model types are supported, each with its own set of valid effort options (ThinkingOptionConfig). The model type determines which effort levels are available.

---

## BL-013: Provider API Options

**Owner**: F004 (model-provider)
**Source**: `src/renderer/src/types/provider.ts`

### Rule Description

Different providers have different API capabilities. The system uses feature flags to control which parameters are sent in API requests.

### Option Flags

| Flag | Effect When Set |
|------|----------------|
| isNotSupportArrayContent | Don't send array-type message content |
| isNotSupportStreamOptions | Don't send stream_options parameter |
| isSupportDeveloperRole | Include 'developer' role messages |
| isSupportServiceTier | Include service_tier parameter |
| isNotSupportEnableThinking | Don't send enable_thinking parameter |
| isNotSupportAPIVersion | Don't send API version parameter |
| isNotSupportVerbosity | Don't send verbosity parameter |

### Service Tier Control

- **OpenAI**: auto, default, flex, priority
- **Groq**: auto, on_demand, flex
- Applied only when provider `isSupportServiceTier` is true
- `null` explicitly disables the field; `undefined` uses defaults

---

## BL-014: Message Block Architecture

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/newMessage.ts`

### Rule Description

Messages use a block-based architecture where each message contains an ordered list of typed content blocks. This enables rich, structured message rendering.

### Block Lifecycle

```
Message created (blocks: [])
  |
  +-- Streaming starts
  |     |-- PlaceholderBlock (UNKNOWN) created
  |     |-- Replaced with typed block as content type is identified
  |     |-- Status: pending → processing → streaming → success
  |
  +-- Multiple blocks may exist simultaneously
  |     |-- One ThinkingBlock (reasoning)
  |     |-- One or more MainTextBlocks
  |     |-- Tool blocks (one per tool call)
  |     |-- Citation blocks (web search, knowledge, memory)
  |
  +-- Finalization
        |-- All blocks → status: success or error
        |-- Translation blocks may be added post-hoc
```

### Block Storage

- Blocks are stored by ID reference in Message.blocks[]
- Actual block data is stored separately (BlockManager)
- Order in the array determines rendering order

---

## BL-015: API Server Chat Completion Processing

**Owner**: F010 (api-server)
**Source**: `src/main/apiServer/services/chat-completion.ts`, `src/main/apiServer/routes/chat.ts`

### Rule Description

The API server processes OpenAI-compatible chat completion requests by routing to the appropriate provider.

### Processing Flow

1. **Validate request**: Check required fields (model, messages)
2. **Resolve model**: Parse "provider:model_id" format, find provider
3. **Build provider client**: Instantiate appropriate SDK client
4. **Execute**:
   - Non-streaming: Call provider API, return full response
   - Streaming: Set SSE headers, iterate async stream, write chunks
5. **Error mapping**: Map errors to OpenAI-compatible error format

### Error Classification

| Error Pattern | Status | Type | Code |
|--------------|--------|------|------|
| API key / authentication | 401 | authentication_error | invalid_api_key |
| Rate limit / quota | 429 | rate_limit_error | rate_limit_exceeded |
| Timeout / connection | 502 | server_error | upstream_error |
| Validation failure | 400 | invalid_request_error | validation_failed |
| Other | 500 | server_error | internal_error |

---

## BL-016: Anthropic Messages Processing

**Owner**: F010 (api-server)
**Source**: `src/main/apiServer/services/messages.ts`, `src/main/apiServer/routes/messages.ts`

### Rule Description

The API server supports Anthropic-compatible /v1/messages endpoint, allowing external tools to use the Anthropic API format through Cherry Studio.

### Processing Flow

1. **Validate request**: Check body, validate model ID
2. **Model resolution**:
   - Direct format: `"provider:model_id"` in model field
   - Provider path format: provider ID from URL, model name from body
3. **Provider lookup**: Find provider by ID, verify it's enabled
4. **Header preparation**: Extract and forward relevant headers
5. **Client creation**: Instantiate Anthropic SDK client with provider config
6. **Execute**: Stream or non-stream based on request.stream flag
7. **Error transformation**: Map to Anthropic error format

### Two Route Variants

- `POST /v1/messages`: Model ID includes provider prefix
- `POST /:provider_id/v1/messages`: Provider from URL path, model name only in body

---

## BL-017: MCP Server Type Inference

**Owner**: F007 (mcp-tools)
**Source**: `src/renderer/src/types/mcp.ts`

### Rule Description

When an MCP server configuration does not explicitly specify a type, the system infers the type from the configuration.

### Inference Logic

```
if type is explicitly set:
  if type contains 'http': normalize to 'streamableHttp'
  else: use as-is

if type is not set:
  if baseUrl or url is present:
    if URL ends with '/mcp': type = 'streamableHttp'
    else: type = 'sse'
  else:
    type = 'stdio' (default)
```

### Validation Rules

- inMemory type is only valid for builtin MCP servers
- Zod schema enforces: `type inMemory + name not builtin = error`
- Non-builtin servers with URL get sse or streamableHttp
- Non-builtin servers without URL get stdio

---

## BL-018: Context Window Management

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/services/ApiService.ts`, `src/renderer/src/services/MessagesService.ts`

### Rule Description

The system manages the context window by selecting which messages to include in API calls.

### Logic

1. **Context count**: `assistant.settings.contextCount` determines how many recent messages to include
2. **Message filtering**:
   - Filter empty messages
   - Filter by useful flag if applicable
   - Ensure user role starts the conversation
   - Apply `takeRight(contextCount)` to get recent messages
3. **System prompt**: Always included, with variable replacement
4. **Knowledge injection**: Prepended to context if knowledge bases are attached
5. **Memory injection**: Relevant memories added to context

### Variable Replacement in Prompts

System prompts support variables like `{{date}}`, `{{time}}`, `{{model}}` etc., replaced at runtime via `replacePromptVariables()`.

---

## BL-019: File Type Detection and Handling

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/types/file.ts`, `src/renderer/src/services/FileManager.ts`

### Rule Description

Files attached to messages or knowledge bases are classified by type and handled accordingly.

### Classification

| FileType | Extensions / Detection |
|----------|----------------------|
| image | .png, .jpg, .jpeg, .gif, .webp, .svg, .bmp, .ico |
| video | .mp4, .avi, .mov, .mkv, .webm |
| audio | .mp3, .wav, .ogg, .flac, .m4a |
| text | .txt, .md, .csv, .json, .xml, .yaml, .yml |
| document | .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx |
| other | Everything else |

### File Metadata Lifecycle

1. User attaches file
2. File is copied to app's files directory
3. FileMetadata created with unique ID, original name, path, size, type, token estimate
4. File referenced by ID in messages and knowledge items
5. Files persist until explicitly deleted

---

## BL-020: Translate Service

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/services/TranslateService.ts`

### Rule Description

Translation uses the configured model to translate text between languages, with history tracking.

### Flow

1. User selects source language (or auto-detect) and target language
2. Source text sent to model with translation prompt
3. Response streamed back and displayed
4. Result saved to TranslateHistory with star/favorite support

### Language Auto-Detection

Three methods available:
- `franc`: Local detection using franc library
- `llm`: Use LLM to detect language
- `auto`: Try franc first, fall back to LLM

### Custom Languages

Users can define custom languages with:
- `id`: Unique identifier
- `langCode`: Language code
- `value`: Display value
- `emoji`: Flag emoji

---

## BL-021: Notes Tree Management

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/services/NotesService.ts`, `src/renderer/src/services/NotesTreeService.ts`

### Rule Description

Notes are organized as a file-system-backed tree structure with folders and markdown files.

### Operations

- **Create**: Create folder or file node, write to disk
- **Rename**: Update node name, rename file on disk
- **Move**: Change parent folder, move file on disk
- **Delete**: Remove node and delete file from disk
- **Star**: Toggle isStarred flag
- **Sort**: Multiple sort modes (A-Z, Z-A, updated desc/asc, created desc/asc)
- **Search**: Full-text search via NotesSearchService

### Tree Synchronization

The in-memory tree (NotesTreeNode[]) is kept in sync with the file system. External changes are detected and the tree is refreshed.

---

## BL-022: Quick Phrase Management

**Owner**: F003 (settings)
**Source**: `src/renderer/src/services/QuickPhraseService.ts`

### Rule Description

Quick phrases are predefined text snippets that users can quickly insert into chat input.

### Scope

- **Global phrases**: Available in all assistants, managed in settings
- **Per-assistant phrases**: Specific to an assistant via `regularPhrases` field

### Operations

- CRUD on phrases (create, read, update, delete)
- Ordering via `order` field
- Insert into chat input on selection
