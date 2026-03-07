# Tasks: Knowledge Base

**Input**: Design documents from `/specs/004-knowledge-base/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test-First per Constitution XIV. Tests written before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create shared types, add IPC channels

- [X] T001 Install new NPM dependencies: vectra, unpdf, cheerio, @mozilla/readability, sitemapper
- [X] T002 Create shared knowledge types (KnowledgeBase, KnowledgeItem, KnowledgeReference, KnowledgeNote, enums) in packages/shared/types/knowledge.ts
- [X] T003 Add 9 KB_* IPC channel enum members to packages/shared/IpcChannel.ts (KB_Create, KB_Delete, KB_Reset, KB_AddItem, KB_RemoveItem, KB_Search, KB_Rerank, KB_ItemStatus, KB_DirectoryProgress)
- [X] T004 Add knowledge_notes table to Dexie schema in src/renderer/src/lib/db.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core chunking and vector storage infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [X] T005 [P] Write tests for KnowledgeChunker (recursive text splitting, configurable size/overlap, edge cases) in tests/unit/main/services/KnowledgeChunker.test.ts
- [X] T006 [P] Write tests for Vectra integration (covered in KnowledgeService.test.ts — Vectra mocked at unit level) in tests/unit/main/services/KnowledgeService.test.ts

### Implementation for Foundational

- [X] T007 Implement KnowledgeChunker with recursive character text splitter (split on paragraphs, then sentences, with configurable chunk size and overlap) in src/main/services/KnowledgeChunker.ts
- [X] T008 Implement Vectra vector storage helpers (createIndex, deleteIndex, addVectors, removeVectors, searchVectors with cosine similarity) in src/main/services/KnowledgeService.ts (Vectra section)

**Checkpoint**: Chunking and vector storage primitives ready — user story implementation can begin

---

## Phase 3: User Story 1 — Create and Configure Knowledge Base (Priority: P1) 🎯 MVP

**Goal**: Users can create, update, delete, and reset knowledge bases with embedding model selection and chunking configuration

**Independent Test**: Create a KB with an embedding model, verify it persists with correct config, delete it and confirm cascade cleanup

### Tests for User Story 1

- [X] T009 [P] [US1] Write tests for useKnowledgeStore (addBase, removeBase, updateBase, state persistence) in tests/unit/renderer/stores/useKnowledgeStore.test.ts
- [X] T010 [P] [US1] Write tests for KnowledgeService.create, .delete, .reset methods in tests/unit/main/services/KnowledgeService.test.ts

### Implementation for User Story 1

- [X] T011 [US1] Implement useKnowledgeStore Zustand store with persist middleware (bases state, addBase, removeBase, updateBase actions) in src/renderer/src/stores/useKnowledgeStore.ts
- [X] T012 [US1] Implement KnowledgeService.create — initialize Vectra index, return KnowledgeBase entity in src/main/services/KnowledgeService.ts
- [X] T013 [US1] Implement KnowledgeService.delete — cascade delete: remove Vectra index, pending file, associated files in src/main/services/KnowledgeService.ts
- [X] T014 [US1] Implement KnowledgeService.reset — remove all items/vectors, preserve config in src/main/services/KnowledgeService.ts
- [X] T015 [US1] Register IPC handlers for KB_Create, KB_Delete, KB_Reset channels in src/main/services/KnowledgeService.ts
- [X] T016 [US1] Implement useKnowledge hook base methods (create, delete, reset KB via IPC) in src/renderer/src/hooks/useKnowledge.ts

**Checkpoint**: Knowledge base CRUD fully functional and testable

---

## Phase 4: User Story 2 — Add Items to Knowledge Base (Priority: P1)

**Goal**: Users can add 6 item types (file, url, sitemap, note, directory, video) with full RAG pipeline processing

**Independent Test**: Add each item type, verify processing through pending → processing → completed, confirm chunks generated

### Tests for User Story 2

- [X] T017 [P] [US2] Write tests for KnowledgeLoaders (FileLoader, UrlLoader, SitemapLoader, NoteLoader, DirectoryLoader, VideoLoader) in tests/unit/main/services/KnowledgeLoaders.test.ts
- [X] T018 [P] [US2] Write tests for KnowledgeService.addItem and processItem routing in tests/unit/main/services/KnowledgeService.test.ts (addItem section)

### Implementation for User Story 2

- [X] T019 [US2] Implement FileLoader — read file content, detect encoding, extract text (with PDF support via unpdf) in src/main/services/KnowledgeLoaders.ts
- [X] T020 [US2] Implement UrlLoader — fetch URL, extract article text via cheerio + @mozilla/readability in src/main/services/KnowledgeLoaders.ts
- [X] T021 [US2] Implement SitemapLoader — parse sitemap via sitemapper, dispatch each URL to UrlLoader in src/main/services/KnowledgeLoaders.ts
- [X] T022 [US2] Implement NoteLoader — read note content from Dexie knowledge_notes table in src/main/services/KnowledgeLoaders.ts
- [X] T023 [US2] Implement DirectoryLoader — recursive file discovery with progress reporting via KB_DirectoryProgress IPC in src/main/services/KnowledgeLoaders.ts
- [X] T024 [US2] Implement VideoLoader — extract SRT transcript text in src/main/services/KnowledgeLoaders.ts
- [X] T025 [US2] Implement KnowledgeService.addItem — route by type to loader, chunk, embed via AI SDK embedMany(), store vectors in Vectra in src/main/services/KnowledgeService.ts
- [X] T026 [US2] Implement embedding generation helper using AI SDK embedMany() with batching in src/main/services/KnowledgeService.ts
- [X] T027 [US2] Register IPC handler for KB_AddItem channel, emit KB_ItemStatus events during processing in src/main/services/KnowledgeService.ts
- [X] T028 [US2] Implement useKnowledgeStore item actions (addItem, updateItem, updateItemStatus) in src/renderer/src/stores/useKnowledgeStore.ts
- [X] T029 [US2] Implement useKnowledge hook add methods (addFiles, addUrl, addSitemap, addNote, addDirectory, addVideo) in src/renderer/src/hooks/useKnowledge.ts
- [X] T030 [US2] Implement processing status listener — subscribe to KB_ItemStatus IPC events and update store in src/renderer/src/hooks/useKnowledge.ts

**Checkpoint**: All 6 item types can be added and processed through the full RAG pipeline

---

## Phase 5: User Story 3 — Semantic Search (Priority: P1)

**Goal**: Semantic vector search retrieves relevant chunks with scores and source attribution

**Independent Test**: Add items, run search query, verify relevant chunks returned with scores

### Tests for User Story 3

- [X] T031 [P] [US3] Write tests for KnowledgeService.search (embed query, Vectra search, result formatting) in tests/unit/main/services/KnowledgeService.test.ts (search section)
- [X] T032 [P] [US3] Write tests for KnowledgeSearchService (search orchestration via IPC) in tests/unit/renderer/services/KnowledgeSearchService.test.ts

### Implementation for User Story 3

- [X] T033 [US3] Implement KnowledgeService.search — embed query via AI SDK embed(), search Vectra index, format as KnowledgeReference[] in src/main/services/KnowledgeService.ts
- [X] T034 [US3] Register IPC handler for KB_Search channel in src/main/services/KnowledgeService.ts
- [X] T035 [US3] Implement KnowledgeSearchService — renderer-side search orchestration calling KB_Search IPC in src/renderer/src/services/KnowledgeSearchService.ts

**Checkpoint**: Semantic search returns relevant results with scores and source attribution — MVP complete

---

## Phase 6: User Story 4 — Queue-Based Processing with Backpressure (Priority: P2)

**Goal**: Processing queue enforces 30 concurrent items and 80MB workload limits

**Independent Test**: Add 40+ items simultaneously, verify only 30 process at once, workload stays under 80MB

### Tests for User Story 4

- [X] T036 [P] [US4] Write tests for KnowledgeQueueManager (backpressure limits, workload estimation, queue state, auto-process on capacity freed) in tests/unit/main/services/KnowledgeQueueManager.test.ts

### Implementation for User Story 4

- [X] T037 [US4] Implement KnowledgeQueueManager — backpressure enforcement (30 concurrent, 80MB cap), queue state tracking in src/main/services/KnowledgeQueueManager.ts
- [X] T038 [US4] Implement workload estimation per item type (file=size, URL=2MB, sitemap=20MB, note=bytes, directory=aggregate, video=size) in src/main/services/KnowledgeQueueManager.ts
- [X] T039 [US4] Implement queueHandle — auto-process next pending item when capacity freed in src/main/services/KnowledgeQueueManager.ts
- [X] T040 [US4] Integrate KnowledgeQueueManager into KnowledgeService.addItem flow (check backpressure before processing) in src/main/services/KnowledgeService.ts

**Checkpoint**: Queue backpressure correctly limits concurrent processing

---

## Phase 7: User Story 5 — Document Preprocessing (Priority: P2)

**Goal**: PDF files can be preprocessed via configurable AI provider before chunking, with result caching

**Independent Test**: Upload PDF with preprocessing provider configured, verify preprocessing runs and caches results

### Tests for User Story 5

- [X] T041 [P] [US5] Write tests for PDF preprocessing (covered in KnowledgeLoaders.test.ts) in tests/unit/main/services/KnowledgeLoaders.test.ts (preprocessing section)

### Implementation for User Story 5

- [X] T042 [US5] Implement PDF preprocessing in FileLoader — call preprocessing provider for PDF files, cache results in src/main/services/KnowledgeLoaders.ts
- [X] T043 [US5] Implement preprocessing result cache (file-based, keyed by file hash) in src/main/services/KnowledgeLoaders.ts

**Checkpoint**: PDF preprocessing works with caching and graceful fallback

---

## Phase 8: User Story 6 — Item Management (Priority: P2)

**Goal**: Users can remove items (with file cleanup), refresh items, and clear completed processing statuses

**Independent Test**: Add item, remove it (verify cleanup), refresh a completed item (verify re-queue)

### Tests for User Story 6

- [X] T044 [P] [US6] Write tests for KnowledgeService.removeItem (indexed data removal, file cleanup) and item refresh in tests/unit/main/services/KnowledgeService.test.ts (item management section)

### Implementation for User Story 6

- [X] T045 [US6] Implement KnowledgeService.removeItem — remove indexed data from Vectra, delete associated files (file → stored file, video → video + SRT) in src/main/services/KnowledgeService.ts
- [X] T046 [US6] Register IPC handler for KB_RemoveItem channel in src/main/services/KnowledgeService.ts
- [X] T047 [US6] Implement useKnowledge hook item management (removeItem, refreshItem, clearCompleted) in src/renderer/src/hooks/useKnowledge.ts
- [X] T048 [US6] Implement useKnowledgeStore removeItem and clearCompletedProcessing actions in src/renderer/src/stores/useKnowledgeStore.ts
- [X] T049 [US6] Implement deduplication enforcement — reject duplicate URL/sitemap/directory items, always accept file/note items in src/main/services/KnowledgeService.ts

**Checkpoint**: Item removal, refresh, and deduplication fully functional

---

## Phase 9: User Story 7 — Reranking (Priority: P2)

**Goal**: Search results can be reranked via a dedicated reranker model for improved relevance

**Independent Test**: Configure reranker on KB, run search, verify results are re-scored and reordered

### Tests for User Story 7

- [X] T050 [P] [US7] Write tests for KnowledgeService.rerank (reranking with model, no-reranker passthrough) in tests/unit/main/services/KnowledgeService.test.ts (rerank section)

### Implementation for User Story 7

- [X] T051 [US7] Implement KnowledgeService.rerank — re-score results via AI SDK generateText() or provider-specific reranking API in src/main/services/KnowledgeService.ts
- [X] T052 [US7] Register IPC handler for KB_Rerank channel in src/main/services/KnowledgeService.ts

**Checkpoint**: Reranking improves search result relevance when configured

---

## Phase 10: User Story 8 — Deferred Deletion (Priority: P3)

**Goal**: Failed deletions are persisted and retried on next startup

**Independent Test**: Simulate deletion failure, verify pending file created, call retryPendingDeletions, verify cleanup

### Tests for User Story 8

- [X] T053 [P] [US8] Write tests for KnowledgeDeferredDelete (persist pending, read pending, retry, cleanup) in tests/unit/main/services/KnowledgeDeferredDelete.test.ts

### Implementation for User Story 8

- [X] T054 [US8] Implement KnowledgeDeferredDelete — persistent pending file (JSON), add/remove/read pending deletions in src/main/services/KnowledgeDeferredDelete.ts
- [X] T055 [US8] Implement KnowledgeService.retryPendingDeletions — read pending file, retry each deletion, remove successful entries in src/main/services/KnowledgeService.ts
- [X] T056 [US8] Integrate deferred delete into KnowledgeService.delete and .removeItem failure paths in src/main/services/KnowledgeService.ts

**Checkpoint**: Failed deletions survive restarts and are retried

---

## Phase 11: User Story 9 — Knowledge Base Migration (Priority: P3)

**Goal**: Clone a knowledge base with a timestamp suffix, re-add all items for reprocessing

**Independent Test**: Migrate a KB, verify timestamped clone created, original unchanged, items re-queued

### Tests for User Story 9

- [X] T057 [P] [US9] Write tests for knowledge base migration (covered in useKnowledge hook — renderer layer) in tests/unit/renderer/stores/useKnowledgeStore.test.ts

### Implementation for User Story 9

- [X] T058 [US9] Implement useKnowledge.migrateBase — clone KB config with timestamp suffix, re-add all items to new base via IPC in src/renderer/src/hooks/useKnowledge.ts

**Checkpoint**: Migration creates a complete copy with reprocessing

---

## Phase 12: User Story 10 — Chunking Configuration (Priority: P3)

**Goal**: Configurable chunk size and overlap per KB, with validation

**Independent Test**: Create KBs with different chunk sizes, add same document, verify different chunk counts

### Tests for User Story 10

- [X] T059 [P] [US10] Write tests for chunking configuration validation (covered in KnowledgeService.test.ts create tests) in tests/unit/main/services/KnowledgeService.test.ts

### Implementation for User Story 10

- [X] T060 [US10] Add chunking parameter validation in KnowledgeService.create (reject overlap >= size) in src/main/services/KnowledgeService.ts

**Checkpoint**: Chunking parameters validated and applied correctly per KB

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: useKnowledge selectors, note content management, demo page, final validation

- [X] T061 [P] Implement useKnowledge hook selectors (fileItems, urlItems, sitemapItems, directoryItems, videoItems, noteItems) in src/renderer/src/hooks/useKnowledge.ts
- [X] T062 [P] Implement useKnowledge note content methods (getNoteContent, updateNoteContent via Dexie knowledge_notes) in src/renderer/src/hooks/useKnowledge.ts
- [X] T063 [P] Create demo page with step-by-step KB workflow instructions in demos/F004-knowledge-base.md
- [X] T064 Run full test suite and verify all tests pass (361/361 pass, 38 test files)
- [X] T065 Run TypeScript type check and verify no errors (only pre-existing TS6305 warnings)
- [X] T066 Verify all exports are properly accessible from packages/shared and src/main/services

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — KB CRUD
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 — needs KB to exist to add items
- **US3 (Phase 5)**: Depends on Phase 4 — needs items in KB to search
- **US4 (Phase 6)**: Depends on Phase 4 — wraps addItem with backpressure
- **US5 (Phase 7)**: Depends on Phase 4 — extends FileLoader for PDF preprocessing
- **US6 (Phase 8)**: Depends on Phase 4 — item management requires items to exist
- **US7 (Phase 9)**: Depends on Phase 5 — reranking extends search
- **US8 (Phase 10)**: Depends on Phase 3 — deferred deletion wraps delete operations
- **US9 (Phase 11)**: Depends on Phase 3 + Phase 4 — migration clones KB and re-adds items
- **US10 (Phase 12)**: Depends on Phase 2 + Phase 3 — validation at KB creation time
- **Polish (Phase 13)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Foundational only — no other story dependencies
- **US2 (P1)**: US1 (needs KB to add items to)
- **US3 (P1)**: US2 (needs items to search)
- **US4 (P2)**: US2 (extends addItem flow)
- **US5 (P2)**: US2 (extends FileLoader)
- **US6 (P2)**: US2 (needs items to manage)
- **US7 (P2)**: US3 (extends search)
- **US8 (P3)**: US1 (wraps delete operations)
- **US9 (P3)**: US1 + US2 (clones KB and re-adds items)
- **US10 (P3)**: US1 (validation at create time)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/interfaces before implementations
- Main process before renderer
- Service methods before IPC handlers
- Store actions before hook methods

### Parallel Opportunities

- T005, T006 (foundational tests) can run in parallel
- T009, T010 (US1 tests) can run in parallel
- T017, T018 (US2 tests) can run in parallel
- T019-T024 (loaders) can run in parallel after T017-T018
- T031, T032 (US3 tests) can run in parallel
- T061, T062, T063 (polish) can run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Phase 1: Setup (deps, types, IPC channels)
2. Phase 2: Foundational (chunker, Vectra)
3. Phase 3: US1 — KB CRUD
4. Phase 4: US2 — Add items (full RAG pipeline)
5. Phase 5: US3 — Semantic search
6. **STOP and VALIDATE**: Search returns relevant results from ingested content

### Incremental Delivery

1. MVP (US1-US3) → Core RAG pipeline works end-to-end
2. +US4 (Queue) → System stability under load
3. +US5 (Preprocessing) → Better PDF support
4. +US6 (Item Management) → Remove/refresh/dedup
5. +US7 (Reranking) → Improved search quality
6. +US8/US9/US10 (P3) → Resilience, migration, fine-tuning

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently testable after completion
- Constitution XIV: Test-First is NON-NEGOTIABLE
- Constitution VIII: Queue-Based Workload (30 concurrent / 80MB)
- 5 new NPM deps: vectra, unpdf, cheerio, @mozilla/readability, sitemapper
- Total: 66 tasks across 13 phases, 10 user stories
