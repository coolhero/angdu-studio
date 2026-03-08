# Data Model: F003-chat-core

**Feature**: Chat Core
**Date**: 2026-03-09
**Status**: Draft

---

## Entity Definitions

### 1. Assistant

The AI persona configuration. Managed in `useAssistantsStore` (Zustand), persisted to Dexie.

```typescript
interface Assistant {
  id: string;                           // UUID v4
  name: string;                         // Display name
  prompt: string;                       // System prompt
  type: string;                         // Assistant type identifier (e.g., 'default', 'translate')
  emoji?: string;                       // Avatar emoji
  description?: string;                 // Short description

  // Model configuration (references F002 Model)
  model?: Model;                        // Default model override
  defaultModel?: Model;                 // Fallback model

  // Settings
  settings?: Partial<AssistantSettings>;

  // Preset messages (for assistant initialization)
  messages?: AssistantMessage[];

  // Topics (conversations)
  topics: Topic[];

  // Integration points (future Features — stored as IDs/references)
  knowledge_bases?: KnowledgeBase[];    // F007
  enableWebSearch?: boolean;
  webSearchProviderId?: string;
  enableUrlContext?: boolean;
  enableGenerateImage?: boolean;
  mcpMode?: 'disabled' | 'auto' | 'manual'; // F006
  mcpServers?: MCPServer[];             // F006
  knowledgeRecognition?: 'off' | 'on';

  // Organization
  regularPhrases?: QuickPhrase[];
  tags?: string[];
  enableMemory?: boolean;               // F008

  // Translate assistant fields
  content?: string;
  targetLanguage?: TranslateLanguage;
}

interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### 2. AssistantSettings

```typescript
interface AssistantSettings {
  temperature: { value: number; enabled: boolean };   // default: { value: 0.7, enabled: false }
  maxTokens: { value: number; enabled: boolean };     // default: { value: 4096, enabled: false }
  topP: { value: number; enabled: boolean };          // default: { value: 1.0, enabled: false }
  contextCount: number;                               // default: DEFAULT_CONTEXTCOUNT (5)
  streamOutput: boolean;                              // default: true
  toolUseMode: 'function' | 'auto';                   // default: 'function'
  reasoning_effort: 'default' | 'low' | 'medium' | 'high'; // default: 'default'
  customParameters?: Record<string, unknown>;
}

const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  temperature: { value: 0.7, enabled: false },
  maxTokens: { value: 4096, enabled: false },
  topP: { value: 1.0, enabled: false },
  contextCount: 5,
  streamOutput: true,
  toolUseMode: 'function',
  reasoning_effort: 'default',
};
```

### 3. Topic

```typescript
interface Topic {
  id: string;                           // UUID v4
  type?: TopicType;                     // 'chat' | 'session'
  assistantId: string;                  // FK → Assistant.id
  name: string;                         // Display name
  createdAt: string;                    // ISO 8601
  updatedAt: string;                    // ISO 8601
  messages: Message[];                  // Messages in this topic (loaded lazily)
  pinned?: boolean;                     // Pinned to top
  prompt?: string;                      // Topic-specific prompt override
  isNameManuallyEdited?: boolean;       // Prevents auto-rename
}

type TopicType = 'chat' | 'session';
```

### 4. Message

```typescript
interface Message {
  id: string;                           // UUID v4
  role: MessageRole;                    // 'user' | 'assistant' | 'system'
  assistantId: string;                  // FK → Assistant.id
  topicId: string;                      // FK → Topic.id
  createdAt: string;                    // ISO 8601
  updatedAt?: string;                   // ISO 8601
  status: MessageStatus;
  modelId?: string;                     // Model ID used for generation
  model?: Model;                        // Full model snapshot (F002 reference)
  type?: 'clear';                       // Special message type (context clear marker)
  useful?: boolean;                     // User feedback (thumbs up/down)
  askId?: string;                       // Links user question to assistant reply
  mentions?: Model[];                   // Multi-model mentions
  usage?: TokenUsage;
  metrics?: MessageMetrics;
  multiModelMessageStyle?: MultiModelStyle;
  foldSelected?: boolean;
  blocks: string[];                     // Array of MessageBlock IDs
  traceId?: string;                     // Observability trace ID
  agentSessionId?: string;             // F009 agent session resume
  providerMetadata?: ProviderMetadata;
}

type MessageRole = 'user' | 'assistant' | 'system';

type UserMessageStatus = 'success';

type AssistantMessageStatus =
  | 'processing'
  | 'pending'
  | 'searching'
  | 'success'
  | 'paused'
  | 'error';

type MessageStatus = UserMessageStatus | AssistantMessageStatus;

type MultiModelStyle = 'horizontal' | 'vertical' | 'fold' | 'grid';

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

interface MessageMetrics {
  ttft: number;           // Time to first token (ms)
  completionTime: number; // Total completion time (ms)
}
```

### 5. MessageBlock (Discriminated Union)

```typescript
// ── Base ──
interface MessageBlockBase {
  id: string;                           // UUID v4
  messageId: string;                    // FK → Message.id
  type: MessageBlockType;
  createdAt: string;                    // ISO 8601
  updatedAt?: string;
  status: MessageBlockStatus;
  model?: Model;                        // Model that generated this block
  metadata?: Record<string, unknown>;
  error?: SerializedError;
}

// ── Type Enum ──
enum MessageBlockType {
  UNKNOWN = 'unknown',
  MAIN_TEXT = 'main_text',
  THINKING = 'thinking',
  TRANSLATION = 'translation',
  IMAGE = 'image',
  CODE = 'code',
  TOOL = 'tool',
  FILE = 'file',
  ERROR = 'error',
  CITATION = 'citation',
  VIDEO = 'video',
  COMPACT = 'compact',
}

// ── Status Enum ──
enum MessageBlockStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  STREAMING = 'streaming',
  SUCCESS = 'success',
  ERROR = 'error',
  PAUSED = 'paused',
}

// ── Variants ──
interface MainTextMessageBlock extends MessageBlockBase {
  type: MessageBlockType.MAIN_TEXT;
  content: string;
  knowledgeBaseIds?: string[];
  citationReferences?: CitationReference[];
}

interface ThinkingMessageBlock extends MessageBlockBase {
  type: MessageBlockType.THINKING;
  content: string;
  thinking_millsec: number;
}

interface TranslationMessageBlock extends MessageBlockBase {
  type: MessageBlockType.TRANSLATION;
  content: string;
  sourceBlockId?: string;
  targetLanguage: string;
}

interface CodeMessageBlock extends MessageBlockBase {
  type: MessageBlockType.CODE;
  content: string;
  language: string;
}

interface ImageMessageBlock extends MessageBlockBase {
  type: MessageBlockType.IMAGE;
  url?: string;
  file?: FileMetadata;              // F004 reference
}

interface ToolMessageBlock extends MessageBlockBase {
  type: MessageBlockType.TOOL;
  toolId: string;
  toolName?: string;
  arguments?: Record<string, unknown>;
  content?: string | object;
}

interface CitationMessageBlock extends MessageBlockBase {
  type: MessageBlockType.CITATION;
  response?: WebSearchResponse;
  knowledge?: KnowledgeReference[];
  memories?: MemoryItem[];           // F008 reference
}

interface FileMessageBlock extends MessageBlockBase {
  type: MessageBlockType.FILE;
  file: FileMetadata;               // F004 reference
}

interface VideoMessageBlock extends MessageBlockBase {
  type: MessageBlockType.VIDEO;
  url?: string;
  filePath?: string;
}

interface CompactMessageBlock extends MessageBlockBase {
  type: MessageBlockType.COMPACT;
  content: string;
  compactedContent: string;
}

// ── Union Type ──
type MessageBlock =
  | MainTextMessageBlock
  | ThinkingMessageBlock
  | TranslationMessageBlock
  | CodeMessageBlock
  | ImageMessageBlock
  | ToolMessageBlock
  | CitationMessageBlock
  | FileMessageBlock
  | VideoMessageBlock
  | CompactMessageBlock;
```

### 6. AssistantPreset

```typescript
interface AssistantPreset {
  id: string;                           // UUID v4
  name: string;
  prompt: string;
  settings: Partial<AssistantSettings>;
  model?: Model;
  emoji?: string;
  description?: string;
}
```

### 7. SerializedError

```typescript
interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}
```

### 8. Stream Processing Types

```typescript
enum ChunkType {
  LLM_RESPONSE_CREATED = 'llm_response_created',
  TEXT_START = 'text_start',
  TEXT_DELTA = 'text_delta',
  TEXT_COMPLETE = 'text_complete',
  THINKING_START = 'thinking_start',
  THINKING_DELTA = 'thinking_delta',
  THINKING_COMPLETE = 'thinking_complete',
  TOOL_CALL_PENDING = 'tool_call_pending',
  TOOL_CALL_IN_PROGRESS = 'tool_call_in_progress',
  TOOL_CALL_COMPLETE = 'tool_call_complete',
  TOOL_ARGUMENT_STREAMING = 'tool_argument_streaming',
  EXTERNAL_TOOL_IN_PROGRESS = 'external_tool_in_progress',
  EXTERNAL_TOOL_COMPLETE = 'external_tool_complete',
  LLM_WEB_SEARCH_START = 'llm_web_search_start',
  LLM_WEB_SEARCH_COMPLETE = 'llm_web_search_complete',
  IMAGE_CREATED = 'image_created',
  IMAGE_DELTA = 'image_delta',
  IMAGE_GENERATED = 'image_generated',
  VIDEO_SEARCHED = 'video_searched',
  ERROR = 'error',
  BLOCK_COMPLETE = 'block_complete',
  RAW_DATA = 'raw_data',
}

interface Chunk {
  type: ChunkType;
  data: unknown;                        // Type depends on ChunkType
}
```

### 9. Constants

```typescript
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_CONTEXTCOUNT = 5;
const MAX_CONTEXT_COUNT = 100;
const UNLIMITED_CONTEXT_COUNT = -1;
const STREAM_STEP_COUNT = 20;
const STREAM_MAX_RETRIES = 0;
```

---

## Dexie Database Schema

```typescript
class ChatDatabase extends Dexie {
  assistants!: Table<Assistant, string>;
  topics!: Table<Topic, string>;
  messages!: Table<Message, string>;
  messageBlocks!: Table<MessageBlock, string>;

  constructor() {
    super('angdu-chat');

    this.version(1).stores({
      assistants: 'id, name',
      topics: 'id, assistantId, [assistantId+updatedAt]',
      messages: 'id, topicId, askId, [topicId+createdAt]',
      messageBlocks: 'id, messageId, [messageId+createdAt]',
    });
  }
}
```

---

## Relationships

```
Assistant (1) ──has many──> Topic (*)
Topic (1) ──has many──> Message (*) [via topicId]
Message (1) ──has many──> MessageBlock (*) [via blocks[] IDs / messageId]
Assistant ──references──> Model (F002) [via model, defaultModel fields]
Message ──references──> Model (F002) [via model, modelId fields]
MessageBlock ──references──> Model (F002) [via model field]
Assistant ──references──> MCPServer (F006) [via mcpServers]
Assistant ──references──> KnowledgeBase (F007) [via knowledge_bases]
```

---

## State Machine: MessageBlockStatus

```
PENDING ──→ PROCESSING ──→ STREAMING ──→ SUCCESS (terminal)
                │               │
                └──→ ERROR      ├──→ ERROR (terminal)
                    (terminal)  │
                                └──→ PAUSED ──→ STREAMING
                                          └──→ ERROR (terminal)
```

Valid transitions map:
```typescript
const VALID_TRANSITIONS: Record<MessageBlockStatus, MessageBlockStatus[]> = {
  [MessageBlockStatus.PENDING]: [MessageBlockStatus.PROCESSING],
  [MessageBlockStatus.PROCESSING]: [MessageBlockStatus.STREAMING, MessageBlockStatus.ERROR],
  [MessageBlockStatus.STREAMING]: [MessageBlockStatus.SUCCESS, MessageBlockStatus.ERROR, MessageBlockStatus.PAUSED],
  [MessageBlockStatus.PAUSED]: [MessageBlockStatus.STREAMING, MessageBlockStatus.ERROR],
  [MessageBlockStatus.SUCCESS]: [],
  [MessageBlockStatus.ERROR]: [],
};
```

---

## Validation Rules

- `Assistant.id` must be unique UUID v4
- `Assistant.name` must be non-empty
- `Assistant.prompt` can be empty string
- `Assistant.topics` must be an array (normalize legacy non-array data)
- `Assistant.mcpMode` defaults to `'disabled'`; if `mcpServers` is non-empty and mcpMode absent, default to `'manual'`
- `Topic.assistantId` must reference a valid Assistant
- `Topic.name` auto-generated from first message if not manually set
- `Message.role` must be one of `'user' | 'assistant' | 'system'`
- `Message.blocks` must contain valid MessageBlock IDs
- `Message.status` for user messages is always `'success'`
- `MessageBlock.type` must be one of the 11 enum values
- `MessageBlock.status` transitions must follow the valid transitions map
- `MessageBlockStatus` transitions are validated — invalid transitions are rejected with error log
