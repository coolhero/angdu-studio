# Implementation Plan: Knowledge Base

**Branch**: `004-knowledge-base` | **Date**: 2026-03-04 | **Spec**: specs/004-knowledge-base/spec.md
**Input**: Feature specification from `/specs/004-knowledge-base/spec.md`

## Summary

RAG (Retrieval-Augmented Generation) pipeline for Cherry Studio. Main process KnowledgeService manages the full pipeline: document loading (6 item types) → preprocessing (PDF) → chunking (configurable) → embedding (AI SDK) → vector storage (Vectra). Queue-based processing with backpressure (30 concurrent / 80MB). Renderer Zustand store + hook provides UI state and actions. Semantic search with optional reranking.

## Technical Context

**Language/Version**: TypeScript 5.8
**Primary Dependencies**: Vercel AI SDK v6 (`ai`, `embed`, `embedMany`), Vectra (vector storage), unpdf (PDF extraction), cheerio (URL content), sitemapper (sitemap parsing)
**Storage**: IndexedDB (Dexie) for knowledge base entities + Vectra file-based indexes for vectors
**Testing**: Vitest (unit tests)
**Target Platform**: Electron 40 (macOS, Windows, Linux)
**Project Type**: Desktop app (Electron)
**Performance Goals**: Search <2s for 10K chunks, PDF pipeline <60s for 10 pages
**Constraints**: Local-only storage (Constitution X), 80MB max workload, 30 max concurrent items
**Scale/Scope**: Up to 10K+ vectors per knowledge base, multiple knowledge bases

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Electron Process Isolation | ✅ | RAG pipeline in main process, UI state in renderer, all communication via typed IPC |
| II. Service Layer Pattern | ✅ | Component → useKnowledge hook → KnowledgeService (IPC) → store |
| V. Typed IPC Channel System | ✅ | 9 new IPC channels as enum members in IpcChannel.ts |
| VI. Persistent State with Migration | ✅ | Vectra index per KB, Dexie knowledge_notes table, schema version tracked |
| VIII. Queue-Based Workload | ✅ | 30 concurrent / 80MB cap with workload estimation per item type |
| X. Desktop Data Sovereignty | ✅ | All vectors stored locally, embedding done via user's own API keys |
| XIV. Test-First | ✅ | Tests written before implementation |
| XIX. Demo-Ready | ✅ | Demo page with step-by-step instructions |

## Architecture

### Package Structure

No new packages. F004 adds files to existing project structure:

```
src/main/services/
  KnowledgeService.ts          # RAG pipeline, queue management, vector operations
  KnowledgeQueueManager.ts     # Backpressure enforcement, queue state
  KnowledgeLoaders.ts          # Item type-specific loaders (file, url, sitemap, note, directory, video)
  KnowledgeChunker.ts          # Recursive text splitter
  KnowledgeDeferredDelete.ts   # Pending deletion persistence and retry

src/renderer/src/stores/
  useKnowledgeStore.ts         # Zustand store for knowledge base state

src/renderer/src/hooks/
  useKnowledge.ts              # React hook for knowledge operations

src/renderer/src/services/
  KnowledgeSearchService.ts    # Renderer-side search orchestration (calls IPC)

packages/shared/
  IpcChannel.ts                # Add KB_* channels (9 new entries)
  types/knowledge.ts           # Shared types (KnowledgeBase, KnowledgeItem, etc.)
```

### Data Flow

```
[User Action] → useKnowledge hook → IPC → KnowledgeService (main)
                                              │
                                              ├── KnowledgeQueueManager (backpressure)
                                              │
                                              ├── KnowledgeLoaders (type-specific)
                                              │     ├── FileLoader (+ PDF preprocessing via unpdf)
                                              │     ├── UrlLoader (cheerio + readability)
                                              │     ├── SitemapLoader (sitemapper → UrlLoader)
                                              │     ├── NoteLoader (direct text)
                                              │     ├── DirectoryLoader (recursive discovery → FileLoader)
                                              │     └── VideoLoader (transcript extraction)
                                              │
                                              ├── KnowledgeChunker (recursive split)
                                              │
                                              ├── AI SDK embedMany() (embedding generation)
                                              │
                                              └── Vectra (vector storage + search)
```

### Queue Processing Flow

```
addItem() → estimateWorkload() → checkBackpressure()
                                       │
                              ┌────────┤
                              │ Under limits │ Over limits
                              ▼              ▼
                         processItem()    Queue as PENDING
                              │              │
                              ▼              │ (capacity freed)
                         load → chunk →     ─┘
                         embed → store
                              │
                              ▼
                         Status: COMPLETED
                              │
                              ▼
                         queueHandle() → process next pending
```

## Dependencies

### New NPM Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `vectra` | File-backed vector database with cosine similarity | ~50KB (pure TS) |
| `unpdf` | PDF text extraction (built on PDF.js) | ~2MB |
| `cheerio` | HTML parsing for URL content extraction | ~1MB |
| `@mozilla/readability` | Article content extraction algorithm | ~100KB |
| `sitemapper` | XML sitemap parsing | ~50KB |

### Existing Dependencies Used

| Package | Usage |
|---------|-------|
| `ai` (AI SDK v6) | `embed()`, `embedMany()`, `cosineSimilarity()` |
| `dexie` | knowledge_notes table storage |
| F001 IpcChannel | file:*, config:* channels |
| F002 Provider/Model | Embedding model configuration |
| F003 aiCore | RuntimeExecutor for model resolution |

## Implementation Phases

### Phase 1: Types and IPC Channels
- Shared knowledge types (KnowledgeBase, KnowledgeItem, KnowledgeReference, enums)
- IPC channel enum additions (9 channels)

### Phase 2: Chunking and Vector Storage
- KnowledgeChunker: recursive text splitter with configurable size/overlap
- Vectra integration: create/delete index, add/remove/search vectors

### Phase 3: Document Loaders
- FileLoader (text extraction, PDF via unpdf)
- UrlLoader (fetch + readability article extraction)
- SitemapLoader (parse → dispatch to UrlLoader)
- NoteLoader (direct text processing)
- DirectoryLoader (recursive discovery with progress reporting)
- VideoLoader (transcript extraction)

### Phase 4: Queue Management
- KnowledgeQueueManager: backpressure enforcement (30/80MB)
- Workload estimation per item type
- Queue state tracking and automatic processing

### Phase 5: KnowledgeService (Main Process)
- Full RAG pipeline orchestration
- IPC handler registration
- Deferred deletion with persistent pending file
- Startup retry for pending deletions

### Phase 6: Renderer State
- useKnowledgeStore (Zustand with persist)
- useKnowledge hook (React operations API)
- KnowledgeSearchService (search orchestration)
- Processing status tracking via IPC events

### Phase 7: Search and Reranking
- Semantic search via Vectra + AI SDK embedding
- Optional reranking with dedicated model
- KnowledgeReference result formatting

### Phase 8: Item Management
- Item refresh (remove + re-queue)
- Item removal with file cleanup
- Deduplication enforcement
- Note content management (separate Dexie table)

### Phase 9: Migration and Advanced Features
- Knowledge base migration (timestamped clone)
- PDF preprocessing with caching
- Knowledge_notes Dexie table

### Phase 10: Polish and Demo
- Demo page (demos/F004-knowledge-base.md)
- Final test run and type check
- Export verification
