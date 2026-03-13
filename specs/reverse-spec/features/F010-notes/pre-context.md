# F010-notes Pre-Context

> Feature: Notes editor (TipTap rich text), note tree management, Obsidian export
> Tier: 3 | Risk Group: RG-2 | Dependencies: F001

---

## 1. Runtime Exploration Results

### Screen: /notes -- Notes

**Layout**: Navbar + ContentContainer (NotesSidebar + EditorWrapper)

**UI Elements (from source)**:
- **Navbar**: Centered title "Notes"
- **Sidebar** (250px, animated show/hide via framer-motion): Note tree with folders and files, drag-and-drop, context menu
- **HeaderNavbar**: Breadcrumb, star toggle, rename, expand path
- **NotesEditor**: TipTap rich text editor or source code editor (CodeEditor)
- **Settings**: Font family, font size, full width, table of contents, view modes (edit/read), edit modes (preview/source)

**User Flows**:
| Flow | Steps |
|------|-------|
| Create note | Click + button or context menu -> name input -> creates .md file |
| Create folder | Similar flow for folder creation |
| Select note | Click file in tree -> loads content in editor |
| Edit note | Type in rich editor -> debounced auto-save (800ms) |
| Rename | Context menu -> rename dialog |
| Delete | Context menu -> confirm -> trash |
| Star/unstar | Toggle star on note/folder |
| Drag & drop | Move nodes between folders or reorder within same parent |
| Sort | Sort by name, date, starred |
| Upload files | Drop files onto sidebar |
| Search | Cmd+F triggers KnowledgeSearchPopup (repurposed) |

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| 1 | `src/renderer/src/pages/notes/NotesPage.tsx` | Main page: sidebar + editor, tree management, file watcher | [TBD] |
| 2 | `src/renderer/src/pages/notes/NotesSidebar.tsx` | Tree sidebar with drag-and-drop | [TBD] |
| 3 | `src/renderer/src/pages/notes/NotesEditor.tsx` | Editor wrapper (rich/source toggle) | [TBD] |
| 4 | `src/renderer/src/pages/notes/HeaderNavbar.tsx` | Top bar with breadcrumb, star, actions | [TBD] |
| 5 | `src/renderer/src/pages/notes/NotesSettings.tsx` | Notes display settings | [TBD] |
| 6 | `src/renderer/src/pages/notes/NotesSidebarHeader.tsx` | Sidebar header with actions | [TBD] |
| 7 | `src/renderer/src/pages/notes/MenuConfig.tsx` | Context menu configuration | [TBD] |
| 8 | `src/renderer/src/pages/notes/components/` | Sub-components | [TBD] |
| 9 | `src/renderer/src/pages/notes/hooks/` | Notes-specific hooks | [TBD] |
| 10 | `src/renderer/src/pages/notes/context/` | Notes context providers | [TBD] |
| 11 | `src/renderer/src/store/note.ts` | Redux slice for notes state (-> Zustand) | [TBD] |
| 12 | `src/renderer/src/services/NotesService.ts` | File operations: addNote, addDir, delNode, loadTree, sortTree, uploadNotes | [TBD] |
| 13 | `src/renderer/src/services/NotesTreeService.ts` | Tree manipulation: findNode, findParent, reorderTreeNodes, etc. | [TBD] |
| 14 | `src/renderer/src/components/RichEditor/` | TipTap-based rich text editor | [TBD] |
| 15 | `src/renderer/src/components/MarkdownEditor/` | Markdown-specific editor | [TBD] |
| 16 | `src/renderer/src/components/CodeEditor/` | Source code editor (Monaco?) | [TBD] |
| 17 | `src/main/services/ObsidianVaultService.ts` | Obsidian vault detection and export | [TBD] |

**[New Stack] Logic-Only Reference**: Tree manipulation logic is stack-independent. TipTap editor is React-compatible (keep). Store: Redux -> Zustand. UI: Ant Design -> shadcn/ui. Styled-components -> Tailwind.

---

## 3. Source Behavior Inventory

### Note Store (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B238 | setActiveFilePath | `(path?: string) => void` | P1 |
| B239 | setActiveNodeId | `(id?: string) => void` | P1 |
| B240 | updateNotesSettings | `(settings: Partial<NotesSettings>) => void` | P1 |
| B241 | setNotesPath | `(path: string) => void` | P1 |
| B242 | setSortType | `(sortType: NotesSortType) => void` | P2 |
| B243 | setStarredPaths | `(paths: string[]) => void` | P2 |
| B244 | setExpandedPaths | `(paths: string[]) => void` | P2 |

### NotesPage (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B245 | NotesPage | `FC` -- main page with tree, editor, file watcher | P1 |
| B246 | saveCurrentNote | `(content, filePath?) => Promise<void>` | P1 |
| B247 | handleCreateNote | `(name, targetFolderId?) => Promise<void>` | P1 |
| B248 | handleCreateFolder | `(name, targetFolderId?) => Promise<void>` | P1 |
| B249 | handleDeleteNode | `(nodeId) => Promise<void>` | P1 |
| B250 | handleRenameNode | `(nodeId, newName) => Promise<void>` | P1 |
| B251 | handleSelectNode | `(node: NotesTreeNode) => Promise<void>` | P1 |
| B252 | handleMoveNode | `(sourceId, targetId, position) => Promise<void>` | P2 |
| B253 | handleToggleExpanded | `(nodeId) => void` | P2 |
| B254 | handleToggleStar | `(nodeId) => void` | P2 |
| B255 | handleSortNodes | `(sortType) => Promise<void>` | P2 |
| B256 | handleUploadFiles | `(files: File[]) => Promise<void>` | P2 |
| B257 | handleMarkdownChange | `(newMarkdown) => void` -- debounced save | P1 |
| B258 | handleExpandPath | `(treePath) => void` | P3 |
| B259 | refreshTree | `() => Promise<void>` | P1 |
| B260 | handleLocateNoteLine | event handler for external line navigation | P3 |

### NotesService -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B261 | addNote | `(name, content, targetPath) => Promise<{path}>` | P1 |
| B262 | addDir | `(name, targetPath) => Promise<void>` | P1 |
| B263 | delNode | `(node: NotesTreeNode) => Promise<void>` | P1 |
| B264 | loadTree | `(notesPath) => Promise<NotesTreeNode[]>` | P1 |
| B265 | sortTree | `(tree, sortType) => NotesTreeNode[]` | P2 |
| B266 | renameNode | `(node, newName) => Promise<{path}>` | P1 |
| B267 | uploadNotes | `(files, targetPath) => Promise<{fileCount}>` | P2 |
| B268 | resolveNotesPath | `(path) => Promise<{path, isFallback}>` | P2 |

### NotesTreeService -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B269 | findNode | `(tree, id) => NotesTreeNode \| undefined` | P1 |
| B270 | findParent | `(tree, id) => NotesTreeNode \| undefined` | P2 |
| B271 | findNodeByPath | `(tree, path) => NotesTreeNode \| undefined` | P2 |
| B272 | reorderTreeNodes | `(tree, sourceId, targetId, position) => NotesTreeNode[]` | P2 |
| B273 | addUniquePath / removePathEntries / replacePathEntries | path set utilities | P2 |
| B274 | normalizePathValue | `(path) => string` | P2 |
| B275 | updateTreeNode | `(tree, id, updater) => NotesTreeNode[]` | P3 |

### ObsidianVaultService -- P3

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B276 | ObsidianVaultService | class: vault detection, file listing for Obsidian export | P3 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| `message` | Ant Design message | shadcn/ui toast |
| `AnimatePresence`, `motion` | framer-motion (motion/react) | Keep framer-motion |
| `DraggableList` | Custom (dnd-kit?) | Keep/port dnd-kit |
| TipTap RichEditor | @tiptap/react | Keep TipTap |
| CodeEditor (Monaco?) | Custom wrapper | Keep |
| `styled-components` | styled-components | Tailwind CSS 4 |
| Scrollbar | Custom | Keep/port |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| Auto-save | Debounced save (800ms) on editor content change |
| Emergency save | Saves pending content on file switch and component unmount |
| File watcher | chokidar watches notes directory for external changes |
| Tree sync | File watcher events (add/unlink/change/refresh) trigger tree refresh |
| Drag & drop | Move files/folders between parents or reorder within same parent |
| Sidebar animation | AnimatePresence with width/opacity animation (0 <-> 250px, 300ms) |
| Star/expand state | Persisted in Redux store as path arrays |
| Cross-platform restore | Validates notes path on startup, falls back to default if invalid |
| Line navigation | External event (LOCATE_NOTE_LINE) can navigate to specific line in a note |
| Scroll to line | After file switch, pending scroll executes via requestAnimationFrame |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| (none found in notes source files) | -- | -- |

---

## 7. Static Resources

- **Icons**: lucide-react (various tree/file icons from context/hooks)
- **Fonts**: Configurable via settings (default / serif)
- **No custom images** specific to this feature

---

## 8. Environment Variables

- None specific to this feature

---

## 9. For /speckit.specify

### Summary
Notes feature provides a full-featured markdown note editor with file-system-backed storage. Includes a tree sidebar for navigation, TipTap rich text editing, source code editing, drag-and-drop organization, file watching for external changes, and Obsidian vault export.

### Key Scenarios
- SC-F010-01: User creates a new note in a folder
- SC-F010-02: User edits note content with auto-save
- SC-F010-03: User organizes notes via drag-and-drop
- SC-F010-04: User renames a note/folder
- SC-F010-05: User deletes a note/folder with confirmation
- SC-F010-06: User stars important notes for quick access
- SC-F010-07: External file changes reflected in real-time via file watcher
- SC-F010-08: User switches between rich/source editing modes
- SC-F010-09: User uploads markdown files to notes directory

### Draft Functional Requirements
- FR-F010-01: Notes shall be stored as .md files on the local filesystem
- FR-F010-02: Editor shall support rich text (TipTap) and source code editing modes
- FR-F010-03: Auto-save shall debounce at 800ms with emergency save on unmount
- FR-F010-04: File watcher shall sync tree on external file changes
- FR-F010-05: Tree operations (create/rename/delete/move) shall operate on the filesystem
- FR-F010-06: Star and expand states shall persist across sessions
- FR-F010-07: Cross-platform restore shall detect invalid paths and fallback

### Edge Cases
- File renamed externally while active in editor -> path mismatch handled
- Race condition: debounced save vs. file switch -> captured file path at save time
- Notes path invalid after backup restore -> fallback to default with warning
- Concurrent file watcher events -> refreshTree batching
- Emergency save on unmount fails -> logged, content lost

---

## 10. For /speckit.plan

### Dependencies
- F001 (Core): IPC, store persistence, file API

### Entities Owned
- `NotesTreeNode`: id, name, type (file/folder), externalPath, children, expanded, isStarred
- `NoteState` (store): activeFilePath, settings, notesPath, sortType, starredPaths, expandedPaths
- `NotesSettings`: isFullWidth, fontFamily, fontSize, showTableOfContents, defaultViewMode, defaultEditMode

### Key APIs (IPC)
- `file.write`, `file.getDirectoryStructure`, `file.startFileWatcher`, `file.stopFileWatcher`
- `file.move`, `file.moveDir`, `file.checkFileName`
- `file.onFileChange` (IPC listener)

### Tech Decisions
- File-system backed storage (not DB) -- notes are .md files
- TipTap for rich text editing (prosemirror-based)
- Monaco (or similar) for source code editing
- chokidar for file watching
- React Query for file content caching (`useFileContent`)
- Debounced save with emergency save pattern

---

## 11. Feature Contracts

### Guarantees
- Notes stored as readable .md files at configurable path
- Auto-save ensures minimal data loss (800ms debounce)
- File watcher provides real-time sync with external changes
- Star/expand state persisted in store

### Dependencies on Other Features
- F001: File system IPC, store persistence

### Failure Modes
- File system permission error -> save fails, logged
- File watcher error -> tree out of sync until manual refresh
- TipTap editor crash -> content in lastContentRef still saveable
- Notes path inaccessible -> fallback to default path

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F010 <-> F007 (Files): Uses FileStorage for file watcher, directory structure
- F010 <-> F009 (Knowledge): Notes can be added as knowledge base items
- F010 <-> F011 (Data Sync): Notes path may need migration after backup restore

### Impact Scope
- File-system backed storage means notes are portable and editable outside app
- TipTap editor is a significant UI dependency
- File watcher creates long-lived OS handles
