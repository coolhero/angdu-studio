# Angdu Studio - Entity Registry

> Reverse-spec Phase 4 deliverable. Extracted from Cherry Studio type definitions.

---

## E001: Provider

**Owner**: F003-providers
**Source**: `src/renderer/src/types/provider.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique provider ID (system providers use predefined IDs like `'openai'`, `'anthropic'`) |
| type | `ProviderType` | Yes | Provider protocol: `'openai' \| 'openai-response' \| 'anthropic' \| 'gemini' \| 'azure-openai' \| 'vertexai' \| 'mistral' \| 'aws-bedrock' \| 'vertex-anthropic' \| 'new-api' \| 'gateway' \| 'ollama'` |
| name | `string` | Yes | Display name |
| apiKey | `string` | Yes | API key (encrypted at rest) |
| apiHost | `string` | Yes | API endpoint URL |
| apiVersion | `string` | No | API version (Azure, etc.) |
| models | `Model[]` | Yes | Array of available models |
| enabled | `boolean` | No | Whether provider is active |
| isSystem | `boolean` | No | System-defined provider flag |
| isAuthed | `boolean` | No | OAuth authentication status |
| rateLimit | `number` | No | Rate limit setting |
| apiOptions | `ProviderApiOptions` | No | API capability flags (array content support, stream options, etc.) |
| serviceTier | `ServiceTier` | No | OpenAI/Groq service tier |
| verbosity | `OpenAIVerbosity` | No | OpenAI verbosity setting |
| authType | `'apiKey' \| 'oauth'` | No | Authentication method |
| isVertex | `boolean` | No | VertexAI flag |
| notes | `string` | No | User notes |
| extra_headers | `Record<string, string>` | No | Custom HTTP headers |
| anthropicCacheControl | `AnthropicCacheControlSettings` | No | Anthropic prompt caching config |

### Relationships

- **Has many** `Model` (via `models` array)
- **Referenced by** `Assistant.model.provider`, `Message.model.provider`

### Subtypes

- `SystemProvider`: `isSystem: true`, fixed `id` from `SystemProviderIdSchema` enum (50+ predefined IDs)
- `VertexProvider`: adds `googleCredentials`, `project`, `location`
- `AzureOpenAIProvider`: adds required `apiVersion`

---

## E002: Model

**Owner**: F003-providers
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Model identifier (e.g., `'gpt-4o'`, `'claude-3-5-sonnet'`) |
| provider | `string` | Yes | Provider ID this model belongs to |
| name | `string` | Yes | Display name |
| group | `string` | Yes | Model group/family |
| owned_by | `string` | No | Owner organization |
| description | `string` | No | Model description |
| capabilities | `ModelCapability[]` | No | Array of `{ type: ModelType, isUserSelected?: boolean }` |
| type | `ModelType[]` | No | **Deprecated**. Use `capabilities` |
| pricing | `ModelPricing` | No | `{ input_per_million_tokens, output_per_million_tokens, currencySymbol? }` |
| endpoint_type | `EndpointType` | No | `'openai' \| 'openai-response' \| 'anthropic' \| 'gemini' \| 'image-generation' \| 'jina-rerank'` |
| supported_endpoint_types | `EndpointType[]` | No | Multiple supported endpoint types |
| supported_text_delta | `boolean` | No | Whether text delta streaming is supported |

### Enums

- `ModelType`: `'text' \| 'vision' \| 'embedding' \| 'reasoning' \| 'function_calling' \| 'web_search' \| 'rerank'`
- `ModelTag`: `ModelType` excluding `'text'`, plus `'free'`

### Relationships

- **Belongs to** `Provider` (via `provider` field)
- **Referenced by** `Assistant.model`, `Assistant.defaultModel`, `Message.model`, `KnowledgeBase.model`

---

## E003: Assistant

**Owner**: F004-assistants
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| name | `string` | Yes | Display name |
| prompt | `string` | Yes | System prompt |
| type | `string` | Yes | Assistant type identifier |
| topics | `Topic[]` | Yes | Conversation topics |
| emoji | `string` | No | Emoji icon |
| description | `string` | No | Description |
| model | `Model` | No | Selected model |
| defaultModel | `Model` | No | Default fallback model |
| settings | `Partial<AssistantSettings>` | No | Model parameters |
| messages | `AssistantMessage[]` | No | Preset conversation messages (few-shot examples) |
| enableWebSearch | `boolean` | No | Built-in web search toggle |
| webSearchProviderId | `string` | No | Web search provider ID |
| enableUrlContext | `boolean` | No | Gemini/Anthropic URL context |
| enableGenerateImage | `boolean` | No | Image generation toggle |
| mcpMode | `McpMode` | No | `'disabled' \| 'auto' \| 'manual'` |
| mcpServers | `MCPServer[]` | No | Selected MCP servers (manual mode) |
| knowledgeRecognition | `'off' \| 'on'` | No | Knowledge base integration |
| knowledge_bases | `KnowledgeBase[]` | No | Attached knowledge bases |
| regularPhrases | `QuickPhrase[]` | No | Quick phrases for this assistant |
| tags | `string[]` | No | Classification tags |
| enableMemory | `boolean` | No | Memory feature toggle |
| content | `string` | No | For translate assistant: source content |
| targetLanguage | `TranslateLanguage` | No | For translate assistant: target language |

### AssistantSettings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| temperature | `number` | Yes | Sampling temperature |
| topP | `number` | Yes | Nucleus sampling |
| contextCount | `number` | Yes | Context window message count |
| streamOutput | `boolean` | Yes | Enable streaming |
| reasoning_effort | `ReasoningEffortOption` | Yes | `'none' \| 'minimal' \| 'low' \| 'medium' \| 'high' \| 'xhigh' \| 'auto' \| 'default'` |
| maxTokens | `number` | No | Max output tokens |
| enableMaxTokens | `boolean` | No | Max tokens toggle |
| enableTemperature | `boolean` | No | Temperature toggle |
| enableTopP | `boolean` | No | TopP toggle |
| defaultModel | `Model` | No | Default model override |
| customParameters | `AssistantSettingCustomParameters[]` | No | Custom API parameters |
| toolUseMode | `'function' \| 'prompt'` | Yes | MCP tool invocation mode |

### Relationships

- **Has many** `Topic` (via `topics` array)
- **Has one** `Model` (optional, via `model`)
- **Has many** `MCPServer` (optional, via `mcpServers`)
- **Has many** `KnowledgeBase` (optional, via `knowledge_bases`)

### Subtypes

- `TranslateAssistant`: requires `model`, `content`, `targetLanguage`
- `AssistantPreset`: `Omit<Assistant, 'model'>` + `group?: string[]`

---

## E004: Topic

**Owner**: F005-chat
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| assistantId | `string` | Yes | Owning assistant ID |
| name | `string` | Yes | Topic title |
| createdAt | `string` | Yes | ISO timestamp |
| updatedAt | `string` | Yes | ISO timestamp |
| messages | `Message[]` | Yes | Array of message references |
| type | `TopicType` | No | `'chat' \| 'session'` |
| pinned | `boolean` | No | Pinned to top |
| prompt | `string` | No | Topic-specific system prompt override |
| isNameManuallyEdited | `boolean` | No | Prevents auto-rename |

### Relationships

- **Belongs to** `Assistant` (via `assistantId`)
- **Has many** `Message` (via `messages` array)

---

## E005: Message

**Owner**: F005-chat
**Source**: `src/renderer/src/types/newMessage.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| role | `'user' \| 'assistant' \| 'system'` | Yes | Message role |
| assistantId | `string` | Yes | Owning assistant ID |
| topicId | `string` | Yes | Owning topic ID |
| createdAt | `string` | Yes | ISO timestamp |
| status | `UserMessageStatus \| AssistantMessageStatus` | Yes | `'success' \| 'processing' \| 'pending' \| 'searching' \| 'paused' \| 'error'` |
| blocks | `MessageBlock['id'][]` | Yes | Array of block IDs |
| updatedAt | `string` | No | ISO timestamp |
| modelId | `string` | No | Model ID used |
| model | `Model` | No | Full model object |
| type | `'clear'` | No | Special message type |
| useful | `boolean` | No | User feedback |
| askId | `string` | No | Linked question message ID |
| mentions | `Model[]` | No | Multi-model mentions |
| enabledMCPs | `MCPServer[]` | No | **Deprecated**. MCP servers used |
| usage | `Usage` | No | Token usage stats |
| metrics | `Metrics` | No | Performance metrics |
| multiModelMessageStyle | `string` | No | `'horizontal' \| 'vertical' \| 'fold' \| 'grid'` |
| foldSelected | `boolean` | No | Fold view selection state |
| traceId | `string` | No | Trace/debugging ID |
| agentSessionId | `string` | No | Agent session resume ID |
| providerMetadata | `ProviderMetadata` | No | Raw provider data |

### Enums

- `UserMessageStatus`: `'success'`
- `AssistantMessageStatus`: `'processing' \| 'pending' \| 'searching' \| 'success' \| 'paused' \| 'error'`

### Relationships

- **Belongs to** `Topic` (via `topicId`)
- **Belongs to** `Assistant` (via `assistantId`)
- **Has many** `MessageBlock` (via `blocks` ID array)
- **Has one** `Model` (optional)

---

## E006: MessageBlock

**Owner**: F005-chat
**Source**: `src/renderer/src/types/newMessage.ts`

### Base Fields (all block types)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Block ID |
| messageId | `string` | Yes | Parent message ID |
| type | `MessageBlockType` | Yes | Block discriminator |
| createdAt | `string` | Yes | ISO timestamp |
| status | `MessageBlockStatus` | Yes | `'pending' \| 'processing' \| 'streaming' \| 'success' \| 'error' \| 'paused'` |
| updatedAt | `string` | No | ISO timestamp |
| model | `Model` | No | Model used for this block |
| metadata | `Record<string, any>` | No | Generic metadata |
| error | `SerializedError` | No | Serializable error |

### Block Variants

| Type | Key Fields | Description |
|------|-----------|-------------|
| `MAIN_TEXT` | `content: string`, `knowledgeBaseIds?`, `citationReferences?` | Primary text response |
| `THINKING` | `content: string`, `thinking_millsec: number` | Reasoning/CoT block |
| `TRANSLATION` | `content: string`, `targetLanguage: string`, `sourceBlockId?` | Translated content |
| `CODE` | `content: string`, `language: string` | Code snippet |
| `IMAGE` | `url?: string`, `file?: FileMetadata` | Generated or uploaded image |
| `TOOL` | `toolId: string`, `toolName?`, `arguments?`, `content?` | MCP/function tool result |
| `FILE` | `file: FileMetadata` | Attached file |
| `VIDEO` | `url?: string`, `filePath?: string` | Video content |
| `CITATION` | `response?: WebSearchResponse`, `knowledge?`, `memories?` | Web search/RAG citations |
| `ERROR` | (inherits base `error` field) | Error block |
| `COMPACT` | `content: string`, `compactedContent: string` | Compact command response |

### Relationships

- **Belongs to** `Message` (via `messageId`)

---

## E007: KnowledgeBase

**Owner**: F007-knowledge
**Source**: `src/renderer/src/types/knowledge.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| name | `string` | Yes | Display name |
| model | `Model` | Yes | Embedding model |
| items | `KnowledgeItem[]` | Yes | Content items |
| created_at | `number` | Yes | Unix timestamp |
| updated_at | `number` | Yes | Unix timestamp |
| version | `number` | Yes | Schema version |
| dimensions | `number` | No | Embedding vector dimensions |
| description | `string` | No | Description |
| documentCount | `number` | No | Search result count limit |
| chunkSize | `number` | No | Text chunk size |
| chunkOverlap | `number` | No | Chunk overlap size |
| threshold | `number` | No | Similarity threshold |
| rerankModel | `Model` | No | Reranking model |
| preprocessProvider | `object` | No | `{ type: 'preprocess', provider: PreprocessProvider }` |

### KnowledgeItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Item identifier |
| type | `KnowledgeItemType` | Yes | `'file' \| 'url' \| 'note' \| 'sitemap' \| 'directory' \| 'memory' \| 'video'` |
| content | `string \| FileMetadata \| FileMetadata[]` | Yes | Item content (polymorphic) |
| created_at | `number` | Yes | Unix timestamp |
| updated_at | `number` | Yes | Unix timestamp |
| baseId | `string` | No | Knowledge base ID |
| uniqueId | `string` | No | Dedup key |
| remark | `string` | No | User note |
| processingStatus | `ProcessingStatus` | No | `'pending' \| 'processing' \| 'completed' \| 'failed'` |
| processingProgress | `number` | No | 0-100 progress |
| processingError | `string` | No | Error message |
| retryCount | `number` | No | Processing retry count |
| isPreprocessed | `boolean` | No | Whether preprocessing was applied |

### PreprocessProvider

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `PreprocessProviderId` | Yes | `'doc2x' \| 'mistral' \| 'mineru' \| 'open-mineru' \| 'paddleocr'` |
| name | `string` | Yes | Display name |
| apiKey | `string` | No | API key |
| apiHost | `string` | No | API host |
| model | `string` | No | Model identifier |
| options | `any` | No | Provider-specific options |

### Relationships

- **Has many** `KnowledgeItem`
- **Has one** `Model` (embedding model)
- **Referenced by** `Assistant.knowledge_bases`

---

## E008: MCPServer

**Owner**: F008-mcp
**Source**: `src/renderer/src/types/index.ts`, `src/renderer/src/types/mcp.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Internal unique ID |
| name | `string` | Yes | MCP server name (generally unique key) |
| isActive | `boolean` | Yes | Whether server is running |
| type | `McpServerType \| 'inMemory'` | No | `'stdio' \| 'sse' \| 'streamableHttp' \| 'inMemory'` |
| description | `string` | No | Server description |
| baseUrl | `string` | No | Server URL (for SSE/HTTP) |
| command | `string` | No | Launch command (for stdio) |
| args | `string[]` | No | Command arguments |
| env | `Record<string, string>` | No | Environment variables |
| headers | `Record<string, string>` | No | Custom request headers |
| registryUrl | `string` | No | Registry URL |
| provider | `string` | No | Provider name (e.g., ModelScope) |
| providerUrl | `string` | No | Provider website URL |
| logoUrl | `string` | No | Server logo URL |
| tags | `string[]` | No | Classification tags |
| longRunning | `boolean` | No | Long-running server flag |
| timeout | `number` | No | Request timeout (seconds, default 60) |
| dxtVersion | `string` | No | DXT package version |
| dxtPath | `string` | No | DXT extraction path |
| reference | `string` | No | Documentation link |
| searchKey | `string` | No | Search keyword |
| configSample | `MCPConfigSample` | No | Example config |
| disabledTools | `string[]` | No | Disabled tool names |
| disabledAutoApproveTools | `string[]` | No | Tools without auto-approval |
| shouldConfig | `boolean` | No | Built-in MCP needs configuration flag |
| installSource | `MCPServerInstallSource` | No | `'builtin' \| 'manual' \| 'protocol' \| 'unknown'` |
| isTrusted | `boolean` | No | User trust flag |
| trustedAt | `number` | No | Trust timestamp |
| installedAt | `number` | No | Installation timestamp |

### Built-in MCP Servers

12 built-in servers with `type: 'inMemory'`:
- `@cherry/mcp-auto-install` - Auto-install MCP servers
- `@cherry/memory` - Memory service
- `@cherry/sequentialthinking` - Sequential thinking
- `@cherry/brave-search` - Brave search
- `@cherry/fetch` - HTTP fetch
- `@cherry/filesystem` - File system access
- `@cherry/dify-knowledge` - Dify knowledge integration
- `@cherry/python` - Python execution
- `@cherry/didi-mcp` - DiDi MCP
- `@cherry/browser` - Browser automation
- `@cherry/nowledge-mem` - Nowledge memory
- `@cherry/hub` - MCP hub (aggregator)

### Relationships

- **Referenced by** `Assistant.mcpServers`
- **Used in** `Message.enabledMCPs` (deprecated)

---

## E009: FileMetadata

**Owner**: F010-files
**Source**: `src/renderer/src/types/file.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique file identifier |
| name | `string` | Yes | Internal file name |
| origin_name | `string` | Yes | Original display name |
| path | `string` | Yes | File path |
| size | `number` | Yes | File size in bytes |
| ext | `string` | Yes | File extension (with `.`) |
| type | `FileType` | Yes | `'image' \| 'video' \| 'audio' \| 'text' \| 'document' \| 'other'` |
| created_at | `string` | Yes | ISO timestamp |
| count | `number` | Yes | File reference count |
| tokens | `number` | No | Estimated token count |
| purpose | `string` | No | OpenAI file purpose |

### Relationships

- **Referenced by** `Message` (via MessageBlock.IMAGE, MessageBlock.FILE)
- **Referenced by** `KnowledgeItem.content` (for file-type items)

---

## E010: NotesTreeNode

**Owner**: F009-notes
**Source**: `src/renderer/src/types/note.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Node identifier |
| name | `string` | Yes | Name (without extension) |
| type | `'folder' \| 'file' \| 'hint'` | Yes | Node type |
| treePath | `string` | Yes | Relative path |
| externalPath | `string` | Yes | Absolute file path |
| createdAt | `string` | Yes | ISO timestamp |
| updatedAt | `string` | Yes | ISO timestamp |
| children | `NotesTreeNode[]` | No | Child nodes (for folders) |
| isStarred | `boolean` | No | Starred/favorited |
| expanded | `boolean` | No | UI expansion state |

### Relationships

- **Self-referencing** via `children` (tree structure)

---

## E011: SettingsState

**Owner**: F006-settings
**Source**: `src/renderer/src/store/settings.ts`

### Key Setting Groups

| Group | Fields | Description |
|-------|--------|-------------|
| **General** | `language`, `sendMessageShortcut`, `userName`, `userId`, `proxyMode`, `proxyUrl` | Core app settings |
| **Display** | `theme`, `userTheme`, `fontSize`, `windowStyle`, `messageStyle`, `messageFont`, `sidebarIcons`, `navbarPosition`, `narrowMode` | Visual appearance |
| **Chat** | `showAssistants`, `showTopics`, `topicPosition`, `enableTopicNaming`, `topicNamingPrompt`, `showPrompt`, `showMessageDivider`, `multiModelMessageStyle` | Chat UI behavior |
| **Code** | `codeExecution`, `codeEditor`, `codeViewer`, `codeShowLineNumbers`, `codeCollapsible`, `codeWrappable`, `codeFancyBlock` | Code display settings |
| **Translate** | `targetLanguage`, `translateModelPrompt`, `autoTranslateWithSpace`, `showTranslateConfirm` | Translation config |
| **WebDAV Backup** | `webdavHost`, `webdavUser`, `webdavPass`, `webdavPath`, `webdavAutoSync`, `webdavSyncInterval`, `webdavMaxBackups` | WebDAV sync settings |
| **S3 Backup** | `s3` (nested: `endpoint`, `region`, `bucket`, `accessKeyId`, `secretAccessKey`, `autoSync`, `syncInterval`, `maxBackups`) | S3 sync settings |
| **Local Backup** | `localBackupDir`, `localBackupAutoSync`, `localBackupSyncInterval`, `localBackupMaxBackups` | Local backup settings |
| **API Server** | `apiServer` (nested: `enabled`, `host`, `port`, `apiKey`) | Express API server config |
| **System** | `launchOnBoot`, `launchToTray`, `tray`, `trayOnClose`, `autoCheckUpdate`, `testPlan`, `testChannel`, `disableHardwareAcceleration`, `useSystemTitleBar` | System behavior |
| **Privacy** | `enableDataCollection`, `enableSpellCheck`, `spellCheckLanguages` | Privacy controls |
| **OpenAI** | `openAI.summaryText`, `openAI.serviceTier`, `openAI.verbosity`, `openAI.streamOptions` | OpenAI-specific settings |
| **Notifications** | `notification.assistant`, `notification.backup`, `notification.knowledge` | Notification toggles |
| **Export** | `exportMenuOptions`, `markdownExportPath`, `forceDollarMathInMarkdown` | Export configuration |

---

## E012: WebDavConfig

**Owner**: F012-infra
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| webdavHost | `string` | Yes | Server URL |
| webdavUser | `string` | No | Username |
| webdavPass | `string` | No | Password |
| webdavPath | `string` | No | Remote path |
| fileName | `string` | No | Backup file name |
| skipBackupFile | `boolean` | No | Skip backup file in export |
| disableStream | `boolean` | No | Disable streaming upload |

---

## E013: S3Config

**Owner**: F012-infra
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| endpoint | `string` | Yes | S3-compatible endpoint URL |
| region | `string` | Yes | AWS region |
| bucket | `string` | Yes | Bucket name |
| accessKeyId | `string` | Yes | Access key |
| secretAccessKey | `string` | Yes | Secret key |
| root | `string` | No | Path prefix |
| fileName | `string` | No | Backup file name |
| skipBackupFile | `boolean` | Yes | Skip backup file flag |
| autoSync | `boolean` | Yes | Auto-sync toggle |
| syncInterval | `number` | Yes | Sync interval (ms) |
| maxBackups | `number` | Yes | Max backup count |

---

## E014: ApiServerConfig

**Owner**: F012-infra
**Source**: `src/renderer/src/types/apiServer.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | `boolean` | Yes | Server enabled |
| host | `string` | Yes | Listen host |
| port | `number` | Yes | Listen port |
| apiKey | `string` | Yes | Bearer token for auth (auto-generated `cs-sk-{uuid}`) |

---

## E015: QuickPhrase

**Owner**: F006-settings
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| title | `string` | Yes | Short title |
| content | `string` | Yes | Phrase content |
| createdAt | `number` | Yes | Unix timestamp |
| updatedAt | `number` | Yes | Unix timestamp |
| order | `number` | No | Sort order |

---

## E016: Shortcut

**Owner**: F006-settings
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | `string` | Yes | Shortcut identifier |
| shortcut | `string[]` | Yes | Key combination array |
| editable | `boolean` | Yes | User-editable flag |
| enabled | `boolean` | Yes | Active flag |
| system | `boolean` | Yes | System shortcut flag |

---

## E017: Usage

**Owner**: F005-chat
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt_tokens | `number` | Yes | Input tokens (from OpenAI.CompletionUsage) |
| completion_tokens | `number` | Yes | Output tokens |
| total_tokens | `number` | Yes | Total tokens |
| thoughts_tokens | `number` | No | Reasoning tokens |
| cost | `number` | No | OpenRouter cost |

---

## E018: Metrics

**Owner**: F005-chat
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completion_tokens | `number` | Yes | Output token count |
| time_completion_millsec | `number` | Yes | Total completion time (ms) |
| time_first_token_millsec | `number` | No | Time to first token (ms) |
| time_thinking_millsec | `number` | No | Thinking/reasoning time (ms) |

---

## E019: MemoryItem

**Owner**: F005-chat
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| memory | `string` | Yes | Memory content text |
| hash | `string` | No | Content hash for dedup |
| createdAt | `string` | No | ISO timestamp |
| updatedAt | `string` | No | ISO timestamp |
| score | `number` | No | Relevance score |
| metadata | `Record<string, any>` | No | Extra metadata |

---

## E020: WebSearchProvider

**Owner**: F012-infra
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `WebSearchProviderId` | Yes | `'zhipu' \| 'tavily' \| 'searxng' \| 'exa' \| 'exa-mcp' \| 'bocha' \| 'local-google' \| 'local-bing' \| 'local-baidu'` |
| name | `string` | Yes | Display name |
| apiKey | `string` | No | API key |
| apiHost | `string` | No | API host |
| engines | `string[]` | No | Search engines (SearXNG) |
| url | `string` | No | Custom URL |
| usingBrowser | `boolean` | No | Browser-based search flag |

---

## E021: MinAppType

**Owner**: F011-tools
**Source**: `src/renderer/src/types/index.ts`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier |
| name | `string` | Yes | App name |
| url | `string` | Yes | App URL |
| nameKey | `string` | No | i18n translation key |
| supportedRegions | `MinAppRegion[]` | No | `'CN' \| 'Global'` |
| logo | `string` | No | Logo URL |
| bodered | `boolean` | No | Border style flag |
| background | `string` | No | Background color |
| style | `CSSProperties` | No | Custom CSS |
| addTime | `string` | No | Addition timestamp |
| type | `'Custom' \| 'Default'` | No | User-created vs built-in |
