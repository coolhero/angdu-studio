# Research: Chat Conversation

## R-001: Message/Topic Storage — better-sqlite3 via Drizzle ORM

**Decision**: Use better-sqlite3 via Drizzle ORM in main process, accessed via typed IPC channels.
**Rationale**: ACID transactions guarantee message ordering and consistency. Crash-safe — data survives renderer process crashes (ARC-05). SQLite handles 10K+ messages efficiently with indexed queries. Replaces the source project's IndexedDB/Dexie approach, which is renderer-bound and loses data on renderer crash.
**Alternatives considered**:
- IndexedDB (Dexie): Renderer-bound, no crash isolation, complex migration story
- electron-store (JSON file): No query capability, O(n) scans for message lookup, file corruption risk on large datasets
- PouchDB: Overkill sync layer, large dependency

## R-002: Rich Editor — TipTap

**Decision**: Use TipTap with `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-mention`.
**Rationale**: Framework-agnostic, extensible markdown support. Keeps source project's proven editor choice. TipTap's ProseMirror foundation handles complex content types (mentions, paste handlers, drag-drop). The `@tiptap/extension-mention` enables @ model mentions for multi-model compare mode (FR-036).
**Alternatives considered**:
- Slate.js: More flexible but higher complexity for basic markdown editing
- Textarea + markdown preview: Too simplistic for file attachments and @ mentions
- Monaco: Overkill, heavy dependency for a chat input

## R-003: Markdown Rendering — react-markdown + rehype

**Decision**: Use `react-markdown` with `rehype-raw` and `remark-gfm` for markdown rendering in message blocks. Code blocks delegate to Shiki (R-004).
**Rationale**: Standard, well-maintained, tree-shakeable. `remark-gfm` adds tables, strikethrough, tasklists. `rehype-raw` preserves raw HTML blocks when needed. Custom component overrides enable block-level rendering (code blocks route to `CodeBlock` component).
**Alternatives considered**:
- marked + DOMPurify: Manual DOM manipulation, harder React integration
- MDX: Overkill — no need for JSX in user-generated markdown
- Custom parser: Maintenance burden, edge case hell

## R-004: Code Highlighting — Shiki with Dual Theme

**Decision**: Use Shiki with dual-theme support (light/dark), initialized as a singleton highlighter.
**Rationale**: Better theme integration with Tailwind CSS 4 dark mode. Shiki generates static HTML with inline styles — no FOUC. Dual-theme via `createHighlighterCore` with lazy-loaded grammars keeps initial bundle small. Singleton pattern avoids 200ms+ initialization per render.
**Alternatives considered**:
- highlight.js: Lighter but worse theme integration, no inline styles
- Prism: Similar to highlight.js, requires CSS injection
- rehype-highlight: Uses highlight.js under the hood, same limitations

## R-005: Virtual Scrolling — @tanstack/react-virtual

**Decision**: Use `@tanstack/react-virtual` for the message list component.
**Rationale**: Performance requirement SC-003 mandates 500-msg topic loads under 1 second. Variable-height rows (messages vary wildly in size) are first-class in @tanstack/react-virtual. Works with our auto-scroll-on-stream pattern via `scrollToIndex`. No opinions on styling — integrates cleanly with Tailwind.
**Alternatives considered**:
- react-window: Fixed-height rows only, no variable-size support without VariableSizeList hacks
- react-virtuoso: Good but larger bundle, less control over scroll behavior
- No virtualization: Fails SC-003 at 500+ messages

## R-006: Stream Processing — F004 IPC Stream Events

**Decision**: Consume F004's IPC stream events (`ai:stream-chunk`, `ai:stream-complete`, `ai:stream-error`). Build chunks into typed MessageBlocks via a `BlockBuilder` service.
**Rationale**: ARC-02 streaming-first architecture. F004 normalizes all provider responses into `NormalizedChunk` — F005 never handles provider-specific formats. `BlockBuilder` maintains a state machine that transitions chunk types to block types: `text` chunks accumulate into `MAIN_TEXT` blocks, `thinking` chunks into `THINKING` blocks, `tool-call` into `TOOL` blocks. Block boundaries are detected by type transitions.
**Alternatives considered**:
- Direct SDK streaming in renderer: Violates ARC-01 (IPC bridge), exposes API keys
- WebSocket bridge: Unnecessary complexity when IPC events work
- Polling: Unacceptable latency for real-time streaming

## R-007: Topic Auto-Naming — F004 AI Core

**Decision**: Use the configured model via F004 AI core to generate a short title from the first user message + assistant reply. Runs in main process via `TopicNameService`.
**Rationale**: User convenience per FR-032 and BL-010. Uses a compact prompt ("Generate a concise 3-7 word title for this conversation") with low temperature (0.3) and maxTokens (30). Falls back to truncated first message if naming fails. Respects `isNameManuallyEdited` flag — once user renames, auto-naming is disabled for that topic.
**Alternatives considered**:
- Client-side heuristic (first N words): Too simplistic, misses conversation intent
- Always manual: Poor UX for high-volume users
- Separate lightweight model: Unnecessary complexity, configured model is already available

## R-008: Draft Persistence — Zustand + localStorage

**Decision**: Store drafts in Zustand with `persist` middleware targeting localStorage. Drafts are NOT stored in SQLite.
**Rationale**: Drafts are volatile, high-frequency data (every keystroke). IPC round-trip for each keystroke is unacceptable latency. localStorage is synchronous in renderer, fast access. Draft loss on app crash is acceptable — the alternative (IPC debounce) adds complexity for minimal gain. Drafts are keyed by `topicId`.
**Alternatives considered**:
- SQLite via IPC: Too much overhead for keystroke-frequency writes
- IndexedDB: Async API adds complexity for a simple key-value store
- In-memory only: Loses draft on topic switch (violates FR-011)

## R-009: Block Architecture — Extensible Registry Pattern

**Decision**: Use discriminated union types with a `type` field as the discriminator. F005 owns 8 block types (`UNKNOWN`, `MAIN_TEXT`, `THINKING`, `CODE`, `IMAGE`, `FILE`, `TOOL`, `ERROR`). Downstream features (F006, F007, F008) register additional types (`CITATION`, `TRANSLATION`, `VIDEO`, `COMPACT`) by extending the union.
**Rationale**: Open-closed principle — new block types require only: (1) add type to union, (2) add renderer component, (3) register in `BlockRenderer` dispatch map. No modification to existing block code. Type-safe — TypeScript exhaustive checks catch missing renderers at compile time.
**Alternatives considered**:
- Class hierarchy with polymorphism: Over-engineered for what is essentially a render dispatch
- String type with runtime validation: Loses compile-time safety
- Single flexible block with optional fields: Messy, hard to validate per-type constraints
