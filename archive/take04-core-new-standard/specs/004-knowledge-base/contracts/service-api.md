# Service API: Knowledge Base

**Feature**: F004-knowledge-base
**Date**: 2026-03-04

---

## Main Process — KnowledgeService

Located at `src/main/services/KnowledgeService.ts`.

### Public Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `create` | `params: KnowledgeBaseParams` | `KnowledgeBase` | Initialize vector index, return KB entity |
| `delete` | `id: string` | `void` | Cascade delete: remove vector index, pending file, files |
| `reset` | `id: string` | `void` | Remove all items/vectors, keep config |
| `addItem` | `baseId: string, item: KnowledgeItem` | `LoaderResult` | Queue item for RAG pipeline processing |
| `removeItem` | `baseId: string, itemId: string, uniqueId: string, uniqueIds: string[]` | `void` | Remove indexed data + cleanup files |
| `search` | `baseId: string, query: string, count?: number` | `KnowledgeReference[]` | Embed query, search vector index |
| `rerank` | `baseId: string, query: string, results: KnowledgeReference[], model: Model` | `KnowledgeReference[]` | Rerank results via model |
| `retryPendingDeletions` | — | `void` | Retry failed deletions from pending file (called on startup) |

### Internal Methods (not exposed via IPC)

| Method | Description |
|--------|-------------|
| `processItem` | Route item by type → loader → chunk → embed → store |
| `processFile` | Load file content (with optional PDF preprocessing) |
| `processUrl` | Fetch URL → extract article text → chunk |
| `processSitemap` | Parse sitemap → fetch each URL → process |
| `processNote` | Read note content → chunk |
| `processDirectory` | Recursive file discovery → process each file with progress |
| `processVideo` | Extract transcript → chunk |
| `chunkText` | Split text with configured size/overlap |
| `embedChunks` | Generate embeddings via AI SDK `embedMany()` |
| `estimateWorkload` | Calculate workload by item type |
| `checkBackpressure` | Enforce 30 item / 80MB limits |
| `queueHandle` | Process next queued item when capacity available |

---

## Renderer — useKnowledgeStore (Zustand)

Located at `src/renderer/src/stores/useKnowledgeStore.ts`.

### State

| Field | Type | Description |
|-------|------|-------------|
| `bases` | KnowledgeBase[] | All knowledge bases |

### Actions

| Action | Parameters | Description |
|--------|-----------|-------------|
| `addBase` | `base: KnowledgeBase` | Add a new knowledge base |
| `removeBase` | `id: string` | Remove a knowledge base |
| `updateBase` | `id: string, updates: Partial<KnowledgeBase>` | Update KB fields |
| `addItem` | `baseId: string, item: KnowledgeItem` | Add item to a KB |
| `removeItem` | `baseId: string, itemId: string` | Remove item from KB |
| `updateItem` | `baseId: string, itemId: string, updates: Partial<KnowledgeItem>` | Update item fields |
| `updateItemStatus` | `baseId: string, itemId: string, status: ProcessingStatus, progress: number, error?: string` | Update processing status |
| `clearCompletedProcessing` | `baseId: string` | Clear completed/failed statuses |

---

## Renderer — useKnowledge Hook

Located at `src/renderer/src/hooks/useKnowledge.ts`.

### API

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `addFiles` | `baseId: string, files: FileMetadata[]` | `void` | Bulk file addition with queue trigger |
| `addUrl` | `baseId: string, url: string` | `void` | Add URL item |
| `addSitemap` | `baseId: string, url: string` | `void` | Add sitemap item |
| `addNote` | `baseId: string, content: string` | `void` | Add note (persists to knowledge_notes) |
| `addDirectory` | `baseId: string, dirPath: string` | `void` | Add directory item |
| `addVideo` | `baseId: string, file: FileMetadata` | `void` | Add video item |
| `removeItem` | `baseId: string, itemId: string` | `void` | Remove item with file cleanup |
| `refreshItem` | `baseId: string, itemId: string` | `void` | Re-process item |
| `migrateBase` | `baseId: string` | `void` | Clone KB with timestamp suffix |
| `getNoteContent` | `noteId: string` | `string` | Read note from knowledge_notes |
| `updateNoteContent` | `noteId: string, content: string` | `void` | Update note in DB and store |
| `clearCompleted` | `baseId: string` | `void` | Clear completed/failed statuses |

### Selectors (computed)

| Selector | Returns | Description |
|----------|---------|-------------|
| `fileItems` | KnowledgeItem[] | Items filtered by type='file' |
| `urlItems` | KnowledgeItem[] | Items filtered by type='url' |
| `sitemapItems` | KnowledgeItem[] | Items filtered by type='sitemap' |
| `directoryItems` | KnowledgeItem[] | Items filtered by type='directory' |
| `videoItems` | KnowledgeItem[] | Items filtered by type='video' |
| `noteItems` | KnowledgeItem[] | Items filtered by type='note' |
