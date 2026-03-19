# Tasks: Knowledge & Memory System

**Input**: Design documents from `/specs/006-knowledge-memory/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create shared types, base infrastructure

- [ ] T001 Install new dependencies: `pnpm add pdf-parse mammoth` + `pnpm add -D @types/pdf-parse` in `package.json`
- [ ] T002 [P] Create shared KB/Memory types in `src/shared/types/knowledge.ts` — KnowledgeBase, KnowledgeItem, VectorRecord, MemoryItem, MemoryConfig, MemoryHistoryItem, KnowledgeReference, SaveToKnowledgeRequest, ItemType, ItemStatus, PreprocessProvider enums
- [ ] T003 [P] Create renderer KB/Memory types in `src/renderer/src/types/knowledge.ts` — re-export from shared + add UI-specific types (store state, popup props)
- [ ] T004 Verify pdf-parse import compatibility: `node -e "require('pdf-parse')"` in Electron main process context. If v2 fails, pin to v1.x

## Phase 2: Foundational (Core Services — MUST complete before UI)

**Purpose**: Vector store, text processing, and core services in main process

- [ ] T005 [P] Create `src/main/services/VectorStore.ts` — SQLite table creation (vectors: id, kb_id, item_id, content, metadata, embedding BLOB), insert, cosine similarity search (JS-computed), delete by kb_id, delete by item_id, count by kb_id
- [ ] T006 [P] Create `src/main/services/TextChunker.ts` — Fixed-size text chunking with configurable size (default 1000) and overlap (default 200). Input: string → Output: string[]
- [ ] T007 [P] Create `src/main/loaders/FileLoader.ts` — Text extraction from .txt and .md files via fs.readFile
- [ ] T008 [P] Create `src/main/loaders/PdfLoader.ts` — PDF text extraction using pdf-parse
- [ ] T009 [P] Create `src/main/loaders/DocxLoader.ts` — DOCX text extraction using mammoth
- [ ] T010 [P] Create `src/main/loaders/UrlLoader.ts` — Web page text extraction (fetch + HTML→text)
- [ ] T011 [P] Create `src/main/loaders/SitemapLoader.ts` — Parse sitemap XML → extract URLs → load each via UrlLoader
- [ ] T012 [P] Create `src/main/loaders/VideoLoader.ts` — Video transcript/description extraction
- [ ] T013 [P] Create `src/main/preprocessors/PreprocessorFactory.ts` — Factory pattern, returns preprocessor by provider type
- [ ] T014 [P] Create `src/main/preprocessors/DefaultPreprocessor.ts` — No-op/basic text cleanup preprocessor
- [ ] T015 Create `src/main/services/WorkloadManager.ts` — Concurrent processing cap: 80MB workload limit, 30 processing items max, queue excess items
- [ ] T016 Create `src/main/services/PendingDeleteManager.ts` — Persist failed deletions to JSON file, retry on startup, cleanup completed items

## Phase 3: User Story 1 — KB Creation & Document Ingestion (P1)

**Story Goal**: User creates KB, adds documents, documents are embedded
**Independent Test**: Create KB → add text file → verify processing completes

- [ ] T017 [US1] Create `src/main/services/KnowledgeService.ts` — Singleton service with create(name, model, dimensions, documentCount), delete(id), reset(id), update(kb), list() methods. Wire to VectorStore for storage operations.
- [ ] T018 [US1] Add item management to KnowledgeService — addItem(baseId, type, content), removeItem(baseId, itemId), addFiles(baseId, files[]) with type-specific dedup (directory/url/sitemap skip duplicates)
- [ ] T019 [US1] Implement embedding pipeline in KnowledgeService — orchestrate: detect type → load text → preprocess → chunk → embed (via ai:embed IPC) → store vectors. Track status: pending → processing → completed/failed. Emit kb:itemProgress events.
- [ ] T020 [US1] Integrate WorkloadManager into KnowledgeService — cap concurrent embedding at 80MB + 30 items, queue excess
- [ ] T021 [US1] Integrate PendingDeleteManager into KnowledgeService — persist failed KB deletions, retry on startup via closeAll()
- [ ] T022 [US1] Create `src/main/reranker/Reranker.ts` + `src/main/reranker/strategies/GeneralStrategy.ts` — Strategy pattern for search result reranking
- [ ] T023 [US1] Implement search in KnowledgeService — kb:search across multiple KBs with threshold filter + documentCount limit + optional reranking
- [ ] T024 [US1] Create `src/main/ipc/knowledge-handlers.ts` — Register all kb:* IPC handlers: create, delete, reset, update, list, addItem, removeItem, addFiles, retryItem, search, rerank, saveContent, closeAll
- [ ] T025 [US1] Add `ai:embed` IPC handler — extends F004 to generate embeddings via provider API. Params: { text: string|string[], model: Model }. Returns: { embeddings: number[][] }
- [ ] T026 [US1] Update `src/preload/knowledge-api.ts` — Expose kb:* and ai:embed channels via contextBridge
- [ ] T027 [US1] Create `src/renderer/src/stores/useKnowledgeStore.ts` — Zustand store: bases[] with addBase, deleteBase, updateBase, reorderBases, addItem, removeItem, updateItemStatus actions. Persist to localStorage. Hydrate from main on mount via kb:list.
- [ ] T028 [US1] Create `src/renderer/src/pages/knowledge/KnowledgePage.tsx` — Main page with: Navbar (title), sidebar (draggable KB list with context menu: rename/settings/delete), Plus button, empty state. Active base highlighting. Route: /knowledge
- [ ] T029 [US1] Create `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` — Content viewer showing items for selected KB, tab-based item type views
- [ ] T030 [US1] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeFiles.tsx` — File item list with upload button (file picker dialog), status icons, delete button
- [ ] T031 [US1] [P] Create `src/renderer/src/pages/knowledge/components/AddKBPopup.tsx` — Modal: name (Input), embedding model (ModelSelector filter embedding), dimensions (auto-fill), documentCount (Slider 1-50 default 6). On submit → kb:create IPC
- [ ] T032 [US1] Create `src/renderer/src/pages/knowledge/components/StatusIcon.tsx` — 4-state icon: pending (clock), processing (spinner), completed (check), failed (X with error tooltip)

## Phase 4: User Story 2 — RAG Search & Citations in Chat (P1)

**Story Goal**: Attach KB to chat, search returns citations
**Independent Test**: Attach KB → send message → verify citation badges appear

- [ ] T033 [US2] Create `src/renderer/src/components/chat/KBButton.tsx` — FileSearch icon in inputbar. Opens QuickPanel with checkboxes for available KBs. "+Add..." option → /knowledge. Highlights when KBs selected. Disabled when files attached.
- [ ] T034 [US2] Create `src/renderer/src/components/chat/KBInputDisplay.tsx` — Green closable tags below message input showing selected KB names
- [ ] T035 [US2] Create `src/renderer/src/components/chat/CitationBlock.tsx` — 8-stage citation pipeline: extract cited [N] from AI text → filter search results → renumber by first-appearance → render inline sup badges with shadcn Tooltip (source file + snippet) → click opens file via shell:openPath. Renumbering via useMemo (stored text untouched).
- [ ] T036 [US2] Create `src/renderer/src/components/chat/KBSearchTool.tsx` — FileSearch icon + "Searching Knowledge Base" status + result count when complete
- [ ] T037 [US2] Wire KB search into F005 chat flow — cross-feature: modify F005/Inputbar handleSend to call kb:search when assistant has attached KBs. Format results with REFERENCE_PROMPT. Register as AI tool.
- [ ] T038 [US2] Wire CitationBlock into F005 MessageBlock — cross-feature: when MessageBlock type='citation' has knowledge field, render CitationBlock component

## Phase 5: User Story 3 — Memory System (P1)

**Story Goal**: Memory extracts facts, recalls in future conversations
**Independent Test**: Conversation → fact extracted → new conversation recalls it

- [ ] T039 [US3] Create `src/main/services/MemoryService.ts` — Singleton: CRUD (add, search, list with pagination, update, delete), per-user isolation (userId index), hash dedup, embedding storage in VectorStore, history tracking (MemoryHistoryItem for ADD/UPDATE/DELETE)
- [ ] T040 [US3] Implement fact extraction in MemoryService — extractFacts(userId, messages, config): use LLM via F004 to extract facts from conversation messages, store as MemoryItems with embeddings
- [ ] T041 [US3] Implement memory search in MemoryService — searchRelevant(userId, query, limit): vector similarity search, return ranked MemoryItems for AI context
- [ ] T042 [US3] Implement MemoryConfig management — getConfig, updateConfig: embedding model, LLM model, dimensions, custom prompts, global enabled toggle
- [ ] T043 [US3] Create `src/main/ipc/memory-handlers.ts` — Register all memory:* IPC handlers per memory-ipc.md contract
- [ ] T044 [US3] Update preload — Expose memory:* channels via contextBridge
- [ ] T045 [US3] Create `src/renderer/src/stores/useMemoryStore.ts` — Zustand: selectedUserId, memories[], loading, search query, config. Actions: loadMemories, addMemory, updateMemory, deleteMemory, setUser.
- [ ] T046 [US3] Wire memory search as AI tool — cross-feature: register memory:searchRelevant as AI tool in F005 chat service. AI decides when to invoke based on conversation context.
- [ ] T047 [US3] Wire fact extraction after conversation — cross-feature: after F005 conversation turn completes, call memory:extractFacts if assistant.enableMemory is true
- [ ] T048 [US3] Create `src/renderer/src/components/chat/MemorySearchTool.tsx` — ChevronRight icon + count + "memory" label when memory search results displayed in message

## Phase 6: User Story 4 — KB Management & Configuration (P2)

**Story Goal**: Edit KB settings (chunk size, overlap, rerank, preprocess)
**Independent Test**: Open settings → change parameters → verify persistence

- [ ] T049 [US4] Create `src/renderer/src/pages/knowledge/components/KBSettings/GeneralPanel.tsx` — Name input, ModelSelector (embedding), dimensions auto-fill, documentCount slider (1-50, marks at 1/6/30/50)
- [ ] T050 [US4] Create `src/renderer/src/pages/knowledge/components/KBSettings/AdvancedPanel.tsx` — preprocessProvider (Select), rerankModel (ModelSelector rerank, clearable), chunkSize (InputNumber min=100), chunkOverlap (InputNumber, validate < chunkSize), threshold (InputNumber)
- [ ] T051 [US4] Create `src/renderer/src/pages/knowledge/components/EditKBPopup.tsx` — Modal composing GeneralPanel + AdvancedPanel for existing KB editing. On save → kb:update IPC.

## Phase 7: User Story 5 — Multiple Item Types (P2)

**Story Goal**: Add directories, URLs, sitemaps, notes, videos to KB
**Independent Test**: Add each type → verify processing starts

- [ ] T052 [US5] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeDirectories.tsx` — Directory picker + path list + dedup skip
- [ ] T053 [US5] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeUrls.tsx` — URL text input + add button + dedup skip
- [ ] T054 [US5] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeSitemaps.tsx` — Sitemap URL input + dedup skip
- [ ] T055 [US5] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeNotes.tsx` — Note selector from notes feature
- [ ] T056 [US5] [P] Create `src/renderer/src/pages/knowledge/items/KnowledgeVideos.tsx` — Video URL input
- [ ] T057 [US5] Add remaining preprocessors: `src/main/preprocessors/{Doc2x,Mineru,Mistral,OpenMineru,Paddleocr}Preprocessor.ts` — each implementing the preprocessor interface with external API calls

## Phase 8: User Story 6 — Memory Settings & User Management (P2)

**Story Goal**: Manage memory settings, view/edit memories, switch users
**Independent Test**: Navigate to memory settings → view list → add/edit/delete

- [ ] T058 [US6] Create `src/renderer/src/components/settings/MemorySettings.tsx` — Full memory settings page: global toggle (with Beta badge), user selector dropdown, memory list with search, add button (Plus icon), context menu (refresh/reset/delete user), infinite scroll
- [ ] T059 [US6] Create `src/renderer/src/components/settings/MemoryManager.tsx` — Memory list with add/edit/delete actions. Add → modal. Edit → inline or modal. Delete → confirm.
- [ ] T060 [US6] Wire Memory page into settings navigation — cross-feature: add Memory menu item (Brain icon) to F003/SettingsPage, route /settings/memory

## Phase 9: User Story 7 — Save Content to KB (P2)

**Story Goal**: Save messages, topics, notes to KB
**Independent Test**: Right-click message → save to KB → verify item added

- [ ] T061 [US7] Create `src/renderer/src/pages/knowledge/components/SaveToKBPopup.tsx` — Modal: content type checkboxes (text, code, thinking, tool, citation, etc.) + KB selector dropdown. Calls kb:saveContent IPC.
- [ ] T062 [US7] Wire into message context menu — cross-feature: add "Save to Knowledge" option in F005/MessageMenubar
- [ ] T063 [US7] Wire into topic context menu — cross-feature: add "Save to Knowledge" option for topics

## Phase 10: User Story 8 — Assistant KB & Memory Config (P2)

**Story Goal**: Per-assistant KB and memory configuration
**Independent Test**: Open assistant settings → configure KB/memory → verify persistence

- [ ] T064 [US8] Create `src/renderer/src/components/settings/AssistantKBTab.tsx` — Multi-select KB dropdown + recognition toggle. Updates assistant.knowledge_bases[]. Conditional on sidebar KB icon enabled.
- [ ] T065 [US8] Create `src/renderer/src/components/settings/AssistantMemoryTab.tsx` — Enable/disable toggle (conditional on global memory enabled + configured), settings link → /settings/memory, stored count, alerts for disabled/unconfigured.
- [ ] T066 [US8] Wire KB/Memory tabs into assistant settings — cross-feature: add tabs to F005 or F003 assistant settings modal

## Phase 11: Cross-Feature Wiring & Polish

**Purpose**: Navigation integration, router updates, Error Boundaries

- [ ] T067 Add Knowledge icon to sidebar — cross-feature: modify F002/Sidebar navItems to include FileSearch icon → /knowledge route
- [ ] T068 Add /knowledge and /settings/memory routes — cross-feature: update router config in F002/F003
- [ ] T069 Register KB search popup shortcut — integrate SearchPopup with F002 shortcut system (Ctrl+K or search_message)
- [ ] T070 Create `src/renderer/src/pages/knowledge/components/SearchPopup.tsx` — Search input + results list with highlighting + keyboard navigation
- [ ] T071 Wrap KnowledgePage and MemorySettings with ErrorBoundary — catch PDF parse/embedding failures
- [ ] T072 Add i18n keys for all KB/Memory UI strings — knowledge.title, knowledge.add, knowledge.delete, memory.title, memory.add, etc. in locales/ko.json, en.json, zh-CN.json. Include error message templates: knowledge.error.no_api_key ("Go to Settings > Provider to add your API key"), knowledge.error.embedding_failed, knowledge.error.no_text_extracted
- [ ] T073 Create demo script `demos/F006-knowledge-memory.sh` — Launch app, print "Try it" instructions for KB creation + search, --ci mode for health check
- [ ] T074 Define REFERENCE_PROMPT template constant in `src/main/services/KnowledgeService.ts` — Format: numbered list `[1] "filename"\ncontent...` with citation instruction "Use [N] inline when referencing". Store as exported constant for testability.
- [ ] T075 Define memory tool registration contract in `src/main/services/MemoryService.ts` — Tool name: 'memory_search', params: { query: string }, response: MemoryItem[]. Availability condition: assistant.enableMemory === true AND MemoryConfig.enabled AND MemoryConfig.embeddingModel configured. When unavailable, tool not registered in AI context.
- [ ] T076 Define default fact extraction prompt in `src/main/services/MemoryService.ts` — Default LLM instruction: "Extract key facts, preferences, and personal information from this conversation. Return as JSON array of fact strings." Stored in DEFAULT_FACT_EXTRACTION_PROMPT constant. Overridable via MemoryConfig.customFactExtractionPrompt.
- [ ] T077 Resolve KB search popup shortcut conflict — Check existing F002 shortcut bindings for Ctrl+K. If conflict exists, use 'search_message' shortcut key from F002 useShortcut system. Register SearchPopup.show() on the resolved shortcut. Escape closes popup.
- [ ] T078 Register Electron lifecycle hooks for KnowledgeService in `src/main/index.ts` — app.on('ready') → KnowledgeService.initialize() (PendingDeleteManager retry). app.on('before-quit') → KnowledgeService.closeAll() (graceful shutdown, persist pending state).

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation)
Phase 2 → Phase 3 (US1: KB Creation) — requires VectorStore, loaders, KnowledgeService
Phase 3 → Phase 4 (US2: RAG Citations) — requires KB with embedded items + search
Phase 2 → Phase 5 (US3: Memory) — requires VectorStore for memory embeddings
Phase 3 → Phase 6 (US4: KB Config) — requires KnowledgePage + store
Phase 3 → Phase 7 (US5: Item Types) — requires KnowledgeContent container
Phase 5 → Phase 8 (US6: Memory Settings) — requires MemoryService + store
Phase 3 → Phase 9 (US7: Save to KB) — requires KnowledgeService
Phase 3,5 → Phase 10 (US8: Assistant Config) — requires KB + Memory stores
Phase 3-10 → Phase 11 (Polish) — all features ready for integration
```

## Parallel Opportunities

| Phase | Parallel Tasks | Reason |
|-------|---------------|--------|
| Phase 1 | T002, T003 | Different files, no dependencies |
| Phase 2 | T005-T014 | Each service/loader is independent |
| Phase 3 | T030, T031 | Different UI components |
| Phase 7 | T052-T057 | Each item type is independent |

## Summary

- **Total tasks**: 78
- **Phases**: 11 (1 setup + 1 foundation + 8 user stories + 1 polish)
- **P1 tasks**: 32 (US1-US3: core KB + RAG + memory)
- **P2 tasks**: 37 (US4-US8: config + item types + memory UI + save + assistant)
- **Polish tasks**: 9 (navigation, i18n, ErrorBoundary, demo, REFERENCE_PROMPT, memory tool contract, fact extraction prompt, shortcut resolution, lifecycle hooks)
- **Cross-feature modifications**: 10 tasks touching F002/F003/F005
