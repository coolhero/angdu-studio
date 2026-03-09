# Hooks API Contracts: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

---

## Custom Hooks

### useAssistant

Convenience hook for accessing and updating the active assistant.

```typescript
function useAssistant(id: string): {
  assistant: Assistant | null
  model: Model | null
  topics: Topic[]
  addTopic: () => Topic
  setModel: (model: Model) => void
  updateSettings: (settings: Partial<AssistantSettings>) => void
}
```

### useChatContext

Multi-select and interaction context for the chat area.

```typescript
function useChatContext(topic: Topic): {
  isMultiSelectMode: boolean
  selectedMessageIds: Set<string>
  toggleMultiSelect: () => void
  selectMessage: (id: string) => void
  deselectMessage: (id: string) => void
  clearSelection: () => void
}
```

### useMessageOperations

CRUD operations on messages within a topic.

```typescript
function useMessageOperations(topic: Topic): {
  editMessage: (messageId: string, content: string) => Promise<void>
  resendMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  retryMessage: (messageId: string) => Promise<void>
  pauseMessage: (messageId: string) => void
  clearTopicMessages: () => Promise<void>
  createBranch: (messageId: string) => Promise<Topic>
}
```

### useTopicMessages

Select messages for a topic with block resolution.

```typescript
function useTopicMessages(topicId: string): {
  messages: Message[]
  isLoading: boolean
  loadMore: () => void
  hasMore: boolean
}
```

### useTopicLoading

Streaming/loading state for a topic.

```typescript
function useTopicLoading(topicId: string): {
  isLoading: boolean
  isStreaming: boolean
}
```

### useInputText

Controlled text input with draft caching (24h TTL).

```typescript
function useInputText(topicId: string): {
  text: string
  setText: (text: string) => void
  clearText: () => void
}
```

### useTextareaResize

Auto-resize textarea with expand/collapse.

```typescript
function useTextareaResize(ref: React.RefObject<HTMLElement>): {
  isExpanded: boolean
  toggleExpand: () => void
  maxHeight: number
  minHeight: number
}
```

### useScrollPosition

Persist and restore scroll position per topic.

```typescript
function useScrollPosition(key: string): {
  scrollRef: React.RefObject<HTMLElement>
  savePosition: () => void
  restorePosition: () => void
}
```

### useSmoothStream

Character-by-character streaming animation with buffer management.

```typescript
function useSmoothStream(): {
  displayedText: string
  isAnimating: boolean
  addChunk: (chunk: string) => void
  flush: () => void
  reset: () => void
}
```

### useSettings

Read settings from useSettingsStore with typed selector.

```typescript
function useSettings<K extends keyof SettingsState>(key: K): SettingsState[K]
function useSettings(): SettingsState
```

### useShortcut

Keyboard shortcut registration wrapping react-hotkeys-hook.

```typescript
function useShortcut(
  name: string,
  handler: () => void,
  options?: { enabled?: boolean; scopes?: string[] }
): void
```

### useRuntime

Access runtime state from useRuntimeStore.

```typescript
function useRuntime(): {
  activeAssistantId: string | null
  activeTopicId: string | null
  isGenerating: boolean
  setActiveAssistant: (id: string | null) => void
  setActiveTopic: (id: string | null) => void
}
```

### useShowAssistants / useShowTopics

Toggle sidebar panel visibility.

```typescript
function useShowAssistants(): [boolean, (show: boolean) => void]
function useShowTopics(): [boolean, (show: boolean) => void]
```

### useConfirmDialog

Promise-based confirmation dialog.

```typescript
function useConfirmDialog(): {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}
```

### useTimer

Debounced/throttled timer management.

```typescript
function useTimer(callback: () => void, delay: number, type: 'debounce' | 'throttle'): {
  trigger: () => void
  cancel: () => void
}
```
