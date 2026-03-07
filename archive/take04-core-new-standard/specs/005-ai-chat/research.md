# Research: AI Chat (F005)

**Feature**: 005-ai-chat
**Date**: 2026-03-04

## Decision 1: Message + Block Storage Architecture

**Decision**: Use Dexie IndexedDB with normalized storage — Messages table with block IDs array, MessageBlocks table with all block variants stored as a single table using discriminated union on `type` field.

**Rationale**: Matches the original design. Blocks need independent CRUD (status updates during streaming), and normalized storage enables efficient per-block updates without rewriting the entire message. Dexie v2 schema (from F001/F004) already supports versioned migrations.

**Alternatives considered**:
- Embedded blocks in message: Simpler reads but expensive writes during streaming (entire message rewritten per token)
- SQLite for messages: Overkill for client-side, Dexie already established in F001

## Decision 2: State Management Architecture

**Decision**: Three Zustand stores with persist + broadcastSync middleware:
1. `useAssistantStore` — Assistant CRUD, topic management, presets, tags
2. `useMessageStore` — Message and block CRUD, normalized by topic with EntityAdapter-like pattern
3. `useRuntimeStore` — Transient runtime state (active assistant/topic, streaming status, generating flags)

**Rationale**: Separates persistent data (assistants, messages) from transient runtime state. Zustand with persist middleware replaces Redux + redux-persist. broadcastSync ensures multi-window consistency (Constitution VII). Three stores prevent unnecessary re-renders.

**Alternatives considered**:
- Single monolithic store: Too many re-renders, harder to reason about
- Two stores (data + runtime): Messages are heavy enough to warrant separation from assistants

## Decision 3: Message Streaming Pipeline

**Decision**: Pipeline: compose → validate → context window → KB inject → resolve provider → executeStream (F003) → accumulate blocks → persist. Use the existing F003 RuntimeExecutor and executeStream() APIs directly.

**Rationale**: F003 already handles provider abstraction, streaming, and error handling. F005 orchestrates the higher-level pipeline (context, RAG injection, block accumulation) while delegating actual AI execution to F003.

**Alternatives considered**:
- Direct AI SDK calls: Would bypass F003's provider abstraction and plugin system
- IPC-based streaming: Would add unnecessary serialization overhead for renderer-to-renderer communication

## Decision 4: Block Rendering Architecture

**Decision**: Registry-based block renderer pattern. A `BlockRenderer` component maps block.type to specific renderer components (MainTextRenderer, CodeRenderer, ThinkingRenderer, etc.). Each renderer is a standalone component handling its own status, formatting, and interactions.

**Rationale**: 12 block types with distinct rendering needs. Registry pattern keeps the rendering pipeline extensible (new block types can be added without modifying the dispatcher) and each renderer is independently testable.

**Alternatives considered**:
- Switch-case in single component: Hard to maintain, no code splitting
- Dynamic import per block type: Unnecessary complexity for 12 types

## Decision 5: Context Window Implementation

**Decision**: `filterContextMessages(messages, contextCount)` function that takes all topic messages and returns the last N messages (where N = contextCount, default 5). Special value for UNLIMITED. System messages always included regardless of window.

**Rationale**: Simple, predictable behavior matching the original. Context window operates on message count, not token count (token-based truncation is a future optimization).

**Alternatives considered**:
- Token-based context window: More accurate but requires token counting infrastructure
- Sliding window with summarization: Complex, not in original

## Decision 6: Multi-Model Dispatch

**Decision**: When multiple models are configured or @mentioned, create independent assistant messages per model, each with its own block array. Execute streams in parallel via Promise.allSettled. Display with configurable layout (horizontal/vertical/fold/grid).

**Rationale**: Independent messages per model enables independent status tracking, error isolation, and persistence. Promise.allSettled ensures one failure doesn't cancel others.

**Alternatives considered**:
- Single message with multi-model blocks: Complex status tracking, blocks from different models intermixed
- Sequential model execution: Defeats the purpose of comparison

## Decision 7: Topic Auto-Naming Strategy

**Decision**: After 2+ messages in a topic with default name and !isNameManuallyEdited, call the AI to summarize the conversation into a short topic name. Use a naming lock to prevent concurrent renames. 700ms UI feedback timer for rename animation.

**Rationale**: Matches original behavior. Lock prevents race conditions when messages arrive rapidly. The 700ms timer provides visual feedback that naming occurred.

**Alternatives considered**:
- Client-side text truncation only: Less descriptive names
- Immediate rename without lock: Race condition with rapid messages

## Decision 8: MCP Integration Approach (F006 Deferred)

**Decision**: Define the MCP integration interface in F005 (assistant.mcpServers, mcpMode, Tool blocks) but implement with stub/no-op calls since F006 is deferred. Tool block rendering is fully implemented. Actual MCP server communication deferred to F006.

**Rationale**: F005 needs Tool block rendering regardless (AI models can return tool-call-like content). The assistant config fields (mcpServers, mcpMode) are part of F005's entity schema. Actual MCP protocol handling belongs to F006.

**Alternatives considered**:
- Skip all MCP-related code: Would require schema migration when F006 activates
- Implement partial MCP: Scope creep into F006 territory

## Decision 9: Dexie Schema Version

**Decision**: Add Dexie version(3) with 4 new tables: assistants, topics, messages, message_blocks, quick_phrases. Migration from v2 (F004) adds these tables.

**Rationale**: Forward migration strategy per Constitution VI. Each Feature adds new tables via version increment. v1 = F001 (files), v2 = F004 (knowledge_notes), v3 = F005 (chat entities).

**Alternatives considered**:
- Store in Zustand persist only (no Dexie): Would lose messages on store reset, poor performance for large conversations
- Separate Dexie database: Unnecessary complexity
