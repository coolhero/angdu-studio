# IPC Contracts: Chat Conversation

All invoke channels use `ipcRenderer.invoke()` / `ipcMain.handle()`. Data operations execute in the main process against SQLite via Drizzle ORM. All channels MUST be whitelisted in `preload/index.ts`.

---

## Topic Channels

### `chat:getTopics`

- **Request**: `{ assistantId: string }`
- **Response**: `Topic[]`
- **Description**: Returns all topics for the given assistant, ordered by `updatedAt` DESC.
- **Error**: `{ code: 'INVALID_ASSISTANT', message: string }` if assistantId is empty

### `chat:createTopic`

- **Request**: `{ assistantId: string, name?: string }`
- **Response**: `Topic`
- **Description**: Creates a new topic with generated ID and timestamps. Default name: "New Topic".
- **Side effect**: Inserts row into `topics` table.

### `chat:deleteTopic`

- **Request**: `{ topicId: string }`
- **Response**: `void`
- **Description**: Deletes the topic and all associated messages/blocks (FK cascade).
- **Side effect**: Cascade deletes from `messages` and `message_blocks` tables.
- **Error**: `{ code: 'NOT_FOUND', message: string }` if topicId doesn't exist

### `chat:renameTopic`

- **Request**: `{ topicId: string, name: string }`
- **Response**: `void`
- **Description**: Updates topic name. Sets `isNameManuallyEdited = true`.
- **Side effect**: Updates `topics` table.
- **Error**: `{ code: 'NOT_FOUND', message: string }` if topicId doesn't exist
- **Error**: `{ code: 'VALIDATION', message: string }` if name is empty or > 200 chars

---

## Message Channels

### `chat:getMessages`

- **Request**: `{ topicId: string, offset?: number, limit?: number }`
- **Response**: `{ messages: Message[], hasMore: boolean }`
- **Description**: Returns messages for the topic, ordered by `createdAt` ASC. Default offset: 0, default limit: 50. `hasMore` is true if more messages exist beyond the returned window.
- **Note**: Returns newest messages first when offset=0, so the client sees the most recent conversation. Pagination loads older messages (increasing offset).

### `chat:addMessage`

- **Request**: `{ message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> }`
- **Response**: `Message`
- **Description**: Creates a message with generated ID and timestamps.
- **Side effect**: Inserts row into `messages` table. Increments topic `messageCount`.
- **Error**: `{ code: 'INVALID_TOPIC', message: string }` if topicId doesn't reference existing topic

### `chat:updateMessage`

- **Request**: `{ id: string, updates: Partial<Message> }`
- **Response**: `Message`
- **Description**: Merges updates into existing message. Sets `updatedAt`.
- **Side effect**: Updates `messages` table.
- **Error**: `{ code: 'NOT_FOUND', message: string }` if message doesn't exist

### `chat:deleteMessage`

- **Request**: `{ id: string }`
- **Response**: `void`
- **Description**: Deletes the message and all associated blocks (FK cascade).
- **Side effect**: Cascade deletes from `message_blocks`. Decrements topic `messageCount`.
- **Error**: `{ code: 'NOT_FOUND', message: string }` if message doesn't exist

### `chat:deleteMessagesAfter`

- **Request**: `{ topicId: string, afterMessageId: string }`
- **Response**: `{ deletedCount: number }`
- **Description**: Deletes all messages in the topic that were created after the specified message. Used by edit-and-resend flow.
- **Side effect**: Cascade deletes blocks. Updates topic `messageCount`.

---

## Block Channels

### `chat:getBlocks`

- **Request**: `{ messageId: string }`
- **Response**: `MessageBlock[]`
- **Description**: Returns all blocks for the message, ordered by `sortOrder` ASC.

### `chat:getBlocksBatch`

- **Request**: `{ messageIds: string[] }`
- **Response**: `Record<string, MessageBlock[]>`
- **Description**: Batch loads blocks for multiple messages. Returns a map of messageId to ordered blocks. Used on topic load to avoid N+1 IPC calls.

### `chat:addBlock`

- **Request**: `{ block: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'> }`
- **Response**: `MessageBlock`
- **Description**: Creates a block with generated ID and timestamps.
- **Side effect**: Inserts row into `message_blocks` table.

### `chat:updateBlock`

- **Request**: `{ id: string, updates: Partial<MessageBlock> }`
- **Response**: `MessageBlock`
- **Description**: Merges updates into existing block. Sets `updatedAt`.
- **Side effect**: Updates `message_blocks` table.

### `chat:updateBlocksBatch`

- **Request**: `{ blocks: Array<{ id: string, updates: Partial<MessageBlock> }> }`
- **Response**: `void`
- **Description**: Batch updates multiple blocks in a single transaction. Used by `flushStreamingBlocks` to persist all streaming updates at once.
- **Side effect**: Updates `message_blocks` table within a transaction.

---

## Topic Naming Channel

### `chat:generateTopicName`

- **Request**: `{ topicId: string, messages: Array<{ role: string, content: string }> }`
- **Response**: `{ name: string }`
- **Description**: Generates a concise topic title (3-7 words) from the provided messages using the active model via F004 AI core. Only called when `isNameManuallyEdited` is false.
- **Side effect**: Updates topic name in `topics` table. Does NOT set `isNameManuallyEdited`.
- **Error**: `{ code: 'GENERATION_FAILED', message: string }` — falls back to truncated first message content.

---

## Assistant Channels

### `assistant:getAll`

- **Request**: `void`
- **Response**: `Assistant[]`
- **Description**: Returns all assistants. The default assistant is always included.
- **Note**: Assistants are primarily managed in Zustand/localStorage, but IPC provides a sync/backup mechanism and enables cross-window consistency.

### `assistant:add`

- **Request**: `{ assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'> }`
- **Response**: `Assistant`
- **Description**: Creates an assistant with generated ID and timestamps.

### `assistant:update`

- **Request**: `{ id: string, updates: Partial<Assistant> }`
- **Response**: `Assistant`
- **Description**: Merges updates into existing assistant.
- **Error**: `{ code: 'NOT_FOUND', message: string }` if assistant doesn't exist
- **Error**: `{ code: 'DEFAULT_IMMUTABLE', message: string }` if attempting to delete/rename default assistant's `isDefault` flag

### `assistant:delete`

- **Request**: `{ id: string }`
- **Response**: `void`
- **Description**: Deletes the assistant. Reassigns orphaned topics to the default assistant.
- **Error**: `{ code: 'DEFAULT_PROTECTED', message: string }` if id === 'default'
- **Side effect**: Updates `topics` table, setting `assistantId = 'default'` for orphaned topics.

### `assistant:import`

- **Request**: `{ data: string }`
- **Response**: `Assistant[]`
- **Description**: Parses the JSON string, validates each assistant, generates new IDs to avoid collisions, and imports them. Returns the imported assistants.
- **Error**: `{ code: 'INVALID_FORMAT', message: string }` if JSON is malformed or fails validation

### `assistant:export`

- **Request**: `{ ids: string[] }`
- **Response**: `string`
- **Description**: Serializes the specified assistants to a JSON string. Excludes runtime-only fields (topics array is excluded from export — topics are device-specific).

---

## Channel Registration

All channels MUST be registered in the preload whitelist:

```typescript
// preload/index.ts — additions for F005
const F005_INVOKE_CHANNELS = [
  'chat:getTopics',
  'chat:createTopic',
  'chat:deleteTopic',
  'chat:renameTopic',
  'chat:getMessages',
  'chat:addMessage',
  'chat:updateMessage',
  'chat:deleteMessage',
  'chat:deleteMessagesAfter',
  'chat:getBlocks',
  'chat:getBlocksBatch',
  'chat:addBlock',
  'chat:updateBlock',
  'chat:updateBlocksBatch',
  'chat:generateTopicName',
  'assistant:getAll',
  'assistant:add',
  'assistant:update',
  'assistant:delete',
  'assistant:import',
  'assistant:export',
] as const

// Already registered by F004 (consumed by F005):
// 'ai:chat', 'ai:abort'

// F004 event channels (listened by F005):
// 'ai:stream-chunk', 'ai:stream-complete', 'ai:stream-error'
```

---

## Error Shape

All IPC errors follow the F001 serialized error pattern:

```typescript
interface IPCError {
  code: string        // Machine-readable error code
  message: string     // Human-readable error message
  details?: unknown   // Optional additional context
}
```

Error codes used by F005:

| Code | Channel(s) | Description |
|------|-----------|-------------|
| `NOT_FOUND` | chat:updateMessage, chat:deleteMessage, chat:renameTopic, chat:deleteTopic, assistant:update | Entity not found |
| `INVALID_TOPIC` | chat:addMessage | topicId references non-existent topic |
| `INVALID_ASSISTANT` | chat:getTopics | assistantId is empty |
| `VALIDATION` | chat:renameTopic | Input validation failed |
| `DEFAULT_PROTECTED` | assistant:delete | Attempted to delete default assistant |
| `DEFAULT_IMMUTABLE` | assistant:update | Attempted to modify immutable default fields |
| `INVALID_FORMAT` | assistant:import | Import JSON is malformed |
| `GENERATION_FAILED` | chat:generateTopicName | AI naming failed |
| `DB_ERROR` | any | Database operation failed |
