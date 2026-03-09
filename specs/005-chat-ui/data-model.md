# Data Model: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

> F005 is a presentational feature — it owns no persistent entities. All data models are consumed from upstream features (F001, F002, F003). This document defines **UI-specific state models** (Zustand stores) and **component contracts** that F005 introduces.

---

## UI State Stores (F005-owned)

### useRuntimeStore

Transient UI runtime state. **Not persisted** — reset on app restart.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| activeAssistantId | `string \| null` | `null` | Currently selected assistant ID |
| activeTopicId | `string \| null` | `null` | Currently active topic ID |
| activeSessionId | `string \| null` | `null` | Active agent session ID (if any) |
| activeAgentId | `string \| null` | `null` | Active agent ID (if any) |
| isMultiSelectMode | `boolean` | `false` | Multi-message selection mode active |
| selectedMessageIds | `Set<string>` | `new Set()` | IDs of selected messages in multi-select |
| generatingTopicIds | `Set<string>` | `new Set()` | Topics with active streaming |

**Actions**: `setActiveAssistant(id)`, `setActiveTopic(id)`, `setActiveSession(id)`, `setActiveAgent(id)`, `toggleMultiSelect()`, `selectMessage(id)`, `deselectMessage(id)`, `clearSelection()`, `setGenerating(topicId, isGenerating)`

---

### useSettingsStore

User preferences. **Persisted** via Zustand persist → electron-store via IPC.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| sendMessageShortcut | `'Enter' \| 'Shift+Enter' \| 'Ctrl+Enter' \| 'Meta+Enter'` | `'Enter'` | Send shortcut |
| narrowMode | `boolean` | `false` | Narrow viewport layout |
| messageStyle | `'bubble' \| 'plain'` | `'plain'` | Message display style |
| messageFont | `string` | `'system'` | Message font family |
| fontSize | `number` | `14` | Base font size (px) |
| showPrompt | `boolean` | `false` | Display system prompt in chat |
| showMessageOutline | `boolean` | `false` | Show heading outline sidebar |
| showInputEstimatedTokens | `boolean` | `true` | Show token count in input |
| messageNavigation | `'none' \| 'buttons' \| 'anchor'` | `'buttons'` | Navigation control type |
| topicPosition | `'left' \| 'right'` | `'left'` | Topic sidebar position |
| showAssistants | `boolean` | `true` | Show assistants sidebar |
| showTopics | `boolean` | `true` | Show topics sidebar |
| mathEngine | `'katex' \| 'mathjax'` | `'katex'` | Math rendering engine |
| mathEnableSingleDollar | `boolean` | `true` | Allow single `$` for inline math |
| enableQuickPanelTriggers | `boolean` | `true` | Enable slash/mention triggers |
| codeStyle | `'auto' \| 'dark' \| 'light'` | `'auto'` | Code block theme |
| codeFontFamily | `string` | `'monospace'` | Code font family |

**Actions**: `setSetting<K>(key: K, value: V)`, `resetSettings()`

---

### useInputToolsStore

Input bar tool visibility and ordering. **Persisted** (tool ordering only).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| toolOrder | `Record<InputbarScope, { visible: string[]; hidden: string[] }>` | (default ordering) | Per-scope tool visibility/ordering |
| isCollapsed | `boolean` | `false` | Input bar tools collapsed |

**Actions**: `setToolOrder(scope, order)`, `toggleCollapsed()`, `moveToolToVisible(scope, key)`, `moveToolToHidden(scope, key)`, `reorderTool(scope, fromIndex, toIndex)`

---

## Component Contracts (F005-defined)

### ToolDefinition (Input Tool Registry)

```typescript
interface ToolDefinition {
  key: string
  label: string | ((t: TFunction) => string)
  icon?: React.ComponentType<{ className?: string }>
  visibleInScopes: InputbarScope[]
  condition?: (context: ToolRenderContext) => boolean
  dependencies?: {
    state: string[]
    actions: string[]
  }
  render: (context: ToolRenderContext) => React.ReactNode | null
  quickPanel?: {
    rootMenu?: QuickPanelMenuItem[]
    triggers?: QuickPanelTrigger[]
  }
  quickPanelManager?: React.ComponentType
}

type InputbarScope = 'chat' | 'session' | 'mini'

interface ToolRenderContext {
  assistant: Assistant
  topic: Topic
  model: Model | null
  t: TFunction
  state: Record<string, unknown>
  actions: Record<string, (...args: unknown[]) => void>
}
```

### ChatEvent (Event System)

```typescript
enum ChatEvent {
  SEND_MESSAGE = 'SEND_MESSAGE',
  CLEAR_MESSAGES = 'CLEAR_MESSAGES',
  NEW_CONTEXT = 'NEW_CONTEXT',
  NEW_BRANCH = 'NEW_BRANCH',
  EDIT_CODE_BLOCK = 'EDIT_CODE_BLOCK',
  EDIT_MESSAGE = 'EDIT_MESSAGE',
  LOCATE_MESSAGE = 'LOCATE_MESSAGE',
  SHOW_TOPIC_SIDEBAR = 'SHOW_TOPIC_SIDEBAR',
  ESTIMATED_TOKEN_COUNT = 'ESTIMATED_TOKEN_COUNT',
  ADD_NEW_TOPIC = 'ADD_NEW_TOPIC',
}
```

### MessageBlockRenderer Contract

Maps MessageBlock.type to the appropriate React component. Consecutive blocks of the same groupable type (IMAGE, TOOL, VIDEO) are grouped into composite components.

```typescript
interface BlockRendererProps {
  block: MessageBlock
  message: Message
  isStreaming: boolean
  onAction?: (action: BlockAction) => void
}

type BlockAction =
  | { type: 'copy'; content: string }
  | { type: 'edit'; blockId: string }
  | { type: 'run'; code: string; language: string }
```

---

## Consumed Entity Summary (from upstream)

| Entity | Owner | Used For |
|--------|-------|----------|
| Assistant | F003 | Sidebar list, active selection, settings display, topic mgmt |
| Topic | F003 | Sidebar list, conversation context, message container |
| Message | F003 | Message list rendering, grouping by askId, action target |
| MessageBlock | F003 | Block-level rendering, status display, streaming animation |
| Provider | F002 | Model selection display, capability hints |
| Model | F002 | Message header display, input bar model mentions |
| ThemeMode | F001 | Shiki code theme, markdown CSS, UI variant |

See F003 `data-model.md` and F002 `data-model.md` for full entity schemas.
