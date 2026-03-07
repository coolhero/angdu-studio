# Research: Knowledge Base

**Feature**: F004-knowledge-base
**Date**: 2026-03-04

---

## Decision 1: Vector Storage

**Decision**: Use Vectra (pure TypeScript, file-backed vector database)
**Rationale**: Zero native dependencies means no Electron rebuild issues. File-backed with in-memory search handles 10K+ vectors at 1536 dimensions (~60MB). Simple API with cosine similarity and metadata filtering.
**Alternatives considered**:
- LanceDB: Native NAPI addons cause Electron bundler issues; overkill for desktop app scale
- hnswlib-node: Requires C++ compilation; hnswlib-wasm alternative adds complexity
- ChromaDB: Requires running server process — incompatible with serverless Electron
- Custom IndexedDB: Possible but unnecessary when Vectra provides a clean solution

---

## Decision 2: Document Chunking

**Decision**: Custom recursive character text splitter
**Rationale**: Chunking logic is simple (split on paragraph breaks, then sentences, with configurable size/overlap). ~50 lines of TypeScript. Full control, no external dependency.
**Alternatives considered**:
- Chonkie: Good TypeScript library but adds a dependency for trivial logic
- LangChain text splitters: Heavy dependency tree for just chunking
- llm-chunk: Too simplistic, limited configurability

---

## Decision 3: PDF Text Extraction

**Decision**: Use unpdf (modern TypeScript wrapper around PDF.js)
**Rationale**: Clean `extractText()` API, works in Node.js (Electron main process), actively maintained by UnJS team, no native dependencies. Built on the battle-tested PDF.js engine.
**Alternatives considered**:
- pdf-parse: Unmaintained, known issues with some PDFs
- pdfjs-dist: Direct use is more complex; unpdf wraps it cleanly
- pdf2json: More suited for structured data extraction than plain text

---

## Decision 4: Web Content Fetching

**Decision**: Use cheerio + @mozilla/readability (or cheer-reader if available)
**Rationale**: Mozilla's readability algorithm reliably extracts article content. Cheerio-based approach avoids jsdom overhead. Works in Electron main process.
**Alternatives considered**:
- jsdom + @mozilla/readability: Heavy jsdom dependency (~10MB)
- Raw cheerio: No readability algorithm; would need custom article extraction

---

## Decision 5: Sitemap Parsing

**Decision**: Use sitemapper
**Rationale**: Most mature sitemap parser for Node.js, TypeScript support, handles nested sitemaps (sitemap indexes), configurable concurrency and timeouts.
**Alternatives considered**:
- sitemap-xml-parser: Abandoned (6 years old)
- Manual XML parsing with fast-xml-parser: More work for a solved problem

---

## Decision 6: Embedding Generation

**Decision**: Use Vercel AI SDK `embed()` and `embedMany()` from the `ai` package (already installed)
**Rationale**: Already in the project at v6.x. Provides auto-batching, concurrency control, retries, and multi-provider support. The `embedMany()` function handles batch embedding with `maxParallelCalls` for throttling.
**Alternatives considered**: None — AI SDK is the established choice per F003.

---

## Decision 7: Reranking

**Decision**: Use AI SDK `generateText()` with reranking prompt, or provider-specific reranking API
**Rationale**: Some providers (Cohere, Jina) offer native reranking APIs. For providers without native reranking, a prompt-based approach using `generateText()` works. The knowledge base stores the reranker model reference, and the service layer handles the reranking strategy based on model type.
**Alternatives considered**: Dedicated reranking libraries — unnecessary complexity for a configurable model-based approach.

---

## Decision 8: Knowledge Base Architecture

**Decision**: Main process KnowledgeService + renderer Zustand store + useKnowledge hook
**Rationale**: Follows the established Service Layer Pattern (Constitution II): Component → Hook → Service → Store/IPC. RAG pipeline runs in main process (Node.js, file system access). UI state managed via Zustand store in renderer. Hook provides clean API for React components.
**Alternatives considered**: Renderer-only processing — not viable due to file system access requirements and Electron process isolation (Constitution I).

---

## Decision 9: Note Content Storage

**Decision**: Separate Dexie table `knowledge_notes` for note content
**Rationale**: Decouples large text content from the KnowledgeItem record. Enables efficient content retrieval without loading entire knowledge base state. Follows the existing Dexie-based persistence pattern from F001.
**Alternatives considered**: Embedded content in item record — bloats store updates and memory usage.
