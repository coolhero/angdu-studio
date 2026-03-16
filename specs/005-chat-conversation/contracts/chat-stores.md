# Store Contracts: Chat Conversation

All stores use Zustand 5 with TypeScript strict mode. Selector patterns MUST use `useShallow` for array/object returns to prevent infinite re-render loops.

---

## useAssistantStore

Manages assistant configurations. Persisted to localStorage via Zustand `persist` middleware.

### State

```typescript
interface AssistantState {
  assistants: Assistant[]
  activeAssistantId: string           // currently selected assistant ID
  searchQuery: string                 // filter query for assistant list
}
```

### Actions

```typescript
interface AssistantActions {
  // Lifecycle
  hydrate(): Promise<void>
  // Reads assistant data from IPC (assistant:getAll) and merges with
  // localStorage state. Called once on app startup.

  // CRUD
  addAssistant(assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assistant>
  // Creates assistant with generated id + timestamps.
  // Calls assistant:add IPC. Appends to assistants[].

  updateAssistant(id: string, updates: Partial<Assistant>): Promise<void>
  // Merges updates into existing assistant. Sets updatedAt.
  // Calls assistant:update IPC. Updates assistants[] in-place.

  deleteAssistant(id: string): Promise<void>
  // Removes assistant from assistants[]. REJECTS if id === 'default'.
  // Calls assistant:delete IPC. If deleted assistant was active,
  // sets activeAssistantId to 'default'.

  // Selection
  setActiveAssistant(id: string): void
  // Sets activeAssistantId. Triggers topic list reload for the new assistant.

  // Search
  setSearchQuery(query: string): void

  // Derived (computed, not stored)
  getActiveAssistant(): Assistant
  // Returns assistants.find(a => a.id === activeAssistantId) ?? defaultAssistant

  getFilteredAssistants(): Assistant[]
  // Filters by searchQuery against name, description, tags. Case-insensitive.

  // Import/Export
  importAssistants(data: string): Promise<Assistant[]>
  // Parses JSON, validates, calls assistant:import IPC. Returns imported assistants.

  exportAssistants(ids: string[]): Promise<string>
  // Calls assistant:export IPC. Returns JSON string.
}
```

### Persist Config

```typescript
{
  name: 'angdu-assistant-store',
  partialize: (state) => ({
    assistants: state.assistants,
    activeAssistantId: state.activeAssistantId,
  }),
}
```

### Selector Examples

```typescript
// CORRECT — useShallow for object return
const { assistants, activeAssistantId } = useAssistantStore(
  useShallow(s => ({ assistants: s.assistants, activeAssistantId: s.activeAssistantId }))
)

// CORRECT — primitive selector, no useShallow needed
const activeId = useAssistantStore(s => s.activeAssistantId)

// WRONG — creates new array every render
const filtered = useAssistantStore(s => s.assistants.filter(...))
```

---

## useTopicStore

Manages topics for the active assistant. Topics are loaded from SQLite via IPC on assistant switch.

### State

```typescript
interface TopicState {
  topics: Topic[]                     // topics for activeAssistantId
  activeTopicId: string | null        // currently selected topic
  sidebarVisible: boolean             // topic sidebar toggle state
  loading: boolean                    // true while loading topics from IPC
}
```

### Actions

```typescript
interface TopicActions {
  // Lifecycle
  hydrate(assistantId: string): Promise<void>
  // Loads topics from chat:getTopics(assistantId). Sets topics[].
  // Auto-selects the most recent topic or creates one if none exist.

  // CRUD
  createTopic(assistantId: string, name?: string): Promise<Topic>
  // Calls chat:createTopic IPC. Prepends to topics[]. Sets as active.

  deleteTopic(topicId: string): Promise<void>
  // Calls chat:deleteTopic IPC. Removes from topics[].
  // If deleted topic was active, selects the next topic or creates a new one.

  renameTopic(topicId: string, name: string): Promise<void>
  // Calls chat:renameTopic IPC. Updates topic in-place.
  // Sets isNameManuallyEdited = true.

  updateTopicName(topicId: string, name: string): void
  // Updates name without setting isNameManuallyEdited (used by auto-naming).

  // Navigation
  switchTopic(topicId: string): void
  // Sets activeTopicId. Triggers message list reload.

  // UI
  toggleSidebar(): void
  // Flips sidebarVisible. Persisted to localStorage.

  // Derived
  getActiveTopic(): Topic | null
  // Returns topics.find(t => t.id === activeTopicId) ?? null
}
```

### Persist Config

```typescript
{
  name: 'angdu-topic-store',
  partialize: (state) => ({
    sidebarVisible: state.sidebarVisible,
    // topics and activeTopicId are NOT persisted — loaded from SQLite on hydrate
  }),
}
```

---

## useMessageStore

Manages messages for the active topic. Messages are loaded from SQLite via IPC with pagination.

### State

```typescript
interface MessageState {
  messages: Message[]                 // messages for activeTopicId (paginated window)
  hasMore: boolean                    // true if older messages exist beyond current window
  loading: boolean                    // true while loading from IPC
}
```

### Actions

```typescript
interface MessageActions {
  // Loading
  loadMessages(topicId: string, options?: { offset?: number; limit?: number }): Promise<void>
  // Calls chat:getMessages IPC. Default limit: 50.
  // Replaces messages[] on initial load, prepends on loadMore.

  loadMoreMessages(topicId: string): Promise<void>
  // Loads next page of older messages. Sets hasMore based on result count.

  clearMessages(): void
  // Empties messages[]. Called on topic switch before loading new topic's messages.

  // CRUD
  addMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message>
  // Calls chat:addMessage IPC. Appends to messages[].

  updateMessage(id: string, updates: Partial<Message>): Promise<void>
  // Calls chat:updateMessage IPC. Updates message in-place.

  deleteMessage(id: string): Promise<void>
  // Calls chat:deleteMessage IPC. Removes from messages[].

  // Bulk
  replaceLastAssistantMessage(message: Message): void
  // Replaces the last assistant message (used by regenerate flow).
}
```

---

## useChatStore

Orchestrates the chat send/receive lifecycle. Coordinates between message store, block store, and F004 AI core IPC.

### State

```typescript
interface ChatState {
  isStreaming: boolean                 // true while receiving stream chunks
  activeRequestId: string | null      // current ai:chat request ID
  error: SerializedError | null       // last error
  streamingMessageId: string | null   // message currently being streamed into
}
```

### Actions

```typescript
interface ChatActions {
  sendMessage(content: string, attachments?: DraftAttachment[]): Promise<void>
  // Full send flow:
  // 1. Create user Message + blocks via messageStore.addMessage
  // 2. Create placeholder assistant Message (status: 'sending')
  // 3. Build context via ContextBuilder (system prompt + windowed history)
  // 4. Invoke ai:chat IPC with { providerId, modelId, messages, options }
  // 5. Subscribe to ai:stream-chunk → BlockBuilder → blockStore.updateBlock
  // 6. On ai:stream-complete → update message status to 'success'
  // 7. On ai:stream-error → create ErrorBlock, update message status
  // 8. Clear draft for current topic

  stopGeneration(): void
  // Calls ai:abort with activeRequestId. Sets isStreaming = false.
  // Streaming message status → 'paused'. Preserves partial blocks.

  regenerate(messageId?: string): Promise<void>
  // If messageId provided, regenerate from that message.
  // Otherwise, regenerate the last assistant message.
  // 1. Delete the target assistant message's blocks
  // 2. Reset message status to 'sending'
  // 3. Re-send with same context (minus the old response)

  editAndResend(messageId: string, newContent: string): Promise<void>
  // 1. Update the user message content
  // 2. Delete all messages after the edited message
  // 3. sendMessage with updated context

  clearError(): void
  // Sets error = null.
}
```

### Stream Event Handlers (internal)

```typescript
// Registered during sendMessage, unregistered on complete/error/unmount
_onStreamChunk(data: { requestId: string; chunk: NormalizedChunk }): void
_onStreamComplete(data: { requestId: string; usage?: TokenUsage }): void
_onStreamError(data: { requestId: string; error: SerializedError }): void
```

---

## useDraftStore

Manages unsent message drafts per topic. Persisted to localStorage.

### State

```typescript
interface DraftState {
  drafts: Record<string, DraftContent>  // keyed by topicId
}
```

### Actions

```typescript
interface DraftActions {
  saveDraft(topicId: string, content: DraftContent): void
  // Saves or updates draft for the given topic. Debounced (300ms) to avoid
  // excessive localStorage writes on every keystroke.

  loadDraft(topicId: string): DraftContent | null
  // Returns the saved draft for the topic, or null if none.

  clearDraft(topicId: string): void
  // Removes the draft for the given topic. Called after successful send.

  clearAllDrafts(): void
  // Removes all drafts. Called on data reset.
}
```

### Persist Config

```typescript
{
  name: 'angdu-draft-store',
  partialize: (state) => ({ drafts: state.drafts }),
}
```

---

## useBlockStore

Manages message blocks with a flat normalized structure. Blocks are loaded from SQLite via IPC but kept in a normalized map for efficient streaming updates.

### State

```typescript
interface BlockState {
  blocks: Record<string, MessageBlock>       // keyed by block.id
  blocksByMessage: Record<string, string[]>  // messageId → ordered block IDs
}
```

### Actions

```typescript
interface BlockActions {
  // Loading
  loadBlocks(messageId: string): Promise<void>
  // Calls chat:getBlocks IPC. Populates blocks + blocksByMessage.

  loadBlocksForMessages(messageIds: string[]): Promise<void>
  // Batch load blocks for multiple messages. Used on topic load.

  // CRUD
  addBlock(block: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageBlock>
  // Calls chat:addBlock IPC. Adds to blocks + appends ID to blocksByMessage.

  updateBlock(id: string, updates: Partial<MessageBlock>): Promise<void>
  // Calls chat:updateBlock IPC. Updates block in-place.

  updateBlockContent(id: string, content: Partial<MessageBlock['content']>): void
  // Optimistic in-memory update for streaming. Does NOT call IPC.
  // IPC persist happens on stream complete (batch write).

  deleteBlocksForMessage(messageId: string): void
  // Removes all blocks for a message from blocks + blocksByMessage.

  // Derived
  getBlocksForMessage(messageId: string): MessageBlock[]
  // Returns ordered blocks for the given message.

  // Batch persist
  flushStreamingBlocks(messageId: string): Promise<void>
  // Persists all in-memory block updates for a message to SQLite.
  // Called on stream complete.
}
```

### Streaming Update Pattern

During streaming, block content updates are HIGH FREQUENCY (every chunk, ~50-100ms). The pattern is:

1. `updateBlockContent()` — in-memory only, no IPC
2. React re-renders from the Zustand state change
3. On `ai:stream-complete` → `flushStreamingBlocks()` — single batch IPC write

This avoids IPC overhead during streaming while ensuring persistence on completion.

---

## Store Dependency Graph

```
useChatStore (orchestrator)
├── useMessageStore (message CRUD)
├── useBlockStore (block CRUD + streaming updates)
├── useDraftStore (draft lifecycle)
├── useAssistantStore (active assistant for context building)
└── useTopicStore (active topic for message loading)

useAssistantStore ←→ useTopicStore (assistant switch triggers topic reload)
useTopicStore ←→ useMessageStore (topic switch triggers message reload)
useMessageStore ←→ useBlockStore (message load triggers block load)
```

### Initialization Order

1. `useAssistantStore.hydrate()` — load assistants from IPC + localStorage
2. `useTopicStore.hydrate(activeAssistantId)` — load topics for active assistant
3. `useMessageStore.loadMessages(activeTopicId)` — load messages for active topic
4. `useBlockStore.loadBlocksForMessages(messageIds)` — load blocks for visible messages
