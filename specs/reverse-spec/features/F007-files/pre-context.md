# F007-files Pre-Context

## Feature Overview

| Field | Value |
|-------|-------|
| Feature ID | F007-files |
| Title | File Management |
| Tier | 2 (Supporting) |
| Risk Group | RG-2 |
| Dependencies | F001-shell, F002-i18n-theme |
| SBI Range | B091 - B108 |

## Scope

File management layer covering upload/download, file storage, binary/base64 handling, filesystem watching, and the files page UI. This feature provides the foundation for file attachments in chat (F006), document ingestion in knowledge bases (F010), and general file operations across the app.

## Migration Notes

- **Original**: Cherry Studio
- **Target**: Angdu Studio (Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7)
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- **IPC layer**: File IPC handlers remain in main process; renderer calls via preload bridge.

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| src/renderer/src/pages/files/FilesPage.tsx | Files page UI (list, sort, type filters) |
| src/main/services/FileStorage.ts | File storage service in main process |
| src/main/ipc.ts | IPC handlers for File_* operations |
| src/renderer/src/databases/index.ts | Files table in local database |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B091 | main/ipc.ts | File_Upload() | Handles file upload to app storage | P1 | extracted |
| B092 | main/ipc.ts | File_Delete() | Deletes file from storage | P1 | extracted |
| B093 | main/ipc.ts | File_Read() | Reads file content by ID | P1 | extracted |
| B094 | main/ipc.ts | File_Write() | Writes content to file | P1 | extracted |
| B095 | main/ipc.ts | File_Select() | Opens native file selection dialog | P1 | extracted |
| B096 | main/ipc.ts | File_Download() | Downloads file from URL | P2 | extracted |
| B097 | main/ipc.ts | File_SaveImage() | Saves image file to storage | P1 | extracted |
| B098 | main/ipc.ts | File_SaveBase64Image() | Converts and saves base64 image | P2 | extracted |
| B099 | main/ipc.ts | File_BinaryImage() | Returns image as binary buffer | P2 | extracted |
| B100 | main/ipc.ts | File_Base64Image() | Returns image as base64 string | P2 | extracted |
| B101 | main/ipc.ts | File_Move() | Moves file to new location | P2 | extracted |
| B102 | main/ipc.ts | File_Rename() | Renames file | P2 | extracted |
| B103 | main/ipc.ts | File_GetDirectoryStructure() | Returns directory tree structure | P2 | extracted |
| B104 | main/ipc.ts | File_StartWatcher() | Starts filesystem watcher on path | P2 | extracted |
| B105 | main/ipc.ts | File_StopWatcher() | Stops filesystem watcher | P2 | extracted |
| B106 | main/ipc.ts | File_BatchUploadMarkdown() | Batch uploads markdown files | P3 | extracted |
| B107 | pages/files/FilesPage.tsx | renderFileList() | Renders file list with type filters | P1 | extracted |
| B108 | pages/files/FilesPage.tsx | handleFileSort() | Sorts files by name/size/date | P2 | extracted |

## Priority Breakdown

| Priority | Count | IDs |
|----------|-------|-----|
| P1 | 7 | B091, B092, B093, B094, B095, B097, B107 |
| P2 | 10 | B096, B098, B099, B100, B101, B102, B103, B104, B105, B108 |
| P3 | 1 | B106 |

## Dependency Graph

```
F001-shell ──────┐
                 ├──> F007-files ──> F006-chat-core (attachments)
F002-i18n-theme ─┘               ──> F010-knowledge (document ingestion)
```

- **F001-shell**: File operations depend on the Electron shell layer (native dialogs, fs access, app paths).
- **F002-i18n-theme**: Files page UI uses i18n strings and theme tokens.

## Key Design Decisions for Angdu Studio

1. **App storage path**: Files stored under `app.getPath('userData')/files/`. Each file gets a UUID-based directory.
2. **IPC contract**: All File_* handlers follow request/response IPC pattern. The renderer never accesses `fs` directly.
3. **Filesystem watcher**: Uses chokidar via main process. Watcher events forwarded to renderer via IPC push.
4. **Image handling**: Dual format support (binary buffer for display, base64 for API calls). Conversion happens in main process.
5. **Files page**: Simple flat list with type filters (all, images, documents, code). Sort by name, size, or date.
