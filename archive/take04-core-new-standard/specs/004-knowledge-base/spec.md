# Feature Specification: Knowledge Base

**Feature Branch**: `004-knowledge-base`
**Created**: 2026-03-04
**Status**: Draft
**Input**: Knowledge Base — RAG pipeline with queue-based processing, embedding-based vector search, document preprocessing, chunking, optional reranking, deferred deletion, and migration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create and Configure Knowledge Base (Priority: P1)

A user creates a new knowledge base, assigns it a name, selects an embedding model from their configured providers, and optionally adjusts chunking parameters (chunk size, chunk overlap) and search result count. The knowledge base is immediately available to receive items.

**Why this priority**: Without a knowledge base, no RAG workflow can begin. This is the foundational capability.

**Independent Test**: Create a knowledge base with an embedding model, verify it persists with correct configuration, then delete it and confirm cascade cleanup removes all associated items.

**Acceptance Scenarios**:

1. **Given** no knowledge bases exist, **When** user creates a knowledge base with a name and embedding model, **Then** the knowledge base is persisted with default chunking parameters (size 1000, overlap 200, search result count 30).
2. **Given** a knowledge base exists, **When** user updates its name or chunking parameters, **Then** the changes persist immediately.
3. **Given** a knowledge base exists with items, **When** user deletes the knowledge base, **Then** all items, associated files, and indexed data are removed (cascade delete).
4. **Given** a knowledge base exists, **When** user resets it, **Then** all items and indexed data are removed but the knowledge base configuration is preserved.

---

### User Story 2 — Add Items to Knowledge Base (Priority: P1)

A user adds content to a knowledge base from multiple source types: file upload, URL, sitemap, note (free-text), directory (recursive file discovery), or video. Each item is queued for processing through the RAG pipeline (preprocess → chunk → embed → store). The user sees real-time processing status for each item.

**Why this priority**: Without items, knowledge bases have no content to search. This is the core data ingestion flow.

**Independent Test**: Add each item type to a knowledge base, verify each progresses through pending → processing → completed, and confirm chunk counts are generated.

**Acceptance Scenarios**:

1. **Given** a knowledge base exists, **When** user uploads a file, **Then** the file is stored, a KnowledgeItem is created with type "file", and the item enters the processing queue with status "pending".
2. **Given** a knowledge base exists, **When** user adds a URL, **Then** a KnowledgeItem is created with type "url" and the URL content is fetched and processed.
3. **Given** a knowledge base exists, **When** user adds a sitemap URL, **Then** the sitemap is parsed and each discovered URL is processed as part of the sitemap item.
4. **Given** a knowledge base exists, **When** user writes a note, **Then** the note text is stored in a separate notes table and a KnowledgeItem with type "note" is created.
5. **Given** a knowledge base exists, **When** user selects a directory, **Then** files within the directory are recursively discovered and processed, with real-time progress updates.
6. **Given** a knowledge base exists, **When** user adds a video, **Then** the video transcript is extracted and processed.
7. **Given** duplicate URL/sitemap/directory items already exist, **When** user adds the same content again, **Then** the duplicate is rejected (deduplication by content equality).
8. **Given** duplicate files or notes, **When** user adds the same content again, **Then** duplicates are allowed (files and notes are always accepted).

---

### User Story 3 — Semantic Search (Priority: P1)

During a chat conversation, the system automatically searches relevant knowledge bases using the user's message as a query. Vector-based semantic search retrieves the most relevant chunks, optionally reranked by a dedicated reranker model. Results are returned as KnowledgeReference objects with content, source information, and relevance scores.

**Why this priority**: Semantic search is the primary value proposition of the knowledge base system — connecting AI conversations with user-curated knowledge.

**Independent Test**: Add items to a knowledge base, run a search query, verify relevant chunks are returned with scores and source attribution.

**Acceptance Scenarios**:

1. **Given** a knowledge base with completed items, **When** a search query is executed, **Then** up to N results are returned (default 30), each with content text, relevance score, source URL, and content type.
2. **Given** a knowledge base with a reranker model configured, **When** search is executed, **Then** initial results are re-scored and reordered by the reranker model before being returned.
3. **Given** an empty knowledge base, **When** search is executed, **Then** an empty result set is returned gracefully.
4. **Given** multiple concurrent searches on the same knowledge base, **When** searches execute simultaneously, **Then** all searches return correct results without interference.

---

### User Story 4 — Queue-Based Processing with Backpressure (Priority: P2)

The system manages a processing queue that enforces backpressure limits: maximum 30 concurrent processing items and maximum 80MB total workload. Items exceeding these limits are queued and processed as capacity becomes available. Workload is estimated per item type: file items use actual file size, URLs use a fixed 2MB estimate, sitemaps use a fixed 20MB estimate, notes use byte count of content.

**Why this priority**: Without backpressure, large batch imports could overwhelm system resources. Essential for system stability but not for basic functionality.

**Independent Test**: Add 40+ items simultaneously, verify only 30 are processing at once, and verify workload stays under 80MB limit.

**Acceptance Scenarios**:

1. **Given** 30 items are already processing, **When** user adds another item, **Then** the new item enters "pending" status and waits until a processing slot opens.
2. **Given** total workload is at 75MB, **When** user adds a 10MB file, **Then** the item waits until workload drops below 80MB before processing begins.
3. **Given** items are queued, **When** a processing item completes, **Then** the next queued item starts automatically and workload accounting is updated.

---

### User Story 5 — Document Preprocessing (Priority: P2)

For PDF documents, the system supports preprocessing via a configurable provider (e.g., an AI model that can extract text from scanned PDFs). Preprocessed results are cached to avoid redundant processing. Non-PDF files are processed directly without preprocessing. The user can configure which provider to use for preprocessing at the knowledge base level.

**Why this priority**: Critical for handling scanned PDFs and complex document formats, but basic RAG works without it.

**Independent Test**: Upload a PDF with a configured preprocessing provider, verify preprocessing runs and results are cached for subsequent re-use.

**Acceptance Scenarios**:

1. **Given** a knowledge base with a preprocessing provider configured, **When** a PDF file is added, **Then** the PDF is sent to the preprocessing provider before chunking.
2. **Given** a PDF was previously preprocessed, **When** the same PDF is re-processed (e.g., after refresh), **Then** the cached preprocessing result is used instead of calling the provider again.
3. **Given** no preprocessing provider is configured, **When** a PDF file is added, **Then** the PDF is processed directly without preprocessing.
4. **Given** preprocessing fails, **When** the error is caught, **Then** the item status is set to "error" with an error message indicating the preprocessing failure source.

---

### User Story 6 — Item Management (Priority: P2)

Users can remove individual items from a knowledge base, which triggers cleanup of associated indexed data and files. Users can also refresh an item, which re-processes it through the full RAG pipeline. Processing status for items can be cleared (completed/failed entries) individually or in bulk.

**Why this priority**: Ongoing management of knowledge base content requires add/remove/refresh capabilities. Not needed for initial setup but essential for maintenance.

**Independent Test**: Add an item, then remove it and verify all associated data is cleaned up. Refresh a completed item and verify it re-enters the processing queue.

**Acceptance Scenarios**:

1. **Given** a completed item exists, **When** user removes it, **Then** the item's indexed data is removed from the knowledge base, and associated files are deleted (file items delete the stored file, video items delete both the video and SRT transcript files).
2. **Given** a completed item exists, **When** user refreshes it, **Then** the old indexed data is removed, the item status resets to "pending", and it re-enters the processing queue.
3. **Given** an item is currently "pending" or "processing", **When** user attempts to refresh it, **Then** the refresh is blocked (item must be in completed or error state).
4. **Given** items with "completed" or "failed" processing status, **When** user clears completed processing, **Then** only completed/failed statuses are cleared — pending and processing items are not affected.

---

### User Story 7 — Reranking (Priority: P2)

After initial vector search retrieves candidate chunks, a dedicated reranker model can re-score and reorder the results for improved relevance. The reranker model is configured separately from the embedding model at the knowledge base level.

**Why this priority**: Reranking improves search quality but the system delivers value without it. It is an optimization layer on top of basic vector search.

**Independent Test**: Configure a reranker model on a knowledge base, run a search query, verify that results are re-scored and reordered compared to the base vector search results.

**Acceptance Scenarios**:

1. **Given** a knowledge base with a reranker model configured, **When** search returns initial results, **Then** the reranker re-scores all candidates and returns them in new relevance order.
2. **Given** no reranker model is configured, **When** search is executed, **Then** results are returned using only vector similarity scores.

---

### User Story 8 — Deferred Deletion (Priority: P3)

When knowledge base or item deletion fails mid-operation (e.g., files are locked, I/O error), the system records the pending deletion in a persistent file. On next application startup, the system retries all pending deletions to ensure eventual cleanup.

**Why this priority**: A resilience mechanism for rare failure scenarios. The system works correctly without it in the happy path.

**Independent Test**: Simulate a deletion failure, verify the pending deletion is persisted, restart the service, verify the deletion is retried and completes.

**Acceptance Scenarios**:

1. **Given** a deletion fails mid-operation, **When** the failure is caught, **Then** the item/base ID is written to a persistent pending-delete file.
2. **Given** pending deletions exist on disk, **When** the application starts, **Then** all pending deletions are retried and successfully cleaned up.
3. **Given** a retry also fails, **When** the next startup occurs, **Then** the pending deletion remains in the file for another retry attempt.

---

### User Story 9 — Knowledge Base Migration (Priority: P3)

A user migrates (clones) a knowledge base, creating a new copy with a timestamp suffix in the name. The original base is preserved. All items from the original are re-added to the new base and queued for reprocessing with the new base's configuration.

**Why this priority**: Migration supports configuration changes (e.g., changing embedding model) that require full reprocessing. An infrequent operation.

**Independent Test**: Migrate a knowledge base, verify the new base has a timestamped name, original items are re-added, and the original base is unchanged.

**Acceptance Scenarios**:

1. **Given** a knowledge base with items, **When** user triggers migration, **Then** a new knowledge base is created with name `{original-name}-YYMMDDHHMMSS`.
2. **Given** migration is in progress, **When** items are re-added to the new base, **Then** all items from the original are deep-cloned and queued for processing in the new base.
3. **Given** migration succeeds, **When** the process completes, **Then** the original knowledge base remains intact and unmodified.

---

### User Story 10 — Chunking Configuration (Priority: P3)

Users can configure document chunking parameters per knowledge base: chunk size (default 1000 characters) and chunk overlap (default 200 characters). These parameters control how documents are split before embedding. Changing parameters requires re-processing all items.

**Why this priority**: Fine-tuning chunking parameters is an advanced optimization. Defaults work well for most use cases.

**Independent Test**: Create knowledge bases with different chunk sizes, add the same document, verify different chunk counts are produced.

**Acceptance Scenarios**:

1. **Given** default chunking parameters, **When** a document with 5000 characters is processed, **Then** approximately 6 chunks are created (5000 / (1000 - 200) = 6.25, rounded).
2. **Given** custom chunking parameters (size 500, overlap 100), **When** the same document is processed, **Then** approximately 13 chunks are created (5000 / 400 = 12.5, rounded).
3. **Given** chunk overlap equals or exceeds chunk size, **When** the configuration is saved, **Then** the system rejects the configuration (overlap must be less than size).

---

### Edge Cases

- PDF with scanned images and no extractable text: handled via configurable preprocessing provider; if no provider is configured, the document may produce empty or minimal chunks.
- Embedding model change on an existing knowledge base: requires migration (US9) to re-embed all items with the new model. Old embeddings are incompatible.
- Very large document (e.g., 1000+ page PDF) producing thousands of chunks: queue backpressure prevents overload, and workload estimation uses actual file size.
- Network failure during embedding API call: item status transitions to "error" with descriptive message; user can retry via refresh (US6).
- Knowledge base deletion while items are still in the processing queue: all pending/processing items for that base must be cancelled or cleaned up.
- Deferred deletion pending file persists across application crashes and is retried on next startup.
- Sitemap containing thousands of URLs: workload estimated at 20MB fixed; individual URLs within the sitemap are processed sequentially within the sitemap item's allocation.
- Directory containing mixed file types: each file is discovered recursively and processed according to its type; progress is tracked and reported via IPC.
- Concurrent searches on the same knowledge base: vector store supports concurrent read access without interference.
- Removing an item that has no uniqueId (never successfully processed): removal of indexed data is skipped, but the item record and associated files are still cleaned up.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support knowledge base CRUD operations — create (with name, embedding model, optional chunking parameters), read, update (name, chunking parameters, reranker model, preprocessing provider), delete (with cascade cleanup of all items, indexed data, and associated files), and reset (remove all items while preserving configuration).
- **FR-002**: System MUST support 6 knowledge item types: file (uploaded document), URL (web page), sitemap (structured URL list), note (free-form text), directory (recursive file discovery), and video (with transcript extraction).
- **FR-003**: System MUST enforce queue-based processing with backpressure: maximum 30 concurrent processing items AND maximum 80MB total workload. Items exceeding either limit MUST be queued as "pending" until capacity is available.
- **FR-004**: System MUST estimate workload per item type: file = actual file size in bytes, URL = 2MB fixed, sitemap = 20MB fixed, note = byte count of text content, directory = aggregate of contained file sizes, video = actual file size.
- **FR-005**: System MUST support document preprocessing for PDF files via a configurable provider at the knowledge base level. Preprocessed results MUST be cached for re-use. Non-PDF files MUST bypass preprocessing.
- **FR-006**: System MUST chunk documents using configurable parameters per knowledge base: chunk size (default 1000 characters) and chunk overlap (default 200 characters). Overlap MUST be strictly less than chunk size.
- **FR-007**: System MUST generate embeddings for each chunk using the knowledge base's configured embedding model and store the resulting vectors for semantic search.
- **FR-008**: System MUST support semantic vector search with a configurable maximum result count (default 30). Each result MUST include the chunk text, relevance score, source attribution (URL or file reference), and content type.
- **FR-009**: System MUST support optional reranking of search results using a dedicated reranker model configured per knowledge base. When no reranker is configured, results MUST be returned using vector similarity scores only.
- **FR-010**: System MUST implement deferred deletion: when deletion fails mid-operation, the pending deletion MUST be recorded to a persistent file. On application startup, all pending deletions MUST be retried.
- **FR-011**: System MUST support item refresh: remove old indexed data, reset item status to "pending", and re-queue for processing. Refresh MUST be blocked if the item is currently "pending" or "processing".
- **FR-012**: System MUST support knowledge base migration: create a timestamped copy of the knowledge base, deep-clone the configuration, and re-add all items to the new base for reprocessing. The original base MUST remain intact.
- **FR-013**: System MUST perform file cleanup on item removal: file items delete the stored file, video items delete both the video file and the SRT transcript file. Cleanup uses best-effort semantics (failures do not block item removal).
- **FR-014**: System MUST enforce deduplication for URL, sitemap, and directory items (reject if same content already exists in the knowledge base). File and note items MUST always be accepted without deduplication.
- **FR-015**: System MUST track processing status per item with states: pending, processing, completed, error. Each item MUST also track processing progress (0-100%), optional error message, and retry count.
- **FR-016**: System MUST provide real-time progress updates for directory item processing via IPC events, reporting per-item progress percentage.
- **FR-017**: System MUST store note content in a separate persistent store (not embedded in the item record) to support efficient content retrieval and updates independent of the knowledge base state.

### Key Entities

- **KnowledgeBase**: Represents a RAG knowledge base with embedding configuration, chunking parameters (chunk size, overlap), search result count, optional reranker model, optional preprocessing provider, and a collection of KnowledgeItems. Owns: KnowledgeItem (1:N). References: Model (embedding, reranker, preprocessing), Provider (preprocessing).
- **KnowledgeItem**: An individual content item within a knowledge base. Discriminated union of 6 types (file, url, sitemap, note, directory, video), each with type-specific fields. Tracks processing status (pending/processing/completed/error), progress percentage, error message, retry count, and unique identifiers for indexed data management.
- **KnowledgeReference**: A transient search result object returned from semantic search operations. Contains chunk text, relevance score, source URL, content type, and optional metadata. Not persisted independently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a knowledge base with embedding model selection and chunking configuration in under 30 seconds.
- **SC-002**: The RAG pipeline (upload → preprocess → chunk → embed → store) completes for a 10-page PDF document in under 60 seconds.
- **SC-003**: Semantic search returns relevant results within 2 seconds for knowledge bases with up to 10,000 stored chunks.
- **SC-004**: Queue backpressure correctly limits concurrent processing to 30 items and total workload to 80MB, with no items processed outside these limits.
- **SC-005**: Knowledge references returned from search include accurate source attribution that allows users to trace results back to the originating document or URL.
- **SC-006**: Deferred deletion successfully retries and completes cleanup on the next application startup for items that failed mid-deletion.
- **SC-007**: Item refresh re-processes an item through the full RAG pipeline and produces updated search results within the same timeframe as initial processing.

### Assumptions

- Embedding models are provided by F002-provider-management and accessible via the AI core engine (F003).
- File upload and storage are handled by F001-core-platform's file:* IPC channels.
- The vector store implementation supports concurrent read access for search operations.
- Preprocessing providers follow the same model/provider pattern as embedding models.
- Note content storage uses the application's client-side database (Dexie IndexedDB).
