# IPC Contracts: Knowledge Base

**Feature**: F006-knowledge-memory | **Date**: 2026-03-19

## Knowledge Base Management

### kb:create
- **Direction**: renderer → main
- **Params**: `{ name: string, model: Model, dimensions?: number, documentCount?: number }`
- **Returns**: `KnowledgeBase`
- **Errors**: `{ code: 'INVALID_MODEL', message: string }` if model lacks embedding capability

### kb:delete
- **Direction**: renderer → main
- **Params**: `{ id: string }`
- **Returns**: `void`
- **Side effects**: Deletes all VectorRecords, removes KB data directory

### kb:reset
- **Direction**: renderer → main
- **Params**: `{ id: string }`
- **Returns**: `void`
- **Side effects**: Deletes all VectorRecords for this KB, keeps KnowledgeBase config

### kb:update
- **Direction**: renderer → main
- **Params**: `KnowledgeBase` (full object)
- **Returns**: `KnowledgeBase` (updated)
- **Validation**: chunkOverlap < chunkSize

### kb:list
- **Direction**: renderer → main
- **Returns**: `KnowledgeBase[]`

## Knowledge Item Operations

### kb:addItem
- **Direction**: renderer → main
- **Params**: `{ baseId: string, type: ItemType, content: string, remark?: string }`
- **Returns**: `KnowledgeItem`
- **Side effects**: Starts embedding pipeline (async). Dedup check for directory/url/sitemap.

### kb:removeItem
- **Direction**: renderer → main
- **Params**: `{ baseId: string, itemId: string }`
- **Returns**: `void`
- **Side effects**: Deletes VectorRecords for this item

### kb:addFiles
- **Direction**: renderer → main
- **Params**: `{ baseId: string, files: { path: string, remark?: string }[] }`
- **Returns**: `KnowledgeItem[]`
- **Side effects**: Batch add, starts embedding pipeline for each

### kb:retryItem
- **Direction**: renderer → main
- **Params**: `{ baseId: string, itemId: string }`
- **Returns**: `void`
- **Side effects**: Resets item status to pending, re-starts embedding pipeline

## Search & RAG

### kb:search
- **Direction**: renderer → main
- **Params**: `{ kbIds: string[], query: string, limit?: number, threshold?: number }`
- **Returns**: `KnowledgeReference[]`
- **Notes**: Searches across multiple KBs, merges and ranks results

### kb:rerank
- **Direction**: renderer → main
- **Params**: `{ results: KnowledgeReference[], query: string, rerankModel: Model }`
- **Returns**: `KnowledgeReference[]`

## Embedding

### ai:embed
- **Direction**: renderer → main (extends F004)
- **Params**: `{ text: string | string[], model: Model }`
- **Returns**: `{ embeddings: number[][] }`
- **Notes**: Uses F004 provider abstraction. Batches supported.

## Progress Events (main → renderer)

### kb:itemProgress
- **Direction**: main → renderer (event)
- **Payload**: `{ baseId: string, itemId: string, status: ItemStatus, progress: number, error?: string }`
- **Notes**: Sent during item processing. Renderer updates store.

## Preload Whitelist

All channels above must be registered in preload.ts:
```
kb:create, kb:delete, kb:reset, kb:update, kb:list,
kb:addItem, kb:removeItem, kb:addFiles, kb:retryItem,
kb:search, kb:rerank, ai:embed, kb:itemProgress,
kb:saveContent, kb:closeAll
```

## Additional Channels

### kb:saveContent
- **Direction**: renderer → main
- **Params**: `{ targetKBId: string, content: string, type: 'note', remark?: string }`
- **Returns**: `KnowledgeItem`
- **Notes**: Used by SaveToKnowledgePopup to save message/topic/note content as a KB note item

### kb:closeAll
- **Direction**: main internal (app shutdown)
- **Side effects**: Gracefully closes all RAG processing, persists pending deletes
