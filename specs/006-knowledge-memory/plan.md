# Implementation Plan: Knowledge & Memory System

**Branch**: `006-knowledge-memory` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)

## Summary

Implement a Knowledge Base RAG pipeline and Memory system for Angdu Studio, providing document ingestion, vector embedding, similarity search with citations, and persistent fact extraction from conversations. Replaces Cherry Studio's @cherrystudio/embedjs ecosystem with a custom pipeline on better-sqlite3.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: better-sqlite3, Zustand, React 19, shadcn/ui, Tailwind CSS 4, Vercel AI SDK (via F004)
**Storage**: better-sqlite3 (vector store, memory store — main process), Zustand persist (KB metadata — renderer)
**Testing**: Vitest + Playwright
**Target Platform**: Electron v40+ (desktop)
**Project Type**: desktop-app (Electron)
**Constraints**: Main process for heavy ops (embedding, chunking), renderer for UI state. IPC bridge for all cross-process.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| SSoT (I) | ✅ | Types in @shared/types. KB config in main process DB. |
| Explicit (II) | ✅ | All IPC handlers explicitly registered. Named Zustand actions. |
| Fail Loudly (III) | ✅ | FR-043/044/045 cover error handling. IPC errors serialized. |
| Composition (IV) | ✅ | Preprocessing providers composed via factory. Reranker strategies composed. |
| Test Contract (V) | ✅ | Test IPC contracts, store actions, component behavior. |
| Progressive (VI) | ✅ | Phases: L0=storage, L1=CRUD UI, L2=RAG pipeline, L3=memory system. |
| ARC-01 (IPC) | ✅ | All KB/memory operations via IPC. Vector DB in main process. |
| ARC-04 (Singleton) | ✅ | KnowledgeService and MemoryService as singletons in main. |
| ARC-05 (Dual Storage) | ✅ | SQLite for vectors/memories (main). Zustand for KB metadata (renderer). |
| PSP-05 (KB Isolation) | ✅ | Each KB has separate vector space. Per-user memory isolation. |
| F7-02 (Memory) | ✅ | Heavy ops (embedding) in main process worker. Workload cap. |

## Project Structure

### Source Code

```text
src/
├── main/
│   ├── services/
│   │   ├── KnowledgeService.ts        # KB CRUD, item management, orchestration
│   │   ├── MemoryService.ts           # Memory CRUD, fact extraction, search
│   │   ├── VectorStore.ts             # better-sqlite3 vector storage + cosine search
│   │   ├── TextChunker.ts             # Text chunking with configurable size/overlap
│   │   ├── WorkloadManager.ts         # Concurrent processing cap (80MB, 30 items)
│   │   └── PendingDeleteManager.ts    # Failed deletion persistence + retry
│   ├── loaders/
│   │   ├── FileLoader.ts              # Text extraction from txt/md
│   │   ├── PdfLoader.ts               # PDF text extraction (pdf-parse)
│   │   ├── DocxLoader.ts              # DOCX text extraction (mammoth)
│   │   ├── UrlLoader.ts               # Web page text extraction
│   │   ├── SitemapLoader.ts           # Sitemap URL parsing + loading
│   │   └── VideoLoader.ts             # Video transcript extraction
│   ├── preprocessors/
│   │   ├── PreprocessorFactory.ts     # Factory for pluggable providers
│   │   ├── DefaultPreprocessor.ts     # Default (no-op or basic cleanup)
│   │   ├── Doc2xPreprocessor.ts       # Doc2x API preprocessing
│   │   ├── MineruPreprocessor.ts      # Mineru preprocessing
│   │   ├── MistralPreprocessor.ts     # Mistral preprocessing
│   │   ├── OpenMineruPreprocessor.ts  # OpenMineru preprocessing
│   │   └── PaddleocrPreprocessor.ts   # PaddleOCR preprocessing
│   ├── reranker/
│   │   ├── Reranker.ts                # Strategy pattern orchestrator
│   │   └── strategies/
│   │       └── GeneralStrategy.ts     # General reranking strategy
│   └── ipc/
│       ├── knowledge-handlers.ts      # KB IPC handler registration
│       └── memory-handlers.ts         # Memory IPC handler registration
├── preload/
│   └── knowledge-api.ts               # contextBridge KB + memory API
├── renderer/src/
│   ├── stores/
│   │   ├── useKnowledgeStore.ts       # KB metadata + items state (Zustand)
│   │   └── useMemoryStore.ts          # Memory UI state (Zustand)
│   ├── pages/
│   │   └── knowledge/
│   │       ├── KnowledgePage.tsx       # Main KB page (sidebar + content)
│   │       ├── KnowledgeContent.tsx    # Content viewer for selected KB
│   │       ├── items/
│   │       │   ├── KnowledgeFiles.tsx
│   │       │   ├── KnowledgeDirectories.tsx
│   │       │   ├── KnowledgeUrls.tsx
│   │       │   ├── KnowledgeSitemaps.tsx
│   │       │   ├── KnowledgeNotes.tsx
│   │       │   └── KnowledgeVideos.tsx
│   │       └── components/
│   │           ├── AddKBPopup.tsx      # Create KB dialog
│   │           ├── EditKBPopup.tsx     # Edit KB settings dialog
│   │           ├── SearchPopup.tsx     # KB search popup from chat
│   │           ├── StatusIcon.tsx      # Processing status indicator
│   │           ├── SaveToKBPopup.tsx   # Save message/topic/note to KB
│   │           └── KBSettings/
│   │               ├── GeneralPanel.tsx
│   │               └── AdvancedPanel.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── KBButton.tsx           # Inputbar KB selection button
│   │   │   ├── KBInputDisplay.tsx     # Green tags below input
│   │   │   ├── CitationBlock.tsx      # Citation [N] badge + tooltip
│   │   │   ├── KBSearchTool.tsx       # KB search tool display in messages
│   │   │   └── MemorySearchTool.tsx   # Memory search tool display in messages
│   │   └── settings/
│   │       ├── MemorySettings.tsx     # Full memory settings page
│   │       ├── MemoryManager.tsx      # Memory list with CRUD
│   │       ├── AssistantKBTab.tsx     # Assistant settings KB tab
│   │       └── AssistantMemoryTab.tsx # Assistant settings Memory tab
│   └── types/
│       └── knowledge.ts               # KB/Memory type definitions
└── shared/
    └── types/
        └── knowledge.ts               # Shared KB/Memory types (cross-process)
```

## Implementation Phases

### Phase 1: Vector Store + Text Chunker (Foundation)
- VectorStore.ts: SQLite table creation, insert, cosine similarity search, delete by kb_id/item_id
- TextChunker.ts: Fixed-size chunking with overlap
- Unit tests for cosine similarity correctness

### Phase 2: Loaders + Preprocessors
- FileLoader, PdfLoader, DocxLoader for text extraction
- UrlLoader, SitemapLoader, VideoLoader
- PreprocessorFactory + DefaultPreprocessor
- Verify pdf-parse import compatibility

### Phase 3: KnowledgeService (Main Process)
- KB CRUD (create, delete, reset, update, list)
- Item management (add, remove, batch add files)
- Embedding pipeline orchestration: load → preprocess → chunk → embed → store
- WorkloadManager integration (80MB, 30 items cap)
- PendingDeleteManager for crash recovery
- Progress events to renderer

### Phase 4: Reranker
- Reranker orchestrator with strategy pattern
- GeneralStrategy implementation
- Integration with kb:search pipeline

### Phase 5: Memory Service (Main Process)
- MemoryService: CRUD with vector search
- Fact extraction via LLM (configurable prompt)
- Per-user isolation
- History tracking (ADD/UPDATE/DELETE)
- MemoryConfig management

### Phase 6: IPC Registration + Preload
- knowledge-handlers.ts: Register all kb:* channels
- memory-handlers.ts: Register all memory:* channels
- knowledge-api.ts: contextBridge API exposure
- ai:embed channel (extends F004)

### Phase 7: Zustand Stores
- useKnowledgeStore: bases[] with CRUD actions, persist to localStorage
- useMemoryStore: UI state (selectedUser, search query, loading states)
- Hydration from main process on mount

### Phase 8: KB UI Pages
- KnowledgePage with sidebar list + content area
- Item type sub-pages (files, directories, URLs, sitemaps, notes, videos)
- AddKBPopup, EditKBPopup with GeneralPanel + AdvancedPanel
- StatusIcon for processing status
- SearchPopup for KB search
- SaveToKBPopup for message/topic/note → KB

### Phase 9: Memory UI
- MemorySettings page (/settings/memory)
- MemoryManager with list, search, add/edit/delete
- AssistantMemoryTab in assistant settings

### Phase 10: Chat Integration
- KBButton in inputbar (QuickPanel for KB selection)
- KBInputDisplay (green tags)
- CitationBlock rendering (8-stage pipeline)
- KB search as AI tool registration
- Memory search as AI tool registration
- KBSearchTool + MemorySearchTool message display components

### Phase 11: Cross-Feature Wiring
- Modify F005 chat flow to call KB search when KBs attached
- Modify F005 message processing to call memory extraction after conversation
- Modify F005 MessageBlock to render CitationBlock for knowledge/memory references
- Add Knowledge icon to sidebar navigation
- Add Memory to settings page navigation
- Add KB/Memory tabs to assistant settings

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-001 | Click "New KB" → fill form → submit | AddKBPopup.onSubmit() | knowledgeStore.addBase(kb) | New item in sidebar list | KB name appears in sidebar | verify-state .kb-sidebar-item text "Test KB" |
| FR-002 | Right-click KB → Delete → confirm | KnowledgePage.handleDelete(id) | knowledgeStore.deleteBase(id) | Item removed from sidebar | KB disappears | verify-state .kb-sidebar-item count -1 |
| FR-005 | Open KB settings → change chunkSize | AdvancedPanel.onSave() | knowledgeStore.updateBase(kb) | Settings saved | Toast "Settings saved" | verify-state .toast visible |
| FR-006 | Drag KB in sidebar | DragEnd handler | knowledgeStore.reorder(from, to) | List order changes | KB moves position | verify-effect .kb-list order changed |
| FR-007 | Click "Add File" → select file | KnowledgeFiles.handleAdd() | knowledgeStore.addItem(item) | New row in items table | File name + pending icon | verify-state .item-row .status-icon "pending" |
| FR-031 | Click KB button in inputbar | KBButton.onClick() | — | QuickPanel opens | KB list with checkboxes | verify-state .kb-panel visible |
| FR-031 | Select KB in QuickPanel | KBButton.onSelect(kbId) | assistantStore.updateKBs([...kbIds]) | Green tag appears | KB name tag below input | verify-state .kb-tag text "Test KB" |
| FR-032 | Click X on KB tag | KBInputDisplay.onRemove(kbId) | assistantStore.updateKBs(filtered) | Tag removed | Tag disappears | verify-state .kb-tag count -1 |
| FR-037 | Press search shortcut | SearchPopup.show() | — | Popup opens | Search input focused | verify-state .search-popup visible |
| FR-035 | Navigate to Settings > Memory | MemorySettings mount | memoryStore.loadMemories() | Memory list rendered | Memory items visible | verify-state .memory-list .item count > 0 |
| FR-024 | Click "Add Memory" | MemoryManager.handleAdd() | memoryStore.addMemory(m) | New row in list | Memory text visible | verify-state .memory-item text "new memory" |
| FR-036 | Right-click message → "Save to KB" | SaveToKBPopup.show(message) | — | Popup opens | Content types + KB selector | verify-state .save-kb-popup visible |

### Async-Flow Rows

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-014 | async-flow: Item processing starts | onItemProgress(pending) | knowledgeStore.updateItemStatus('processing') | StatusIcon changes | Spinner icon | verify-state .status-icon class "processing" |
| FR-014 | async-flow: Item processing completes | onItemProgress(completed) | knowledgeStore.updateItemStatus('completed') | StatusIcon changes | Check icon | verify-state .status-icon class "completed" |
| FR-014 | async-flow: Item processing fails | onItemProgress(failed) | knowledgeStore.updateItemStatus('failed', error) | StatusIcon changes + error | X icon + error tooltip | verify-state .status-icon class "failed" |
| FR-020 | async-flow: KB search executing | kb:search called | — | Search indicator shown | "Searching..." in message | verify-state .kb-search-tool .status "searching" |
| FR-020 | async-flow: KB search complete | kb:search returns | — | Results displayed | Citation badges in response | verify-state .citation-badge count > 0 |
| FR-025 | async-flow: Fact extraction | memory:extractFacts called | memoryStore.factsExtracted++ | Background process | No visible UI during extraction | — (background) |

### Cross-Feature Rows

| FR | User Action | Handler | Store/State Mutation | Effect | Visual/Output Result | Verify Method |
|----|-------------|---------|---------------------|--------|---------------------|---------------|
| FR-022 | cross-feature: Send message with KB attached | F005/Inputbar:handleSend() → kb:search(kbIds, query) | Message includes KnowledgeReference[] | CitationBlock inserted in response | [N] badges in AI response | grep Inputbar for kb:search call |
| FR-026 | cross-feature: Memory recall before response | F005/ChatService:buildContext() → memory:searchRelevant(userId, query) | MemoryItem[] added to AI tool results | Memory context available to AI | AI references remembered facts | grep ChatService for memory:searchRelevant |
| FR-030 | cross-feature: KB icon in sidebar | F002/Sidebar:navItems → add Knowledge route | Router adds /knowledge route | /knowledge page reachable | Knowledge icon in sidebar | verify-state .sidebar .knowledge-icon visible |
| FR-035 | cross-feature: Memory in settings | F003/SettingsPage:menuItems → add Memory | Router adds /settings/memory | Memory page reachable | Brain icon in settings menu | verify-state .settings-menu .memory-item visible |

### Citation Pipeline Rows (Inline Reference — BLOCKING)

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-023 | Hover citation [N] | CitationBlock.onHover(refNum) → refs.find(r => r.refNumber === refNum) | — | Tooltip shows source #N | Source file name + snippet | verify: hover [N] → tooltip shows source #N's file |
| FR-023 | Click citation [N] | CitationBlock.onClick(refNum) → shell:openPath(ref.sourceFile) | — | Opens source file | File opens in default app | verify: click → file opens |
| FR-023 | View "N references" summary | CitationBlock.renderSummary() | — | Expandable reference list | All cited sources listed | verify-state .citation-summary visible |

## AI-Generated Reference Pipeline

| Stage | Design Item | Implementation |
|-------|-----------|----------------|
| 1. Injection | Format search results in AI prompt | `[1] "filename.pdf"\ncontent...` numbered list in system message |
| 2. AI Rules | Citation instruction to AI | "Use [N] inline when referencing source material from the knowledge base" |
| 3. Extraction | Parse cited numbers from AI response | `Regex /\[(\d+)\]/g` → `Set<number>` of cited reference numbers |
| 4. Filtering | Only cited results become blocks | `searchResults.filter(r => citedNums.has(r.originalRefNumber))` |
| 5. Renumbering | Display number assignment | First-appearance order in AI text, not search rank. `useMemo` at render time. |
| 6. Storage | Citation data structure | `{ refNumber(display), originalRefNumber(lookup), sourceFile, content, similarity, kbId, kbName }` |
| 7. Rendering | Badge display | Inline `<sup>[N]</sup>` badges. Render-time renumbering via `useMemo`. Stored text untouched. |
| 8. Interaction | Click/hover behavior | Hover → Tooltip(sourceFile + snippet). Click → shell:openPath(sourceFile). |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge | Architecture |
|-----------|---------------|-----------|---------------|---------------|--------|-------------|
| Consumes ← | F004 model-provider | ai:embed IPC | `{ embeddings: number[][] }` | `number[][]` | — | Direct IPC |
| Consumes ← | F004 model-provider | provider:fetch-models | `Model[]` with capabilities | Models where capabilities.includes('embedding') | Filter adapter | Direct IPC |
| Consumes ← | F005 chat-conversation | chat:getMessages | `Message[]` | Message content for memory extraction | — | Direct IPC |
| Consumes ← | F001 app-shell | app:getPath, file:read/write/delete | Paths, Buffer | string, Buffer | — | Direct IPC |
| Provides → | F005 chat-conversation | KB search tool | `KnowledgeReference[]` | AI tool: `{ name: 'knowledge_search', result: KnowledgeReference[] }` | Tool adapter | AI Tool |
| Provides → | F005 chat-conversation | Memory search tool | `MemoryItem[]` | AI tool: `{ name: 'memory_search', result: MemoryItem[] }` | Tool adapter | AI Tool |
| Provides → | F005 chat-conversation | CitationBlock component | `KnowledgeReference[]` | MessageBlock type='citation' with knowledge field | — | Direct Import |

## UX Behavior Contract

| Scenario | Expected Behavior | Failure Behavior | Verify Method |
|----------|-------------------|------------------|---------------|
| File embedding processing | StatusIcon shows pending→processing→completed. Progress bar during processing. | No feedback = user thinks nothing happened | verify-state .status-icon transitions |
| KB search during chat | "Searching Knowledge Base" indicator in message area. Results appear as citations. | Silent search = user doesn't know KB was searched | verify-state .kb-search-tool visible during search |
| Memory extraction after chat | Background process, no visible UI. Memory count updates in settings. | Failure = user loses memories silently. Must log errors. | — (background, verify via memory:list) |
| Large file processing (>10MB) | Progress percentage shown. User can cancel. Workload cap prevents overload. | UI frozen during processing = user force-quits app | verify-state .progress-bar visible |
| Embedding API failure | Item marked "failed" with error tooltip. Retry button available. | Silent failure = item stuck in "processing" forever | verify-state .status-icon "failed" + .error-tooltip visible |
| App shutdown during processing | Graceful stop. Pending items persisted. Resume on restart. | Data loss = partially embedded items corrupted | verify: restart → pending items resume |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| Zustand + React 19 | Selector return values MUST be referentially stable. Use `useShallow()` for array/object selectors. `knowledgeStore.bases` → OK (direct reference). `knowledgeStore.bases.filter(...)` → WRONG (new array per render). | Infinite re-render loop if selector creates new reference |
| better-sqlite3 in main process | All DB operations MUST be synchronous (better-sqlite3 is sync). Wrap in IPC handlers. NEVER call from renderer. | better-sqlite3 blocks Node event loop — must be in main process with short operations |
| Embedding as Buffer BLOB | Store Float32Array as Buffer. Deserialize with `new Float32Array(buffer.buffer)`. Verify byte alignment. | Buffer↔Float32Array conversion can fail silently with wrong byte alignment |
| IPC for heavy operations | Embedding generation, text extraction, chunking — ALL in main process via IPC. Renderer only sends requests and receives progress events. | CPU-heavy work in renderer blocks UI. Main process has worker threads available. |
| Event handler + state update | Batch knowledgeStore updates in item processing callbacks. Don't call setBase + setItem + setStatus separately. | Unbatched updates cause 3 re-renders with inconsistent state |
| Build-time plugin registration | Verify @tailwindcss/vite is registered. Verify all new component CSS classes are within Tailwind's scan scope. | Missing plugin = unstyled KB UI components |
| Error Boundary | KnowledgePage and MemorySettings wrapped with ErrorBoundary. PDF parsing / embedding failures must not crash the app. | Uncaught error in KB page crashes entire app |
| Cosine similarity threshold | Default 0.3, NOT 0.7. text-embedding-3-small produces 0.2–0.5 for relevant matches. | Threshold 0.7 filters out all results — appears as "search doesn't work" |

## Source → Target Component Mapping

| Source Component | Source File | Lines | UI Pattern Summary | Target Component | Target File | Notes |
|---|---|---|---|---|---|---|
| KnowledgePage | KnowledgePage.tsx | 239 | Navbar + flex row (sidebar + content), draggable list with context menu, Plus button, search shortcut | KnowledgePage | pages/knowledge/KnowledgePage.tsx | 1:1 |
| KnowledgeContent | KnowledgeContent.tsx | ~200 | Tab-based item type views, empty state | KnowledgeContent | pages/knowledge/KnowledgeContent.tsx | 1:1 |
| KnowledgeFiles | KnowledgeFiles.tsx | ~150 | File list with upload button, status icons, delete | KnowledgeFiles | pages/knowledge/items/KnowledgeFiles.tsx | 1:1 |
| KnowledgeDirectories | KnowledgeDirectories.tsx | ~100 | Directory picker, path list | KnowledgeDirectories | pages/knowledge/items/KnowledgeDirectories.tsx | 1:1 |
| KnowledgeUrls | KnowledgeUrls.tsx | ~100 | URL input + add button | KnowledgeUrls | pages/knowledge/items/KnowledgeUrls.tsx | 1:1 |
| KnowledgeSitemaps | KnowledgeSitemaps.tsx | ~100 | Sitemap URL input | KnowledgeSitemaps | pages/knowledge/items/KnowledgeSitemaps.tsx | 1:1 |
| KnowledgeNotes | KnowledgeNotes.tsx | ~100 | Note selector | KnowledgeNotes | pages/knowledge/items/KnowledgeNotes.tsx | 1:1 |
| KnowledgeVideos | KnowledgeVideos.tsx | ~100 | Video URL input | KnowledgeVideos | pages/knowledge/items/KnowledgeVideos.tsx | 1:1 |
| AddKnowledgeBasePopup | AddKnowledgeBasePopup.tsx | ~80 | Modal: name input + ModelSelector + dimension auto-fill + documentCount slider | AddKBPopup | pages/knowledge/components/AddKBPopup.tsx | 1:1 |
| EditKnowledgeBasePopup | EditKnowledgeBasePopup.tsx | ~60 | Modal reusing GeneralPanel + AdvancedPanel | EditKBPopup | pages/knowledge/components/EditKBPopup.tsx | 1:1 |
| GeneralSettingsPanel | GeneralSettingsPanel.tsx | ~150 | name, model selector, dimensions, documentCount slider with marks | GeneralPanel | pages/knowledge/components/KBSettings/GeneralPanel.tsx | 1:1 |
| AdvancedSettingsPanel | AdvancedSettingsPanel.tsx | ~200 | preprocessProvider select, rerankModel select, chunkSize/chunkOverlap inputs, threshold | AdvancedPanel | pages/knowledge/components/KBSettings/AdvancedPanel.tsx | 1:1 |
| KnowledgeSearchPopup | KnowledgeSearchPopup.tsx | ~150 | Search input + results list with highlighting | SearchPopup | pages/knowledge/components/SearchPopup.tsx | 1:1 |
| StatusIcon | StatusIcon.tsx | ~50 | 4-state icon (pending/processing/completed/failed) | StatusIcon | pages/knowledge/components/StatusIcon.tsx | 1:1 |
| KnowledgeBaseButton | KnowledgeBaseButton.tsx | ~100 | FileSearch icon, QuickPanel with checkboxes, +Add option | KBButton | components/chat/KBButton.tsx | 1:1 |
| KnowledgeBaseInput | KnowledgeBaseInput.tsx | ~60 | Horizontal scrollable green tags, closable | KBInputDisplay | components/chat/KBInputDisplay.tsx | 1:1 |
| SaveToKnowledgePopup | SaveToKnowledgePopup.tsx | ~200 | Content type checkboxes + KB selector dropdown | SaveToKBPopup | pages/knowledge/components/SaveToKBPopup.tsx | 1:1 |
| CitationsList | CitationsList.tsx | ~150 | Inline [N] sup badges + Ant Tooltip + click-to-open | CitationBlock | components/chat/CitationBlock.tsx | 1:1, shadcn Tooltip |
| MessageKnowledgeSearch | MessageKnowledgeSearch.tsx | ~80 | FileSearch icon + status + result count | KBSearchTool | components/chat/KBSearchTool.tsx | 1:1 |
| MessageMemorySearch | MessageMemorySearch.tsx | ~50 | ChevronRight + count + "memory" label | MemorySearchTool | components/chat/MemorySearchTool.tsx | 1:1 |
| MemorySettings | MemorySettings.tsx | 857 | toggle+gear→modal, user dropdown+add/delete, infinite scroll list, context menu(refresh/reset/delete), add memory modal, edit memory modal | MemorySettings | components/settings/MemorySettings.tsx | 1:1, complex |
| AssistantKnowledgeBaseSettings | AssistantKnowledgeBaseSettings.tsx | ~100 | Multi-select KB dropdown + recognition toggle | AssistantKBTab | components/settings/AssistantKBTab.tsx | 1:1 |
| AssistantMemorySettings | AssistantMemorySettings.tsx | ~120 | Enable toggle + settings link + stored count + alerts | AssistantMemoryTab | components/settings/AssistantMemoryTab.tsx | 1:1 |

## Data Lifecycle Mapping

| Entity | Source Paradigm | Target Paradigm | Justification | Key Components |
|--------|----------------|-----------------|---------------|----------------|
| KnowledgeBase | curated (user creates, names, configures) | curated (same) | — | AddKBPopup, EditKBPopup, KnowledgePage |
| KnowledgeItem | import-driven (user adds files/URLs/etc.) | import-driven (same) | — | KnowledgeFiles, KnowledgeUrls, etc. |
| MemoryItem | auto-generated + user-editable | auto-generated + user-editable (same) | — | MemorySettings, MemoryManager |
| VectorRecord | derived (generated from items via embedding) | derived (same) | — | VectorStore, KnowledgeService |

## Bug Prevention Checks (B-1)

### Runtime Compatibility
- Electron v40+: Use `webUtils.getPathForFile()` not `File.path` for file drag-drop
- better-sqlite3: Verify native module rebuilt for Electron's Node version

### State Management Anti-patterns
- useKnowledgeStore.bases is the source of truth. No derived state stored separately.
- No circular dependencies between knowledge and memory stores.

### Async & Concurrency
- WorkloadManager prevents concurrent processing overload
- IPC handlers must not return until operation completes (sync better-sqlite3)
- Progress events are fire-and-forget (main → renderer)
- Component unmount during processing: unsubscribe from progress events

### Dependency Safety
- pdf-parse: Import smoke test required (ESM/CJS compatibility)
- mammoth: Pure JS, no native deps, safe for Electron
- better-sqlite3: Already in project (F001), native module verified
