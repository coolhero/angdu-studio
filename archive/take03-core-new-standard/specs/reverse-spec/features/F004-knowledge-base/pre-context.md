# Pre-Context: Knowledge Base

**Feature ID**: F004-knowledge-base
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/services/KnowledgeService.ts` | Renderer-side knowledge base service (CRUD, search orchestration) |
| `src/renderer/src/store/knowledge.ts` | Knowledge base Redux slice (source reference for state shape) |
| `src/renderer/src/store/thunk/knowledgeThunk.ts` | Knowledge base async thunks (source reference for async operations) |
| `src/renderer/src/types/knowledge.ts` | Knowledge base type definitions (KnowledgeBase, KnowledgeItem, KnowledgeReference) |
| `src/main/services/KnowledgeService.ts` | Main process knowledge service (vector DB operations, embedding) |
| `src/main/knowledge/` | All knowledge subdirectories |
| `src/main/knowledge/embedjs/` | Embedding.js integration for vector operations |
| `src/main/knowledge/preprocess/` | Document preprocessing (PDF parsing, text extraction) |
| `src/main/knowledge/reranker/` | Reranking service for search result relevance |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **vector search pipeline, embedding integration, document preprocessing logic, reranking algorithms, knowledge injection into chat context, and KB CRUD operations**
- Do not reference: Redux slice patterns in `knowledge.ts` and `knowledgeThunk.ts` (migrating to Zustand), Ant Design components in knowledge base UI (migrating to shadcn/ui + Radix), styled-components in KB pages (migrating to Tailwind-only)
- **Extract**: Vector search pipeline architecture, embedding model selection logic, document preprocessing stages (PDF/text/URL), reranker integration pattern, multi-question search strategy, knowledge reference linking to chat messages, KB item lifecycle (add/update/delete/re-embed)
- **Ignore**: Redux `createAsyncThunk` patterns, `useSelector`/`useDispatch` for knowledge state, Ant Design `Table`/`Modal`/`Upload` components, styled-components wrappers

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

F004-knowledge-base implements a RAG (Retrieval-Augmented Generation) pipeline with embedding-based vector search, document preprocessing, and reranking. It manages knowledge bases and their items (documents, URLs, text snippets), preprocesses documents (PDF parsing, text extraction), generates embeddings via configured AI providers, stores vectors for semantic search, and supports reranking for improved search result relevance. It provides knowledge injection into chat context via multi-question search strategies and maintains knowledge references linking search results back to source documents.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create knowledge base | User creates a new knowledge base, selects an embedding model, and configures chunking parameters |
| P1 | Add documents | User uploads PDF, text, or URL documents to a knowledge base; documents are preprocessed, chunked, and embedded |
| P1 | Knowledge search | During chat, system searches relevant knowledge bases, retrieves matching chunks, and injects them into the AI context |
| P2 | Reranking | Search results are reranked using a reranker model to improve relevance before injection |
| P2 | Multi-question search | System generates multiple search queries from a single user question to improve recall |
| P2 | Re-embed documents | User triggers re-embedding when switching embedding models or after content updates |
| P3 | Knowledge item management | User views, updates, or deletes individual knowledge items within a knowledge base |
| P3 | Preprocessing configuration | User configures document preprocessing options (chunk size, overlap, PDF parsing method) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Knowledge base CRUD (create, read, update, delete) with embedding model selection
- **FR-002**: Vector search pipeline with embedding generation, storage, and semantic similarity search
- **FR-003**: Document preprocessing supporting PDF, text, and URL content types
- **FR-004**: Reranking service for search result relevance improvement
- **FR-005**: Multi-question search strategy for improved recall
- **FR-006**: Knowledge injection into chat context with source references

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Knowledge base creation with embedding model selection completes without errors
- **SC-002**: Document upload, preprocessing, and embedding pipeline completes for PDF files up to 50MB
- **SC-003**: Semantic search returns relevant results within 2 seconds for knowledge bases with up to 10,000 items
- **SC-004**: Reranked results show measurably improved relevance compared to raw vector search
- **SC-005**: Knowledge references in chat correctly link back to source documents

### Edge Cases

- PDF with scanned images (no extractable text) handled gracefully
- Embedding model change requires full re-embedding of all items
- Large document chunking produces thousands of items; pagination needed
- Network failure during embedding generation; partial progress saved
- Knowledge base deletion cleans up all vector storage data
- Concurrent searches on the same knowledge base do not interfere
- Empty knowledge base search returns graceful empty result

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for main process communication, file:* channels for document upload |
| F002-provider-management | Entity | Needs Provider and Model entities for embedding model selection and API access |

### Related Entities (data-model.md draft)

#### Owned Entities

**KnowledgeBase** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique knowledge base identifier |
| name | string | required | Display name |
| model | object | required | Embedding model configuration (provider + model ID) |
| items | KnowledgeItem[] | required | Documents/items in this knowledge base |
| chunkSize | number | optional | Document chunking size in tokens |
| chunkOverlap | number | optional | Chunk overlap in tokens |
| created_at | number | required | Creation timestamp |
| updated_at | number | required | Last update timestamp |

**KnowledgeItem** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique item identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase | Owning knowledge base ID |
| type | string | required | Content type (pdf, text, url) |
| name | string | required | Item display name |
| content | string | optional | Raw text content |
| fileId | string | optional | FK -> FileMetadata for uploaded files |
| status | string | required | Processing status (pending, processing, completed, error) |
| chunkCount | number | optional | Number of chunks generated |
| created_at | number | required | Creation timestamp |

**KnowledgeReference** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique reference identifier |
| knowledgeBaseId | string | FK -> KnowledgeBase | Source knowledge base |
| itemId | string | FK -> KnowledgeItem | Source item |
| content | string | required | Retrieved chunk text |
| score | number | required | Similarity/relevance score |

**PreprocessProvider** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| type | string | PK | Preprocessing type identifier |
| handler | function | required | Preprocessing handler function |
| supportedFormats | string[] | required | Supported file formats |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read (provider config) | Embedding model provider access for vector generation |
| Model | F002-provider-management | Read (model config) | Embedding model selection and capability check |
| FileMetadata | F001-core-platform | FK (fileId) | Uploaded document file references |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `knowledge-base:*` | Knowledge base CRUD, search, add items, delete items |
| Zustand | `useKnowledgeStore` | Knowledge base state management |
| Service | `KnowledgeService.search()` | Semantic search across knowledge bases |
| Service | `KnowledgeService.addItem()` | Add and preprocess a document/URL to a knowledge base |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `file:*` | F001-core-platform | File upload and storage for documents |
| Zustand | `useProviderStore` | F002-provider-management | Read provider configs for embedding model access |
| IPC | `config:*` | F001-core-platform | Configuration persistence for KB settings |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Knowledge base system spans main process (vector operations, embedding, preprocessing) and renderer (CRUD, search orchestration, state). Main process uses embedjs for vector storage and search. Preprocessing handles PDF, text, URL content. Reranker improves search result relevance. Multi-question search generates variant queries for better recall.
- **Recommended implementation approach**: Replace Redux `knowledge` slice and `knowledgeThunk` with Zustand store(s). Replace Ant Design Table/Modal/Upload components with shadcn/ui equivalents. Keep all main process logic (embedding, vector search, preprocessing, reranking) intact as it is stack-independent.
- **Caveats**: Knowledge base UI includes file upload, progress indicators, and table views that are heavily Ant Design-dependent. The main process knowledge service and embedding pipeline are entirely stack-independent.

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

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | API change impact | If knowledge search API or result format changes, F005's knowledge injection pipeline needs modification |
| F005-ai-chat | Entity change impact | If KnowledgeReference schema changes, F005's display of knowledge citations needs modification |
| F011-memory-system | Infrastructure impact | If embedding infrastructure changes, F011's memory embedding (which reuses KB infra) needs modification |
