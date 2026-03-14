# F011-notes — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Rich Text Notes with Tree Management
> Tier: 3 (Optional) | Demo Group: D3-Extras
> Dependencies: F001-app-shell

---

## Feature Overview

Standalone rich text note editor powered by Tiptap. Notes organized in a tree structure with folders and individual notes. Supports markdown import/export (drag-and-drop .md files), full-text search, starring/favorites, and rich editing with the same Tiptap editor used across the app. Tree operations include create, rename, move, delete for both folders and notes.

---

## Runtime Exploration Results

From `runtime-exploration.md` — Screen: `#/notes`:

- **Layout**: Left sidebar (toolbar + note list) + Main content area (editor)
- **Left sidebar toolbar**: 4 icon buttons (create, import, sort, favorites, search)
- **Left sidebar content**: Note list area, "Drop .md files or folders here to import" at bottom
- **Main area**: Sidebar toggle button, empty state "No notes available yet"
- **Top right**: "..." menu button
- **Empty state**: "No notes available yet" with folder illustration
- **Import**: Supports .md file drag-and-drop import

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Pages | `src/renderer/src/pages/notes/` | Notes page UI |
| Notes service | `src/renderer/src/services/NotesService.ts` | Note CRUD operations |
| Search service | `src/renderer/src/services/NotesSearchService.ts` | Full-text note search |
| Tree service | `src/renderer/src/services/NotesTreeService.ts` | Tree structure operations |
| Rich editor | `src/renderer/src/components/RichEditor/` | Tiptap editor component |
| Store | `src/renderer/src/store/note.ts` | Redux slice (notes state) |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B221 | Note tree with folders and notes | P1 | Tree structure supporting nested folders and note items. Expand/collapse folders. |
| B222 | Note CRUD (create, rename, delete) | P1 | Create notes and folders. Rename and delete with confirmation. |
| B223 | Rich text editor (Tiptap) | P1 | Tiptap-based editor with rich formatting — headings, lists, code blocks, links, etc. |
| B224 | Markdown import via drag-and-drop | P2 | Drag .md files or folders onto sidebar to import as notes. Preserve folder structure. |
| B225 | Markdown export | P2 | Export individual notes or entire tree as .md files. |
| B226 | Full-text search across notes | P2 | Search note content and titles. Highlight matches in results. |
| B227 | Star/favorite notes | P3 | Star notes for quick access. Filter to show only starred notes. |
| B228 | Note tree drag-and-drop reorder | P3 | Drag notes and folders to reorder and reparent within the tree. |
| B229 | Sidebar toggle and layout | P2 | Toggle note sidebar visibility. Responsive layout. |
| B230 | Sort options for note list | P3 | Sort notes by name, creation date, modification date. |

---

## Business Rules

No dedicated BR entries for F011 in business-logic-map.md. Notes is a standalone feature with minimal cross-feature dependencies.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | Notes data stored in NoteState via persist | — |

---

## For /speckit.specify

- **Entities**: NotesTreeNode, NoteState (see entity-registry.md)
- **Key screens**: `#/notes` (tree sidebar + editor)
- **IPC channels**: Primarily renderer-only; file I/O for import/export may use IPC
- **Cross-feature**: Shares Tiptap RichEditor component with other features (chat message rendering)

## For /speckit.plan

- **Migration impact**: Medium UI, Low state (see stack-migration.md)
- **UI migration**: Note sidebar and toolbar AntD -> shadcn/ui. Tiptap editor stays as-is.
- **State migration**: `notes` Redux slice -> `useNotesStore` Zustand store (independent, good early migration candidate)
- **Dependencies**: Minimal — only F001-app-shell for window/tab integration
- **Zustand store**: `useNotesStore` absorbs `notes` slice

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| RichEditor component | F006-chat, F012-translate | Shared Tiptap editor component |
| Note content | F007-knowledge | Notes can be added to KB as KnowledgeNoteItem |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| Tab system | F001-app-shell | Notes opens as a tab in the top navbar |
| File I/O IPC | F001-app-shell | Import/export uses Electron file dialog and fs |
