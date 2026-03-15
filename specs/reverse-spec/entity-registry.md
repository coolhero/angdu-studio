# Angdu Studio — Entity Registry

This document catalogs every domain entity extracted from Cherry Studio source code, with fields, relationships, validation rules, and owning Feature assignment.

---

## E001: Message

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/newMessage.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique message identifier |
| role | 'user' \| 'assistant' \| 'system' | Yes | - | Message author role |
| assistantId | string | Yes | - | Reference to owning Assistant |
| topicId | string | Yes | - | Reference to owning Topic |
| createdAt | string (ISO) | Yes | now | Creation timestamp |
| updatedAt | string (ISO) | No | - | Last update timestamp |
| status | UserMessageStatus \| AssistantMessageStatus | Yes | - | Processing state |
| modelId | string | No | - | Model ID used for generation |
| model | Model | No | - | Full model reference |
| type | 'clear' | No | - | Special message type for context clearing |
| useful | boolean | No | - | User feedback flag |
| askId | string | No | - | Links assistant reply to user question |
| mentions | Model[] | No | - | Models mentioned via @ syntax |
| enabledMCPs | MCPServer[] | No | - | (deprecated) MCP servers enabled for this message |
| usage | Usage | No | - | Token usage statistics |
| metrics | Metrics | No | - | Performance metrics (tokens, latency) |
| multiModelMessageStyle | 'horizontal' \| 'vertical' \| 'fold' \| 'grid' | No | - | Multi-model display layout |
| foldSelected | boolean | No | - | Whether selected when in fold mode |
| blocks | MessageBlock['id'][] | Yes | [] | Ordered list of block IDs |
| traceId | string | No | - | Observability trace identifier |
| agentSessionId | string | No | - | Agent session ID for Claude Code resume |
| providerMetadata | ProviderMetadata | No | - | Raw provider-specific metadata |

### Relationships

- Belongs to one **Topic** via `topicId`
- Belongs to one **Assistant** via `assistantId`
- Has many **MessageBlock** via `blocks[]` (by ID reference)
- May reference one **Model** via `model`
- May reference many **MCPServer** via `enabledMCPs` (deprecated)

### Validation Rules

- `id` must be a valid UUID
- `role` must be one of: 'user', 'assistant', 'system'
- `blocks` array must not be empty for assistant messages with status 'success'
- `askId` on assistant messages should reference an existing user message ID
- `status` for user messages: only 'success'
- `status` for assistant messages: 'processing', 'pending', 'searching', 'success', 'paused', 'error'

---

## E002: MessageBlock

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/newMessage.ts`

### Base Fields (all block types)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Block identifier |
| messageId | string | Yes | - | Parent message reference |
| type | MessageBlockType | Yes | - | Discriminator for block variant |
| createdAt | string (ISO) | Yes | now | Creation time |
| updatedAt | string (ISO) | No | - | Update time |
| status | MessageBlockStatus | Yes | - | Block processing state |
| model | Model | No | - | Model used to generate this block |
| metadata | Record<string, any> | No | - | Generic metadata |
| error | SerializedError | No | - | Error details if status is ERROR |

### Block Type Variants

| Type Enum | Interface | Key Extra Fields |
|-----------|-----------|------------------|
| UNKNOWN | PlaceholderMessageBlock | (none) |
| MAIN_TEXT | MainTextMessageBlock | content: string, knowledgeBaseIds?: string[], citationReferences?: object[] |
| THINKING | ThinkingMessageBlock | content: string, thinking_millsec: number |
| TRANSLATION | TranslationMessageBlock | content: string, sourceBlockId?: string, sourceLanguage?: string, targetLanguage: string |
| IMAGE | ImageMessageBlock | url?: string, file?: FileMetadata, metadata.prompt?, metadata.generateImageResponse? |
| CODE | CodeMessageBlock | content: string, language: string |
| TOOL | ToolMessageBlock | toolId: string, toolName?: string, arguments?: object, content?: string \| object, metadata.rawMcpToolResponse? |
| FILE | FileMessageBlock | file: FileMetadata |
| ERROR | ErrorMessageBlock | (uses base error field) |
| CITATION | CitationMessageBlock | response?: WebSearchResponse, knowledge?: KnowledgeReference[], memories?: MemoryItem[] |
| VIDEO | VideoMessageBlock | url?: string, filePath?: string |
| COMPACT | CompactMessageBlock | content: string, compactedContent: string |

### Relationships

- Belongs to one **Message** via `messageId`
- TOOL blocks reference **MCPTool** via `toolId`
- CITATION blocks reference **KnowledgeReference**, **MemoryItem**, **WebSearchResponse**
- IMAGE/FILE blocks reference **FileMetadata**

### Validation Rules

- `type` must be a valid MessageBlockType enum value
- `status` must be one of: 'pending', 'processing', 'streaming', 'success', 'error', 'paused'
- MAIN_TEXT blocks must have non-empty `content` when status is 'success'
- THINKING blocks must have `thinking_millsec >= 0`
- CODE blocks must have non-empty `language`
- TOOL blocks must have non-empty `toolId`
- TRANSLATION blocks must have non-empty `targetLanguage`

---

## E003: Assistant

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique assistant identifier |
| name | string | Yes | - | Display name |
| prompt | string | Yes | '' | System prompt |
| knowledge_bases | KnowledgeBase[] | No | - | Attached knowledge bases |
| topics | Topic[] | Yes | [] | Conversation topics |
| type | string | Yes | - | Assistant type identifier |
| emoji | string | No | - | Display emoji |
| description | string | No | - | Assistant description |
| model | Model | No | - | Currently selected model |
| defaultModel | Model | No | - | Fallback model |
| settings | Partial<AssistantSettings> | No | - | Generation parameters |
| messages | AssistantMessage[] | No | - | Preset conversation messages |
| enableWebSearch | boolean | No | false | Use model's built-in web search |
| webSearchProviderId | WebSearchProvider['id'] | No | - | External web search provider |
| enableUrlContext | boolean | No | false | Gemini/Anthropic URL context feature |
| enableGenerateImage | boolean | No | false | Enable image generation |
| mcpMode | 'disabled' \| 'auto' \| 'manual' | No | - | MCP tool usage mode |
| mcpServers | MCPServer[] | No | - | Manually selected MCP servers |
| knowledgeRecognition | 'off' \| 'on' | No | - | Knowledge base auto-recognition |
| regularPhrases | QuickPhrase[] | No | - | Quick phrases for this assistant |
| tags | string[] | No | - | Categorization tags |
| enableMemory | boolean | No | false | Enable memory service |
| content | string | No | - | For translate assistant: source content |
| targetLanguage | TranslateLanguage | No | - | For translate assistant: target language |

### AssistantSettings Sub-entity

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| maxTokens | number | No | - | Maximum output tokens |
| enableMaxTokens | boolean | No | false | Whether maxTokens is active |
| temperature | number | Yes | 0.7 | Sampling temperature |
| enableTemperature | boolean | No | true | Whether temperature is active |
| topP | number | Yes | 1.0 | Nucleus sampling parameter |
| enableTopP | boolean | No | false | Whether topP is active |
| contextCount | number | Yes | - | Number of context messages to include |
| streamOutput | boolean | Yes | true | Enable streaming |
| defaultModel | Model | No | - | Settings-level default model |
| customParameters | AssistantSettingCustomParameters[] | No | - | Provider-specific custom params |
| reasoning_effort | ReasoningEffortOption | Yes | 'default' | Reasoning effort level |
| reasoning_effort_cache | ReasoningEffortOption | No | - | Cached reasoning effort for model switching |
| toolUseMode | 'function' \| 'prompt' | Yes | 'function' | Tool invocation strategy |

### Relationships

- Has many **Topic** (embedded array)
- Has many **KnowledgeBase** (embedded references)
- May reference one **Model** via `model`
- May reference many **MCPServer** via `mcpServers`
- May reference many **QuickPhrase** via `regularPhrases`
- May reference one **WebSearchProvider** via `webSearchProviderId`

### Validation Rules

- `id` must be a valid UUID
- `name` must be non-empty
- `topics` array must exist (may be empty)
- `mcpMode` defaults to 'disabled' if undefined (via `getEffectiveMcpMode()` helper)
- `settings.temperature` should be between 0 and 2
- `settings.topP` should be between 0 and 1
- `settings.contextCount` should be >= 0

---

## E004: Topic

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique topic identifier |
| type | TopicType | No | 'chat' | Topic type: 'chat' or 'session' |
| assistantId | string | Yes | - | Owning assistant reference |
| name | string | Yes | - | Display name (may be auto-generated) |
| createdAt | string (ISO) | Yes | now | Creation timestamp |
| updatedAt | string (ISO) | Yes | now | Last update timestamp |
| messages | Message[] | Yes | [] | Messages in this topic |
| pinned | boolean | No | false | Whether pinned to top |
| prompt | string | No | - | Topic-specific system prompt override |
| isNameManuallyEdited | boolean | No | false | Whether user manually set the name |

### Relationships

- Belongs to one **Assistant** via `assistantId`
- Has many **Message** (embedded array)

### Validation Rules

- `id` must be a valid UUID
- `assistantId` must reference an existing assistant
- `type` enum: 'chat' (default), 'session'
- `name` must be non-empty

---

## E005: Model

**Owner**: F004 (model-provider)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | - | Model identifier (provider-specific) |
| provider | string | Yes | - | Provider ID this model belongs to |
| name | string | Yes | - | Display name |
| group | string | Yes | - | Model group/family |
| owned_by | string | No | - | Organization that owns the model |
| description | string | No | - | Model description |
| capabilities | ModelCapability[] | No | - | Type capabilities with user override flags |
| type | ModelType[] | No | - | (deprecated) Model types |
| pricing | ModelPricing | No | - | Cost per million tokens (input/output) |
| endpoint_type | EndpointType | No | - | Primary endpoint type |
| supported_endpoint_types | EndpointType[] | No | - | All supported endpoint types |
| supported_text_delta | boolean | No | - | Whether model supports text delta streaming |

### ModelCapability Sub-entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | ModelType | Yes | Capability type: 'text', 'vision', 'embedding', 'reasoning', 'function_calling', 'web_search', 'rerank' |
| isUserSelected | boolean | No | Whether user manually toggled this capability |

### ModelPricing Sub-entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| input_per_million_tokens | number | Yes | Input token cost |
| output_per_million_tokens | number | Yes | Output token cost |
| currencySymbol | string | No | Currency symbol (default: $) |

### Relationships

- Belongs to one **Provider** via `provider` field
- Referenced by **Assistant** (model, defaultModel)
- Referenced by **Message** (model)
- Referenced by **KnowledgeBase** (embedding model, rerank model)

### Validation Rules

- `id` must be non-empty
- `provider` must reference an existing provider ID
- `endpoint_type` must be one of: 'openai', 'openai-response', 'anthropic', 'gemini', 'image-generation', 'jina-rerank'
- ModelType enum: 'text', 'vision', 'embedding', 'reasoning', 'function_calling', 'web_search', 'rerank'

---

## E006: Provider

**Owner**: F004 (model-provider)
**Source**: `src/renderer/src/types/provider.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | - | Unique provider identifier |
| type | ProviderType | Yes | - | Provider protocol type |
| name | string | Yes | - | Display name |
| apiKey | string | Yes | '' | API authentication key |
| apiHost | string | Yes | - | Base URL for API calls |
| anthropicApiHost | string | No | - | Separate Anthropic API host |
| apiVersion | string | No | - | API version (for Azure OpenAI) |
| models | Model[] | Yes | [] | Available models |
| enabled | boolean | No | true | Whether provider is active |
| isSystem | boolean | No | false | Whether this is a built-in provider |
| isAuthed | boolean | No | false | Whether authentication is verified |
| rateLimit | number | No | - | Rate limit (requests per minute) |
| apiOptions | ProviderApiOptions | No | - | Provider-specific API behavior flags |
| serviceTier | ServiceTier | No | - | OpenAI/Groq service tier |
| verbosity | OpenAIVerbosity | No | - | OpenAI verbosity level |
| authType | 'apiKey' \| 'oauth' | No | 'apiKey' | Authentication method |
| isVertex | boolean | No | false | Whether this is a Vertex AI provider |
| notes | string | No | - | User notes about this provider |
| extra_headers | Record<string, string> | No | - | Custom HTTP headers |
| anthropicCacheControl | AnthropicCacheControlSettings | No | - | Anthropic prompt caching config |

### ProviderType Enum Values

'openai', 'openai-response', 'anthropic', 'gemini', 'azure-openai', 'vertexai', 'mistral', 'aws-bedrock', 'vertex-anthropic', 'new-api', 'gateway', 'ollama'

### ProviderApiOptions Sub-entity

| Field | Type | Description |
|-------|------|-------------|
| isNotSupportArrayContent | boolean | Array content not supported |
| isNotSupportStreamOptions | boolean | stream_options param not supported |
| isSupportDeveloperRole | boolean | 'developer' role supported |
| isSupportServiceTier | boolean | service_tier param supported |
| isNotSupportEnableThinking | boolean | enable_thinking param not supported |
| isNotSupportAPIVersion | boolean | API version param not supported |
| isNotSupportVerbosity | boolean | Verbosity param not supported |

### Relationships

- Has many **Model** (embedded array)
- Referenced by **Assistant** indirectly via Model.provider
- 50+ system provider IDs pre-defined (openai, anthropic, gemini, ollama, etc.)

### Validation Rules

- `id` must be non-empty and unique
- `type` must be a valid ProviderType enum value
- `apiKey` may be empty for local providers (ollama, lmstudio)
- `apiHost` must be a valid URL
- System providers (`isSystem: true`) must have an ID matching `SystemProviderId` enum

---

## E007: KnowledgeBase

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/types/knowledge.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique knowledge base identifier |
| name | string | Yes | - | Display name |
| model | Model | Yes | - | Embedding model |
| dimensions | number | No | - | Embedding vector dimensions |
| description | string | No | - | Knowledge base description |
| items | KnowledgeItem[] | Yes | [] | Contained items |
| created_at | number | Yes | now | Creation timestamp (epoch ms) |
| updated_at | number | Yes | now | Update timestamp (epoch ms) |
| version | number | Yes | 1 | Schema version |
| documentCount | number | No | - | Number of documents to retrieve |
| chunkSize | number | No | - | Text chunk size for splitting |
| chunkOverlap | number | No | - | Overlap between chunks |
| threshold | number | No | - | Similarity score threshold |
| rerankModel | Model | No | - | Re-ranking model |
| preprocessProvider | { type: 'preprocess', provider: PreprocessProvider } | No | - | Document preprocessing config |

### Relationships

- Has many **KnowledgeItem** (embedded array)
- References one **Model** as embedding model
- May reference one **Model** as rerank model
- Referenced by **Assistant** via `knowledge_bases`

### Validation Rules

- `id` must be a valid UUID
- `name` must be non-empty
- `model` must reference a model with embedding capability
- `dimensions` must be positive integer when specified
- `chunkSize` must be > 0 when specified
- `chunkOverlap` must be >= 0 and < chunkSize when specified
- `threshold` must be between 0 and 1 when specified

---

## E008: KnowledgeItem

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/types/knowledge.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique item identifier |
| baseId | string | No | - | Parent knowledge base ID |
| uniqueId | string | No | - | Deduplication key |
| uniqueIds | string[] | No | - | Multiple dedup keys |
| type | KnowledgeItemType | Yes | - | Item type |
| content | string \| FileMetadata \| FileMetadata[] | Yes | - | Item content (type-dependent) |
| remark | string | No | - | User note |
| created_at | number | Yes | now | Creation timestamp |
| updated_at | number | Yes | now | Update timestamp |
| processingStatus | ProcessingStatus | No | - | Ingestion status |
| processingProgress | number | No | - | Ingestion progress (0-100) |
| processingError | string | No | - | Error message if failed |
| retryCount | number | No | 0 | Number of processing retries |
| isPreprocessed | boolean | No | false | Whether item was preprocessed |

### KnowledgeItemType Enum

'file', 'url', 'note', 'sitemap', 'directory', 'memory', 'video'

### Type-Specific Content

| Type | Content Type | Extra Fields |
|------|-------------|--------------|
| file | FileMetadata | (none) |
| video | FileMetadata[] | (none) |
| url | string (URL) | (none) |
| note | string (text) | sourceUrl?: string |
| sitemap | string (URL) | (none) |
| directory | string (path) | (none) |
| memory | string | (none) |

### Relationships

- Belongs to one **KnowledgeBase** via `baseId`
- FILE type contains one **FileMetadata**
- VIDEO type contains multiple **FileMetadata**

### Validation Rules

- `type` must be a valid KnowledgeItemType
- Content type must match the item type (e.g., 'file' type requires FileMetadata content)
- `processingStatus` enum: 'pending', 'processing', 'completed', 'failed'

---

## E009: MCPServer

**Owner**: F007 (mcp-tools)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Internal server identifier |
| name | string | Yes | - | Server name (often used as unique key) |
| type | McpServerType \| 'inMemory' | No | 'stdio' | Communication protocol type |
| description | string | No | - | Server description |
| baseUrl | string | No | - | Server URL (for SSE/streamableHttp) |
| command | string | No | - | Launch command (for stdio) |
| registryUrl | string | No | - | Registry URL for the server package |
| args | string[] | No | [] | Command arguments |
| env | Record<string, string> | No | {} | Environment variables |
| headers | Record<string, string> | No | - | Custom HTTP headers |
| provider | string | No | - | Provider name (ModelScope, Higress, etc.) |
| providerUrl | string | No | - | Provider documentation URL |
| logoUrl | string | No | - | Server logo URL |
| tags | string[] | No | - | Categorization tags |
| longRunning | boolean | No | false | Whether server runs continuously |
| timeout | number | No | 60 | Request timeout in seconds |
| dxtVersion | string | No | - | DXT package version |
| dxtPath | string | No | - | DXT extraction path |
| reference | string | No | - | Documentation/homepage link |
| searchKey | string | No | - | Search keyword |
| configSample | MCPConfigSample | No | - | Example configuration |
| disabledTools | string[] | No | - | Tools disabled on this server |
| disabledAutoApproveTools | string[] | No | - | Tools requiring manual approval |
| shouldConfig | boolean | No | - | Whether builtin MCP needs configuration |
| isActive | boolean | Yes | false | Whether server is currently running |
| installSource | MCPServerInstallSource | No | 'unknown' | Installation origin |
| isTrusted | boolean | No | false | Whether user has trusted this server |
| trustedAt | number | No | - | Trust timestamp |
| installedAt | number | No | - | Installation timestamp |

### McpServerType Enum

'stdio', 'sse', 'streamableHttp', 'inMemory'

### Builtin MCP Server Names

'@cherry/mcp-auto-install', '@cherry/memory', '@cherry/sequentialthinking', '@cherry/brave-search', '@cherry/fetch', '@cherry/filesystem', '@cherry/dify-knowledge', '@cherry/python', '@cherry/didi-mcp', '@cherry/browser', '@cherry/nowledge-mem', '@cherry/hub'

### Relationships

- Has many **MCPTool** (discovered at runtime)
- Referenced by **Assistant** via `mcpServers`
- Referenced by **Message** via `enabledMCPs` (deprecated)

### Validation Rules

- `id` must be non-empty
- `name` must be non-empty
- `type` defaults to 'stdio' if not specified
- If `type` is 'inMemory', `name` must be a valid BuiltinMCPServerName
- If `baseUrl` is set and `type` is not explicitly specified, type is inferred: URL ending in '/mcp' -> 'streamableHttp', otherwise -> 'sse'
- `installSource` enum: 'builtin', 'manual', 'protocol', 'unknown'

---

## E010: MCPTool

**Owner**: F007 (mcp-tools)
**Source**: `src/renderer/src/types/tool.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | - | Tool identifier |
| serverId | string | Yes | - | Owning MCP server ID |
| serverName | string | Yes | - | Owning MCP server name |
| name | string | Yes | - | Tool name |
| description | string | No | - | Tool description |
| inputSchema | object | Yes | - | JSON Schema for tool input parameters |
| outputSchema | object | No | - | JSON Schema for tool output |
| isBuiltIn | boolean | No | false | Whether tool is built-in (not via MCP protocol) |
| type | 'mcp' | Yes | 'mcp' | Tool type discriminator |

### Relationships

- Belongs to one **MCPServer** via `serverId`
- Referenced by **ToolMessageBlock** via `toolId`
- Referenced by **MCPToolResponse** in message metadata

### Validation Rules

- `inputSchema.type` must be 'object'
- `inputSchema.properties` defaults to `{}` if not provided
- `inputSchema.required` defaults to `[]` if not provided
- `name` must be non-empty
- `serverId` must reference an existing MCPServer

---

## E011: FileMetadata

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/types/file.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique file identifier |
| name | string | Yes | - | Internal file name |
| origin_name | string | Yes | - | Original display name |
| path | string | Yes | - | File system path |
| size | number | Yes | - | File size in bytes |
| ext | string | Yes | - | File extension (with dot) |
| type | FileType | Yes | - | File category |
| created_at | string (ISO) | Yes | now | Creation timestamp |
| count | number | Yes | 0 | File reference count |
| tokens | number | No | - | Estimated token count |
| purpose | FilePurpose | No | - | File purpose (OpenAI compatible) |

### FileType Enum

'image', 'video', 'audio', 'text', 'document', 'other'

### Relationships

- Referenced by **Message** (via MessageBlock)
- Referenced by **KnowledgeItem** (file/video types)
- Referenced by **Painting** (generated images)
- Referenced by **ImageMessageBlock**, **FileMessageBlock**

### Validation Rules

- `id` must be a valid UUID
- `path` must be a valid file system path
- `size` must be >= 0
- `type` must be a valid FileType enum value
- `ext` must start with '.'

---

## E012: WebSearchProvider

**Owner**: F009 (web-search)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | WebSearchProviderId | Yes | - | Provider identifier |
| name | string | Yes | - | Display name |
| apiKey | string | No | - | API key for the search service |
| apiHost | string | No | - | Custom API host |
| engines | string[] | No | - | Search engines (for SearxNG) |
| url | string | No | - | Search URL template |
| basicAuthUsername | string | No | - | Basic auth username |
| basicAuthPassword | string | No | - | Basic auth password |
| usingBrowser | boolean | No | false | Whether to use browser for local search |
| topicId | string | No | - | Associated topic ID |
| allowedTools | string[] | No | - | Allowed MCP tools for search |
| parentSpanId | string | No | - | Observability span parent |
| modelName | string | No | - | Model name for search context |

### WebSearchProviderId Enum

'zhipu', 'tavily', 'searxng', 'exa', 'exa-mcp', 'bocha', 'local-google', 'local-bing', 'local-baidu'

### Relationships

- Referenced by **Assistant** via `webSearchProviderId`
- Results appear in **CitationMessageBlock** via `WebSearchResponse`

### Validation Rules

- `id` must be a valid WebSearchProviderId
- `name` must be non-empty
- API-based providers (tavily, exa, bocha, zhipu) require non-empty `apiKey`
- Local providers (local-google, local-bing, local-baidu) may use browser

---

## E013: MemoryItem

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Memory entry identifier |
| memory | string | Yes | - | Stored fact/memory text |
| hash | string | No | - | Content hash for deduplication |
| createdAt | string (ISO) | No | now | Creation timestamp |
| updatedAt | string (ISO) | No | now | Update timestamp |
| score | number | No | - | Relevance score from search |
| metadata | Record<string, any> | No | - | Additional metadata |

### Related Types

- **MemoryConfig**: Configuration for the memory service (embeddingDimensions, embeddingModel, llmModel, customPrompts)
- **MemoryEntity**: Identity context (userId, agentId, runId)
- **MemorySearchFilters**: Search filter criteria
- **MemoryHistoryItem**: Audit trail for memory changes (ADD, UPDATE, DELETE actions)

### Relationships

- Referenced by **CitationMessageBlock** via `memories`
- Managed by **MemoryService** and **MemoryProcessor**
- Uses **Model** for embedding and LLM extraction

### Validation Rules

- `id` must be non-empty
- `memory` must be non-empty string
- MemoryHistoryItem.action must be one of: 'ADD', 'UPDATE', 'DELETE'

---

## E014: QuickPhrase

**Owner**: F003 (settings)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique phrase identifier |
| title | string | Yes | - | Display title |
| content | string | Yes | - | Phrase content to insert |
| createdAt | number | Yes | now | Creation timestamp (epoch ms) |
| updatedAt | number | Yes | now | Update timestamp (epoch ms) |
| order | number | No | - | Sort order |

### Relationships

- Referenced by **Assistant** via `regularPhrases`
- Managed globally via settings and per-assistant

### Validation Rules

- `title` must be non-empty
- `content` must be non-empty
- `order` must be >= 0 when specified

---

## E015: NotesTreeNode

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/types/note.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Node identifier |
| name | string | Yes | - | Display name (without extension) |
| type | 'folder' \| 'file' \| 'hint' | Yes | - | Node type |
| treePath | string | Yes | - | Relative path in tree |
| externalPath | string | Yes | - | Absolute file system path |
| children | NotesTreeNode[] | No | - | Child nodes (folders only) |
| isStarred | boolean | No | false | Favorite flag |
| expanded | boolean | No | false | Whether folder is expanded in UI |
| createdAt | string (ISO) | Yes | now | Creation timestamp |
| updatedAt | string (ISO) | Yes | now | Update timestamp |

### Relationships

- Self-referential: has many **NotesTreeNode** children
- Note files are stored on disk, managed by NotesService/NotesTreeService

### Validation Rules

- `type` must be 'folder', 'file', or 'hint'
- `treePath` must be a valid relative path
- `externalPath` must be a valid absolute path
- Only 'folder' type nodes may have `children`
- `name` must be non-empty and not contain path separators

---

## E016: TranslateHistory

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | History entry identifier |
| sourceText | string | Yes | - | Original text |
| targetText | string | Yes | - | Translated text |
| sourceLanguage | TranslateLanguageCode | Yes | - | Source language code |
| targetLanguage | TranslateLanguageCode | Yes | - | Target language code |
| createdAt | string (ISO) | Yes | now | Creation timestamp |
| star | boolean | No | false | Favorite flag |

### Relationships

- Uses **TranslateLanguage** type for language references
- Managed by **TranslateService**

### Validation Rules

- `sourceText` must be non-empty
- `targetText` must be non-empty
- `sourceLanguage` and `targetLanguage` must be valid language codes

---

## E017: Painting

**Owner**: F008 (content-management)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Painting identifier |
| urls | string[] | Yes | [] | Generated image URLs |
| files | FileMetadata[] | Yes | [] | Generated image files |
| providerId | string | No | - | Provider that generated this painting |
| model | string | No | - | Model used for generation |
| prompt | string | No | - | Text prompt |
| negativePrompt | string | No | - | Negative prompt |
| imageSize | string | No | - | Image dimensions |
| numImages | number | No | 1 | Number of images to generate |
| seed | string | No | - | Random seed |
| steps | number | No | - | Inference steps |
| guidanceScale | number | No | - | Guidance scale |
| promptEnhancement | boolean | No | false | Whether prompt was enhanced |

### Painting Variants

Multiple specialized painting types exist for different providers:
- **GeneratePainting**: Standard generation with aspectRatio, styleType, quality, etc.
- **EditPainting**: Image editing with mask and input image
- **RemixPainting**: Image remixing with imageWeight
- **ScalePainting**: Image upscaling with resemblance/detail
- **DmxapiPainting**: DMXAPI-specific params
- **TokenFluxPainting**: TokenFlux-specific with status tracking
- **OvmsPainting**: OVMS-specific params
- **PpioPainting**: PPIO-specific with task tracking

### Relationships

- Contains many **FileMetadata** via `files`
- Organized by provider in **PaintingsState** store

### Validation Rules

- `id` must be a valid UUID
- `urls` and `files` must be arrays
- Provider-specific variants have their own required fields

---

## E018: AgentEntity

**Owner**: F010 (api-server)
**Source**: `src/renderer/src/types/agent.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique agent identifier |
| type | AgentType | Yes | - | Agent type (currently only 'claude-code') |
| name | string | No | - | Agent name |
| description | string | No | - | Agent description |
| accessible_paths | string[] | Yes | [] | Allowed directory paths |
| instructions | string | No | - | System prompt |
| model | string | Yes | - | Primary model ID |
| plan_model | string | No | - | Planning/thinking model ID |
| small_model | string | No | - | Fast/lightweight model ID |
| mcps | string[] | No | - | MCP server IDs |
| allowed_tools | string[] | No | - | Whitelisted tool IDs |
| slash_commands | SlashCommand[] | No | - | Available slash commands |
| configuration | AgentConfiguration | No | - | Agent settings |
| created_at | string (ISO) | Yes | now | Creation timestamp |
| updated_at | string (ISO) | Yes | now | Update timestamp |

### AgentConfiguration Sub-entity

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| avatar | string | No | - | Avatar (emoji, URL, or agent type) |
| slash_commands | string[] | No | - | Slash commands from agent init |
| permission_mode | PermissionMode | No | 'default' | Permission mode |
| max_turns | number | No | 100 | Maximum interaction turns |

### Relationships

- Has many **AgentSessionEntity**
- Stored in SQLite via Drizzle ORM

### Validation Rules

- `type` must be 'claude-code' (via Zod enum)
- `model` must be non-empty
- `accessible_paths` must be an array (may be empty)
- `permission_mode` must be one of: 'default', 'acceptEdits', 'bypassPermissions', 'plan'
- `max_turns` defaults to 100

---

## E019: AgentSessionEntity

**Owner**: F010 (api-server)
**Source**: `src/renderer/src/types/agent.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Session identifier |
| agent_id | string | Yes | - | Owning agent reference |
| agent_type | AgentType | Yes | - | Agent type |
| name | string | No | - | Session name |
| description | string | No | - | Session description |
| accessible_paths | string[] | Yes | [] | Allowed directories (may override agent) |
| instructions | string | No | - | Session-specific system prompt |
| model | string | Yes | - | Model ID |
| plan_model | string | No | - | Planning model |
| small_model | string | No | - | Fast model |
| mcps | string[] | No | - | MCP server IDs |
| allowed_tools | string[] | No | - | Tool whitelist |
| slash_commands | SlashCommand[] | No | - | Slash commands |
| configuration | AgentConfiguration | No | - | Session configuration |
| created_at | string (ISO) | Yes | now | Creation timestamp |
| updated_at | string (ISO) | Yes | now | Update timestamp |

### Relationships

- Belongs to one **AgentEntity** via `agent_id`
- Has many **AgentSessionMessageEntity**
- Referenced by **Message** via `agentSessionId` (for resume)
- Referenced by **Topic** when `type` is 'session'

### Validation Rules

- `agent_id` must reference an existing AgentEntity
- `agent_type` must be 'claude-code'
- `model` must be non-empty

---

## E020: AgentSessionMessageEntity

**Owner**: F010 (api-server)
**Source**: `src/renderer/src/types/agent.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | number | Yes | auto-increment | Primary key |
| session_id | string | Yes | - | Owning session reference |
| role | SessionMessageRole | Yes | - | Message role |
| content | unknown | Yes | - | Message content (AI SDK format) |
| agent_session_id | string | Yes | - | Agent session ID for resume |
| metadata | Record<string, any> | No | - | Additional metadata |
| created_at | string (ISO) | Yes | now | Creation timestamp |
| updated_at | string (ISO) | Yes | now | Update timestamp |

### Relationships

- Belongs to one **AgentSessionEntity** via `session_id`
- Contains **Message** and **MessageBlock** data via `AgentPersistedMessage`

### Validation Rules

- `role` must be one of: 'assistant', 'user', 'system', 'tool'
- `session_id` must reference an existing session
- `agent_session_id` must be non-empty
- `content` is opaque (AI SDK format)

---

## E021: Shortcut

**Owner**: F003 (settings)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| key | string | Yes | - | Shortcut identifier |
| shortcut | string[] | Yes | - | Key combination |
| editable | boolean | Yes | - | Whether user can change this shortcut |
| enabled | boolean | Yes | true | Whether shortcut is active |
| system | boolean | Yes | - | Whether this is a system shortcut |

### Relationships

- Managed by **ShortcutService** in main process
- Configured via F003 settings UI

### Validation Rules

- `key` must be unique across all shortcuts
- `shortcut` array must contain valid key identifiers

---

## E022: Usage

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| prompt_tokens | number | No | - | Input tokens used |
| completion_tokens | number | No | - | Output tokens generated |
| total_tokens | number | No | - | Total tokens |
| thoughts_tokens | number | No | - | Reasoning/thinking tokens |
| cost | number | No | - | Cost in USD (OpenRouter) |

### Relationships

- Embedded in **Message** via `usage` field

---

## E023: Metrics

**Owner**: F005 (chat-conversation)
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| completion_tokens | number | Yes | - | Completion token count |
| time_completion_millsec | number | Yes | - | Total completion time in ms |
| time_first_token_millsec | number | No | - | Time to first token in ms |
| time_thinking_millsec | number | No | - | Time spent thinking in ms |

### Relationships

- Embedded in **Message** via `metrics` field

---

## E024: KnowledgeReference

**Owner**: F006 (knowledge-memory)
**Source**: `src/renderer/src/types/knowledge.ts`

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | number | Yes | - | Reference identifier |
| content | string | Yes | - | Retrieved content snippet |
| sourceUrl | string | Yes | - | Source URL or identifier |
| type | KnowledgeItemType | Yes | - | Source item type |
| file | FileMetadata | No | - | Source file metadata |
| metadata | Record<string, any> | No | - | Additional metadata |

### Relationships

- Appears in **CitationMessageBlock** via `knowledge`
- References original **KnowledgeItem** content

### Validation Rules

- `content` must be non-empty
- `type` must be a valid KnowledgeItemType
