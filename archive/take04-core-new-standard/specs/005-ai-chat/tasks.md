# Tasks: AI Chat (F005)

**Input**: Design documents from `/specs/005-ai-chat/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD approach — tests written before implementation per Constitution XIV.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Types & Schema)

**Purpose**: Define shared types and database schema

- [X] T001 Define shared chat types (Assistant, AssistantSettings, Topic, Message, MessageBlock variants, QuickPhrase, enums) in packages/shared/types/chat.ts
- [X] T002 Export chat types from packages/shared/types/index.ts
- [X] T003 Add Dexie version(3) schema migration with 5 new tables (assistants, topics, messages, message_blocks, quick_phrases) in src/renderer/src/lib/db.ts
- [X] T004 Verify type compatibility with F001 (FileMetadata), F002 (Provider, Model), F003 (RuntimeExecutor), F004 (KnowledgeBase, KnowledgeReference) types

**Checkpoint**: All types compile, Dexie v3 migration defined

---

## Phase 2: Foundational (Stores)

**Purpose**: Core state management stores — MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Write tests for useAssistantStore in tests/unit/renderer/stores/useAssistantStore.test.ts
- [X] T006 [P] Write tests for useMessageStore in tests/unit/renderer/stores/useMessageStore.test.ts
- [X] T007 [P] Write tests for useRuntimeStore in tests/unit/renderer/stores/useRuntimeStore.test.ts
- [X] T008 [P] Implement useAssistantStore (persist + broadcastSync, 10 actions, 3 selectors) in src/renderer/src/stores/useAssistantStore.ts
- [X] T009 [P] Implement useMessageStore (Dexie-backed, broadcastSync, 11 actions, 4 selectors, normalized entities) in src/renderer/src/stores/useMessageStore.ts
- [X] T010 [P] Implement useRuntimeStore (transient, no persist, 5 actions) in src/renderer/src/stores/useRuntimeStore.ts
- [X] T011 Run all store tests — verify pass

**Checkpoint**: Foundation ready — stores operational, tests green

---

## Phase 3: User Story 1 — Send Message and Receive Streaming Response (Priority: P1) 🎯 MVP

**Goal**: User sends a message, receives a streaming AI response with block-based rendering, messages persist to database

**Independent Test**: Create default assistant, type "Hello", send, verify streamed response appears and persists

### Tests for US1

- [X] T012 [P] [US1] Write tests for MessagesService (createUserMessage, createAssistantMessage, filterContextMessages, getContextCount, checkRateLimit) in tests/unit/renderer/services/MessagesService.test.ts
- [X] T013 [P] [US1] Write tests for useMessages hook (sendMessage, cancel, persist) in tests/unit/renderer/hooks/useMessages.test.ts

### Implementation for US1

- [X] T014 [US1] Implement MessagesService (createUserMessage, createAssistantMessage, resetAssistantMessage, filterContextMessages, getContextCount, checkRateLimit, deleteMessageFiles) in src/renderer/src/services/MessagesService.ts
- [X] T015 [US1] Implement useMessages hook (sendMessage pipeline: compose → validate → context → KB inject → executeStream → accumulate blocks → persist) in src/renderer/src/hooks/useMessages.ts
- [X] T016 [US1] Implement block accumulation logic: THINKING blocks prepend, others append, status sync (block PROCESSING → message PROCESSING, block ERROR → message ERROR) in useMessages.ts
- [X] T017 [US1] Implement Dexie persistence helpers for messages and blocks (save, load, delete) integrated with useMessageStore
- [X] T018 [US1] Integrate with F003 RuntimeExecutor/executeStream for AI streaming
- [X] T019 [US1] Integrate with F004 knowledge-base:search IPC for RAG injection when assistant has knowledgeBaseIds
- [X] T020 [US1] Run US1 tests — verify pass

**Checkpoint**: US1 functional — send message, receive streaming response, persists to Dexie

---

## Phase 4: User Story 2 — Assistant Management (Priority: P1)

**Goal**: User creates, edits, deletes assistants with system prompts, model selection, and per-assistant settings

**Independent Test**: Create assistant with custom prompt and model, verify settings persist, edit and delete

### Tests for US2

- [X] T021 [P] [US2] Write tests for useAssistant hook (CRUD, model resolution, reasoning effort sync) in tests/unit/renderer/hooks/useAssistant.test.ts

### Implementation for US2

- [X] T022 [US2] Implement useAssistant hook (assistant normalization, model resolution, addTopic, removeTopic, setModel, updateAssistant, updateAssistantSettings) in src/renderer/src/hooks/useAssistant.ts
- [X] T023 [US2] Implement reasoning_effort sync logic in useAssistant: cache on model switch, restore from cache, qwenThinkMode handling
- [X] T024 [US2] Implement default assistant initialization — create default assistant on first launch if none exists
- [X] T025 [US2] Run US2 tests — verify pass

**Checkpoint**: US2 functional — assistant CRUD with settings persistence

---

## Phase 5: User Story 3 — Topic Management (Priority: P1)

**Goal**: User creates, renames, pins, deletes topics within assistants, with auto-naming support

**Independent Test**: Create topic, send messages, rename, pin, create second topic, switch, verify state persists

### Tests for US3

- [X] T026 [P] [US3] Write tests for useTopic hook and TopicNamingService in tests/unit/renderer/hooks/useTopic.test.ts and tests/unit/renderer/services/TopicNamingService.test.ts

### Implementation for US3

- [X] T027 [US3] Implement TopicNamingService (autoRenameTopic with lock, AI summary, fallback to text truncation, isNameManuallyEdited respect, 700ms feedback timer) in src/renderer/src/services/TopicNamingService.ts
- [X] T028 [US3] Implement useTopic hook (activeTopic, setActiveTopic, sorted topics: pinned first then by updatedAt desc) in src/renderer/src/hooks/useTopic.ts
- [X] T029 [US3] Implement TopicManager module utilities (getTopic, getTopicMessages, removeTopic with cascade, clearTopicMessages) in src/renderer/src/services/TopicManager.ts
- [X] T030 [US3] Run US3 tests — verify pass

**Checkpoint**: US3 functional — topic lifecycle with auto-naming and persistence

---

## Phase 6: User Story 4 — Block-Based Message Rendering (Priority: P1)

**Goal**: Messages render as typed blocks (12 types) with appropriate formatting per type

**Independent Test**: Trigger responses producing different block types, verify rendering

### Tests for US4

- [X] T031 [P] [US4] Write tests for useBlockRenderer hook (block type dispatch, status mapping) in tests/unit/renderer/hooks/useBlockRenderer.test.ts

### Implementation for US4

- [X] T032 [US4] Implement useBlockRenderer hook (registry-based block type → renderer mapping) in src/renderer/src/hooks/useBlockRenderer.ts
- [X] T033 [US4] Implement block rendering utilities: MainText (markdown), Code (syntax highlight + language), Thinking (collapsible + duration), Tool (name + args + result), Citation (numbered refs, dedup, renumber), Error (error display), File (metadata), Image (url/file), Translation (source/target), Video (url/path), Compact (content), Unknown (fallback) in src/renderer/src/services/BlockRenderUtils.ts
- [X] T034 [US4] Implement Citation deduplication and renumbering logic: web search refs + KB refs + memory refs, dedup by URL, sequential numbering in BlockRenderUtils.ts
- [X] T035 [US4] Run US4 tests — verify pass

**Checkpoint**: US4 functional — all 12 block types render correctly

---

## Phase 7: User Story 5 — Stream Cancellation and Message Control (Priority: P2)

**Goal**: User can cancel streaming, edit messages, retry failed messages

**Independent Test**: Send message, cancel mid-stream, verify partial preserved, edit and verify regeneration

### Implementation for US5

- [X] T036 [US5] Implement stream cancellation in useMessages (abort controller, preserve partial blocks, status → PAUSED) in useMessages.ts
- [X] T037 [US5] Implement message edit (re-send edited content, remove old response, regenerate) in useMessages.ts
- [X] T038 [US5] Implement message retry (re-send failed message, reset status, new response) in useMessages.ts
- [X] T039 [US5] Implement message delete (remove message + blocks from store + Dexie) in useMessages.ts

**Checkpoint**: US5 functional — full message control (cancel, edit, retry, delete)

---

## Phase 8: User Story 6 — Multi-Model Dispatch (Priority: P2)

**Goal**: User sends to multiple models simultaneously, independent responses displayed side-by-side

**Independent Test**: Configure multiple models, send message, verify independent responses from each

### Implementation for US6

- [X] T040 [US6] Implement multi-model dispatch: create independent assistant message per model, execute streams in parallel via Promise.allSettled in useMessages.ts
- [X] T041 [US6] Implement per-model error isolation: one model failure doesn't affect others, individual error indicators
- [X] T042 [US6] Implement multiModelMessageStyle support (horizontal, vertical, fold, grid) and @mentions model targeting in useMessages.ts

**Checkpoint**: US6 functional — multi-model dispatch with independent error handling

---

## Phase 9: User Story 7 — Knowledge Base Integration (Priority: P2)

**Goal**: Attached KBs provide RAG context for AI responses with Citation blocks

### Implementation for US7

- [X] T043 [US7] Implement KB search injection in sendMessage pipeline: if assistant.knowledgeBaseIds, call window.api.knowledge.search(), format results as context, add to AI request in useMessages.ts
- [X] T044 [US7] Implement Citation block generation from KB results: knowledgeReferences array populated from search results in MessagesService.ts

**Checkpoint**: US7 functional — RAG injection from attached KBs

---

## Phase 10: User Story 8 — MCP Tool Integration (Priority: P2)

**Goal**: Tool blocks render MCP call results, mcpMode controls behavior

### Implementation for US8

- [X] T045 [US8] Implement MCP interface stubs in assistant config: mcpServers, mcpMode (disabled/auto/manual) persisted in useAssistantStore
- [X] T046 [US8] Implement Tool block rendering support: display toolName, arguments, rawMcpToolResponse in BlockRenderUtils.ts
- [X] T047 [US8] Implement mcpMode 'manual' prompt logic (stub — actual MCP communication deferred to F006) in useMessages.ts

**Checkpoint**: US8 functional — MCP config stored, Tool blocks render (actual MCP deferred to F006)

---

## Phase 11: User Story 9 — Rate Limiting (Priority: P3)

**Goal**: Rate limits enforced per provider with countdown visible to user

### Implementation for US9

- [X] T048 [US9] Implement rate limit check in sendMessage pipeline: read provider.rateLimit, calculate elapsed time, block if limited, return waitMs for countdown in MessagesService.ts
- [X] T049 [US9] Implement send blocking while streaming in progress (prevent concurrent sends to same topic) in useMessages.ts

**Checkpoint**: US9 functional — rate limiting enforced

---

## Phase 12: User Story 10 — Quick Phrases (Priority: P3)

**Goal**: User manages and inserts pre-configured text snippets

### Implementation for US10

- [X] T050 [US10] Implement QuickPhrase CRUD in useAssistantStore (add, update, remove, toggle enabled, sortOrder) in useAssistantStore.ts
- [X] T051 [US10] Implement phrase insertion utility (content → message input) in src/renderer/src/services/QuickPhraseService.ts

**Checkpoint**: US10 functional — quick phrase management

---

## Phase 13: User Story 11 — Web Search Integration (Priority: P3)

**Goal**: Web search results integrated into AI context as Citation blocks

### Implementation for US11

- [X] T052 [US11] Implement web search flag (assistant.enableWebSearch, webSearchProviderId) in assistant config in useAssistantStore
- [X] T053 [US11] Implement Citation block formatting from web search results: normalize multi-provider results, dedup by URL, renumber sequentially in BlockRenderUtils.ts

**Checkpoint**: US11 functional — web search Citation blocks

---

## Phase 14: Tests (Comprehensive)

**Purpose**: Fill remaining test coverage gaps

- [X] T054 [P] Write comprehensive tests for useMessages hook (sendMessage full pipeline, cancel, edit, retry, multi-model) in tests/unit/renderer/hooks/useMessages.test.ts
- [X] T055 [P] Write tests for TopicManager and TopicNamingService in tests/unit/renderer/services/TopicNamingService.test.ts
- [X] T056 [P] Write tests for BlockRenderUtils (all 12 block types, citation dedup) in tests/unit/renderer/services/BlockRenderUtils.test.ts
- [X] T057 Run full test suite — verify all F005 tests pass with 0 regressions

**Checkpoint**: All tests green, full coverage

---

## Phase 15: Demo & Polish

**Purpose**: Demo documentation and final polish

- [X] T058 Create demos/F005-ai-chat.md with Demo Components table and step-by-step verification
- [X] T059 Edge case hardening: empty topic state, very long code blocks, concurrent rename lock, message-block status sync
- [X] T060 Run full project test suite — verify 0 regressions across F001-F005

**Checkpoint**: Demo-ready, all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Stores)**: Depends on Phase 1 types — BLOCKS all user stories
- **Phase 3-6 (US1-US4, P1)**: All depend on Phase 2 completion; US1 first (MVP), then US2-US4
- **Phase 7-10 (US5-US8, P2)**: Depend on US1 (Phase 3) for message pipeline
- **Phase 11-13 (US9-US11, P3)**: Depend on US1 (Phase 3) for message pipeline
- **Phase 14 (Tests)**: Depends on all implementation phases
- **Phase 15 (Demo)**: Depends on all implementation + tests

### User Story Dependencies

- **US1**: After Phase 2 — standalone MVP
- **US2**: After Phase 2 — can parallel with US1 but logically first (assistants before messages)
- **US3**: After Phase 2 — can parallel with US1/US2
- **US4**: After US1 (needs message blocks to render)
- **US5-US8**: After US1 (extend the message pipeline)
- **US9-US11**: After US1 (add features to the pipeline)

### Parallel Opportunities

- T005/T006/T007 (store tests) — all parallel
- T008/T009/T010 (store implementations) — all parallel
- T012/T013 (US1 tests) — parallel
- T021/T026/T031 (US2/US3/US4 tests) — parallel (different hooks)
- T054/T055/T056 (comprehensive tests) — parallel

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 60 |
| User Stories | 11 |
| P1 Tasks | ~24 (US1-US4) |
| P2 Tasks | ~16 (US5-US8) |
| P3 Tasks | ~10 (US9-US11) |
| Test Tasks | ~12 |
| Parallel Opportunities | 15+ |
