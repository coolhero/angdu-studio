# Pre-Context: Memory System

**Feature ID**: F011
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/memory/` | Memory services (main process, all files) |
| `src/renderer/src/services/MemoryService.ts` | Memory service (renderer-side orchestration) |
| `src/renderer/src/services/MemoryProcessor.ts` | Fact extraction and processing pipeline |
| `src/renderer/src/store/memory.ts` | Memory state slice |
| `src/renderer/src/types/index.ts` | MemoryItem, MemoryHistoryItem, MemoryConfig type definitions |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Memory CRUD operations, fact extraction prompts and pipeline, semantic deduplication algorithm (0.85 cosine similarity threshold), SHA-256 content hash deduplication, soft delete with history tracking (ADD/UPDATE/DELETE actions), embedding dimension normalization (1536), per-user memory isolation, default user protection logic, config sync protocol (renderer to main), memory search with embedding similarity
- Ignore: Redux memory slice (migrating to Zustand), Ant Design memory settings UI (migrating to shadcn/ui)

### Static Resources

None.

### Environment Variables

None.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Memory System enables persistent user memory across conversations. Facts are automatically extracted from conversations using configurable AI prompts, then stored with embeddings for semantic search. Deduplication operates at two levels: SHA-256 content hash for exact matches and cosine similarity (0.85 threshold) for semantic matches. All memory changes are tracked with a full history trail (ADD/UPDATE/DELETE actions) with soft delete support. The system supports per-user memory isolation with a protected default user, and embedding dimensions are normalized to 1536 for consistent vector operations. Configuration syncs from renderer to main process.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Fact Extraction | User chats with AI; system automatically extracts and stores relevant facts as memories |
| P1 | Memory Search | User starts a new chat; relevant memories are retrieved via embedding similarity and injected into context |
| P1 | Memory CRUD | User views, edits, or deletes stored memories in the memory management UI |
| P2 | Semantic Dedup | System detects semantically similar memories (>0.85 similarity) and merges them |
| P2 | Per-User Memory | User switches between memory profiles; each profile has isolated memory storage |
| P3 | Memory History | User views the full history trail of memory changes (adds, updates, deletes) |
| P3 | Soft Delete | User deletes a memory; it is soft-deleted and recoverable via history |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement memory CRUD (add, search, update, delete) with embedding-based storage
- **FR-002**: Implement fact extraction from conversations using configurable AI prompts
- **FR-003**: Implement semantic deduplication with 0.85 cosine similarity threshold
- **FR-004**: Implement SHA-256 content hash deduplication for exact matches
- **FR-005**: Implement soft delete with full history tracking (ADD/UPDATE/DELETE actions)
- **FR-006**: Implement embedding dimension normalization to 1536 dimensions
- **FR-007**: Implement per-user memory isolation with default user protection
- **FR-008**: Implement config sync protocol from renderer to main process

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Memory search returns relevant memories via embedding similarity within 200ms
- **SC-002**: Duplicate memories are detected (both exact hash and semantic) and merged correctly
- **SC-003**: Memory history preserves full audit trail of all changes
- **SC-004**: Fact extraction correctly identifies and stores relevant facts from conversations
- **SC-005**: Per-user isolation prevents memory leakage between user profiles
- **SC-006**: Soft-deleted memories are excluded from search but recoverable

### Edge Cases

- Embedding model change requiring re-embedding all memories
- Memory extraction from very long conversations (token limit handling)
- Near-duplicate memories at exactly the 0.85 similarity threshold (boundary behavior)
- Concurrent memory writes from multiple conversations
- Config sync failure between renderer and main process
- Default user deletion attempt (should be protected)
- Large memory store (>10,000 items) search performance

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC | Memory service in main process communicates via IPC |
| F002-provider-management | Model | Embedding model resolved from provider config for vector generation |
| F003-ai-core-engine | AI pipeline | Fact extraction uses AI completion for prompt-based extraction |
| F004-knowledge-base | Embedding infra | Reuses embedding generation infrastructure for memory vectors |

### Related Entities (data-model.md draft)

#### Owned Entities

**MemoryItem** -- Refer to the corresponding section in entity-registry.md

**MemoryHistoryItem** -- Refer to the corresponding section in entity-registry.md

**MemoryConfig** -- Refer to the corresponding section in entity-registry.md

**MemoryState** -- Refer to the corresponding section in entity-registry.md

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Embedding model provider resolution |
| Model | F002-provider-management | Read access | Embedding model selection for memory vectors |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Main process handles memory storage and embedding search. Renderer-side MemoryProcessor extracts facts via AI prompts. Redux memory slice manages UI state. Dual deduplication (hash + semantic). History tracking with soft delete.
- **Recommended implementation approach**: Keep main process memory service logic (framework-agnostic). Replace Redux memory slice with Zustand store. Core deduplication, extraction, and search algorithms are framework-agnostic. Ensure embedding infrastructure is compatible with F004-knowledge-base's shared embedding service.
- **Caveats**: Embedding infrastructure is shared with F004-knowledge-base. Design the embedding service interface to be reusable across both features. The 1536-dimension normalization must be consistent.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Context injection | F005-ai-chat | Verify memory search results integrate correctly into chat completion context |
| Embedding compat | F004-knowledge-base | Verify shared embedding infrastructure compatibility (dimensions, provider) |
| Fact extraction | F003-ai-core-engine | Verify fact extraction prompts route correctly through AI completion pipeline |
| Settings integration | F008-settings-ui | Verify memory settings page correctly configures MemoryConfig |
| Backup inclusion | F007-backup-sync | Verify memory data is included in backup/restore operations |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | Context format | If memory result format changes, chat context injection must adapt |
| F004-knowledge-base | Embedding interface | If embedding dimensions or interface changes, knowledge base embedding must adapt |
| F008-settings-ui | Config schema | If MemoryConfig schema changes, memory settings page must update |
