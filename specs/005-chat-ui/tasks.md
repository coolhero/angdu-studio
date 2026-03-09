# Tasks: Chat UI

**Input**: Design documents from `/specs/005-chat-ui/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: TDD approach per Constitution VI. Tests written before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create shared UI primitives, configure Tailwind/shadcn

- [X] T001 Install new dependencies: shadcn/ui, sonner, TipTap, react-markdown, shiki, katex, mermaid, @xyflow/react, @hello-pangea/dnd, react-infinite-scroll-component, react-hotkeys-hook, motion, partial-json, class-variance-authority per specs/005-chat-ui/quickstart.md
- [X] T002 Initialize shadcn/ui and add components (button, tooltip, dropdown-menu, dialog, alert-dialog, separator, collapsible, accordion, alert, badge, avatar, card, input, textarea, popover, scroll-area) to src/renderer/src/components/ui/
- [X] T003 [P] Configure Sonner ToastProvider in src/renderer/src/App.tsx
- [X] T004 [P] Create ConfirmDialogProvider with useConfirmDialog hook in src/renderer/src/components/ConfirmDialogProvider.tsx and src/renderer/src/hooks/useConfirmDialog.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core stores, services, hooks, and event system that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [X] T005 [P] Write unit tests for useRuntimeStore in tests/unit/stores/useRuntimeStore.test.ts
- [X] T006 [P] Write unit tests for useSettingsStore in tests/unit/stores/useSettingsStore.test.ts
- [X] T007 [P] Write unit tests for useInputToolsStore in tests/unit/stores/useInputToolsStore.test.ts
- [X] T008 [P] Write unit tests for EventService in tests/unit/services/EventService.test.ts

### Implementation for Foundational

- [X] T009 [P] Create useRuntimeStore (activeAssistantId, activeTopicId, generatingTopicIds, isMultiSelectMode, selectedMessageIds) in src/renderer/src/stores/useRuntimeStore.ts
- [X] T010 [P] Create useSettingsStore with Zustand persist (sendMessageShortcut, narrowMode, messageStyle, fontSize, mathEngine, showPrompt, topicPosition, etc.) in src/renderer/src/stores/useSettingsStore.ts
- [X] T011 [P] Create useInputToolsStore with Zustand persist (toolOrder per scope, isCollapsed) in src/renderer/src/stores/useInputToolsStore.ts
- [X] T012 Create EventService with typed ChatEvent enum (SEND_MESSAGE, CLEAR_MESSAGES, NEW_CONTEXT, NEW_BRANCH, EDIT_MESSAGE, LOCATE_MESSAGE, etc.) in src/renderer/src/services/EventService.ts
- [X] T013 [P] Implement useSettings hook (typed selector for useSettingsStore) in src/renderer/src/hooks/useSettings.ts
- [X] T014 [P] Implement useRuntime hook (convenience wrapper for useRuntimeStore) in src/renderer/src/hooks/useRuntime.ts
- [X] T015 [P] Implement useShortcut hook (wraps react-hotkeys-hook) in src/renderer/src/hooks/useShortcut.ts
- [X] T016 [P] Implement useTimer hook (debounce/throttle) in src/renderer/src/hooks/useTimer.ts
- [X] T017 [P] Implement useShowAssistants and useShowTopics hooks in src/renderer/src/hooks/useShowAssistants.ts and src/renderer/src/hooks/useShowTopics.ts
- [X] T018 [P] Create default input tool ordering config in src/renderer/src/config/inputTools.ts
- [X] T019 Add i18n keys for all chat UI text to src/renderer/src/i18n/ko.json and src/renderer/src/i18n/en.json

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Send and Receive Messages (Priority: P1) 🎯 MVP

**Goal**: User types a message, sends it, and sees the assistant's streaming response with progressive block rendering

**Independent Test**: Open a conversation, send a message, observe streaming response render progressively

### Tests for User Story 1

- [X] T020 [P] [US1] Write unit tests for useSmoothStream hook in tests/unit/hooks/useSmoothStream.test.ts
- [X] T021 [P] [US1] Write unit tests for MainTextBlock rendering in tests/unit/components/Blocks/MainTextBlock.test.tsx
- [X] T022 [P] [US1] Write unit tests for PlaceholderBlock in tests/unit/components/Blocks/PlaceholderBlock.test.tsx

### Implementation for User Story 1

- [X] T023 [P] [US1] Implement useSmoothStream hook (buffer, requestAnimationFrame drain, addChunk/flush/reset) in src/renderer/src/hooks/useSmoothStream.ts
- [X] T024 [P] [US1] Implement useTopicMessages hook (select messages for topic, loading state, loadMore) in src/renderer/src/hooks/useTopicMessages.ts
- [X] T025 [P] [US1] Implement useTopicLoading hook (streaming/loading state from useRuntimeStore) in src/renderer/src/hooks/useTopicLoading.ts
- [X] T026 [US1] Create Markdown component with react-markdown, remark-gfm, remark-math, rehype-katex, rehype-raw, and useSmoothStream integration in src/renderer/src/pages/home/Markdown/Markdown.tsx
- [X] T027 [P] [US1] Create MainTextBlock component (renders Markdown with citation support) in src/renderer/src/pages/home/Messages/Blocks/MainTextBlock.tsx
- [X] T028 [P] [US1] Create PlaceholderBlock component (loading/pending state) in src/renderer/src/pages/home/Messages/Blocks/PlaceholderBlock.tsx
- [X] T029 [US1] Create MessageBlockRenderer dispatch component (maps block.type to component, groups consecutive IMAGE/TOOL/VIDEO, motion/react animation wrappers) in src/renderer/src/pages/home/Messages/Blocks/index.tsx
- [X] T030 [US1] Create MessageContent component (thin wrapper dispatching to MessageBlockRenderer) in src/renderer/src/pages/home/Messages/MessageContent.tsx
- [X] T031 [P] [US1] Create MessageHeader component (avatar, model name, timestamp) in src/renderer/src/pages/home/Messages/MessageHeader.tsx
- [X] T032 [US1] Create Message component (composes MessageHeader, MessageContent, handles streaming state) in src/renderer/src/pages/home/Messages/Message.tsx
- [X] T033 [US1] Create Messages component with react-infinite-scroll-component (reverse scroll, lazy loading via useTopicMessages) in src/renderer/src/pages/home/Messages/Messages.tsx
- [X] T034 [US1] Create basic Inputbar component with text input and send button (sendMessageShortcut from useSettingsStore, calls MessagesService.sendMessage) in src/renderer/src/pages/home/Inputbar/Inputbar.tsx
- [X] T035 [US1] Create Chat container component (orchestrates Messages and Inputbar) in src/renderer/src/pages/home/Chat.tsx
- [X] T036 [US1] Create minimal HomePage layout (Chat area only, no sidebar yet) in src/renderer/src/pages/home/HomePage.tsx
- [X] T037 [US1] Wire HomePage into App.tsx routing so the chat is accessible on launch

**Checkpoint**: User Story 1 complete — user can send messages and see streaming responses

---

## Phase 4: User Story 2 - Rich Markdown Content Display (Priority: P1)

**Goal**: Responses render with syntax-highlighted code, formatted math, Mermaid diagrams, and scrollable tables

**Independent Test**: View a response containing code blocks, LaTeX, Mermaid diagram, and a wide table

### Tests for User Story 2

- [X] T038 [P] [US2] Write unit tests for Markdown component (code, math, table rendering) in tests/unit/components/Markdown.test.tsx

### Implementation for User Story 2

- [X] T039 [P] [US2] Implement CodeBlock component with Shiki syntax highlighting (theme-aware via useThemeStore, copy action) in src/renderer/src/pages/home/Markdown/CodeBlock.tsx
- [X] T040 [P] [US2] Implement Table component with horizontal scroll wrapper in src/renderer/src/pages/home/Markdown/Table.tsx
- [X] T041 [P] [US2] Implement Link component with external link handling (opens in default browser) in src/renderer/src/pages/home/Markdown/Link.tsx
- [X] T042 [P] [US2] Implement MarkdownSvgRenderer for inline SVG rendering in src/renderer/src/pages/home/Markdown/MarkdownSvgRenderer.tsx
- [X] T043 [P] [US2] Create rehypeHeadingIds plugin in src/renderer/src/pages/home/Markdown/plugins/rehypeHeadingIds.ts
- [X] T044 [P] [US2] Create rehypeScalableSvg plugin in src/renderer/src/pages/home/Markdown/plugins/rehypeScalableSvg.ts
- [X] T045 [P] [US2] Create remarkDisableConstructs plugin in src/renderer/src/pages/home/Markdown/plugins/remarkDisableConstructs.ts
- [X] T046 [US2] Integrate Mermaid diagram rendering into Markdown component (lazy-load mermaid, render fenced code blocks with language=mermaid) in src/renderer/src/pages/home/Markdown/Markdown.tsx
- [X] T047 [US2] Add KaTeX/MathJax configurable toggle (reads mathEngine from useSettingsStore) and wire rehype-mathjax as alternative to rehype-katex in src/renderer/src/pages/home/Markdown/Markdown.tsx
- [X] T048 [US2] Wire CodeBlock, Table, Link, MarkdownSvgRenderer, and plugins into Markdown component's custom component map

**Checkpoint**: Rich markdown renders correctly — code highlighting, math, diagrams, tables

---

## Phase 5: User Story 3 - Rich Text Input with Tools (Priority: P1)

**Goal**: User composes messages with TipTap editor, slash commands, file attachments, and 18 configurable tools

**Independent Test**: Open input bar, type "/", see slash menu; attach file and see preview; configure tool ordering

### Tests for User Story 3

- [X] T049 [P] [US3] Write unit tests for useInputText hook (draft caching with 24h TTL) in tests/unit/hooks/useInputText.test.ts

### Implementation for User Story 3

- [X] T050 [P] [US3] Implement useInputText hook with draft caching (localStorage with 24h TTL per topicId) in src/renderer/src/hooks/useInputText.ts
- [X] T051 [P] [US3] Implement useTextareaResize hook (auto-resize, expand/collapse) in src/renderer/src/hooks/useTextareaResize.ts
- [X] T052 [US3] Create ToolDefinition types and defineTool/registerTool registry functions in src/renderer/src/pages/home/Inputbar/types.ts
- [X] T053 [US3] Create tool registry with getInputbarConfig(scope) and default tool ordering in src/renderer/src/pages/home/Inputbar/registry.ts
- [X] T054 [US3] Create InputbarToolsProvider (React context providing tool state and actions) in src/renderer/src/pages/home/Inputbar/context/InputbarToolsProvider.tsx
- [X] T055 [US3] Create RichEditor wrapper for TipTap with placeholder, mention, and slash command extensions in src/renderer/src/components/RichEditor/index.tsx
- [X] T056 [US3] Create QuickPanel component for slash commands (/) and mentions (@) with trigger-based menu in src/renderer/src/components/QuickPanel/index.tsx
- [X] T057 [US3] Create InputbarCore component (TipTap editor + send button + attachment preview slots) in src/renderer/src/pages/home/Inputbar/InputbarCore.tsx
- [X] T058 [P] [US3] Create SendMessageButton with send/stop toggle (respects generatingTopicIds from useRuntimeStore) in src/renderer/src/pages/home/Inputbar/SendMessageButton.tsx
- [X] T059 [P] [US3] Create TokenCount component (real-time token estimation display) in src/renderer/src/pages/home/Inputbar/TokenCount.tsx
- [X] T060 [P] [US3] Create AttachmentPreview component (file/image preview before sending) in src/renderer/src/pages/home/Inputbar/AttachmentPreview.tsx
- [X] T061 [US3] Create InputbarTools component with DnD ordering via @hello-pangea/dnd (reads useInputToolsStore, visible/hidden tools per scope) in src/renderer/src/pages/home/Inputbar/InputbarTools.tsx
- [X] T062 [US3] Implement 18 input tool modules (attachment, webSearch, knowledgeBase, mcpTools, mentionModels, thinking, generateImage, newTopic, newContext, clearTopic, toggleExpand, slashCommands, quickPhrases, resource, urlContext, createSession) in src/renderer/src/pages/home/Inputbar/tools/
- [X] T063 [US3] Upgrade Inputbar (from T034) to use InputbarCore, InputbarTools, InputbarToolsProvider, useInputText with draft caching in src/renderer/src/pages/home/Inputbar/Inputbar.tsx

**Checkpoint**: Full input bar with TipTap, slash commands, file attachments, 18 tools with DnD ordering

---

## Phase 6: User Story 4 - Message Block Types (Priority: P1)

**Goal**: All 11 block types render with type-specific formatting, plus UnknownBlock fallback

**Independent Test**: View a conversation with each block type and verify correct rendering

### Tests for User Story 4

- [X] T064 [P] [US4] Write unit tests for ThinkingBlock in tests/unit/components/Blocks/ThinkingBlock.test.tsx
- [X] T065 [P] [US4] Write unit tests for ErrorBlock in tests/unit/components/Blocks/ErrorBlock.test.tsx

### Implementation for User Story 4

- [X] T066 [P] [US4] Create ThinkingBlock component (collapsible via shadcn Collapsible, elapsed time display) in src/renderer/src/pages/home/Messages/Blocks/ThinkingBlock.tsx
- [X] T067 [P] [US4] Create ToolBlock component (formatted tool name, arguments table, output) in src/renderer/src/pages/home/Messages/Blocks/ToolBlock.tsx
- [X] T068 [P] [US4] Create ToolBlockGroup component (groups consecutive TOOL blocks) in src/renderer/src/pages/home/Messages/Blocks/ToolBlockGroup.tsx
- [X] T069 [P] [US4] Create ImageBlock component (image display with ImageViewer lightbox) in src/renderer/src/pages/home/Messages/Blocks/ImageBlock.tsx
- [X] T070 [P] [US4] Create ImageViewer lightbox component in src/renderer/src/components/ImageViewer.tsx
- [X] T071 [P] [US4] Create VideoBlock component in src/renderer/src/pages/home/Messages/Blocks/VideoBlock.tsx
- [X] T072 [P] [US4] Create FileBlock component in src/renderer/src/pages/home/Messages/Blocks/FileBlock.tsx
- [X] T073 [P] [US4] Create CitationBlock component (source links, hover tooltips via CitationTooltip) in src/renderer/src/pages/home/Messages/Blocks/CitationBlock.tsx
- [X] T074 [P] [US4] Create CitationTooltip component in src/renderer/src/pages/home/Markdown/CitationTooltip.tsx
- [X] T075 [P] [US4] Create ErrorBlock component (serialized error details in alert format) in src/renderer/src/pages/home/Messages/Blocks/ErrorBlock.tsx
- [X] T076 [P] [US4] Create TranslationBlock component in src/renderer/src/pages/home/Messages/Blocks/TranslationBlock.tsx
- [X] T077 [P] [US4] Create CompactBlock component in src/renderer/src/pages/home/Messages/Blocks/CompactBlock.tsx
- [X] T078 [US4] Update MessageBlockRenderer (T029) to include all 11 block types plus UnknownBlock fallback in src/renderer/src/pages/home/Messages/Blocks/index.tsx

**Checkpoint**: All 11 block types render correctly, unknown types show placeholder

---

## Phase 7: User Story 5 - Message Actions (Priority: P2)

**Goal**: Per-message hover toolbar with copy, edit, retry, delete, translate, fork, TTS, bookmark actions

**Independent Test**: Hover a message, click each action, verify expected behavior

### Tests for User Story 5

- [X] T079 [P] [US5] Write unit tests for MessageMenubar actions in tests/unit/components/MessageMenubar.test.tsx

### Implementation for User Story 5

- [X] T080 [US5] Implement useMessageOperations hook (editMessage, resendMessage, deleteMessage, retryMessage, pauseMessage, clearTopicMessages, createBranch) in src/renderer/src/hooks/useMessageOperations.ts
- [X] T081 [US5] Create MessageMenubar component (hover toolbar with copy/edit/retry/delete/translate/fork/TTS/bookmark using shadcn DropdownMenu and Tooltip) in src/renderer/src/pages/home/Messages/MessageMenubar.tsx
- [X] T082 [US5] Create MessageEditor component (inline editing with save/resend/cancel using shadcn Input) in src/renderer/src/pages/home/Messages/MessageEditor.tsx
- [X] T083 [US5] Wire MessageMenubar and MessageEditor into Message component (T032) in src/renderer/src/pages/home/Messages/Message.tsx
- [X] T083b [P] [US5] Create MessageTokens component (displays token usage from message.usage after generation completes) in src/renderer/src/pages/home/Messages/MessageTokens.tsx and wire into MessageHeader
- [X] T083c [P] [US5] Create MessageAttachments component (displays user-attached files/images within sent messages, reads from message blocks of type FILE/IMAGE) in src/renderer/src/pages/home/Messages/MessageAttachments.tsx and wire into Message
- [X] T084 [US5] Create MessageMcpTool component (MCP tool call display: arguments table, response, progress) in src/renderer/src/pages/home/Messages/Tools/MessageMcpTool.tsx
- [X] T085 [P] [US5] Create ToolApprovalActions component (approve/deny buttons for tool calls) in src/renderer/src/pages/home/Messages/Tools/ToolApprovalActions.tsx
- [X] T086 [P] [US5] Create shared tool UI components (ArgsTable, truncateOutput) in src/renderer/src/pages/home/Messages/Tools/shared/

**Checkpoint**: All message actions work — copy, edit, retry, delete, translate, fork, TTS

---

## Phase 8: User Story 6 - Sidebar Navigation (Priority: P2)

**Goal**: Sidebar with tabs for assistants, topics, sessions with CRUD operations

**Independent Test**: Switch sidebar tabs, create/select/delete items, resize viewport

### Implementation for User Story 6

- [X] T087 [P] [US6] Create AssistantsTab component (list assistants with tag groups, create/edit/delete) in src/renderer/src/pages/home/Tabs/AssistantsTab.tsx
- [X] T088 [P] [US6] Create TopicsTab component (list topics for active assistant, create/rename/delete) in src/renderer/src/pages/home/Tabs/TopicsTab.tsx
- [X] T089 [P] [US6] Create SessionsTab component (list agent sessions) in src/renderer/src/pages/home/Tabs/SessionsTab.tsx
- [X] T090 [P] [US6] Create tab sub-components (AssistantItem, TopicItem, SessionItem, AddButton) in src/renderer/src/pages/home/Tabs/components/
- [X] T091 [US6] Create HomeTabs container with tab switching and motion/react sidebar animation in src/renderer/src/pages/home/Tabs/index.tsx
- [X] T092 [US6] Implement useAssistant hook (get/update assistant, model, topics) in src/renderer/src/hooks/useAssistant.ts
- [X] T093 [US6] Upgrade HomePage (T036) to include HomeTabs sidebar with show/hide toggle in src/renderer/src/pages/home/HomePage.tsx
- [X] T094 [US6] Create Navbar component (sidebar toggles, search, narrow mode toggle) in src/renderer/src/pages/home/Navbar.tsx

**Checkpoint**: Sidebar navigation works — assistants, topics, sessions with CRUD

---

## Phase 9: User Story 7 - Smooth Scrolling and Infinite Load (Priority: P2)

**Goal**: Long conversations scroll smoothly during streaming with lazy loading and navigation controls

**Independent Test**: Load 100+ messages, scroll during streaming, verify 60fps and lazy loading

### Implementation for User Story 7

- [X] T095 [P] [US7] Implement useScrollPosition hook (persist/restore scroll position per topic) in src/renderer/src/hooks/useScrollPosition.ts
- [X] T096 [US7] Create ChatNavigation component (scroll-to-bottom button, jump-to-message) in src/renderer/src/pages/home/Messages/ChatNavigation.tsx
- [X] T097 [US7] Create NarrowLayout responsive wrapper in src/renderer/src/pages/home/Messages/NarrowLayout.tsx
- [X] T098 [US7] Wire ChatNavigation, NarrowLayout, and useScrollPosition into Messages component (T033), optimize scroll performance for streaming in src/renderer/src/pages/home/Messages/Messages.tsx

**Checkpoint**: Smooth scrolling, infinite load, navigation controls all work

---

## Phase 10: User Story 8 - Streaming Lifecycle and Error Recovery (Priority: P2)

**Goal**: Stream interruptions preserve partial blocks, generation state guard blocks concurrent actions, rate limit countdown displayed

**Independent Test**: Simulate stream interruption, verify partial preservation and retry; try sending during active stream

### Implementation for User Story 8

- [X] T099 [US8] Implement generation state guard in useRuntimeStore (block topic switch and concurrent sends when generatingTopicIds is non-empty) in src/renderer/src/stores/useRuntimeStore.ts
- [X] T100 [US8] Wire generation state guard into Inputbar (disable send during streaming), sidebar (block topic switch), and Chat (show generating indicator) in src/renderer/src/pages/home/Chat.tsx and src/renderer/src/pages/home/Inputbar/Inputbar.tsx
- [X] T100b [US8] Implement context window filtering integration: before calling MessagesService.sendMessage, invoke ConversationService.filterMessagesPipeline and ConversationService.getContextCount to enforce context limit (FR-034) in src/renderer/src/pages/home/Inputbar/Inputbar.tsx
- [X] T101 [US8] Implement rate-limit countdown display (reads checkRateLimit from MessagesService, shows toast countdown via Sonner) in src/renderer/src/pages/home/Inputbar/Inputbar.tsx
- [X] T102 [US8] Create empty state component (prompt suggestions when conversation has no messages) in src/renderer/src/pages/home/Messages/EmptyState.tsx
- [X] T103 [US8] Wire empty state into Messages component, show when messagesByTopic is empty for active topic in src/renderer/src/pages/home/Messages/Messages.tsx

**Checkpoint**: Error recovery, generation guard, rate limiting, and empty state all functional

---

## Phase 11: Additional Features (P2/P3)

**Purpose**: Content search, multi-select, message grouping, system prompt, conversation graph

- [X] T104 [P] Create ContentSearch component (Ctrl+F shortcut, text match against messages, scroll-to-match with highlight) in src/renderer/src/components/ContentSearch.tsx
- [X] T105 [P] Create Prompt component (system prompt display at top of chat) in src/renderer/src/pages/home/Messages/Prompt.tsx
- [X] T106 [P] Create MessageGroup component (group messages by askId for multi-model responses) in src/renderer/src/pages/home/Messages/MessageGroup.tsx
- [X] T107 [P] Create SelectionBox component (multi-select drag overlay) in src/renderer/src/pages/home/Messages/SelectionBox.tsx
- [X] T108 [P] Implement useChatContext hook (multi-select mode, selection handlers) in src/renderer/src/hooks/useChatContext.ts
- [X] T109 [P] Create MessageOutline component (heading-based outline sidebar for assistant messages) in src/renderer/src/pages/home/Messages/MessageOutline.tsx
- [X] T110 Create ChatFlowHistory component (React Flow conversation graph, toggle between list and graph views) in src/renderer/src/pages/home/Messages/ChatFlowHistory.tsx
- [X] T111 Wire ContentSearch, Prompt, MessageGroup, SelectionBox, and MessageOutline into Chat/Messages components

**Checkpoint**: All P2/P3 features complete — search, multi-select, grouping, graph view

---

## Phase 12: Polish & Demo

**Purpose**: Integration testing, i18n completion, demo script, final polish

- [X] T112 Run full test suite (npx vitest run), fix any failures
- [X] T113 Run type check (npx tsc --noEmit), fix any type errors
- [X] T114 Verify all i18n keys are present in ko.json and en.json for all new UI text
- [X] T115 Create demo script demos/F005-chat-ui.sh (launches app with full chat UI, --ci mode for health check, interactive mode with "Try it" instructions)
- [X] T116 Update demos/README.md with F005 entry
- [X] T117 Run quickstart.md validation (install deps, build, test)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP, start first
- **US2 (Phase 4)**: Depends on Phase 3 (uses Markdown component from US1)
- **US3 (Phase 5)**: Depends on Phase 2 — can parallel with US2
- **US4 (Phase 6)**: Depends on Phase 3 (uses MessageBlockRenderer from US1)
- **US5 (Phase 7)**: Depends on Phase 3 (uses Message component from US1)
- **US6 (Phase 8)**: Depends on Phase 2 — can parallel with US1
- **US7 (Phase 9)**: Depends on Phase 3 (uses Messages component from US1)
- **US8 (Phase 10)**: Depends on Phase 3 (uses Chat and Inputbar from US1)
- **Additional (Phase 11)**: Depends on Phase 3-10 completion
- **Polish (Phase 12)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: Foundation only — MVP, no other story dependencies
- **US2 (P1)**: Depends on US1 (Markdown component)
- **US3 (P1)**: Foundation only — can parallel with US1/US2
- **US4 (P1)**: Depends on US1 (BlockRenderer)
- **US5 (P2)**: Depends on US1 (Message component)
- **US6 (P2)**: Foundation only — can parallel with US1
- **US7 (P2)**: Depends on US1 (Messages component)
- **US8 (P2)**: Depends on US1 (Chat/Inputbar)

### Parallel Opportunities

**After Foundation (Phase 2)**:
- US1 + US3 + US6 can start in parallel (no cross-dependencies)

**After US1 (Phase 3)**:
- US2 + US4 + US5 + US7 + US8 can start in parallel

**Within phases**: All tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational stores and hooks
3. Phase 3: US1 — Send and Receive Messages
4. **STOP and VALIDATE**: User can send messages, see streaming responses
5. Demo-ready MVP

### Incremental Delivery

1. Setup + Foundation → Core ready
2. US1 → Basic chat (MVP)
3. US2 → Rich markdown rendering
4. US3 → Full input bar with tools
5. US4 → All 11 block types
6. US5-US8 → Actions, sidebar, scrolling, error recovery
7. Phase 11-12 → Polish and demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Constitution VI requires tests before implementation
- Constitution VII requires executable demo script
- Constitution VIII requires ko + en i18n for all text
- Total: 120 tasks across 12 phases, 8 user stories
