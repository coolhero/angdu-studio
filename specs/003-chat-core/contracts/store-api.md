# Store API Contract: F003-chat-core

**Feature**: Chat Core
**Date**: 2026-03-09
**Status**: Draft

---

F003 exposes three Zustand stores as the primary interface for downstream Features (F005 chat-ui, F004 settings-data). No dedicated IPC channels — all renderer-side.

## 1. useAssistantsStore

```typescript
interface AssistantsStoreState {
  // ── Data ──
  assistants: Assistant[];
  tags: { order: string[]; collapsed: Record<string, boolean> };
  presets: AssistantPreset[];
  unifiedOrder: string[];               // Interleaved assistant + agent IDs

  // ── Assistant CRUD ──
  addAssistant: (assistant: Omit<Assistant, 'id' | 'topics'>) => Assistant;
  insertAssistant: (index: number, assistant: Omit<Assistant, 'id' | 'topics'>) => Assistant;
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  updateAssistantSettings: (id: string, settings: Partial<AssistantSettings>) => void;
  removeAssistant: (id: string) => void;
  reorderAssistants: (ids: string[]) => void;
  getAssistant: (id: string) => Assistant | undefined;

  // ── Topic Management ──
  addTopic: (assistantId: string, topic?: Partial<Topic>) => Topic;
  updateTopic: (assistantId: string, topicId: string, updates: Partial<Topic>) => void;
  removeTopic: (assistantId: string, topicId: string) => void;
  pinTopic: (assistantId: string, topicId: string, pinned: boolean) => void;

  // ── Tags ──
  setTagOrder: (order: string[]) => void;
  setTagCollapsed: (tag: string, collapsed: boolean) => void;

  // ── Presets ──
  addPreset: (preset: Omit<AssistantPreset, 'id'>) => AssistantPreset;
  applyPreset: (presetId: string, assistantId: string) => void;
  removePreset: (id: string) => void;

  // ── Unified Order ──
  setUnifiedOrder: (ids: string[]) => void;

  // ── Hydration ──
  hydrate: () => Promise<void>;         // Load from Dexie on startup
}
```

**Persistence**: Dexie (assistants table). Zustand persist middleware with custom Dexie storage adapter. Hydrates on app startup.

**Consumed by**: F005 (assistant list, topic list), F004 (backup/restore)

---

## 2. useMessageStore

```typescript
interface MessageStoreState {
  // ── Data ──
  messagesByTopic: Map<string, string[]>;  // topicId → message IDs (ordered)
  messages: Map<string, Message>;           // messageId → Message
  displayCount: Map<string, number>;        // topicId → display count for pagination

  // ── Message CRUD ──
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  removeMessagesByAskId: (askId: string) => void;
  removeMessagesByTopicId: (topicId: string) => void;

  // ── Block References ──
  upsertBlockReference: (messageId: string, blockId: string) => void;

  // ── Topic-Message Mapping ──
  getMessageIdsForTopic: (topicId: string) => string[];
  getMessagesForTopic: (topicId: string) => Message[];

  // ── Pagination ──
  loadMessagesForTopic: (topicId: string, limit?: number) => Promise<void>;
  loadMoreMessages: (topicId: string, count: number) => Promise<void>;
  getDisplayCount: (topicId: string) => number;
  setDisplayCount: (topicId: string, count: number) => void;

  // ── Bulk Operations ──
  clearTopicMessages: (topicId: string) => Promise<void>;
}
```

**Persistence**: Dexie (messages table). No Zustand persist — messages are loaded lazily from Dexie per topic.

**Consumed by**: F005 (message list, message rendering), F004 (backup/restore)

---

## 3. useMessageBlockStore

```typescript
interface MessageBlockStoreState {
  // ── Data ──
  blocks: Map<string, MessageBlock>;        // blockId → MessageBlock

  // ── Block CRUD ──
  addBlock: (block: MessageBlock) => void;
  updateBlock: (id: string, updates: Partial<MessageBlock>) => void;
  removeBlock: (id: string) => void;
  removeBlocksByMessageId: (messageId: string) => void;

  // ── Status Management ──
  transitionStatus: (id: string, newStatus: MessageBlockStatus) => boolean;
  // Returns false if transition is invalid (rejects and logs)

  // ── Queries ──
  getBlock: (id: string) => MessageBlock | undefined;
  getBlocksForMessage: (messageId: string) => MessageBlock[];

  // ── Bulk Operations ──
  loadBlocksForMessages: (messageIds: string[]) => Promise<void>;
}
```

**Persistence**: Dexie (messageBlocks table). No Zustand persist — blocks are loaded with their parent messages.

**Consumed by**: F005 (block rendering — text, thinking, tool, image, code, citation, etc.)

---

## Service API Contracts

### ConversationService

```typescript
class ConversationService {
  /** 9-stage message filtering pipeline */
  filterMessagesPipeline(messages: Message[], contextCount: number): Message[];

  /** Context window calculation */
  getContextCount(assistant: Assistant, messages: Message[]): { current: number; max: number };
}
```

### MessagesService

```typescript
class MessagesService {
  /** Create user message with blocks atomically */
  createUserMessage(content: string, attachments?: FileMetadata[]): { message: Message; blocks: MessageBlock[] };

  /** Rate limit check — returns remaining wait time or 0 */
  checkRateLimit(assistant: Assistant): number;

  /** Send message: construct → filter → convert → assemble → stream → process */
  sendMessage(assistant: Assistant, topic: Topic, content: string, attachments?: FileMetadata[]): Promise<void>;

  /** Retry: remove old response, re-send */
  retryMessage(assistant: Assistant, topic: Topic, askId: string): Promise<void>;
}
```

### StreamProcessingService

```typescript
class StreamProcessingService {
  /** Process a stream of chunks, creating/updating blocks */
  processStream(
    stream: AsyncIterable<Chunk>,
    messageId: string,
    abortSignal: AbortSignal,
  ): Promise<void>;
}
```

### MessageConverter

```typescript
class MessageConverter {
  /** Convert AS Messages to AI SDK ModelMessage format */
  convertMessagesToSdkMessages(messages: Message[], model: Model): ModelMessage[];
}
```

### ParameterBuilder

```typescript
class ParameterBuilder {
  /** Assemble all parameters for streamText() */
  buildStreamTextParams(
    sdkMessages: ModelMessage[],
    assistant: Assistant,
    provider: Provider,
    options?: StreamOptions,
  ): { params: StreamTextParams; modelId: string; capabilities: ModelCapability[] };
}
```
