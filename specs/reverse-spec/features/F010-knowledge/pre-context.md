# F010-knowledge — Pre-Context

> Feature: Knowledge Base Management
> Tier: 2 | Release Group: RG-4 | Dependencies: F006-chat-core, F007-files

## Description

Knowledge base CRUD, document embedding (embedjs), vector search with reranking, document preprocessing providers (Doc2x, Mineru, PaddleOCR). Supports file, URL, note, sitemap, directory, memory, and video knowledge items.

## Source Reference

| Source File | Role | Rebuild Target |
|-------------|------|----------------|
| `src/main/services/KnowledgeService.ts` | KB service (main process) | [TBD] |
| `src/main/knowledge/` | Knowledge subsystem (embedjs) | [TBD] |
| `src/main/knowledge/embedjs/` | Embedding generation | [TBD] |
| `src/main/knowledge/preprocess/` | Document preprocessing | [TBD] |
| `src/main/knowledge/reranker/` | Result reranking | [TBD] |
| `src/renderer/src/pages/knowledge/` | Knowledge UI page | [TBD] |
| `src/renderer/src/store/knowledge.ts` | Redux knowledge slice | [TBD] |
| `src/renderer/src/types/knowledge.ts` | KB type definitions | [TBD] |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B156 | `src/main/services/KnowledgeService.ts` | `createBase()` | Creates knowledge base with embedding model config | P1 | extracted |
| B157 | `src/main/services/KnowledgeService.ts` | `deleteBase()` | Deletes KB and all embedded vectors | P1 | extracted |
| B158 | `src/main/services/KnowledgeService.ts` | `addItem()` | Adds document/URL/note to KB with chunking | P1 | extracted |
| B159 | `src/main/services/KnowledgeService.ts` | `removeItem()` | Removes item from KB | P1 | extracted |
| B160 | `src/main/services/KnowledgeService.ts` | `search()` | Vector search with reranking pipeline | P1 | extracted |
| B161 | `src/main/knowledge/` | `generateEmbeddings()` | Generates vector embeddings for document chunks | P1 | extracted |
| B162 | `src/main/knowledge/` | `chunkDocument()` | Splits document into chunks (configurable size/overlap) | P1 | extracted |
| B163 | `src/main/knowledge/reranker/` | `rerankResults()` | Reranks search results (Jina, Bailian, TEI, Voyage) | P2 | extracted |
| B164 | `src/main/knowledge/preprocess/` | `preprocessDocument()` | Preprocesses docs via Doc2x, Mineru, PaddleOCR | P2 | extracted |
| B165 | `src/main/ipc.ts` | `KnowledgeBase_Create()` | IPC handler for KB creation | P1 | extracted |
| B166 | `src/main/ipc.ts` | `KnowledgeBase_Search()` | IPC handler for KB search | P1 | extracted |
| B167 | `src/main/ipc.ts` | `KnowledgeBase_Rerank()` | IPC handler for result reranking | P2 | extracted |
| B168 | `src/renderer/src/store/knowledge.ts` | `addBase()` | Adds KB to state | P1 | extracted |
| B169 | `src/renderer/src/store/knowledge.ts` | `deleteBase()` | Removes KB from state | P1 | extracted |
| B170 | `src/renderer/src/store/knowledge.ts` | `updateBase()` | Updates KB metadata | P1 | extracted |
| B171 | `src/renderer/src/store/knowledge.ts` | `addItem()` | Adds item to KB state | P1 | extracted |
| B172 | `src/renderer/src/pages/knowledge/` | `renderKnowledgeSidebar()` | Renders KB list with DnD reordering | P1 | extracted |
| B173 | `src/renderer/src/pages/knowledge/` | `renderKnowledgeContent()` | Renders KB items and search interface | P1 | extracted |
| B174 | `src/renderer/src/pages/knowledge/` | `handleAddDocument()` | Handles document upload to KB | P1 | extracted |
| B175 | `src/renderer/src/pages/knowledge/` | `handleSearch()` | Executes search query against KB | P1 | extracted |
| B176 | `src/renderer/src/types/knowledge.ts` | `KnowledgeBase` interface | KB entity type definition | P1 | extracted |

## For /speckit.specify

- KB supports 7 item types: file, URL, note, sitemap, directory, memory, video
- Document pipeline: upload → preprocess (optional) → chunk → embed → store
- Search: vector similarity + optional reranking
- Reranker providers: Jina, Bailian, TEI, Voyage
- Preprocessing: Doc2x, Mistral, Mineru, Open-Mineru, PaddleOCR
- Configurable: chunk size, chunk overlap, similarity threshold, rerank model, dimensions

## For /speckit.plan

- Dependencies: Uses F007-files for uploads, integrates with F006-chat-core for RAG
- Entities: KnowledgeBase, KnowledgeItem (owned), FileMetadata (referenced from F007)
- Migration: Redux knowledge slice → Zustand store. embedjs stays. LibSQL → better-sqlite3
- IPC: KnowledgeBase_Create, KnowledgeBase_Delete, KnowledgeBase_Add, KnowledgeBase_Remove, KnowledgeBase_Search, KnowledgeBase_Rerank
