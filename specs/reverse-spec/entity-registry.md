# Entity Registry — Angdu Studio

> Extracted from Cherry Studio source types.
> All entities below are Core-scope.

---

## Entity Overview

| Entity | Primary Feature | Shared By | Storage |
|--------|----------------|-----------|---------|
| Assistant | F006 Chat Core | F007, F010, F011, F012 | SQLite (Zustand hydrated) |
| Topic | F006 Chat Core | F010 | SQLite |
| Message | F006 Chat Core | F010 | SQLite |
| MessageBlock | F006 Chat Core | F010 | SQLite |
| Provider | F004 Provider Mgmt | F005, F006 | SQLite (Zustand hydrated) |
| Model | F005 Model Mgmt | F004, F006, F010, F011 | SQLite (Zustand hydrated) |
| KnowledgeBase | F011 Knowledge Base | F006 | SQLite |
| KnowledgeItem | F011 Knowledge Base | — | SQLite |
| MCPServer | F012 MCP Integration | F006, F010 | SQLite (Zustand hydrated) |
| FileMetadata | F008 Data & Storage | F006, F010, F011 | SQLite |
| Tab | F002 Navigation | — | Zustand (persisted) |
| Settings | F007 Settings System | All | SQLite (Zustand hydrated) |
| QuickPhrase | F006 Chat Core | — | SQLite |

---

## Entity Definitions

### Assistant

```typescript
{
  id: string                     // UUID
  name: string                   // Display name
  prompt: string                 // System prompt
  type: string                   // Assistant type identifier
  emoji?: string                 // Avatar emoji
  description?: string
  model?: Model                  // Preferred model
  defaultModel?: Model           // Fallback model
  topics: Topic[]                // Owned topics
  settings?: AssistantSettings   // Per-assistant overrides
  messages?: AssistantMessage[]  // Preset conversation starters
  enableWebSearch?: boolean
  mcpMode?: 'disabled' | 'auto' | 'manual'
  mcpServers?: MCPServer[]       // Manual MCP server selection
  knowledge_bases?: KnowledgeBase[]
  knowledgeRecognition?: 'off' | 'on'
  regularPhrases?: QuickPhrase[]
  tags?: string[]
}
```

**AssistantSettings** (embedded):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| temperature | number | 0.7 | Sampling temperature |
| topP | number | 1.0 | Nucleus sampling |
| maxTokens | number | — | Max output tokens |
| enableMaxTokens | boolean | false | Whether maxTokens is active |
| contextCount | number | 20 | Messages to include in context |
| streamOutput | boolean | true | Enable streaming |
| reasoning_effort | ReasoningEffortOption | 'default' | Thinking model control |
| toolUseMode | 'function' \| 'prompt' | 'function' | How tools are invoked |
| customParameters | CustomParam[] | [] | Provider-specific params |

**Validation Rules**:
- `id` is required, UUID format
- `name` must be non-empty
- `temperature` in [0, 2]
- `contextCount` >= 0

---

### Topic

```typescript
{
  id: string                     // UUID
  type?: 'chat' | 'session'     // Topic type
  assistantId: string            // FK -> Assistant.id
  name: string                   // Topic title
  createdAt: string              // ISO 8601
  updatedAt: string              // ISO 8601
  messages: Message[]            // Ordered messages
  pinned?: boolean               // Pin to top
  prompt?: string                // Topic-level system override
  isNameManuallyEdited?: boolean // Prevent auto-rename
}
```

**Validation Rules**:
- `assistantId` must reference existing Assistant
- `name` defaults to auto-generated from first message

---

### Message

```typescript
{
  id: string                     // UUID
  role: 'user' | 'assistant' | 'system'
  assistantId: string            // FK -> Assistant.id
  topicId: string                // FK -> Topic.id
  createdAt: string              // ISO 8601
  status: UserMessageStatus | AssistantMessageStatus
  modelId?: string               // Model used for generation
  model?: Model                  // Denormalized model info
  type?: 'clear'                 // Context-clear marker
  useful?: boolean               // User feedback
  askId?: string                 // Links assistant reply to user question
  mentions?: Model[]             // @-mentioned models (multi-model)
  usage?: Usage                  // Token usage stats
  metrics?: Metrics              // Performance metrics
  blocks: string[]               // MessageBlock IDs (ordered)
  multiModelMessageStyle?: 'horizontal' | 'vertical' | 'fold' | 'grid'
  foldSelected?: boolean
  traceId?: string
  agentSessionId?: string
}
```

**Status Enums**:
- UserMessageStatus: `success`
- AssistantMessageStatus: `processing`, `pending`, `searching`, `success`, `paused`, `error`

---

### MessageBlock

```typescript
{
  id: string                     // UUID
  messageId: string              // FK -> Message.id
  type: MessageBlockType         // Discriminator
  createdAt: string              // ISO 8601
  status: MessageBlockStatus     // pending | processing | streaming | success | error | paused
  model?: Model
  metadata?: Record<string, any>
  error?: SerializedError
  // Type-specific fields below
}
```

**Block Types**:

| Type | Key Fields | Feature |
|------|-----------|---------|
| `main_text` | content: string, knowledgeBaseIds?: string[] | F006 |
| `thinking` | content: string, thinking_millsec: number | F006 |
| `code` | content: string, language: string | F006 |
| `image` | url?: string, file?: FileMetadata | F010 |
| `tool` | toolId: string, toolName?: string, arguments?: object, content?: string | F010/F012 |
| `citation` | response?: WebSearchResponse, knowledge?: KnowledgeReference[] | F010/F011 |
| `error` | (inherits error from base) | F006 |
| `file` | file: FileMetadata | F010 |
| `translation` | content: string, targetLanguage: string | F010 |

---

### Provider

```typescript
{
  id: string                     // System ID or UUID
  type: ProviderType             // 'openai' | 'anthropic' | 'gemini' | ... (12 types)
  name: string                   // Display name
  apiKey: string                 // Encrypted API key
  apiHost: string                // Base URL
  apiVersion?: string            // For Azure
  models: Model[]                // Available models
  enabled?: boolean              // Active toggle
  isSystem?: boolean             // Built-in provider
  isAuthed?: boolean             // OAuth completed
  rateLimit?: number             // Requests per minute
  authType?: 'apiKey' | 'oauth'
  notes?: string
  extra_headers?: Record<string, string>
  apiOptions?: ProviderApiOptions
  serviceTier?: ServiceTier
}
```

**Provider Types** (12 Core types):
`openai`, `openai-response`, `anthropic`, `gemini`, `azure-openai`, `vertexai`, `mistral`, `aws-bedrock`, `vertex-anthropic`, `new-api`, `gateway`, `ollama`

**System Providers**: 60+ pre-configured provider IDs (openai, anthropic, gemini, ollama, etc.)

---

### Model

```typescript
{
  id: string                     // Model identifier (e.g., 'gpt-4o')
  provider: string               // FK -> Provider.id
  name: string                   // Display name
  group: string                  // Grouping label
  owned_by?: string              // Organization
  description?: string
  capabilities?: ModelCapability[]
  pricing?: ModelPricing         // { input_per_million_tokens, output_per_million_tokens }
  endpoint_type?: EndpointType   // 'openai' | 'anthropic' | 'gemini' | ...
}
```

**Model Tags**: `vision`, `embedding`, `reasoning`, `function_calling`, `web_search`, `rerank`, `free`

---

### KnowledgeBase

```typescript
{
  id: string                     // UUID
  name: string
  model: Model                   // Embedding model
  dimensions?: number            // Embedding dimensions
  description?: string
  items: KnowledgeItem[]
  created_at: number             // Unix timestamp
  updated_at: number
  version: number
  documentCount?: number
  chunkSize?: number             // Default: 500
  chunkOverlap?: number          // Default: 50
  threshold?: number             // Similarity threshold
  rerankModel?: Model
}
```

### KnowledgeItem

```typescript
{
  id: string
  baseId?: string                // FK -> KnowledgeBase.id
  type: 'file' | 'url' | 'note' | 'sitemap' | 'directory'
  content: string | FileMetadata
  remark?: string
  created_at: number
  updated_at: number
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  processingProgress?: number    // 0-100
  processingError?: string
  retryCount?: number
}
```

---

### MCPServer (from Zod schema)

```typescript
{
  id?: string
  name?: string
  type?: 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'
  description?: string
  url?: string
  baseUrl?: string
  command?: string               // e.g., 'uvx', 'npx'
  args?: string[]
  env?: Record<string, string>
  headers?: Record<string, string>
  isActive?: boolean
  isTrusted?: boolean
  trustedAt?: number
  installedAt?: number
  installSource?: 'builtin' | 'manual' | 'protocol' | 'unknown'
  disabledTools?: string[]
  disabledAutoApproveTools?: string[]
  timeout?: number               // Seconds, default 60
  dxtVersion?: string            // DXT package version
  dxtPath?: string               // DXT extraction path
}
```

---

### FileMetadata

```typescript
{
  id: string                     // UUID
  name: string                   // Internal filename
  origin_name: string            // Original display name
  path: string                   // File system path
  size: number                   // Bytes
  ext: string                    // Extension with dot
  type: 'image' | 'video' | 'audio' | 'text' | 'document' | 'other'
  created_at: string             // ISO 8601
  count: number                  // Reference count
  tokens?: number                // Estimated token count
}
```

---

### Tab

```typescript
{
  id: string                     // 'home' or UUID
  path: string                   // Route path
}
```

---

### Settings (flattened Zustand store)

Key setting groups:

| Group | Key Fields |
|-------|-----------|
| General | language, sendMessageShortcut, launchOnBoot, launchToTray, tray, trayOnClose |
| Display | theme, fontSize, windowStyle, messageStyle, topicPosition, showTopicTime |
| User | userName, userId, userTheme (colorPrimary, fontFamily, codeFontFamily) |
| Proxy | proxyMode ('system'\|'custom'\|'none'), proxyUrl, proxyBypassRules |
| Code | codeShowLineNumbers, codeCollapsible, codeWrappable, codeViewer themes |
| Chat | messageFont, showPrompt, showMessageDivider, renderInputMessageAsMarkdown |
| Data | skipBackupFile, customCss |

---

## Cross-Feature Entity Sharing

```
F008 Data & Storage
 |-- FileMetadata -----> F006 Chat Core (attachments)
 |                   \-> F010 Chat Advanced (image blocks)
 |                   \-> F011 Knowledge Base (file items)

F004 Provider Management
 |-- Provider ---------> F005 Model Management
 |                   \-> F006 Chat Core (API calls)

F005 Model Management
 |-- Model ------------> F006 Chat Core (model selection)
 |                   \-> F011 Knowledge Base (embedding model)
 |                   \-> F010 Chat Advanced (multi-model mentions)

F006 Chat Core
 |-- Assistant --------> F010 Chat Advanced
 |                   \-> F011 Knowledge Base (KB attachment)
 |                   \-> F012 MCP Integration (MCP server selection)
 |-- Topic/Message ----> F010 Chat Advanced
```
