# F010-notes Pre-Context

> Feature: Notes Editor
> Ring: RG-4 | Tier: T3
> Generated: 2026-03-08

---

## 1. Feature Overview and Purpose

The Notes feature provides a built-in markdown note-taking system within the desktop app. Users can create, edit, organize, and search markdown notes without leaving the application. The editor supports both rich-text (WYSIWYG) and source-code editing modes, with a tree-based file/folder sidebar for organization.

Key capabilities:
- Note CRUD with hierarchical folder/file tree stored on the local filesystem as `.md` files
- TipTap-based rich text editor (via `RichEditor` component) with markdown bidirectional sync
- Monaco-based source code editor (via `CodeEditor` component) for raw markdown editing
- Read-only preview mode
- Drag-and-drop for tree reordering and .md file import
- Favorites (starred notes) with persistent paths
- Full-text search across all notes (filename + content matching)
- File system watcher for live sync with external changes
- Export to Word, copy content, breadcrumb navigation
- Configurable work directory, font size, font family, content width, table of contents

## 2. Key Source Files and Their Roles

### Page Components

| File | Role |
|------|------|
| `src/renderer/src/pages/notes/NotesPage.tsx` | Root orchestrator (~960 lines). Manages tree state, file watcher lifecycle, debounced save (800ms), all CRUD handlers (create/delete/rename/move/upload), starred/expanded path management, and composes Sidebar + Editor. Uses `mergeTreeState()` to overlay Redux-persisted starred/expanded flags onto filesystem-derived tree nodes. |
| `src/renderer/src/pages/notes/NotesSidebar.tsx` | Sidebar with virtualized tree list (`DynamicVirtualList`), context menus via antd `Dropdown`, drag-and-drop, search UI, starred filter. Uses 6 split React contexts for render performance isolation. Flattens tree for virtualization with sticky folder headers. |
| `src/renderer/src/pages/notes/NotesEditor.tsx` | Editor pane. Switches between `RichEditor` (TipTap), `CodeEditor` (Monaco), and read-only mode via a `Selector` in the bottom panel. Displays character count. Disables image and inlineMath commands in notes mode. |
| `src/renderer/src/pages/notes/HeaderNavbar.tsx` | Top navbar with breadcrumb path navigation, inline title rename (antd `Input`), star toggle, copy content, export to Word, and settings dropdown menu. |
| `src/renderer/src/pages/notes/NotesSidebarHeader.tsx` | Sidebar header toolbar: new note (`FilePlus2`), new folder (`FolderPlus`), sort dropdown, starred view toggle, search toggle with inline search input. |
| `src/renderer/src/pages/notes/NotesSettings.tsx` | Settings popup for work directory selection (with apply/reset), view mode, edit mode, display options (full width toggle, font size slider, table of contents toggle). |
| `src/renderer/src/pages/notes/MenuConfig.tsx` | Declarative menu item configuration for the header dropdown: copy content, export to Word, full width toggle, table of contents toggle, font family/size submenu, more settings link. |

### Sub-components

| File | Role |
|------|------|
| `components/TreeNode.tsx` | Individual tree node renderer. Handles drag indicators (`before`/`inside`/`after`), context menu via antd `Dropdown`, inline edit input, search result highlighting with `HighlightText`, match expansion (show/hide content matches), shimmer/typing rename animations. Memoized. |

### Contexts

| File | Role |
|------|------|
| `context/NotesContexts.tsx` | Six split React contexts using `createContext` + `use()`: `NotesActionsContext` (static callbacks), `NotesSelectionContext` (activeNodeId, selectedFolderId), `NotesEditingContext` (editing/renaming state), `NotesDragContext` (drag state + handlers), `NotesSearchContext` (keyword, showMatches), `NotesUIContext` (openDropdownKey). This pattern isolates high-frequency drag updates from low-frequency selection changes. |

### Hooks

| File | Role |
|------|------|
| `hooks/useFullTextSearch.ts` | Debounced (300ms) full-text search with `AbortController` support. Delegates to `NotesSearchService.searchAllFiles()`. Tracks search stats (filename/content/both match counts). |
| `hooks/useNotesDragAndDrop.ts` | Drag-and-drop state machine for tree node reordering/moving. Tracks `draggedNodeId`, `dragOverNodeId`, `dragPosition` (before/inside/after). |
| `hooks/useNotesEditing.ts` | Inline rename state management. Tracks `editingNodeId`, `renamingNodeIds` (Set), `newlyRenamedNodeIds` (Set). Provides `inPlaceEdit` for inline input. |
| `hooks/useNotesFileUpload.ts` | File upload via drag-drop onto sidebar and file/folder picker dialogs. Manages `isDragOverSidebar` state. |
| `hooks/useNotesMenu.tsx` | Context menu item builder for tree nodes (new note, new folder, rename, star, delete, open in sidebar). |

### Services

| File | Role |
|------|------|
| `services/NotesService.ts` | File system operations via `window.api.file.*` IPC: `loadTree()` (scan directory), `sortTree()` (6 sort modes), `addDir()`, `addNote()`, `delNode()`, `renameNode()`, `uploadNotes()`, `resolveNotesPath()` (validate/fallback path). |
| `services/NotesTreeService.ts` | Pure tree manipulation utilities (no side effects): `findNode()`, `findNodeByPath()`, `findParent()`, `updateTreeNode()`, `reorderTreeNodes()`, `normalizePathValue()`, `addUniquePath()`, `removePathEntries()`, `replacePathEntries()`. |
| `services/NotesSearchService.ts` | Full-text search engine: `searchAllFiles()` searches file names and file contents across the notes tree. Returns `SearchResult` items with `matchType` (filename/content/both) and `SearchMatch[]` (lineNumber, lineContent, context). |

### Store

| File | Role |
|------|------|
| `store/note.ts` | Redux Toolkit slice: `activeNodeId`, `activeFilePath`, `settings` (NotesSettings), `notesPath`, `sortType`, `starredPaths[]`, `expandedPaths[]`. Selectors: `selectActiveFilePath`, `selectSortType`, `selectStarredPaths`, `selectExpandedPaths`. |

### Shared RichEditor Component (used by notes and chat-ui)

| File | Purpose |
|------|---------|
| `src/renderer/src/components/RichEditor/index.tsx` | Main RichEditor component |
| `src/renderer/src/components/RichEditor/toolbar.tsx` | Editor toolbar |
| `src/renderer/src/components/RichEditor/TableOfContent.tsx` | Table of contents |
| `src/renderer/src/components/RichEditor/CommandListPopover.tsx` | Slash command popover |
| `src/renderer/src/components/RichEditor/styles.ts` | Editor styles |
| `src/renderer/src/components/RichEditor/types.ts` | Editor type definitions |
| `src/renderer/src/components/RichEditor/extensions/code-block-shiki/` | Shiki code block extension |
| `src/renderer/src/components/RichEditor/extensions/enhanced-math.ts` | Math rendering |
| `src/renderer/src/components/RichEditor/extensions/yaml-front-matter.ts` | YAML front matter |
| `src/renderer/src/components/RichEditor/extensions/enhanced-link.ts` | Enhanced link handling |
| `src/renderer/src/components/RichEditor/extensions/enhanced-image.ts` | Image handling |

### Types

| File | Role |
|------|------|
| `types/note.ts` | `NotesTreeNode` interface, `NotesSortType` union type. |

### External Hooks (outside feature directory)

| Hook | Role |
|------|------|
| `hooks/useNotesQuery.ts` | React Query hooks: `useActiveNode()`, `useFileContent()`, `useFileContentSync()` for cached file reads with invalidation. |
| `hooks/useNotesSettings.ts` | Accessor for notes settings and notesPath from Redux store, plus `updateSettings()` and `updateNotesPath()`. |
| `hooks/useShowWorkspace.ts` | Toggle sidebar visibility. |

## 3. Data Models and State

### NotesTreeNode

```typescript
interface NotesTreeNode {
  id: string
  name: string              // Without .md extension
  type: 'folder' | 'file' | 'hint'
  treePath: string          // Relative path within notes root
  externalPath: string      // Absolute filesystem path
  children?: NotesTreeNode[]
  isStarred?: boolean       // Merged from starredPaths at runtime
  expanded?: boolean        // Merged from expandedPaths at runtime
  createdAt: string
  updatedAt: string
}
```

### NoteState (Redux slice)

```typescript
interface NoteState {
  activeNodeId: string | undefined
  activeFilePath: string | undefined  // Primary selection key (file path, not nodeId)
  settings: NotesSettings
  notesPath: string                   // Root directory for notes
  sortType: NotesSortType
  starredPaths: string[]              // Persisted starred file/folder paths
  expandedPaths: string[]             // Persisted expanded folder paths
}
```

### NotesSettings

```typescript
interface NotesSettings {
  isFullWidth: boolean
  fontFamily: 'default' | 'serif'
  fontSize: number                    // 10-30, default 16
  showTableOfContents: boolean
  defaultViewMode: 'edit' | 'read'
  defaultEditMode: 'preview' | 'source'  // Omit<EditorView, 'read'>
  showTabStatus: boolean
  showWorkspace: boolean
}
```

### NotesSortType

```typescript
type NotesSortType =
  | 'sort_a2z'            // Filename A-Z
  | 'sort_z2a'            // Filename Z-A
  | 'sort_updated_desc'   // Updated newest first
  | 'sort_updated_asc'    // Updated oldest first
  | 'sort_created_desc'   // Created newest first
  | 'sort_created_asc'    // Created oldest first
```

### SearchResult (extends NotesTreeNode)

```typescript
interface SearchResult extends NotesTreeNode {
  matchType: 'filename' | 'content' | 'both'
  matches?: SearchMatch[]
}

interface SearchMatch {
  lineNumber: number
  lineContent: string
  context: string
}
```

### Storage Architecture

- Notes content: `.md` files on the local filesystem (not in a database).
- Tree structure: Derived at runtime by scanning the filesystem directory.
- Starred/expanded paths: Persisted via Redux (redux-persist).
- File content cache: React Query with manual invalidation.
- Settings: Redux slice (redux-persist).

## 4. Component/Service Architecture

```
NotesPage (orchestrator, ~960 LOC)
  |-- NotesSidebar
  |     |-- NotesSidebarHeader (toolbar: new/sort/star/search)
  |     |-- DynamicVirtualList (virtualized, sticky folder headers)
  |     |     |-- TreeNode (per item, memoized)
  |     |-- 6 React Contexts:
  |     |     NotesActionsContext (callbacks)
  |     |     NotesSelectionContext (activeNodeId, selectedFolderId)
  |     |     NotesEditingContext (editingNodeId, renamingNodeIds, inPlaceEdit)
  |     |     NotesDragContext (draggedNodeId, dragOverNodeId, dragPosition, handlers)
  |     |     NotesSearchContext (searchKeyword, showMatches)
  |     |     NotesUIContext (openDropdownKey)
  |     |-- Hooks: useFullTextSearch, useNotesDragAndDrop, useNotesEditing,
  |     |          useNotesFileUpload, useNotesMenu
  |-- HeaderNavbar
  |     |-- Breadcrumb (with click-to-expand folders)
  |     |-- TitleInput (inline rename)
  |     |-- StarButton
  |     |-- MenuConfig dropdown (copy, export, display, font, settings)
  |     |-- NotesSettings (popup via GeneralPopup.show())
  |-- NotesEditor
        |-- RichEditor (TipTap, mode='preview') OR CodeEditor (Monaco, mode='source')
        |   OR RichEditor (read-only, mode='read')
        |-- BottomPanel (character count + mode Selector)

Services:
  NotesService.loadTree()    --> window.api.file.getDirectoryStructure()
  NotesService.addNote()     --> window.api.file.write()
  NotesService.delNode()     --> window.api.file.delete() / deleteDir()
  NotesService.renameNode()  --> window.api.file.rename()
  NotesService.uploadNotes() --> window.api.file.write() (batch)
  NotesTreeService           --> Pure functions (find, update, reorder)
  NotesSearchService         --> window.api.file.read() for content search

File Watcher:
  window.api.file.startFileWatcher(notesPath)
  window.api.file.onFileChange(handler) --> events: change, add, addDir, unlink, unlinkDir, refresh

Store:
  store/note.ts (Redux Toolkit) --> activeFilePath, settings, sortType, starredPaths, expandedPaths

Cache:
  React Query (useFileContent) --> file content with manual invalidation
```

### Data Flow

1. **Initialization**: `NotesPage` checks/resolves `notesPath`, calls `loadTree()` to scan filesystem, merges starred/expanded state from Redux.
2. **Tree rendering**: Tree is flattened for `DynamicVirtualList` with sticky folder headers. Starred/search views filter differently.
3. **File selection**: Click -> `setActiveFilePath()` -> React Query fetches content -> editor displays.
4. **Editing**: User types -> `handleMarkdownChange()` -> `debouncedSave()` (800ms) -> `window.api.file.write()` -> `invalidateFileContent()`.
5. **File watcher**: External changes -> events -> `refreshTree()` or `invalidateFileContent()`. Deleted active file clears selection.
6. **Cleanup**: On unmount or file switch, pending debounced saves are flushed immediately.

## 5. Dependencies on Other Features

| Dependency | Usage |
|------------|-------|
| **F001-app-core** | `window.api.file.*` IPC calls (read, write, move, delete, watcher, directory structure), `window.api.getAppInfo()`, `window.api.export.toWord()`, `window.api.setEnableSpellCheck()` |
| **F004-settings-data** | Redux store infrastructure (redux-persist), `useSettings` hook for `enableSpellCheck`, settings page components |
| **F005-chat-ui** | Shared components: `Navbar`, `RichEditor` (TipTap), `CodeEditor` (Monaco), `Selector`, `DynamicVirtualList`, `HighlightText`, `HStack`, `HSpaceBetweenStack`, `ActionIconButton`, `GeneralPopup` |
| **F003-chat-core** | `EventService` (EventEmitter) for `LOCATE_NOTE_LINE` event |

### External Libraries

- `@tiptap/*` (via RichEditor) - rich text editing
- `monaco-editor` (via CodeEditor) - source code editing
- `antd` - Dropdown, Input, Tooltip, Breadcrumb, message, Empty, Slider, Switch, Button, Popconfirm
- `styled-components` - all styling
- `motion/react` (framer-motion) - sidebar show/hide animation
- `lodash` (debounce)
- `react-i18next` - internationalization
- `@tanstack/react-query` (via useNotesQuery) - file content caching
- `lucide-react` - icons (FilePlus2, FolderPlus, Star, Search, ArrowUpNarrowWide, etc.)

## 6. Migration Notes

### Redux Toolkit to Zustand

- `store/note.ts` slice must be converted to a Zustand store.
- State shape is straightforward: no thunks, no complex selectors.
- `useAppSelector` / `useAppDispatch` calls throughout NotesPage, NotesSidebar, NotesEditor, HeaderNavbar must be replaced with Zustand hooks.
- The `store.getState()` pattern used in `updateStarredPaths` / `updateExpandedPaths` callbacks maps naturally to Zustand's `getState()`.
- `useNotesSettings` hook wraps Redux selectors -- replace internals.

### Ant Design to shadcn/ui + TailwindCSS 4

| antd Component | Usage Location | shadcn/ui Target |
|----------------|----------------|------------------|
| `Dropdown` (with `trigger={['contextMenu']}`) | TreeNode, SidebarHeader, HeaderNavbar | `ContextMenu` / `DropdownMenu` |
| `Input` | NotesSettings, HeaderNavbar (title rename), SidebarHeader (search) | `Input` |
| `Tooltip` | SidebarHeader, HeaderNavbar | `Tooltip` |
| `Breadcrumb` | HeaderNavbar | Custom breadcrumb or `Breadcrumb` |
| `message` | NotesPage (warnings) | Toast (sonner) |
| `Empty` | NotesEditor (no note selected) | Custom empty state |
| `Slider` | NotesSettings (font size) | `Slider` |
| `Switch` | NotesSettings | `Switch` |
| `Button` | NotesSettings | `Button` |
| `Popconfirm` | (used in shared components) | `AlertDialog` |

### styled-components to Tailwind

- Every file uses `styled-components` for layout and theming.
- CSS custom properties (`var(--color-background)`, `var(--color-border)`, etc.) are already used and can map to Tailwind theme tokens.
- Complex dynamic styles (drag indicators with `::before`/`::after`, shimmer animation) need Tailwind `@apply` or inline styles.

### Identity Remapping

- No Cherry/CS-specific branding found in notes source files.
- `CherryStudio` references may exist in i18n keys or shared components (check `t('notes.*')` keys).

### Key Architectural Decisions

- The 6-context architecture in NotesSidebar is a deliberate performance optimization. Options for migration:
  (a) Preserve as React contexts with Zustand-backed values.
  (b) Replace with Zustand subscriptions + `useSyncExternalStore` for selective re-render.
  (c) Use Zustand slices with shallow comparison.
- File system operations via `window.api.file.*` IPC remain unchanged (main process concern).
- The `RichEditor` (TipTap) and `CodeEditor` (Monaco) are shared components from F005; their migration is handled there.
- React Query for file content caching should be preserved.

## 7. Complexity Assessment

**Overall: HIGH**

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Component count | High | 7 page components + 1 sub-component + 6 contexts + 5 hooks |
| State complexity | High | Mix of Redux, React state, refs, React Query cache, filesystem watcher |
| File system integration | High | Real-time file watcher, debounced saves, path normalization, cross-platform path handling |
| UI complexity | Medium-High | Virtualized tree with sticky headers, drag-and-drop, inline editing, breadcrumbs, multi-mode editor |
| Migration effort | High | Heavy antd usage, styled-components throughout, Redux slice, 6 context providers |
| Lines of code | ~2500+ | NotesPage ~960, NotesSidebar ~535, TreeNode ~500, rest ~500+ |

### Risk Areas

- Race conditions in debounced save during file switching (handled with refs but fragile)
- Tree state merging (starred/expanded paths from Redux merged into filesystem-derived tree)
- File watcher event handling with concurrent rename/move/create operations
- The 6-context pattern is non-trivial to replicate with Zustand subscriptions
- `isRenamingRef` and `isCreatingNoteRef` guards prevent premature path clearing during async operations
- Emergency save on unmount (`saveCurrentNoteRef.current`) to prevent data loss

---

## 8. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B191 | Create new note (markdown file) | P1 | Creates .md file on disk via `addNote()` |
| B192 | Create new folder in note tree | P1 | Creates directory via `addDir()` |
| B193 | Edit note with TipTap rich text editor | P1 | WYSIWYG editing with markdown sync |
| B194 | Switch between WYSIWYG, source, and read modes | P1 | Three editor modes |
| B195 | Auto-save note content with debounced writes (800ms) | P1 | Debounced save with emergency flush |
| B196 | Import .md files via drag-and-drop | P1 | Drop onto sidebar |
| B197 | Import .md files/folders via file dialog | P2 | Upload button |
| B198 | Delete note/folder | P1 | Remove from disk, clean starred/expanded paths |
| B199 | Rename note/folder inline | P1 | Updates file path, fixes active path references |
| B200 | Drag-and-drop reordering/reparenting in tree | P2 | Same-parent reorder or cross-parent move |
| B201 | Favorite/star notes | P2 | Persistent starred paths |
| B202 | Favorites filter view | P2 | Show only starred files |
| B203 | Full-text search across notes (filename + content) | P2 | With match highlighting and line navigation |
| B204 | Sort notes (6 sort modes) | P2 | A-Z, Z-A, updated desc/asc, created desc/asc |
| B205 | File system watcher for external changes | P1 | Live sync with filesystem |
| B206 | Breadcrumb navigation with click-to-expand | P2 | Navigate folder hierarchy |
| B207 | Inline title rename in header | P2 | Edit note name via breadcrumb input |
| B208 | Copy note content to clipboard | P2 | Via header menu |
| B209 | Export note to Word document | P3 | Via header menu |
| B210 | Context menu for tree nodes | P1 | Right-click: rename, delete, star, new note/folder |
| B211 | Configurable work directory | P2 | Select, apply, reset to default |
| B212 | Table of contents generation | P3 | From headings in RichEditor |
| B213 | Scroll to specific line on search result click | P2 | `LOCATE_NOTE_LINE` event |

---

## 9. Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-100 | User creates a new note and writes content | B191, B193, B195 |
| SC-101 | User organizes notes with folders and drag-drop | B192, B200 |
| SC-102 | User imports existing .md files | B196, B197 |
| SC-103 | User toggles between WYSIWYG, source, and read mode | B194 |
| SC-104 | User searches across all notes and navigates to match | B203, B213 |
| SC-105 | User favorites and filters notes | B201, B202 |
| SC-106 | User sorts notes by various criteria | B204 |
| SC-107 | User right-clicks for context menu actions | B210 |
| SC-108 | User renames a note inline and via header | B199, B207 |
| SC-109 | External editor modifies note, app syncs changes | B205 |

---

## 10. Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| RichEditor shared with chat message display | F010 <-> F005-chat-ui | Same component, different usage contexts |
| TipTap extensions compatibility | F010 <-> F005-chat-ui | Ensure shared extensions work in both |
| Note content as knowledge base item | F010 <-> F007-knowledge | KnowledgeNoteItem uses note content |
| Notes directory within app data directory | F010 <-> F001-app-core | Data directory structure |
| EventEmitter for LOCATE_NOTE_LINE | F010 <-> F003-chat-core | Cross-feature event |
| Redux note slice migration | F010 | Straightforward Zustand conversion |
| Spell check setting shared with chat | F010 <-> F004-settings-data | `enableSpellCheck` from settings store |
