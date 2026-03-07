# Pre-Context: Notes Editor

**Feature ID**: F009-notes-editor
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/notes/` | Notes page (editor layout, sidebar, toolbar) |
| `src/renderer/src/components/Notes/` | TipTap editor components (custom extensions, toolbar) |
| `src/renderer/src/hooks/useNotes.ts` | Notes hooks (CRUD, state access, lifecycle) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **TipTap editor configuration and custom extension definitions, file tree data structure and manipulation logic (create, rename, delete, drag-and-drop), notes directory configuration and validation, markdown file storage format (read/write .md files), full-text search algorithm across notes, editor toolbar formatting options**
- Do not reference: Ant Design note UI components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind), Redux note slice (migrating to Zustand)
- **Extract**: TipTap editor configuration and custom extensions, file tree self-referential data structure (NotesTreeNode), tree manipulation algorithms (create/rename/delete/reorder), drag-and-drop reorder logic, notes directory validation (path exists, writable), markdown file read/write operations, full-text search with scoring, editor toolbar action definitions
- **Ignore**: Redux `createSlice` / `useSelector` / `useDispatch` patterns, Ant Design Tree / Input / Button / Modal components, styled-components wrappers

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Notes editor has no static resources; notes are user-generated markdown files |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F009) | | | | |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F009-notes-editor provides a TipTap-powered rich text editing environment with a hierarchical file tree sidebar. Users can create, edit, and organize notes in a self-referential tree structure with folders and files. Features include full-text search across notes, markdown-based file storage (read/write .md files), notes directory configuration and validation, drag-and-drop tree reordering, and a toolbar with formatting options. The editor supports rich formatting via TipTap custom extensions with markdown serialization for persistence.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create/Edit Note | User creates a new note; TipTap editor opens with rich text formatting toolbar |
| P1 | File Tree Navigation | User browses and organizes notes in a hierarchical folder/file tree |
| P1 | Search Notes | User searches notes by keyword; results returned with full-text matching |
| P2 | Drag-and-Drop Reorder | User reorders notes and folders via drag-and-drop in the tree sidebar |
| P2 | Rename/Delete | User renames or deletes notes and folders in the tree |
| P2 | Directory Configuration | User configures and validates the notes storage directory |
| P3 | Markdown Storage | Notes are persisted as markdown (.md) files on disk |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: TipTap-based rich text editor with markdown support
- **FR-002**: File tree management (create, rename, delete, drag-and-drop)
- **FR-003**: Notes directory configuration and validation
- **FR-004**: Markdown file storage (read/write .md files)
- **FR-005**: Full-text search across notes
- **FR-006**: Editor toolbar with formatting options

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: TipTap editor renders and edits rich text without data loss on markdown round-trip
- **SC-002**: File tree correctly reflects folder hierarchy and supports all CRUD operations
- **SC-003**: Search returns relevant results across all notes within 200ms for typical collections
- **SC-004**: Drag-and-drop correctly updates tree structure and persists new order
- **SC-005**: Notes directory validation catches invalid paths (non-existent, not writable)
- **SC-006**: Markdown files are written atomically to prevent data corruption

### Edge Cases

- Large note (>10MB) affecting TipTap editor performance
- Concurrent edits from external file system changes (file watcher conflicts)
- Search across thousands of notes (performance threshold)
- Drag-and-drop into invalid positions (e.g., file into file instead of folder)
- Markdown storage with unsupported rich text elements (graceful degradation)
- Notes directory on a network drive with latency or disconnection
- Rename to a name that already exists among siblings; unique name enforcement
- Empty notes directory on first launch; graceful initialization

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for file operations (read/write .md files), config persistence for notes directory path |

### Related Entities (data-model.md draft)

#### Owned Entities

**NotesTreeNode** (self-referential tree structure) -- Refer to E22 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique node identifier |
| parentId | string | optional, FK to self | Parent node (null for root) |
| name | string | required | Display name |
| type | string | enum: `folder`, `note` | Node type |
| path | string | optional | File path for note nodes |
| children | NotesTreeNode[] | optional | Child nodes (for folders) |
| sortOrder | number | optional | Display order within parent |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| (none) | | | F009 is an independent feature with no entity dependencies |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Zustand | `useNotesStore` | Notes state management |
| Hook | `useNotes()` | React hook for notes CRUD and state access |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `file:*` | F001-core-platform | File system access for reading/writing .md files |
| IPC | `config:*` | F001-core-platform | Config get/set for notes directory path |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: TipTap editor with custom extensions for rich text. File tree managed as a nested self-referential data structure (NotesTreeNode) with CRUD operations. Full-text search service scores results by keyword frequency and position. Notes persisted as markdown files via IPC file operations. Redux note slice manages UI state.
- **Recommended implementation approach**: Keep TipTap editor and extensions (framework-agnostic, React-compatible). Replace Redux note slice with Zustand store. Replace Ant Design tree/list/modal components with shadcn/ui tree and list primitives. Use Tailwind for all layout and styling. Core search scoring logic and file tree manipulation algorithms are framework-agnostic.
- **Caveats**: TipTap extensions are largely React-compatible and should transfer directly. The main migration effort is in the tree sidebar UI (Ant Design Tree -> custom shadcn/ui tree) and settings panels. File tree drag-and-drop may need custom implementation with @dnd-kit or similar.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| File storage | F001-core-platform | Verify notes file operations use F001's file IPC channels correctly |
| Backup inclusion | F007-backup-sync | Verify notes data (both tree structure and .md files) is included in backup/restore |
| Knowledge integration | F004-knowledge-base | Verify notes can be used as knowledge base sources (KnowledgeItem type=note) |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F007-backup-sync | Data format | If notes storage format changes, backup must handle new format |
| F004-knowledge-base | Source type | If NotesTreeNode structure changes, knowledge base note ingestion must adapt |
