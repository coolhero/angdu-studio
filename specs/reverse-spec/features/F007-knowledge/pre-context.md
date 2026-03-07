# Pre-Context: Knowledge Base

**Feature ID**: F007-knowledge
**Tier**: Tier 2
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/KnowledgeService.ts` | Knowledge base CRUD, search, embedding orchestration |
| `src/main/knowledge/embedjs/` | Embedding generation integration (embedjs library wrappers) |
| `src/main/knowledge/preprocess/` | Document preprocessing strategies (chunking, splitting) |
| `src/main/knowledge/reranker/` | Reranking strategies for search result relevance |
| `src/renderer/src/hooks/useKnowledge*.ts` | React hooks for knowledge base state access |
| `src/renderer/src/services/KnowledgeService.ts` | Renderer-side knowledge service (IPC wrapper) |
| `src/renderer/src/store/knowledge.ts` | Knowledge store (Redux slice -> Zustand) |
| `src/renderer/src/pages/knowledge/` | Knowledge base UI pages |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **knowledge base CRUD lifecycle, RAG pipeline (document ingestion -> preprocessing -> chunking -> embedding -> vector storage -> search -> reranking), embedding generation via provider APIs, vector similarity search, reranking strategies (cross-encoder, cohere, etc.), preprocessing strategies (text splitting, recursive character splitting, markdown splitting), workload management for batch operations, knowledge context injection into chat messages, document content extraction**
- Do not reference: Redux slice patterns in knowledge store (migrating to Zustand), Ant Design components in knowledge pages (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only)
- **Extract**: RAG pipeline orchestration, preprocessing strategy selection and configuration, chunking parameters (chunk size, overlap), embedding model selection and batch processing, vector store initialization and search queries, reranking model selection and scoring, knowledge context injection format, workload queue management for large document sets, document type detection and content extraction
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Table` / `Modal` / `Upload` / `Progress` / `Card` components, styled-components wrappers

### Naming Remapping

| Original | Angdu Equivalent | Scope |
|----------|-----------------|-------|
| `@cherrystudio/embedjs-*` | `@angdu/embedjs-*` | Package name prefix |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Knowledge base has no static resources; all data is user-generated at runtime |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F007) | | | API keys for embeddings come from provider config | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-app-core | Log level for main process knowledge service operations |

---

## SBI Coverage

**SBI Range**: B211-B250

| SBI ID | Priority | Description |
|--------|----------|-------------|
| B211 | P1 | KnowledgeService.create -- create new knowledge base with config (name, embedding model, chunk params) |
| B212 | P1 | KnowledgeService.search -- vector similarity search with optional reranking |
| B213 | P1 | KnowledgeService.addItem -- add document to knowledge base (preprocess, embed, store) |
| B214 | P1 | KnowledgeService.removeItem -- remove document and its vectors from knowledge base |
| B215 | P2 | KnowledgeService.reset -- clear all vectors and re-embed all documents |
| B216 | P2 | Preprocessing: text splitter -- split plain text by separators |
| B217 | P2 | Preprocessing: recursive character splitter -- hierarchical splitting by character types |
| B218 | P2 | Preprocessing: markdown splitter -- split by markdown headings and sections |
| B219 | P2 | Preprocessing: code splitter -- split by language-aware syntax boundaries |
| B220 | P2 | Preprocessing: token splitter -- split by token count for model compatibility |
| B221 | P2 | Preprocessing: sentence splitter -- split by sentence boundaries |
| B222 | P2 | Reranking: cross-encoder -- local cross-encoder model scoring |
| B223 | P2 | Reranking: cohere -- Cohere rerank API integration |
| B224 | P2 | Reranking: jina -- Jina rerank API integration |
| B225 | P2 | Reranking: bge -- BGE rerank model integration |
| B226 | P2 | Reranking: none -- bypass reranking, return raw vector search results |
| B227 | P2 | Workload management -- queue and batch embedding generation for large document sets |
| B228 | P1 | Embedding generation -- generate vector embeddings via configured provider API |
| B229 | P1 | Vector search -- similarity search against stored vectors with score threshold |
| B230 | P1 | injectKnowledgeContext -- inject retrieved knowledge chunks into chat message context |
| B231-B250 | P2-P3 | Additional knowledge behaviors: chunk size/overlap configuration, embedding model selection per KB, vector store persistence, document type detection, PDF/DOCX/TXT content extraction, knowledge base listing and metadata, progress tracking for bulk operations, concurrent embedding limits, error recovery for failed embeddings, knowledge base export/import, search result formatting, relevance score normalization, duplicate document detection, knowledge base statistics |

---

## UI Component Features

> Knowledge base pages use Ant Design extensively; all need shadcn/ui equivalents.

| Ant Design Component | Usage in Knowledge Pages | shadcn/ui Equivalent |
|----------------------|--------------------------|---------------------|
| `Table` | Knowledge base list, document list | `DataTable` (TanStack Table + shadcn) |
| `Modal` | Create/edit knowledge base dialog | `Dialog` |
| `Upload` | Document upload with drag-and-drop | `Input[type=file]` + custom dropzone |
| `Progress` | Embedding progress indicator | `Progress` |
| `Card` | Knowledge base summary cards | `Card` |
| `Button` | Action buttons throughout | `Button` |
| `Input` | Search input, name fields | `Input` |
| `Select` | Embedding model selection, splitter selection | `Select` |
| `Slider` | Chunk size, overlap configuration | `Slider` |
| `Tabs` | Knowledge base detail sections | `Tabs` |
| `Empty` | No documents placeholder | Custom empty state |
| `Spin` | Loading states | `Skeleton` or spinner |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F007-knowledge implements a complete RAG (Retrieval-Augmented Generation) pipeline for knowledge base management. It provides knowledge base CRUD operations, document ingestion with multiple preprocessing strategies (text, recursive character, markdown, code, token, and sentence splitting), embedding generation via configurable provider APIs with batch processing and workload management, vector storage and similarity search, multiple reranking strategies (cross-encoder, Cohere, Jina, BGE), and knowledge context injection into chat messages. The system supports various document types (PDF, DOCX, TXT, Markdown, code files) with content extraction and configurable chunking parameters.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create knowledge base | User creates a new knowledge base, selects embedding model, configures chunk parameters |
| P1 | Add documents | User uploads documents; system extracts content, preprocesses, generates embeddings, stores vectors |
| P1 | Knowledge-augmented chat | During chat with knowledge base attached, system searches relevant chunks, injects context into prompt |
| P1 | Search knowledge base | User or system searches knowledge base; vector similarity search returns ranked results |
| P2 | Configure preprocessing | User selects splitting strategy and chunk size/overlap for document processing |
| P2 | Configure reranking | User selects reranking strategy to improve search result relevance |
| P2 | Remove documents | User removes a document; associated vectors are cleaned up |
| P2 | Reset knowledge base | User resets a knowledge base; all vectors cleared and documents re-embedded |
| P3 | Bulk document upload | User uploads many documents; workload manager queues and processes in batches |
| P3 | Progress tracking | User sees embedding progress for large document sets |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Knowledge base CRUD (create with config, list, update metadata, delete with cleanup)
- **FR-002**: Document ingestion pipeline (upload -> extract -> preprocess -> embed -> store)
- **FR-003**: 6 preprocessing strategies (text, recursive character, markdown, code, token, sentence splitting)
- **FR-004**: Configurable chunk parameters (chunk size, overlap)
- **FR-005**: Embedding generation via provider API with batch processing
- **FR-006**: Vector storage and similarity search with score threshold
- **FR-007**: 5 reranking strategies (cross-encoder, Cohere, Jina, BGE, none)
- **FR-008**: Knowledge context injection into chat messages (injectKnowledgeContext)
- **FR-009**: Workload management for batch embedding operations
- **FR-010**: Document content extraction (PDF, DOCX, TXT, Markdown, code)
- **FR-011**: Knowledge base reset and re-embedding

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Knowledge base creation completes with valid configuration within 2 seconds
- **SC-002**: Document embedding completes for a 10-page PDF within 30 seconds
- **SC-003**: Vector search returns relevant results within 500ms for bases with up to 10,000 chunks
- **SC-004**: Reranking improves relevance scores compared to raw vector search
- **SC-005**: Knowledge context injection produces correctly formatted prompt context
- **SC-006**: Document removal cleans up all associated vectors without affecting other documents
- **SC-007**: Workload manager handles 100+ documents without memory exhaustion

### Edge Cases

- Very large documents (>100 pages); chunking must handle without memory exhaustion
- Embedding API rate limits; workload manager must respect rate limits with backoff
- Unsupported document type; clear error message, skip gracefully
- Empty document after extraction; skip with warning
- Knowledge base with zero documents; search returns empty gracefully
- Concurrent add and search operations; vector store consistency
- Embedding model change after documents already embedded; requires full re-embedding
- Network failure during embedding API call; retry with queue persistence
- Document with mixed languages; splitter must handle unicode correctly
- Very small chunks (< 10 tokens); warning about low quality results

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework, file system access for document storage, config persistence |
| F002-ai-provider | Integration | Uses provider APIs for embedding generation (OpenAI, etc.) |
| F008-file-management | Data | Uses file storage for uploaded documents, content extraction |

### Related Entities (data-model.md draft)

#### Owned Entities

**KnowledgeBase** -- Knowledge base configuration and metadata

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique knowledge base identifier |
| name | string | required | Display name |
| description | string | optional | Knowledge base description |
| embeddingModel | string | required | Embedding model identifier |
| embeddingProvider | string | required | Provider for embedding API |
| chunkSize | number | default 500 | Characters per chunk |
| chunkOverlap | number | default 50 | Overlap between chunks |
| splitterType | string | default 'recursive' | Preprocessing strategy |
| rerankModel | string | optional | Reranking model identifier |
| rerankProvider | string | optional | Provider for reranking API |
| documentCount | number | computed | Number of documents in base |
| created_at | number | required | Creation timestamp |
| updated_at | number | required | Last update timestamp |

**KnowledgeItem** -- Document within a knowledge base

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique item identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase | Parent knowledge base |
| fileId | string | FK -> FileMetadata | Source file reference |
| fileName | string | required | Original file name |
| status | string | enum | `pending`, `processing`, `completed`, `failed` |
| chunkCount | number | computed | Number of chunks generated |
| created_at | number | required | Creation timestamp |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| FileMetadata | F008-file-management | Read | Reference uploaded document files |
| Provider | F002-ai-provider | Read | Determine embedding and reranking API endpoints |
| Model | F002-ai-provider | Read | Select embedding and reranking models |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `knowledge:create` | Create new knowledge base |
| IPC | `knowledge:delete` | Delete knowledge base and all vectors |
| IPC | `knowledge:list` | List all knowledge bases |
| IPC | `knowledge:add-item` | Add document to knowledge base |
| IPC | `knowledge:remove-item` | Remove document from knowledge base |
| IPC | `knowledge:search` | Search knowledge base by query |
| IPC | `knowledge:reset` | Reset and re-embed knowledge base |
| Hook | `useKnowledge()` | React hook for knowledge base operations |
| Zustand | `useKnowledgeStore` | Knowledge state management |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `config:*` | F001-app-core | Config persistence for knowledge base settings |
| IPC | `file:*` | F008-file-management | File upload, read, content extraction for documents |
| IPC | `provider:*` | F002-ai-provider | Embedding and reranking API calls via provider |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Knowledge base management has both main process logic (KnowledgeService, embedding generation, vector storage, preprocessing, reranking) and renderer-side state/UI (Redux knowledge slice, knowledge pages with Ant Design). The RAG pipeline runs entirely in the main process. Renderer-side manages knowledge base listing, document upload UI, and search interface.
- **Recommended implementation approach**: Keep ALL main process logic intact (KnowledgeService, embedjs wrappers, preprocessors, rerankers). Replace Redux knowledge slice with Zustand store. Replace Ant Design components in knowledge pages with shadcn/ui equivalents. Rename `@cherrystudio/embedjs-*` packages to `@angdu/embedjs-*`.
- **Caveats**: The embedjs package renaming requires updating package.json references and import paths. Vector store persistence format must remain compatible. Embedding model configuration depends on F002-ai-provider being available.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Knowledge context injection | F002-ai-provider | Verify F002's chat completion correctly includes injected knowledge context from F007 |
| Document file access | F008-file-management | Verify F007 correctly reads uploaded document files through F008's file storage API |
| Embedding API access | F002-ai-provider | Verify F007 can call embedding APIs through F002's provider infrastructure |
| Knowledge base settings | F009-settings-ui | Verify F009 correctly displays knowledge base configuration options |
| IPC channel registration | F001-app-core | Verify F007's knowledge:* IPC channels are registered in F001's IPC handler |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F002-ai-provider | Context injection change | If injectKnowledgeContext format changes, F002's prompt construction needs modification |
| F008-file-management | File access pattern | If document storage requirements change, F008's file management may need updates |
| F009-settings-ui | Entity change impact | If KnowledgeBase configuration schema changes, F009's knowledge settings need modification |
