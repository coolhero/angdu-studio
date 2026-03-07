# Data Model: Platform Infrastructure

**Feature**: F001-platform | **Date**: 2026-03-02

This document defines the data entities used by the Platform Infrastructure feature. Entities are stored either in Dexie (IndexedDB) in the renderer process or in the Redux store with selective persistence via redux-persist.

## Entity: FileMetadata

Represents a managed file in the application data directory. Files are uploaded via the file picker, copied to the sandboxed data directory, and tracked with this metadata record.

**Storage**: Dexie (IndexedDB) in renderer process
**Table name**: `files`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, auto-generated UUID | Unique file identifier |
| name | string | required | Original file name (e.g., "document.pdf") |
| path | string | required | Storage path relative to app data directory |
| size | number | required | File size in bytes |
| ext | string | required | File extension including dot (e.g., ".pdf", ".png") |
| type | string | required | MIME type (e.g., "application/pdf", "image/png") |
| count | number | optional, default 0 | Reference count tracking how many entities reference this file |
| created_at | number | required | Creation timestamp (Unix milliseconds) |

**Indexes**: `id` (primary key)

**Usage**:
- Created when a file is uploaded via `file:upload` IPC channel
- Referenced by chat attachments, knowledge documents, and user avatars
- `count` is incremented/decremented when entities add/remove references
- Deleted via `file:delete` IPC channel when `count` reaches 0 or user explicitly deletes

**Example**:
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "report.pdf",
  "path": "files/f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf",
  "size": 1048576,
  "ext": ".pdf",
  "type": "application/pdf",
  "count": 1,
  "created_at": 1709337600000
}
```

## Entity: Shortcut

Represents a user-configurable keyboard shortcut binding. Each shortcut maps an action identifier to one or more key combinations.

**Storage**: Redux store (persisted via redux-persist in `shortcuts` slice)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| key | string | PK | Shortcut action identifier (e.g., "show-hide-app", "new-chat") |
| shortcut | string[] | required | Key combination(s) using Electron accelerator format (e.g., ["CmdOrCtrl+Shift+Space"]) |
| enabled | boolean | required, default true | Whether this shortcut is currently active |

**State Transitions**: Toggle enabled/disabled via Settings > Shortcuts UI. Key combinations are updated by recording new key presses.

**Usage**:
- Loaded on app startup to register global shortcuts via `globalShortcut.register()`
- Modified in Settings > Shortcuts page
- Persisted across restarts via redux-persist
- Unregistered and re-registered when bindings change

**Example**:
```json
{
  "key": "show-hide-app",
  "shortcut": ["CmdOrCtrl+Shift+Space"],
  "enabled": true
}
```

## Entity: User

Represents the local user profile. Used for display purposes and optional personalization.

**Storage**: Redux store (persisted via redux-persist in `settings` slice)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK | User identifier (auto-generated on first launch) |
| name | string | required | Display name shown in the UI |
| avatar | string | optional | Avatar image path (references a FileMetadata id, or empty for default avatar) |

**Usage**:
- Created with default values on first app launch
- Editable in Settings > General page
- Avatar references a FileMetadata entry when set

**Example**:
```json
{
  "id": "usr_a1b2c3d4",
  "name": "User",
  "avatar": ""
}
```

## Entity: AppInfo

Represents application runtime information. This is a read-only entity populated at app launch from Electron APIs. It is not persisted to disk.

**Storage**: Runtime state (Redux `runtime` slice, not persisted)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| version | string | required | App version from package.json (e.g., "1.0.0") |
| isPackaged | boolean | required | Whether running as a packaged build (false in dev mode) |
| appPath | string | required | App installation path (from `app.getAppPath()`) |
| appDataPath | string | required | User data directory path (from `app.getPath('userData')`) |
| platform | string | required | OS platform identifier: "win32", "darwin", or "linux" |
| arch | string | required | CPU architecture: "x64" or "arm64" |

**Note**: AppInfo is computed at runtime from Electron APIs (`app.getVersion()`, `app.isPackaged`, `app.getAppPath()`, `app.getPath()`, `process.platform`, `process.arch`). It is sent to the renderer via the `app:getInfo` IPC channel and stored in the non-persisted `runtime` Redux slice.

**Example**:
```json
{
  "version": "1.0.0",
  "isPackaged": false,
  "appPath": "/Users/user/cherry-studio",
  "appDataPath": "/Users/user/Library/Application Support/cherry-studio",
  "platform": "darwin",
  "arch": "arm64"
}
```

## Entity Relationships

```text
User.avatar ──references──> FileMetadata.id
    (optional: user avatar is a managed file)

FileMetadata.count
    (tracks how many other entities reference this file;
     includes chat attachments, knowledge documents, user avatar)
```

## Storage Summary

| Entity | Storage Layer | Persisted | Location |
|--------|--------------|-----------|----------|
| FileMetadata | Dexie (IndexedDB) | Yes | Renderer process, `files` table |
| Shortcut | Redux (redux-persist) | Yes | Renderer process, `shortcuts` slice |
| User | Redux (redux-persist) | Yes | Renderer process, `settings` slice |
| AppInfo | Redux (runtime) | No | Renderer process, `runtime` slice |
