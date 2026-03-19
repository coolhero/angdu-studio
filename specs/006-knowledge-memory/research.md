# Research: Knowledge & Memory System

**Branch**: `006-knowledge-memory` | **Date**: 2026-03-19

## R1: Vector Store on better-sqlite3

**Decision**: Custom vector store using better-sqlite3 with manual cosine similarity computation.

**Rationale**: better-sqlite3 is already in the stack (F001). No native vector extension available for better-sqlite3 in Electron, but cosine similarity can be computed in JS after fetching candidate rows. For small-to-medium KBs (< 100k vectors), brute-force scanning with a JS cosine function is viable. Store embeddings as Buffer blobs, deserialize to Float32Array.

**Alternatives considered**:
- sqlite-vss: Not compatible with better-sqlite3 in Electron (native extension loading issues)
- LanceDB: Additional native dependency, overkill for Electron desktop app
- In-memory HNSW (hnswlib): Good performance but loses index on crash; SQLite survives
- Chromadb: Server-based, not suitable for embedded desktop app

**Implementation approach**:
- Table: `vectors(id TEXT, kb_id TEXT, content TEXT, metadata TEXT, embedding BLOB)`
- Query: SELECT all vectors for kb_id → compute cosine similarity in JS → sort → top-K
- For larger KBs: partition by kb_id (separate tables or indexed WHERE clause)

## R2: Text Extraction Libraries

**Decision**: Use `pdf-parse` for PDF, `mammoth` for DOCX, native `fs.readFile` for txt/md.

**Rationale**: pdf-parse is pure JS (no native deps), works in Electron main process. mammoth handles DOCX-to-text well. Both are lightweight.

**Import verification needed**: pdf-parse v2 has ESM/CJS compatibility issues — verify import before depending on it. Use v1.x if v2 fails.

**Alternatives considered**:
- pdfjs-dist: Heavier, designed for browser rendering not text extraction
- textract: Depends on OS tools (antiword, pdftotext) — not portable for Electron

## R3: Chunking Strategy

**Decision**: Fixed-size chunking with overlap. Configurable chunk size (default 1000 chars) and overlap (default 200 chars).

**Rationale**: Simple, predictable, works well for most document types. Source app uses this approach. More sophisticated strategies (semantic chunking) can be added later as a preprocessing provider.

## R4: Memory System Architecture

**Decision**: Main-process MemoryService with better-sqlite3 storage. LLM-based fact extraction via F004 provider API.

**Rationale**: Memory items need to persist across renderer crashes (ARC-01). Embedding-based search requires vector storage. Main process is the right location per constitution (ARC-04, ARC-05).

**Fact extraction**: Use configurable LLM prompt to extract facts from conversation. Default prompt asks for key facts, preferences, and context. User can customize.

## R5: AI Tool Pattern for KB/Memory Integration

**Decision**: Register KB search and memory search as AI tools — the AI decides when to invoke them based on conversation context.

**Rationale**: Source app uses Plugin hook pattern where KB/memory are registered as tools the AI can call. This is architecturally different from system message injection (forced every message). AI Tool pattern is more efficient and produces better UX — only searches when relevant.

## R6: Citation Rendering Pipeline

**Decision**: 8-stage pipeline: inject → AI cite → extract → filter → renumber → store → render → interact.

**Rationale**: Each stage handles a specific concern. Source app's CitationsList follows this pattern. Simplified approaches (e.g., showing all search results as citations) produce incorrect UX.

**Key decisions**:
- Numbering: First-appearance order in AI text (not search rank order)
- Filtering: Only citations actually referenced by AI become citation blocks
- Rendering: Inline [N] sup badges with tooltip on hover, detail on click
- Storage: refNumber (display) + originalRefNumber (lookup) + filePath + text

## R7: Embedding Model Integration

**Decision**: Use F004's AI core interface for embedding generation. The `ai:embed` IPC channel wraps the provider's embedding API.

**Rationale**: F004 already abstracts provider differences. Adding an `ai:embed` channel extends the existing pattern. Provider-specific URL handling (Azure /v1, Gemini /openai, Ollama strip /api) is already handled by F004.

## R8: Preprocessing Provider Architecture

**Decision**: Factory pattern with interface contract. DefaultPreprocessProvider is required; specialized providers (Doc2x, Mineru, Mistral, OpenMineru, PaddleOCR) are optional.

**Rationale**: Source app uses this pattern. Each provider has different external API requirements. Factory allows runtime selection per KB configuration.

## R9: Similarity Threshold

**Decision**: Default threshold 0.3 (not 0.7). Configurable per KB.

**Rationale**: text-embedding-3-small and similar models produce cosine similarities of 0.2–0.5 for relevant matches. A threshold of 0.7 would filter out almost all results. Source app's DEFAULT_KNOWLEDGE_THRESHOLD should be verified but likely low.
