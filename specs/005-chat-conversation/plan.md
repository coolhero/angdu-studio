# Implementation Plan: Chat Conversation

**Branch**: `005-chat-conversation` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-chat-conversation/spec.md`

## Summary

Implement the chat conversation feature — the primary user interaction surface of Angdu Studio. This includes a three-column layout (assistant panel, streaming chat area, topic sidebar), message block rendering with 8 block types, full message lifecycle (compose, send, stream, persist), assistant CRUD and configuration, topic management with auto-naming, rich text editing via TipTap, virtual scrolling for large histories, draft persistence, and multi-model compare mode. Built on F004 AI core for streaming, F001 IPC for persistence, F002 for routing, and F003 for user preferences.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-mention, react-markdown, remark-gfm, rehype-raw, shiki, @tanstack/react-virtual, Zustand, React 19, Zod, shadcn/ui
**Storage**: better-sqlite3 via Drizzle ORM (messages, topics, blocks — main process); Zustand persist to localStorage (assistants, drafts, UI state — renderer)
**Testing**: Vitest (unit), Playwright (E2E via `_electron.launch()`)
**Target Platform**: macOS, Windows, Linux (Electron desktop)
**Project Type**: desktop-app (Electron)
**Performance Goals**: First token visible <500ms after send (excluding provider latency), 60fps streaming render, 500-msg topic load <1s, responsive with 10K+ stored messages
**Constraints**: All data access via IPC (ARC-01), no provider-specific code in F005 (ARC-03), offline read capability for cached conversations
**Scale/Scope**: 8 block types, 6 Zustand stores, ~18 new IPC channels, 3 main-process services, ~20 UI components

## Constitution Check

*GATE: Must pass before implementation begins.*

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. SSoT | Pass | Message, MessageBlock, Assistant, Topic types in `@shared/types/`. BlockType enum shared across processes |
| II. Explicit Over Implicit | Pass | Stream events explicitly typed. Block type discriminator drives rendering. Context window size is an explicit setting |
| III. Fail Loudly, Recover Gracefully | Pass | Stream errors create ErrorBlock with provider info. Partial responses preserved. IPC errors serialized with codes |
| IV. Composition Over Inheritance | Pass | BlockRenderer dispatches by type map, no class hierarchy. Stores composed via cross-store access |
| V. Test the Contract | Pass | IPC channels testable via request/response. Store contracts testable via actions. Stream flow testable via mock events |
| VI. Progressive Enhancement | Pass | Phase 1: data → Phase 2: stores → Phase 3: basic chat → Phase 4: blocks → Phase 5: management → Phase 6: polish |
| ARC-01 IPC Bridge | Pass | All SQLite access via typed IPC. No direct DB access from renderer |
| ARC-02 Streaming-first | Pass | Stream chunks → BlockBuilder → incremental DOM. No polling |
| ARC-03 Provider Abstraction | Pass | F005 calls `ai:chat` with normalized messages. No provider-specific code. NormalizedChunk is the only stream contract |
| ARC-05 Crash Isolation | Pass | Messages in SQLite survive renderer crashes. Drafts in localStorage are volatile by design |
| PSP-02 Config Portability | Pass | Assistants exportable as JSON. Messages in standard SQLite format |
| PSP-03 Graceful Degradation | Pass | Stream errors show error block with retry. Offline shows cached messages. Model unavailable shows warning |

## Project Structure

### Documentation (this feature)

```text
specs/005-chat-conversation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Research decisions
├── data-model.md        # Entity schemas and relationships
├── contracts/
│   ├── chat-stores.md   # Zustand store contracts
│   └── chat-ipc.md      # IPC channel contracts
└── quickstart.md        # Development quick start
```

### Source Code (repository root)

```text
src/
├── shared/types/
│   ├── message.ts              # Message, MessageBlock, MessageStatus, BlockType, etc.
│   ├── assistant.ts            # Assistant, AssistantSettings, ModelReference
│   └── topic.ts                # Topic
├── main/
│   ├── services/
│   │   ├── ChatService.ts      # Message/Topic CRUD against SQLite
│   │   ├── AssistantService.ts # Assistant CRUD + import/export
│   │   └── TopicNameService.ts # Auto-naming via F004 AI core
│   ├── db/
│   │   ├── schema/
│   │   │   ├── messages.ts     # Drizzle message table definition
│   │   │   ├── blocks.ts       # Drizzle message_blocks table definition
│   │   │   └── topics.ts       # Drizzle topics table definition
│   │   └── migrations/         # Drizzle migration files
│   └── ipc/
│       ├── chat-handlers.ts    # chat:* IPC handler registrations
│       └── assistant-handlers.ts # assistant:* IPC handler registrations
├── preload/
│   └── index.ts                # + F005 IPC channel whitelist additions
└── renderer/src/
    ├── pages/home/
    │   ├── HomePage.tsx         # Three-column layout orchestrator
    │   ├── AssistantPanel.tsx   # Left panel — assistant list + search
    │   ├── ChatArea.tsx         # Center — header + messages + input
    │   └── TopicSidebar.tsx     # Right panel — topic list + actions
    ├── components/chat/
    │   ├── MessageList.tsx      # @tanstack/react-virtual message list
    │   ├── MessageItem.tsx      # Single message bubble + hover actions
    │   ├── MessageInput.tsx     # TipTap editor + send/stop button + attachments
    │   ├── ChatHeader.tsx       # Assistant name + model selector + topic info
    │   ├── blocks/
    │   │   ├── BlockRenderer.tsx    # Discriminated union type dispatcher
    │   │   ├── TextBlock.tsx        # react-markdown rendering
    │   │   ├── CodeBlock.tsx        # Shiki syntax highlighting + copy button
    │   │   ├── ThinkingBlock.tsx    # Collapsible thinking/reasoning section
    │   │   ├── ToolBlock.tsx        # Tool call display (placeholder for F007)
    │   │   ├── ImageBlock.tsx       # Image display with lightbox
    │   │   ├── FileBlock.tsx        # File attachment card
    │   │   └── ErrorBlock.tsx       # Error display with retry action
    │   ├── AssistantList.tsx     # Searchable assistant list
    │   ├── AssistantEditor.tsx  # Create/edit assistant dialog
    │   ├── TopicList.tsx        # Topic list with context menu actions
    │   ├── EmptyState.tsx       # Empty topic state with suggested prompts
    │   └── ScrollToBottom.tsx   # Floating scroll-to-bottom button
    ├── stores/
    │   ├── useAssistantStore.ts # Assistant state + CRUD + persist
    │   ├── useTopicStore.ts     # Topic state + sidebar toggle
    │   ├── useMessageStore.ts   # Message state + pagination
    │   ├── useChatStore.ts      # Chat orchestration (send/stop/regenerate)
    │   ├── useDraftStore.ts     # Draft persistence per topic
    │   └── useBlockStore.ts     # Block state + streaming updates
    └── services/
        ├── ChatStreamService.ts # IPC stream event registration + cleanup
        ├── ContextBuilder.ts    # System prompt + context window + variable replacement
        └── BlockBuilder.ts      # NormalizedChunk → MessageBlock state machine
```

**Structure Decision**: Feature code follows the existing Electron three-process architecture (main/preload/renderer). Chat UI lives in `pages/home/` since the home route IS the chat interface. Reusable chat components live in `components/chat/`. Shared types extend `@shared/types/`.

## Architecture

### Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│  Renderer Process                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ UI Components                                    │ │
│  │  HomePage → AssistantPanel / ChatArea / Sidebar   │ │
│  │  ChatArea → ChatHeader / MessageList / Input      │ │
│  │  MessageList → MessageItem → BlockRenderer        │ │
│  │                    ↕ Zustand stores               │ │
│  │ useChatStore (orchestrator)                      │ │
│  │   ├── useAssistantStore                          │ │
│  │   ├── useTopicStore                              │ │
│  │   ├── useMessageStore                            │ │
│  │   ├── useBlockStore                              │ │
│  │   └── useDraftStore                              │ │
│  │                    ↕ Services                     │ │
│  │ ChatStreamService / ContextBuilder / BlockBuilder │ │
│  └──────────────────────────────────────────────────┘ │
│                       ↕ IPC Bridge                    │
├──────────────────────────────────────────────────────┤
│  Main Process                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ IPC Handlers                                     │ │
│  │  chat-handlers.ts / assistant-handlers.ts         │ │
│  │                    ↕                              │ │
│  │ Services                                         │ │
│  │  ChatService / AssistantService / TopicNameService│ │
│  │                    ↕                              │ │
│  │ Drizzle ORM → better-sqlite3                     │ │
│  │  messages / message_blocks / topics tables         │ │
│  └──────────────────────────────────────────────────┘ │
│                       ↕                               │
│  F004 AICoreService (ai:chat, stream events)          │
└──────────────────────────────────────────────────────┘
```

### Message Send Flow

```
1. User presses send key
2. MessageInput.onSend()
3. useDraftStore.clearDraft(topicId)
4. useChatStore.sendMessage(content, attachments)
   a. Create user Message + blocks via messageStore.addMessage
   b. Create user's MainTextBlock → chat:addBlock IPC → useBlockStore.addBlock
   c. Create assistant placeholder Message (status: 'sending')
   d. Set isStreaming = true, activeRequestId = nanoid()
   e. ContextBuilder.build(assistant, topic, messages)
      - Prepend system prompt with variable replacement ({{date}}, {{time}})
      - Window messages by assistant.settings.contextCount
      - Format as ChatMessage[] for F004
   f. ChatStreamService.subscribe(requestId, handlers)
   g. IPC invoke: ai:chat { providerId, modelId, messages, options: { requestId } }
5. F004 AICoreService streams response
6. ai:stream-chunk events arrive
   a. BlockBuilder.processChunk(chunk, existingBlocks)
      - text chunk → accumulate into MAIN_TEXT block
      - thinking chunk → accumulate into THINKING block
      - tool-call chunk → create/update TOOL block
      - type transition → finalize current block, start new one
   b. useBlockStore.updateBlockContent(blockId, content) — in-memory only
   c. React re-renders BlockRenderer with updated content
7. ai:stream-complete event
   a. useBlockStore.flushStreamingBlocks(messageId) — batch persist to SQLite
   b. useMessageStore.updateMessage(id, { status: 'success', usage })
   c. Set isStreaming = false, activeRequestId = null
   d. TopicNameService — if first exchange and !isNameManuallyEdited
8. Error path: ai:stream-error
   a. Create ErrorBlock with error details
   b. useMessageStore.updateMessage(id, { status: 'error' })
   c. Set isStreaming = false, preserve partial blocks
```

## Implementation Phases

### Phase 1: Data Layer (Types, DB Schema, IPC Handlers)

**Goal**: Establish the persistence foundation — shared types, Drizzle schemas, SQLite migrations, and IPC handlers for all CRUD operations.

**Deliverables**:
- `src/shared/types/message.ts` — Message, MessageBlock, BlockType, MessageStatus
- `src/shared/types/assistant.ts` — Assistant, AssistantSettings, ModelReference, DEFAULT_ASSISTANT
- `src/shared/types/topic.ts` — Topic
- `src/main/db/schema/messages.ts` — Drizzle message table
- `src/main/db/schema/blocks.ts` — Drizzle message_blocks table
- `src/main/db/schema/topics.ts` — Drizzle topics table
- `src/main/db/migrations/` — Migration for F005 tables
- `src/main/services/ChatService.ts` — Message + Topic CRUD
- `src/main/services/AssistantService.ts` — Assistant CRUD + import/export
- `src/main/ipc/chat-handlers.ts` — chat:* IPC registrations
- `src/main/ipc/assistant-handlers.ts` — assistant:* IPC registrations
- Preload whitelist updates

**Dependencies**: F001 (DB access via Drizzle, IPC bridge infrastructure)

**Verification**: Unit tests for ChatService and AssistantService. IPC round-trip test: invoke chat:addMessage → chat:getMessages returns the message.

### Phase 2: Stores & Services (Zustand Stores, Stream Service, Context Builder)

**Goal**: Implement all 6 Zustand stores and the 3 renderer services that orchestrate chat flow.

**Deliverables**:
- `src/renderer/src/stores/useAssistantStore.ts` — with persist middleware
- `src/renderer/src/stores/useTopicStore.ts` — with sidebar persist
- `src/renderer/src/stores/useMessageStore.ts` — with pagination
- `src/renderer/src/stores/useChatStore.ts` — send/stop/regenerate orchestration
- `src/renderer/src/stores/useDraftStore.ts` — with persist middleware
- `src/renderer/src/stores/useBlockStore.ts` — with streaming update pattern
- `src/renderer/src/services/ChatStreamService.ts` — IPC event subscription
- `src/renderer/src/services/ContextBuilder.ts` — context window + system prompt
- `src/renderer/src/services/BlockBuilder.ts` — chunk-to-block state machine

**Dependencies**: F004 (ai:chat IPC, stream events), Phase 1 (IPC handlers)

**Verification**: Unit tests for ContextBuilder (windowing, variable replacement), BlockBuilder (chunk type transitions), and store actions (CRUD operations, state transitions).

### Phase 3: Core Chat UI (Message List, Input, Header)

**Goal**: Implement the primary chat interface — three-column layout, virtual scrolling message list, TipTap editor, and chat header.

**Deliverables**:
- `src/renderer/src/pages/home/HomePage.tsx` — three-column layout
- `src/renderer/src/pages/home/ChatArea.tsx` — center panel
- `src/renderer/src/components/chat/MessageList.tsx` — @tanstack/react-virtual
- `src/renderer/src/components/chat/MessageItem.tsx` — message bubble
- `src/renderer/src/components/chat/MessageInput.tsx` — TipTap editor
- `src/renderer/src/components/chat/ChatHeader.tsx` — header bar
- `src/renderer/src/components/chat/EmptyState.tsx` — empty topic
- `src/renderer/src/components/chat/ScrollToBottom.tsx` — scroll button

**Dependencies**: F002 (routing — home route), F003 (sendKey setting), Phase 2 (stores)

**Verification**: E2E test: open app → see empty chat → type message → press send → user message appears. Virtual scroll performance test with 500 messages.

### Phase 4: Block Rendering (All Block Type Components)

**Goal**: Implement the block rendering system — discriminated union dispatcher and all 8 block type components.

**Deliverables**:
- `src/renderer/src/components/chat/blocks/BlockRenderer.tsx`
- `src/renderer/src/components/chat/blocks/TextBlock.tsx` — react-markdown + remark-gfm
- `src/renderer/src/components/chat/blocks/CodeBlock.tsx` — Shiki singleton + copy
- `src/renderer/src/components/chat/blocks/ThinkingBlock.tsx` — collapsible
- `src/renderer/src/components/chat/blocks/ToolBlock.tsx` — tool call display
- `src/renderer/src/components/chat/blocks/ImageBlock.tsx` — image display
- `src/renderer/src/components/chat/blocks/FileBlock.tsx` — file card
- `src/renderer/src/components/chat/blocks/ErrorBlock.tsx` — error + retry

**Dependencies**: Phase 3 (MessageItem renders blocks)

**Verification**: Render test: message with mixed blocks (text + code + thinking) renders all correctly. Shiki highlighting test. Collapsible thinking test. Error block retry triggers regenerate.

### Phase 5: Assistant & Topic Management

**Goal**: Implement the assistant panel and topic sidebar — CRUD UIs, search, context menus.

**Deliverables**:
- `src/renderer/src/pages/home/AssistantPanel.tsx` — left panel layout
- `src/renderer/src/pages/home/TopicSidebar.tsx` — right panel layout
- `src/renderer/src/components/chat/AssistantList.tsx` — searchable list
- `src/renderer/src/components/chat/AssistantEditor.tsx` — create/edit dialog
- `src/renderer/src/components/chat/TopicList.tsx` — topic list + context menu
- `src/main/services/TopicNameService.ts` — auto-naming integration

**Dependencies**: Phase 3 (HomePage layout), Phase 1 (assistant/topic IPC)

**Verification**: E2E test: create assistant → configure model → send message → response uses correct model. Topic CRUD: create → rename → delete → verify cascade. Auto-naming: send first message → topic title updates.

### Phase 6: Message Actions & Polish

**Goal**: Implement message-level interactions, draft persistence, sidebar toggle, multi-model compare, and import/export.

**Deliverables**:
- Message hover actions (copy, edit, delete, regenerate) in MessageItem
- Draft save/restore in MessageInput
- Sidebar toggle animation in HomePage
- Multi-model compare rendering (FR-036)
- Assistant import/export UI
- Performance optimizations (memoization, lazy loading)
- Error boundaries on route-level components

**Dependencies**: Phase 4 + Phase 5 (all components exist)

**Verification**: E2E test: hover → copy → verify clipboard. Edit message → resend → verify new response. Draft: type → switch topic → switch back → verify draft restored. Performance: 500-msg topic loads <1s.

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-006 | Press send key | onSend() | messageStore.addMessage + chatStore.sendMessage | Editor clears, user message appended | Message bubble appears in list | verify-state .message-list children.length "increased" |
| FR-016 | Click stop button | onStop() | chatStore.stopGeneration | Stop button → send button swap | Streaming stops, partial content preserved | verify-state button#stop hidden |
| FR-017 | Click regenerate | onRegenerate() | chatStore.regenerate | Last assistant message replaced | New stream begins from same context | verify-effect .message-list last-child "streaming" |
| FR-007 | Click sidebar toggle | onToggleSidebar() | topicStore.sidebarVisible = !prev | Sidebar animate slide in/out | Chat area expands/contracts | verify-state .topic-sidebar visible |
| FR-030 | Click assistant in list | onSelectAssistant(id) | assistantStore.activeAssistantId = id | Header updates, topic list reloads | Assistant name + model indicator changes | verify-effect .chat-header textContent |
| FR-031 | Click topic in sidebar | onSwitchTopic(id) | topicStore.activeTopicId = id | Message list reloads from SQLite | Different conversation shown | verify-state .message-list data-topic-id |
| FR-035 | Hover over message | onMouseEnter | — (CSS/state) | Action buttons fade in | Copy/edit/delete/regenerate icons shown | verify-state .message-actions visible |
| FR-022 | Click copy button | onCopy(messageId) | — | clipboard:write IPC | Toast "Copied" appears | verify-effect clipboard textContent |
| FR-009 | Click create assistant | onCreateAssistant() | assistantStore.addAssistant | Dialog opens → form → save | New assistant appears in list | verify-state .assistant-list children.length "increased" |
| FR-005 | Type in editor | onEditorChange | draftStore.saveDraft (debounced) | Editor content updates | Text formatted with markdown shortcuts | verify-state .message-input textContent |
| FR-010 | Message sent | onSend() | draftStore.clearDraft | Editor clears | Empty editor ready for next message | verify-state .message-input textContent "empty" |
| FR-021 | Click delete message | onDelete(id) | messageStore.deleteMessage | Confirm dialog → message removed | Message disappears from list | verify-state .message-list children.length "decreased" |
| FR-018 | Click edit message | onEdit(id) | — | Message content loaded into editor | Editor populated with message text | verify-state .message-input textContent "matches message" |
| FR-031 | Click create topic | onCreateTopic() | topicStore.createTopic | Topic appended to sidebar list | New topic appears, becomes active | verify-state .topic-list children.length "increased" |
| FR-031 | Right-click topic → delete | onDeleteTopic(id) | topicStore.deleteTopic | Confirm dialog → topic removed | Topic disappears, next topic selected | verify-state .topic-list children.length "decreased" |
| FR-031 | Double-click topic name | onRenameTopic(id) | topicStore.renameTopic | Inline edit activates | Topic name becomes editable | verify-state .topic-name contenteditable |

### Async-flow Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-014 | async-flow: Send message | onSend() | chatStore.isStreaming = true | Input disabled, stop button shown | Loading/streaming state | verify-state .message-input disabled "true" |
| FR-014 | async-flow: Stream chunk arrives | _onStreamChunk(data) | blockStore.updateBlockContent | Block content incrementally updates | Text appears character by character | verify-effect .block-content textContent "non-empty" |
| FR-014 | async-flow: Stream complete | _onStreamComplete() | chatStore.isStreaming = false, blockStore.flush | Input enabled, send button restored | Complete response visible | verify-state .message-input disabled "false" |
| FR-025 | async-flow: Stream error | _onStreamError(err) | chatStore.error = err, message.status = 'error' | Error block shown, input re-enabled | Error message with retry button visible | verify-state .error-block visible |
| FR-004 | async-flow: Auto-scroll during stream | — | — | scrollToBottom if user at bottom | Chat scrolls to show latest content | verify-effect .message-list scrollTop "bottom" |
| FR-032 | async-flow: Topic auto-naming | onStreamComplete | topicStore.updateTopicName | Topic name in sidebar updates | "New Topic" → meaningful title | verify-effect .topic-name textContent "not 'New Topic'" |
| FR-020 | async-flow: Load messages on topic switch | onSwitchTopic | messageStore.loadMessages, loading = true | Skeleton/spinner → message list | Messages appear after loading | verify-state .message-list children.length "matches topic" |
| FR-029 | async-flow: Image upload | onPaste/onDrop | draftStore.saveDraft(with attachment) | Image preview in editor area | Thumbnail shown below editor | verify-state .attachment-preview visible |

## UX Behavior Contract

| Scenario | Expected Behavior | Failure Behavior | Verify Method |
|----------|-------------------|------------------|---------------|
| Streaming response active | Auto-scroll follows latest text; user scroll-up pauses auto-scroll; scroll-to-bottom button appears | No scroll = user can't see new text; forced scroll = user can't read earlier messages | verify-effect .message-list scrollTop "bottom" |
| Message sending (between send and first token) | Send button → stop button; input disabled; spinner/pulse on assistant message placeholder | Double-send; lost input; no feedback | verify-state button#send disabled "true" |
| API error during stream | Error block appears below partial content; input re-enabled; retry button on error block | Silent failure; app frozen; partial content lost | verify-state .error-block visible |
| Long loading (>3s before first token) | Skeleton pulse on assistant placeholder; "Waiting for response..." text; cancel available via stop button | Blank screen; no way to cancel | verify-state .loading-indicator visible |
| Component unmount during stream | Stream subscription cancelled via cleanup; no state update after unmount; no React warnings | Memory leak; "Can't perform state update on unmounted component" | — (code review) |
| Topic switch during stream | Current stream aborted (ai:abort); partial response preserved in old topic; new topic loads cleanly | Old stream chunks leak into new topic; stale state | verify-state .message-list data-topic-id |
| Network offline | Cached messages displayed; send button disabled with tooltip "Offline"; reconnection auto-enables send | Blank chat; silent send failures | verify-state button#send disabled "true" |
| Very large message (>10KB) | Message renders with lazy markdown; no frame drops; copy works fully | UI freeze; truncated copy | — (performance test) |
| Empty topic | Empty state with suggested prompts; "Start a conversation" header | Blank white area; confusing | verify-state .empty-state visible |
| Model unavailable | Warning badge on chat header; "Model unavailable" tooltip; send still works (will error from provider) | Silent switch to wrong model | verify-state .model-warning visible |
| Concurrent send attempts | Second send rejected while streaming; toast "Generation in progress" | Double message; state corruption | verify-state toast "Generation in progress" |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge |
|-----------|---------------|-----------|---------------|---------------|--------|
| Consumes ← | F004-model-provider | `ai:chat` IPC invoke | `{ providerId, modelId, messages: ChatMessage[], options: ChatOptions }` | `{ assistant, topic, userMessage }` | adapter: `ContextBuilder.build()` transforms assistant settings + message history into ChatMessage[] |
| Consumes ← | F004-model-provider | `ai:stream-chunk` event | `{ requestId, chunk: NormalizedChunk }` | `MessageBlock update` | adapter: `BlockBuilder.processChunk()` maps NormalizedChunk.type to BlockType |
| Consumes ← | F004-model-provider | `ai:stream-complete` event | `{ requestId, usage?: TokenUsage }` | Message finalization | Direct — flush blocks, update message status |
| Consumes ← | F004-model-provider | `ai:stream-error` event | `{ requestId, error: SerializedError }` | ErrorBlock creation | adapter: `SerializedError` → `ErrorBlock.content` |
| Consumes ← | F004-model-provider | `useModelStore` | `getActiveModel()`, `getModelById()` | Chat header model display | Direct — same store |
| Consumes ← | F004-model-provider | `useProviderStore` | `getProviderById()` | Error display with provider name | Direct — same store |
| Consumes ← | F001-app-shell | `config:get/set` IPC | `{ key: string }` → `string` | Store hydrate/persist backup | Direct — shapes compatible |
| Consumes ← | F001-app-shell | `clipboard:write` IPC | `{ text: string }` | Copy message to clipboard | Direct — shapes compatible |
| Consumes ← | F001-app-shell | `file:read` IPC | `{ path: string }` → `Buffer` | File attachment loading | Direct — shapes compatible |
| Consumes ← | F003-settings | `useSettingsStore` | `{ sendKey, fontSize, messageStyle }` | Chat UI reads sendKey for input, fontSize for rendering | Direct — same store |
| Consumes ← | F003-settings | `useQuickPhrasesStore` | `QuickPhrase[]` | Quick phrase menu in chat input | Direct — same store |
| Consumes ← | F002-navigation | `useTabsStore` | `Tab{ id, route, title }` | Chat page tab title updates on topic switch | Direct — same store |
| Consumes ← | F002-navigation | Hash routing | `#/` route | HomePage renders as default route | Direct — route registration |
| Provides → | F006-knowledge | Message + Topic read APIs | `chat:getMessages(topicId)`, `chat:getTopics(assistantId)` | F006 reads conversation history for RAG context | — |
| Provides → | F007-mcp-tools | Block rendering extension | `BlockRenderer` + `TOOL` block type | F007 replaces ToolBlock placeholder with functional MCP tool UI | — |
| Provides → | F008-content | Message storage APIs | `chat:getMessages`, `chat:getBlocks` | F008 reads messages for translation, history browsing | — |
| Provides → | F010-api-server | Message storage APIs | `chat:addMessage`, `chat:getMessages` | F010 exposes chat completions endpoint using F005 storage | — |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **Zustand + React** | Selector return values MUST be referentially stable. Use `useShallow` from `zustand/react/shallow` for array/object selectors. `useStore(s => s.items.filter(...))` is WRONG — creates new array every render | Prevents infinite re-render loops. Every `filter/map/slice` in a selector creates a new reference → React sees "changed" → re-render → new reference → infinite loop |
| **Streaming + React state** | Use `useRef` for streaming accumulation state (current block, buffer). Use `flushSync` only for critical DOM updates (scroll position). DO NOT use `useState` for high-frequency stream chunk accumulation | `useState` batches updates — visible lag during streaming. `useRef` mutations are synchronous. `flushSync` forces immediate DOM update but is expensive — use sparingly |
| **TipTap + React** | Editor instance MUST be managed via `useEditor()` hook with `onDestroy` cleanup. DO NOT recreate editor on re-render. Use `editor.commands` for programmatic content changes, not controlled state | Memory leak if editor not destroyed. Focus loss on recreate. TipTap is uncontrolled by design — fighting it with React state creates bugs |
| **Virtual scroll + streaming** | Auto-scroll MUST check `isAtBottom` (`scrollTop + clientHeight >= scrollHeight - threshold`) BEFORE appending new content. Use `scrollToIndex({ index: lastIndex, align: 'end' })` not raw `scrollTo` | Raw `scrollTo` causes visible jump. `scrollToIndex` handles variable-height items. Must respect user scroll-up intent |
| **Shiki + Electron** | Create `highlighter` via `createHighlighterCore()` ONCE as a module-level singleton. Lazy-load grammars via dynamic import. Cache highlighted HTML per `(code, language, theme)` tuple | Shiki initialization is 200ms+ per instance. Creating per-render = unusable during streaming. Singleton + cache = instant re-highlights |
| **IPC + large data** | Paginate message loading (`chat:getMessages` with offset/limit, default 50). Load blocks in batch (`chat:getBlocksBatch`). NEVER load all messages at once | IPC serialization overhead is O(n) on message count. 10K messages x ~2KB each = 20MB serialization per load. Pagination keeps each IPC call <100KB |
| **Error boundary** | Every route-level component (`HomePage`, settings pages) MUST be wrapped with `ErrorBoundary`. Block rendering errors MUST be caught per-block (not per-message) | Uncaught render error in one block must not crash the entire message list. Route-level boundary prevents white screen |
| **Block content updates** | During streaming, use `updateBlockContent()` (in-memory Zustand mutation, NO IPC). Batch-persist via `flushStreamingBlocks()` on stream complete | One IPC call per chunk (~50-100ms) at sustained rate = IPC queue congestion. Batch on complete = single write |
| **nanoid for IDs** | All entity IDs (messages, blocks, topics, assistants) use `nanoid(21)`. DO NOT use `uuid` or `crypto.randomUUID()` | nanoid is 2x faster, URL-safe, smaller (21 chars vs 36). Consistent with existing F001-F004 patterns |

## Complexity Tracking

No constitution violations. All decisions align with existing architectural principles. Cross-boundary reference between Zustand-persisted assistants and SQLite-persisted topics is the primary complexity point — mitigated by cascade reassignment on assistant delete and advisory model references.

## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| HomePage | `pages/home/HomePage.tsx` | HomePage | `pages/home/HomePage.tsx` | Source: flex row Navbar+Content. Target: flex row HomeSidebar+ChatArea, adds ChatErrorBoundary |
| Navbar (header bar) | `pages/home/Navbar.tsx` | ChatHeader | `components/chat/ChatHeader.tsx` | Source: top-level navbar with sidebar toggles, search, narrow mode. Target: simplified header |
| HomeTabs | `pages/home/Tabs/index.tsx` | HomeSidebar | `pages/home/HomeSidebar.tsx` | Source: standalone animated tab panel. Target: integrated sidebar with same tabs |
| AssistantsTab | `Tabs/AssistantsTab.tsx` | HomeSidebar (assistants) | `pages/home/HomeSidebar.tsx` | Source: UnifiedList/TagGroups with DnD sort. Target: simpler AssistantList with category grouping |
| TopicsTab | `Tabs/TopicsTab.tsx` | HomeSidebar (topics) | `pages/home/HomeSidebar.tsx` | Source: Topics + SessionsTab. Target: TopicList only (no agent sessions) |
| Chat | `pages/home/Chat.tsx` | ChatArea | `pages/home/ChatArea.tsx` | Source: topic/session branches, content search, multi-select. Target: single branch |
| ChatNavbar + ChatNavbarContent | `components/ChatNavBar/` | ChatHeader | `components/chat/ChatHeader.tsx` | Source: separate components. Target: merged into ChatHeader |
| Messages | `Messages/Messages.tsx` | MessageList | `components/chat/MessageList.tsx` | Source: reverse-scroll InfiniteScroll + NarrowLayout. Target: forward @tanstack/react-virtual |
| MessageGroup | `Messages/MessageGroup.tsx` | — | — | removed (target renders flat list, no date grouping) |
| Message | `Messages/Message.tsx` | MessageItem | `components/chat/MessageItem.tsx` | Source: Header+Content+Menubar+Editor+Outline. Target: simplified avatar+blocks+hover actions |
| MessageHeader | `Messages/MessageHeader.tsx` | MessageItem (inline) | `components/chat/MessageItem.tsx` | Source: separate with model avatar, name, timestamp. Target: User/Bot icon inline |
| MessageContent | `Messages/MessageContent.tsx` | BlockRenderer[] (inline) | `components/chat/MessageItem.tsx` | Source: separate wrapper. Target: direct block rendering |
| MessageMenubar | `Messages/MessageMenubar.tsx` | MessageActions | `components/chat/MessageActions.tsx` | Source: copy,edit,resend,regenerate,branch,translate,TTS,bookmark. Target: copy,edit,regenerate,delete |
| MessageEditor | `Messages/MessageEditor.tsx` | ChatArea (edit state) | `pages/home/ChatArea.tsx` | Source: inline per-message editor. Target: edit fills MessageInput |
| Blocks/index.tsx | `Messages/Blocks/index.tsx` | BlockRenderer | `blocks/BlockRenderer.tsx` | Same dispatch pattern |
| MainTextBlock | `Messages/Blocks/MainTextBlock.tsx` | TextBlock | `blocks/TextBlock.tsx` | Both react-markdown |
| ThinkingBlock | `Messages/Blocks/ThinkingBlock.tsx` | ThinkingBlock | `blocks/ThinkingBlock.tsx` | Both collapsible |
| ToolBlock/ToolBlockGroup | `Messages/Blocks/ToolBlock.tsx` | ToolBlock | `blocks/ToolBlock.tsx` | Target is placeholder for F007 |
| ImageBlock | `Messages/Blocks/ImageBlock.tsx` | ImageBlock | `blocks/ImageBlock.tsx` | — |
| FileBlock | `Messages/Blocks/FileBlock.tsx` | FileBlock | `blocks/FileBlock.tsx` | — |
| ErrorBlock | `Messages/Blocks/ErrorBlock.tsx` | ErrorBlock | `blocks/ErrorBlock.tsx` | Both have retry |
| VideoBlock | `Messages/Blocks/VideoBlock.tsx` | — | — | deferred (video content out of T1 scope) |
| TranslationBlock | `Messages/Blocks/TranslationBlock.tsx` | — | — | deferred (translation feature out of scope) |
| CitationBlock | `Messages/Blocks/CitationBlock.tsx` | — | — | deferred (citation feature out of scope) |
| PlaceholderBlock | `Messages/Blocks/PlaceholderBlock.tsx` | MessageItem pulse | `components/chat/MessageItem.tsx` | Target uses animated pulse dot instead |
| CompactBlock | `Messages/Blocks/CompactBlock.tsx` | — | — | deferred (compact view out of scope) |
| Inputbar | `Inputbar/Inputbar.tsx` | MessageInput | `components/chat/MessageInput.tsx` | Source: complex with tool system. Target: TipTap + send/stop |
| InputbarCore | `Inputbar/components/InputbarCore.tsx` | MessageInput (inline) | `components/chat/MessageInput.tsx` | Source: configurable slots. Target: flat layout |
| InputbarTools (18 tools) | `Inputbar/InputbarTools.tsx` | — | — | deferred (only Paperclip attach exists) |
| SendMessageButton | `Inputbar/SendMessageButton.tsx` | MessageInput (inline) | `components/chat/MessageInput.tsx` | — |
| TokenCount | `Inputbar/TokenCount.tsx` | — | — | deferred (token estimation) |
| NarrowLayout | `Messages/NarrowLayout.tsx` | — | — | removed (no width constraint toggle) |
| ChatFlowHistory | `Messages/ChatFlowHistory.tsx` | — | — | removed (ReactFlow graph view out of scope) |
| AssistantsDrawer | `components/AssistantsDrawer.tsx` | — | — | removed (sidebar always available) |
| ContentSearch | `components/ContentSearch.tsx` | — | — | deferred (find-in-chat) |
| ChatNavigation | `Messages/ChatNavigation.tsx` | — | — | removed (prev/next message buttons) |
| SelectModelPopup | `Popups/SelectModelPopup.tsx` | ModelSelector | `components/chat/ModelSelector.tsx` | Source: modal popup. Target: inline Popover |
| AddAssistantPopup | `Popups/AddAssistantPopup.tsx` | AssistantEditor | `components/chat/AssistantEditor.tsx` | Source: AntD modal. Target: shadcn Dialog |
| AgentSession branch | `pages/home/Chat.tsx` | — | — | deferred (agent sessions out of T1 scope) |
| MultiSelectActionPopup | `Messages/SelectionBox.tsx` | — | — | deferred (bulk message selection) |
