# Quickstart: Chat Conversation

## Prerequisites

- F001 app-shell completed (IPC bridge, Config API, DB access, clipboard, file I/O)
- F002 navigation completed (hash routing, tab management, home route `#/`)
- F003 settings completed (sendKey, fontSize, messageStyle, quickPhrases)
- F004 model-provider completed (AI core streaming, provider/model stores)
- Node.js 24+, pnpm

## Development

```bash
pnpm install
pnpm run dev
# App opens at home route (#/) — the chat interface
```

## Key Files

### Types (SSoT)
- `src/shared/types/message.ts` — Message, MessageBlock, MessageStatus, BlockType
- `src/shared/types/assistant.ts` — Assistant, AssistantSettings, ModelReference
- `src/shared/types/topic.ts` — Topic

### Main Process (data layer)
- `src/main/db/schema/messages.ts` — Drizzle message table schema
- `src/main/db/schema/blocks.ts` — Drizzle message_blocks table schema
- `src/main/db/schema/topics.ts` — Drizzle topics table schema
- `src/main/services/ChatService.ts` — Message/Topic CRUD operations
- `src/main/services/AssistantService.ts` — Assistant CRUD + import/export
- `src/main/services/TopicNameService.ts` — Auto-naming via AI core
- `src/main/ipc/chat-handlers.ts` — `chat:*` IPC handler registrations
- `src/main/ipc/assistant-handlers.ts` — `assistant:*` IPC handler registrations

### Renderer (stores)
- `src/renderer/src/stores/useAssistantStore.ts` — Assistant state + CRUD
- `src/renderer/src/stores/useTopicStore.ts` — Topic state + sidebar toggle
- `src/renderer/src/stores/useMessageStore.ts` — Message state + pagination
- `src/renderer/src/stores/useChatStore.ts` — Chat orchestration (send/stop/regenerate)
- `src/renderer/src/stores/useDraftStore.ts` — Draft persistence per topic
- `src/renderer/src/stores/useBlockStore.ts` — Block state + streaming updates

### Renderer (services)
- `src/renderer/src/services/ChatStreamService.ts` — IPC stream event handler registration
- `src/renderer/src/services/ContextBuilder.ts` — Context window management + system prompt
- `src/renderer/src/services/BlockBuilder.ts` — NormalizedChunk to MessageBlock assembly

### Renderer (UI components)
- `src/renderer/src/pages/home/HomePage.tsx` — Three-column layout
- `src/renderer/src/pages/home/AssistantPanel.tsx` — Left panel
- `src/renderer/src/pages/home/ChatArea.tsx` — Center chat area
- `src/renderer/src/pages/home/TopicSidebar.tsx` — Right panel
- `src/renderer/src/components/chat/MessageList.tsx` — Virtual scrolling message list
- `src/renderer/src/components/chat/MessageItem.tsx` — Single message + hover actions
- `src/renderer/src/components/chat/MessageInput.tsx` — TipTap editor + send/stop button
- `src/renderer/src/components/chat/ChatHeader.tsx` — Assistant name + model selector
- `src/renderer/src/components/chat/blocks/BlockRenderer.tsx` — Block type dispatcher
- `src/renderer/src/components/chat/blocks/TextBlock.tsx` — Markdown rendering
- `src/renderer/src/components/chat/blocks/CodeBlock.tsx` — Shiki syntax highlighting
- `src/renderer/src/components/chat/blocks/ThinkingBlock.tsx` — Collapsible thinking
- `src/renderer/src/components/chat/blocks/ToolBlock.tsx` — Tool use display
- `src/renderer/src/components/chat/blocks/ImageBlock.tsx` — Image display
- `src/renderer/src/components/chat/blocks/FileBlock.tsx` — File attachment display
- `src/renderer/src/components/chat/blocks/ErrorBlock.tsx` — Error display + retry

## Architecture Overview

```
User types message → TipTap editor
  → MessageInput.onSend()
  → useChatStore.sendMessage()
    → useMessageStore.addMessage(userMsg)
    → useMessageStore.addMessage(assistantPlaceholder)
    → ContextBuilder.build(assistant, topic, messages)
    → IPC invoke: ai:chat
  → ChatStreamService listens ai:stream-chunk
    → BlockBuilder.processChunk(chunk)
    → useBlockStore.updateBlockContent() (in-memory)
    → React re-renders MessageItem → BlockRenderer
  → ai:stream-complete
    → useBlockStore.flushStreamingBlocks() (batch IPC persist)
    → useChatStore.isStreaming = false
    → TopicNameService (if first exchange)
```

## Dependencies (new packages for F005)

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-mention": "^2.x",
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "rehype-raw": "^7.x",
  "shiki": "^1.x",
  "@tanstack/react-virtual": "^3.x"
}
```

## Testing

```bash
# Unit tests
pnpm run test -- --filter chat

# E2E tests (Playwright + Electron)
pnpm run test:e2e -- --grep "chat"
```

## Spec Files
- **Specification**: `specs/005-chat-conversation/spec.md`
- **Research**: `specs/005-chat-conversation/research.md`
- **Data Model**: `specs/005-chat-conversation/data-model.md`
- **Store Contracts**: `specs/005-chat-conversation/contracts/chat-stores.md`
- **IPC Contracts**: `specs/005-chat-conversation/contracts/chat-ipc.md`
- **Plan**: `specs/005-chat-conversation/plan.md`
