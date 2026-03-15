# F006 - knowledge-memory: Pre-Context

> Knowledge base RAG, document embedding, memory system, search & reranking
> Tier 2, RG-5 | Dependencies: F001, F004, F005

---

## 1. Runtime Exploration Results

| Observation | Detail |
|---|---|
| Knowledge base creation | User creates KB with name, selects embedding model and dimensions; RAGApplicationBuilder constructs pipeline |
| Item types | file, directory, URL, sitemap, note, video — each has its own loader |
| Embedding pipeline | Uses @cherrystudio/embedjs with custom Embeddings adapter wrapping provider API |
| Vector DB | LibSqlDb (embedjs-libsql) stores embeddings per knowledge base in separate directories |
| Preprocessing | Pluggable providers: Default, Doc2x, Mineru, Mistral, OpenMineru, Paddleocr — used before embedding |
| Reranking | GeneralReranker with multiple strategies applied after RAG search |
| Workload management | Concurrent task processing capped at 80MB workload and 30 processing items |
| Pending delete | Persistent JSON file tracks failed deletions for cleanup on next startup |
| Memory system | Renderer-side MemoryService wraps mem0-like API: add, search, list, update, delete memories |
| Memory processing | MemoryProcessor extracts facts from assistant messages, updates memory store, searches relevant memories |
| KB state (Redux) | Redux slice manages bases array with CRUD reducers (addBase, deleteBase, renameBase, updateBase, addItem) |
| KB UI | KnowledgePage + KnowledgeContent with sub-pages for files, directories, URLs, sitemaps, notes, videos |
| Search popup | KnowledgeSearchPopup provides inline KB search from chat context |

## 2. Source Reference

| File Path (Cherry Studio) | Role | Rebuild Target |
|---|---|---|
| src/main/knowledge/embedjs/embeddings/Embeddings.ts | Custom embedding adapter for provider APIs | [TBD] |
| src/main/knowledge/embedjs/loader/ | File/note/custom loaders for RAG pipeline | [TBD] |
| src/main/knowledge/preprocess/PreprocessProvider.ts | Preprocess orchestrator | [TBD] |
| src/main/knowledge/preprocess/PreprocessProviderFactory.ts | Factory for preprocess providers | [TBD] |
| src/main/knowledge/preprocess/DefaultPreprocessProvider.ts | Default preprocessing | [TBD] |
| src/main/knowledge/preprocess/Doc2xPreprocessProvider.ts | Doc2x preprocessing | [TBD] |
| src/main/knowledge/preprocess/MineruPreprocessProvider.ts | Mineru preprocessing | [TBD] |
| src/main/knowledge/preprocess/MistralPreprocessProvider.ts | Mistral preprocessing | [TBD] |
| src/main/knowledge/preprocess/OpenMineruPreprocessProvider.ts | OpenMineru preprocessing | [TBD] |
| src/main/knowledge/preprocess/PaddleocrPreprocessProvider.ts | PaddleOCR preprocessing | [TBD] |
| src/main/knowledge/preprocess/PreprocessingService.ts | Preprocessing service | [TBD] |
| src/main/knowledge/reranker/Reranker.ts | Reranker orchestrator | [TBD] |
| src/main/knowledge/reranker/BaseReranker.ts | Base reranker class | [TBD] |
| src/main/knowledge/reranker/GeneralReranker.ts | General reranker implementation | [TBD] |
| src/main/knowledge/reranker/strategies/ | Reranking strategy plugins | [TBD] |
| src/main/services/KnowledgeService.ts (762 lines) | KB management: create, delete, add items, search, rerank | [TBD] |
| src/renderer/src/services/MemoryService.ts | Memory CRUD via mem0-like API | [TBD] |
| src/renderer/src/services/MemoryProcessor.ts | Fact extraction, memory update, relevance search | [TBD] |
| src/renderer/src/services/KnowledgeService.ts | KB client-side helpers | [TBD] |
| src/renderer/src/store/knowledge.ts | KB Redux slice (bases CRUD) | [TBD] |
| src/renderer/src/hooks/useKnowledge.ts | KB React hook | [TBD] |
| src/renderer/src/pages/knowledge/KnowledgePage.tsx | KB main page | [TBD] |
| src/renderer/src/pages/knowledge/KnowledgeContent.tsx | KB content viewer | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeFiles.tsx | File items UI | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeDirectories.tsx | Directory items UI | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeUrls.tsx | URL items UI | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeSitemaps.tsx | Sitemap items UI | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeNotes.tsx | Note items UI | [TBD] |
| src/renderer/src/pages/knowledge/items/KnowledgeVideos.tsx | Video items UI | [TBD] |
| src/renderer/src/pages/knowledge/components/AddKnowledgeBasePopup.tsx | Create KB dialog | [TBD] |
| src/renderer/src/pages/knowledge/components/EditKnowledgeBasePopup.tsx | Edit KB dialog | [TBD] |
| src/renderer/src/pages/knowledge/components/KnowledgeSearchPopup.tsx | KB search popup | [TBD] |
| src/renderer/src/pages/knowledge/components/KnowledgeSettings/ | KB settings panel | [TBD] |
| src/renderer/src/pages/knowledge/components/StatusIcon.tsx | Processing status indicator | [TBD] |
| packages/embedjs/ | Core embedding framework | [TBD] |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location |
|---|---|---|
| B161 | Create knowledge base with name, embedding model, dimensions | KnowledgeService.create |
| B162 | Delete knowledge base and cleanup RAG app + DB instance | KnowledgeService.delete |
| B163 | Reset knowledge base (clear all embeddings) | KnowledgeService.reset |
| B164 | Add file item to knowledge base with loader | KnowledgeService.add (file) |
| B165 | Add directory item — scan and load all files | KnowledgeService.add (directory) |
| B166 | Add URL item — web loader | KnowledgeService.add (URL) |
| B167 | Add sitemap item — sitemap loader | KnowledgeService.add (sitemap) |
| B168 | Add note item — note loader | KnowledgeService.add (note) |
| B169 | Add video item — video loader | KnowledgeService.add (video) |
| B170 | Remove item from knowledge base | KnowledgeService.remove |
| B171 | Search knowledge base (RAG query) | KnowledgeService.search |
| B172 | Rerank search results | KnowledgeService.rerank |
| B173 | Preprocess document before embedding (pluggable provider) | PreprocessProvider / PreprocessingService |
| B174 | Workload management — cap concurrent processing | KnowledgeService workload/processingItemCount |
| B175 | Pending delete persistence — retry failed deletions on startup | pendingDeleteManager |
| B176 | Close all RAG applications on shutdown | KnowledgeService.closeAll |
| B177 | Store KB state — add base | knowledge slice: addBase |
| B178 | Store KB state — delete base (with file cleanup) | knowledge slice: deleteBase |
| B179 | Store KB state — rename base | knowledge slice: renameBase |
| B180 | Store KB state — update base | knowledge slice: updateBase |
| B181 | Store KB state — add item to base | knowledge slice: addItem |
| B182 | Store KB state — update item processing status | knowledge slice (status updates) |
| B183 | Memory — list memories with pagination | MemoryService.list |
| B184 | Memory — add memories from assistant messages | MemoryService.add |
| B185 | Memory — search memories by query | MemoryService.search |
| B186 | Memory — delete memory by ID | MemoryService.delete |
| B187 | Memory — update memory content | MemoryService.update |
| B188 | Memory — get memory history | MemoryService.get |
| B189 | Memory — delete all memories for user | MemoryService.deleteAllMemoriesForUser |
| B190 | Memory — get users list with counts | MemoryService.getUsersList |
| B191 | Memory — extract facts from conversation | MemoryProcessor.extractFacts |
| B192 | Memory — update memories from extracted facts | MemoryProcessor.updateMemories |
| B193 | Memory — process full conversation | MemoryProcessor.processConversation |
| B194 | Memory — search relevant memories for context | MemoryProcessor.searchRelevantMemories |
| B195 | Memory — reload/update config | MemoryService.updateConfig |

## 4. UI Component Features

| Component | Feature |
|---|---|
| KnowledgePage | Main KB page with sidebar list and content area |
| KnowledgeContent | Content viewer showing items for selected KB |
| KnowledgeFiles | File item list with upload, status, delete |
| KnowledgeDirectories | Directory item list with folder picker |
| KnowledgeUrls | URL item input with add/remove |
| KnowledgeSitemaps | Sitemap URL input |
| KnowledgeNotes | Note item selector from notes feature |
| KnowledgeVideos | Video URL item input |
| AddKnowledgeBasePopup | Create KB dialog: name, embedding model, dimensions |
| EditKnowledgeBasePopup | Edit KB name and settings |
| KnowledgeSearchPopup | Inline search across KB from chat |
| KnowledgeSearchItem | Individual search result display |
| KnowledgeSettings | KB-level settings panel |
| StatusIcon | Processing status indicator (pending/processing/done/failed) |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Click "New KB" | Opens AddKnowledgeBasePopup, user fills name/model/dimensions, creates KB |
| Drag files onto KB | Files uploaded and added as file items, embedding starts |
| Click delete on KB | Confirms deletion, removes KB and all items, cleans up files |
| Click search in chat | Opens KnowledgeSearchPopup, user types query, results shown inline |
| Item processing status | StatusIcon updates as items move through pending → processing → done/failed |
| Edit KB | Opens EditKnowledgeBasePopup for renaming |
| Add URL/Sitemap | Text input for URL, validates and starts loading |
| Memory auto-extract | After conversation, MemoryProcessor extracts facts and stores |
| Memory search | Before response, relevant memories searched and injected as context |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Vector DB | better-sqlite3 (replacing LibSQL/embedjs-libsql) | New stack decision: better-sqlite3 replaces LibSQL |
| Embedding framework | Custom RAG pipeline (replacing @cherrystudio/embedjs) | Need to rebuild embedding pipeline for better-sqlite3 |
| State management | Zustand (replacing Redux slice) | New stack decision |
| Preprocess providers | Keep pluggable provider pattern | Good abstraction, worth preserving |
| Reranker | Keep strategy pattern | Flexible reranking approach |
| Memory backend | Evaluate mem0 alternatives or custom implementation | [TBD] |

## 7. Foundation Dependencies

| Dependency | Feature | What is needed |
|---|---|---|
| F001 (shell) | IPC channels for KB operations | IPC infrastructure for main↔renderer communication |
| F004 (provider-engine) | Embedding model access | Provider API to generate embeddings |
| F005 (chat-core) | Chat context integration | KB search results injected into chat context; memory auto-extraction after conversations |

## 8. Naming Remapping

| Cherry Studio | Angdu Studio |
|---|---|
| @cherrystudio/embedjs | Custom AS embedding module |
| @cherrystudio/embedjs-libsql | AS better-sqlite3 vector store |
| @cherrystudio/embedjs-loader-sitemap | AS sitemap loader |
| @cherrystudio/embedjs-loader-web | AS web loader |
| HOME_CHERRY_DIR | HOME_ANGDU_DIR |
| cherry-studio knowledge paths | angdu-studio knowledge paths |
| CherryHQ references | AngduStudio references |

## 9. Static Resources

| Resource | Location | Notes |
|---|---|---|
| Knowledge base data directory | {userData}/KnowledgeBase/ | Per-KB subdirectories with vector DB files |
| Pending delete file | {userData}/KnowledgeBase/knowledge_pending_delete.json | Cleanup persistence |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| (none specific to F006) | KB paths derived from app data path | Uses getDataPath() utility |

## 11. Feature Contracts

### Provided Contracts (F006 provides to others)

| Contract | Consumer | Description |
|---|---|---|
| KB search API | F005 (chat-core), F009 (web-search) | Search knowledge base and return ranked results |
| Memory context API | F005 (chat-core) | Retrieve relevant memories for conversation context |
| KB item management IPC | Renderer | CRUD operations on KB items via IPC |

### Required Contracts (F006 requires from others)

| Contract | Provider | Description |
|---|---|---|
| IPC infrastructure | F001 (shell) | IpcChannel registration and handler setup |
| Embedding generation | F004 (provider-engine) | Generate vector embeddings from text via provider API |
| Chat message access | F005 (chat-core) | Access conversation messages for memory extraction |

## 12. For /speckit.specify

- KB CRUD operations must support all item types: file, directory, URL, sitemap, note, video
- Vector storage must use better-sqlite3 instead of LibSQL — design custom vector store adapter
- Preprocess provider interface must be pluggable (factory pattern)
- Reranker must support strategy pattern for different ranking algorithms
- Memory system must support per-user isolation and CRUD
- Workload management must prevent resource exhaustion (concurrent embedding limits)
- Pending delete mechanism needed for crash recovery

## 13. For /speckit.plan

- Phase 1: Vector store adapter (better-sqlite3 based, replacing LibSqlDb)
- Phase 2: Embedding pipeline (custom Embeddings class + loaders)
- Phase 3: KB service (create, delete, add items, search)
- Phase 4: Preprocess providers (Default first, then specialized)
- Phase 5: Reranker (base + strategies)
- Phase 6: Memory service (CRUD + fact extraction)
- Phase 7: Zustand store for KB state
- Phase 8: KB UI pages and components
- Phase 9: Integration with chat-core (context injection, memory auto-extraction)

## 14. For /speckit.analyze

- The embedjs package ecosystem is Cherry-specific and cannot be reused — requires full rebuild
- LibSqlDb → better-sqlite3 vector store is a significant change; need to design vector similarity search in SQLite
- Memory system (MemoryService + MemoryProcessor) is renderer-side; consider whether main-process placement is better for Angdu
- Preprocess providers have external service dependencies (Doc2x, Mineru, Mistral, PaddleOCR) — evaluate which to include in core scope
- KB Redux slice uses Redux Toolkit patterns; Zustand migration is straightforward (simpler API)
- KnowledgeSearchPopup integration with chat requires coordination with F005 contracts
- Video loader is a newer feature — evaluate if it's core scope
