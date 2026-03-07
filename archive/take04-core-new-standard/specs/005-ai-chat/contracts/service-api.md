# Service API Contracts: AI Chat (F005)

## MessagesService

Main process service orchestrating the message pipeline.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| createUserMessage | (assistant: Assistant, topic: Topic, content: string, files?: FileMetadata[], mentions?: Model[]) => { message: Message, blocks: MessageBlock[] } | Create user message with blocks |
| createAssistantMessage | (assistant: Assistant, topic: Topic, model: Model) => Message | Create empty assistant message (PENDING status) |
| resetAssistantMessage | (message: Message) => Message | Clear blocks, reset to PENDING for regeneration |
| filterContextMessages | (messages: Message[], contextCount: number) => Message[] | Return last N messages for context window |
| getContextCount | (assistant: Assistant, messages: Message[]) => { current: number, max: number } | Calculate context window usage |
| checkRateLimit | (provider: Provider) => { limited: boolean, waitMs: number } | Check provider rate limit |
| deleteMessageFiles | (message: Message, blocks: MessageBlock[]) => Promise\<void\> | Cleanup files from message blocks |

### Message Pipeline (sendMessage flow)

```
1. createUserMessage(assistant, topic, content, files, mentions)
2. Persist user message + blocks to Dexie
3. createAssistantMessage(assistant, topic, model)
4. filterContextMessages(topicMessages, contextCount)
5. If KB attached: search(knowledgeBaseIds, query) → inject results into context
6. Resolve provider from model (F002)
7. checkRateLimit(provider) → delay if limited
8. executeStream(runtimeExecutor, contextMessages, model) (F003)
9. On each token: accumulate into blocks, upsertBlock, update message status
10. On completion: status → SUCCESS, persist final message + blocks
11. On error: status → ERROR, preserve partial content
12. autoRenameTopic if first message exchange
```

---

## useAssistant (Hook)

React hook for assistant management.

### Interface

```typescript
function useAssistant(id: string): {
  assistant: Assistant             // Normalized with model
  model: Model | null              // Resolved model
  addTopic: () => Topic            // Create new topic
  removeTopic: (topicId: string) => void
  updateTopic: (topic: Partial<Topic> & { id: string }) => void
  updateTopics: (topics: Topic[]) => void
  removeAllTopics: () => void
  setModel: (model: Model) => void
  updateAssistant: (updates: Partial<Assistant>) => void
  updateAssistantSettings: (settings: Partial<AssistantSettings>) => void
}
```

### Reasoning Effort Sync Rules

When model changes:
- If new model supports thinking → restore from reasoning_effort_cache or use first supported option
- If switching away from thinking model → cache current value to reasoning_effort_cache
- qwenThinkMode synced separately for Qwen models

---

## useTopic (Hook)

React hook for topic management.

### Interface

```typescript
function useTopic(assistantId: string): {
  activeTopic: Topic | null
  setActiveTopic: (topicId: string) => void
  topics: Topic[]                  // Sorted: pinned first, then by updatedAt desc
}
```

### TopicManager (Module-level utilities)

| Method | Signature | Description |
|--------|-----------|-------------|
| getTopic | (id: string) => Promise\<Topic \| null\> | Fetch from Dexie |
| getTopicMessages | (topicId: string) => Promise\<Message[]\> | Load messages from Dexie |
| removeTopic | (topicId: string) => Promise\<void\> | Clear messages, delete from DB |
| clearTopicMessages | (topicId: string) => Promise\<void\> | Remove all messages and blocks |

### autoRenameTopic

```typescript
function autoRenameTopic(assistant: Assistant, topicId: string): Promise<void>
```

**Rules**:
- Skips if topic is locked (renamingTopics set)
- Skips if isNameManuallyEdited is true
- Requires 2+ messages for AI naming
- Falls back to first message text if AI naming unavailable
- 700ms UI feedback timer for rename animation

---

## IPC Channels (if any F005-specific)

F005 primarily operates in the renderer process using Zustand stores and direct F003 API calls. No new IPC channels are added — F005 consumes existing channels from F001 (file:*), F003 (via direct import), and F004 (knowledge-base:*).

Exception: Topic auto-naming may use an IPC call to invoke the AI for summarization if this is routed through the main process. This depends on whether F003's executeStream is available in the renderer.
