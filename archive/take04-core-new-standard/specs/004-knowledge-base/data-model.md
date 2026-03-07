# Data Model: Knowledge Base

**Feature**: F004-knowledge-base
**Date**: 2026-03-04

---

## Entities

### KnowledgeBase

Represents a RAG knowledge base with embedding configuration and a collection of knowledge items.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PK, UUID | Unique knowledge base identifier |
| `name` | string | required | Display name |
| `model` | Model | required, embedded | Embedding model reference (from F002) |
| `description` | string | optional | Description text |
| `documentCount` | number | default 30 | Max search results per query |
| `chunkSize` | number | default 1000 | Chunk size in characters |
| `chunkOverlap` | number | default 200, < chunkSize | Overlap between chunks |
| `items` | KnowledgeItem[] | default [] | Collection of knowledge items |
| `rerankModel` | Model | optional, embedded | Model for result reranking |
| `preprocessModel` | Model | optional, embedded | Model for PDF preprocessing |
| `preprocessProvider` | string | optional, FK → Provider | Provider for preprocessing |
| `version` | number | default 1 | Schema version for migration |
| `created_at` | number | timestamp | Creation timestamp |
| `updated_at` | number | timestamp | Last update timestamp |

**Storage**: IndexedDB (Dexie)
**Relationships**:
- Has many KnowledgeItem (1:N via items[])
- References Model (embedding, reranker, preprocessor)
- References Provider (preprocessing)
- Referenced by Assistant (F005, N:M via knowledge_bases[])

---

### KnowledgeItem

An individual content item within a knowledge base. Discriminated union of 6 types.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PK, UUID | Unique item identifier |
| `baseId` | string | FK → KnowledgeBase | Owning knowledge base |
| `type` | KnowledgeItemType | required | 'file' \| 'url' \| 'sitemap' \| 'note' \| 'directory' \| 'video' |
| `content` | FileMetadata \| string | type-dependent | File metadata for file/video/directory; URL string for url/sitemap; note text stored separately |
| `uniqueId` | string | optional | Primary dedup/index identifier assigned by loader |
| `uniqueIds` | string[] | optional | All index identifiers (for multi-chunk items like sitemaps) |
| `status` | ProcessingStatus | required | 'pending' \| 'processing' \| 'completed' \| 'error' |
| `progress` | number | 0-100 | Processing progress percentage |
| `error` | string | optional | Error message if status is 'error' |
| `retryCount` | number | default 0 | Number of processing retries |
| `remark` | string | optional | User annotation |
| `sourceUrl` | string | optional | Source URL for url/sitemap items |
| `isPreprocessed` | boolean | optional | Whether PDF preprocessing was applied |
| `created_at` | number | timestamp | Creation timestamp |
| `updated_at` | number | timestamp | Last update timestamp |

**Storage**: IndexedDB (Dexie), embedded in KnowledgeBase.items[]
**Relationships**:
- Belongs to KnowledgeBase (N:1 via baseId)
- References FileMetadata (F001) via content (for file/video/directory types)

**Type-specific fields**:
| Type | Additional Fields |
|------|-------------------|
| file | content: FileMetadata (with fileId, fileName, fileSize) |
| url | sourceUrl (required), content: URL string |
| sitemap | sourceUrl (required), content: sitemap URL |
| note | content: note ID (actual text in knowledge_notes table) |
| directory | content: FileMetadata (directory path), progress tracked via IPC |
| video | content: FileMetadata (video file, SRT transcript) |

---

### KnowledgeReference

Transient search result object. Not persisted — returned from RAG search operations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | required | Reference identifier |
| `content` | string | required | Retrieved text chunk |
| `sourceUrl` | string | optional | Source URL of the content |
| `type` | string | optional | Content type of the source |
| `score` | number | optional | Relevance/similarity score (0.0-1.0) |
| `metadata` | object | optional | Additional context metadata |

**Storage**: In-memory (transient)

---

### KnowledgeNote (secondary)

Separate storage for note content, decoupled from KnowledgeItem.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PK, matches KnowledgeItem.id | Note identifier |
| `content` | string | required | Full note text |
| `updated_at` | number | timestamp | Last update timestamp |

**Storage**: IndexedDB (Dexie) — separate `knowledge_notes` table

---

## Enumerations

### KnowledgeItemType
`'file' | 'url' | 'sitemap' | 'note' | 'directory' | 'video'`

### ProcessingStatus
`'pending' | 'processing' | 'completed' | 'error'`

---

## Dexie Schema Additions

New tables added to the Dexie database (extending F001's DexieStorageService):

```
knowledge_notes: '&id'
```

KnowledgeBase entities are stored within the Zustand store (persisted via Zustand persist middleware), not in a separate Dexie table. This matches the existing pattern where the store holds the primary entity state.

---

## Vector Storage (Vectra)

Each KnowledgeBase has a dedicated Vectra index stored in the app data directory:

```
{appDataPath}/knowledge/{knowledgeBaseId}/
  ├── index.json        (Vectra index metadata)
  └── *.json            (Per-item metadata files)
```

Vector dimensions are determined by the embedding model (typically 1536 for OpenAI, 768 for Google, etc.).
