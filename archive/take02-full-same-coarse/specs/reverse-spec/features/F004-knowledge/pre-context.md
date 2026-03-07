# Pre-Context: Knowledge Base & RAG

**Feature ID**: F004-knowledge
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/KnowledgeService.ts` | Knowledge service (main process) — ingestion, search, queue |
| `src/main/knowledge/` | Knowledge module directory (RAG application, loaders, reranker) |
| `src/main/knowledge/reranker/Reranker.ts` | Reranker implementation (5 strategy types) |
| `src/renderer/src/services/KnowledgeService.ts` | Knowledge service (renderer) — IPC bridge to main |
| `src/renderer/src/types/knowledge.ts` | Knowledge type definitions |
| `src/renderer/src/store/knowledge.ts` | Knowledge Redux slice |
| `src/renderer/src/pages/knowledge/` | Knowledge base UI pages |
| `src/renderer/src/pages/knowledge/KnowledgeBasePage.tsx` | Knowledge base detail page |
| `src/renderer/src/pages/knowledge/KnowledgeManagePage.tsx` | Knowledge management page |
| `src/renderer/src/hooks/useKnowledge.ts` | Knowledge hook |
| `src/renderer/src/pages/settings/KnowledgeSettings/` | Knowledge settings UI |
| `packages/shared/IpcChannel.ts` | IPC channel definitions (knowledge-base:*) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Per-directory LibSQL isolation for knowledge bases; concurrent processing queue with workload limits (80MB, 30 items); RAGApplicationBuilder for chunking and embedding; Reranker class with 5 strategy types; preprocessing pipeline for PDFs with 5 provider options
- **Reusable code**:
  - `src/main/services/KnowledgeService.ts:KnowledgeService` — Main process knowledge service with queue management, ingestion pipeline, and search; reuse for all knowledge operations
  - `src/main/knowledge/reranker/Reranker.ts:Reranker` — Reranker with 5 strategy types (jina, cohere, custom API, etc.); reuse for search result ranking
  - `src/renderer/src/services/KnowledgeService.ts:KnowledgeService` — Renderer IPC bridge for knowledge operations; reuse for UI-facing knowledge API
  - `src/renderer/src/store/knowledge.ts:knowledgeSlice` — Knowledge base state management with CRUD; reuse for knowledge base lifecycle
  - `src/renderer/src/types/knowledge.ts` — Knowledge type definitions (KnowledgeBase, KnowledgeItem, KnowledgeItemType, PreprocessProvider); reuse for type safety

### Static Resources

None

### Environment Variables

None — F004-knowledge uses no Feature-specific environment variables.

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `NODE_OPTIONS` | F001-platform | Node.js memory limit for document processing and embedding operations |
| `CSLOGGER_MAIN_LEVEL` | F001-platform | Log level for knowledge service main process operations |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F004-knowledge provides a complete RAG (Retrieval-Augmented Generation) pipeline for Cherry Studio. It manages knowledge bases as isolated LibSQL database instances, supports 7 source types for document ingestion (file, URL, note, sitemap, directory, memory, video), offers PDF preprocessing via 5 providers (doc2x, mistral, mineru, open-mineru, paddleocr), performs embedding with provider-specific URL normalization, and executes vector similarity search with optional reranking (5 strategies). A concurrent processing queue enforces workload limits of 80MB and 30 simultaneous items.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create knowledge base | User creates a knowledge base and selects an embedding model from available providers |
| P1 | Add documents | User uploads files (PDF, text, etc.), adds URLs, or adds notes to a knowledge base; documents are ingested, chunked, and embedded |
| P1 | Search knowledge | User or chat pipeline queries a knowledge base; vector search returns relevant document chunks |
| P2 | PDF preprocessing | User configures a PDF preprocessor (doc2x, mistral, etc.); PDFs are preprocessed before embedding for better quality |
| P2 | Reranking | User enables reranking for a knowledge base; search results are reranked for improved relevance |
| P2 | Manage items | User views processing status, removes items, or re-processes failed items |
| P3 | Directory ingestion | User adds an entire directory; all supported files within are ingested recursively |
| P3 | Sitemap ingestion | User adds a sitemap URL; all pages discovered from the sitemap are ingested |
| P3 | Video ingestion | User adds a video file; audio is transcribed and embedded |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Knowledge base CRUD with per-base LibSQL database isolation
- **FR-002**: Document ingestion supporting 7 source types (file, URL, note, sitemap, directory, memory, video)
- **FR-003**: PDF preprocessing via 5 provider options (doc2x, mistral, mineru, open-mineru, paddleocr)
- **FR-004**: Embedding with provider-specific URL normalization (Gemini, Azure, Ollama)
- **FR-005**: Vector similarity search with configurable similarity threshold
- **FR-006**: Post-search reranking with 5 strategy types
- **FR-007**: Concurrent processing queue (80MB workload cap, 30 item cap)
- **FR-008**: Real-time progress reporting via IPC push events

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Knowledge base creation completes within 2 seconds
- **SC-002**: Document ingestion (single file) completes and status updates within 30 seconds for files under 1MB
- **SC-003**: Vector search returns relevant results within 500ms for bases with up to 10,000 chunks
- **SC-004**: Concurrent processing respects 80MB/30-item limits without crashes
- **SC-005**: Reranking improves search relevance (measured by position of correct answer in results)
- **SC-006**: Processing progress accurately reported to renderer via IPC events

### Edge Cases

- Very large PDF files (>50MB) requiring chunked processing
- Embedding model API rate limiting during batch ingestion
- LibSQL database corruption recovery
- Knowledge base with zero documents returns empty results gracefully
- Sitemap with thousands of URLs requiring batched processing
- Network failure during URL content fetching
- Concurrent access to the same knowledge base from multiple queries
- Embedding dimension mismatch when switching models on existing knowledge base
- Document encoding detection for non-UTF-8 files

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC bridge | Uses file:* IPC channels for document upload; uses knowledge-base:* IPC channels for main↔renderer communication |
| F001-platform | File system | Uses file system APIs for document storage in app data directory |
| F001-platform | Redux store | Knowledge slice integrates into F001's Redux store with persistence |
| F002-ai-foundation | Entity reference | References Provider and Model entities for embedding model and reranking model selection |

### Related Entities (data-model.md draft)

#### Owned Entities

**KnowledgeBase** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique knowledge base identifier |
| name | string | required | Display name |
| model | Model | required | Embedding model reference |
| rerankModel | Model | optional | Reranking model reference |
| documentCount | number | required | Max results per search query |
| chunkSize | number | required | Text chunk size for splitting |
| chunkOverlap | number | required | Overlap between chunks |
| threshold | number | optional | Minimum similarity score for results |
| items | KnowledgeItem[] | required | List of ingested items |
| version | number | required | Schema version for migrations |

**KnowledgeItem** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique item identifier |
| knowledgeBaseId | string | FK → KnowledgeBase | Parent knowledge base |
| type | KnowledgeItemType | required | Source type (file, url, note, sitemap, directory, memory, video) |
| content | string | optional | Raw content or path |
| processingStatus | string | required | Processing status (pending, processing, completed, error) |
| uniqueId | string | optional | Content hash for deduplication |
| uniquePopulated | boolean | optional | Whether unique check has been performed |
| fileSize | number | optional | File size in bytes |
| remark | string | optional | User-provided note |
| sourceUrl | string | optional | Original URL for URL-type items |
| createdAt | number | required | Creation timestamp |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-foundation | Read access | Provider resolution for embedding and reranking API calls |
| Model | F002-ai-foundation | Read access | Embedding model and reranking model selection |
| FileMetadata | F001-platform | Read access | Document files uploaded via platform file system |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `knowledge-base:create` | Create a new knowledge base |
| IPC | `knowledge-base:delete` | Delete a knowledge base and its LibSQL database |
| IPC | `knowledge-base:add-item` | Add a document/URL/note to a knowledge base |
| IPC | `knowledge-base:remove-item` | Remove an item from a knowledge base |
| IPC | `knowledge-base:search` | Execute vector similarity search |
| IPC | `knowledge-base:reindex` | Re-process all items in a knowledge base |
| IPC | `knowledge-base:progress` (push) | Processing progress notifications to renderer |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `file:*` | F001-platform | Document file upload and storage |
| Redux | `llmSlice` | F002-ai-foundation | Provider and model data for embedding model resolution |
| IPC | `app:*` | F001-platform | Proxy configuration for external API calls (embedding, preprocessing) |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Per-directory LibSQL isolation pattern for data partitioning; RAGApplicationBuilder with pluggable loaders; Concurrent queue with workload-based capacity management; Provider-specific URL normalization for embedding calls
- **Existing libraries**: `@nicepkg/gpt-runner-web` — RAG application builder; `drizzle-orm` — SQL schema for vector storage; `@libsql/client` — LibSQL client for per-KB databases; `node-stream-zip` — ZIP extraction for document archives
- **Existing architecture decisions**: Each knowledge base gets its own LibSQL database instance for isolation; Processing queue enforces both memory (80MB) and concurrency (30 items) limits; PDF preprocessing is optional and provider-configurable; Embedding normalization handles provider URL differences; Reranking is a post-search step with 5 pluggable strategies

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Embedding model compatibility | F002-ai-foundation | Verify that knowledge base embedding model selection correctly filters for models with embedding capability from F002 |
| Reranking model compatibility | F002-ai-foundation | Verify that reranking model selection correctly filters for models with rerank capability from F002 |
| RAG integration in chat | F003-chat | Verify that knowledge search results format correctly as RAG context injected into F003's chat pipeline |
| File system integration | F001-platform | Verify that document uploads use F001's file:* IPC channels consistently |
| Redux store integration | F001-platform | Verify that knowledge slice integrates correctly with F001's Redux store and persistence config |
| Assistant knowledge binding | F002-ai-foundation | Verify that Assistant.knowledgeBaseIds correctly references KnowledgeBase entities |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-chat | RAG format change impact | If knowledge search result format changes, F003's RAG context injection needs modification |
| F002-ai-foundation | Entity reference impact | If KnowledgeBase entity schema changes, F002's Assistant.knowledgeBaseIds reference needs verification |
| F005-data-mgmt | Data format impact | If knowledge base storage format changes, F005's backup/restore must handle the new format |
| F005-data-mgmt | Connection impact | If LibSQL connection management changes, F005's closeAllDataConnections during restore needs modification |
