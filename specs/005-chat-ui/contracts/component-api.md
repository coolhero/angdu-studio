# Component API Contracts: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

---

## Page Components

### HomePage

Root page component. Composes sidebar and chat area with animated layout.

```typescript
interface HomePageProps {
  // No props — reads state from stores
}
```

**State dependencies**: useRuntimeStore (activeAssistantId, activeTopicId), useSettingsStore (showAssistants, showTopics, topicPosition)

---

### Chat

Central chat container. Orchestrates Messages, Inputbar, and navigation.

```typescript
interface ChatProps {
  assistant: Assistant
  topic: Topic
}
```

---

## Message Components

### Message

Individual message display with header, content, editor, and action toolbar.

```typescript
interface MessageProps {
  message: Message
  isLastInGroup: boolean
  isStreaming: boolean
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
  onRetry: (messageId: string) => void
}
```

### MessageGroup

Groups messages by askId for multi-model response display.

```typescript
interface MessageGroupProps {
  messages: Message[]
  askId: string
  style: 'horizontal' | 'vertical' | 'fold' | 'grid'
}
```

### MessageBlockRenderer

Dispatches blocks to type-specific components with animation.

```typescript
interface MessageBlockRendererProps {
  blocks: MessageBlock[]
  message: Message
  isStreaming: boolean
}
```

### MessageMenubar

Hover action toolbar for individual messages.

```typescript
interface MessageMenubarProps {
  message: Message
  onCopy: () => void
  onEdit: () => void
  onRetry: () => void
  onDelete: () => void
  onTranslate: () => void
  onFork: () => void
  onTTS: () => void
  onBookmark: () => void
}
```

### MessageEditor

Inline message editing with save/resend.

```typescript
interface MessageEditorProps {
  message: Message
  initialContent: string
  onSave: (content: string) => void
  onResend: (content: string) => void
  onCancel: () => void
}
```

---

## Block Components

All block components receive a common base:

```typescript
interface BaseBlockProps {
  block: MessageBlock
  isStreaming: boolean
}
```

### MainTextBlock
Renders markdown content via the Markdown component. Props: `BaseBlockProps`

### ThinkingBlock
Collapsible thinking/reasoning display. Props: `BaseBlockProps & { elapsedMs: number }`

### ToolBlock
Single tool invocation with arguments and output. Props: `BaseBlockProps & { onApprove?: () => void; onDeny?: () => void }`

### ImageBlock
Image display with lightbox viewer. Props: `BaseBlockProps`

### CodeBlock (within Markdown)
Syntax-highlighted code with copy/run actions.
```typescript
interface CodeBlockProps {
  code: string
  language: string
  theme: 'dark' | 'light'
  onCopy: () => void
  onRun?: (code: string) => void
}
```

### ErrorBlock
Error display with serialized details. Props: `BaseBlockProps`

### CitationBlock
Source links with tooltips. Props: `BaseBlockProps`

### PlaceholderBlock
Loading/pending state. Props: `BaseBlockProps`

### UnknownBlock
Fallback for unrecognized types. Props: `BaseBlockProps`

---

## Input Components

### Inputbar

Main input bar with TipTap editor, tools, and send button.

```typescript
interface InputbarProps {
  assistant: Assistant
  topic: Topic
  onSend: (content: string, attachments?: FileMetadata[]) => void
  disabled: boolean
}
```

### InputbarTools

Toolbar with registered tools and DnD ordering.

```typescript
interface InputbarToolsProps {
  scope: InputbarScope
  tools: ToolDefinition[]
  toolOrder: { visible: string[]; hidden: string[] }
  onReorder: (order: { visible: string[]; hidden: string[] }) => void
}
```

---

## Sidebar Components

### HomeTabs

Tab container for sidebar navigation.

```typescript
interface HomeTabsProps {
  activeTab: 'assistants' | 'topics' | 'sessions'
  onTabChange: (tab: string) => void
}
```

### AssistantsTab

Lists assistants with tag groups and create/edit/delete.

```typescript
interface AssistantsTabProps {
  assistants: Assistant[]
  activeAssistantId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}
```

### TopicsTab

Lists topics for the active assistant.

```typescript
interface TopicsTabProps {
  topics: Topic[]
  activeTopicId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}
```

---

## Utility Components

### ContentSearch

In-chat search overlay (Ctrl+F / Cmd+F).

```typescript
interface ContentSearchProps {
  messages: Message[]
  onLocate: (messageId: string) => void
  onClose: () => void
}
```

### ChatNavigation

Scroll-to-bottom and jump-to-message controls.

```typescript
interface ChatNavigationProps {
  onScrollToBottom: () => void
  onJumpToMessage: (messageId: string) => void
  showScrollButton: boolean
}
```

### ConfirmDialog (Global Provider)

Promise-based confirmation dialog replacement for `window.modal.confirm()`.

```typescript
interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

// Hook API
function useConfirmDialog(): {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}
```
