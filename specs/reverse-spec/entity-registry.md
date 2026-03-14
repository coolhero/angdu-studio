# Entity Registry

> Angdu Studio Reverse-Spec | Generated 2026-03-14
> Source: Cherry Studio data model analysis

---

## Storage Strategy Overview

| Storage Layer | Technology | Purpose |
|---|---|---|
| Dexie (IndexedDB) | dexie | Local/offline data, large blobs, message history |
| Drizzle (SQLite) | better-sqlite3 + drizzle-orm | Structured relational data (agents, sessions) |
| Redux/Zustand State | zustand (persist) | UI state, configuration, provider/model registry |

---

## 1. Dexie (IndexedDB) Entities

### 1.1 FileMetadata

**Owning Feature:** F007-files

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique file identifier |
| name | string | yes | Display name |
| origin_name | string | yes | Original filename at upload |
| path | string | yes | Local filesystem path |
| size | number | yes | File size in bytes |
| ext | string | yes | File extension (e.g., ".pdf") |
| type | string | yes | Category: "image" / "document" / "video" / "other" |
| created_at | number | yes | Unix timestamp (ms) |
| count | number | yes | Reference count (how many messages use this file) |
| mimeType | string | yes | MIME type string |

**Validation Rules:**
- `id` is UUID v4
- `size` must be > 0
- `ext` must start with "."
- `count` >= 0; file eligible for cleanup when count reaches 0

**Relationships:**
- Referenced by MessageBlock (type: File, Image) via file path or id

---

### 1.2 Topic

**Owning Feature:** F006-chat-core

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique topic identifier |
| messages | NewMessage[] | yes | Ordered array of messages in this topic |

**Validation Rules:**
- `id` is UUID v4
- `messages` array maintains insertion order (append-only during streaming)

**Relationships:**
- Belongs to an Assistant (referenced by Assistant.topics[])
- Contains NewMessage objects which reference MessageBlock records

**Note:** Topic is the primary chat thread container. Each topic belongs to exactly one Assistant. Messages within a topic are stored as an embedded array for fast sequential reads.

---

### 1.3 Settings

**Owning Feature:** F004-settings

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Setting key identifier |
| value | any | yes | Setting value (JSON-serializable) |

**Validation Rules:**
- `id` is a known setting key string
- `value` type depends on the setting key (no universal validation)

**Relationships:**
- Standalone key-value store; no foreign keys

---

### 1.4 KnowledgeNoteItem

**Owning Feature:** F010-knowledge

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique note identifier |
| baseId | string | yes | Parent KnowledgeBase id |
| type | string | yes | Note type: "note" / "url" / "sitemap" |
| content | string | yes | Note text content or URL |
| created_at | number | yes | Unix timestamp (ms) |
| updated_at | number | yes | Unix timestamp (ms) |

**Validation Rules:**
- `baseId` must reference an existing KnowledgeBase
- `type` must be one of the allowed enum values
- `updated_at` >= `created_at`

**Relationships:**
- Belongs to KnowledgeBase (via baseId)

---

### 1.5 TranslateHistory

**Owning Feature:** F011-translate (if implemented)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique history entry identifier |
| sourceText | string | yes | Original text |
| targetText | string | yes | Translated text |
| sourceLanguage | string | yes | Source language code (e.g., "en") |
| targetLanguage | string | yes | Target language code (e.g., "ko") |
| createdAt | number | yes | Unix timestamp (ms) |

**Validation Rules:**
- `sourceText` and `targetText` must be non-empty strings
- `sourceLanguage` !== `targetLanguage`

**Relationships:**
- Standalone; no foreign keys

---

### 1.6 QuickPhrase

**Owning Feature:** F006-chat-core

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique phrase identifier |
| title | string | yes | Short display label |
| content | string | yes | Full phrase text to insert |
| sort | number | no | Sort order index |

**Validation Rules:**
- `title` max length 100 characters
- `content` must be non-empty

**Relationships:**
- Standalone; referenced by chat input bar for quick insertion

---

### 1.7 MessageBlock

**Owning Feature:** F006-chat-core

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | PK | Unique block identifier |
| messageId | string | yes | Parent message identifier |
| type | MessageBlockType | yes | Block type discriminator |
| content | string | yes | Block content (interpretation depends on type) |
| status | BlockStatus | yes | Processing status |
| model | string | no | Model that generated this block |
| metadata | object | no | Type-specific metadata |
| createdAt | number | yes | Unix timestamp (ms) |
| error | object | no | Error details if status is ERROR |

**MessageBlockType Enum:**

| Type | Content Interpretation | Metadata |
|---|---|---|
| MainText | Markdown text | token counts, finish reason |
| Thinking | Model reasoning/chain-of-thought | thinking budget, redacted flag |
| Code | Code block with language | language, filename, executable flag |
| Image | Image URL or base64 data | width, height, mimeType |
| File | File reference | fileId, fileName, fileSize |
| Tool | MCP tool call and result | toolName, serverId, arguments, result |
| Citation | Source citation/reference | url, title, snippet |
| Error | Error message | errorCode, retryable flag |
| Compact | Collapsed/summarized content | original block count |

**BlockStatus Enum:**

```
PENDING -> PROCESSING -> STREAMING -> SUCCESS
                                   -> ERROR
```

**Validation Rules:**
- `type` must be a valid MessageBlockType
- `status` transitions must follow the state machine (no backward transitions except retry: ERROR -> PENDING)
- `messageId` must reference an existing message

**Relationships:**
- Belongs to a message within a Topic (via messageId)
- File/Image blocks may reference FileMetadata
- Tool blocks reference MCP server and tool definitions

---

## 2. Drizzle (SQLite) Entities

### 2.1 Agent

**Owning Feature:** F009-agents

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | text | PK | UUID v4 | Unique agent identifier |
| type | text | yes | - | Agent type classifier |
| name | text | yes | - | Display name |
| description | text | no | null | Agent description |
| accessible_paths | text (JSON) | no | "[]" | Filesystem paths the agent can access |
| instructions | text | no | null | System prompt / instructions |
| model | text | no | null | Primary model identifier |
| plan_model | text | no | null | Planning model identifier |
| small_model | text | no | null | Small/fast model for simple tasks |
| mcps | text (JSON) | no | "[]" | MCP server configurations |
| allowed_tools | text (JSON) | no | "[]" | Tool whitelist |
| configuration | text (JSON) | no | "{}" | Additional configuration |
| created_at | text | yes | now() | ISO 8601 timestamp |
| updated_at | text | yes | now() | ISO 8601 timestamp |

**Validation Rules:**
- `name` must be non-empty, max 200 characters
- `accessible_paths` must be valid JSON array of path strings
- `mcps`, `allowed_tools` must be valid JSON arrays
- `configuration` must be valid JSON object

**Relationships:**
- Has many AgentSession (one-to-many via agent_id FK)

---

### 2.2 AgentSession

**Owning Feature:** F009-agents

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | text | PK | UUID v4 | Unique session identifier |
| agent_id | text (FK) | yes | - | Parent Agent reference |
| agent_type | text | yes | - | Snapshot of agent type at session creation |
| name | text | yes | - | Session display name |
| description | text | no | null | Session description |
| accessible_paths | text (JSON) | no | "[]" | Inherited + session-specific paths |
| instructions | text | no | null | Inherited + session-specific instructions |
| model | text | no | null | Model override for this session |
| plan_model | text | no | null | Planning model override |
| small_model | text | no | null | Small model override |
| mcps | text (JSON) | no | "[]" | MCP servers for this session |
| allowed_tools | text (JSON) | no | "[]" | Tool whitelist for this session |
| slash_commands | text (JSON) | no | "[]" | Available slash commands |
| configuration | text (JSON) | no | "{}" | Session-specific configuration |
| created_at | text | yes | now() | ISO 8601 timestamp |
| updated_at | text | yes | now() | ISO 8601 timestamp |

**Validation Rules:**
- `agent_id` must reference an existing Agent
- All JSON fields must be valid JSON
- Session inherits Agent defaults at creation; subsequent Agent edits do NOT propagate

**Relationships:**
- Belongs to Agent (via agent_id FK, CASCADE delete)
- Has many AgentSessionMessage (one-to-many via session_id FK)

---

### 2.3 AgentSessionMessage

**Owning Feature:** F009-agents

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | integer | PK (auto) | auto-increment | Row identifier |
| session_id | text (FK) | yes | - | Parent AgentSession reference |
| role | text | yes | - | "user" / "assistant" / "system" / "tool" |
| content | text | yes | - | Message content (may be JSON for tool messages) |
| agent_session_id | text | no | null | Denormalized reference for query performance |
| metadata | text (JSON) | no | "{}" | Additional message metadata |
| created_at | text | yes | now() | ISO 8601 timestamp |
| updated_at | text | yes | now() | ISO 8601 timestamp |

**Validation Rules:**
- `session_id` must reference an existing AgentSession
- `role` must be one of the allowed enum values
- `content` must be non-empty

**Relationships:**
- Belongs to AgentSession (via session_id FK, CASCADE delete)

---

## 3. Redux/Zustand State Entities (Not DB-Persisted Directly)

These entities live in Zustand stores with `persist` middleware (localStorage or custom storage). They are core domain objects but not stored in SQLite or IndexedDB tables.

### 3.1 Assistant

**Owning Feature:** F005-assistants

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | UUID v4 | Unique assistant identifier |
| name | string | yes | - | Display name |
| emoji | string | yes | random | Avatar emoji |
| systemPrompt | string | no | "" | System prompt text |
| model | string | no | null | Bound model identifier |
| topics | string[] | yes | [] | Ordered list of Topic ids |
| settings.temperature | number | no | 0.7 | Sampling temperature (0.0-2.0) |
| settings.maxTokens | number | no | 4096 | Maximum response tokens |
| settings.topP | number | no | 1.0 | Nucleus sampling threshold |
| settings.frequencyPenalty | number | no | 0 | Frequency penalty (-2.0 to 2.0) |
| settings.presencePenalty | number | no | 0 | Presence penalty (-2.0 to 2.0) |
| settings.contextLength | number | no | 10 | Number of previous messages to include |
| settings.streamOutput | boolean | no | true | Enable streaming response |

**Validation Rules:**
- `temperature` must be between 0.0 and 2.0
- `maxTokens` must be > 0
- `topP` must be between 0.0 and 1.0
- `topics` array entries must be valid Topic ids

**Relationships:**
- References Model (via model field)
- Owns Topics (via topics[] array)
- Belongs to the assistants Zustand store slice

---

### 3.2 Provider

**Owning Feature:** F003-providers

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | UUID v4 | Unique provider identifier |
| type | ProviderType | yes | - | Provider type discriminator (50+ types) |
| name | string | yes | - | Display name |
| apiKey | string | no | "" | API key (encrypted at rest) |
| apiHost | string | no | "" | Custom API endpoint URL |
| models | Model[] | yes | [] | Available models for this provider |
| enabled | boolean | yes | true | Whether provider is active |
| isSystem | boolean | yes | false | System-provided (not user-created) |
| rateLimit | number | no | 0 | Requests per minute limit (0 = unlimited) |
| apiOptions | object | no | {} | Provider-specific API options |
| extra_headers | Record<string,string> | no | {} | Custom HTTP headers |

**Provider Types (partial list):**
OpenAI, Anthropic, Google, Azure, AWS Bedrock, Ollama, LMStudio, Groq, Mistral, Cohere, DeepSeek, Moonshot, ZhiPu, Baichuan, Doubao, Minimax, Yi, Stepfun, HunyuanLite, SiliconFlow, Together, Fireworks, OpenRouter, Perplexity, xAI, InfiniAI, Novita, GitHub, Copilot, and 20+ more

**Validation Rules:**
- `type` must be a valid ProviderType enum value
- `apiKey` encrypted before persistence, decrypted on read
- `apiHost` must be a valid URL if provided
- `rateLimit` >= 0

**Relationships:**
- Has many Model (embedded array)
- Referenced by Assistant (via model -> provider chain)

---

### 3.3 Model

**Owning Feature:** F003-providers

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | - | Model identifier (e.g., "gpt-4o") |
| name | string | yes | - | Display name |
| provider | string | yes | - | Parent Provider id |
| group | string | no | "" | Model group/family |
| vision | boolean | no | false | Supports image input |
| functionCall | boolean | no | false | Supports function/tool calling |
| contextLength | number | no | 4096 | Maximum context window size |

**Validation Rules:**
- `id` must be unique within a provider
- `contextLength` must be > 0

**Relationships:**
- Belongs to Provider (via provider field)
- Referenced by Assistant.model, Agent.model, etc.

---

### 3.4 KnowledgeBase

**Owning Feature:** F010-knowledge

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | UUID v4 | Unique knowledge base identifier |
| name | string | yes | - | Display name |
| model | string | no | null | Embedding model identifier |
| dimensions | number | no | 1536 | Embedding vector dimensions |
| description | string | no | "" | Description |
| items | KnowledgeItem[] | yes | [] | Documents and notes in this KB |
| version | number | yes | 1 | Schema version for migration |
| documentCount | number | yes | 0 | Total document count |
| chunkSize | number | no | 1000 | Characters per chunk |
| chunkOverlap | number | no | 200 | Overlap between adjacent chunks |
| threshold | number | no | 0.7 | Similarity threshold for retrieval |
| rerankModel | string | no | null | Reranking model identifier |

**Validation Rules:**
- `chunkSize` must be > 0
- `chunkOverlap` must be >= 0 and < `chunkSize`
- `threshold` must be between 0.0 and 1.0
- `dimensions` must match the embedding model's output dimensions

**Relationships:**
- Has many KnowledgeNoteItem (via items[] and Dexie baseId)
- References Model (via model and rerankModel)

---

### 3.5 McpServerConfig

**Owning Feature:** F008-mcp

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | UUID v4 | Unique server identifier |
| name | string | yes | - | Display name |
| type | McpTransport | yes | - | Transport type |
| description | string | no | "" | Server description |
| url | string | conditional | - | Server URL (required for sse/streamableHttp) |
| command | string | conditional | - | Executable path (required for stdio) |
| args | string[] | no | [] | Command arguments (stdio only) |
| env | Record<string,string> | no | {} | Environment variables |
| headers | Record<string,string> | no | {} | HTTP headers (sse/streamableHttp) |
| provider | string | no | null | Provider that bundles this server |
| isActive | boolean | yes | true | Whether server is currently active |
| disabledTools | string[] | no | [] | Tool names to disable |

**McpTransport Enum:**
- `stdio` - Local process via stdin/stdout
- `sse` - Server-Sent Events over HTTP
- `streamableHttp` - Streamable HTTP transport
- `inMemory` - In-process (for built-in tools)

**Validation Rules:**
- `stdio` type requires `command` to be non-empty
- `sse` and `streamableHttp` types require `url` to be a valid URL
- `disabledTools` entries must match tool names from the server's tool list

**Relationships:**
- Referenced by Agent.mcps and AgentSession.mcps
- Tool results appear in MessageBlock (type: Tool)

---

### 3.6 Tab

**Owning Feature:** F001-shell

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | string | PK | UUID v4 | Unique tab identifier |
| type | string | yes | - | Tab content type |
| route | string | yes | - | Router path for this tab |
| title | string | yes | - | Display title |
| active | boolean | yes | false | Whether this tab is currently active |

**Validation Rules:**
- Exactly one tab should have `active: true` at any time
- `route` must be a valid internal route path

**Relationships:**
- Standalone UI state; references content via route

---

### 3.7 Note

**Owning Feature:** F012-notes (if implemented)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| path | string | PK | - | File system-like path (virtual) |
| content | string | yes | "" | Note content (Markdown/rich text) |
| expandedPaths | string[] | no | [] | Expanded tree nodes in sidebar |
| starredPaths | string[] | no | [] | Starred/pinned notes |

**Validation Rules:**
- `path` must be a valid virtual path (e.g., "/folder/note-name")
- `path` must be unique

**Relationships:**
- Standalone; managed by notes Zustand store slice

---

## Cross-Entity Relationship Summary

```
Provider (1) ---has-many---> Model (*)
Assistant (1) ---references---> Model (1)
Assistant (1) ---has-many---> Topic (*)
Topic (1) ---contains---> Message (*) ---has-many---> MessageBlock (*)
MessageBlock ---may-reference---> FileMetadata
MessageBlock (type:Tool) ---references---> McpServerConfig

Agent (1) ---has-many---> AgentSession (*)
AgentSession (1) ---has-many---> AgentSessionMessage (*)
Agent ---references---> Model (model, plan_model, small_model)

KnowledgeBase (1) ---has-many---> KnowledgeNoteItem (*)
KnowledgeBase ---references---> Model (embedding model, rerank model)

Tab ---routes-to---> any Feature view
```
