# Tasks: Chat Conversation

**Input**: Design documents from `/specs/005-chat-conversation/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/chat-stores.md, contracts/chat-ipc.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install new dependencies required by F005

- [ ] T001 Install TipTap packages: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-mention
- [ ] T002 [P] Install markdown rendering packages: react-markdown, remark-gfm, rehype-raw
- [ ] T003 [P] Install syntax highlighting package: shiki
- [ ] T004 [P] Install virtual scrolling package: @tanstack/react-virtual

---

## Phase 2: Foundational — Data Layer

**Purpose**: Shared types, Drizzle schemas, SQLite migrations, main-process services, and IPC handlers for all CRUD operations

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Define Message, MessageStatus, MessageType, MultiModelMessageStyle, TokenUsage, MessageMetrics types in src/shared/types/message.ts — include all fields from data-model.md Message interface
- [ ] T006 [P] Define MessageBlock discriminated union (BlockBase, BlockType, BlockStatus, UnknownBlock, MainTextBlock, ThinkingBlock, CodeBlock, ImageBlock, FileBlock, ToolBlock, ErrorBlock, TranslationBlock, CitationBlock, VideoBlock, CompactBlock) in src/shared/types/message.ts
- [ ] T007 [P] Define Assistant, AssistantSettings, ModelReference, DEFAULT_ASSISTANT, DraftContent, DraftAttachment types in src/shared/types/assistant.ts — include all fields from data-model.md
- [ ] T008 [P] Define Topic type in src/shared/types/topic.ts — include all fields from data-model.md Topic interface
- [ ] T009 [P] Create Drizzle schema for messages table in src/main/db/schema/messages.ts — all columns from data-model.md with FK to topics, indexes on topic_id and created_at
- [ ] T010 [P] Create Drizzle schema for message_blocks table in src/main/db/schema/blocks.ts — all columns from data-model.md with FK cascade to messages, index on message_id
- [ ] T011 [P] Create Drizzle schema for topics table in src/main/db/schema/topics.ts — all columns from data-model.md, index on assistant_id
- [ ] T012 Generate and apply Drizzle migration for F005 tables (topics, messages, message_blocks) in src/main/db/migrations/
- [ ] T013 Implement ChatService in src/main/services/ChatService.ts — topic CRUD (getTopics, createTopic, deleteTopic, renameTopic), message CRUD (getMessages with pagination, addMessage, updateMessage, deleteMessage, deleteMessagesAfter), block CRUD (getBlocks, getBlocksBatch, addBlock, updateBlock, updateBlocksBatch), all via Drizzle ORM against better-sqlite3
- [ ] T014 [P] Implement AssistantService in src/main/services/AssistantService.ts — getAll, add, update, delete (with topic reassignment to default), import (JSON parse + validate + new IDs), export (serialize selected assistants)
- [ ] T015 [P] Implement TopicNameService in src/main/services/TopicNameService.ts — generateTopicName(topicId, messages) calls F004 AICoreService for a short title (3-7 words), updates topic name in DB, fallback to truncated first message on failure
- [ ] T016 Register chat:* IPC handlers in src/main/ipc/chat-handlers.ts — chat:getTopics, chat:createTopic, chat:deleteTopic, chat:renameTopic, chat:getMessages, chat:addMessage, chat:updateMessage, chat:deleteMessage, chat:deleteMessagesAfter, chat:getBlocks, chat:getBlocksBatch, chat:addBlock, chat:updateBlock, chat:updateBlocksBatch, chat:generateTopicName — all delegating to ChatService/TopicNameService
- [ ] T017 [P] Register assistant:* IPC handlers in src/main/ipc/assistant-handlers.ts — assistant:getAll, assistant:add, assistant:update, assistant:delete, assistant:import, assistant:export — all delegating to AssistantService
- [ ] T018 Add all F005 IPC channel names (18 chat:* + 6 assistant:* channels) to preload whitelist in src/preload/index.ts
- [ ] T019 Register chat-handlers and assistant-handlers in main IPC index (src/main/ipc/index.ts) so handlers are initialized on app startup

**Checkpoint**: All tables created, services functional, IPC round-trip works via DevTools console

---

## Phase 3: US1 — Send and Receive Chat Messages (P1)

**Purpose**: Zustand stores, renderer services, and core chat UI for the primary send/receive flow

**Dependencies**: Phase 2 complete

### Stores & Services

- [ ] T020 [US1] Implement useAssistantStore in src/renderer/src/stores/useAssistantStore.ts — AssistantState (assistants[], activeAssistantId, searchQuery), CRUD actions, persist middleware (name: 'angdu-assistant-store'), hydrate from IPC, getActiveAssistant/getFilteredAssistants computed methods
- [ ] T021 [P] [US1] Implement useTopicStore in src/renderer/src/stores/useTopicStore.ts — TopicState (topics[], activeTopicId, sidebarVisible, loading), hydrate(assistantId), CRUD actions (createTopic, deleteTopic, renameTopic, updateTopicName), switchTopic, toggleSidebar, persist middleware for sidebarVisible only
- [ ] T022 [P] [US1] Implement useMessageStore in src/renderer/src/stores/useMessageStore.ts — MessageState (messages[], hasMore, loading), loadMessages with pagination (default limit 50), loadMoreMessages, addMessage, updateMessage, deleteMessage, replaceLastAssistantMessage, clearMessages
- [ ] T023 [P] [US1] Implement useBlockStore in src/renderer/src/stores/useBlockStore.ts — BlockState (blocks Record<id, MessageBlock>, blocksByMessage Record<messageId, id[]>), loadBlocks, loadBlocksForMessages batch, addBlock, updateBlock, updateBlockContent (in-memory only, no IPC), deleteBlocksForMessage, getBlocksForMessage, flushStreamingBlocks (batch persist via chat:updateBlocksBatch IPC)
- [ ] T024 [P] [US1] Implement useDraftStore in src/renderer/src/stores/useDraftStore.ts — DraftState (drafts Record<topicId, DraftContent>), saveDraft (debounced 300ms), loadDraft, clearDraft, clearAllDrafts, persist middleware (name: 'angdu-draft-store')
- [ ] T025 [US1] Implement useChatStore in src/renderer/src/stores/useChatStore.ts — ChatState (isStreaming, activeRequestId, error, streamingMessageId), sendMessage (full flow: create user msg + blocks, create assistant placeholder, build context, invoke ai:chat, subscribe to stream events), stopGeneration (ai:abort), regenerate, editAndResend, clearError, internal stream event handlers (_onStreamChunk, _onStreamComplete, _onStreamError)
- [ ] T026 [US1] Implement ChatStreamService in src/renderer/src/services/ChatStreamService.ts — subscribe(requestId, handlers) registers listeners for ai:stream-chunk, ai:stream-complete, ai:stream-error IPC events; unsubscribe(requestId) removes listeners; cleanup on unmount
- [ ] T027 [P] [US1] Implement ContextBuilder in src/renderer/src/services/ContextBuilder.ts — build(assistant, topic, messages) returns ChatMessage[]; prepend system prompt with variable replacement ({{date}}, {{time}}, {{language}}); window messages by assistant.settings.contextCount; format as ChatMessage[] for F004
- [ ] T028 [P] [US1] Implement BlockBuilder in src/renderer/src/services/BlockBuilder.ts — processChunk(chunk: NormalizedChunk, existingBlocks) state machine: text chunk accumulates into MAIN_TEXT block, thinking chunk into THINKING block, tool-call chunk creates/updates TOOL block, type transition finalizes current block and starts new one

### Core Chat UI

- [ ] T029 [US1] Create HomePage three-column layout in src/renderer/src/pages/home/HomePage.tsx — left: AssistantPanel (togglable), center: ChatArea (always visible), right: TopicSidebar (togglable); read sidebarVisible from useTopicStore; initialize stores on mount (hydrate assistant → topic → messages → blocks in order)
- [ ] T030 [P] [US1] Create ChatArea component in src/renderer/src/pages/home/ChatArea.tsx — vertical flex: ChatHeader (top), MessageList (middle, flex-grow), MessageInput (bottom); show EmptyState when no messages
- [ ] T031 [US1] Create MessageList component in src/renderer/src/components/chat/MessageList.tsx — use @tanstack/react-virtual useVirtualizer for virtual scrolling; render MessageItem per message; auto-scroll to bottom when user is at bottom (check scrollTop + clientHeight >= scrollHeight - threshold); show ScrollToBottom button when scrolled up; load more on scroll to top
- [ ] T032 [P] [US1] Create MessageItem component in src/renderer/src/components/chat/MessageItem.tsx — render single message bubble; user messages right-aligned, assistant messages left-aligned; display role indicator and timestamp; render blocks via BlockRenderer; show loading pulse when status is 'sending'
- [ ] T033 [US1] Create MessageInput component in src/renderer/src/components/chat/MessageInput.tsx — TipTap editor via useEditor() hook with StarterKit and Placeholder extension; send button + stop button swap based on useChatStore.isStreaming; read sendKey from useSettingsStore (Enter vs Ctrl+Enter); onSend calls useChatStore.sendMessage then clears editor; disable input during streaming; proper editor cleanup on unmount
- [ ] T034 [P] [US1] Create ChatHeader component in src/renderer/src/components/chat/ChatHeader.tsx — display active assistant name and emoji, model indicator from assistant.model, topic name; model unavailable warning badge
- [ ] T035 [P] [US1] Create EmptyState component in src/renderer/src/components/chat/EmptyState.tsx — "Start a conversation" header, suggested prompts list; clicking a prompt inserts it into the editor
- [ ] T036 [P] [US1] Create ScrollToBottom component in src/renderer/src/components/chat/ScrollToBottom.tsx — floating button at bottom-right of MessageList; visible only when user has scrolled up; onClick scrolls to bottom

**Checkpoint**: Open app → see empty chat → type message → press send → user message appears, assistant streams response. Virtual scroll works with large message lists.

---

## Phase 4: US6 — Message Block Rendering (P1)

**Purpose**: Discriminated union block renderer and all 8 block type components

**Dependencies**: Phase 3 (MessageItem renders blocks)

- [ ] T037 [US6] Create BlockRenderer dispatcher in src/renderer/src/components/chat/blocks/BlockRenderer.tsx — switch on block.type to render appropriate block component; unknown/unhandled types render UnknownBlock; wrap each block in per-block error boundary
- [ ] T038 [P] [US6] Create TextBlock component in src/renderer/src/components/chat/blocks/TextBlock.tsx — render block.content.text via react-markdown with remark-gfm and rehype-raw plugins; handle streaming incremental updates without layout jumps
- [ ] T039 [P] [US6] Create CodeBlock component in src/renderer/src/components/chat/blocks/CodeBlock.tsx — Shiki singleton highlighter via createHighlighterCore() at module level; lazy-load grammars; cache highlighted HTML per (code, language, theme) tuple; copy button copies raw code to clipboard; show language label
- [ ] T040 [P] [US6] Create ThinkingBlock component in src/renderer/src/components/chat/blocks/ThinkingBlock.tsx — collapsible section with chevron toggle; show thinkingMs duration when available; collapsed by default after stream complete; expanded during streaming
- [ ] T041 [P] [US6] Create ToolBlock placeholder component in src/renderer/src/components/chat/blocks/ToolBlock.tsx — display toolName, status (calling/done/error), args as formatted JSON; placeholder UI for F007 MCP integration
- [ ] T042 [P] [US6] Create ImageBlock component in src/renderer/src/components/chat/blocks/ImageBlock.tsx — render image from URL or base64 data URI; show alt text; respect width/height constraints; click to expand (lightbox)
- [ ] T043 [P] [US6] Create FileBlock component in src/renderer/src/components/chat/blocks/FileBlock.tsx — file attachment card showing fileName, fileSize (formatted), mimeType icon; click to open file
- [ ] T044 [P] [US6] Create ErrorBlock component in src/renderer/src/components/chat/blocks/ErrorBlock.tsx — display error code, message, provider name; retry button calls useChatStore.regenerate when retryable is true; red/warning styling

**Checkpoint**: Message with mixed blocks (text + code + thinking) renders correctly. Shiki highlighting works. Collapsible thinking works. Error block retry triggers regenerate.

---

## Phase 5: US2 — Assistant Management (P1)

**Purpose**: Assistant panel UI — list, search, create/edit dialog, default assistant protection

**Dependencies**: Phase 2 (assistant IPC), Phase 3 (HomePage layout)

- [ ] T045 [US2] Create AssistantPanel layout in src/renderer/src/pages/home/AssistantPanel.tsx — search input at top, AssistantList below, "Create Assistant" button at bottom; collapsible panel with toggle
- [ ] T046 [US2] Create AssistantList component in src/renderer/src/components/chat/AssistantList.tsx — render assistants from useAssistantStore.getFilteredAssistants(); each item shows emoji, name, model indicator; click to setActiveAssistant; highlight active assistant; default assistant pinned at top
- [ ] T047 [US2] Create AssistantEditor dialog in src/renderer/src/components/chat/AssistantEditor.tsx — shadcn/ui Dialog for create/edit; form fields: name (Input), emoji picker, system prompt (Textarea with variable hints), model selector (from useModelStore), temperature/topP/maxTokens/contextCount sliders/inputs, category input, tags input; save calls addAssistant or updateAssistant; delete button (disabled for default assistant) with confirmation
- [ ] T048 [US2] Implement assistant deletion with topic reassignment — when deleteAssistant is called, topics owned by that assistant are reassigned to default assistant via assistant:delete IPC; if deleted assistant was active, fall back to default

**Checkpoint**: Create assistant → configure model/prompt → select it → send message → response uses correct model. Delete assistant → topics reassigned to default.

---

## Phase 6: US3 — Topic Management (P1)

**Purpose**: Topic sidebar UI — list, CRUD, context menu, auto-naming

**Dependencies**: Phase 2 (topic IPC), Phase 3 (HomePage layout)

- [ ] T049 [US3] Create TopicSidebar layout in src/renderer/src/pages/home/TopicSidebar.tsx — "New Topic" button at top, TopicList below; slide-in/out animation when toggled; read sidebarVisible from useTopicStore
- [ ] T050 [US3] Create TopicList component in src/renderer/src/components/chat/TopicList.tsx — render topics from useTopicStore.topics ordered by updatedAt DESC; each item shows name and message count; click to switchTopic; highlight active topic; shadcn/ui ContextMenu with Rename, Pin/Unpin, Delete options
- [ ] T051 [US3] Implement topic rename — double-click topic name activates inline edit (contentEditable); on Enter/blur, call renameTopic which sets isNameManuallyEdited = true
- [ ] T052 [US3] Implement topic delete with confirmation — ContextMenu Delete option shows shadcn/ui AlertDialog confirming cascade delete of all messages; on confirm calls deleteTopic; if deleted topic was active, select next topic or create new one
- [ ] T053 [US3] Implement auto-naming via TopicNameService — after first message exchange completes (ai:stream-complete), if topic.isNameManuallyEdited is false, invoke chat:generateTopicName IPC with first user+assistant messages; update topic name in useTopicStore via updateTopicName (does NOT set isNameManuallyEdited)

**Checkpoint**: Create topic → send message → topic auto-names. Rename → auto-naming disabled. Delete → messages cascade deleted, next topic selected.

---

## Phase 7: US4 — Message Composition (P1)

**Purpose**: Rich TipTap editor features — markdown shortcuts, file attachment, send key config

**Dependencies**: Phase 3 (MessageInput exists)

- [ ] T054 [US4] Add TipTap markdown shortcuts to MessageInput — configure StarterKit for bold (**), italic (*), inline code (`), code block (```), headings (#); visual formatting feedback in the editor
- [ ] T055 [US4] Implement file/image paste handler in MessageInput — listen for paste events with image/file data; create DraftAttachment with metadata (id, type, fileName, filePath, fileSize, mimeType); show image thumbnail preview or file card below the editor; store in useDraftStore
- [ ] T056 [US4] Implement drag-and-drop file attachment in MessageInput — listen for dragover/drop events; validate file type; create DraftAttachment; show preview; store in useDraftStore
- [ ] T057 [US4] Implement send key configuration — read sendKey from useSettingsStore; when sendKey is 'Enter', Enter sends and Shift+Enter creates newline; when sendKey is 'Ctrl+Enter', Ctrl+Enter (Cmd+Enter on mac) sends and Enter creates newline

**Checkpoint**: Type markdown → see formatting. Paste image → see preview. Send with configured key.

---

## Phase 8: US7 — Context Window and API Integration (P1)

**Purpose**: ContextBuilder integration, system prompt variables, token usage display

**Dependencies**: Phase 3 (send flow exists)

- [ ] T058 [US7] Wire ContextBuilder into useChatStore.sendMessage — call ContextBuilder.build(activeAssistant, activeTopic, messages) to produce ChatMessage[] before invoking ai:chat IPC; ensure system prompt is prepended and context is windowed by contextCount
- [ ] T059 [US7] Implement system prompt variable replacement in ContextBuilder — replace {{date}} with current date (YYYY-MM-DD), {{time}} with current time (HH:mm), {{language}} with configured language from useSettingsStore
- [ ] T060 [US7] Display token usage in MessageItem — after stream complete, show promptTokens/completionTokens/totalTokens in a subtle footer on assistant messages; read from message.usage

**Checkpoint**: Set contextCount to 5, send 10 messages, verify API call contains only last 5 + system prompt. Verify {{date}} replaced.

---

## Phase 9: US5 — Message Actions (P2)

**Purpose**: Hover action buttons on messages — copy, edit, delete, regenerate

**Dependencies**: Phase 3 + Phase 4 (messages rendered with blocks)

- [ ] T061 [US5] Implement hover action bar on MessageItem — show action buttons (copy, edit, delete, regenerate) on mouse enter, hide on mouse leave; use Tooltip for each button icon; position at top-right of message bubble
- [ ] T062 [US5] Implement copy action — extract clean markdown from all blocks in the message (text blocks as-is, code blocks as fenced code, skip error/tool blocks); call clipboard:write IPC; show toast "Copied"
- [ ] T063 [US5] Implement edit action — on user message only; load message text content into MessageInput editor; call useChatStore.editAndResend on send which deletes messages after the edited one and resends
- [ ] T064 [US5] Implement delete action — show shadcn/ui AlertDialog confirmation; on confirm call useMessageStore.deleteMessage; cascade deletes blocks via FK
- [ ] T065 [US5] Implement regenerate action — on assistant message only; call useChatStore.regenerate(messageId); replaces the assistant message's blocks and re-streams response

**Checkpoint**: Hover → copy → verify clean markdown in clipboard. Edit → resend → verify new response. Delete → confirm → message gone. Regenerate → new response streams.

---

## Phase 10: US8+US9 — Sidebar Toggle & Draft Persistence (P2)

**Purpose**: Topic sidebar toggle with animation and draft save/restore per topic

**Dependencies**: Phase 3 + Phase 6 (sidebar and topic switching exist)

- [ ] T066 [US8] Implement sidebar toggle animation in HomePage — when toggleSidebar is called, animate TopicSidebar slide-in/slide-out with CSS transition (width 0 → 280px or similar); ChatArea flex-grows to fill; persist sidebarVisible state via useTopicStore persist
- [ ] T067 [US9] Wire draft persistence into MessageInput — on editor content change (debounced 300ms), call useDraftStore.saveDraft(activeTopicId, { text, plainText, attachments }); on topic switch, call loadDraft and restore editor content; on successful send, call clearDraft
- [ ] T068 [US9] Handle draft cleanup on topic delete — when deleteTopic is called, also call useDraftStore.clearDraft for the deleted topic to prevent orphaned drafts

**Checkpoint**: Toggle sidebar → animates → state persists on reload. Type draft → switch topic → switch back → draft restored. Send → draft cleared.

---

## Phase 11: US10 — Assistant Categories (P2)

**Purpose**: Tag-based categorization and grouped display in assistant panel

**Dependencies**: Phase 5 (AssistantPanel and AssistantList exist)

- [ ] T069 [US10] Implement category grouping in AssistantList — group assistants by category field; render category headers with collapsible groups; uncategorized assistants in "General" group; category filter tabs or dropdown at top of AssistantPanel
- [ ] T070 [US10] Add category field to AssistantEditor — Input or Select for category; suggest existing categories from current assistants via datalist/combobox

**Checkpoint**: Create assistants in different categories → panel shows grouped display → filter by category works.

---

## Phase 12: US11+US12 — Multi-Model & Import/Export (P3)

**Purpose**: @ mention multi-model compare mode and assistant import/export

**Dependencies**: Phase 3 (send flow), Phase 5 (assistant CRUD)

- [ ] T071 [US11] Implement @ mention parsing in MessageInput — use TipTap Mention extension; trigger on @ character; show model list dropdown from useModelStore; insert mention node with modelId; extract mentions[] from editor content before send
- [ ] T072 [US11] Implement multi-model send flow in useChatStore — when message has mentions[], invoke ai:chat for each mentioned model in parallel; create separate assistant Messages per model; manage multiple concurrent streams
- [ ] T073 [US11] Implement multi-model display layout in MessageItem — when message has multiModelMessageStyle, render multiple assistant responses in configured layout: horizontal (side-by-side), vertical (stacked), fold (tabs), grid (2x2); read multiModelMessageStyle from message or assistant settings
- [ ] T074 [US12] Implement assistant export UI — add "Export" option in AssistantEditor or AssistantPanel menu; call useAssistantStore.exportAssistants(selectedIds); trigger file save dialog via Electron dialog:showSaveDialog; write JSON file
- [ ] T075 [US12] Implement assistant import UI — add "Import" button in AssistantPanel; trigger file open dialog via Electron dialog:showOpenDialog; read JSON file; call useAssistantStore.importAssistants(jsonString); show imported count toast

**Checkpoint**: Type @modelA @modelB → send → two responses appear in configured layout. Export assistant → delete → import → assistant restored.

---

## Phase 13: Demo

**Purpose**: Demo data fixtures and runnable demo script

- [ ] T076 Create demo data fixtures in demos/fixtures/F005-chat-data.ts — sample assistants (default + "Code Expert" + "Creative Writer"), sample topics with messages, sample blocks (text + code + thinking + error) for demonstrating all block types
- [ ] T077 Create demo script at demos/F005-chat-conversation.sh — launches app, navigates to home, demonstrates: send message → streaming response, switch topic, create assistant, copy message, regenerate, sidebar toggle, block rendering; use foreground process (`exec pnpm run dev`)

**Checkpoint**: Demo script runs successfully and exercises the core chat flow.

---

## Phase 14: Pattern Audit & Polish

**Purpose**: Verify pattern constraints, error boundaries, performance, i18n

- [ ] T078 Audit Zustand selector stability — verify all useAssistantStore, useTopicStore, useMessageStore, useBlockStore, useChatStore, useDraftStore selectors use useShallow for array/object returns; no inline filter/map in selectors
- [ ] T079 Verify TipTap lifecycle — ensure editor is created via useEditor() hook with proper onDestroy cleanup; no editor recreation on re-render; no memory leaks
- [ ] T080 Verify Shiki singleton pattern — confirm highlighter is created once at module level via createHighlighterCore(); grammars lazy-loaded; HTML cached per (code, language, theme)
- [ ] T081 Verify virtual scroll + streaming — confirm auto-scroll checks isAtBottom before appending; uses scrollToIndex not raw scrollTo; respects user scroll-up intent
- [ ] T082 Verify IPC pagination — confirm chat:getMessages uses offset/limit (default 50); chat:getBlocksBatch used for batch loading; no "load all" calls
- [ ] T083 Verify streaming block update pattern — confirm updateBlockContent is in-memory only (no IPC); flushStreamingBlocks batches all updates on stream complete; no per-chunk IPC calls
- [ ] T084 Add ErrorBoundary wrapper on HomePage (route-level) and per-block error boundaries in BlockRenderer
- [ ] T085 Add i18n keys for all user-facing strings in chat UI — assistant panel labels, topic sidebar labels, message actions, empty state text, error messages, dialog titles/buttons; add translations for ko and en
- [ ] T086 Implement performance optimizations — React.memo on MessageItem and BlockRenderer; lazy load block components (CodeBlock, ImageBlock) via React.lazy; useMemo for expensive computations (markdown rendering, block sorting)
- [ ] T087 Verify nanoid usage — all entity IDs (messages, blocks, topics, assistants) use nanoid(21); no uuid or crypto.randomUUID
- [ ] T088 Verify build succeeds — run pnpm run build, fix any TypeScript or bundling issues with new dependencies

**Checkpoint**: All pattern constraints verified. Build succeeds. i18n complete. Performance acceptable with 500+ messages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Data Layer)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — core chat flow
- **Phase 4 (US6)**: Depends on Phase 3 (MessageItem renders blocks)
- **Phase 5 (US2)**: Depends on Phase 2 + Phase 3 (assistant IPC + HomePage layout)
- **Phase 6 (US3)**: Depends on Phase 2 + Phase 3 (topic IPC + HomePage layout)
- **Phase 7 (US4)**: Depends on Phase 3 (MessageInput exists)
- **Phase 8 (US7)**: Depends on Phase 3 (send flow exists)
- **Phase 9 (US5)**: Depends on Phase 3 + Phase 4 (rendered messages with blocks)
- **Phase 10 (US8+9)**: Depends on Phase 3 + Phase 6 (sidebar + topic switching)
- **Phase 11 (US10)**: Depends on Phase 5 (AssistantPanel exists)
- **Phase 12 (US11+12)**: Depends on Phase 3 + Phase 5 (send flow + assistant CRUD)
- **Phase 13 (Demo)**: Depends on Phases 3-6 minimum
- **Phase 14 (Polish)**: Depends on all feature phases complete

### Parallel Opportunities

- T001-T004 can all run in parallel (independent packages)
- T005-T008 can all run in parallel (different type files)
- T009-T011 can all run in parallel (different schema files)
- T014, T015 can run in parallel with T013 (different services)
- T016, T017 can run in parallel (different handler files)
- T020-T024 can run in parallel (different store files)
- T027, T028 can run in parallel with T026 (different service files)
- T030, T032, T034-T036 can run in parallel (independent UI components)
- T038-T044 can all run in parallel (independent block components)
- Phase 5 and Phase 6 can run in parallel (different panels)
- Phase 7 and Phase 8 can run in parallel after Phase 3

---

## Notes

- [P] tasks = different files, no dependencies within the same phase
- [Story] label maps task to specific user story for traceability
- All DB access via IPC (ARC-01) — no direct SQLite from renderer
- Zustand selectors must use useShallow for array/object returns
- Pattern Constraints from plan.md apply to all implementation tasks
- Streaming block updates are in-memory only; batch-persisted on stream complete
- F005 does NOT contain provider-specific code (ARC-03) — all AI interaction via F004's ai:chat interface
- nanoid(21) for all entity IDs — consistent with F001-F004 patterns
- TipTap is uncontrolled — use editor.commands for programmatic changes, not React state
