# Data Model: Chat Conversation

## Message

A single chat message within a topic. Stored in main process SQLite via Drizzle ORM. Accessed via `chat:*` IPC channels.

### Drizzle Schema

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const messages = sqliteTable('messages', {
  id:            text('id').primaryKey(),                    // nanoid
  topicId:       text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  assistantId:   text('assistant_id').notNull(),             // assistant that generated/received this message
  role:          text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  status:        text('status', { enum: ['pending', 'sending', 'streaming', 'success', 'error', 'paused'] }).notNull().default('pending'),
  modelId:       text('model_id'),                           // model used (null for user messages)
  providerId:    text('provider_id'),                        // provider used (null for user messages)
  type:          text('type', { enum: ['text', 'clear_context', 'divider'] }).notNull().default('text'),
  mentions:      text('mentions', { mode: 'json' }),         // JSON: string[] — mentioned model IDs for multi-model
  multiModelMessageStyle: text('multi_model_message_style', { enum: ['horizontal', 'vertical', 'fold', 'grid'] }),
  // Token usage
  promptTokens:      integer('prompt_tokens'),
  completionTokens:  integer('completion_tokens'),
  totalTokens:       integer('total_tokens'),
  // Timing metrics
  firstTokenLatency: real('first_token_latency'),            // ms from send to first chunk
  totalDuration:     real('total_duration'),                  // ms total generation time
  // Timestamps
  createdAt:     text('created_at').notNull(),               // ISO 8601
  updatedAt:     text('updated_at').notNull(),               // ISO 8601
})
```

### TypeScript Interface

```typescript
export interface Message {
  id: string
  topicId: string
  assistantId: string
  role: 'user' | 'assistant' | 'system'
  status: MessageStatus
  modelId?: string
  providerId?: string
  type: MessageType
  mentions?: string[]
  multiModelMessageStyle?: MultiModelMessageStyle
  usage?: TokenUsage
  metrics?: MessageMetrics
  createdAt: string
  updatedAt: string
}

export type MessageStatus = 'pending' | 'sending' | 'streaming' | 'success' | 'error' | 'paused'
export type MessageType = 'text' | 'clear_context' | 'divider'
export type MultiModelMessageStyle = 'horizontal' | 'vertical' | 'fold' | 'grid'

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface MessageMetrics {
  firstTokenLatency?: number  // ms
  totalDuration?: number      // ms
}
```

### Validation Rules

- `id` MUST be unique (nanoid, 21 chars)
- `topicId` MUST reference an existing topic (FK cascade delete)
- `role` MUST be one of `user`, `assistant`, `system`
- `status` MUST follow the state machine (see State Transitions)
- `modelId` and `providerId` are required for `role: 'assistant'`, optional for others
- `mentions` array, when present, MUST contain valid model IDs
- `createdAt` and `updatedAt` MUST be valid ISO 8601 strings

### State Transitions

```
[pending] → send initiated → [sending]
[sending] → stream starts  → [streaming]
[streaming] → stream completes → [success]
[streaming] → user stops       → [paused]
[streaming] → stream error     → [error]
[sending]   → send error       → [error]
[error]     → retry            → [sending]
[paused]    → regenerate       → [sending]
```

---

## MessageBlock

A typed content segment within a message. Stored in a separate SQLite table with JSON-encoded content fields. Discriminated by `type`.

### Drizzle Schema

```typescript
export const messageBlocks = sqliteTable('message_blocks', {
  id:         text('id').primaryKey(),                    // nanoid
  messageId:  text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  type:       text('type', { enum: [
    'unknown', 'main_text', 'thinking', 'translation',
    'image', 'code', 'tool', 'file', 'error',
    'citation', 'video', 'compact'
  ] }).notNull().default('unknown'),
  status:     text('status', { enum: ['pending', 'streaming', 'success', 'error'] }).notNull().default('pending'),
  content:    text('content', { mode: 'json' }).notNull(), // JSON: type-specific content (see below)
  sortOrder:  integer('sort_order').notNull().default(0),   // ordering within message
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
})
```

### TypeScript Interface — Discriminated Union

```typescript
export type BlockType =
  | 'unknown' | 'main_text' | 'thinking' | 'translation'
  | 'image' | 'code' | 'tool' | 'file' | 'error'
  | 'citation' | 'video' | 'compact'

export type BlockStatus = 'pending' | 'streaming' | 'success' | 'error'

// Base fields shared by all blocks
interface BlockBase {
  id: string
  messageId: string
  status: BlockStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// --- F005-owned block types (8) ---

export interface UnknownBlock extends BlockBase {
  type: 'unknown'
  content: { raw: string }
}

export interface MainTextBlock extends BlockBase {
  type: 'main_text'
  content: { text: string }
}

export interface ThinkingBlock extends BlockBase {
  type: 'thinking'
  content: {
    text: string
    thinkingMs?: number       // time spent thinking
    collapsed?: boolean       // UI state (not persisted in DB — overridden by Zustand)
  }
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  content: {
    code: string
    language: string          // language identifier for syntax highlighting
    fileName?: string         // optional file name
  }
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  content: {
    url: string               // base64 data URI or file path
    alt?: string
    width?: number
    height?: number
    mimeType?: string
  }
}

export interface FileBlock extends BlockBase {
  type: 'file'
  content: {
    fileName: string
    filePath: string
    fileSize: number          // bytes
    mimeType: string
  }
}

export interface ToolBlock extends BlockBase {
  type: 'tool'
  content: {
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    result?: string
    status: 'calling' | 'done' | 'error'
  }
}

export interface ErrorBlock extends BlockBase {
  type: 'error'
  content: {
    code: string
    message: string
    provider?: string
    statusCode?: number
    retryable: boolean
  }
}

// --- Downstream feature block types (registered by F006, F007, F008) ---

export interface TranslationBlock extends BlockBase {
  type: 'translation'
  content: { text: string; sourceLanguage: string; targetLanguage: string }
}

export interface CitationBlock extends BlockBase {
  type: 'citation'
  content: { text: string; source: string; url?: string }
}

export interface VideoBlock extends BlockBase {
  type: 'video'
  content: { url: string; mimeType: string; thumbnailUrl?: string }
}

export interface CompactBlock extends BlockBase {
  type: 'compact'
  content: { summary: string; fullBlocks: string[] } // fullBlocks = block IDs
}

// Discriminated union
export type MessageBlock =
  | UnknownBlock | MainTextBlock | ThinkingBlock | CodeBlock
  | ImageBlock | FileBlock | ToolBlock | ErrorBlock
  | TranslationBlock | CitationBlock | VideoBlock | CompactBlock
```

### Block Content JSON Examples

```json
// main_text
{ "text": "Here is the answer to your question..." }

// code
{ "code": "function hello() {\n  console.log('hi')\n}", "language": "typescript" }

// thinking
{ "text": "Let me analyze the user's request...", "thinkingMs": 3200 }

// tool
{ "toolCallId": "call_abc123", "toolName": "web_search", "args": {"query": "Electron IPC"}, "status": "calling" }

// error
{ "code": "RATE_LIMIT", "message": "Rate limit exceeded", "provider": "openai", "statusCode": 429, "retryable": true }
```

### Validation Rules

- `id` MUST be unique (nanoid, 21 chars)
- `messageId` MUST reference an existing message (FK cascade delete)
- `type` MUST be a valid BlockType enum value
- `content` JSON structure MUST match the type's content interface
- `sortOrder` MUST be >= 0, unique within a message
- F005 MAY only create blocks with types: `unknown`, `main_text`, `thinking`, `code`, `image`, `file`, `tool`, `error`
- Downstream features register additional types by extending the union

### State Transitions

```
[pending] → stream chunk arrives → [streaming]
[streaming] → all content received → [success]
[streaming] → error during stream  → [error]
[pending]   → created from complete data → [success]
```

---

## Topic

A conversation thread associated with an assistant. Stored in main process SQLite via Drizzle ORM.

### Drizzle Schema

```typescript
export const topics = sqliteTable('topics', {
  id:                    text('id').primaryKey(),           // nanoid
  assistantId:           text('assistant_id').notNull(),     // owning assistant
  name:                  text('name').notNull().default('New Topic'),
  type:                  text('type', { enum: ['normal', 'pinned'] }).notNull().default('normal'),
  pinned:                integer('pinned', { mode: 'boolean' }).notNull().default(false),
  isNameManuallyEdited:  integer('is_name_manually_edited', { mode: 'boolean' }).notNull().default(false),
  messageCount:          integer('message_count').notNull().default(0),  // denormalized for list perf
  createdAt:             text('created_at').notNull(),
  updatedAt:             text('updated_at').notNull(),
})
```

### TypeScript Interface

```typescript
export interface Topic {
  id: string
  assistantId: string
  name: string
  type: 'normal' | 'pinned'
  pinned: boolean
  isNameManuallyEdited: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}
```

### Validation Rules

- `id` MUST be unique (nanoid, 21 chars)
- `assistantId` MUST reference a valid assistant ID
- `name` MUST be non-empty, max 200 characters
- `isNameManuallyEdited` is set to `true` on any user-initiated rename
- `messageCount` is a denormalized counter, updated on message add/delete
- Deleting a topic MUST cascade-delete all associated messages and blocks

---

## Assistant

AI assistant configuration. Stored via Zustand persist in localStorage. Rich client-side entity with nested configuration objects. Assistants are NOT stored in SQLite — they change infrequently and are primarily a UI/configuration concern.

### TypeScript Interface

```typescript
export interface Assistant {
  id: string                          // nanoid
  name: string
  emoji?: string                      // avatar emoji
  description?: string
  prompt: string                      // system prompt (supports variables: {{date}}, {{time}}, {{language}})
  topics: string[]                    // topic IDs (denormalized reference list)
  model?: ModelReference              // bound model
  settings: AssistantSettings
  tags?: string[]                     // user-defined tags
  category?: string                   // grouping category
  mcpMode?: 'auto' | 'manual' | 'off'
  mcpServers?: string[]              // specific MCP server IDs
  isDefault?: boolean                // true for the default assistant (cannot be deleted)
  createdAt: string
  updatedAt: string
}

export interface ModelReference {
  providerId: string
  modelId: string
  displayName?: string               // cached for UI, may be stale
}

export interface AssistantSettings {
  temperature: number                 // 0-2, default 0.7
  topP: number                        // 0-1, default 1
  maxTokens: number                   // 0 = model default
  contextCount: number                // how many messages to include in context window, default 20
  streamOutput: boolean               // default true
  reasoning_effort?: 'low' | 'medium' | 'high'  // for thinking models
}
```

### Default Assistant

```typescript
export const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Default Assistant',
  emoji: undefined,
  prompt: 'You are a helpful assistant.',
  topics: [],
  settings: {
    temperature: 0.7,
    topP: 1,
    maxTokens: 0,
    contextCount: 20,
    streamOutput: true,
  },
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### Validation Rules

- `id` MUST be unique
- `name` MUST be non-empty, max 100 characters
- `prompt` MAY be empty (no system prompt sent to API)
- `settings.temperature` MUST be in range [0, 2]
- `settings.topP` MUST be in range [0, 1]
- `settings.maxTokens` MUST be >= 0 (0 = use model default)
- `settings.contextCount` MUST be in range [1, 100]
- Default assistant (`isDefault: true`) MUST exist and CANNOT be deleted
- `model` reference is advisory — if the referenced model is unavailable, show a warning but allow sending
- `topics` array is maintained by topic CRUD operations (add/remove topic ID)

### Storage Decision

Zustand persist to localStorage (NOT SQLite) because:
1. Assistants are few (typically <50) — no query performance concern
2. Deeply nested config (settings, MCP config) is awkward in relational schema
3. Instant access without IPC for UI rendering
4. Import/export is trivial with JSON serialization

However, assistant IDs are referenced by topics and messages in SQLite. This is a **cross-boundary reference** — assistant deletion must clean up or reassign orphaned topics.

---

## Draft

Unsent message composition state. Stored via Zustand persist in localStorage. Volatile, high-frequency data.

### TypeScript Interface

```typescript
export interface DraftContent {
  text: string                        // TipTap HTML content
  plainText: string                   // Plain text extraction (for preview)
  attachments: DraftAttachment[]
  updatedAt: string                   // ISO 8601
}

export interface DraftAttachment {
  id: string                          // nanoid
  type: 'image' | 'file'
  fileName: string
  filePath: string                    // absolute path or base64 data URI
  fileSize: number                    // bytes
  mimeType: string
  previewUrl?: string                 // thumbnail for images
}
```

### Storage Structure

```typescript
// Zustand store shape
interface DraftState {
  drafts: Record<string, DraftContent>  // keyed by topicId
}
```

### Validation Rules

- Draft key is `topicId` — one draft per topic
- `text` may be empty (user started typing then deleted)
- `attachments` may be empty array
- Drafts are cleared on successful message send
- Drafts are NOT preserved when a topic is deleted
- Max attachment size: platform-dependent, validated before storage

---

## Relationships

```
Assistant 1:N Topic       (via Topic.assistantId, cross-boundary reference)
Topic      1:N Message    (via Message.topicId, FK cascade delete)
Message    1:N MessageBlock (via MessageBlock.messageId, FK cascade delete)
Assistant  →  Model       (via Assistant.model.modelId, advisory reference to F004)
Message    →  Model       (via Message.modelId, records which model generated the response)
Draft      →  Topic       (via topicId key, localStorage only)

SQLite tables: topics, messages, message_blocks
Zustand stores: assistants, drafts
Cross-boundary: Assistant.id referenced by Topic.assistantId and Message.assistantId
```

### Cascade Delete Rules

| Delete Target | Cascade Effect |
|--------------|----------------|
| Topic | All messages in topic + all blocks in those messages (FK cascade) |
| Message | All blocks in message (FK cascade) |
| Assistant | Reassign topics to default assistant OR delete topics (user choice) |

### Indexes

```sql
CREATE INDEX idx_messages_topic_id ON messages(topic_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_message_blocks_message_id ON message_blocks(message_id);
CREATE INDEX idx_topics_assistant_id ON topics(assistant_id);
```
