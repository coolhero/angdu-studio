# IPC Contracts: Model Provider

All invoke channels use `ipcRenderer.invoke()` / `ipcMain.handle()`. Provider API calls execute in the main process for security.

---

## Provider Management Channels

### `provider:list`
- **Request**: `void`
- **Response**: `Provider[]` (with apiKey decrypted in-memory, not sent to renderer — only masked version)
- **Note**: Returns providers with `apiKey: '***'` to renderer. Full keys stay in main process.

### `provider:add`
- **Request**: `{ provider: Omit<Provider, 'id' | 'models'> }`
- **Response**: `{ provider: Provider }` (with generated id, apiKey masked)
- **Side effect**: Encrypts apiKey via safeStorage, persists to config store

### `provider:update`
- **Request**: `{ id: string, updates: Partial<Provider> }`
- **Response**: `{ provider: Provider }`
- **Side effect**: If apiKey changed, re-encrypt via safeStorage

### `provider:delete`
- **Request**: `{ id: string }`
- **Response**: `void`
- **Error**: `{ code: 'SYSTEM_PROVIDER', message: string }` if isSystem: true
- **Error**: `{ code: 'IN_USE', message: string, assistants: string[] }` if models in use

### `provider:test-connection`
- **Request**: `{ id: string }`
- **Response**: `{ success: boolean, error?: string, latency?: number }`
- **Side effect**: Updates provider.isAuthed based on result

---

## Model Management Channels

### `provider:fetch-models`
- **Request**: `{ providerId: string }`
- **Response**: `{ models: Model[], cached: boolean }`
- **Side effect**: Updates provider.models in store, refreshes cache timestamp
- **Error**: `{ code: 'FETCH_FAILED', message: string }` — returns cached models if available

### `provider:add-custom-model`
- **Request**: `{ providerId: string, model: Omit<Model, 'provider'> }`
- **Response**: `{ model: Model }`

---

## AI Core Channels (consumed by F005+)

### `ai:chat`
- **Request**: `{ providerId: string, modelId: string, messages: ChatMessage[], options?: ChatOptions }`
- **Response**: Stream via IPC events (see events below)
- **Side effect**: Creates abort controller registered by requestId

### `ai:abort`
- **Request**: `{ requestId: string }`
- **Response**: `void`
- **Side effect**: Triggers abort controller for the given request

---

## IPC Event Channels (main → renderer)

### `ai:stream-chunk`
- **Payload**: `{ requestId: string, chunk: NormalizedChunk }`
- **Description**: Streamed response chunk (text, thinking, tool call, etc.)

### `ai:stream-complete`
- **Payload**: `{ requestId: string, usage?: Usage }`
- **Description**: Stream finished successfully

### `ai:stream-error`
- **Payload**: `{ requestId: string, error: SerializedError }`
- **Description**: Stream error (auth, rate limit, network, etc.)

---

## Type Definitions

### ChatMessage
```typescript
{ role: 'user' | 'assistant' | 'system', content: string | ContentPart[] }
```

### ChatOptions
```typescript
{
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean  // default true
  tools?: Tool[]
  abortSignal?: AbortSignal
  // Provider-specific options pass-through
  providerOptions?: Record<string, unknown>
}
```

### NormalizedChunk
```typescript
{
  type: 'text' | 'thinking' | 'tool-call' | 'tool-result' | 'error'
  content: string
  // type-specific fields
  toolCallId?: string
  toolName?: string
  toolArgs?: Record<string, unknown>
  thinkingMs?: number
}
```
