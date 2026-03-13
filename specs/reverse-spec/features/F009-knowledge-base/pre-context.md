# F009-knowledge-base Pre-Context

> Feature: KB management, RAG pipeline, embedding generation, document ingestion
> Tier: 2 | Risk Group: RG-4 | Dependencies: F001, F004, F007

---

## 1. Runtime Exploration Results

### Screen: /knowledge -- Knowledge Base

**Layout**: Navbar + ContentContainer (KnowledgeSideNav + KnowledgeContent)

**UI Elements**:
- **Navbar**: Centered title "Knowledge Base"
- **SideNav**: DraggableList of knowledge bases with Book icon, "+ Add" button at bottom
- **Context menu** (per base): Rename, Settings, Divider, Delete (with confirm modal)
- **Content area**: KnowledgeContent component showing items for selected base
- **Empty state**: Ant Design `Empty` when no bases exist

### Knowledge Base Popup (from chat toolbar)

**Layout**: Bottom popup panel triggered from chat input toolbar book icon

**UI Elements**:
- Clear option (Clear selected knowledge bases)
- "+ Add Knowledge Base..." button
- Keyboard navigation: ESC Close, Up/Down Select, Cmd+Up/Down Page, Enter Confirm

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| 1 | `src/renderer/src/pages/knowledge/KnowledgePage.tsx` | Main page with sidebar + content | [TBD] |
| 2 | `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` | Content area for selected base | [TBD] |
| 3 | `src/renderer/src/pages/knowledge/components/` | AddKnowledgeBasePopup, EditKnowledgeBasePopup, KnowledgeSearchPopup | [TBD] |
| 4 | `src/renderer/src/pages/knowledge/items/` | Item type renderers | [TBD] |
| 5 | `src/main/services/KnowledgeService.ts` | RAG pipeline: create, add, remove, search, rerank | [TBD] |
| 6 | `src/main/knowledge/` | Embeddings, loaders, preprocessors, reranker | [TBD] |
| 7 | `src/renderer/src/store/knowledge.ts` | Redux slice for knowledge bases (-> Zustand) | [TBD] |
| 8 | `src/renderer/src/hooks/useKnowledge.ts` | Knowledge base hooks | [TBD] |

**[New Stack] Logic-Only Reference**: RAG pipeline logic (KnowledgeService) is stack-independent. Store: Redux -> Zustand. UI: Ant Design -> shadcn/ui.

---

## 3. Source Behavior Inventory

### KnowledgeService (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B210 | create | `(_, base: KnowledgeBaseParams) => Promise<void>` | P1 |
| B211 | add | `(_, options: KnowledgeBaseAddItemOptions) => Promise<LoaderReturn>` | P1 |
| B212 | remove | `(_, {uniqueId, uniqueIds, base}) => Promise<void>` | P1 |
| B213 | search | `(_, {search, base}) => Promise<KnowledgeSearchResult[]>` | P1 |
| B214 | rerank | `(_, {search, base, results}) => Promise<KnowledgeSearchResult[]>` | P2 |
| B215 | delete | `(_, id) => Promise<void>` | P1 |
| B216 | reset | `(_, base) => Promise<void>` | P2 |
| B217 | closeAll | `() => Promise<void>` | P2 |
| B218 | getStorageDir | `() => string` | P3 |

### Knowledge Store (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B219 | addBase | `(base: KnowledgeBase) => void` | P1 |
| B220 | deleteBase | `({baseId}) => void` | P1 |
| B221 | renameBase | `({baseId, name}) => void` | P1 |
| B222 | updateBase | `(base: KnowledgeBase) => void` | P1 |
| B223 | updateBases | `(bases: KnowledgeBase[]) => void` | P2 |
| B224 | addItem | `({baseId, item}) => void` | P1 |
| B225 | removeItem | `({baseId, item}) => void` | P1 |
| B226 | updateItem | `({baseId, item}) => void` | P2 |
| B227 | addFiles | `({baseId, items}) => void` | P2 |
| B228 | updateNotes | `({baseId, item}) => void` | P2 |
| B229 | updateItemProcessingStatus | `({baseId, itemId, status, ...}) => void` | P1 |
| B230 | clearCompletedProcessing | `({baseId}) => void` | P3 |
| B231 | clearAllProcessing | `({baseId}) => void` | P3 |
| B232 | updateBaseItemUniqueId | `({baseId, itemId, uniqueId, uniqueIds}) => void` | P2 |
| B233 | syncPreprocessProvider | `(provider) => void` | P3 |

### KnowledgePage (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B234 | KnowledgePage | `FC` -- main page with draggable sidebar | P1 |
| B235 | handleAddKnowledge | popup flow -> AddKnowledgeBasePopup | P1 |
| B236 | handleEditKnowledgeBase | popup flow -> EditKnowledgeBasePopup | P2 |
| B237 | KnowledgeSearchPopup | search within knowledge base | P2 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| `Dropdown` (context menu) | Ant Design | shadcn/ui DropdownMenu |
| `Empty` | Ant Design | Custom empty state |
| `DraggableList` | Custom (dnd-kit?) | Port with dnd-kit |
| `ListItem` | Custom | Port with Tailwind |
| `PromptPopup` | Custom | shadcn/ui Dialog |
| `Scrollbar` | Custom | Keep/port |
| `styled-components` | styled-components | Tailwind CSS 4 |
| `lucide-react` icons (Book, Plus, Settings) | lucide-react | Keep |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| Drag & drop reorder | Knowledge bases reorderable via DraggableList |
| Context menu | Right-click on base: Rename, Settings, Delete |
| Processing status | Real-time progress updates during document ingestion |
| Directory processing | Progress percentage sent via IPC for directory loader |
| Search shortcut | Keyboard shortcut triggers KnowledgeSearchPopup |
| Add base popup | Modal popup for creating new knowledge base |
| Edit base popup | Modal popup for editing base settings (embedding model, chunk size) |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| `@cherrystudio/embedjs` | KnowledgeService.ts:19 | `@angdu/embedjs` or keep as dependency |
| `@cherrystudio/embedjs-libsql` | KnowledgeService.ts:21 | `@angdu/embedjs-libsql` or keep |
| `@cherrystudio/embedjs-loader-sitemap` | KnowledgeService.ts:22 | Similar |
| `@cherrystudio/embedjs-loader-web` | KnowledgeService.ts:23 | Similar |
| `CherryHQ/cherry-studio` | store/knowledge.ts:13-14 (comments) | Remove/update |

---

## 7. Static Resources

- **Icons**: lucide-react (Book, Plus, Settings, EditIcon, DeleteIcon)
- **No custom images** specific to this feature

---

## 8. Environment Variables

- None directly; embedding model API keys come from provider configuration (F002/F004)

---

## 9. For /speckit.specify

### Summary
Knowledge Base feature provides RAG (Retrieval-Augmented Generation) capabilities. Users create knowledge bases, ingest documents from multiple sources (files, directories, URLs, sitemaps, notes), and attach them to chat sessions for context-aware AI responses. The backend uses LibSQL vector database with concurrent task processing.

### Key Scenarios
- SC-F009-01: User creates a new knowledge base with embedding model config
- SC-F009-02: User adds a file to a knowledge base -> processing with progress
- SC-F009-03: User adds a directory -> batch file processing with percentage
- SC-F009-04: User adds a URL/sitemap for web content ingestion
- SC-F009-05: User searches within a knowledge base
- SC-F009-06: User attaches knowledge base to chat session via popup
- SC-F009-07: AI request includes RAG search results as context

### Draft Functional Requirements
- FR-F009-01: Knowledge base shall support file, directory, URL, sitemap, note, video item types
- FR-F009-02: Document ingestion shall use concurrent task processing with workload management (80MB max, 30 items max)
- FR-F009-03: Search shall return ranked results using vector similarity
- FR-F009-04: Optional reranking shall be available for search results
- FR-F009-05: Preprocessing shall support PDF-specific pre-processing pipeline
- FR-F009-06: Knowledge bases shall be reorderable via drag and drop
- FR-F009-07: Failed deletions shall be retried on next app startup

### Edge Cases
- Large directory ingestion -> workload throttling
- Embedding API failure -> error status per item with retry
- Database lock during concurrent operations
- PDF preprocessing failure -> fallback to original file
- App shutdown during ingestion -> pending tasks lost

---

## 10. For /speckit.plan

### Dependencies
- F001 (Core): IPC, store persistence
- F004 (AI Chat): Embedding model integration, search results injection
- F007 (Files): FileStorage for file path resolution

### Entities Owned
- `KnowledgeBase`: id, name, items[], embedApiClient, dimensions, chunkSize, chunkOverlap, documentCount, preprocessProvider
- `KnowledgeItem`: id, type, content, uniqueId, uniqueIds, processingStatus, processingProgress
- `KnowledgeNotes` (Dexie): note content storage for knowledge items

### Key APIs (IPC)
- `knowledgeBase.create`, `knowledgeBase.add`, `knowledgeBase.remove`
- `knowledgeBase.search`, `knowledgeBase.rerank`
- `knowledgeBase.delete`, `knowledgeBase.reset`
- `knowledgeBase.closeAll`

### Tech Decisions
- Vector DB: LibSQL via `@cherrystudio/embedjs-libsql`
- RAG Framework: `@cherrystudio/embedjs` (RAGApplicationBuilder)
- Loaders: WebLoader, SitemapLoader, NoteLoader, file-type-specific loaders
- Preprocessing: PDF preprocessing via configurable provider
- Storage: `{dataPath}/KnowledgeBase/{sanitizedId}/`
- Concurrency: Workload-based queue (byte-size + item count limits)

---

## 11. Feature Contracts

### Guarantees
- Knowledge base data stored in `{dataPath}/KnowledgeBase/` directory
- Failed deletions tracked in `knowledge_pending_delete.json` for retry on startup
- All DB connections closeable via `closeAll()` for backup/restore

### Dependencies on Other Features
- F001: IPC, store
- F004: Embedding model API access
- F007: File path resolution, file reading

### Failure Modes
- Embedding API unavailable -> processing fails with error status
- LibSQL corruption -> knowledge base unusable, must recreate
- Max workload exceeded -> tasks queued until capacity available
- Preprocessing failure -> error propagated to UI

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F009 <-> F004 (AI Chat): RAG results injected as context in chat completions
- F009 <-> F007 (Files): File metadata and paths from FileStorage
- F009 <-> F010 (Notes): Notes can be added as knowledge items
- F009 <-> F011 (Data Sync): closeAll() called before backup/restore

### Impact Scope
- Knowledge base is a data-intensive feature with background processing
- Embedding model dependency means it only works with configured providers
- @cherrystudio/embedjs packages are forked dependencies needing ownership decision
