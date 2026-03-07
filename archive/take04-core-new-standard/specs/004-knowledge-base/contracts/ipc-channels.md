# IPC Channels: Knowledge Base

**Feature**: F004-knowledge-base
**Date**: 2026-03-04

---

## KnowledgeBase Domain (7 channels)

All channels follow the typed IPC pattern from Constitution V.

### Handler Channels (R→M)

| Channel | Enum Name | Direction | Request | Response | Description |
|---------|-----------|-----------|---------|----------|-------------|
| `knowledge-base:create` | KB_Create | R→M | `{ name: string, model: Model, chunkSize?: number, chunkOverlap?: number, documentCount?: number }` | `KnowledgeBase` | Create a new knowledge base |
| `knowledge-base:delete` | KB_Delete | R→M | `{ id: string }` | `void` | Delete knowledge base with cascade cleanup |
| `knowledge-base:reset` | KB_Reset | R→M | `{ id: string }` | `void` | Reset knowledge base (remove items, keep config) |
| `knowledge-base:add-item` | KB_AddItem | R→M | `{ baseId: string, item: KnowledgeItem }` | `{ uniqueId: string, uniqueIds: string[], entriesAdded: number }` | Add and process an item |
| `knowledge-base:remove-item` | KB_RemoveItem | R→M | `{ baseId: string, itemId: string, uniqueId: string, uniqueIds: string[] }` | `void` | Remove item and clean up indexed data + files |
| `knowledge-base:search` | KB_Search | R→M | `{ baseId: string, query: string, count?: number }` | `KnowledgeReference[]` | Semantic search |
| `knowledge-base:rerank` | KB_Rerank | R→M | `{ baseId: string, query: string, results: KnowledgeReference[], model: Model }` | `KnowledgeReference[]` | Rerank search results |

### Event Channels (M→R)

| Channel | Enum Name | Direction | Payload | Description |
|---------|-----------|-----------|---------|-------------|
| `knowledge-base:item-status` | KB_ItemStatus | M→R | `{ baseId: string, itemId: string, status: ProcessingStatus, progress: number, error?: string }` | Processing status update |
| `knowledge-base:directory-progress` | KB_DirectoryProgress | M→R | `{ itemId: string, percent: number }` | Directory processing progress |

---

## IPC Channel Enum Additions

Add to `packages/shared/IpcChannel.ts`:

```typescript
// ── KnowledgeBase Domain ──
KB_Create = 'knowledge-base:create',
KB_Delete = 'knowledge-base:delete',
KB_Reset = 'knowledge-base:reset',
KB_AddItem = 'knowledge-base:add-item',
KB_RemoveItem = 'knowledge-base:remove-item',
KB_Search = 'knowledge-base:search',
KB_Rerank = 'knowledge-base:rerank',
KB_ItemStatus = 'knowledge-base:item-status',
KB_DirectoryProgress = 'knowledge-base:directory-progress',
```
