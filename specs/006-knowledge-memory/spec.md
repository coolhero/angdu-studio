# Feature Specification: Knowledge & Memory System

**Feature Branch**: `006-knowledge-memory`
**Created**: 2026-03-19
**Status**: Draft
**Input**: Knowledge base RAG pipeline, document embedding, memory system, search & reranking — rebuild from Cherry Studio

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Knowledge Base Creation and Document Ingestion (Priority: P1)

A user wants to create a knowledge base, add documents (files, URLs, notes), and have them processed into searchable embeddings so they can enhance AI chat responses with their own content.

**Why this priority**: Core capability — without KB creation and ingestion, all other KB features are unusable.

**Independent Test**: Create a KB, add a text file, wait for processing to complete, verify the KB shows up with status "completed".

**Acceptance Scenarios**:

1. **Given** the user is on the Knowledge page, **When** they click "New KB" and fill in name + embedding model, **Then** the KB appears in the sidebar list with an empty state.
2. **Given** a KB exists, **When** the user adds a text file, **Then** the item shows pending → processing → completed status progression via StatusIcon.
3. **Given** a KB has processed items, **When** the user views the KB, **Then** all items are listed with their current processing status.
4. **Given** a KB exists, **When** the user deletes it, **Then** the KB is removed from the sidebar and all vector DB files are cleaned up.

---

### User Story 2 - RAG Search and Citation in Chat (Priority: P1)

A user wants to attach a knowledge base to a chat conversation so the AI can search relevant documents and include citations in its responses.

**Why this priority**: Primary value proposition — RAG-enhanced responses are the main reason users create knowledge bases.

**Independent Test**: Attach a KB with known content to a chat, ask a question about that content, verify the response includes numbered citation badges.

**Acceptance Scenarios**:

1. **Given** a KB with processed documents, **When** the user selects it via the inputbar KB button, **Then** green KB tags appear below the input field.
2. **Given** a KB is attached to a conversation, **When** the user sends a message, **Then** the system searches the KB and injects relevant context into the AI prompt.
3. **Given** search results are injected, **When** the AI responds, **Then** the response contains numbered [N] citation badges. Clicking a badge shows the source file name and matched text snippet. Matches source CitationsList pattern.
4. **Given** multiple KBs are attached, **When** a search is performed, **Then** results from all attached KBs are returned and ranked by relevance.

---

### User Story 3 - Memory System for Persistent Facts (Priority: P1)

A user wants the assistant to remember facts about them across conversations — preferences, background, and key information — without manually re-stating them each time.

**Why this priority**: Memory enables personalized, context-aware assistance that improves over time.

**Independent Test**: Have a conversation mentioning specific preferences, start a new conversation, verify the assistant recalls the mentioned preference.

**Acceptance Scenarios**:

1. **Given** memory is enabled for an assistant, **When** the user has a conversation mentioning "I prefer dark theme", **Then** a memory item is extracted and stored.
2. **Given** stored memories exist, **When** the user starts a new conversation, **Then** relevant memories are searched and provided as context to the AI.
3. **Given** the Memory settings page, **When** the user views their memories, **Then** all extracted facts are listed with CRUD capabilities.
4. **Given** an incorrect memory, **When** the user edits or deletes it, **Then** the change is persisted and reflected in future conversations.

---

### User Story 4 - KB Management and Configuration (Priority: P2)

A user wants to customize their knowledge base settings — chunk size, overlap, reranking model, preprocessing — to optimize search quality for their specific content type.

**Why this priority**: Power user feature — most users will use defaults, but advanced users need fine-tuning control.

**Independent Test**: Open KB settings, change chunk size and rerank model, verify settings persist and affect processing.

**Acceptance Scenarios**:

1. **Given** an existing KB, **When** the user opens settings, **Then** they can edit: name, embedding model, dimensions, documentCount (slider 1-50), chunkSize (min 100), chunkOverlap (validated < chunkSize), threshold, rerankModel (clearable), preprocessProvider (select dropdown).
2. **Given** the user changes chunkOverlap to a value >= chunkSize, **When** they try to save, **Then** a validation error is shown.
3. **Given** the user selects a preprocessProvider, **When** files are next processed, **Then** preprocessing is applied before embedding.

---

### User Story 5 - Multiple Item Types (Priority: P2)

A user wants to add various content types to their knowledge base — files, directories, URLs, sitemaps, notes, and videos — each handled by the appropriate loader.

**Why this priority**: Flexibility in content sources expands KB utility significantly.

**Independent Test**: Add each item type to a KB and verify each is processed correctly.

**Acceptance Scenarios**:

1. **Given** a KB exists, **When** the user adds a directory, **Then** all files in the directory are scanned and added (duplicate paths skipped).
2. **Given** a KB exists, **When** the user adds a URL, **Then** the URL content is fetched, extracted, and embedded (duplicate URLs skipped).
3. **Given** a KB exists, **When** the user adds a sitemap URL, **Then** all pages from the sitemap are loaded and embedded (duplicate sitemaps skipped).
4. **Given** a KB exists, **When** the user adds a note, **Then** the note content is embedded.
5. **Given** a KB exists, **When** the user adds a video URL, **Then** the video content (transcript/description) is extracted and embedded.

---

### User Story 6 - Memory Settings and User Management (Priority: P2)

A user wants to manage their memory settings — choose models, view stored memories, manage users — from a dedicated settings page.

**Why this priority**: Provides visibility and control over what the AI "remembers" about users.

**Independent Test**: Navigate to Settings > Memory, view memory list, add/edit/delete a memory.

**Acceptance Scenarios**:

1. **Given** the Settings page, **When** the user navigates to Memory settings, **Then** they see: global toggle, user selector, memory list with search, add/edit/delete actions.
2. **Given** memory is enabled, **When** the user adds a memory manually, **Then** it appears in the list and is available for future recall.
3. **Given** multiple users, **When** the user switches between users, **Then** the memory list shows only that user's memories.

---

### User Story 7 - Save Content to Knowledge Base (Priority: P2)

A user wants to save chat messages, topics, or notes directly to a knowledge base for future reference.

**Why this priority**: Convenient content capture — reduces friction in building knowledge bases from conversations.

**Independent Test**: Right-click a chat message, select "Save to Knowledge", pick a KB, verify the content appears as an item.

**Acceptance Scenarios**:

1. **Given** a chat message, **When** the user right-clicks and selects "Save to Knowledge", **Then** a popup shows with content type options and KB selector.
2. **Given** a topic, **When** the user saves it to a KB, **Then** the entire topic content is added as a note item.
3. **Given** a note, **When** the user saves it to a KB, **Then** the note content is added as a note item.

---

### User Story 8 - Assistant-Level KB and Memory Configuration (Priority: P2)

A user wants to configure which knowledge bases and memory settings apply to specific assistants, not globally.

**Why this priority**: Per-assistant configuration allows specialized assistants (e.g., "Code Expert" with code KB, "Personal Assistant" with memory).

**Independent Test**: Open assistant settings, configure KB and memory tabs, verify settings persist and are used in chat.

**Acceptance Scenarios**:

1. **Given** assistant settings, **When** the user opens the Knowledge Base tab, **Then** they can multi-select KBs and toggle KB recognition.
2. **Given** assistant settings, **When** the user opens the Memory tab, **Then** they can enable/disable memory for this assistant.
3. **Given** KBs are assigned to an assistant, **When** the user starts a chat, **Then** only the assigned KBs are searched.

---

### Edge Cases

- What happens when embedding API key is not configured? → Actionable error guiding user to Settings > Provider [source: FR-041]
- What happens when embedding API call fails mid-processing? → Item marked as "failed" with retryCount, retry option available [source: FR-042]
- What happens when file has no extractable text (empty/binary)? → Status "failed" with reason "No text extracted", not silent "completed" [source: S4b]
- What happens when chunkOverlap >= chunkSize? → Validation error shown, cannot save
- What happens when all items in a KB fail processing? → KB exists but search returns empty results with explanation
- What happens during concurrent processing of 50+ files? → Workload cap (80MB, 30 items) queues excess items
- What happens on app shutdown during processing? → Graceful shutdown, pending items resume on restart
- What happens when failed KB deletion occurs? → Persisted in pending_delete file, retried on next startup

## Requirements *(mandatory)*

### Functional Requirements

**KB Management:**
- **FR-001**: System MUST allow users to create a knowledge base with name (text input), embedding model (model selector with embedding capability filter), dimensions (auto-populated per model), and documentCount (slider 1-50, default 6) [source: B161]
- **FR-002**: System MUST delete a knowledge base including all RAG data, vector DB files, and item cleanup [source: B162]
- **FR-003**: System MUST allow resetting a knowledge base — clearing all embeddings while preserving the KB configuration [source: B163]
- **FR-004**: System MUST allow renaming a knowledge base [source: B179]
- **FR-005**: System MUST allow editing advanced KB settings: chunkSize (number input, min 100), chunkOverlap (number input, validated < chunkSize), threshold (number), rerankModel (model selector with rerank filter, clearable), preprocessProvider (select dropdown with available providers) [source: B180]
- **FR-006**: System MUST display knowledge bases in a sidebar list with drag-and-drop reorder, context menu (rename, settings, delete), and active base highlighting

**KB Items (6 types):**
- **FR-007**: System MUST support adding file items to a KB (file picker dialog) [source: B164]
- **FR-008**: System MUST support adding directory items — scanning all files in the directory, skipping duplicate content paths [source: B165]
- **FR-009**: System MUST support adding URL items — fetching and processing web content, skipping duplicate URLs [source: B166]
- **FR-010**: System MUST support adding sitemap items — loading all pages from a sitemap URL, skipping duplicate sitemaps [source: B167]
- **FR-011**: System MUST support adding note items from the notes feature [source: B168]
- **FR-012**: System MUST support adding video items — extracting video content (transcript/description) [source: B169]
- **FR-013**: System MUST allow removing individual items from a KB [source: B170]
- **FR-014**: System MUST track item processing status: pending → processing → completed/failed with retryCount, displayed via StatusIcon component [source: B174, B182]

**Embedding Pipeline (per-stage — S4c Data Pipeline Traceability):**
- **FR-015**: System MUST extract text from supported file formats (txt, md, pdf, docx)
- **FR-016**: System MUST chunk extracted text with configurable chunk size and overlap
- **FR-017**: System MUST support optional preprocessing via pluggable providers (Default, Doc2x, Mineru, Mistral, OpenMineru, PaddleOCR) with factory pattern [source: B173]
- **FR-018**: System MUST generate vector embeddings using the KB's configured embedding model via F004 provider API [source: B161]
- **FR-019**: System MUST store embeddings in a better-sqlite3 based vector store with cosine similarity search capability

**Search & RAG:**
- **FR-020**: System MUST perform vector similarity search with configurable threshold filter and documentCount limit [source: B171]
- **FR-021**: System MUST support optional reranking of search results using configurable rerank model with strategy pattern [source: B172]
- **FR-022**: System MUST format search results as knowledge references and inject them into the AI prompt using a REFERENCE_PROMPT template
- **FR-023**: System MUST display citations as numbered [N] badges in chat responses. Clicking a badge shows a tooltip with source file name and matched text snippet. Matches source CitationsList inline sup badge + tooltip pattern. [source: B171]

**Memory System:**
- **FR-024**: System MUST support memory CRUD operations — add, search (vector similarity), list (with pagination), update, delete memories [source: B183-B189]
- **FR-025**: System MUST extract facts from assistant conversation messages using an LLM with configurable fact extraction prompt [source: B191-B193]
- **FR-026**: System MUST search and provide relevant memories as AI context before generating responses. Memory search is provided as an AI tool capability — the AI decides when to invoke memory search based on conversation relevance. [source: B194]
- **FR-027**: System MUST allow configuring memory settings — embedding model, LLM model, and custom prompts [source: B195]
- **FR-028**: System MUST isolate memories per user with user management (create users, switch between users, view per-user memory counts) [source: B190]
- **FR-029**: System MUST track memory history (ADD, UPDATE, DELETE audit trail per memory item) [source: B188]

**UI Entry Points (rebuild — each source entry point = separate FR):**
- **FR-030**: Sidebar MUST include a Knowledge icon (FileSearch) that navigates to /knowledge page
- **FR-031**: Chat inputbar MUST include a KB button that opens a QuickPanel for multi-selecting knowledge bases per assistant. Includes "+Add..." option that navigates to /knowledge. Button highlights when KBs are selected. Disabled when files are attached. [source: KnowledgeBaseButton]
- **FR-032**: Chat input area MUST display selected KBs as green closable tags below the message input [source: KnowledgeBaseInput]
- **FR-033**: Assistant settings MUST include a Knowledge Base tab with multi-select KB dropdown and KB recognition toggle [source: AssistantKnowledgeBaseSettings]
- **FR-034**: Assistant settings MUST include a Memory tab with enable/disable toggle, settings navigation link, and configuration status display [source: AssistantMemorySettings]
- **FR-035**: Settings page MUST include a Memory section (/settings/memory) with global memory toggle, user management, memory list with search, add/edit/delete actions, and infinite scroll [source: MemorySettings]
- **FR-036**: Message context menu MUST include "Save to Knowledge" option that opens a popup for selecting content types and target KB [source: SaveToKnowledgePopup]
- **FR-037**: Chat MUST support KB search popup activated via keyboard shortcut, allowing inline search across KB content [source: KnowledgeSearchPopup]
- **FR-038**: Chat messages MUST display knowledge search tool execution status and results (FileSearch icon + "Searching Knowledge Base" + result list) [source: MessageKnowledgeSearch]
- **FR-039**: Chat messages MUST display memory search tool execution status and result count [source: MessageMemorySearch]

**Workload & Reliability:**
- **FR-040**: System MUST cap concurrent embedding processing at 80MB workload and 30 processing items — excess items queued [source: B174]
- **FR-041**: System MUST close all RAG applications gracefully on app shutdown [source: B176]
- **FR-042**: System MUST persist failed KB deletions to a pending_delete file and retry cleanup on next startup [source: B175]

**Error Handling (External API — BLOCKING):**
- **FR-043**: When embedding API key is not configured for the selected provider, system MUST display an actionable error message guiding the user to Settings > Provider to add their API key
- **FR-044**: When embedding API call fails, system MUST mark the item as "failed" with error details and provide a retry option
- **FR-045**: When embedding model returns empty result for a file, system MUST mark item as "failed" with reason "No text extracted" — not as "completed" with 0 embeddings

**Store KB State (Zustand — replaces Redux):**
- **FR-046**: System MUST maintain KB state (bases array with items) via Zustand store with CRUD actions: addBase, deleteBase, renameBase, updateBase, addItem, removeItem, updateItem, updateItemProcessingStatus [source: B177-B182]

### Key Entities

- **KnowledgeBase**: ID, name, embedding model, dimensions, items[], settings (documentCount, chunkSize, chunkOverlap, threshold, rerankModel, preprocessProvider), timestamps, version
- **KnowledgeItem**: ID, type (file/directory/url/sitemap/note/video), content (path/URL/text), status (pending/processing/completed/failed), retryCount, uniqueId, error, progress
- **MemoryItem**: ID, userId, content, hash (deduplication), embedding, metadata, timestamps
- **MemoryConfig**: embeddingModel, llmModel, customFactExtractionPrompt, customPrompts
- **MemoryHistoryItem**: ID, memoryId, operation (ADD/UPDATE/DELETE), previousContent, newContent, timestamp
- **KnowledgeReference**: search result with sourceFile, content snippet, similarity score, badge number
- **SaveToKnowledgeSelection**: contentTypes[], targetKBId, sourceType (message/topic/note)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User creates KB with name "Test KB" and selects an embedding model → KB appears in sidebar list with empty content area. Matches source AddKnowledgeBasePopup pattern: name input + ModelSelector + dimension auto-fill. [source: B161]
- **SC-002**: User deletes a KB → KB removed from sidebar list, vector DB directory cleaned up, no orphan files remain. Matches source KnowledgeService.delete cleanup behavior. [source: B162]
- **SC-003**: User adds a text file (containing "test content about machine learning") to KB → item shows pending → processing → completed status progression via StatusIcon. Matches source StatusIcon states: pending (clock), processing (spinner), completed (check), failed (X). [source: B164, B174, B182]
- **SC-004**: User sends a message with KB attached → response contains numbered [N] citation badges. Clicking badge [2] displays a tooltip showing source file name and content snippet for reference #2 specifically (data mapping accuracy, not just presence). Matches source CitationsList inline sup badge + Tooltip pattern. [source: B171]
- **SC-005**: Searching "machine learning" in a KB containing a file about machine learning returns at least 1 result with similarity > 0. Result includes source file name and matched text excerpt. [source: B171]
- **SC-006**: Memory enabled → user has conversation mentioning "I work at Acme Corp" → Memory settings page shows extracted fact containing "Acme Corp". Searching "workplace" returns the extracted memory. Matches source MemoryProcessor.extractFacts → MemoryService.add flow. [source: B191, B184]
- **SC-007**: Memory settings page displays list of memories with add (Plus icon), edit (inline), delete (trash icon) actions. Adding a memory via "Add" button → memory appears in list. Deleting a memory → removed from list. Matches source MemorySettings layout. [source: B183-B189]
- **SC-008**: User clicks inputbar KB button → QuickPanel shows available KBs with checkboxes. Selecting a KB → green tag appears below input with KB name. Clicking X on tag → tag removed, KB deselected. Matches source KnowledgeBaseButton + KnowledgeBaseInput pattern. [source: B177]
- **SC-009**: User opens assistant settings > KB tab → selects 2 KBs → closes settings → reopens → both KBs still selected. KB selection persists across app restarts. Matches source AssistantKnowledgeBaseSettings persistence. [source: B177]
- **SC-010**: User adds file to KB when embedding API key is not configured → actionable error message displayed showing "Go to Settings > Provider to add your API key" with link/button. Item NOT silently failed without guidance. Diverges from source: source shows red X only; we add actionable guidance.
- **SC-011**: App restarts after failed KB deletion → pending_delete file is read, failed deletions are retried and cleaned up. No orphan vector DB directories remain after retry. Matches source pendingDeleteManager behavior. [source: B175]
- **SC-012**: User adds 50 files simultaneously to a KB → at most 30 items process concurrently, excess queued. Total workload stays below 80MB cap. No process crashes or memory exhaustion. Matches source KnowledgeService workload management. [source: B174]

## Scope

### In Scope

- KB CRUD with all 6 item types (file, directory, URL, sitemap, note, video)
- Custom RAG pipeline: text extraction → chunking → embedding → vector store → search → rerank → citation
- better-sqlite3 vector store (replacing LibSqlDb/embedjs-libsql)
- Pluggable preprocessor providers (Default provider required; Doc2x, Mineru, Mistral, OpenMineru, PaddleOCR as optional)
- Memory system: fact extraction, vector storage, recall, CRUD, per-user isolation
- All 10 UI entry points listed in FR-030 through FR-039
- Zustand store (replacing Redux slice)
- 21 IPC channels for KB and memory operations
- Integration with F004 for embedding/rerank model access
- Integration with F005 for chat context injection and message access
- Save-to-KB from messages, topics, notes

### Out of Scope

- Custom embedding model training
- OCR for images (handled by preprocessing providers)
- Real-time collaborative KB editing
- KB sharing between users
- Web scraping beyond URL/sitemap loading
- Third-party vector DB integrations (Pinecone, Weaviate, etc.)

### Assumptions

- F004 model-provider is implemented with embedding and rerank model capability flags
- F005 chat-conversation provides message/topic/block access via IPC
- better-sqlite3 is available via F001 app-shell dependencies
- User has configured at least one embedding-capable provider before using KB features
- Memory system uses the same embedding model infrastructure as KB (via F004)
