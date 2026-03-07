# Demo: F004 — Knowledge Base (RAG Pipeline)

**Feature**: Knowledge Base with vector search, queue-based processing, and 6 item types
**Status**: Implemented

---

## Demo Components

| Component | Type | Fate | Location |
|-----------|------|------|----------|
| KnowledgeService | Production | Core service | `src/main/services/KnowledgeService.ts` |
| KnowledgeChunker | Production | Core utility | `src/main/services/KnowledgeChunker.ts` |
| KnowledgeLoaders | Production | Core utility | `src/main/services/KnowledgeLoaders.ts` |
| KnowledgeQueueManager | Production | Core utility | `src/main/services/KnowledgeQueueManager.ts` |
| KnowledgeDeferredDelete | Production | Core utility | `src/main/services/KnowledgeDeferredDelete.ts` |
| useKnowledgeStore | Production | Zustand store | `src/renderer/src/stores/useKnowledgeStore.ts` |
| useKnowledge | Production | React hook | `src/renderer/src/hooks/useKnowledge.ts` |
| KnowledgeSearchService | Production | Renderer service | `src/renderer/src/services/KnowledgeSearchService.ts` |
| Preload API bridge | Production | IPC bridge | `src/preload/api/knowledge.ts` |
| IPC registration | Production | IPC setup | `src/main/ipc/knowledge.ipc.ts` |

---

## How to Demo

### Prerequisites
- Node.js 20+, pnpm installed
- An embedding model provider configured (e.g., OpenAI)

### Step 1: Run Tests
```bash
pnpm test -- --run tests/unit/main/services/Knowledge
```
Verifies all knowledge base components work correctly.

### Step 2: Architecture Overview

The knowledge base implements a complete RAG (Retrieval-Augmented Generation) pipeline:

```
User adds item → Loader extracts text → Chunker splits text
  → AI SDK generates embeddings → Vectra stores vectors
  → Search: embed query → cosine similarity → return ranked results
```

### Step 3: Key Features to Verify

1. **6 Item Types**: file, url, sitemap, note, directory, video
2. **Queue Backpressure**: Max 30 concurrent items, 80MB workload cap
3. **Deferred Deletion**: Failed deletions persisted and retried on startup
4. **Recursive Chunking**: Split on paragraphs → sentences → words → characters
5. **IPC Events**: Real-time status updates (KB_ItemStatus, KB_DirectoryProgress)
6. **Dexie Integration**: KnowledgeNote stored in IndexedDB with version migration

### Step 4: Component Verification

```
# Chunker test (pure function, no deps)
pnpm test -- --run tests/unit/main/services/KnowledgeChunker.test.ts

# Queue manager test
pnpm test -- --run tests/unit/main/services/KnowledgeQueueManager.test.ts

# Deferred delete test
pnpm test -- --run tests/unit/main/services/KnowledgeDeferredDelete.test.ts

# Loaders test
pnpm test -- --run tests/unit/main/services/KnowledgeLoaders.test.ts

# Service test (integration)
pnpm test -- --run tests/unit/main/services/KnowledgeService.test.ts
```

---

## IPC Channel Map

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `KB_Create` | R→M | Create knowledge base with config |
| `KB_Delete` | R→M | Delete KB and cascade cleanup |
| `KB_Reset` | R→M | Remove all items, preserve config |
| `KB_AddItem` | R→M | Add item to KB (triggers RAG pipeline) |
| `KB_RemoveItem` | R→M | Remove item from KB |
| `KB_Search` | R→M | Semantic vector search |
| `KB_Rerank` | R→M | AI-based result reranking |
| `KB_ItemStatus` | M→R | Processing status event |
| `KB_DirectoryProgress` | M→R | Directory scan progress event |
