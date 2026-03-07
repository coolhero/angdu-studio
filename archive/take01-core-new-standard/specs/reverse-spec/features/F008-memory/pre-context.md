# Pre-Context: Memory

**Feature ID**: F008
**Tier**: Tier 2
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/memory/MemoryService.ts` | Memory service (main process) |
| `src/renderer/src/store/memory.ts` | Memory Redux slice |
| `src/renderer/src/types/index.ts` | MemoryItem, MemoryHistoryItem types |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Memory extraction prompts, deduplication logic (content hash), embedding-based search, history tracking (ADD/UPDATE/DELETE)
- Ignore: Redux memory slice

### Static Resources

None.

### Environment Variables

None.

---

## For /speckit.specify

### Existing Feature Summary

Memory enables persistent user memory across conversations. Facts are extracted from conversations using configurable prompts, deduplicated via content hash, stored with embeddings for similarity search, and tracked with full history (ADD/UPDATE/DELETE actions with soft delete).

### Draft Requirements

- **FR-057**: Implement memory CRUD (add, search, update, delete)
- **FR-058**: Implement fact extraction from conversations using configurable prompts
- **FR-059**: Implement content hash deduplication
- **FR-060**: Implement embedding-based memory search
- **FR-061**: Implement memory history tracking with soft delete

### Draft Acceptance Criteria

- **SC-032**: Memory search returns relevant memories within 200ms
- **SC-033**: Duplicate memories are detected and merged
- **SC-034**: Memory history preserves full audit trail

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC | Memory service in main process |
| F003-provider-management | Model | Embedding model for memory vectors |
| F006-knowledge-base | Embedding infra | Reuses embedding generation infrastructure |

### Related Entities

#### Owned Entities

**MemoryItem** — 7 fields
**MemoryHistoryItem** — 8 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Context injection | F005 | Verify memory results integrate into completion context |
| Embedding compat | F006 | Verify shared embedding infrastructure compatibility |
