# F011 — Knowledge Base — Pre-Context

> Feature ID: F011 | Tier: 2 | Release Group: RG-4

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/knowledge.ts` | KnowledgeBase, KnowledgeItem, KnowledgeReference types |
| `src/renderer/src/store/knowledge.ts` | Knowledge base state management |
| `src/main/services/KnowledgeService.ts` | KB operations: create, add, remove, search, rerank |
| `src/main/ipc.ts` | KnowledgeBase_* IPC handlers |
| `src/renderer/src/pages/knowledge/` | Knowledge base UI |
| `src/main/knowledge/` | Vector storage and embedding |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B127 | `types/knowledge.ts` | `KnowledgeBase` | KB entity: id, name, model (embedding), dimensions, items[], chunkSize, chunkOverlap, threshold, rerankModel | P1 | Source |
| B128 | `types/knowledge.ts` | `KnowledgeItem` | Item entity: id, baseId, type (file/url/note/sitemap/directory), content, processingStatus | P1 | Source |
| B129 | `types/knowledge.ts` | `KnowledgeItemType` | 7 source types: file, url, note, sitemap, directory, memory, video | P1 | Source |
| B130 | `types/knowledge.ts` | `ProcessingStatus` | Pipeline: pending -> processing -> completed/failed | P1 | Source |
| B131 | `KnowledgeService.ts` | `create()` | Creates KB with embedding configuration; initializes vector store | P1 | Source |
| B132 | `KnowledgeService.ts` | `add()` | Adds item: ingest content, chunk, embed, store vectors | P1 | Source |
| B133 | `KnowledgeService.ts` | `search()` | Vector similarity search against KB | P1 | Source |
| B134 | `KnowledgeService.ts` | `rerank()` | Re-rank search results using rerank model | P2 | Source |
| B135 | `KnowledgeService.ts` | `delete()` / `remove()` | Delete entire KB or remove single item | P1 | Source |
| B136 | `KnowledgeService.ts` | `reset()` | Clear all items from KB, preserve config | P2 | Source |
| B137 | `types/knowledge.ts` | `KnowledgeBaseParams` | Search params: embedApiClient, rerankApiClient, documentCount | P1 | Source |
| B138 | `types/knowledge.ts` | `KnowledgeReference` | Search result reference: content, sourceUrl, type, file, metadata | P1 | Source |
| B139 | `types/knowledge.ts` | `PreprocessProvider` | Document preprocessing: doc2x, mistral, mineru, paddleocr providers | P2 | Source |

---

## For /speckit.specify Hints

- Define KB lifecycle (create -> add items -> search -> delete)
- Specify vector storage engine choice (SQLite-backed or separate)
- Document embedding flow (chunk -> embed -> store)
- Define search protocol (query -> embed -> similarity -> rerank -> return)
- Specify processing pipeline with progress tracking

## For /speckit.plan Hints

- Task 1: Knowledge base Zustand store
- Task 2: KB CRUD UI
- Task 3: Item ingestion pipeline (file, URL, note, directory)
- Task 4: Embedding service integration
- Task 5: Vector search implementation
- Task 6: Re-ranking service
- Task 7: Processing status tracking UI

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F005 | Model Management | Embedding model and rerank model selection |
| Depends on F008 | Data & Storage | File ingestion, KB persistence |
| Provides to F006 | Chat Core | Assistant.knowledge_bases attachment |
| Provides to F010 | Chat Advanced | KnowledgeReference in citation blocks |
