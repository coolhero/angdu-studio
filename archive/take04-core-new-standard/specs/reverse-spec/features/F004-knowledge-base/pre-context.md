# Pre-Context: Knowledge Base

**Feature ID**: F004-knowledge-base
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/KnowledgeService.ts` | RAG pipeline, queue management |
| `src/renderer/src/hooks/useKnowledge.ts` | Knowledge hooks |
| `src/renderer/src/pages/knowledge/` | Knowledge UI |
| `src/renderer/src/store/knowledge.ts` | Knowledge store |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **RAG pipeline architecture, queue-based processing with backpressure (max 30 concurrent, 80MB workload), workload estimation per item type, document preprocessing (PDF-only via configurable provider with caching), chunking with configurable size/overlap, embedding via configurable model, vector search with configurable result count, optional reranking, deferred deletion with persistent pending file and startup retry, item refresh logic, migration (timestamped copy, deep-clone config, re-add items), and file cleanup on item removal**
- Do not reference: Redux slice patterns in `knowledge.ts` (migrating to Zustand), Ant Design components in knowledge base UI (migrating to shadcn/ui + Radix), styled-components in KB pages (migrating to Tailwind-only)
- **Extract**: RAG pipeline architecture (preprocess -> chunk -> embed -> store -> search -> rerank), queue management with backpressure (max 30 concurrent, 80MB workload cap), workload estimation (file=size, URL=2MB, sitemap=20MB, note=bytes), preprocessing logic (PDF-only via configurable provider with caching), chunking parameters (default size 1000, overlap 200), embedding model integration, vector search (default 30 results), reranking with dedicated model, deferred deletion pattern (persistent pending file, startup retry), item refresh flow (block if pending/processing, remove loader, reset, re-queue), migration flow (timestamped copy, deep-clone config, re-add items), file cleanup rules (file->delete stored, video->delete SRT+video)
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design `Table` / `Modal` / `Upload` components, styled-components wrappers

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
| (none specific to F004) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-core-platform | Log level for main process knowledge service operations |
| `CSLOGGER_RENDERER_LEVEL` | F001-core-platform | Log level for renderer-side knowledge operations |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F004-knowledge-base implements a RAG (Retrieval-Augmented Generation) pipeline with queue-based processing, embedding-based vector search, document preprocessing, and optional reranking. It manages knowledge bases and their items (file, URL, sitemap, note, directory), preprocesses documents (PDF-only via configurable provider with caching), chunks with configurable size (default 1000) and overlap (default 200), generates embeddings via configurable model, stores vectors for semantic search (default 30 results), and supports optional reranking with a dedicated model. Queue management enforces backpressure (max 30 concurrent, 80MB workload cap) with workload estimation per item type. It implements deferred deletion with persistent pending file and startup retry, item refresh with blocking and re-queue, migration with timestamped copy and deep-clone, and file cleanup on item removal.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create knowledge base | User creates a new knowledge base, selects an embedding model, and configures chunking parameters (size, overlap) |
| P1 | Add items | User adds items to a knowledge base (file, URL, sitemap, note, or directory); items are queued for preprocessing, chunking, and embedding with backpressure control |
| P1 | Knowledge search | During chat, system searches relevant knowledge bases with vector search (default 30 results) and optional reranking, then injects results into the AI context |
| P2 | Queue management | System manages processing queue with backpressure (max 30 concurrent, 80MB workload), estimating workload per item type |
| P2 | Item refresh | User triggers item refresh; system blocks if pending/processing, removes loader, resets, and re-queues for reprocessing |
| P2 | PDF preprocessing | System preprocesses PDF documents via configurable provider with caching for efficient re-use |
| P2 | Reranking | Search results are reranked using a dedicated reranker model to improve relevance before injection |
| P3 | Knowledge base migration | User migrates a knowledge base; system creates timestamped copy, deep-clones config, and re-adds items |
| P3 | Deferred deletion | System handles deletion with persistent pending file and retries incomplete deletions on startup |
| P3 | File cleanup | On item removal, system cleans up associated files (stored files deleted, video items delete SRT+video) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Knowledge base CRUD (create, reset, delete with cascade cleanup)
- **FR-002**: Knowledge item types (file, URL, sitemap, note, directory)
- **FR-003**: Queue-based processing with backpressure (max 30 concurrent, 80MB workload)
- **FR-004**: Workload estimation per item type (file=size, URL=2MB, sitemap=20MB, note=bytes)
- **FR-005**: Document preprocessing (PDF-only via configurable provider, with caching)
- **FR-006**: Chunking with configurable size (default 1000) and overlap (default 200)
- **FR-007**: Embedding via configurable model
- **FR-008**: Vector search with configurable result count (default 30)
- **FR-009**: Optional reranking with dedicated model
- **FR-010**: Deferred deletion with persistent pending file and startup retry
- **FR-011**: Item refresh (block if pending/processing, remove loader, reset, re-queue)
- **FR-012**: Migration (timestamped copy, deep-clone config, re-add items)
- **FR-013**: File cleanup on item removal (file->delete stored, video->delete SRT+video)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Knowledge base creation with embedding model selection completes without errors
- **SC-002**: Document upload, preprocessing, chunking, and embedding pipeline completes for PDF files up to 50MB
- **SC-003**: Semantic search returns relevant results within 2 seconds for knowledge bases with up to 10,000 chunks
- **SC-004**: Queue backpressure correctly limits concurrent processing to 30 items and 80MB workload
- **SC-005**: Knowledge references in chat correctly link back to source documents
- **SC-006**: Deferred deletion completes cleanup on next startup for items that failed mid-deletion

### Edge Cases

- PDF with scanned images (no extractable text) handled gracefully via configurable preprocessing provider
- Embedding model change requires full re-embedding of all items
- Large document chunking produces thousands of chunks; queue backpressure prevents overload
- Network failure during embedding generation; partial progress managed by queue system
- Knowledge base deletion with items still in processing queue
- Concurrent searches on the same knowledge base do not interfere
- Empty knowledge base search returns graceful empty result
- Deferred deletion pending file persists across crashes and is retried on startup
- Sitemap workload estimation (20MB) accounts for multiple URLs within the sitemap
- Directory item type recursively discovers and processes contained files

### Business Rules

BR-001 through BR-010, BR-095 through BR-099, BR-103 (13 total business rules). Key rules include:
- Queue backpressure: max 30 concurrent items, 80MB total workload cap
- Workload estimation: file=actual size, URL=2MB fixed, sitemap=20MB fixed, note=byte count
- Chunking defaults: size 1000, overlap 200
- Vector search default: 30 results
- PDF preprocessing: configurable provider, cached results
- Deferred deletion: persistent pending file, startup retry
- Item refresh: blocked if pending/processing state
- File cleanup: file items delete stored file, video items delete SRT+video

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process communication, file:* channels for document upload and storage |
| F002-provider-management | Entity | Needs Provider and Model entities for embedding model selection and API access |

### Related Entities (data-model.md draft)

#### Owned Entities

**KnowledgeBase** (15 fields) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique knowledge base identifier |
| name | string | required | Display name |
| model | object | required | Embedding model configuration (provider + model ID) |
| items | KnowledgeItem[] | required | Documents/items in this knowledge base |
| chunkSize | number | optional | Document chunking size (default 1000) |
| chunkOverlap | number | optional | Chunk overlap (default 200) |
| searchResultCount | number | optional | Vector search result count (default 30) |
| rerankerModel | object | optional | Dedicated reranker model configuration |
| preprocessProvider | object | optional | Configurable PDF preprocessing provider |
| created_at | number | required | Creation timestamp |
| updated_at | number | required | Last update timestamp |

**KnowledgeItem** (union with 7 types) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique item identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase | Owning knowledge base ID |
| type | string | required | Content type (file, url, sitemap, note, directory) |
| name | string | required | Item display name |
| content | string | optional | Raw text content (for note type) |
| fileId | string | optional | FK -> FileMetadata for uploaded files |
| status | string | required | Processing status (pending, processing, completed, error) |
| chunkCount | number | optional | Number of chunks generated |
| workloadEstimate | number | optional | Estimated workload in bytes |
| created_at | number | required | Creation timestamp |

**KnowledgeReference** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique reference identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase | Source knowledge base |
| itemId | string | FK -> KnowledgeItem | Source item |
| content | string | required | Retrieved chunk text |
| score | number | required | Similarity/relevance score |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read (provider config) | Embedding model provider access for vector generation |
| Model | F002-provider-management | Read (model config) | Embedding model selection and capability check (embedding, rerank flags) |
| FileMetadata | F001-core-platform | FK (fileId) | Uploaded document file references |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `knowledge-base:*` | Knowledge base CRUD, search, add items, delete items, refresh, migrate |
| Zustand | `useKnowledgeStore` | Knowledge base state management |
| Service | `KnowledgeService.search()` | Semantic search across knowledge bases with optional reranking |
| Service | `KnowledgeService.addItem()` | Add and preprocess a document/URL/note to a knowledge base (queued) |
| Hook | `useKnowledge()` | React hook for knowledge base state access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `file:*` | F001-core-platform | File upload and storage for documents |
| Zustand | `useProviderStore` | F002-provider-management | Read provider configs for embedding model access |
| IPC | `config:*` | F001-core-platform | Configuration persistence for KB settings |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Knowledge base system spans main process (RAG pipeline, queue management, embedding, vector storage, preprocessing, reranking) and renderer (CRUD, search orchestration, state). Main process KnowledgeService manages the full RAG pipeline with queue-based processing (max 30 concurrent, 80MB workload), workload estimation, deferred deletion, and startup retry. Preprocessing handles PDF via configurable provider with caching. Chunking uses configurable size/overlap. Vector search returns configurable result count with optional reranking.
- **Recommended implementation approach**: Replace Redux `knowledge` slice with Zustand store(s). Replace Ant Design Table/Modal/Upload components with shadcn/ui equivalents. Keep all main process logic (RAG pipeline, queue management, embedding, vector search, preprocessing, reranking, deferred deletion) intact as it is stack-independent.
- **Caveats**: Knowledge base UI includes file upload, progress indicators, queue status, and table views that are heavily Ant Design-dependent. The main process knowledge service and entire RAG pipeline are entirely stack-independent. Queue backpressure logic and deferred deletion are critical correctness areas that should be tested thoroughly.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Knowledge injection | F005-ai-chat | Verify F005 correctly calls KnowledgeService.search() during chat and injects results into AI context |
| Embedding model access | F002-provider-management | Verify F004 can read embedding-capable models from F002's provider/model store |
| File storage for documents | F001-core-platform | Verify F004 correctly uses file:* IPC channels for document upload and FileMetadata referencing |
| KnowledgeBase reference | F005-ai-chat | Verify F005's Assistant entity correctly references KnowledgeBase IDs for RAG activation |
| Reranker model access | F002-provider-management | Verify F004 can read rerank-capable models from F002's provider/model store |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If knowledge search API or result format changes, F005's knowledge injection pipeline needs modification |
| F005-ai-chat | Entity change impact | If KnowledgeReference schema changes, F005's display of knowledge citations needs modification |
| F011-memory-system | Infrastructure impact | If embedding infrastructure changes, F011's memory embedding (which reuses KB infra) needs modification |
