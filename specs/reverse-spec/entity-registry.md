# Entity Registry

> Reverse-engineered from Cherry Studio source. 51 entities grouped by Feature owner.

---

## F003-provider

### Provider

Primary entity representing an AI provider configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| type | ProviderType (enum) | Y | — | Provider type key (e.g., openai, anthropic, google, azure, ollama, custom) |
| name | string | Y | — | Display name |
| apiKey | string | N | "" | API key for authentication |
| apiHost | string | N | "" | Custom API host URL |
| models | Model[] | N | [] | Associated models list |
| enabled | boolean | N | true | Whether provider is active |
| isSystem | boolean | N | false | System-provided vs user-created |
| rateLimit | number | N | 0 | Requests per minute (0 = unlimited) |
| authType | "bearer" \| "api-key" \| "none" | N | "bearer" | Authentication method |
| providerSettings | ProviderSettings | N | {} | Provider-specific overrides |

**Relationships:**
- Provider 1:N Model (owns)
- Provider N:N Assistant (referenced via Model)

**Validation Rules:**
- `apiKey` required when `authType` != "none"
- `apiHost` must be valid URL if provided
- `type` must be a recognized ProviderType enum value
- `rateLimit` >= 0

---

### Model

Represents a specific AI model within a provider.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | — | Model identifier (e.g., "gpt-4o") |
| provider | string | Y | — | Parent provider ID |
| name | string | Y | — | Display name |
| group | string | N | "" | Grouping label (e.g., "GPT-4", "Claude 3") |
| capabilities | string[] | N | [] | Feature flags: "vision", "function_calling", "streaming", "reasoning", "web_search" |
| pricing | ModelPricing | N | null | Input/output token pricing |
| endpoint_type | "chat" \| "completion" \| "embedding" | N | "chat" | API endpoint type |
| maxTokens | number | N | — | Max output tokens supported |
| contextWindow | number | N | — | Max context window size |
| enabled | boolean | N | true | Whether model is available for selection |

**ModelPricing:**

| Field | Type | Description |
|-------|------|-------------|
| input | number | Cost per 1M input tokens |
| output | number | Cost per 1M output tokens |

**Relationships:**
- Model N:1 Provider (belongs to)
- Model N:N Assistant (referenced)

**Validation Rules:**
- `id` must be unique within a provider
- `maxTokens` > 0 if provided
- `contextWindow` > 0 if provided

---

## F005-assistant

### Assistant

Core entity defining an AI assistant persona and configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Display name |
| prompt | string | N | "" | System prompt |
| topics | Topic[] | N | [] | Conversation topics |
| model | Model \| null | N | null | Default model reference |
| settings | AssistantSettings | N | defaults | Model parameter overrides |
| messages | Message[] | N | [] | Preset context messages |
| knowledge_bases | string[] | N | [] | Linked knowledge base IDs |
| mcpServers | string[] | N | [] | Linked MCP server IDs |
| enableWebSearch | boolean | N | false | Enable web search augmentation |
| tags | string[] | N | [] | User-defined tags |
| emoji | string | N | "" | Display emoji/icon |
| description | string | N | "" | Short description |
| type | "assistant" \| "agent" | N | "assistant" | Entity subtype |
| group | string | N | "default" | Grouping for sidebar display |
| hideMessages | boolean | N | false | Hide preset messages from UI |

**Relationships:**
- Assistant 1:N Topic (owns)
- Assistant N:1 Model (references)
- Assistant N:N KnowledgeBase (links)
- Assistant N:N MCPServer (links)

**Validation Rules:**
- `name` non-empty string
- `model` must reference an existing enabled Model if set
- `knowledge_bases` entries must reference existing KnowledgeBase IDs
- `mcpServers` entries must reference existing MCPServer IDs

---

### AssistantSettings

Model parameter overrides attached to an Assistant.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| maxTokens | number | N | 4096 | Max output tokens |
| temperature | number | N | 0.7 | Sampling temperature |
| topP | number | N | 1.0 | Nucleus sampling parameter |
| contextCount | number | N | 5 | Number of previous messages as context |
| streamOutput | boolean | N | true | Enable streaming response |
| reasoning_effort | "low" \| "medium" \| "high" | N | "medium" | Reasoning effort for supported models |
| frequencyPenalty | number | N | 0 | Frequency penalty (-2.0 to 2.0) |
| presencePenalty | number | N | 0 | Presence penalty (-2.0 to 2.0) |
| enableMaxTokens | boolean | N | false | Whether maxTokens override is active |
| customParameters | KeyValuePair[] | N | [] | Arbitrary model parameters |
| autoResetModel | boolean | N | false | Reset model per conversation |
| defaultReplyLanguage | string | N | "" | Preferred response language |

**Validation Rules:**
- `temperature` in range [0, 2]
- `topP` in range [0, 1]
- `maxTokens` > 0
- `contextCount` >= 0
- `frequencyPenalty` in range [-2, 2]
- `presencePenalty` in range [-2, 2]

---

### AssistantPreset

A reusable template for assistant configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Preset name |
| prompt | string | N | "" | System prompt template |
| settings | AssistantSettings | N | defaults | Default settings |
| tags | string[] | N | [] | Tags for filtering |

**Relationships:**
- AssistantPreset 1:N Assistant (template for, not enforced FK)

---

## F006-chat

### Topic

A conversation thread within an assistant context.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| assistantId | string | Y | — | Parent assistant ID |
| name | string | N | "New Topic" | Display name (auto-generated from first message) |
| messages | Message[] | N | [] | Ordered message list |
| pinned | boolean | N | false | Pinned to top of list |
| createdAt | string (ISO 8601) | Y | now() | Creation timestamp |
| updatedAt | string (ISO 8601) | Y | now() | Last update timestamp |
| isNameManuallySet | boolean | N | false | Whether user renamed the topic |

**Relationships:**
- Topic N:1 Assistant (belongs to)
- Topic 1:N Message (owns)

**Validation Rules:**
- `assistantId` must reference existing Assistant
- `createdAt` <= `updatedAt`

---

### Message

A single message within a conversation topic.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| role | "user" \| "assistant" \| "system" | Y | — | Message sender role |
| assistantId | string | Y | — | Parent assistant ID |
| topicId | string | Y | — | Parent topic ID |
| status | AssistantMessageStatus | N | "SUCCESS" | Processing status (assistant messages only) |
| model | Model \| null | N | null | Model used for generation |
| blocks | MessageBlock[] | N | [] | Content blocks |
| usage | TokenUsage \| null | N | null | Token usage statistics |
| metrics | MessageMetrics \| null | N | null | Performance metrics |
| createdAt | string (ISO 8601) | Y | now() | Creation timestamp |
| useful | boolean \| null | N | null | User feedback (thumbs up/down) |
| askId | string | N | "" | Linked user message ID (for assistant replies) |
| mentions | string[] | N | [] | @mentioned assistant IDs |
| multiModelMessageStyle | "fold" \| "horizontal" \| "vertical" \| null | N | null | Multi-model display style |

**TokenUsage:**

| Field | Type | Description |
|-------|------|-------------|
| prompt_tokens | number | Input token count |
| completion_tokens | number | Output token count |
| total_tokens | number | Total token count |

**MessageMetrics:**

| Field | Type | Description |
|-------|------|-------------|
| latency | number | Time to first token (ms) |
| totalTime | number | Total generation time (ms) |
| tokensPerSecond | number | Generation speed |

**Relationships:**
- Message N:1 Topic (belongs to)
- Message N:1 Assistant (belongs to)
- Message 1:N MessageBlock (owns)

**State Transitions — AssistantMessageStatus:**

```
PENDING ──> PROCESSING ──> SEARCHING ──> SUCCESS
                │                          │
                ├──────────────────> PAUSED ──> PROCESSING (resume)
                │
                └──────────────────> ERROR
```

- `PENDING`: Message created, waiting for API call
- `PROCESSING`: Active generation in progress
- `SEARCHING`: Web search augmentation in progress
- `SUCCESS`: Generation completed successfully
- `PAUSED`: Generation paused by user
- `ERROR`: Generation failed

---

### MessageBlock

Polymorphic content block within a Message. 11 variants discriminated by `type`.

**Base fields (all variants):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Y | Unique block ID |
| messageId | string | Y | Parent message ID |
| type | MessageBlockType | Y | Discriminator |
| status | MessageBlockStatus | N | Processing status |
| createdAt | string | Y | Creation timestamp |

**State Transitions — MessageBlockStatus:**

```
PENDING ──> PROCESSING ──> STREAMING ──> SUCCESS
                │
                ├──────────────────> ERROR
                │
                └──────────────────> PAUSED
```

#### Variant: MainText

| Field | Type | Description |
|-------|------|-------------|
| type | "main_text" | Discriminator |
| content | string | Markdown text content |

#### Variant: Thinking

| Field | Type | Description |
|-------|------|-------------|
| type | "thinking" | Discriminator |
| content | string | Chain-of-thought text |
| thinking_token_count | number | Tokens used for thinking |

#### Variant: Translation

| Field | Type | Description |
|-------|------|-------------|
| type | "translation" | Discriminator |
| content | string | Translated text |
| targetLanguage | string | Target language code |

#### Variant: Code

| Field | Type | Description |
|-------|------|-------------|
| type | "code" | Discriminator |
| content | string | Code content |
| language | string | Programming language |

#### Variant: Image

| Field | Type | Description |
|-------|------|-------------|
| type | "image" | Discriminator |
| url | string | Image URL or base64 data URI |
| width | number | Image width |
| height | number | Image height |

#### Variant: Tool

| Field | Type | Description |
|-------|------|-------------|
| type | "tool" | Discriminator |
| toolName | string | Tool/function name |
| toolCallId | string | Unique call identifier |
| arguments | string (JSON) | Serialized arguments |
| result | string | Tool execution result |
| serverName | string | MCP server name |

#### Variant: File

| Field | Type | Description |
|-------|------|-------------|
| type | "file" | Discriminator |
| url | string | File URL or path |
| fileName | string | Original filename |
| mimeType | string | MIME type |
| fileSize | number | Size in bytes |

#### Variant: Error

| Field | Type | Description |
|-------|------|-------------|
| type | "error" | Discriminator |
| content | string | Error message |
| code | string | Error code |

#### Variant: Citation

| Field | Type | Description |
|-------|------|-------------|
| type | "citation" | Discriminator |
| content | string | Cited text |
| url | string | Source URL |
| title | string | Source title |

#### Variant: Video

| Field | Type | Description |
|-------|------|-------------|
| type | "video" | Discriminator |
| url | string | Video URL |
| mimeType | string | Video MIME type |
| duration | number | Duration in seconds |

#### Variant: Compact

| Field | Type | Description |
|-------|------|-------------|
| type | "compact" | Discriminator |
| content | string | Collapsed/summarized content |
| expandedContent | string | Full content when expanded |

---

### QuickPhrase

Reusable text snippet for quick input.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| title | string | Y | — | Display label |
| content | string | Y | — | Phrase text to insert |

---

## F002-settings

### SettingsState

Global application settings. Massive singleton state object (~100+ fields).

| Section | Field | Type | Default | Description |
|---------|-------|------|---------|-------------|
| **Theme** | theme | "light" \| "dark" \| "auto" | "auto" | Application theme |
| | customCss | string | "" | User-injected CSS |
| | fontSize | number | 14 | Base font size |
| | fontFamily | string | "" | Custom font family |
| **Display** | showAssistantIcon | boolean | true | Show assistant avatars |
| | showMessageDivider | boolean | true | Divider between messages |
| | messageStyle | "plain" \| "bubble" | "plain" | Message display style |
| | showInputEstimatedTokens | boolean | false | Token estimate in input |
| | sidebarIcons | SidebarIconConfig | defaults | Sidebar icon visibility toggles |
| | topicPosition | "left" \| "right" | "left" | Topic list placement |
| | windowStyle | "transparent" \| "opaque" | "opaque" | Window transparency |
| | mathEngine | "KaTeX" \| "MathJax" | "KaTeX" | Math rendering engine |
| **Code Editor** | codeShowLineNumbers | boolean | true | Line numbers in code blocks |
| | codeCollapsible | boolean | false | Collapsible code blocks |
| | codeWrapping | boolean | false | Code line wrapping |
| | codeEditor | "prism" \| "shiki" | "prism" | Code highlighting engine |
| | codeTheme | string | "auto" | Code block color theme |
| **Export** | markdownExportPath | string | "" | Default markdown export path |
| | exportMenuOptions | ExportOption[] | all | Enabled export formats |
| **API Server** | apiServerEnabled | boolean | false | Enable built-in API server |
| | apiServerPort | number | 39878 | API server port |
| | apiServerApiKey | string | "" | API server authentication key |
| **Notifications** | notificationsEnabled | boolean | true | Enable system notifications |
| | notificationSound | boolean | true | Play notification sounds |
| **Input** | pasteLongTextAsFile | boolean | false | Auto-convert long pastes to file attachment |
| | pasteLongTextThreshold | number | 1500 | Character threshold for long paste detection |
| | sendMessageShortcut | "Enter" \| "Shift+Enter" | "Enter" | Send shortcut key |
| | enableQuickPhrases | boolean | false | Enable / shortcut for quick phrases |
| **Tray** | trayOnClose | boolean | false | Minimize to tray on close |
| | trayOnStart | boolean | false | Start minimized in tray |
| **General** | language | string | "en" | UI language code |
| | proxyUrl | string | "" | HTTP proxy URL |
| | autoCheckUpdate | boolean | true | Auto check for updates |
| | launchOnBoot | boolean | false | Start on system boot |
| | multiModelMessageStyle | "fold" \| "horizontal" \| "vertical" | "fold" | Default multi-model display |
| | gridColumns | number | 2 | Grid layout columns for multi-model |
| | gridPopupColumns | number | 2 | Grid popup columns |
| | autoScrollEnabled | boolean | true | Auto-scroll during generation |
| | renderInputMessageAsMarkdown | boolean | false | Render user input as markdown |
| | preserveLineBreaks | boolean | false | Preserve newlines in rendering |
| | userMessageTimestamp | boolean | false | Show timestamp on user messages |
| | assistantMessageTimestamp | boolean | false | Show timestamp on assistant messages |

**Validation Rules:**
- `fontSize` in range [10, 24]
- `apiServerPort` valid port range [1024, 65535]
- `proxyUrl` valid URL format if non-empty
- `pasteLongTextThreshold` > 0
- `gridColumns` in range [1, 4]

---

### ShortcutsState

Keyboard shortcut configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| shortcuts | Record<string, string> | N | platform defaults | Action-to-keybinding map |

---

### TabsState

Sidebar tab configuration and state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| tabs | TabItem[] | N | default tabs | Ordered tab list |
| activeTab | string | N | "chat" | Currently active tab ID |
| pinnedTabs | string[] | N | [] | Pinned tab IDs |

---

### RuntimeState

Ephemeral application runtime state (not persisted).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| editing | boolean | N | false | Whether editing mode is active |
| generating | boolean | N | false | Whether any generation is in progress |

---

## F007-knowledge

### KnowledgeBase

A collection of documents for RAG (Retrieval-Augmented Generation).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Display name |
| model | string | N | "" | Embedding model ID |
| dimensions | number | N | 0 | Embedding vector dimensions |
| items | KnowledgeItem[] | N | [] | Contained items |
| chunkSize | number | N | 500 | Text chunk size for splitting |
| chunkOverlap | number | N | 50 | Overlap between chunks |
| threshold | number | N | 0.7 | Similarity threshold for retrieval |
| rerankModel | string | N | "" | Reranking model ID |
| topK | number | N | 5 | Number of results to retrieve |

**Relationships:**
- KnowledgeBase 1:N KnowledgeItem (owns)
- KnowledgeBase N:N Assistant (linked)

**Validation Rules:**
- `name` non-empty
- `chunkSize` > 0
- `chunkOverlap` >= 0 and < `chunkSize`
- `threshold` in range [0, 1]
- `topK` > 0
- `dimensions` > 0 if model is set

---

### KnowledgeItem

A single document/resource within a knowledge base.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| baseId | string | Y | — | Parent knowledge base ID |
| type | "file" \| "url" \| "note" \| "sitemap" | Y | — | Source type |
| content | string | N | "" | Raw text content |
| fileName | string | N | "" | Original filename (for file type) |
| url | string | N | "" | Source URL (for url/sitemap type) |
| processingStatus | ProcessingStatus | N | "pending" | Ingestion status |
| uniqueId | string | N | "" | Deduplication key |
| uniquePopulatedAt | string | N | "" | When dedup was applied |
| chunkCount | number | N | 0 | Number of chunks generated |

**State Transitions — ProcessingStatus:**

```
pending ──> processing ──> completed
                │
                └──────> failed
```

- `pending`: Item added, not yet processed
- `processing`: Embedding generation in progress
- `completed`: Successfully indexed
- `failed`: Processing error occurred

**Relationships:**
- KnowledgeItem N:1 KnowledgeBase (belongs to)

**Validation Rules:**
- `baseId` must reference existing KnowledgeBase
- `url` required when type is "url" or "sitemap"
- `content` or `fileName` required when type is "file"

---

### KnowledgeNoteItem

A user-authored note stored in a knowledge base.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| baseId | string | Y | — | Parent knowledge base ID |
| title | string | N | "" | Note title |
| content | string | Y | — | Note body (markdown) |
| createdAt | string | Y | now() | Creation timestamp |
| updatedAt | string | Y | now() | Last update timestamp |

**Relationships:**
- KnowledgeNoteItem N:1 KnowledgeBase (belongs to)

---

## F008-mcp

### MCPServer

MCP (Model Context Protocol) server configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Display name |
| type | "stdio" \| "sse" \| "streamable-http" \| "inMemory" | Y | — | Transport type |
| command | string | N | "" | Executable command (stdio type) |
| args | string[] | N | [] | Command arguments (stdio type) |
| env | Record<string, string> | N | {} | Environment variables (stdio type) |
| baseUrl | string | N | "" | Server URL (sse/streamable-http type) |
| isActive | boolean | N | true | Whether server is enabled |
| isTrusted | boolean | N | false | Trusted for auto-approval |
| disabledTools | string[] | N | [] | Explicitly disabled tool names |
| description | string | N | "" | Server description |
| registryUrl | string | N | "" | Source registry URL |
| headers | Record<string, string> | N | {} | Custom HTTP headers (sse/http type) |
| timeout | number | N | 60000 | Connection timeout (ms) |
| autoApprove | string[] | N | [] | Tools approved for auto-execution |
| provider | string | N | "" | Provider identifier |

**Relationships:**
- MCPServer N:N Assistant (linked)

**Validation Rules:**
- `command` required when type is "stdio"
- `baseUrl` required when type is "sse" or "streamable-http"
- `baseUrl` must be valid URL if provided
- `timeout` > 0

---

## F009-web-search

### WebSearchProvider

Configuration for a web search provider.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | — | Provider identifier (e.g., "google", "bing", "tavily") |
| name | string | Y | — | Display name |
| apiKey | string | N | "" | API authentication key |
| apiHost | string | N | "" | Custom API host |
| engines | string[] | N | [] | Search engine selection |
| url | string | N | "" | Custom search endpoint URL |

**Relationships:**
- WebSearchProvider referenced by SettingsState (active search provider)

---

### WebSearchState

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| provider | string | N | "" | Active search provider ID |
| providers | WebSearchProvider[] | N | [] | Configured providers |
| maxResults | number | N | 5 | Maximum search results |
| contentMaxLength | number | N | 5000 | Max characters per search result |
| excludeDomains | string[] | N | [] | Domains to exclude |
| searchWithTime | boolean | N | false | Include time-filtered results |
| overrideAssistantWebSearch | boolean | N | false | Override assistant-level setting |

---

## F010-backup-sync

### BackupState

State for backup and sync operations.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| webdavSync | SyncConfig | N | defaults | WebDAV sync configuration |
| s3Sync | SyncConfig | N | defaults | S3-compatible sync configuration |
| localBackupSync | SyncConfig | N | defaults | Local backup configuration |

**SyncConfig:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Whether sync is active |
| lastSyncTime | string \| null | N | null | Last successful sync ISO timestamp |
| syncing | boolean | N | false | Whether sync is in progress |
| error | string \| null | N | null | Last sync error message |
| interval | number | N | 0 | Auto-sync interval (minutes, 0 = manual) |
| url | string | N | "" | Server URL (WebDAV/S3) |
| username | string | N | "" | Authentication username |
| password | string | N | "" | Authentication password |
| path | string | N | "" | Remote path / local directory |
| bucket | string | N | "" | S3 bucket name |
| region | string | N | "" | S3 region |
| accessKeyId | string | N | "" | S3 access key |
| secretAccessKey | string | N | "" | S3 secret key |

---

### NutstoreState

Nutstore (jianguoyun) specific sync state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Whether Nutstore sync is active |
| account | string | N | "" | Nutstore account email |
| token | string | N | "" | Nutstore application token |
| lastSyncTime | string \| null | N | null | Last successful sync timestamp |
| syncing | boolean | N | false | Whether sync is in progress |

---

## F011-notes

### NotesTreeNode

Tree node representing notes folder/file structure.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Display name |
| type | "folder" \| "note" | Y | — | Node type |
| treePath | string | Y | — | Full path in tree (e.g., "root/folder1/note1") |
| children | NotesTreeNode[] | N | [] | Child nodes (folder type only) |
| isStarred | boolean | N | false | Starred/favorited |
| content | string | N | "" | Note content (note type only, markdown) |
| createdAt | string | Y | now() | Creation timestamp |
| updatedAt | string | Y | now() | Last update timestamp |

**Relationships:**
- NotesTreeNode 1:N NotesTreeNode (parent-child, folder type)

**Validation Rules:**
- `children` only populated when type is "folder"
- `content` only meaningful when type is "note"
- `treePath` must be unique within the tree
- `name` non-empty

---

### NoteState

Top-level notes state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| tree | NotesTreeNode[] | N | [] | Root-level tree nodes |
| activeNoteId | string \| null | N | null | Currently selected note ID |
| expandedFolders | string[] | N | [] | IDs of expanded folder nodes |

---

## F012-translate

### TranslateHistory

A saved translation record.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| sourceText | string | Y | — | Original text |
| targetText | string | Y | — | Translated text |
| sourceLanguage | string | Y | — | Source language code |
| targetLanguage | string | Y | — | Target language code |
| star | boolean | N | false | Starred/favorited |
| createdAt | string | Y | now() | Creation timestamp |

---

### CustomTranslateLanguage

User-defined translation language option.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| name | string | Y | — | Language display name |
| code | string | Y | — | Language code |
| prompt | string | N | "" | Custom translation prompt |

**Validation Rules:**
- `name` non-empty
- `code` non-empty

---

## F013-agent

### Agent (Drizzle ORM)

Agent entity for the API server, stored via Drizzle ORM in SQLite.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier (primary key) |
| type | string | N | "assistant" | Agent type |
| name | string | Y | — | Display name |
| model | string | N | "" | Default model identifier |
| mcps | string (JSON) | N | "[]" | Serialized MCP server config |
| configuration | string (JSON) | N | "{}" | Serialized agent configuration |
| createdAt | string | Y | now() | Creation timestamp |
| updatedAt | string | Y | now() | Last update timestamp |

**Relationships:**
- Agent 1:N Session (owns)

---

### Session (Drizzle ORM)

Conversation session within an agent context.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier (primary key) |
| agent_id | string | Y | — | Parent agent ID (FK) |
| name | string | N | "New Session" | Display name |
| model | string | N | "" | Model override for session |
| createdAt | string | Y | now() | Creation timestamp |
| updatedAt | string | Y | now() | Last update timestamp |

**Relationships:**
- Session N:1 Agent (belongs to, cascade delete)
- Session 1:N SessionMessage (owns)

---

### SessionMessage (Drizzle ORM)

A message within an agent session.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier (primary key) |
| session_id | string | Y | — | Parent session ID (FK) |
| role | "user" \| "assistant" \| "system" | Y | — | Message sender role |
| content | string | Y | "" | Message content |
| metadata | string (JSON) | N | "{}" | Serialized metadata (model, tokens, etc.) |
| createdAt | string | Y | now() | Creation timestamp |

**Relationships:**
- SessionMessage N:1 Session (belongs to, cascade delete)

---

## F014-extras

### PaintingsState

State for AI image generation across multiple providers.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| openaiPaintings | PaintingRecord[] | N | [] | OpenAI (DALL-E) generations |
| siliconflowPaintings | PaintingRecord[] | N | [] | SiliconFlow generations |
| dmxapiPaintings | PaintingRecord[] | N | [] | DMXAPI generations |
| aihubmixPaintings | PaintingRecord[] | N | [] | AIHubMix generations |
| ideogramPaintings | PaintingRecord[] | N | [] | Ideogram generations |
| fluxPaintings | PaintingRecord[] | N | [] | Flux generations |
| recraftPaintings | PaintingRecord[] | N | [] | Recraft generations |
| zhipuPaintings | PaintingRecord[] | N | [] | ZhiPu generations |
| geminiPaintings | PaintingRecord[] | N | [] | Gemini generations |
| stabilityPaintings | PaintingRecord[] | N | [] | Stability AI generations |
| doubaoAPIPaintings | PaintingRecord[] | N | [] | Doubao API generations |
| comfyuiPaintings | PaintingRecord[] | N | [] | ComfyUI generations |
| ollamaPaintings | PaintingRecord[] | N | [] | Ollama generations |
| anthropicPaintings | PaintingRecord[] | N | [] | Anthropic generations |

---

### MinAppType

Mini-app embedded in the application.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | — | Unique identifier |
| name | string | Y | — | App display name |
| url | string | Y | — | App URL |
| icon | string | N | "" | Icon URL |
| logo | string | N | "" | Logo URL |
| booted | boolean | N | false | Whether app has been initialized |

---

### MemoryItem

Long-term memory entry for context retention.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| content | string | Y | — | Memory content text |
| createdAt | string | Y | now() | Creation timestamp |

---

### MemoryHistoryItem

History of memory operations.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Y | uuid() | Unique identifier |
| action | "add" \| "update" \| "delete" | Y | — | Operation type |
| memoryId | string | Y | — | Target memory item ID |
| content | string | Y | — | Content at time of operation |
| timestamp | string | Y | now() | Operation timestamp |

---

### CopilotState

Copilot feature state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Copilot active |
| model | string | N | "" | Model for copilot suggestions |
| triggerMode | "auto" \| "manual" | N | "manual" | When to trigger suggestions |

---

### OcrState

OCR (Optical Character Recognition) state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | OCR active |
| model | string | N | "" | Model for OCR |
| language | string | N | "en" | Target language |

---

### PreprocessState

Message preprocessing configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Preprocessing active |
| model | string | N | "" | Model for preprocessing |
| prompt | string | N | "" | Preprocessing system prompt |

---

### OpenClawState

OpenClaw integration state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| gatewayStatus | GatewayStatus | N | "stopped" | Gateway connection status |
| gatewayUrl | string | N | "" | Gateway URL |
| apiKey | string | N | "" | Authentication key |

**State Transitions — GatewayStatus:**

```
stopped ──> starting ──> running
                │
                └──────> error ──> stopped (reset)
```

---

### SelectionState

Text selection action state.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Selection actions active |
| actions | SelectionAction[] | N | [] | Available actions on text selection |

---

### ToolPermissionsState

MCP tool execution permission configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| mode | "always_ask" \| "auto_approve" \| "per_tool" | N | "always_ask" | Permission mode |
| approvedTools | string[] | N | [] | Auto-approved tool identifiers |
| deniedTools | string[] | N | [] | Permanently denied tool identifiers |

---

### CodeToolsState

Developer/code tool configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | N | false | Code tools active |
| sandboxEnabled | boolean | N | true | Run code in sandbox |
| autoRun | boolean | N | false | Auto-execute code blocks |

---

### InputToolsState

Input enhancement tools configuration.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| speechToText | SpeechConfig | N | defaults | Speech-to-text settings |
| textToSpeech | SpeechConfig | N | defaults | Text-to-speech settings |

**SpeechConfig:**

| Field | Type | Description |
|-------|------|-------------|
| enabled | boolean | Whether feature is active |
| model | string | Model/service identifier |
| language | string | Language code |
