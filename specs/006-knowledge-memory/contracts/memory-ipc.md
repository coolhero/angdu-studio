# IPC Contracts: Memory System

**Feature**: F006-knowledge-memory | **Date**: 2026-03-19

## Memory CRUD

### memory:list
- **Direction**: renderer → main
- **Params**: `{ userId: string, page?: number, pageSize?: number, search?: string }`
- **Returns**: `{ memories: MemoryItem[], total: number }`

### memory:add
- **Direction**: renderer → main
- **Params**: `{ userId: string, content: string, metadata?: Record<string, any> }`
- **Returns**: `MemoryItem`
- **Side effects**: Generates embedding, checks hash dedup, creates history entry (ADD)

### memory:update
- **Direction**: renderer → main
- **Params**: `{ id: string, content: string }`
- **Returns**: `MemoryItem`
- **Side effects**: Re-generates embedding, creates history entry (UPDATE)

### memory:delete
- **Direction**: renderer → main
- **Params**: `{ id: string }`
- **Returns**: `void`
- **Side effects**: Creates history entry (DELETE)

### memory:search
- **Direction**: renderer → main
- **Params**: `{ userId: string, query: string, limit?: number }`
- **Returns**: `MemoryItem[]` (sorted by similarity)

### memory:get
- **Direction**: renderer → main
- **Params**: `{ id: string }`
- **Returns**: `{ memory: MemoryItem, history: MemoryHistoryItem[] }`

### memory:deleteAllForUser
- **Direction**: renderer → main
- **Params**: `{ userId: string }`
- **Returns**: `void`

### memory:getUsersList
- **Direction**: renderer → main
- **Returns**: `{ userId: string, count: number }[]`

## Memory Processing

### memory:extractFacts
- **Direction**: renderer → main
- **Params**: `{ userId: string, messages: Message[], config: MemoryConfig }`
- **Returns**: `{ facts: string[], stored: number }`
- **Notes**: Uses LLM to extract facts, then stores as MemoryItems. Called after conversation turn.

### memory:searchRelevant
- **Direction**: renderer → main
- **Params**: `{ userId: string, query: string, limit?: number }`
- **Returns**: `MemoryItem[]`
- **Notes**: Used by AI tool for context injection. Different from memory:search — optimized for relevance in conversation context.

## Memory Config

### memory:getConfig
- **Direction**: renderer → main
- **Returns**: `MemoryConfig`

### memory:updateConfig
- **Direction**: renderer → main
- **Params**: `Partial<MemoryConfig>`
- **Returns**: `MemoryConfig`

## Preload Whitelist

```
memory:list, memory:add, memory:update, memory:delete,
memory:search, memory:get, memory:deleteAllForUser,
memory:getUsersList, memory:extractFacts, memory:searchRelevant,
memory:getConfig, memory:updateConfig
```
