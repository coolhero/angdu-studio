# Data Model: Knowledge & Memory System

**Branch**: `006-knowledge-memory` | **Date**: 2026-03-19

## Entities

### KnowledgeBase

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | PK, uuid (nanoid) | |
| name | string | Required, non-empty after trim | |
| model | Model (ref → F004) | Required, must have embedding capability | Embedding model for this KB |
| dimensions | number \| null | Optional, auto-populated per model | Embedding dimensions |
| items | KnowledgeItem[] | Embedded array | |
| documentCount | number | Default 6, range 1-50 | Max search results |
| chunkSize | number \| null | Optional, min 100 | Text chunk size in chars |
| chunkOverlap | number \| null | Optional, min 0, must be < chunkSize | |
| threshold | number \| null | Optional, default 0.3 | Similarity threshold |
| rerankModel | Model \| null | Optional, must have rerank capability | |
| preprocessProvider | { type: 'preprocess', provider: PreprocessProvider } \| null | Optional | |
| version | number | Auto-increment on update | |
| created_at | number | Epoch ms | |
| updated_at | number | Epoch ms | |

**Validation**:
- name.trim().length > 0
- model must have capabilities including 'embedding'
- if chunkOverlap && chunkSize: chunkOverlap < chunkSize

### KnowledgeItem

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | PK, uuid (nanoid) | |
| baseId | string | FK → KnowledgeBase.id | |
| type | 'file' \| 'directory' \| 'url' \| 'sitemap' \| 'note' \| 'video' | Required | |
| content | string | Required | Path, URL, or text content |
| status | 'pending' \| 'processing' \| 'completed' \| 'failed' | Default 'pending' | |
| progress | number | 0-100 | Processing progress |
| error | string \| null | | Error message if failed |
| retryCount | number | Default 0 | |
| uniqueId | string \| null | | Embedding dedup ID |
| remark | string \| null | | User remarks |
| created_at | number | Epoch ms | |
| updated_at | number | Epoch ms | |

**Dedup rules**:
- directory: skip if content (path) already exists in base
- url: skip if content already exists in base
- sitemap: skip if content already exists in base
- file, note, video: always add

### VectorRecord (SQLite table — main process)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | PK, uuid | |
| kb_id | string | Indexed, FK → KnowledgeBase.id | |
| item_id | string | FK → KnowledgeItem.id | |
| content | string | The text chunk | |
| metadata | string (JSON) | Source file, chunk index, etc. | |
| embedding | Buffer (BLOB) | Float32Array serialized | |
| created_at | number | Epoch ms | |

### MemoryItem

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | PK, uuid | |
| userId | string | Required, indexed | Per-user isolation |
| content | string | Required, non-empty | The memory text |
| hash | string | SHA-256 of content | Deduplication |
| embedding | Buffer (BLOB) | Float32Array serialized | For similarity search |
| metadata | string (JSON) | Source context, tags | |
| score | number \| null | Relevance score from search | Transient — not persisted |
| created_at | string | ISO 8601 | |
| updated_at | string | ISO 8601 | |

### MemoryConfig

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| embeddingModel | Model (ref → F004) | Required for memory to function | |
| llmModel | Model (ref → F004) | Required for fact extraction | |
| dimensions | number | From embedding model | |
| customFactExtractionPrompt | string \| null | Override default extraction prompt | |
| enabled | boolean | Default false | Global toggle |

### MemoryHistoryItem

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | PK, uuid | |
| memoryId | string | FK → MemoryItem.id | |
| operation | 'ADD' \| 'UPDATE' \| 'DELETE' | Required | |
| previousContent | string \| null | Before change | |
| newContent | string \| null | After change | |
| timestamp | string | ISO 8601 | |

### KnowledgeReference (transient — not persisted)

| Field | Type | Notes |
|-------|------|-------|
| refNumber | number | Display number (first-appearance order in AI text) |
| originalRefNumber | number | Original search result rank |
| sourceFile | string | Source file path or URL |
| content | string | Matched text snippet |
| similarity | number | Cosine similarity score |
| kbId | string | Source knowledge base ID |
| kbName | string | Source KB name for display |

### SaveToKnowledgeRequest (transient)

| Field | Type | Notes |
|-------|------|-------|
| sourceType | 'message' \| 'topic' \| 'note' | |
| sourceId | string | Message/topic/note ID |
| contentTypes | string[] | Selected content types to save |
| targetKBId | string | Target knowledge base |

## Relationships

```
KnowledgeBase 1──∞ KnowledgeItem (embedded in store, items[])
KnowledgeBase 1──∞ VectorRecord (SQLite, FK kb_id)
KnowledgeItem 1──∞ VectorRecord (SQLite, FK item_id)
KnowledgeBase ∞──1 Model (F004, embedding model)
KnowledgeBase ∞──1? Model (F004, rerank model, optional)
MemoryItem ∞──1 MemoryConfig (shared config)
MemoryItem 1──∞ MemoryHistoryItem
Assistant (F005) ∞──∞ KnowledgeBase (via assistant.knowledge_bases[])
MessageBlock (F005) ──→ KnowledgeReference[] (citation block)
MessageBlock (F005) ──→ MemoryItem[] (memory citation block)
```

## State Transitions

### KnowledgeItem Processing
```
pending → processing → completed
                    ↘ failed (retryCount++)
failed → pending (manual retry)
```

### Memory Operations
```
conversation → extractFacts → ADD memories
search query → searchMemories → inject context
user action → UPDATE/DELETE memory → history entry
```
