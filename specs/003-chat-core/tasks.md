# Tasks: Chat Core

**Input**: Design documents from `/specs/003-chat-core/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/store-api.md, research.md, quickstart.md

**Tests**: Included — spec requires Test-First (Constitution VI) and verification of all 20 P1/P2 behaviors.

**Organization**: Tasks grouped by user story. Phase 1-2 are shared setup/foundation. Phase 3-10 map to User Stories 1-8. Phase 11 is polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Type Definitions & Configuration)

**Purpose**: Define all TypeScript types, enums, constants, and the Dexie database schema — shared infrastructure for all stores and services.

- [ ] T001 [P] Define Assistant, AssistantSettings, AssistantPreset, AssistantMessage interfaces in `src/renderer/src/types/assistant.ts`
- [ ] T002 [P] Define Message, MessageRole, MessageStatus, TokenUsage, MessageMetrics, MultiModelStyle interfaces in `src/renderer/src/types/message.ts`
- [ ] T003 [P] Define MessageBlock discriminated union (11 variants), MessageBlockType enum, MessageBlockStatus enum, VALID_TRANSITIONS map, SerializedError in `src/renderer/src/types/message-block.ts`
- [ ] T004 [P] Define Topic, TopicType, ChunkType enum, Chunk interface, StreamTextParams in `src/renderer/src/types/conversation.ts`
- [ ] T005 [P] Define config constants (DEFAULT_TEMPERATURE, DEFAULT_CONTEXTCOUNT, MAX_CONTEXT_COUNT, UNLIMITED_CONTEXT_COUNT, STREAM_STEP_COUNT, STREAM_MAX_RETRIES, DEFAULT_ASSISTANT_SETTINGS) in `src/renderer/src/config/defaults.ts`

---

## Phase 2: Foundational (Database & Store Infrastructure)

**Purpose**: Dexie database with tables/indexes and the Zustand store persistence adapter. MUST complete before any user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Implement ChatDatabase class extending Dexie with 4 tables (assistants, topics, messages, messageBlocks) and compound indexes (`[topicId+createdAt]`, `[messageId+createdAt]`, `[assistantId+updatedAt]`) in `src/renderer/src/databases/ChatDatabase.ts`
- [ ] T007 Create Dexie storage adapter for Zustand persist middleware (custom storage that reads/writes to ChatDatabase.assistants table) in `src/renderer/src/databases/ChatDatabase.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Assistant Management (Priority: P1)

**Goal**: Full CRUD for assistants with settings management, default assistant on first launch, reordering, and Dexie persistence.

**Independent Test**: Launch app fresh → default assistant exists. Create assistant → appears in list. Edit settings → persists across restart. Delete → removed with topics.

### Tests for User Story 1

- [ ] T008 [P] [US1] Write unit tests for useAssistantsStore: CRUD, reorder, getAssistant, hydrate, Dexie persistence in `tests/unit/stores/useAssistantsStore.test.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Implement useAssistantsStore with state (assistants[], tags, presets[], unifiedOrder[]) and CRUD actions (addAssistant, insertAssistant, updateAssistant, updateAssistantSettings, removeAssistant, reorderAssistants, getAssistant) with Zustand persist middleware backed by Dexie adapter in `src/renderer/src/stores/useAssistantsStore.ts`
- [ ] T010 [US1] Implement AssistantService with createDefaultAssistant (first-launch default with system prompt and F002 default model), normalizeTopics (legacy non-array → array), and model fallback logic in `src/renderer/src/services/AssistantService.ts`
- [ ] T011 [US1] Implement hydrate() action in useAssistantsStore that loads all assistants from Dexie on startup, creates default assistant if none exist, normalizes legacy topics data in `src/renderer/src/stores/useAssistantsStore.ts`

**Checkpoint**: Assistant CRUD works end-to-end with Dexie persistence. FR-001, FR-002, FR-003, FR-019 verified.

---

## Phase 4: User Story 2 — Topic & Conversation Management (Priority: P1)

**Goal**: Topic CRUD within assistants — create, rename, pin, delete with cascade to messages/blocks.

**Independent Test**: Create topic → auto-name from first message. Rename → name persists, auto-rename disabled. Pin → top of list. Delete → messages removed.

### Implementation for User Story 2

- [ ] T012 [US2] Implement topic management actions in useAssistantsStore: addTopic (auto-generate name), updateTopic, removeTopic (cascade delete messages/blocks via useMessageStore), pinTopic in `src/renderer/src/stores/useAssistantsStore.ts`
- [ ] T013 [US2] Implement topic-specific prompt override logic — when topic.prompt is set, use it instead of assistant.prompt during message send in `src/renderer/src/services/AssistantService.ts`

**Checkpoint**: Topic lifecycle works. FR-004 verified. Topics persist to Dexie via assistant store.

---

## Phase 5: User Story 3 — Message Sending & Streaming (Priority: P1)

**Goal**: Complete send pipeline — user message creation, 9-stage filtering, SDK conversion, parameter assembly, streaming with BlockManager, rate limiting.

**Independent Test**: Send a message to a configured provider → observe streaming response token-by-token → blocks created with correct types and status transitions → usage/metrics recorded.

### Tests for User Story 3

- [ ] T014 [P] [US3] Write unit tests for ConversationService: each of 9 filter stages independently, full pipeline, context count calculation, empty-result fallback in `tests/unit/services/ConversationService.test.ts`
- [ ] T015 [P] [US3] Write unit tests for MessageConverter: user message conversion (text+image+file parts), assistant message conversion (reasoning+text+file parts), fileid:// protocol, Gemini [Image] placeholder in `tests/unit/services/MessageConverter.test.ts`
- [ ] T016 [P] [US3] Write unit tests for MessagesService: createUserMessage atomicity, checkRateLimit, sendMessage flow, retryMessage in `tests/unit/services/MessagesService.test.ts`
- [ ] T017 [P] [US3] Write unit tests for StreamProcessingService: chunk dispatching for all ChunkType values, BlockManager lifecycle (create on START, update on DELTA, finalize on COMPLETE), abort handling in `tests/unit/services/StreamProcessingService.test.ts`

### Implementation for User Story 3

- [ ] T018 [US3] Implement useMessageStore with state (messagesByTopic Map, messages Map, displayCount Map) and actions (addMessage, updateMessage, removeMessage, removeMessagesByAskId, removeMessagesByTopicId, upsertBlockReference, getMessageIdsForTopic, getMessagesForTopic, loadMessagesForTopic, loadMoreMessages, getDisplayCount, setDisplayCount, clearTopicMessages) with Dexie read/write in `src/renderer/src/stores/useMessageStore.ts`
- [ ] T019 [US3] Implement useMessageBlockStore with state (blocks Map) and actions (addBlock, updateBlock, removeBlock, removeBlocksByMessageId, transitionStatus with VALID_TRANSITIONS enforcement, getBlock, getBlocksForMessage, loadBlocksForMessages) with Dexie read/write in `src/renderer/src/stores/useMessageBlockStore.ts`
- [ ] T020 [US3] Implement ConversationService with filterMessagesPipeline (9 stages: filterAfterContextClearMessages, filterUsefulMessages, filterErrorOnlyMessagesWithRelated, filterLastAssistantMessage, filterAdjacentUserMessages, takeRight(contextCount+2), re-apply context clear, filterEmptyMessages, filterUserRoleStartMessages) and getContextCount in `src/renderer/src/services/ConversationService.ts`
- [ ] T021 [US3] Implement MessageConverter with convertMessagesToSdkMessages: user messages → TextPart + ImagePart + FilePart, assistant messages → ReasoningPart + TextPart + FilePart, handle fileid:// protocol, Gemini [Image] placeholder, image enhancement model merge in `src/renderer/src/services/MessageConverter.ts`
- [ ] T022 [US3] Implement ParameterBuilder with buildStreamTextParams: model resolution via getAiSdkProviderId(), capability detection (reasoning, web search, URL context, image generation), MCP tool setup via setupToolsConfig(), provider-specific web search tool injection, system prompt construction with replacePromptVariables(), Anthropic beta header assembly, stepCount(20), maxRetries(0) in `src/renderer/src/services/ParameterBuilder.ts`
- [ ] T023 [US3] Implement StreamProcessingService with processStream and BlockManager: chunk dispatcher for all ChunkType values (TEXT_START/DELTA/COMPLETE, THINKING_START/DELTA/COMPLETE, TOOL_CALL_*, EXTERNAL_TOOL_*, LLM_WEB_SEARCH_*, IMAGE_*, VIDEO_SEARCHED, ERROR, BLOCK_COMPLETE, RAW_DATA), block creation/update/finalization, abort signal integration in `src/renderer/src/services/StreamProcessingService.ts`
- [ ] T024 [US3] Implement MessagesService with createUserMessage (atomic Message + MainTextBlock + optional Image/FileBlocks), checkRateLimit (timeDiff vs provider.rateLimit*1000, toast with remaining wait), sendMessage (construct → filter → convert → assemble → stream → process), retryMessage (remove by askId → re-send) in `src/renderer/src/services/MessagesService.ts`

**Checkpoint**: Full chat loop works — send message → filter → convert → assemble → stream → blocks update → persist. FR-005, FR-006, FR-007, FR-010, FR-012, FR-018, FR-020, FR-021, FR-022, FR-023, FR-024 verified.

---

## Phase 6: User Story 4 — Message Block Types & State Machine (Priority: P1)

**Goal**: All 11 block type variants with type-specific fields are handled by the stream processor. Block status state machine enforces valid transitions.

**Independent Test**: Send message triggering multiple block types → each block has correct type, variant fields, and status transitions. Invalid transition → rejected with error log.

### Tests for User Story 4

- [ ] T025 [P] [US4] Write unit tests for useMessageBlockStore: transitionStatus with all valid/invalid transitions, all 11 block type variants in `tests/unit/stores/useMessageBlockStore.test.ts`

### Implementation for User Story 4

- [ ] T026 [US4] Verify and extend block type handling in StreamProcessingService for all 11 block types: MainText (TEXT_*), Thinking (THINKING_*), Tool (TOOL_CALL_*), Image (IMAGE_*), Citation (LLM_WEB_SEARCH_*), Video (VIDEO_SEARCHED), Code, Translation, File, Compact, Error in `src/renderer/src/services/StreamProcessingService.ts`
- [ ] T027 [US4] Verify transitionStatus in useMessageBlockStore rejects invalid transitions (e.g., SUCCESS→STREAMING) with console.error log and returns false in `src/renderer/src/stores/useMessageBlockStore.ts`

**Checkpoint**: All block types and status transitions verified. FR-008, FR-009 verified.

---

## Phase 7: User Story 5 — Message Retry & Removal (Priority: P1)

**Goal**: Retry flow removes old response by askId, re-sends. Delete messages with cascade to blocks.

**Independent Test**: Send → receive → retry → old response removed, new generation starts. Delete message → message + blocks removed.

### Implementation for User Story 5

- [ ] T028 [US5] Verify removeMessage in useMessageStore cascades to useMessageBlockStore.removeBlocksByMessageId and persists to Dexie in `src/renderer/src/stores/useMessageStore.ts`
- [ ] T029 [US5] Verify removeMessagesByAskId removes both user question and assistant reply sharing the same askId in `src/renderer/src/stores/useMessageStore.ts`
- [ ] T030 [US5] Verify retryMessage in MessagesService calls removeMessagesByAskId then re-invokes sendMessage in `src/renderer/src/services/MessagesService.ts`

**Checkpoint**: Retry and deletion flows work. FR-011, FR-025 verified.

---

## Phase 8: User Story 6 — Data Persistence & Database (Priority: P1)

**Goal**: All data persists to Dexie, messages load lazily with pagination, migrations run on startup.

**Independent Test**: Create conversations → restart app → data intact. Load topic with 500+ messages → within 200ms. Schema upgrade → no data loss.

### Tests for User Story 6

- [ ] T031 [P] [US6] Write unit tests for ChatDatabase: table creation, index queries, migration execution in `tests/unit/databases/ChatDatabase.test.ts`

### Implementation for User Story 6

- [ ] T032 [US6] Implement database migration framework in `src/renderer/src/databases/migrations/` with version-based schema evolution, rollback support, and idempotent execution
- [ ] T033 [US6] Implement orphan cleanup (blocks referencing non-existent messages) and deduplication (duplicate message IDs in topic) logic in ChatDatabase or a DatabaseMaintenance service in `src/renderer/src/databases/ChatDatabase.ts`

**Checkpoint**: Persistence, lazy loading, pagination, migrations all work. FR-013, FR-014 verified.

---

## Phase 9: User Story 7 — StreamText Parameter Assembly (Priority: P1)

**Goal**: ParameterBuilder correctly assembles all parameters for streamText() including model resolution, capability detection, MCP tools, web search, system prompt, Anthropic headers.

**Independent Test**: Configure assistant with reasoning model + MCP servers + web search → verify stream parameters include thinking mode, tools, search config, and assembled prompt.

### Implementation for User Story 7

- [ ] T034 [US7] Verify ParameterBuilder integration with F002 provider factory for model resolution (getAiSdkProviderId) and capability detection in `src/renderer/src/services/ParameterBuilder.ts`
- [ ] T035 [US7] Verify system prompt variable replacement (replacePromptVariables) handles all template variables in `src/renderer/src/services/ParameterBuilder.ts`

**Checkpoint**: Parameter assembly produces valid streamText() params for all provider/capability combinations. FR-022 verified.

---

## Phase 10: User Story 8 — Assistant Presets & Tags (Priority: P2)

**Goal**: Preset CRUD and application, tag ordering and collapse, unified assistant+agent ordering.

**Independent Test**: Create preset from assistant → apply to new assistant → settings transferred. Add tags → grouping and collapse works. Unified order persists.

### Implementation for User Story 8

- [ ] T036 [P] [US8] Implement preset actions in useAssistantsStore: addPreset, applyPreset (copy settings to assistant), removePreset with Dexie persistence in `src/renderer/src/stores/useAssistantsStore.ts`
- [ ] T037 [P] [US8] Implement tag actions in useAssistantsStore: setTagOrder, setTagCollapsed with persistence in `src/renderer/src/stores/useAssistantsStore.ts`
- [ ] T038 [US8] Implement unified ordering actions in useAssistantsStore: setUnifiedOrder for interleaved assistant + agent IDs in `src/renderer/src/stores/useAssistantsStore.ts`

**Checkpoint**: Presets, tags, unified ordering all work. FR-015, FR-016, FR-017 verified.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Integration test, i18n, performance validation, and cross-story verification.

- [ ] T039 Write integration test for full chat flow: send → stream → persist → load → retry in `tests/integration/chat-flow.test.ts`
- [ ] T040 [P] Add i18n keys for all user-facing strings: rate limit toast, error messages, default assistant name/prompt in relevant service and store files
- [ ] T041 [P] Run quickstart.md validation — verify all key files exist and architecture flow matches implementation
- [ ] T042 Verify all 20 P1/P2 SBI behaviors (B036-B055) have working implementations — cross-reference with spec FR mapping

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. All T001-T005 are [P] parallel.
- **Foundational (Phase 2)**: Depends on Phase 1 types (T001-T004). T006-T007 sequential.
- **US1 (Phase 3)**: Depends on Phase 2 (ChatDatabase, persistence adapter).
- **US2 (Phase 4)**: Depends on US1 (useAssistantsStore must exist for topic actions).
- **US3 (Phase 5)**: Depends on Phase 2 (Dexie). Tests (T014-T017) can start after types. Implementation depends on Phase 2.
- **US4 (Phase 6)**: Depends on US3 (StreamProcessingService, useMessageBlockStore must exist).
- **US5 (Phase 7)**: Depends on US3 (useMessageStore, MessagesService must exist).
- **US6 (Phase 8)**: Depends on Phase 2 (ChatDatabase). Can run parallel with US3+.
- **US7 (Phase 9)**: Depends on US3 (ParameterBuilder must exist).
- **US8 (Phase 10)**: Depends on US1 (useAssistantsStore must exist). Can run parallel with US3+.
- **Polish (Phase 11)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1** (Assistant CRUD): Foundation only → independent
- **US2** (Topic CRUD): Depends on US1 (topics live inside assistants)
- **US3** (Message Sending): Foundation only → independent of US1/US2 for store implementation, but send flow uses assistant/topic
- **US4** (Block Types): Depends on US3 (extends stream processing)
- **US5** (Retry/Removal): Depends on US3 (uses message store + MessagesService)
- **US6** (Persistence): Foundation only → can parallel with US3+
- **US7** (Parameter Assembly): Depends on US3 (extends ParameterBuilder)
- **US8** (Presets/Tags): Depends on US1 (extends assistant store)

### Parallel Opportunities

```bash
# Phase 1 — all 5 type files in parallel:
T001, T002, T003, T004, T005

# Phase 3+5 tests — can start after types are defined:
T008, T014, T015, T016, T017, T025, T031

# Phase 5 implementation — after Foundation:
T018 and T019 can run in parallel (different stores)
T020, T021, T022 can run in parallel (different services)

# Phase 10 — preset and tag tasks in parallel:
T036, T037
```

---

## Implementation Strategy

### MVP First (US1 + US3)

1. Complete Phase 1: Setup (types + constants)
2. Complete Phase 2: Foundational (Dexie database)
3. Complete Phase 3: US1 — Assistant CRUD
4. Complete Phase 5: US3 — Message Sending & Streaming
5. **STOP and VALIDATE**: Send a message, see streaming response, verify persistence

### Incremental Delivery

1. Setup + Foundation → Types and database ready
2. US1 (Assistants) → Can create/manage assistants
3. US2 (Topics) → Can create/manage topics within assistants
4. US3 (Messaging) → Full chat loop works (MVP!)
5. US4 (Block Types) → All content types rendered correctly
6. US5 (Retry) → Error recovery works
7. US6 (Persistence) → Migrations and maintenance
8. US7 (Parameters) → All provider capabilities supported
9. US8 (Presets/Tags) → Power user features

### Suggested MVP Scope

US1 (Assistant CRUD) + US3 (Message Sending & Streaming) = core chat loop functional

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 42 |
| Phase 1 (Setup) | 5 tasks |
| Phase 2 (Foundation) | 2 tasks |
| US1 (Assistant Mgmt) | 4 tasks |
| US2 (Topic Mgmt) | 2 tasks |
| US3 (Messaging) | 11 tasks |
| US4 (Block Types) | 3 tasks |
| US5 (Retry/Removal) | 3 tasks |
| US6 (Persistence) | 3 tasks |
| US7 (Parameter Assembly) | 2 tasks |
| US8 (Presets/Tags) | 3 tasks |
| Phase 11 (Polish) | 4 tasks |
| Parallel opportunities | 4 groups identified |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 (Messaging) is the largest phase (11 tasks) as it contains the core chat pipeline
- Constitution VI (Test-First): Test tasks precede implementation in each phase
- All 24 FRs from spec.md are mapped to tasks
- All 20 P1/P2 SBI behaviors (B036-B055) are covered
