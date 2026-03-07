# Data Model: App Core (F001)

**Feature Branch**: `001-app-core`
**Date**: 2026-03-02
**Spec**: [spec.md](./spec.md)

---

## Overview

F001-app-core owns two entities:

| Entity | Storage | Process | Description |
|--------|---------|---------|-------------|
| FileMetadata | Dexie (IndexedDB) | Renderer | Metadata for files stored in the app's managed directory |
| Shortcut | Zustand store (in-memory + persist) | Renderer | Keyboard shortcut bindings |

F001 also initializes the database infrastructure for later features:
- **better-sqlite3 + Drizzle ORM** in the main process (no F001-owned tables; first tables come from F012)
- **Dexie/IndexedDB** in the renderer process (FileMetadata table defined here)

---

## Entity: FileMetadata

**Storage**: Dexie / IndexedDB (renderer process)
**Source Reference**: `src/renderer/src/databases/index.ts`, `packages/shared/types/file.ts`
**Referenced By**: F004-chat-conversation (message attachments), F006-knowledge-base (document items), F010-image-generation (generated images)

### Purpose

Represents a file that has been uploaded to Cherry Studio's managed storage. Each file gets a UUID-based unique identifier. The physical file is stored in the app data `files/` directory on the main process side, while the metadata record lives in Dexie for fast renderer-side querying.

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string` | PK, NOT NULL | UUID v4 | Unique file identifier. Format: UUID v4 generated via `crypto.randomUUID()` |
| `name` | `string` | NOT NULL | -- | Storage file name (UUID-based, e.g., `a1b2c3d4.pdf`) |
| `origin_name` | `string` | NOT NULL | -- | Original file name as provided by the user (e.g., `my-document.pdf`) |
| `path` | `string` | NOT NULL | -- | Absolute path to the file in the managed storage directory |
| `size` | `number` | NOT NULL | -- | File size in bytes |
| `ext` | `string` | NOT NULL | -- | File extension including the dot (e.g., `.pdf`, `.png`, `.txt`) |
| `type` | `FileType` | NOT NULL | -- | Categorized file type. Enum values: `image`, `video`, `audio`, `text`, `document`, `other` |
| `created_at` | `string` | NOT NULL | ISO 8601 | Creation timestamp in ISO 8601 format (e.g., `2026-03-02T10:30:00.000Z`) |
| `count` | `number` | NOT NULL | `0` | Reference count. Tracks how many entities (messages, knowledge items) reference this file |
| `tokens` | `number` | Optional | `undefined` | Estimated token count for text-based files. Used by AI features for context window management |
| `purpose` | `string` | Optional | `undefined` | File purpose classification for API usage (e.g., `assistants`, `vision`, `fine-tune`) |

### FileType Enum

```typescript
enum FileType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Text = 'text',
  Document = 'document',
  Other = 'other'
}
```

File type is determined by extension mapping:
- `image`: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`
- `video`: `.mp4`, `.webm`, `.avi`, `.mov`, `.mkv`
- `audio`: `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`
- `text`: `.txt`, `.md`, `.csv`, `.json`, `.xml`, `.yaml`, `.yml`, `.log`
- `document`: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- `other`: Everything else

### Indexes

| Index Name | Fields | Type | Purpose |
|------------|--------|------|---------|
| Primary | `id` | PK | Primary key lookup by UUID |
| name_idx | `name` | INDEX | Lookup by storage file name |
| type_idx | `type` | INDEX | Filter files by type category |
| created_at_idx | `created_at` | INDEX | Chronological ordering and range queries |

### Dexie Schema Definition

```typescript
import Dexie, { type Table } from 'dexie'

interface FileMetadata {
  id: string
  name: string
  origin_name: string
  path: string
  size: number
  ext: string
  type: FileType
  created_at: string
  count: number
  tokens?: number
  purpose?: string
}

class CherryStudioDB extends Dexie {
  files!: Table<FileMetadata, string>

  constructor() {
    super('CherryStudioDB')
    this.version(1).stores({
      files: 'id, name, type, created_at'
    })
  }
}

export const db = new CherryStudioDB()
```

### Lifecycle

1. **Creation**: When a file is uploaded (picker, drag-drop, paste, or URL download), the main process copies the file to storage and returns metadata fields. The renderer creates a `FileMetadata` record in Dexie with `count: 0`.
2. **Reference counting**: When a consuming feature (F004 message attachment, F006 knowledge item) associates a file, it increments `count`. When the association is removed, it decrements `count`.
3. **Querying**: The renderer queries Dexie directly (no IPC needed) for listing, filtering, and displaying file metadata in the UI.
4. **Deletion**: Files with `count === 0` are candidates for cleanup. Deletion removes both the Dexie record and the physical file (via `file:delete` IPC channel to the main process).

### Validation Rules

- `id` must be a valid UUID v4 string
- `name` must not be empty
- `origin_name` must not be empty
- `size` must be a non-negative integer
- `ext` must start with a dot (`.`) or be an empty string for extensionless files
- `type` must be a valid `FileType` enum value
- `created_at` must be a valid ISO 8601 timestamp
- `count` must be a non-negative integer

---

## Entity: Shortcut

**Storage**: Zustand store with `persist` middleware (renderer process, persisted to localStorage)
**Source Reference**: `src/renderer/src/stores/shortcuts.store.ts`, `packages/shared/types/shortcut.ts`
**Referenced By**: None (consumed only within F001)

### Purpose

Represents a keyboard shortcut binding. Each shortcut maps a logical action key to a physical key combination. Users can customize editable shortcuts. The Zustand store in the renderer manages the UI state, while the main process registers/deregisters global shortcuts via `globalShortcut` API based on IPC updates.

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `key` | `string` | PK, NOT NULL | -- | Logical action identifier (e.g., `showApp`, `quickSearch`, `captureScreen`) |
| `shortcut` | `string` | NOT NULL | -- | Key combination string in Electron accelerator format (e.g., `CommandOrControl+Shift+Space`) |
| `editable` | `boolean` | NOT NULL | `true` | Whether the user can customize this shortcut |
| `enabled` | `boolean` | NOT NULL | `true` | Whether this shortcut is currently active |

### Storage Format

Shortcuts are stored as an array in the Zustand store with localStorage persistence:

```typescript
interface ShortcutState {
  shortcuts: Shortcut[]
  updateShortcut: (key: string, shortcut: Partial<Shortcut>) => void
  getShortcut: (key: string) => Shortcut | undefined
}
```

### Default Shortcuts

| Key | Default Shortcut | Editable | Description |
|-----|-----------------|----------|-------------|
| `showApp` | `CommandOrControl+Shift+M` | Yes | Show/focus the main window |
| `quickSearch` | `CommandOrControl+Shift+Space` | Yes | Open quick search |
| `captureScreen` | `CommandOrControl+Shift+S` | Yes | Capture screen area |

### Lifecycle

1. **Initialization**: On app launch, the renderer loads shortcuts from the persisted Zustand store (localStorage). Default shortcuts are used if no persisted state exists.
2. **Registration**: The renderer sends the current shortcut list to the main process via `shortcuts:update` IPC. The main process registers each enabled shortcut with Electron's `globalShortcut` API.
3. **Modification**: When a user edits a shortcut, the Zustand store updates, persists to localStorage, and sends the updated list via `shortcuts:update` to the main process for re-registration.
4. **Deregistration**: On app quit, the main process calls `globalShortcut.unregisterAll()`.

### Validation Rules

- `key` must be a non-empty string matching a known action identifier
- `shortcut` must be a valid Electron accelerator string
- A key combination must not be assigned to more than one action (uniqueness constraint on `shortcut` when `enabled: true`)

---

## Entities NOT Owned by F001

The following entities are initialized or referenced by F001 infrastructure but are owned by other features:

| Entity | Owner | F001 Relationship |
|--------|-------|-------------------|
| Settings (KV) | F002-settings-theme | F001 provides the Dexie infrastructure; F002 defines the schema |
| Provider | F003-provider-management | No direct relationship from F001 |
| Model | F003-provider-management | No direct relationship from F001 |
| Agent (Drizzle) | F012-api-server-agents | F001 initializes better-sqlite3 + Drizzle; F012 defines tables |
| Session (Drizzle) | F012-api-server-agents | F001 initializes better-sqlite3 + Drizzle; F012 defines tables |
| SessionMessage (Drizzle) | F012-api-server-agents | F001 initializes better-sqlite3 + Drizzle; F012 defines tables |

---

## Cross-Feature Entity Dependencies

| Consuming Feature | Entity Used | Access Pattern | Fields Accessed |
|-------------------|-------------|----------------|-----------------|
| F004-chat-conversation | FileMetadata | Read by ID, increment/decrement count | id, name, origin_name, path, size, ext, type |
| F006-knowledge-base | FileMetadata | Read by ID, filter by type, increment/decrement count | id, name, origin_name, path, size, ext, type, tokens |
| F010-image-generation | FileMetadata | Create new records for generated images | All fields (write) |
