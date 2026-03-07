# Store API Contracts: AI Chat (F005)

## useAssistantStore

Zustand store with persist + broadcastSync middleware.

### State

```typescript
interface AssistantState {
  defaultAssistant: Assistant
  assistants: Assistant[]
  tagsOrder: string[]
  collapsedTags: Record<string, boolean>
}
```

### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| addAssistant | (assistant: Assistant) => void | Prepend to assistants array |
| removeAssistant | (id: string) => void | Remove assistant and all topics |
| updateAssistant | (id: string, updates: Partial\<Assistant\>) => void | Merge partial updates |
| updateAssistantSettings | (id: string, settings: Partial\<AssistantSettings\>) => void | Merge settings (initialize if undefined) |
| addTopic | (assistantId: string, topic: Topic) => void | Prepend topic, set timestamps, deduplicate |
| removeTopic | (assistantId: string, topicId: string) => void | Remove topic from assistant |
| updateTopic | (assistantId: string, topic: Partial\<Topic\> & { id: string }) => void | Update single topic |
| updateTopics | (assistantId: string, topics: Topic[]) => void | Bulk update topics |
| removeAllTopics | (assistantId: string) => void | Clear all topics, reset to default |
| setDefaultAssistant | (assistant: Assistant) => void | Update default assistant |

### Selectors

| Selector | Return | Description |
|----------|--------|-------------|
| getAssistant | (id: string) => Assistant \| undefined | Find by ID |
| getAllTopics | () => Topic[] | Flatten all topics |
| getTopicsForAssistant | (id: string) => Topic[] | Topics for specific assistant |

---

## useMessageStore

Zustand store (NO persist — Dexie is source of truth) with broadcastSync for active topic.

### State

```typescript
interface MessageState {
  messagesByTopic: Record<string, string[]>   // topicId → ordered message IDs
  entities: Record<string, Message>            // messageId → Message
  blockEntities: Record<string, MessageBlock>  // blockId → MessageBlock
  currentTopicId: string | null
  loadingByTopic: Record<string, boolean>
  displayCount: number
}
```

### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| loadTopicMessages | (topicId: string) => Promise\<void\> | Load from Dexie, populate entities + messagesByTopic |
| addMessage | (topicId: string, message: Message) => void | Add to entities + append to messagesByTopic |
| updateMessage | (topicId: string, messageId: string, updates: Partial\<Message\>) => void | Merge updates |
| removeMessage | (topicId: string, messageId: string) => void | Remove from entities + messagesByTopic + blocks |
| removeMessages | (topicId: string, messageIds: string[]) => void | Batch remove |
| upsertBlock | (block: MessageBlock) => void | Add/update block in blockEntities |
| upsertBlocks | (blocks: MessageBlock[]) => void | Batch upsert |
| removeBlock | (blockId: string) => void | Remove single block |
| removeBlocks | (blockIds: string[]) => void | Batch remove |
| upsertBlockReference | (messageId: string, blockId: string, blockType: BlockType) => void | Smart insert: THINKING prepend, others append |
| clearTopicMessages | (topicId: string) => void | Remove all messages + blocks for topic |

### Selectors

| Selector | Return | Description |
|----------|--------|-------------|
| getMessagesForTopic | (topicId: string) => Message[] | Ordered messages for topic |
| getMessage | (id: string) => Message \| undefined | Single message by ID |
| getBlock | (id: string) => MessageBlock \| undefined | Single block by ID |
| getBlocksForMessage | (messageId: string) => MessageBlock[] | Ordered blocks for message |

---

## useRuntimeStore

Zustand store (NO persist, NO broadcastSync — purely transient per-window).

### State

```typescript
interface RuntimeState {
  activeAssistantId: string | null
  activeTopicId: string | null
  generating: Record<string, boolean>     // topicId → is generating
  streamingMessageId: string | null
  renamingTopics: Set<string>             // topic IDs being renamed
}
```

### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| setActiveAssistant | (id: string) => void | Set active assistant |
| setActiveTopic | (id: string) => void | Set active topic |
| setGenerating | (topicId: string, value: boolean) => void | Mark topic as generating |
| setStreamingMessage | (messageId: string \| null) => void | Track active streaming message |
| addRenamingTopic | (topicId: string) => void | Lock topic for rename |
| removeRenamingTopic | (topicId: string) => void | Unlock topic rename |
