# F007-file-management Pre-Context

> Feature: File storage service, upload/download, document handling, file browser page
> Tier: 2 | Risk Group: RG-2 | Dependencies: F001

---

## 1. Runtime Exploration Results

### Screen: /files -- File Management

**Layout**: Navbar + ContentContainer (SideNav + MainContent)

**UI Elements (from source)**:
- **Navbar**: Centered title "Files"
- **SideNav**: 4 category items -- Document, Image, Text, All (ListItem with lucide-react icons)
- **MainContent**: Sort bar (created_at, size, name with toggle asc/desc) + file list
- **Sort controls**: SortButton components, active state with border highlight
- **Batch operations**: Dropdown.Button with select-all Checkbox + batch delete (with Popconfirm)
- **File items**: Name (clickable to open), size, creation date, edit/delete/checkbox actions
- **Empty state**: Ant Design `Empty` component
- **Image view**: Grid layout with `Image.PreviewGroup` for image type files

**User Flows**:
| Flow | Steps |
|------|-------|
| Browse files | Select category in SideNav -> view filtered file list |
| Sort files | Click sort button (created_at/size/name) -> toggle asc/desc |
| Open file | Click file name -> opens via `window.api.file.openPath` |
| Rename file | Click edit icon -> rename dialog |
| Delete file | Click delete icon -> Popconfirm -> delete |
| Batch delete | Check files -> Dropdown menu -> batch delete with confirm |
| Select all | Click select-all checkbox -> selects/deselects all visible files |

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| 1 | `src/renderer/src/pages/files/FilesPage.tsx` | Main page component, category nav, sort, batch ops | [TBD] |
| 2 | `src/renderer/src/pages/files/FileList.tsx` | File list rendering, virtual list for documents, image grid for images | [TBD] |
| 3 | `src/renderer/src/pages/files/FileItem.tsx` | Individual file item rendering | [TBD] |
| 4 | `src/renderer/src/pages/files/ContentView.tsx` | Content view component | [TBD] |
| 5 | `src/main/services/FileStorage.ts` | Main-process file operations (upload, read, delete, write, watcher, download) | [TBD] |
| 6 | `src/main/services/FileSystemService.ts` | Thin wrapper: readFile, readTextFileWithAutoEncoding | [TBD] |
| 7 | `src/main/services/ExportService.ts` | Markdown-to-DOCX export | [TBD] |
| 8 | `src/renderer/src/services/FileManager.ts` | Renderer-side file manager utilities | [TBD] |
| 9 | `src/renderer/src/services/FileAction.ts` | handleDelete, handleRename, sortFiles, tempFilesSort | [TBD] |

**[New Stack] Logic-Only Reference**: All UI rebuilt with shadcn/ui + Tailwind CSS 4. Ant Design components (Button, Checkbox, Dropdown, Empty, Popconfirm, Image, Row, Col, Flex) replaced. styled-components replaced with Tailwind.

---

## 3. Source Behavior Inventory

### FileStorage (main process) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B150 | uploadFile | `(_, file: FileMetadata) => Promise<FileMetadata>` | P1 |
| B151 | getFile | `(_, filePath: string) => Promise<FileMetadata \| null>` | P1 |
| B152 | deleteFile | `(_, id: string) => Promise<void>` | P1 |
| B153 | readFile | `(_, filePath: string, encoding?: BufferEncoding) => Promise<Buffer \| string>` | P1 |
| B154 | writeFile | `(_, filePath: string, data: any) => Promise<void>` | P1 |
| B155 | selectFile | `(_, options) => Promise<OpenDialogReturnValue>` | P1 |
| B156 | open | `(_, options: OpenDialogOptions) => Promise<string[]>` | P1 |
| B157 | openPath | `(_, path: string) => Promise<void>` | P1 |
| B158 | save | `(_, options) => Promise<SaveDialogReturnValue>` | P2 |
| B159 | downloadFile | `(_, url, ...) => Promise<FileMetadata>` | P2 |
| B160 | base64Image | `(_, filePath) => Promise<string>` | P2 |
| B161 | saveBase64Image | `(_, base64Data) => Promise<FileMetadata>` | P2 |
| B162 | savePastedImage | `(_, ...) => Promise<FileMetadata>` | P2 |
| B163 | pdfPageCount | `(_, id) => Promise<number>` | P2 |
| B164 | base64File | `(_, id) => Promise<{data, mime}>` | P2 |
| B165 | binaryImage | `(_, id) => Promise<{data, mime}>` | P2 |
| B166 | deleteDir | `(_, id) => Promise<void>` | P2 |
| B167 | moveFile | `(_, filePath, newPath) => Promise<void>` | P2 |
| B168 | moveDir | `(_, dirPath, newDirPath) => Promise<void>` | P2 |
| B169 | renameFile | `(_, filePath, newName) => Promise<void>` | P2 |
| B170 | renameDir | `(_, dirPath, newName) => Promise<void>` | P2 |
| B171 | getDirectoryStructure | `(_, dirPath) => Promise<NotesTreeNode[]>` | P2 |
| B172 | startFileWatcher | `(_, dirPath) => Promise<void>` | P2 |
| B173 | stopFileWatcher | `() => Promise<void>` | P2 |
| B174 | clear | `() => Promise<void>` | P3 |
| B175 | clearTemp | `() => Promise<void>` | P3 |
| B176 | copyFile | `(_, id, destPath) => Promise<void>` | P3 |
| B177 | selectFolder | `(_, options) => Promise<string \| null>` | P2 |
| B178 | batchUploadMarkdownFiles | `(_, ...) => Promise<...>` | P3 |
| B179 | isTextFile | `(_, filePath) => Promise<boolean>` | P3 |
| B180 | showInFolder | `(_, path) => Promise<void>` | P3 |

### ExportService -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B181 | exportToWord | `(_, markdown, fileName) => Promise<void>` | P2 |

### FileSystemService -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B182 | readFile | `(_, pathOrUrl, encoding?) => Promise<Buffer \| string>` | P2 |
| B183 | readTextFileWithAutoEncoding | `(_, path) => Promise<string>` | P2 |

### FilesPage (renderer) -- P1

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B184 | FilesPage | `FC` -- main page with category nav, sort, batch ops | P1 |
| B185 | handleBatchDelete | internal -- batch delete with paintings check | P1 |
| B186 | sortFiles / tempFilesSort | from FileAction -- sorting utilities | P1 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| `Button` | Ant Design | shadcn/ui Button |
| `Checkbox` | Ant Design | shadcn/ui Checkbox |
| `Dropdown.Button` | Ant Design | shadcn/ui DropdownMenu |
| `Empty` | Ant Design | Custom empty state |
| `Popconfirm` | Ant Design | shadcn/ui AlertDialog |
| `Flex` | Ant Design | Tailwind flex utilities |
| `Image.PreviewGroup`, `Row`, `Col` | Ant Design | Custom image grid |
| `Spin` | Ant Design | shadcn/ui spinner |
| `DynamicVirtualList` | Custom (VirtualList) | Keep/port |
| `ListItem` | Custom | Port with Tailwind |
| `lucide-react` icons | lucide-react | Keep |
| `styled-components` | styled-components | Tailwind CSS 4 |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| Click to open | File name click opens file via native shell |
| Sort toggle | Click same sort field toggles asc/desc; different field resets to desc |
| Batch select | Checkbox per file + select-all with indeterminate state |
| Category filter | SideNav category click filters by FILE_TYPE |
| Inline delete | Popconfirm on delete icon |
| Paintings check | Batch delete warns if files are referenced by paintings |
| Virtual scroll | DynamicVirtualList for document/text lists |
| Image grid | Grid layout with preview group for image category |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| (none found in core files) | -- | -- |

Note: FileStorage.ts and FilesPage.tsx do not contain Cherry/CS identifiers directly.

---

## 7. Static Resources

- **Icons**: lucide-react (File, FileImage, FileText, FileType, ArrowDownNarrowWide, ArrowUpWideNarrow, EditIcon, DeleteIcon)
- **No custom images/fonts** specific to this feature

---

## 8. Environment Variables

- None specific to this feature

---

## 9. For /speckit.specify

### Summary
File management feature provides a file browser page with category-based navigation (document, image, text, all), sortable file lists, batch operations, and integration with the main-process FileStorage service for CRUD operations on files stored in the app's data directory.

### Key Scenarios
- SC-F007-01: User browses documents by category
- SC-F007-02: User sorts files by date/size/name
- SC-F007-03: User renames a file inline
- SC-F007-04: User deletes a single file with confirmation
- SC-F007-05: User batch-selects and deletes multiple files
- SC-F007-06: User views image files in a grid with preview
- SC-F007-07: System prevents deletion of files used in paintings

### Draft Functional Requirements
- FR-F007-01: File browser shall display files filtered by type (document, image, text, all)
- FR-F007-02: File list shall support sorting by created_at, size, name (asc/desc)
- FR-F007-03: Batch delete shall validate files are not referenced by paintings before deletion
- FR-F007-04: Image category shall render a grid with image preview
- FR-F007-05: File open shall delegate to native OS file handler
- FR-F007-06: File upload shall store metadata in Dexie and binary in app data directory

### Edge Cases
- Attempt to delete file referenced by a painting -> warning modal
- File not found on disk but exists in DB -> graceful error
- Large file list performance -> virtual scrolling

---

## 10. For /speckit.plan

### Dependencies
- F001 (Core Infrastructure): Dexie DB, FileManager service, IPC channels

### Entities Owned
- `FileMetadata`: id, name, ext, size, type, count, created_at, origin_name
- `Files` (Dexie table): stores FileMetadata records

### Key APIs (IPC)
- `file.upload`, `file.delete`, `file.read`, `file.write`, `file.openPath`, `file.select`, `file.save`
- `file.downloadFile`, `file.base64Image`, `file.saveBase64Image`, `file.pdfPageCount`
- `file.startFileWatcher`, `file.stopFileWatcher`
- `export.toWord`

### Tech Decisions
- Dexie (IndexedDB) for file metadata persistence (via `useLiveQuery`)
- Main-process handles all filesystem I/O (chokidar watcher, native dialogs)
- Virtual scrolling for large file lists
- Markdown-to-DOCX export via `docx` library

---

## 11. Feature Contracts

### Guarantees
- Files uploaded via FileStorage are stored in `{userData}/Data/Files/` with UUID-based naming
- File metadata is persisted in Dexie `files` table
- File watcher (chokidar) watches the notes directory for live updates

### Dependencies on Other Features
- F001: IPC infrastructure, Dexie DB instance, window management

### Failure Modes
- Disk full: upload fails with error
- File locked by OS: delete/rename fails
- DB corruption: file metadata lost but files remain on disk

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F007 <-> F009 (Knowledge): Knowledge Base uses FileStorage for document ingestion
- F007 <-> F010 (Notes): Notes use FileStorage for file watcher, directory operations
- F007 <-> F012 (Paintings): Paintings reference files; deletion must check paintings store

### Impact Scope
- FileStorage is a shared service used by F009, F010, F012
- Changes to file path structure affect knowledge base and notes
- Export service (DOCX) is used from chat message export flows
