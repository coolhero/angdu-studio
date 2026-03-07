# Entity Registry -- Cherry Studio Reverse-Spec

| Key        | Value                                        |
|------------|----------------------------------------------|
| Source     | `/Users/coolhero/Study/oss/cherry-studio`    |
| Generated  | 2026-03-04                                   |
| Total Entities | ~60                                      |
| Method     | Static analysis of TypeScript types, Drizzle schemas, Redux slices |

---

## Entity Index

| # | Entity | Owner Feature | Referencing Features | Fields | Relationships |
|---|--------|---------------|----------------------|--------|---------------|
| 1 | FileMetadata | F001-core-platform | F005, F004, F010 | 11 | -> KnowledgeItem, MessageBlock |
| 2 | Provider | F002-provider-management | F005, F004, F006 | ~18 | 1:N Model |
| 3 | Model | F002-provider-management | F005, F004, F010, F011 | ~16 | N:1 Provider, N:M Assistant |
| 4 | ModelCapability (enum) | F002-provider-management | F005, F010 | 8 values | -- |
| 5 | ProviderType (enum) | F002-provider-management | F005, F008 | ~30 values | -- |
| 6 | EndpointType (enum) | F002-provider-management | F005 | 3 values | -- |
| 7 | Assistant | F005-ai-chat | F004, F006, F008, F011 | ~22 | 1:N Topic, N:M KnowledgeBase, N:M MCPServer |
| 8 | AssistantSettings | F005-ai-chat | F008 | ~30 | 1:1 Assistant |
| 9 | Topic | F005-ai-chat | F004, F011 | ~10 | N:1 Assistant, 1:N Message |
| 10 | TopicType (enum) | F005-ai-chat | -- | 3 values | -- |
| 11 | Message | F005-ai-chat | F004, F011 | ~14 | N:1 Topic, 1:N MessageBlock |
| 12 | MessageBlock | F005-ai-chat | F004, F006, F010 | ~8 base + variant | N:1 Message |
| 13 | MessageBlockType (enum) | F005-ai-chat | -- | ~11 values | -- |
| 14 | MessageBlockStatus (state machine) | F005-ai-chat | -- | 5 states | -- |
| 15 | AssistantMessageStatus (state machine) | F005-ai-chat | -- | 5 states | -- |
| 16 | MessageRole (enum) | F005-ai-chat | F012 | 3 values | -- |
| 17 | QuickPhrase | F005-ai-chat | F008 | 3 | -- |
| 18 | ChatUsage | F005-ai-chat | -- | 4 | 1:1 Message |
| 19 | ChatMetrics | F005-ai-chat | -- | 4 | 1:1 Message |
| 20 | KnowledgeBase | F004-knowledge-base | F005 | ~10 | 1:N KnowledgeItem, N:M Assistant |
| 21 | KnowledgeItem | F004-knowledge-base | F005 | ~8 | N:1 KnowledgeBase |
| 22 | KnowledgeItemType (enum) | F004-knowledge-base | -- | 4 values | -- |
| 23 | KnowledgeReference | F004-knowledge-base | F005 | 4 | N:1 MessageBlock |
| 24 | PreprocessProvider | F004-knowledge-base | F008 | 3 | -- |
| 25 | ProcessingStatus (state machine) | F004-knowledge-base | -- | 4 states | -- |
| 26 | MCPServer | F006-mcp-integration | F005, F008 | ~12 | 1:N MCPTool, N:M Assistant |
| 27 | MCPTool | F006-mcp-integration | F005 | ~6 | N:1 MCPServer |
| 28 | MCPPrompt | F006-mcp-integration | -- | 4 | N:1 MCPServer |
| 29 | MCPResource | F006-mcp-integration | -- | 4 | N:1 MCPServer |
| 30 | McpServerType (enum) | F006-mcp-integration | -- | 4 values | -- |
| 31 | BackupV1-V5 (format versions) | F007-backup-sync | F008 | varies | -- |
| 32 | SettingsState | F008-settings-ui | all features | ~100+ | -> Model, Provider, etc. |
| 33 | Shortcut | F008-settings-ui | F001 | 5 | -- |
| 34 | ThemeMode (enum) | F008-settings-ui | -- | 3 values | -- |
| 35 | Language (enum) | F008-settings-ui | -- | ~20 values | -- |
| 36 | NotesTreeNode | F009-notes-editor | -- | ~8 | self-referential tree |
| 37 | WebSearchProvider | F010-auxiliary-features | F005, F008 | ~6 | -- |
| 38 | TranslateHistory | F010-auxiliary-features | -- | 5 | -- |
| 39 | CustomTranslateLanguage | F010-auxiliary-features | -- | 3 | -- |
| 40 | MinAppType | F010-auxiliary-features | -- | 4 | -- |
| 41 | Painting | F010-auxiliary-features | -- | ~8 | -- |
| 42 | GeneratePainting | F010-auxiliary-features | -- | ~10 | extends Painting |
| 43 | EditPainting | F010-auxiliary-features | -- | ~12 | extends Painting |
| 44 | FileType (enum) | F001-core-platform | F004, F005, F010 | ~8 values | -- |
| 45 | MemoryItem | F011-memory-system | F005 | ~5 | -- |
| 46 | MemoryHistoryItem | F011-memory-system | -- | ~6 | -> MemoryItem |
| 47 | MemoryConfig | F011-memory-system | F008 | ~5 | -- |
| 48 | MemoryAction (enum / state) | F011-memory-system | -- | 3 values | -- |
| 49 | Agent (Drizzle) | F012-agent-framework | -- | ~8 | 1:N Session |
| 50 | Session (Drizzle) | F012-agent-framework | -- | ~7 | N:1 Agent, 1:N SessionMessage |
| 51 | SessionMessage (Drizzle) | F012-agent-framework | -- | ~8 | N:1 Session |
| 52 | PluginMetadata | F012-agent-framework | -- | ~6 | -> Agent |
| 53 | PluginManifest | F012-agent-framework | -- | ~8 | -> PluginMetadata |
| 54 | WebDavConfig | F007-backup-sync | F008 | 4 | -- |
| 55 | NutstoreConfig | F007-backup-sync | F008 | 3 | -- |
| 56 | ObsidianConfig | F007-backup-sync | F008 | 3 | -- |
| 57 | SelectionAction (enum) | F010-auxiliary-features | -- | ~6 values | -- |
| 58 | CodeToolResult | F010-auxiliary-features | F005 | 4 | -- |
| 59 | OVMSModel | F010-auxiliary-features | F008 | ~6 | -- |
| 60 | AnalyticsEvent | F001-core-platform | -- | 3 | -- |

---

## Enumerations

### ProviderType (F002)

```typescript
enum ProviderType {
  openai        = 'openai'
  anthropic     = 'anthropic'
  gemini        = 'gemini'
  azure_openai  = 'azure-openai'
  ollama        = 'ollama'
  lmstudio      = 'lm-studio'
  groq          = 'groq'
  mistral       = 'mistral'
  deepseek      = 'deepseek'
  zhipu         = 'zhipu'
  silicon       = 'silicon'
  moonshot       = 'moonshot'
  baichuan      = 'baichuan'
  dashscope     = 'dashscope'
  stepfun       = 'stepfun'
  doubao        = 'doubao'
  minimax       = 'minimax'
  yi            = 'yi'
  github        = 'github'
  openrouter    = 'openrouter'
  together      = 'together'
  fireworks     = 'fireworks'
  grok          = 'grok'
  vertex_ai     = 'vertex-ai'
  aihubmix      = 'aihubmix'
  jina          = 'jina'
  pplx          = 'pplx'
  hunyuan       = 'hunyuan'
  spark         = 'spark'
  // ... additional custom providers
}
```

### EndpointType (F002)

```typescript
enum EndpointType {
  openai    = 'openai'     // OpenAI-compatible /v1/chat/completions
  anthropic = 'anthropic'  // Anthropic /v1/messages
  gemini    = 'gemini'     // Google Gemini generateContent
}
```

### ModelCapability (F002)

```typescript
enum ModelCapability {
  vision       // image input
  function_calling  // tool/function use
  reasoning    // extended thinking / CoT
  web_search   // built-in web search
  computer_use // computer-use tool
  file_upload  // file attachment
  video        // video input
  realtime     // streaming realtime
}
```

### FileType (F001)

```typescript
enum FileType {
  image    = 'image'
  video    = 'video'
  audio    = 'audio'
  document = 'document'
  text     = 'text'
  code     = 'code'
  other    = 'other'
  archive  = 'archive'
}
```

### KnowledgeItemType (F004)

```typescript
enum KnowledgeItemType {
  file    = 'file'
  url     = 'url'
  note    = 'note'
  sitemap = 'sitemap'
}
```

### McpServerType (F006)

```typescript
enum McpServerType {
  stdio     = 'stdio'
  sse       = 'sse'
  streamable_http = 'streamable-http'
  inMemory  = 'inMemory'
}
```

### TopicType (F005)

```typescript
enum TopicType {
  chat      = 'chat'       // standard conversation
  group     = 'group'      // multi-assistant group chat
  default   = 'default'    // initial/system topic
}
```

### MessageBlockType (F005)

```typescript
enum MessageBlockType {
  main_text    = 'main_text'
  thinking     = 'thinking'
  translation  = 'translation'
  code         = 'code'
  image        = 'image'
  tool         = 'tool'
  file         = 'file'
  citation     = 'citation'
  video        = 'video'
  error        = 'error'
  compact      = 'compact'
}
```

### MessageRole (F005)

```typescript
enum MessageRole {
  user      = 'user'
  assistant = 'assistant'
  system    = 'system'
}
```

### ThemeMode (F008)

```typescript
enum ThemeMode {
  light  = 'light'
  dark   = 'dark'
  auto   = 'auto'
}
```

### SelectionAction (F010)

```typescript
enum SelectionAction {
  translate  = 'translate'
  summary    = 'summary'
  explain    = 'explain'
  improve    = 'improve'
  expand     = 'expand'
  custom     = 'custom'
}
```

### MemoryAction (F011)

```typescript
enum MemoryAction {
  ADD    = 'ADD'
  UPDATE = 'UPDATE'
  DELETE = 'DELETE'
}
```

---

## Detailed Entity Definitions

---

### F001-core-platform

#### 1. FileMetadata

Represents any file managed by the application (uploads, attachments, knowledge docs).

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique file identifier |
| name | string | required | Display name of the file |
| origin_name | string | required | Original filename before any processing |
| path | string | required | Absolute path on the local filesystem |
| size | number | >= 0 | File size in bytes |
| ext | string | required | File extension (e.g., `.pdf`, `.png`) |
| type | FileType | enum, required | Category of file (image, document, etc.) |
| created_at | number | timestamp | Unix epoch ms of creation |
| count | number | >= 0 | Word/character count (for text-based files) |
| tokens | number | >= 0 | Token count (used for LLM context estimation) |
| purpose | string | optional | Intended use: `knowledge`, `attachment`, `avatar`, etc. |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| referenced by | KnowledgeItem | N:1 | A knowledge item wraps a FileMetadata |
| referenced by | MessageBlock (file) | N:1 | File blocks in messages reference files |
| referenced by | MessageBlock (image) | N:1 | Image blocks reference image files |

---

#### 2. AnalyticsEvent

Lightweight telemetry event (opt-in).

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| event | string | required | Event name |
| properties | Record<string, any> | optional | Arbitrary key-value payload |
| timestamp | number | auto | Unix epoch ms |

---

### F002-provider-management

#### 3. Provider

An AI provider configuration (e.g., OpenAI, Anthropic, Ollama).

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique provider identifier |
| type | ProviderType | enum, required | Vendor type |
| name | string | required | User-visible display name |
| apiKey | string | optional, encrypted | API key / token |
| apiHost | string | URL | Base URL for API calls |
| models | Model[] | embedded array | Available models for this provider |
| enabled | boolean | default: true | Whether provider is active |
| isSystem | boolean | default: false | Whether provider is built-in (non-deletable) |
| rateLimit | number | optional, >= 0 | Max concurrent requests |
| apiVersion | string | optional | API version string (e.g., for Azure) |
| providerOrder | number | optional | Sort order in UI |
| headers | Record<string, string> | optional | Custom HTTP headers |
| apiOptions | object | optional | Provider-specific options |
| logo | string | optional | URL or path to provider logo |
| organization | string | optional | Org identifier (OpenAI) |
| project | string | optional | Project identifier (OpenAI, Vertex) |
| region | string | optional | Cloud region (Vertex AI, Azure) |
| serviceAccountKey | string | optional, encrypted | GCP service account JSON (Vertex AI) |
| customProviderUrl | string | optional | Custom endpoint URL for custom providers |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| has | Model | 1:N | Each provider owns zero or more models |
| referenced by | SettingsState | N:1 | Default provider selections in settings |

**Validation Rules:**

- `apiKey` is required for all types except `ollama` and `lmstudio`
- `apiHost` must be a valid URL when present
- `rateLimit`, if set, must be a positive integer
- System providers (`isSystem = true`) cannot be deleted by the user

---

#### 4. Model

A specific AI model within a provider.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, composite (provider + model id) | Model identifier (e.g., `gpt-4o`) |
| provider | string | FK -> Provider.id | Owning provider |
| name | string | required | Display name |
| group | string | optional | Model family/group for UI grouping |
| capabilities | ModelCapability[] | array of enum | What the model can do |
| pricing | object | optional | `{ input: number, output: number }` per 1M tokens |
| endpoint_type | EndpointType | enum | Which wire protocol to use |
| maxTokens | number | optional, > 0 | Maximum output tokens |
| contextWindow | number | optional, > 0 | Context window size in tokens |
| temperature | number | optional, 0-2 | Default temperature |
| enabled | boolean | default: true | Whether model is selectable |
| isCustom | boolean | default: false | Whether user-defined |
| vision | boolean | computed | Shorthand for capabilities includes `vision` |
| functionCalling | boolean | computed | Shorthand for capabilities includes `function_calling` |
| reasoning | boolean | computed | Shorthand for capabilities includes `reasoning` |
| order | number | optional | Sort position |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Provider | N:1 | Every model belongs to one provider |
| used by | Assistant | N:M | Assistants select a default model |
| used by | KnowledgeBase | N:1 | KB embedding model |
| used by | SettingsState | N:1 | Default models for various features |

---

### F005-ai-chat

#### 5. Assistant

A configured chat persona with its own system prompt, model, and tool bindings.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique assistant identifier |
| name | string | required | Display name |
| prompt | string | required (may be empty string) | System prompt text |
| topics | Topic[] | embedded / FK array | Conversation threads belonging to this assistant |
| model | Model | FK reference | Default model for new conversations |
| settings | AssistantSettings | embedded | Generation parameters |
| knowledge_bases | string[] | FK[] -> KnowledgeBase.id | Linked knowledge bases |
| mcpServers | string[] | FK[] -> MCPServer.id | Active MCP server bindings |
| emoji | string | optional | Avatar emoji |
| description | string | optional | Short description text |
| type | string | optional | `assistant` or `agent` |
| group | string[] | optional | Tags / folder path for organizing |
| isDefault | boolean | default: false | Whether this is the default assistant |
| isSystem | boolean | default: false | Non-deletable built-in |
| hideContext | boolean | default: false | Whether to hide context messages in UI |
| enableWebSearch | boolean | default: false | Enable web search for this assistant |
| enableMemory | boolean | default: false | Enable memory system |
| enableGenerateTitle | boolean | default: true | Auto-generate topic titles |
| enablePlugins | boolean | default: false | Enable MCP plugins |
| created_at | number | timestamp | Creation time |
| updated_at | number | timestamp | Last modification time |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| has | Topic | 1:N | Owns conversation topics |
| uses | Model | N:1 | Default model binding |
| uses | KnowledgeBase | N:M | Linked knowledge bases |
| uses | MCPServer | N:M | Linked MCP server integrations |
| has | AssistantSettings | 1:1 | Embedded generation config |

---

#### 6. AssistantSettings

Generation and behavior parameters for an Assistant.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| temperature | number | 0-2, optional | Sampling temperature |
| topP | number | 0-1, optional | Nucleus sampling |
| topK | number | >= 0, optional | Top-K sampling |
| maxTokens | number | > 0, optional | Max output tokens |
| contextCount | number | >= 0, optional | Number of prior messages to include |
| frequencyPenalty | number | -2 to 2, optional | Frequency penalty |
| presencePenalty | number | -2 to 2, optional | Presence penalty |
| repetitionPenalty | number | optional | Repetition penalty (Ollama) |
| seed | number | optional | Deterministic seed |
| streamOutput | boolean | default: true | Whether to stream responses |
| enableThinking | boolean | default: false | Enable extended thinking |
| thinkingBudget | number | optional, > 0 | Token budget for thinking |
| customParameters | Record<string, any> | optional | Arbitrary vendor-specific params |
| autoResetModel | boolean | default: false | Reset model between topics |
| defaultModel | string | optional | Override default model |
| keepAlive | string | optional | Ollama keep-alive duration |
| responseFormat | string | optional | `text` or `json_object` |
| stop | string[] | optional | Stop sequences |
| enableReasoning | boolean | default: false | Enable reasoning mode |
| reasoningEffort | string | optional | `low`, `medium`, `high` |
| enableMaxTokens | boolean | default: false | Whether maxTokens is enforced |
| uploadFileStrategy | string | optional | `file` or `base64` |

---

#### 7. Topic

A conversation thread within an assistant.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique topic identifier |
| type | TopicType | enum, default: `chat` | Topic variant |
| assistantId | string | FK -> Assistant.id | Owning assistant |
| name | string | required | Topic title (auto-generated or manual) |
| messages | Message[] | FK array | Ordered messages in this conversation |
| pinned | boolean | default: false | Whether pinned to top of list |
| prompt | string | optional | Topic-level system prompt override |
| createdAt | number | timestamp | Creation time |
| updatedAt | number | timestamp | Last message time |
| isStarred | boolean | default: false | Starred/favorited |
| members | string[] | optional (group type) | Assistant IDs participating in group chat |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Assistant | N:1 | Every topic belongs to one assistant |
| has | Message | 1:N | Ordered sequence of messages |

---

#### 8. Message

A single message in a conversation.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique message identifier |
| role | MessageRole | enum, required | `user`, `assistant`, or `system` |
| assistantId | string | FK -> Assistant.id | Originating assistant |
| topicId | string | FK -> Topic.id | Parent topic |
| status | AssistantMessageStatus | enum | Current processing state (assistant msgs) |
| blocks | MessageBlock[] | embedded array | Content blocks composing this message |
| usage | ChatUsage | embedded, optional | Token usage statistics |
| metrics | ChatMetrics | embedded, optional | Performance metrics |
| modelId | string | optional | Specific model used for generation |
| model | Model | optional, denormalized | Model snapshot at time of generation |
| knowledgeBaseIds | string[] | optional | KB IDs queried for this message |
| pluginId | string | optional | MCP plugin ID if tool-generated |
| mentions | string[] | optional | @-mentioned assistant IDs (group chat) |
| useful | boolean | optional | User feedback: thumbs up |
| askId | string | optional | Links response to its request message |
| multiModelMessages | Message[] | optional | Parallel model comparison results |
| createdAt | number | timestamp | Creation time |
| type | TopicType | optional | Inherited from parent topic |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Topic | N:1 | Every message belongs to one topic |
| has | MessageBlock | 1:N | Content is decomposed into blocks |
| references | Model | N:1 | Which model generated this |
| links to | Message (askId) | 1:1 | Response links back to the user request |

---

#### 9. MessageBlock (union type)

A content block within a message. This is a discriminated union on `type`.

**Base Fields (all variants):**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Block identifier |
| messageId | string | FK -> Message.id | Parent message |
| type | MessageBlockType | enum, discriminator | Block variant |
| status | MessageBlockStatus | enum | Processing state |
| createdAt | number | timestamp | Creation time |

**Variant: MainText**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | The text content (markdown) |
| citations | KnowledgeReference[] | optional | Knowledge base citations |

**Variant: Thinking**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | Thinking / chain-of-thought text |
| thinking | string | optional | Raw thinking content |

**Variant: Translation**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | Translated text |
| language | string | required | Target language code |

**Variant: Code**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | Code content |
| language | string | optional | Programming language |

**Variant: Image**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| url | string | optional | Remote image URL |
| file | FileMetadata | optional | Local file reference |
| base64 | string | optional | Base64-encoded image data |
| mimeType | string | optional | Image MIME type |

**Variant: Tool**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| toolName | string | required | MCP tool name |
| toolCallId | string | required | Unique call identifier |
| toolInput | object | required | Input arguments |
| toolOutput | string | optional | Serialized result |
| serverId | string | optional | FK -> MCPServer.id |

**Variant: File**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| file | FileMetadata | required | The attached file |
| url | string | optional | Download URL |

**Variant: Citation**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| citations | KnowledgeReference[] | required | Referenced knowledge chunks |

**Variant: Video**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| url | string | required | Video URL |
| thumbnail | string | optional | Thumbnail URL |

**Variant: Error**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | Error message text |
| code | string | optional | Error code |

**Variant: Compact**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| content | string | required | Compressed/summarized content |
| originalBlockIds | string[] | optional | IDs of blocks that were compacted |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Message | N:1 | Every block belongs to one message |
| references | MCPServer (tool variant) | N:1 | Tool blocks reference the server |
| references | FileMetadata (file/image) | N:1 | File-bearing blocks reference files |
| references | KnowledgeReference (citation) | 1:N | Citation blocks contain references |

---

#### 10. ChatUsage

Token consumption for a single message generation.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| prompt_tokens | number | >= 0 | Input tokens consumed |
| completion_tokens | number | >= 0 | Output tokens generated |
| total_tokens | number | >= 0 | Sum of input + output |
| thoughts_tokens | number | >= 0, optional | Tokens used in thinking/reasoning |

---

#### 11. ChatMetrics

Performance measurements for a single generation.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| time_first_token_ms | number | >= 0 | Time to first token (TTFT) in ms |
| time_completion_ms | number | >= 0 | Total completion time in ms |
| tokens_per_second | number | >= 0 | Generation speed |
| latency_ms | number | >= 0 | Round-trip latency |

---

#### 12. QuickPhrase

A user-defined text snippet for rapid insertion.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Identifier |
| title | string | required | Display label |
| content | string | required | The phrase text to insert |

---

### F004-knowledge-base

#### 13. KnowledgeBase

A collection of documents for RAG retrieval.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique KB identifier |
| name | string | required | Display name |
| model | string | FK -> Model.id | Embedding model used |
| items | KnowledgeItem[] | embedded / FK array | Documents in this KB |
| chunkSize | number | > 0, default: 500 | Text chunk size for splitting |
| chunkOverlap | number | >= 0, default: 50 | Overlap between chunks |
| threshold | number | 0-1, default: 0.7 | Similarity threshold for retrieval |
| rerankModel | string | optional, FK -> Model.id | Re-ranking model |
| topK | number | > 0, default: 5 | Number of chunks to retrieve |
| description | string | optional | Description text |
| createdAt | number | timestamp | Creation time |
| updatedAt | number | timestamp | Last modification time |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| has | KnowledgeItem | 1:N | Contains knowledge items |
| uses | Model (embedding) | N:1 | Embedding model |
| uses | Model (rerank) | N:1 | Optional reranking model |
| used by | Assistant | N:M | Assistants link to KBs |

---

#### 14. KnowledgeItem

A single document or resource within a knowledge base.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique item identifier |
| baseId | string | FK -> KnowledgeBase.id | Parent knowledge base |
| type | KnowledgeItemType | enum, required | Source type (file, url, note, sitemap) |
| content | string | optional | Raw text content (for note/url types) |
| processingStatus | ProcessingStatus | enum | Current indexing state |
| file | FileMetadata | optional | Associated file (for file type) |
| url | string | optional | Source URL (for url type) |
| uniqueId | string | optional | Deduplication key |
| createdAt | number | timestamp | Creation time |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | KnowledgeBase | N:1 | Every item belongs to one KB |
| references | FileMetadata | N:1 | File-type items reference a file |

---

#### 15. KnowledgeReference

A citation linking a message back to a knowledge chunk.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Reference identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase.id | Source KB |
| content | string | required | The retrieved chunk text |
| score | number | 0-1 | Similarity score |

---

#### 16. PreprocessProvider

Configuration for a knowledge preprocessing backend.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Provider identifier |
| name | string | required | Display name |
| apiUrl | string | URL, required | Preprocessing service endpoint |

---

### F006-mcp-integration

#### 17. MCPServer

An MCP (Model Context Protocol) server configuration.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Unique server identifier |
| name | string | required | Display name |
| type | McpServerType | enum, required | Transport type: stdio, sse, streamable-http, inMemory |
| command | string | required (stdio) | Executable command |
| args | string[] | optional | Command-line arguments |
| env | Record<string, string> | optional | Environment variables |
| isActive | boolean | default: false | Whether the server process is running |
| disabledTools | string[] | optional | Tool names to suppress |
| baseUrl | string | optional (sse/http) | HTTP endpoint URL |
| description | string | optional | Server description |
| registryId | string | optional | Registry identifier for marketplace servers |
| logoUrl | string | optional | Server icon URL |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| has | MCPTool | 1:N | Tools exposed by this server |
| has | MCPPrompt | 1:N | Prompts exposed by this server |
| has | MCPResource | 1:N | Resources exposed by this server |
| used by | Assistant | N:M | Assistants bind MCP servers |

---

#### 18. MCPTool

A tool exposed by an MCP server.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Tool identifier |
| serverId | string | FK -> MCPServer.id | Owning server |
| name | string | required | Tool name (invocation key) |
| description | string | optional | Human-readable description |
| inputSchema | JSONSchema | required | JSON Schema for tool input parameters |
| annotations | object | optional | MCP tool annotations (readOnlyHint, etc.) |

---

#### 19. MCPPrompt

A prompt template exposed by an MCP server.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Prompt identifier |
| serverId | string | FK -> MCPServer.id | Owning server |
| name | string | required | Prompt name |
| description | string | optional | Description |

---

#### 20. MCPResource

A resource exposed by an MCP server.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Resource identifier |
| serverId | string | FK -> MCPServer.id | Owning server |
| uri | string | required | Resource URI |
| name | string | optional | Display name |

---

### F007-backup-sync

#### 21. Backup Format Versions

The backup/export format has evolved through five major versions. Each version wraps
the full application state for import/export/sync.

| Version | Key Changes | Migration Path |
|---------|-------------|----------------|
| v1 | Initial: assistants, topics, messages, settings, providers | -- |
| v2 | Added: knowledge bases, MCP servers, quick phrases | v1 -> v2 |
| v3 | Added: notes, custom CSS, memory items | v2 -> v3 |
| v4 | Message block model (messages decomposed into blocks) | v3 -> v4 |
| v5 | Added: shortcuts, web search providers, expanded settings | v4 -> v5 |

**Common Backup Envelope:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| version | number | 1-5 | Format version |
| time | string | ISO 8601 | Export timestamp |
| assistants | Assistant[] | optional | All assistants |
| topics | Topic[] | optional | All topics |
| messages | Message[] | optional | All messages (v1-v3) or with blocks (v4+) |
| settings | SettingsState | optional | Full settings snapshot |
| providers | Provider[] | optional | Provider configurations |
| knowledgeBases | KnowledgeBase[] | optional (v2+) | Knowledge bases |
| mcpServers | MCPServer[] | optional (v2+) | MCP server configs |
| quickPhrases | QuickPhrase[] | optional (v2+) | Quick phrases |
| notes | NotesTreeNode[] | optional (v3+) | Notes tree |
| customCSS | string | optional (v3+) | Custom CSS |
| memoryItems | MemoryItem[] | optional (v3+) | Memory items |
| shortcuts | Shortcut[] | optional (v5+) | Keyboard shortcuts |

---

#### 22. WebDavConfig

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| url | string | URL, required | WebDAV server URL |
| username | string | required | Authentication username |
| password | string | required, encrypted | Authentication password |
| path | string | default: `/cherry-studio` | Remote directory path |

---

#### 23. NutstoreConfig

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| username | string | required | Nutstore account |
| token | string | required, encrypted | App-specific token |
| path | string | default: `/cherry-studio` | Remote path |

---

#### 24. ObsidianConfig

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| vaultPath | string | required | Local vault path |
| folderPath | string | default: `cherry-studio` | Subfolder within vault |
| autoSync | boolean | default: false | Enable auto-sync |

---

### F008-settings-ui

#### 25. SettingsState

The global application settings object stored in Redux/Zustand and persisted via electron-store.
Contains ~100+ fields organized in logical groups.

**Selected Field Groups:**

| Group | Example Fields | Description |
|-------|---------------|-------------|
| General | language, themeMode, sendMessageShortcut, fontSize, topicPosition, windowStyle | App-wide preferences |
| Default Models | defaultModel, topicNamingModel, translateModel, webSearchModel | Model assignments |
| Provider Defaults | defaultProvider | Default provider selection |
| Display | showAssistantIcon, messageStyle, codeStyle, showInputEstimatedTokens | UI display toggles |
| Generation | temperature, topP, contextCount, maxTokens, streamOutput | Default generation params |
| Knowledge | defaultChunkSize, defaultThreshold, defaultTopK | RAG defaults |
| Web Search | webSearchProvider, webSearchEnabled, searchEngineConfig | Search settings |
| TTS | ttsEnabled, ttsModel, ttsVoice, ttsSpeed | Text-to-speech |
| Memory | memoryEnabled, memoryModel, memoryAutoUpdate | Memory system |
| Proxy | proxyMode, proxyUrl, proxyAuth | Network proxy |
| Backup | webdavConfig, nutstoreConfig, obsidianConfig, autoBackup | Sync/backup |
| Privacy | enableAnalytics, enableCrashReporting | Telemetry |
| Advanced | customCSS, apiServerPort, apiServerEnabled | Power-user settings |

---

#### 26. Shortcut

A keyboard shortcut binding.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| key | string | PK, unique | Action identifier (e.g., `new-topic`, `toggle-sidebar`) |
| shortcut | string | required | Key combination (e.g., `CmdOrCtrl+N`) |
| editable | boolean | default: true | Whether user can rebind |
| enabled | boolean | default: true | Whether shortcut is active |
| system | boolean | default: false | Whether it is an OS-level global shortcut |

---

### F009-notes-editor

#### 27. NotesTreeNode

A node in the hierarchical notes tree.

**Fields:**

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Node identifier |
| name | string | required | Display name / title |
| type | string | `folder` or `note` | Node type |
| treePath | string | required | Slash-delimited path in tree |
| children | NotesTreeNode[] | optional | Child nodes (folders only) |
| isStarred | boolean | default: false | Starred for quick access |
| content | string | optional | Markdown content (notes only) |
| createdAt | number | timestamp | Creation time |
| updatedAt | number | timestamp | Last edit time |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| parent/child | NotesTreeNode | self-referential 1:N | Tree hierarchy |

---

### F010-auxiliary-features

#### 28. WebSearchProvider

Web search engine configuration.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Provider identifier |
| name | string | required | Display name (Google, Bing, etc.) |
| apiKey | string | optional, encrypted | API key |
| apiHost | string | optional, URL | Custom endpoint |
| engineId | string | optional | Search engine ID (Google CSE) |
| enabled | boolean | default: true | Whether available |

---

#### 29. TranslateHistory

A saved translation record.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Record identifier |
| sourceText | string | required | Original text |
| targetText | string | required | Translated text |
| sourceLang | string | required | Source language code |
| targetLang | string | required | Target language code |
| createdAt | number | timestamp | When translated |

---

#### 30. CustomTranslateLanguage

A user-defined language for translation.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Language identifier |
| name | string | required | Display name |
| code | string | required | Language code |

---

#### 31. MinAppType

A mini-application within the app (e.g., translator, painter).

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Mini-app identifier |
| name | string | required | Display name |
| icon | string | optional | Icon identifier |
| route | string | required | App route path |

---

#### 32. Painting

Base entity for AI image generation.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Painting identifier |
| model | string | FK -> Model.id | Generation model |
| prompt | string | required | Generation prompt |
| negativePrompt | string | optional | Negative prompt |
| images | string[] | optional | Generated image URLs/paths |
| status | string | `pending`, `generating`, `completed`, `failed` | Generation state |
| createdAt | number | timestamp | Creation time |
| params | object | optional | Model-specific generation parameters |

---

#### 33. GeneratePainting (extends Painting)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| width | number | > 0 | Image width in pixels |
| height | number | > 0 | Image height in pixels |
| steps | number | > 0, optional | Diffusion steps |
| seed | number | optional | Random seed |
| guidanceScale | number | optional | CFG scale |
| numImages | number | >= 1, default: 1 | Number of images to generate |
| style | string | optional | Style preset |
| aspectRatio | string | optional | Aspect ratio string |

---

#### 34. EditPainting (extends Painting)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| sourceImage | string | required | Input image path/URL |
| mask | string | optional | Mask image for inpainting |
| strength | number | 0-1, optional | Edit strength |
| width | number | > 0 | Output width |
| height | number | > 0 | Output height |
| editType | string | optional | `inpaint`, `outpaint`, `variation` |

---

#### 35. CodeToolResult

Result from a code execution tool.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Result identifier |
| code | string | required | Executed code |
| output | string | required | Execution output |
| exitCode | number | integer | Process exit code |

---

#### 36. OVMSModel

OpenVINO Model Server model entry.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Model identifier |
| name | string | required | Display name |
| path | string | required | Model file path |
| status | string | enum | Loading state |
| config | object | optional | Model configuration |
| version | number | optional | Model version |

---

### F011-memory-system

#### 37. MemoryItem

A discrete memory extracted from conversations.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Memory identifier |
| memory | string | required | The memory text content |
| hash | string | required, unique | Content hash for deduplication |
| score | number | 0-1, optional | Relevance / importance score |
| createdAt | number | timestamp | When the memory was created |

---

#### 38. MemoryHistoryItem

An audit log entry for memory operations.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | History entry identifier |
| memoryId | string | FK -> MemoryItem.id | Affected memory |
| action | MemoryAction | enum: ADD, UPDATE, DELETE | What happened |
| oldMemory | string | optional | Previous memory text (for UPDATE/DELETE) |
| newMemory | string | optional | New memory text (for ADD/UPDATE) |
| timestamp | number | timestamp | When the action occurred |

---

#### 39. MemoryConfig

Configuration for the memory system.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| enabled | boolean | default: false | Whether memory is active |
| model | string | FK -> Model.id | Model used for memory extraction |
| autoUpdate | boolean | default: true | Auto-extract memories from new conversations |
| maxItems | number | > 0, optional | Maximum memories to retain |
| prompt | string | optional | Custom extraction prompt |

---

### F012-agent-framework

These entities use Drizzle ORM schemas (SQLite) rather than Redux/TypeScript types.

#### 40. Agent (Drizzle)

A persistent autonomous agent with file access and MCP tooling.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Agent identifier |
| type | string | required | Agent type classification |
| name | string | required | Display name |
| model | string | FK -> Model.id | Default model |
| prompt | string | optional | System prompt |
| accessible_paths | string[] | serialized JSON | Filesystem paths the agent may access |
| mcps | string[] | serialized JSON | MCP server IDs bound to this agent |
| settings | object | serialized JSON | Agent-specific settings |
| created_at | string | ISO 8601 | Creation timestamp |
| updated_at | string | ISO 8601 | Last update timestamp |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| has | Session | 1:N | Agent owns conversation sessions |

---

#### 41. Session (Drizzle)

A conversation session within an agent.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Session identifier |
| agent_id | string | FK -> Agent.id, required | Owning agent |
| name | string | required | Session title |
| model | string | optional | Model override for this session |
| settings | object | serialized JSON | Session-specific settings |
| created_at | string | ISO 8601 | Creation timestamp |
| updated_at | string | ISO 8601 | Last update timestamp |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Agent | N:1 | Every session belongs to one agent |
| has | SessionMessage | 1:N | Ordered messages in the session |

---

#### 42. SessionMessage (Drizzle)

A message within an agent session.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, uuid | Message identifier |
| session_id | string | FK -> Session.id, required | Parent session |
| role | string | `user`, `assistant`, `system`, `tool` | Message role |
| content | string | required | Message text content |
| tool_calls | object[] | serialized JSON, optional | Tool call objects |
| tool_call_id | string | optional | ID linking tool result to call |
| model | string | optional | Model that generated this message |
| created_at | string | ISO 8601 | Creation timestamp |
| tokens | number | optional | Token count |

**Relationships:**

| Relationship | Target | Cardinality | Description |
|-------------|--------|-------------|-------------|
| belongs to | Session | N:1 | Every message belongs to one session |

---

#### 43. PluginMetadata

Metadata for a loaded agent plugin.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK | Plugin identifier |
| name | string | required | Plugin display name |
| version | string | semver | Plugin version |
| author | string | optional | Plugin author |
| description | string | optional | Short description |
| entryPoint | string | required | Main module path |

---

#### 44. PluginManifest

The manifest file (`manifest.json`) declaring a plugin's capabilities.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | string | PK, matches PluginMetadata.id | Plugin identifier |
| name | string | required | Display name |
| version | string | semver | Version |
| minAppVersion | string | semver, optional | Minimum Cherry Studio version |
| permissions | string[] | optional | Required permissions (`fs`, `net`, `mcp`) |
| mcpServers | MCPServer[] | optional | MCP servers the plugin provides |
| tools | object[] | optional | Custom tool definitions |
| config | object | optional | Default configuration schema |

---

## State Machines

### MessageBlockStatus

```
pending ──> processing ──> streaming ──> success
                │              │
                │              ├──> error
                │              │
                │              └──> paused
                │
                ├──> success
                │
                ├──> error
                │
                └──> paused
```

| State | Description |
|-------|-------------|
| `pending` | Block created, awaiting processing |
| `processing` | Server is processing (pre-stream) |
| `streaming` | Tokens are actively streaming in |
| `success` | Block completed successfully |
| `error` | Block failed with an error |
| `paused` | User paused the generation |

**Transitions:**

| From | To | Trigger |
|------|----|---------|
| pending | processing | Generation request sent to API |
| processing | streaming | First token received |
| processing | success | Complete response received (non-streaming) |
| processing | error | API error or timeout |
| streaming | success | Stream completed (stop token) |
| streaming | error | Stream error or connection lost |
| streaming | paused | User clicked stop/pause |
| paused | streaming | User resumed generation |

---

### AssistantMessageStatus

```
processing ──> pending ──> searching ──> success
     │            │            │
     │            │            ├──> error
     │            │            │
     │            └──> success
     │
     ├──> success
     ├──> error
     └──> paused
```

| State | Description |
|-------|-------------|
| `processing` | Message is being generated |
| `pending` | Awaiting next step (e.g., tool result) |
| `searching` | Web search or KB retrieval in progress |
| `success` | Message completed |
| `error` | Message failed |
| `paused` | User paused the generation |

---

### KnowledgeItem ProcessingStatus

```
pending ──> processing ──> completed
                │
                └──> failed
```

| State | Description |
|-------|-------------|
| `pending` | Item queued for indexing |
| `processing` | Chunking, embedding, and storing |
| `completed` | Successfully indexed and searchable |
| `failed` | Indexing failed (parsing error, API error) |

---

### MemoryHistoryItem Action

Not a traditional state machine but a log of discrete actions:

| Action | Description |
|--------|-------------|
| `ADD` | New memory created from conversation extraction |
| `UPDATE` | Existing memory revised with new information |
| `DELETE` | Memory removed (user action or deduplication) |

---

## Cross-Entity Relationship Diagram (textual)

```
Provider ──1:N──> Model
                    │
        ┌───N:1────┘
        │
Assistant ──1:N──> Topic ──1:N──> Message ──1:N──> MessageBlock
    │                                                    │
    ├──N:M──> KnowledgeBase ──1:N──> KnowledgeItem      ├── (tool) ──> MCPServer
    │                                                    ├── (file/image) ──> FileMetadata
    ├──N:M──> MCPServer ──1:N──> MCPTool                 └── (citation) ──> KnowledgeReference
    │                  ├──1:N──> MCPPrompt
    │                  └──1:N──> MCPResource
    │
    └──1:1──> AssistantSettings

Agent (Drizzle) ──1:N──> Session ──1:N──> SessionMessage

SettingsState ──refs──> Model, Provider, MemoryConfig, WebDavConfig, ...

NotesTreeNode ──self-ref──> NotesTreeNode (tree)

MemoryItem <──audit── MemoryHistoryItem
```

---

*End of Entity Registry*
