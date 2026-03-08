# Research: Chat Core

**Feature**: 003-chat-core | **Date**: 2026-03-09

---

## R1: Zustand Store Architecture for Chat Data

**Decision**: Three separate stores — `useAssistantsStore`, `useMessageStore`, `useMessageBlockStore`

**Rationale**: Mirrors the original Redux slice boundaries (assistants, newMessage, messageBlock). Messages and blocks are high-frequency update targets during streaming — isolating them prevents unnecessary re-renders of the assistant list. The stores communicate via IDs, not direct references, eliminating circular dependency risk.

**Alternatives considered**:
- Single combined store: Rejected — too many re-renders during streaming as the entire store would notify on each block update.
- Two stores (assistants + combined messages/blocks): Rejected — blocks update independently from messages during streaming; separating them reduces render scope further.

---

## R2: Dexie Database Schema Design

**Decision**: Four Dexie tables — `assistants`, `topics`, `messages`, `messageBlocks` — with compound indexes for efficient queries.

**Rationale**: Dexie (IndexedDB) is the established pattern for renderer-side persistence (Constitution V). Separate tables for messages and blocks enable independent queries and pagination. Compound indexes on `[topicId+createdAt]` for messages and `[messageId]` for blocks support the primary access patterns.

**Alternatives considered**:
- Nested storage (blocks inside messages): Rejected — blocks are updated independently during streaming; nested storage would require full message rewrites on each block update.
- SQLite via main process IPC: Rejected — adds IPC latency to every message operation; Constitution V specifies Dexie for high-frequency chat data.

**Key indexes**:
- `messages`: `id`, `topicId`, `[topicId+createdAt]`, `askId`
- `messageBlocks`: `id`, `messageId`, `[messageId+createdAt]`
- `topics`: `id`, `assistantId`
- `assistants`: `id`

---

## R3: Stream Processing Architecture

**Decision**: Callback-driven dispatcher pattern with a BlockManager class that owns block lifecycle.

**Rationale**: The stream produces 15+ chunk types that map to different block operations. A dispatcher routes each chunk type to the appropriate handler. The BlockManager maintains the mapping from chunk context to active blocks, creates new blocks on START events, updates on DELTA events, and finalizes on COMPLETE events. This matches the original Cherry Studio architecture (BL-014).

**Alternatives considered**:
- Redux-style reducer: Rejected — we're on Zustand, and the chunk processing involves async side effects (Dexie writes) that don't fit a pure reducer.
- Observable/RxJS: Rejected — adds a dependency for a pattern that a simple class handles well; Constitution "Simplicity First" principle.

---

## R4: Message Filtering Pipeline Implementation

**Decision**: Standalone `ConversationService` with composable filter functions piped sequentially.

**Rationale**: The 9-stage pipeline is a pure data transformation (Message[] → Message[]) with no side effects. Implementing as composable functions enables easy unit testing of each stage independently. The service orchestrates the pipeline and provides the fallback guarantee.

**Alternatives considered**:
- Integrated in send flow: Rejected — the pipeline is complex enough to warrant isolation for testing.
- Middleware pattern (like AI plugins): Rejected — filters are sequential and order-dependent; middleware's async/extensible nature is unnecessary here.

---

## R5: Zustand Persistence Strategy for Assistants

**Decision**: Dual persistence — Zustand persist middleware for in-memory reactivity + Dexie write-through for durability.

**Rationale**: Assistants need to be reactive in the UI (Zustand) and durable across sessions (Dexie). Zustand's persist middleware uses localStorage by default, but for Electron we use a custom storage adapter backed by Dexie. On startup, the store hydrates from Dexie. On write, changes are committed to both Zustand state and Dexie.

**Alternatives considered**:
- Zustand persist with localStorage only: Rejected — localStorage has 5MB limit and no transaction support; Dexie handles large datasets better.
- Dexie-only with React queries: Rejected — would require manual subscription/reactivity layer; Zustand provides this natively.

---

## R6: Block Status State Machine Implementation

**Decision**: Validated transitions via a transition map that rejects invalid state changes.

**Rationale**: The 6-state machine (PENDING → PROCESSING → STREAMING → SUCCESS/ERROR/PAUSED) has defined valid transitions. A transition map (`Map<BlockStatus, Set<BlockStatus>>`) provides O(1) validation. Invalid transitions are rejected and logged rather than silently ignored, per the spec edge case requirement.

**Valid transitions**:
- PENDING → PROCESSING
- PROCESSING → STREAMING, ERROR
- STREAMING → SUCCESS, ERROR, PAUSED
- PAUSED → STREAMING, ERROR
- SUCCESS → (terminal)
- ERROR → (terminal, can be retried via new block)

---

## R7: Rate Limiting Implementation

**Decision**: Time-based guard in MessagesService checking elapsed time since last message in the topic.

**Rationale**: Simple timestamp comparison against provider's `rateLimit` (seconds). Shows toast with remaining wait time. Runs before message construction to avoid unnecessary work.

**Alternatives considered**:
- Token bucket: Rejected — overkill for a per-topic rate limit; simple time-delta check is sufficient.
- Middleware in AI pipeline: Rejected — rate limiting is a UX concern (toast notification), not an API concern.
