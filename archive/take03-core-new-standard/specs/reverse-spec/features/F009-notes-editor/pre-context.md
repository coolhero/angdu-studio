# Pre-Context: Notes Editor

**Feature ID**: F009
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/notes/` | Notes editor pages (all) |
| `src/renderer/src/services/NotesService.ts` | Notes CRUD and lifecycle service |
| `src/renderer/src/services/NotesSearchService.ts` | Full-text search with scoring |
| `src/renderer/src/services/NotesTreeService.ts` | File tree management service |
| `src/renderer/src/store/note.ts` | Notes state slice |
| `src/renderer/src/types/note.ts` | Note type definitions |
| `src/renderer/src/hooks/useNotesQuery.ts` | Notes query hook |
| `src/renderer/src/hooks/useNotesSettings.ts` | Notes settings hook |
| `src/renderer/src/components/RichEditor/` | TipTap editor extensions and components (all) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: TipTap editor configuration and custom extension definitions, file tree data structure and manipulation logic, full-text search algorithm with scoring, markdown file storage format, auto-save logic, batch upload processing, drag-and-drop reorder algorithm, starred notes filtering, note CRUD lifecycle
- Ignore: Redux note slice (migrating to Zustand), Ant Design note UI components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind)

### Static Resources

None.

### Environment Variables

None.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Notes Editor provides a TipTap-powered rich text editing environment with a hierarchical file tree sidebar. Users can create, edit, and organize notes in a tree structure with folders and files. Features include full-text search with relevance scoring, markdown-based file storage, auto-save, batch file upload, drag-and-drop tree reordering, and starred notes for quick access. The editor supports rich formatting via TipTap extensions.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Create/Edit Note | User creates a new note; TipTap editor opens with rich text formatting tools |
| P1 | File Tree Navigation | User browses and organizes notes in a hierarchical folder/file tree |
| P1 | Search Notes | User searches notes by keyword; results ranked by relevance score |
| P2 | Drag-and-Drop Reorder | User reorders notes and folders via drag-and-drop in the tree sidebar |
| P2 | Star Notes | User stars frequently accessed notes for quick filtering |
| P2 | Batch Upload | User uploads multiple files at once to create notes |
| P3 | Markdown Storage | Notes are persisted as markdown files on disk |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement TipTap rich text editor with custom extensions for notes
- **FR-002**: Implement file tree management (create, rename, delete, move folders and notes)
- **FR-003**: Implement full-text search with relevance scoring across all notes
- **FR-004**: Implement markdown file storage for note persistence
- **FR-005**: Implement batch file upload with automatic note creation
- **FR-006**: Implement drag-and-drop reorder for tree nodes
- **FR-007**: Implement starred notes with quick-access filtering

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: TipTap editor renders and edits rich text without data loss
- **SC-002**: File tree correctly reflects folder hierarchy and supports all CRUD operations
- **SC-003**: Search returns relevant results with scoring within 200ms for typical note collections
- **SC-004**: Auto-save persists note content within 2 seconds of last edit
- **SC-005**: Drag-and-drop correctly updates tree structure and persists new order

### Edge Cases

- Large note (>10MB) affecting editor performance
- Concurrent edits from external file system changes (file watcher conflicts)
- Search across thousands of notes (performance threshold)
- Drag-and-drop into invalid positions (e.g., file into file)
- Markdown storage with unsupported rich text elements (graceful degradation)
- Batch upload with mixed file types (some unsupported)

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC, File | Notes stored via file system; IPC channels for file operations |

### Related Entities (data-model.md draft)

#### Owned Entities

**NotesTreeNode** -- Refer to the corresponding section in entity-registry.md

**NoteState** -- Refer to the corresponding section in entity-registry.md

**NotesSettings** -- Refer to the corresponding section in entity-registry.md

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: TipTap editor with custom extensions for rich text. File tree managed as a nested data structure with CRUD operations. Full-text search service scores results by keyword frequency and position. Notes persisted as markdown files via IPC file operations.
- **Recommended implementation approach**: Keep TipTap editor and extensions (framework-agnostic). Replace Redux note slice with Zustand store. Replace Ant Design tree/list components with shadcn/ui tree and list primitives. Use Tailwind for all layout and styling. Core search scoring logic is framework-agnostic.
- **Caveats**: TipTap extensions are largely React-compatible and should transfer directly. The main migration effort is in the tree sidebar UI and settings panels.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| File storage | F001-core-platform | Verify notes file operations use F001's file IPC channels correctly |
| Backup inclusion | F007-backup-sync | Verify notes data is included in backup/restore operations |
| Knowledge integration | F004-knowledge-base | Verify notes can be used as knowledge base sources |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F007-backup-sync | Data format | If notes storage format changes, backup must handle new format |
| F004-knowledge-base | Source type | If notes structure changes, knowledge base note ingestion must adapt |
