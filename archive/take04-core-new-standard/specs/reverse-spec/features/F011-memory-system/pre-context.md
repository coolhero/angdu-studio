# Pre-Context: Memory System

**Feature ID**: F011-memory-system
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/memory/MemoryService.ts` | Memory CRUD, vector search, deduplication, soft delete |
| `src/main/services/memory/queries.ts` | SQL queries for memory operations (LibSQL/turso) |
| `src/renderer/src/hooks/useMemory.ts` | Memory hooks (search, list, CRUD operations) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **memory CRUD (add, search, list, update, delete, get), unified 1536-dimension embedding normalization (pad/truncate), hash-based deduplication (SHA-256 content hash), similarity-based deduplication (cosine >= 0.85 threshold), soft delete with restore capability (is_deleted flag, hash-match restore), history tracking (ADD/UPDATE/DELETE actions), search with vector->text fallback, user management (default-user protection, per-user isolation), metadata merge on update (spread semantics), DB migration (old path -> new path on init)**
- Do not reference: Redux memory slice (migrating to Zustand), Ant Design memory settings UI (migrating to shadcn/ui)
- **Extract**: Memory CRUD operations with full lifecycle, embedding dimension normalization algorithm (pad zeros to 1536 or truncate), SHA-256 content hash computation and exact-match dedup, cosine similarity computation and 0.85 threshold for semantic dedup, soft delete flag management (is_deleted = 0/1), hash-match restore flow (undelete existing rather than create duplicate), history tracking table schema and operations (ADD/UPDATE/DELETE with timestamps), vector similarity search with text LIKE fallback, default-user protection (cannot be deleted, silently ignored), per-user memory isolation, metadata merge with object spread semantics (new overrides existing, existing preserved), singleton pattern with reload capability, DB migration (atomic copy then delete)
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design memory settings UI components

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Memory system has no static resources; all data is generated at runtime |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F011) | | | | |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F011-memory-system enables persistent user memory across conversations. Memories are stored with embeddings in a LibSQL/turso database for semantic search. Deduplication operates at two levels: SHA-256 content hash for exact matches and cosine similarity (>= 0.85 threshold) for semantic matches. All memory changes are tracked with a full history trail (ADD/UPDATE/DELETE actions). The system supports soft delete with restore capability (when adding a memory whose hash matches a deleted entry, it is restored rather than duplicated). Per-user memory isolation is enforced with a protected default user that cannot be deleted. Embedding dimensions are normalized to 1536 (zero-padded or truncated). Search uses vector similarity with a text LIKE fallback when no vector results are found. Metadata on update uses spread merge semantics. The service uses a singleton pattern with reload capability and supports DB migration from old to new path on initialization.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Memory CRUD | User views, adds, updates, and deletes stored memories |
| P1 | Memory Search | User starts a new chat; relevant memories are retrieved via embedding similarity and injected into context |
| P2 | Semantic Dedup | System detects semantically similar memories (>= 0.85 cosine similarity) and updates existing rather than creating duplicate |
| P2 | Hash Dedup | System detects exact content matches via SHA-256 hash and prevents duplicates |
| P2 | Per-User Memory | User switches between memory profiles; each profile has isolated memory storage |
| P3 | Soft Delete/Restore | User deletes a memory (soft delete); system restores it if matching content is added again |
| P3 | Memory History | User views the full history trail of memory changes (ADD, UPDATE, DELETE) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Memory CRUD (add, search, list, update, delete, get)
- **FR-002**: Unified 1536-dimension embedding normalization (pad/truncate)
- **FR-003**: Hash-based deduplication (SHA-256 content hash)
- **FR-004**: Similarity-based deduplication (cosine >= 0.85 threshold)
- **FR-005**: Soft delete with restore capability (is_deleted flag, hash-match restore)
- **FR-006**: History tracking (ADD/UPDATE/DELETE actions)
- **FR-007**: Search with vector->text fallback
- **FR-008**: User management (default-user protection, per-user isolation)
- **FR-009**: Metadata merge on update (spread semantics)
- **FR-010**: DB migration (old path -> new path on init)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Memory search returns relevant memories via embedding similarity within 200ms
- **SC-002**: Exact-match deduplication (SHA-256 hash) prevents duplicate memory creation
- **SC-003**: Semantic deduplication (cosine >= 0.85) correctly merges near-duplicate memories
- **SC-004**: Memory history preserves full audit trail of all ADD/UPDATE/DELETE actions
- **SC-005**: Soft-deleted memories are excluded from search but restorable via hash-match re-add
- **SC-006**: Per-user isolation prevents memory leakage between user profiles
- **SC-007**: Default user cannot be deleted; deletion attempts are silently ignored
- **SC-008**: DB migration from old path to new path completes atomically without data loss

### Edge Cases

- Embedding model change requiring re-embedding all memories (dimension normalization handles this)
- Near-duplicate memories at exactly the 0.85 similarity threshold (boundary behavior)
- Concurrent memory writes from multiple conversations
- Default user deletion attempt (silently ignored per BR-035)
- Large memory store (>10,000 items) search performance; vector search with text fallback
- Metadata merge with conflicting keys; spread semantics means new values win
- DB migration interrupted mid-copy; atomic copy-then-delete prevents corruption
- Adding a memory whose hash matches a soft-deleted entry; restore rather than create
- Empty embedding vector; dimension normalization pads to 1536 zeros
- User with no memories; search returns empty, text fallback also returns empty

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for memory service communication, file system for DB path management |
| F002-provider-management | Entity | Embedding model resolved from provider config for vector generation |
| F003-ai-core-engine | API | Uses AI completion for fact extraction from conversations |
| F004-knowledge-base | Embedding infra | Reuses embedding generation infrastructure; shared 1536-dimension normalization |

### Related Entities (data-model.md draft)

#### Owned Entities

**MemoryItem** (10 fields, LibSQL/turso storage) -- Refer to E15 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique memory identifier |
| content | string | required | Memory fact text |
| embedding | Float32Array | optional | 1536-dimensional embedding vector |
| metadata | JSON | optional | Arbitrary metadata (spread-merge on update) |
| created_at | string | ISO 8601 | Creation timestamp |
| updated_at | string | ISO 8601 | Last update timestamp |
| is_deleted | number | 0 or 1, default 0 | Soft-delete flag |
| hash | string | SHA-256 | Content hash for exact-match deduplication |
| user_id | string | default `'default-user'` | Owning user identifier |
| agent_id | string | optional | Associated agent identifier |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Embedding model provider resolution |
| Model | F002-provider-management | Read access | Embedding model selection for memory vectors |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `memory:add` | Add a new memory with deduplication |
| IPC | `memory:search` | Search memories by embedding similarity with text fallback |
| IPC | `memory:list` | List all memories for a user |
| IPC | `memory:update` | Update memory content and metadata (spread merge) |
| IPC | `memory:delete` | Soft delete a memory (or hard delete for user-level) |
| IPC | `memory:get` | Get a specific memory by ID |
| IPC | ~6 additional channels | User management, history, config sync, DB migration |
| Zustand | `useMemoryStore` | Memory state management |
| Hook | `useMemory()` | React hook for memory operations |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, data paths |
| IPC | `file:*` | F001-core-platform | File system access for DB migration |
| IPC | `config:*` | F001-core-platform | Config persistence for memory settings |
| aiCore | RuntimeExecutor | F003-ai-core-engine | LLM completion for fact extraction |

### Business Rules

This feature owns **13 business rules** (BR-028 through BR-040):

| Rule ID | Rule Name | Description |
|---------|-----------|-------------|
| BR-028 | Unified 1536 embedding dimension | Zero-pad short vectors, truncate long vectors |
| BR-029 | Similarity dedup threshold | Cosine >= 0.85 triggers merge into existing entry |
| BR-030 | Hash-based dedup | SHA-256 hash prevents exact content duplicates |
| BR-031 | Soft delete | is_deleted flag rather than row removal |
| BR-032 | Restore deleted memory | Hash-match on soft-deleted entry triggers restore |
| BR-033 | History tracking | ADD/UPDATE/DELETE actions recorded with timestamps |
| BR-034 | Metadata merge | Object spread semantics on update |
| BR-035 | Default user protection | `"default-user"` cannot be deleted |
| BR-036 | User ID required | All operations require valid non-empty userId |
| BR-037 | Hard vs soft delete | Item-level = soft, user-level = hard |
| BR-038 | Search fallback | Vector similarity -> text LIKE fallback |
| BR-039 | DB migration | Old-path DB migrated to new path on first access |
| BR-040 | Singleton with reload | Instance destruction and recreation on config change |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Main process handles memory storage via LibSQL/turso with SQL queries. Deduplication operates at two levels (hash + semantic). History tracking maintains audit trail. Per-user isolation with default user protection. Renderer-side manages UI state via Redux slice. Embedding infrastructure shared with F004-knowledge-base.
- **Recommended implementation approach**: Keep main process memory service logic intact (framework-agnostic Node.js + LibSQL). Replace Redux memory slice with Zustand store. Core deduplication, search, and history algorithms are entirely framework-agnostic. Ensure embedding infrastructure is compatible with F004-knowledge-base's shared embedding service.
- **Caveats**: Embedding infrastructure is shared with F004-knowledge-base. Design the embedding service interface to be reusable across both features. The 1536-dimension normalization must be consistent between F004 and F011.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Context injection | F005-ai-chat | Verify memory search results integrate correctly into chat completion context |
| Embedding compat | F004-knowledge-base | Verify shared embedding infrastructure compatibility (1536 dimensions, provider resolution) |
| Fact extraction | F003-ai-core-engine | Verify fact extraction prompts route correctly through AI completion pipeline |
| Settings integration | F008-settings-ui | Verify memory settings page correctly configures memory preferences |
| Backup inclusion | F007-backup-sync | Verify memory data (LibSQL DB) is included in backup/restore operations |
| IPC channel availability | F001-core-platform | Verify F011's memory:* IPC channels are registered in F001's IPC handler |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | Context format | If memory search result format changes, chat context injection must adapt |
| F004-knowledge-base | Embedding interface | If embedding dimensions or normalization algorithm changes, knowledge base must stay aligned |
| F008-settings-ui | Config schema | If memory settings schema changes, memory settings page must update |
