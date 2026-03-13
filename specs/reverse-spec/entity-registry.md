# Entity Registry

**Source**: /Users/coolhero/Develop/cherry-studio
**Generated**: 2026-03-13
**Total Entities**: 20

## Entity Index

| Entity | Owner Feature | Referencing Features | Fields | Relationships |
|--------|--------------|---------------------|--------|---------------|
| Assistant | F005-assistant | F003, F004, F006, F008, F009 | 22 | 5 |
| AssistantSettings | F005-assistant | F004 | 11 | 1 |
| QuickPhrase | F005-assistant | F006 | 6 | 1 |
| Topic | F006-chat | F005 | 11 | 2 |
| Message | F006-chat | F005, F004 | 18 | 4 |
| MessageBlock | F006-chat | F004 | 8+ (union) | 1 |
| Provider | F003-settings | F004 | 18 | 1 |
| Model | F003-settings | F004, F005, F006, F009 | 10 | 1 |
| SettingsState | F003-settings | F001, F002 | 80+ | 2 |
| MCPServer | F008-mcp | F005, F006, F004 | 26 | 1 |
| MCPTool | F008-mcp | F004, F006 | 8 | 1 |
| KnowledgeBase | F009-knowledge-base | F005 | 13 | 2 |
| KnowledgeItem | F009-knowledge-base | - | 13 | 1 |
| FileMetadata | F007-file-management | F006, F009 | 10 | 0 |
| NotesTreeNode | F010-notes | - | 8 | 1 (self) |
| AgentEntity | F005-assistant | F006 | 12 | 1 |
| AgentSessionEntity (Session) | F006-chat | F005 | 13 | 2 |
| AgentSessionMessageEntity (SessionMessage) | F006-chat | - | 7 | 1 |
| TranslateHistory | F012-creative-tools | - | 7 | 0 |
| PluginMetadata | F012-creative-tools | F005 | 14 | 1 |

---

## Assistant

**Owner Feature**: F005-assistant
**Original Source**: `src/renderer/src/types/index.ts:33-63`
**Referencing Features**: F003-settings, F004-ai-engine, F006-chat, F008-mcp, F009-knowledge-base

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| name | string | required | Display name |
| prompt | string | required | System prompt text |
| knowledge_bases | KnowledgeBase[] | optional | Attached knowledge bases |
| topics | Topic[] | required | Conversation topics owned by this assistant |
| type | string | required | Assistant type discriminator |
| emoji | string | optional | Emoji icon |
| description | string | optional | Description text |
| model | Model | optional | Currently assigned model |
| defaultModel | Model | optional | Default model fallback |
| settings | Partial\<AssistantSettings\> | optional | Tuning parameters |
| messages | AssistantMessage[] | optional | Preset context messages (role + content pairs) |
| enableWebSearch | boolean | optional | Enable model built-in web search |
| webSearchProviderId | string | optional | Web search provider reference |
| enableUrlContext | boolean | optional | Gemini/Anthropic URL context feature |
| enableGenerateImage | boolean | optional | Enable image generation |
| mcpMode | McpMode | optional, enum: 'disabled' \| 'auto' \| 'manual' | MCP tool injection mode |
| mcpServers | MCPServer[] | optional | Manually selected MCP servers |
| knowledgeRecognition | 'off' \| 'on' | optional | Knowledge base recognition toggle |
| regularPhrases | QuickPhrase[] | optional | Preset quick phrases |
| tags | string[] | optional | Classification tags |
| enableMemory | boolean | optional | Enable memory service |
| content | string | optional | Used for translate assistant variant |
| targetLanguage | TranslateLanguage | optional | Used for translate assistant variant |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| has-many | Topic | 1:N | Topic.assistantId | Assistant owns topics |
| has-one | Model | 1:1 | embedded | Currently assigned model |
| has-many | MCPServer | M:N | embedded array | MCP servers for manual mode |
| has-many | KnowledgeBase | M:N | embedded array | Attached knowledge bases |
| has-many | QuickPhrase | 1:N | embedded array | Quick phrases |

### Validation Rules

- `mcpMode` defaults via `getEffectiveMcpMode()`: if undefined, checks `mcpServers.length > 0` -> 'manual', else 'disabled'
- `TranslateAssistant` variant requires `model`, `content`, and `targetLanguage` to all be defined

### State Transitions

None (CRUD entity, no lifecycle states).

---

## AssistantSettings

**Owner Feature**: F005-assistant
**Original Source**: `src/renderer/src/types/index.ts:171-191`
**Referencing Features**: F004-ai-engine

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| maxTokens | number | optional | Maximum output tokens |
| enableMaxTokens | boolean | optional | Whether maxTokens is active |
| temperature | number | required | Sampling temperature |
| enableTemperature | boolean | optional | Whether temperature is active |
| topP | number | required | Top-P sampling |
| enableTopP | boolean | optional | Whether topP is active |
| contextCount | number | required | Number of context messages to include |
| streamOutput | boolean | required | Enable streaming output |
| defaultModel | Model | optional | Per-settings default model |
| customParameters | AssistantSettingCustomParameters[] | optional | Custom API parameters |
| reasoning_effort | ReasoningEffortOption | required | Reasoning effort level |
| reasoning_effort_cache | ReasoningEffortOption | optional | Cached effective reasoning effort |
| qwenThinkMode | boolean | optional | Qwen-specific think mode |
| toolUseMode | 'function' \| 'prompt' | required | How tools are passed to the model |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Assistant | N:1 | Assistant.settings | Embedded in assistant |

---

## QuickPhrase

**Owner Feature**: F005-assistant
**Original Source**: `src/renderer/src/types/index.ts:952-959`
**Referencing Features**: F006-chat

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| title | string | required | Display title |
| content | string | required | Phrase content text |
| createdAt | number | required | Creation timestamp |
| updatedAt | number | required | Last update timestamp |
| order | number | optional | Sort order |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Assistant | N:1 | Assistant.regularPhrases | Embedded in assistant |

---

## Topic

**Owner Feature**: F006-chat
**Original Source**: `src/renderer/src/types/index.ts:262-273`
**Referencing Features**: F005-assistant

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| type | TopicType | optional, enum: 'chat' \| 'session' | Topic type discriminator |
| assistantId | string | required | FK to owning Assistant |
| name | string | required | Display name / title |
| createdAt | string | required | ISO timestamp |
| updatedAt | string | required | ISO timestamp |
| messages | Message[] | required | Messages in this topic |
| pinned | boolean | optional | Whether topic is pinned |
| prompt | string | optional | Topic-level system prompt override |
| isNameManuallyEdited | boolean | optional | Whether name was manually edited vs auto-named |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Assistant | N:1 | assistantId | Topic belongs to one assistant |
| has-many | Message | 1:N | Message.topicId | Topic contains messages |

---

## Message

**Owner Feature**: F006-chat
**Original Source**: `src/renderer/src/types/newMessage.ts:184-224`
**Referencing Features**: F004-ai-engine, F005-assistant

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| role | 'user' \| 'assistant' \| 'system' | required | Message role |
| assistantId | string | required | FK to Assistant |
| topicId | string | required | FK to Topic |
| createdAt | string | required | ISO timestamp |
| updatedAt | string | optional | ISO timestamp |
| status | UserMessageStatus \| AssistantMessageStatus | required | Current message status |
| modelId | string | optional | Model ID used for generation |
| model | Model | optional | Embedded model snapshot |
| type | 'clear' | optional | Special message type marker |
| useful | boolean | optional | User feedback flag |
| askId | string | optional | FK to related question message |
| mentions | Model[] | optional | Multi-model mentions |
| enabledMCPs | MCPServer[] | optional, deprecated | Legacy MCP server list |
| usage | Usage | optional | Token usage stats |
| metrics | Metrics | optional | Performance metrics |
| multiModelMessageStyle | 'horizontal' \| 'vertical' \| 'fold' \| 'grid' | optional | Multi-model display style |
| foldSelected | boolean | optional | Whether selected in fold mode |
| blocks | string[] | required | Array of MessageBlock IDs |
| traceId | string | optional | Distributed tracing ID |
| agentSessionId | string | optional | Agent session ID for resume |
| providerMetadata | ProviderMetadata | optional | Raw provider-specific data |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Topic | N:1 | topicId | Message belongs to a topic |
| belongs-to | Assistant | N:1 | assistantId | Message created in context of assistant |
| has-many | MessageBlock | 1:N | blocks[] (ID array) | Message contains content blocks |
| has-one | Model | 1:1 | model (embedded) | Model used for generation |

### State Transitions

**UserMessageStatus**: `success` (terminal)

**AssistantMessageStatus**: `pending` -> `processing` -> `searching` -> `streaming` -> `success` | `paused` | `error`

---

## MessageBlock

**Owner Feature**: F006-chat
**Original Source**: `src/renderer/src/types/newMessage.ts:49-169`
**Referencing Features**: F004-ai-engine

MessageBlock is a discriminated union type on `type` field. All variants share `BaseMessageBlock`.

### Base Fields (BaseMessageBlock)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Block ID |
| messageId | string | required | FK to parent Message |
| type | MessageBlockType | required, enum | Block type discriminator |
| createdAt | string | required | ISO timestamp |
| updatedAt | string | optional | ISO timestamp |
| status | MessageBlockStatus | required, enum | Block processing status |
| model | Model | optional | Model used |
| metadata | Record\<string, any\> | optional | Generic metadata |
| error | SerializedError | optional | Error details |

### Block Type Variants

| Type | Extra Fields | Description |
|------|-------------|-------------|
| UNKNOWN | (none) | Placeholder before type is known |
| MAIN_TEXT | content: string, knowledgeBaseIds?: string[], citationReferences? | Primary text content |
| THINKING | content: string, thinking_millsec: number | Model reasoning process |
| TRANSLATION | content: string, sourceBlockId?, sourceLanguage?, targetLanguage | Translated content |
| CODE | content: string, language: string | Code block |
| IMAGE | url?: string, file?: FileMetadata | Image content |
| TOOL | toolId: string, toolName?, arguments?, content? | Tool call and result |
| FILE | file: FileMetadata | File attachment |
| ERROR | (uses base error field) | Error block |
| CITATION | response?: WebSearchResponse, knowledge?: KnowledgeReference[], memories?: MemoryItem[] | Citations and references |
| VIDEO | url?: string, filePath?: string | Video content |
| COMPACT | content: string, compactedContent: string | Compact command response |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Message | N:1 | messageId | Block belongs to a message |

### State Transitions

**MessageBlockStatus**: `pending` -> `processing` -> `streaming` -> `success` | `error` | `paused`

---

## Provider

**Owner Feature**: F003-settings
**Original Source**: `src/renderer/src/types/provider.ts:103-139`
**Referencing Features**: F004-ai-engine

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Provider identifier |
| type | ProviderType | required, enum (11 values) | API protocol type |
| name | string | required | Display name |
| apiKey | string | required | API authentication key |
| apiHost | string | required | API base URL |
| anthropicApiHost | string | optional | Separate host for Anthropic models |
| apiVersion | string | optional | API version string |
| models | Model[] | required | Available models list |
| enabled | boolean | optional | Whether provider is active |
| isSystem | boolean | optional | Whether this is a built-in provider |
| isAuthed | boolean | optional | Whether authenticated |
| rateLimit | number | optional | Rate limit (requests/min) |
| apiOptions | ProviderApiOptions | optional | Feature support flags |
| serviceTier | ServiceTier | optional | OpenAI/Groq service tier |
| verbosity | OpenAIVerbosity | optional | OpenAI verbosity setting |
| authType | 'apiKey' \| 'oauth' | optional | Authentication method |
| notes | string | optional | User notes |
| extra_headers | Record\<string, string\> | optional | Custom HTTP headers |
| anthropicCacheControl | AnthropicCacheControlSettings | optional | Anthropic prompt caching config |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| has-many | Model | 1:N | Model.provider (by provider ID) | Provider owns models |

### Validation Rules

- `ProviderType` is one of: openai, openai-response, anthropic, gemini, azure-openai, vertexai, mistral, aws-bedrock, vertex-anthropic, new-api, gateway, ollama
- System providers are identified by `SystemProviderIdSchema` (60+ known IDs)

---

## Model

**Owner Feature**: F003-settings
**Original Source**: `src/renderer/src/types/index.ts:312-328`
**Referencing Features**: F004, F005, F006, F009

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required | Model identifier (typically provider's model ID) |
| provider | string | required | FK to Provider.id |
| name | string | required | Display name |
| group | string | required | Model grouping/family |
| owned_by | string | optional | Organization owner |
| description | string | optional | Description |
| capabilities | ModelCapability[] | optional | Array of {type, isUserSelected?} |
| type | ModelType[] | optional, deprecated | Legacy type array |
| pricing | ModelPricing | optional | Input/output token pricing |
| endpoint_type | EndpointType | optional | API endpoint type |
| supported_endpoint_types | EndpointType[] | optional | All supported endpoint types |
| supported_text_delta | boolean | optional | Whether streaming text delta is supported |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | Provider | N:1 | provider field | Model belongs to a provider |

---

## SettingsState

**Owner Feature**: F003-settings
**Original Source**: `src/renderer/src/store/settings.ts:61-251`
**Referencing Features**: F001-app-shell, F002-navigation

SettingsState is a large flat configuration object stored in Redux. Key field groups are listed below (not exhaustive -- 80+ fields total).

### Key Field Groups

| Group | Notable Fields | Description |
|-------|---------------|-------------|
| UI | theme, fontSize, windowStyle, messageStyle, narrowMode, navbarPosition | Visual appearance |
| Language | language, targetLanguage | UI and translation language |
| Proxy | proxyMode, proxyUrl, proxyBypassRules | Network proxy |
| Send | sendMessageShortcut | Input behavior |
| Topics | showTopics, topicPosition, showTopicTime, pinTopicsToTop, enableTopicNaming | Topic panel config |
| Assistants | showAssistants, assistantsTabSortType, assistantIconType, clickAssistantToShowTopic | Assistant panel config |
| Code | codeEditor.*, codeViewer.*, codeShowLineNumbers, codeCollapsible, codeWrappable | Code rendering |
| WebDAV | webdavHost, webdavUser, webdavPass, webdavPath, webdavAutoSync, webdavSyncInterval | WebDAV sync |
| S3 | s3 (S3Config) | S3 backup config |
| Local Backup | localBackupDir, localBackupAutoSync, localBackupSyncInterval, localBackupMaxBackups | Local backup |
| Sidebar | sidebarIcons.visible[], sidebarIcons.disabled[] | Sidebar customization |
| Export | exportMenuOptions.* | Export format toggles |
| OpenAI | openAI.summaryText, openAI.serviceTier, openAI.verbosity, openAI.streamOptions | OpenAI-specific |
| Notifications | notification.assistant, notification.backup, notification.knowledge | Notification preferences |
| API Server | apiServer (ApiServerConfig) | Built-in API server |
| Privacy | enableDataCollection, enableSpellCheck | Privacy settings |
| Painting | defaultPaintingProvider | Default image gen provider |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| references | S3Config | 1:1 | embedded | S3 backup configuration |
| references | ApiServerConfig | 1:1 | embedded | API server configuration |

---

## MCPServer

**Owner Feature**: F008-mcp
**Original Source**: `src/renderer/src/types/index.ts:776-815`
**Referencing Features**: F005-assistant, F006-chat, F004-ai-engine

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Internal ID |
| name | string | required | MCP name, generally unique key |
| type | McpServerType \| 'inMemory' | optional, default 'stdio' | Communication type |
| description | string | optional | Server description |
| baseUrl | string | optional | Server URL (for SSE/HTTP) |
| command | string | optional | Launch command (for stdio) |
| registryUrl | string | optional | Registry URL |
| args | string[] | optional | Command arguments |
| env | Record\<string, string\> | optional | Environment variables |
| headers | Record\<string, string\> | optional | Custom HTTP headers |
| provider | string | optional | Provider name (ModelScope, etc.) |
| providerUrl | string | optional | Provider documentation URL |
| logoUrl | string | optional | Logo image URL |
| tags | string[] | optional | Classification tags |
| longRunning | boolean | optional | Long-running server flag |
| timeout | number | optional | Request timeout in seconds (default 60) |
| dxtVersion | string | optional | DXT package version |
| dxtPath | string | optional | DXT extracted path |
| reference | string | optional | Documentation/homepage link |
| searchKey | string | optional | Search keyword |
| configSample | MCPConfigSample | optional | Configuration example |
| disabledTools | string[] | optional | Disabled tool names |
| disabledAutoApproveTools | string[] | optional | Tools excluded from auto-approve |
| shouldConfig | boolean | optional | Whether built-in MCP needs configuration |
| isActive | boolean | required | Whether server is running |
| installSource | MCPServerInstallSource | optional, enum: 'builtin' \| 'manual' \| 'protocol' \| 'unknown' | Installation origin |
| isTrusted | boolean | optional | Whether user trusted this MCP |
| trustedAt | number | optional | Trust timestamp |
| installedAt | number | optional | Installation timestamp |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| has-many | MCPTool | 1:N | MCPTool.serverId | Server provides tools |

### Validation Rules

- McpServerType: 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'
- inMemory type only allowed for built-in servers (validated by Zod refine)
- URL presence implies 'streamableHttp' or 'sse' type (auto-inferred)

---

## MCPTool

**Owner Feature**: F008-mcp
**Original Source**: `src/renderer/src/types/tool.ts:52-62`
**Referencing Features**: F004-ai-engine, F006-chat

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required | Tool identifier |
| serverId | string | required | FK to MCPServer.id |
| serverName | string | required | Server display name |
| name | string | required | Tool name |
| description | string | optional | Tool description |
| inputSchema | MCPToolInputSchema | required | JSON Schema for input parameters |
| outputSchema | MCPToolOutputSchema | optional | JSON Schema for output |
| isBuiltIn | boolean | optional | Whether tool is built-in (bypasses MCP protocol) |
| type | 'mcp' | required, literal | Tool type discriminator |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | MCPServer | N:1 | serverId | Tool belongs to a server |

---

## KnowledgeBase

**Owner Feature**: F009-knowledge-base
**Original Source**: `src/renderer/src/types/knowledge.ts:82-103`
**Referencing Features**: F005-assistant

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| name | string | required | Display name |
| model | Model | required | Embedding model |
| dimensions | number | optional | Embedding dimensions |
| description | string | optional | Description |
| items | KnowledgeItem[] | required | Knowledge items in this base |
| created_at | number | required | Unix timestamp |
| updated_at | number | required | Unix timestamp |
| version | number | required | Schema version |
| documentCount | number | optional | Number of indexed documents |
| chunkSize | number | optional | Text chunk size |
| chunkOverlap | number | optional | Chunk overlap size |
| threshold | number | optional | Similarity threshold |
| rerankModel | Model | optional | Rerank model |
| preprocessProvider | object | optional | Preprocessing provider config |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| has-many | KnowledgeItem | 1:N | embedded array | Base contains items |
| referenced-by | Assistant | M:N | Assistant.knowledge_bases | Assistants attach knowledge bases |

---

## KnowledgeItem

**Owner Feature**: F009-knowledge-base
**Original Source**: `src/renderer/src/types/knowledge.ts:7-22`
**Referencing Features**: (none directly)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| baseId | string | optional | FK to parent KnowledgeBase |
| uniqueId | string | optional | Unique content identifier |
| uniqueIds | string[] | optional | Multiple unique identifiers |
| type | KnowledgeItemType | required, enum | Item type: 'file' \| 'url' \| 'note' \| 'sitemap' \| 'directory' \| 'memory' \| 'video' |
| content | string \| FileMetadata \| FileMetadata[] | required | Content (varies by type) |
| remark | string | optional | User remark |
| created_at | number | required | Unix timestamp |
| updated_at | number | required | Unix timestamp |
| processingStatus | ProcessingStatus | optional, enum | 'pending' \| 'processing' \| 'completed' \| 'failed' |
| processingProgress | number | optional | Progress 0-1 |
| processingError | string | optional | Error message |
| retryCount | number | optional | Number of processing retries |
| isPreprocessed | boolean | optional | Whether item has been preprocessed |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | KnowledgeBase | N:1 | embedded in KnowledgeBase.items | Item belongs to a knowledge base |

### State Transitions

**processingStatus**: `pending` -> `processing` -> `completed` | `failed`

---

## FileMetadata

**Owner Feature**: F007-file-management
**Original Source**: `src/renderer/src/types/file.ts:83-128`
**Referencing Features**: F006-chat, F009-knowledge-base

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| name | string | required | Stored file name |
| origin_name | string | required | Original display name |
| path | string | required | File path on disk |
| size | number | required | File size in bytes |
| ext | string | required | File extension (with dot) |
| type | FileType | required, enum: 'image' \| 'video' \| 'audio' \| 'text' \| 'document' \| 'other' | File type |
| created_at | string | required | ISO timestamp |
| count | number | required | File counter |
| tokens | number | optional | Estimated token count |
| purpose | OpenAI.FilePurpose | optional | OpenAI file purpose |

### Relationships

None (value object, referenced by Message, KnowledgeItem, etc.)

---

## NotesTreeNode

**Owner Feature**: F010-notes
**Original Source**: `src/renderer/src/types/note.ts:13-24`
**Referencing Features**: (none)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| name | string | required | Node name (without extension) |
| type | 'folder' \| 'file' \| 'hint' | required | Node type |
| treePath | string | required | Relative path in tree |
| externalPath | string | required | Absolute filesystem path |
| children | NotesTreeNode[] | optional | Child nodes (for folders) |
| isStarred | boolean | optional | Bookmarked flag |
| expanded | boolean | optional | UI expanded state |
| createdAt | string | required | ISO timestamp |
| updatedAt | string | required | ISO timestamp |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| self-referential | NotesTreeNode | 1:N | children array | Folder contains children |

---

## AgentEntity

**Owner Feature**: F005-assistant
**Original Source**: `src/renderer/src/types/agent.ts:110-117` (type), `src/main/services/agents/database/schema/agents.schema.ts` (DB)
**Referencing Features**: F006-chat

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Unique identifier |
| type | AgentType | required, enum: 'claude-code' | Agent runtime type |
| name | string | optional | Display name |
| description | string | optional | Description |
| accessible_paths | string[] | required | Directories agent can access |
| instructions | string | optional | System prompt |
| model | string | required | Main model ID |
| plan_model | string | optional | Planning model ID |
| small_model | string | optional | Fast/small model ID |
| mcps | string[] | optional | MCP tool IDs |
| allowed_tools | string[] | optional | Allowed tool whitelist |
| configuration | AgentConfiguration | optional | Extensible settings (avatar, permission_mode, max_turns) |
| created_at | string (ISO) | required | Creation timestamp |
| updated_at | string (ISO) | required | Last update timestamp |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| has-many | AgentSessionEntity | 1:N | Session.agent_id -> Agent.id | Agent owns sessions |

### Indexes (Drizzle)

| Index Name | Columns | Description |
|------------|---------|-------------|
| idx_agents_name | name | Name lookup |
| idx_agents_type | type | Type filter |
| idx_agents_created_at | created_at | Chronological sort |

---

## AgentSessionEntity (Session)

**Owner Feature**: F006-chat
**Original Source**: `src/renderer/src/types/agent.ts:131-141` (type), `src/main/services/agents/database/schema/sessions.schema.ts` (DB)
**Referencing Features**: F005-assistant

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Unique identifier |
| agent_id | string | required, FK -> agents.id | Primary agent for session |
| agent_type | AgentType | required | Agent runtime type |
| name | string | required | Session name |
| description | string | optional | Description |
| accessible_paths | string[] | required (JSON) | Directory access paths |
| instructions | string | optional | System prompt |
| model | string | required | Main model ID |
| plan_model | string | optional | Planning model ID |
| small_model | string | optional | Fast model ID |
| mcps | string[] | optional (JSON) | MCP tool IDs |
| allowed_tools | string[] | optional (JSON) | Tool whitelist |
| slash_commands | SlashCommand[] | optional (JSON) | SDK slash commands |
| configuration | AgentConfiguration | optional (JSON) | Extensible settings |
| created_at | string (ISO) | required | Creation timestamp |
| updated_at | string (ISO) | required | Last update timestamp |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | AgentEntity | N:1 | agent_id FK, ON DELETE CASCADE | Session belongs to agent |
| has-many | AgentSessionMessageEntity | 1:N | SessionMessage.session_id | Session contains messages |

### Indexes (Drizzle)

| Index Name | Columns | Description |
|------------|---------|-------------|
| idx_sessions_created_at | created_at | Chronological sort |
| idx_sessions_agent_id | agent_id | Agent lookup |
| idx_sessions_model | model | Model filter |

---

## AgentSessionMessageEntity (SessionMessage)

**Owner Feature**: F006-chat
**Original Source**: `src/renderer/src/types/agent.ts:148-160` (type), `src/main/services/agents/database/schema/messages.schema.ts` (DB)
**Referencing Features**: (none)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | number | PK, auto-increment | Unique identifier |
| session_id | string | required, FK -> sessions.id | Parent session |
| role | SessionMessageRole | required, enum: 'user' \| 'assistant' \| 'system' \| 'tool' | Message role |
| content | unknown (JSON) | required | Structured content (JSON blob) |
| agent_session_id | string | default '' | Agent session ID for resume |
| metadata | Record\<string, any\> | optional (JSON) | Additional metadata |
| created_at | string (ISO) | required | Creation timestamp |
| updated_at | string (ISO) | required | Last update timestamp |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | AgentSessionEntity | N:1 | session_id FK, ON DELETE CASCADE | Message belongs to session |

### Indexes (Drizzle)

| Index Name | Columns | Description |
|------------|---------|-------------|
| idx_session_messages_session_id | session_id | Session message lookup |
| idx_session_messages_created_at | created_at | Chronological sort |
| idx_session_messages_updated_at | updated_at | Update sort |

---

## TranslateHistory

**Owner Feature**: F012-creative-tools
**Original Source**: `src/renderer/src/types/index.ts:626-635`
**Referencing Features**: (none)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | required, unique | Unique identifier |
| sourceText | string | required | Original text |
| targetText | string | required | Translated text |
| sourceLanguage | TranslateLanguageCode | required | Source language code |
| targetLanguage | TranslateLanguageCode | required | Target language code |
| createdAt | string | required | ISO timestamp |
| star | boolean | optional | Bookmarked/favorite flag |

### Relationships

None.

---

## PluginMetadata

**Owner Feature**: F012-creative-tools
**Original Source**: `src/renderer/src/types/plugin.ts:7-38`
**Referencing Features**: F005-assistant (AgentEntity plugins)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| sourcePath | string | required | Relative path to plugin source |
| filename | string | required | Filename (semantics vary by type) |
| name | string | required | Display name |
| description | string | optional | Plugin description |
| allowed_tools | string[] | optional | Allowed tools (for commands) |
| tools | string[] | optional | Tools (for agents and skills) |
| category | string | required | Derived from parent folder |
| type | 'agent' \| 'command' \| 'skill' | required | Plugin type |
| tags | string[] | optional | Classification tags |
| version | string | optional | Version string |
| author | string | optional | Author |
| size | number \| null | required | File size in bytes |
| contentHash | string | required | SHA-256 hash for change detection |
| installedAt | number | optional | Unix timestamp |
| updatedAt | number | optional | Unix timestamp |
| packageName | string | optional | Parent package name |
| packageVersion | string | optional | Package version |

### Relationships

| Type | Target | Cardinality | FK/Join | Description |
|------|--------|-------------|---------|-------------|
| belongs-to | AgentEntity | N:1 | loaded via workdir plugins.json | Plugin installed for an agent |

---

## Supporting Types (Non-Entity)

These types are referenced by entities but are not standalone entities themselves:

| Type | Source File | Used By | Description |
|------|-----------|---------|-------------|
| Usage | index.ts:244-248 | Message | Token usage (completion_tokens, prompt_tokens, total_tokens, thoughts_tokens, cost) |
| Metrics | index.ts:250-255 | Message | Performance metrics (completion_tokens, time_completion_millsec, time_first_token_millsec, time_thinking_millsec) |
| AssistantMessage | index.ts:86-89 | Assistant | Preset context message pair (role + content) |
| ModelCapability | index.ts:303-310 | Model | Capability with user override flag |
| ModelPricing | index.ts:297-301 | Model | Token pricing per million |
| WebSearchProvider | index.ts:694-708 | Assistant, SettingsState | Web search service config |
| WebSearchResponse | index.ts:751-754 | MessageBlock (Citation) | Web search results wrapper |
| KnowledgeReference | knowledge.ts:145-152 | MessageBlock (Citation) | Knowledge search result reference |
| MemoryItem | index.ts:1014-1022 | MessageBlock (Citation) | Memory service item |
| MemoryConfig | index.ts:1002-1012 | SettingsState | Memory service configuration |
| S3Config | index.ts:983-995 | SettingsState | S3 backup configuration |
| WebDavConfig | index.ts:552-560 | SettingsState | WebDAV sync configuration |
| ApiServerConfig | apiServer.ts:1-6 | SettingsState | API server configuration |
| Notification | notification.ts:4-29 | (runtime) | In-app notification |
| User | index.ts:275-280 | (runtime) | User identity |
| Shortcut | index.ts:576-582 | SettingsState | Keyboard shortcut definition |
| MinAppType | index.ts:508-523 | (runtime) | Mini-app definition |
| AgentConfiguration | agent.ts:54-65 | AgentEntity, AgentSessionEntity | Agent extensible settings (avatar, permission_mode, max_turns) |
| SlashCommand | agent.ts:46-51 | AgentSessionEntity | Slash command definition (command + description) |
| BaseTool | tool.ts:5-10 | MCPTool | Base tool interface (id, name, description, type) |

---

## Entity Relationship Diagram (textual)

```
Provider 1---N Model
    |
    v (Model referenced by)
Assistant 1---N Topic 1---N Message 1---N MessageBlock
    |                         |
    +-- M:N KnowledgeBase     +-- embedded Model snapshot
    |       1---N KnowledgeItem   +-- blocks[] -> MessageBlock.id
    |
    +-- M:N MCPServer 1---N MCPTool
    |
    +-- 1:N QuickPhrase
    |
    +-- embedded AssistantSettings

AgentEntity 1---N AgentSessionEntity 1---N AgentSessionMessageEntity
   (FK: agent_id, CASCADE)      (FK: session_id, CASCADE)

NotesTreeNode (self-referential tree via children[])

FileMetadata (value object, referenced by Message, KnowledgeItem, MessageBlock)

TranslateHistory (standalone)
PluginMetadata (standalone, associated with AgentEntity via filesystem)
SettingsState (singleton Redux store)
```
