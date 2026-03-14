# F007-knowledge — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Knowledge Base Management & RAG Pipeline
> Tier: 2 (Recommended) | Demo Group: D2-Enhance
> Dependencies: F004-ai-core, F006-chat

---

## Feature Overview

Knowledge base management with full RAG (Retrieval-Augmented Generation) pipeline. Users create knowledge bases, ingest documents (files, URLs, sitemaps, notes), embed them via configurable embedding models, and retrieve relevant context during chat. Includes vector search with similarity thresholds, optional reranking, PDF preprocessing with OCR fallback, and concurrent workload management for large document sets.

---

## Runtime Exploration Results

From `runtime-exploration.md` — Screen: `#/knowledge`:

- **Layout**: Left sidebar (knowledge base list) + Main content area
- **UI Elements**: "+ Add" button in sidebar, list of knowledge bases
- **Empty state**: "No knowledge base found" with folder illustration
- **Navigation**: Opens as tab in top navbar
- **Settings integration**: Settings > Document Processing for KB-related config

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Main service | `src/main/services/KnowledgeService.ts` | KB lifecycle, IPC handlers |
| RAG app | `src/main/knowledge/` | RAG application, vector DB, embedding pipeline |
| Worker | `src/main/services/KnowledgeWorker.ts` | Concurrent document processing |
| Reranker | `src/main/services/RerankerService.ts` | Search result reranking |
| PDF processor | `src/main/services/PdfProcessor.ts` | PDF text extraction + OCR fallback |
| Renderer service | `src/renderer/src/services/KnowledgeService.ts` | Client-side KB operations |
| Store | `src/renderer/src/store/knowledge.ts` | Redux slice (knowledge state) |
| Pages | `src/renderer/src/pages/knowledge/` | KB management UI |
| RAG prompt | `src/renderer/src/prompts/reference.ts` | REFERENCE_PROMPT template for injection |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B176 | KB CRUD with sidebar list | P1 | Create, rename, delete knowledge bases. Left sidebar displays KB list with selection. |
| B177 | Document ingestion (file, URL, sitemap, note) | P1 | Add documents to a KB by file upload, URL fetch, sitemap crawl, or inline note. Track processing status per item. |
| B178 | Embedding pipeline with configurable model | P1 | Chunk documents, generate embeddings via selected embedding model, store vectors in LibSqlDb. Configure chunk size, overlap, dimensions per KB. |
| B179 | Vector search with threshold filtering | P1 | Search KB by query embedding similarity. Filter results below configurable threshold. Return top-K results with metadata. |
| B180 | Reranking with optional rerank model | P2 | After vector search, optionally rerank results using a configured rerank model. Skip if no rerank model set. |
| B181 | RAG injection into chat messages | P1 | Before message preparation, search linked KBs, format results via REFERENCE_PROMPT, append to last user message. |
| B182 | Concurrent workload management | P2 | Cap concurrent processing at 80MB total + 30 items. Queue excess items. Report progress per item via IPC. |
| B183 | PDF preprocessing with cache and OCR fallback | P2 | Extract text from PDFs. Cache by file hash. Fall back to OCR when text extraction fails. |
| B184 | KB settings UI (chunk size, overlap, threshold, topK) | P2 | Per-KB configuration panel for embedding and search parameters. |
| B185 | Document processing status tracking | P2 | Show per-item status (pending/processing/completed/failed) in KB detail view. |
| B186 | Knowledge base linking to assistants | P1 | Assistants can link to multiple KBs. Linked KBs are used for RAG during chat. |
| B187 | KB note items (inline content) | P3 | Create and edit markdown notes directly within a KB for embedding. |

---

## Business Rules

- **BR-013**: Each KB has its own RAG app instance with dedicated LibSqlDb vector store
- **BR-014**: Concurrent processing capped at 80MB + 30 items with queue scheduling
- **BR-015**: Search results undergo threshold filtering + optional reranking
- **BR-016**: PDF preprocessing uses file-hash caching with OCR fallback

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | KB operations use IPC, no direct env vars | — |

---

## For /speckit.specify

- **Entities**: KnowledgeBase, KnowledgeItem, KnowledgeNoteItem (see entity-registry.md)
- **Business rules**: BR-013 through BR-016 (see business-logic-map.md)
- **Key screens**: `#/knowledge` (KB list + detail), KB settings panel within detail view
- **IPC channels**: `knowledgeBase:create`, `knowledgeBase:delete`, `knowledgeBase:search`, `knowledgeBase:addItem`, `knowledgeBase:removeItem`, `knowledgeBase:progress`
- **Cross-feature**: BR-005 (F006-chat) consumes KB search results via BR-015

## For /speckit.plan

- **Migration impact**: Medium UI, Low state (see stack-migration.md)
- **UI migration**: KB management page uses AntD List, Button, Modal -> shadcn/ui equivalents
- **State migration**: `knowledge` Redux slice -> `useKnowledgeStore` Zustand store
- **Main process**: KnowledgeService, RagApp, workers are Node.js — no UI migration needed
- **Dependencies**: Requires F004-ai-core for embedding model access, F006-chat for RAG injection point
- **Zustand store**: `useKnowledgeStore` absorbs `knowledge` slice

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| `knowledgeBase:search` IPC | F006-chat | Vector search + rerank, returns ranked document chunks |
| KnowledgeBase entity | F005-assistant | Assistant links to KB IDs for RAG |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| Embedding model access | F003-provider / F004-ai-core | Embedding generation via configured model |
| Assistant.knowledge_bases | F005-assistant | List of linked KB IDs per assistant |
| REFERENCE_PROMPT injection | F006-chat | Chat pipeline calls KB search before message prep |
