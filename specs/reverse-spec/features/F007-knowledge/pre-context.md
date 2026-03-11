# F007-knowledge — Pre-Context

> Feature: Knowledge Base (RAG Pipeline)
> Ring: RG-3 | Tier: T2
> Generated: 2026-03-08

---

## 1. Runtime Exploration Results

### Screen: /#/knowledge — Knowledge Base

**Layout**: Sidebar (knowledge base list) + Content area

**UI Elements**:
- "+ Add" button in sidebar to create new knowledge base
- Knowledge base list in sidebar with name, item count
- Content area shows items within selected knowledge base
- Item tabs: Files, URLs, Notes, Sitemaps, Directories, Videos
- Status icons per item (pending, processing, completed, failed)
- Settings panel: General (name, description, embedding model, dimensions) + Advanced (chunk size, chunk overlap, threshold, rerank model, preprocess provider)
- Search popup for querying the knowledge base
- Edit/delete knowledge base popup

**User Flows**:
| Flow | Steps | Observations |
|------|-------|--------------|
| Create KB | + Add → Name, embedding model, dimensions → Create | Creates LibSQL vector store |
| Add file | Select KB → Files tab → Upload | Processes via loaders, embeds chunks |
| Add URL | Select KB → URLs tab → Enter URL | Fetches and embeds web content |
| Add note | Select KB → Notes tab → Enter text | Embeds note content |
| Add sitemap | Select KB → Sitemaps tab → Enter sitemap URL | Crawls and embeds all URLs |
| Add directory | Select KB → Directories tab → Select folder | Recursively processes files |
| Add video | Select KB → Videos tab → Upload video files | Extracts and embeds transcripts |
| Search KB | Click search → Enter query → View results | Returns ranked chunks with scores |
| Configure reranking | Settings → Advanced → Select rerank model | Reranks search results |
| Configure preprocessing | Settings → Advanced → Select preprocess provider | Doc2x, MinerU, PaddleOCR, etc. |

---

## 2. Source Reference

### Main Process (Electron)

| File | Purpose |
|------|---------|
| `src/main/knowledge/embedjs/embeddings/Embeddings.ts` | Base embeddings abstraction |
| `src/main/knowledge/embedjs/embeddings/EmbeddingsFactory.ts` | Creates embeddings (OpenAI, Ollama, Voyage) |
| `src/main/knowledge/embedjs/embeddings/VoyageEmbeddings.ts` | Voyage AI embeddings impl |
| `src/main/knowledge/embedjs/loader/index.ts` | Loader aggregator (JSON, LocalPath, Text, Web) |
| `src/main/knowledge/embedjs/loader/odLoader.ts` | Office document loader |
| `src/main/knowledge/embedjs/loader/epubLoader.ts` | EPUB file loader |
| `src/main/knowledge/embedjs/loader/noteLoader.ts` | Note content loader |
| `src/main/knowledge/embedjs/loader/draftsExportLoader.ts` | Drafts export loader |
| `src/main/knowledge/reranker/BaseReranker.ts` | Base reranker abstraction |
| `src/main/knowledge/reranker/GeneralReranker.ts` | General-purpose reranker |
| `src/main/knowledge/reranker/Reranker.ts` | Reranker orchestrator |
| `src/main/knowledge/reranker/strategies/StrategyFactory.ts` | Strategy factory for reranking |
| `src/main/knowledge/reranker/strategies/DefaultStrategy.ts` | Default reranking strategy |
| `src/main/knowledge/reranker/strategies/VoyageStrategy.ts` | Voyage AI reranking |
| `src/main/knowledge/reranker/strategies/JinaStrategy.ts` | Jina AI reranking |
| `src/main/knowledge/reranker/strategies/TeiStrategy.ts` | TEI reranking |
| `src/main/knowledge/reranker/strategies/BailianStrategy.ts` | Bailian reranking |
| `src/main/knowledge/reranker/strategies/RerankStrategy.ts` | Strategy interface |
| `src/main/knowledge/reranker/strategies/types.ts` | Reranker type definitions |
| `src/main/knowledge/preprocess/PreprocessProvider.ts` | Preprocess provider interface |
| `src/main/knowledge/preprocess/BasePreprocessProvider.ts` | Base preprocess provider |
| `src/main/knowledge/preprocess/PreprocessProviderFactory.ts` | Factory for preprocess providers |
| `src/main/knowledge/preprocess/PreprocessingService.ts` | Preprocessing orchestration |
| `src/main/knowledge/preprocess/DefaultPreprocessProvider.ts` | Default (no-op) preprocessing |
| `src/main/knowledge/preprocess/Doc2xPreprocessProvider.ts` | Doc2x preprocessing |
| `src/main/knowledge/preprocess/MistralPreprocessProvider.ts` | Mistral preprocessing |
| `src/main/knowledge/preprocess/MineruPreprocessProvider.ts` | MinerU preprocessing |
| `src/main/knowledge/preprocess/OpenMineruPreprocessProvider.ts` | Open MinerU preprocessing |
| `src/main/knowledge/preprocess/PaddleocrPreprocessProvider.ts` | PaddleOCR preprocessing |

### Renderer (React)

| File | Purpose |
|------|---------|
| `src/renderer/src/pages/knowledge/KnowledgePage.tsx` | Main knowledge page |
| `src/renderer/src/pages/knowledge/KnowledgeContent.tsx` | Content area component |
| `src/renderer/src/pages/knowledge/items/KnowledgeFiles.tsx` | File items management |
| `src/renderer/src/pages/knowledge/items/KnowledgeUrls.tsx` | URL items management |
| `src/renderer/src/pages/knowledge/items/KnowledgeNotes.tsx` | Note items management |
| `src/renderer/src/pages/knowledge/items/KnowledgeSitemaps.tsx` | Sitemap items management |
| `src/renderer/src/pages/knowledge/items/KnowledgeDirectories.tsx` | Directory items management |
| `src/renderer/src/pages/knowledge/items/KnowledgeVideos.tsx` | Video items management |
| `src/renderer/src/pages/knowledge/components/AddKnowledgeBasePopup.tsx` | Create KB popup |
| `src/renderer/src/pages/knowledge/components/EditKnowledgeBasePopup.tsx` | Edit KB popup |
| `src/renderer/src/pages/knowledge/components/KnowledgeSearchPopup.tsx` | Search popup |
| `src/renderer/src/pages/knowledge/components/KnowledgeSearchItem/index.tsx` | Search result item |
| `src/renderer/src/pages/knowledge/components/KnowledgeSearchItem/VideoItem.tsx` | Video search result |
| `src/renderer/src/pages/knowledge/components/KnowledgeSearchItem/TextItem.tsx` | Text search result |
| `src/renderer/src/pages/knowledge/components/StatusIcon.tsx` | Processing status icon |
| `src/renderer/src/pages/knowledge/components/KnowledgeSettings/GeneralSettingsPanel.tsx` | General settings |
| `src/renderer/src/pages/knowledge/components/KnowledgeSettings/AdvancedSettingsPanel.tsx` | Advanced settings |
| `src/renderer/src/pages/knowledge/components/KnowledgeSettings/KnowledgeBaseFormModal.tsx` | KB form modal |
| `src/renderer/src/store/knowledge.ts` | Knowledge Redux store |
| `src/renderer/src/store/thunk/knowledgeThunk.ts` | Knowledge async thunks |
| `src/renderer/src/store/preprocess.ts` | Preprocess providers store |
| `src/renderer/src/services/KnowledgeService.ts` | Renderer knowledge service |
| `src/renderer/src/types/knowledge.ts` | Knowledge type definitions |

### Shared / Types

| File | Purpose |
|------|---------|
| `src/renderer/src/types/knowledge.ts` | KnowledgeBase, KnowledgeItem, KnowledgeReference, PreprocessProvider types |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B131 | Create knowledge base with name, embedding model, and dimensions | P1 | Core CRUD |
| B132 | Delete knowledge base and associated vector data | P1 | Cascade delete from LibSQL |
| B133 | Reset knowledge base (clear all embeddings, re-index) | P2 | Admin operation |
| B134 | Add file item to knowledge base (PDF, Office, CSV, text, EPUB) | P1 | Uses loaders to chunk and embed |
| B135 | Add URL item to knowledge base | P1 | WebLoader fetches and embeds |
| B136 | Add note (text) item to knowledge base | P1 | NoteLoader embeds text |
| B137 | Add sitemap item to knowledge base | P2 | Crawls sitemap URLs |
| B138 | Add directory item to knowledge base | P2 | Recursive file processing |
| B139 | Add video item to knowledge base | P3 | Transcript extraction |
| B140 | Remove item from knowledge base (by uniqueId) | P1 | Removes embeddings |
| B141 | Search knowledge base with semantic query | P1 | Vector similarity search |
| B142 | Rerank search results using configurable strategy | P2 | Voyage, Jina, TEI, Bailian, Default |
| B143 | Configure chunk size and chunk overlap | P2 | Per-KB settings |
| B144 | Configure similarity threshold | P2 | Filters low-relevance results |
| B145 | Configure document count (top-K results) | P2 | Limits returned results |
| B146 | Preprocessing via Doc2x provider | P2 | PDF/document parsing |
| B147 | Preprocessing via MinerU provider | P2 | OCR-based document parsing |
| B148 | Preprocessing via Open MinerU provider | P3 | Self-hosted MinerU |
| B149 | Preprocessing via PaddleOCR provider | P3 | OCR preprocessing |
| B150 | Preprocessing via Mistral provider | P3 | LLM-based parsing |
| B151 | Processing status tracking (pending, processing, completed, failed) | P1 | Per-item status |
| B152 | Processing progress percentage display | P2 | Progress indicator |
| B153 | Retry failed processing | P2 | Error recovery |
| B154 | Embedding factory: OpenAI, Ollama, Voyage embeddings | P1 | Multi-provider embeddings |
| B155 | Knowledge base version tracking | P3 | Schema versioning |

---

## 4. UI Component Features

### AntD Components Used (to migrate to shadcn/ui)

| AntD Component | Usage | shadcn/ui Target |
|----------------|-------|------------------|
| `Modal` | Create/Edit KB popup, Search popup, KB Form | `Dialog` |
| `Form` / `Form.Item` | KB settings forms | Form with `react-hook-form` |
| `Input` / `Input.TextArea` | Name, description, URL, note content | `Input` / `Textarea` |
| `Select` | Embedding model, rerank model, preprocess provider | `Select` |
| `InputNumber` | Chunk size, chunk overlap, dimensions, threshold | `Input` (type=number) |
| `Tabs` | Item type tabs (Files, URLs, Notes...) | `Tabs` |
| `Button` | Add, delete, search, settings actions | `Button` |
| `Table` / `List` | Item listings | Custom list or `Table` |
| `Tag` | Processing status badges | `Badge` |
| `Progress` | Processing progress bar | `Progress` |
| `Tooltip` | Icon tooltips | `Tooltip` |
| `Popconfirm` | Delete confirmation | `AlertDialog` |
| `Empty` | No KB found state | Custom empty state |

---

## 5. Naming Remapping

| Original (Cherry) | Target (Angdu) |
|--------------------|----------------|
| `@cherrystudio/embedjs` | `@angdu/embedjs` (or keep as dep) |
| `@cherrystudio/embedjs-interfaces` | `@angdu/embedjs-interfaces` (or keep as dep) |
| `@cherrystudio/embedjs-openai` | `@angdu/embedjs-openai` (or keep as dep) |
| `@cherrystudio/embedjs-ollama` | `@angdu/embedjs-ollama` (or keep as dep) |
| `@cherrystudio/embedjs-loader-web` | `@angdu/embedjs-loader-web` (or keep as dep) |
| `@cherrystudio/embedjs-utils` | `@angdu/embedjs-utils` (or keep as dep) |
| `IpcChannel.KnowledgeBase_*` | `IpcChannel.KnowledgeBase_*` (no change needed) |
| `cherry_painting_models_v3.json` | N/A (not in this feature) |

> **Note**: The `@cherrystudio/embedjs*` packages are forked npm packages. Decision needed: fork under `@angdu` namespace or keep original dependency.

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| Knowledge base icons | Lucide icons (Database, File, Link, etc.) | No custom assets |
| Status icons | `StatusIcon.tsx` component | Inline SVG/icons |

---

## 7. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| Provider API keys (OpenAI, Ollama, Voyage) | Embedding generation | Yes (per provider) |
| Doc2x API key | Doc2x preprocessing | Optional |
| Doc2x API host | Doc2x endpoint (`https://v2.doc2x.noedgeai.com`) | Optional |
| MinerU API key | MinerU preprocessing | Optional |
| MinerU API host | MinerU endpoint (`https://mineru.net`) | Optional |
| Open MinerU API host | Self-hosted MinerU endpoint | Optional |
| PaddleOCR API URL | PaddleOCR endpoint | Optional |
| PaddleOCR access token | PaddleOCR auth | Optional |
| Jina API key | Jina reranking | Optional |
| Voyage API key | Voyage reranking/embeddings | Optional |

---

## 8. For /speckit.specify

### Summary
Knowledge Base feature provides a RAG (Retrieval-Augmented Generation) pipeline that allows users to create knowledge bases, ingest documents from multiple sources (files, URLs, notes, sitemaps, directories, videos), generate embeddings via configurable providers, store vectors in LibSQL, and retrieve semantically relevant chunks with optional reranking.

### Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-070 | User creates a new knowledge base with embedding model | B131 |
| SC-071 | User adds a PDF file and it processes through chunking/embedding | B134, B151, B152, B154 |
| SC-072 | User adds a URL and content is fetched and embedded | B135, B151 |
| SC-073 | User searches knowledge base and gets ranked results | B141, B142, B144, B145 |
| SC-074 | User configures preprocessing provider for complex documents | B146, B147, B148, B149, B150 |
| SC-075 | Processing fails and user retries | B151, B153 |
| SC-076 | User deletes a knowledge base | B132 |
| SC-077 | User removes individual items from knowledge base | B140 |
| SC-078 | User adds sitemap and all pages are crawled | B137 |
| SC-079 | User configures chunk size and overlap | B143 |

### Draft Functional Requirements

| FR-ID | Requirement |
|-------|-------------|
| FR-070 | The system shall allow creating knowledge bases with a name, embedding model, and optional dimensions |
| FR-071 | The system shall support ingesting files (PDF, Office, CSV, text, EPUB), URLs, notes, sitemaps, directories, and videos |
| FR-072 | The system shall chunk documents using configurable chunk size and overlap |
| FR-073 | The system shall generate embeddings via OpenAI-compatible, Ollama, or Voyage providers |
| FR-074 | The system shall store embeddings in LibSQL vector storage |
| FR-075 | The system shall perform semantic search with configurable similarity threshold and top-K |
| FR-076 | The system shall support reranking via Voyage, Jina, TEI, Bailian, or default strategies |
| FR-077 | The system shall support document preprocessing via Doc2x, MinerU, Open MinerU, PaddleOCR, or Mistral |
| FR-078 | The system shall track processing status per item (pending, processing, completed, failed) |
| FR-079 | The system shall support retry of failed processing |

---

## 9. For /speckit.plan

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| F001-app-core | Hard | Electron shell, IPC infrastructure |
| F003-provider | Hard | Embedding model providers, API clients |
| F005-chat-ui | Soft | Knowledge base attachment in chat input toolbar |
| `@cherrystudio/embedjs` (fork) | NPM | Core RAG library |
| `@cherrystudio/embedjs-interfaces` | NPM | Loader/embeddings interfaces |
| `@cherrystudio/embedjs-openai` | NPM | OpenAI embeddings |
| `@cherrystudio/embedjs-ollama` | NPM | Ollama embeddings |
| `@cherrystudio/embedjs-loader-web` | NPM | Web content loader |
| `@cherrystudio/embedjs-utils` | NPM | Utility functions |
| `libsql` / `@libsql/client` | NPM | Vector storage backend |

### Contracts

| Contract | Direction | Consumers |
|----------|-----------|-----------|
| `IpcChannel.KnowledgeBase_Create` | main ← renderer | KnowledgePage |
| `IpcChannel.KnowledgeBase_Delete` | main ← renderer | KnowledgePage |
| `IpcChannel.KnowledgeBase_Reset` | main ← renderer | KnowledgePage |
| `IpcChannel.KnowledgeBase_Add` | main ← renderer | KnowledgeFiles/URLs/Notes/etc. |
| `IpcChannel.KnowledgeBase_Remove` | main ← renderer | KnowledgeContent |
| `IpcChannel.KnowledgeBase_Search` | main ← renderer | KnowledgeSearchPopup, chat message flow |
| `IpcChannel.KnowledgeBase_Rerank` | main ← renderer | KnowledgeSearchPopup, chat message flow |
| `KnowledgeBase` entity | store | Redux → Zustand migration |
| `KnowledgeItem` entity | store | Redux → Zustand migration |
| `KnowledgeReference` | runtime | Returned in ExternalToolResult for chat |

---

## 10. For /speckit.analyze

### Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| Knowledge base selector in chat input toolbar | F007 ↔ F005-chat-ui | Verify toolbar integration |
| Knowledge references in message display | F007 ↔ F005-chat-ui | KnowledgeReference in ExternalToolResult |
| Embedding model from provider config | F007 ↔ F003-provider | ApiClient construction |
| Rerank model from provider config | F007 ↔ F003-provider | ApiClient construction |
| Knowledge base settings in global settings | F007 ↔ F002-settings | Settings page section |
| Preprocess provider store (preprocess.ts) | F007 ↔ F002-settings | Preprocess provider configuration |
| Memory items can be added to knowledge base | F007 ↔ F008-memory | KnowledgeItemType includes 'memory' |
| `@cherrystudio/embedjs*` package rename | F007 | Decision: fork under @angdu or keep |
| LibSQL vector storage initialization | F007 ↔ F001-app-core | Data directory setup |
