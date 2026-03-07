# Pre-Context: Knowledge Base

**Feature ID**: F006
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/knowledge/` | Knowledge base main process implementation |
| `src/main/knowledge/preprocess/PreprocessingService.ts` | PDF preprocessing with multiple providers |
| `src/main/knowledge/embedjs/embeddings/EmbeddingsFactory.ts` | Embedding provider factory |
| `src/main/knowledge/embedjs/loader/` | Document loaders (EPUB, OD, etc.) |
| `src/main/knowledge/reranker/` | Reranking strategies |
| `src/main/services/KnowledgeService.ts` | Knowledge IPC service |
| `src/renderer/src/store/knowledge.ts` | Knowledge Redux slice |
| `src/renderer/src/types/knowledge.ts` | KnowledgeBase, KnowledgeItem types |
| `src/renderer/src/pages/knowledge/` | Knowledge base UI |
| `src/renderer/src/services/KnowledgeService.ts` | Renderer knowledge service |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Document ingestion pipeline, embedding generation patterns, vector search logic, reranking strategies, preprocessing provider integrations, chunk size/overlap configuration
- Ignore: Redux knowledge slice, Ant Design knowledge UI

### Static Resources

None.

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `MAIN_VITE_MINERU_API_KEY` | secret | No | MinerU preprocessing API key | — |

---

## For /speckit.specify

### Existing Feature Summary

Knowledge Base implements RAG (Retrieval-Augmented Generation) with document ingestion (file, URL, note, sitemap, directory, memory, video), optional PDF preprocessing (Doc2X, MinerU, Mistral, PaddleOCR), configurable chunking, embedding generation (OpenAI-compatible, Ollama, VoyageAI), vector similarity search with threshold filtering, and multi-strategy reranking (Jina, Voyage, Bailian, TEI).

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create KB | User creates knowledge base, selects embedding model and chunk settings |
| P1 | Add Document | User adds PDF/URL/note; document is processed, chunked, and embedded |
| P1 | RAG Chat | User chats with KB attached; relevant chunks injected into context |
| P2 | Rerank Results | Search results are reranked using a dedicated reranking model |

### Draft Requirements

- **FR-043**: Implement knowledge base CRUD with embedding model, chunk size/overlap, threshold configuration
- **FR-044**: Implement document ingestion pipeline supporting file, URL, note, sitemap, directory types
- **FR-045**: Implement embedding generation via OpenAI-compatible, Ollama, and VoyageAI providers
- **FR-046**: Implement vector similarity search with configurable threshold
- **FR-047**: Implement reranking with multiple strategies (Jina, Voyage, Bailian, TEI)
- **FR-048**: Implement PDF preprocessing with Doc2X, MinerU, Mistral, PaddleOCR providers (optional)
- **FR-049**: Implement processing status tracking with progress reporting and retry logic

### Draft Acceptance Criteria

- **SC-024**: Document ingestion completes with progress tracking visible in UI
- **SC-025**: RAG search returns relevant results above threshold within 500ms
- **SC-026**: Reranking improves result relevance compared to raw vector search
- **SC-027**: Failed processing can be retried without data loss

### Edge Cases

- Large PDF (100+ pages): needs chunked processing with progress
- Embedding model change: requires re-embedding all items
- Network failure during embedding: retry logic with exponential backoff
- Duplicate document detection via uniqueId/uniqueIds

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | File storage | Documents stored via file storage |
| F003-provider-management | Model config | Embedding model resolved from provider config |

### Related Entities

#### Owned Entities

**KnowledgeBase** — 14 fields (see entity-registry.md)
**KnowledgeItem** — 12 fields with processing status
**KnowledgeNote** — 6 fields (Dexie)
**KnowledgeReference** — 6 fields

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Main process handles embedding/search. Renderer manages state. Multiple preprocessing and reranking strategies.
- **Recommended implementation approach**: Keep main process knowledge service. Zustand for renderer state. Core RAG logic is framework-agnostic.
- **Caveats**: Embedding infrastructure is shared with F008-memory. Design the embedding service to be reusable.

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Context injection | F005 | Verify search results format matches completion pipeline expectations |
| Citation blocks | F004 | Verify citation references create proper MessageBlocks |
| Embedding reuse | F008 | Verify embedding infrastructure is compatible with memory feature |
