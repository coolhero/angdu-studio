# Store API Contracts: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

---

## useRuntimeStore

```typescript
interface RuntimeState {
  // State
  activeAssistantId: string | null
  activeTopicId: string | null
  activeSessionId: string | null
  activeAgentId: string | null
  isMultiSelectMode: boolean
  selectedMessageIds: Set<string>
  generatingTopicIds: Set<string>

  // Derived
  isGenerating: (topicId: string) => boolean

  // Actions
  setActiveAssistant: (id: string | null) => void
  setActiveTopic: (id: string | null) => void
  setActiveSession: (id: string | null) => void
  setActiveAgent: (id: string | null) => void
  toggleMultiSelect: () => void
  selectMessage: (id: string) => void
  deselectMessage: (id: string) => void
  clearSelection: () => void
  setGenerating: (topicId: string, isGenerating: boolean) => void
}
```

**Persistence**: None (transient runtime state)

---

## useSettingsStore

```typescript
interface SettingsState {
  // State
  sendMessageShortcut: 'Enter' | 'Shift+Enter' | 'Ctrl+Enter' | 'Meta+Enter'
  narrowMode: boolean
  messageStyle: 'bubble' | 'plain'
  messageFont: string
  fontSize: number
  showPrompt: boolean
  showMessageOutline: boolean
  showInputEstimatedTokens: boolean
  messageNavigation: 'none' | 'buttons' | 'anchor'
  topicPosition: 'left' | 'right'
  showAssistants: boolean
  showTopics: boolean
  mathEngine: 'katex' | 'mathjax'
  mathEnableSingleDollar: boolean
  enableQuickPanelTriggers: boolean
  codeStyle: 'auto' | 'dark' | 'light'
  codeFontFamily: string

  // Actions
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  resetSettings: () => void
}
```

**Persistence**: Zustand persist → electron-store via IPC
**Version**: 1, with migrate function for schema evolution

---

## useInputToolsStore

```typescript
interface InputToolsState {
  // State
  toolOrder: Record<InputbarScope, { visible: string[]; hidden: string[] }>
  isCollapsed: boolean

  // Actions
  setToolOrder: (scope: InputbarScope, order: { visible: string[]; hidden: string[] }) => void
  toggleCollapsed: () => void
  moveToolToVisible: (scope: InputbarScope, key: string) => void
  moveToolToHidden: (scope: InputbarScope, key: string) => void
  reorderTool: (scope: InputbarScope, fromIndex: number, toIndex: number) => void
}

type InputbarScope = 'chat' | 'session' | 'mini'
```

**Persistence**: Zustand persist (toolOrder only, isCollapsed excluded via partialize)

---

## Consumed Store Contracts (from upstream)

### From F003: useAssistantsStore

Key actions consumed by F005:
- `assistants`: `Assistant[]` — sidebar list rendering
- `addAssistant(assistant)` — create new assistant from sidebar
- `updateAssistant(id, partial)` — edit assistant settings
- `removeAssistant(id)` — delete assistant
- `addTopic(assistantId, topic)` — create new topic
- `removeTopic(assistantId, topicId)` — delete topic
- `hydrate()` — load assistants from Dexie on startup

### From F003: useMessageStore

Key actions consumed by F005:
- `messagesByTopic`: `Map<string, string[]>` — message IDs per topic
- `messages`: `Map<string, Message>` — message lookup
- `loadMessagesForTopic(topicId)` — lazy load on topic switch
- `createUserMessage(content, topicId, assistantId, attachments?)` — send message
- `removeMessage(id)` — delete single message
- `removeMessagesByAskId(askId)` — delete message group
- `setDisplayCount(topicId, count)` — pagination for infinite scroll

### From F003: useMessageBlockStore

Key actions consumed by F005:
- `blocks`: `Map<string, MessageBlock>` — block lookup
- `getBlocksForMessage(messageId)` — get ordered blocks for rendering
- `loadBlocksForMessages(messageIds)` — batch load blocks for topic
- `transitionStatus(blockId, newStatus)` — streaming status updates

### From F002: useProviderStore

- `providers`: `Provider[]` — for model selection UI
- Provider/Model display data for message headers and input bar

### From F001: useThemeStore

- `theme`: `ThemeMode` — for Shiki code theme selection, markdown CSS
