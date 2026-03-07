# Data Model: Core Platform

**Feature**: F001-core-platform
**Date**: 2026-03-04

---

## Entities

### FileMetadata

Represents metadata for a file stored in the application data directory.

**Storage**: Dexie IndexedDB (`files` table)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PK, UUID, auto-generated | Unique file identifier |
| `name` | string | required | Display name of the file |
| `origin_name` | string | required | Original filename at upload time |
| `path` | string | required | Storage path relative to app data directory |
| `size` | number | required, >= 0 | File size in bytes |
| `ext` | string | required | File extension (e.g., `.pdf`, `.png`) |
| `type` | FileType | required, enum | File type classification |
| `created_at` | number | required | Creation timestamp (Unix ms) |
| `count` | number | optional, >= 0 | Word/character count (for text files) |
| `tokens` | number | optional, >= 0 | Estimated token count |
| `purpose` | string | optional | Usage context label |

**Indexes**: `id` (PK), `name`, `type`, `created_at`

**Validation**:
- `id`: UUID v4 format, auto-generated on creation
- `size >= 0`
- `type` must be a valid `FileType` enum value; defaults to `other` if unrecognized
- `ext` stored with leading dot (e.g., `.pdf`)

### FileType (Enum)

Classification categories for stored files.

| Value | Description |
|-------|-------------|
| `image` | PNG, JPG, GIF, SVG, WebP, etc. |
| `video` | MP4, WebM, etc. |
| `audio` | MP3, WAV, OGG, etc. |
| `document` | PDF, DOC, DOCX, PPT, XLS, etc. |
| `text` | TXT, MD, CSV, etc. |
| `code` | JS, TS, PY, etc. |
| `archive` | ZIP, TAR, GZ, 7Z, etc. |
| `other` | All other file types |

### ConfigKeys (Enum)

Typed keys for the configuration persistence system. Each key maps to a value stored in `electron-store`.

| Key | Value Type | Default | Description |
|-----|-----------|---------|-------------|
| `Language` | string | `'en-US'` | Application locale |
| `Theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme mode |
| `ZoomFactor` | number | `1.0` | Window zoom level |
| `LaunchToTray` | boolean | `false` | Start minimized to tray |
| `Tray` | boolean | `true` | Show tray icon |
| `TrayOnClose` | boolean | `false` | Minimize to tray on close |
| `Shortcuts` | Shortcut[] | `[]` | Registered keyboard shortcuts |
| `EnableQuickAssistant` | boolean | `true` | Enable mini window |
| `ClickTrayToShowQuickAssistant` | boolean | `false` | Tray click opens mini window |
| `DisableHardwareAcceleration` | boolean | `false` | Disable GPU acceleration |
| `UseSystemTitleBar` | boolean | `false` | Use system title bar (Linux) |
| `Proxy` | ProxyConfig | `{ mode: 'system' }` | Proxy settings |
| `EnableDeveloperMode` | boolean | `false` | Enable dev tools |
| `ClientId` | string | UUID | Unique client identifier |

### ProxyConfig (Value Object)

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `'system' \| 'fixed_servers' \| 'direct'` | Proxy mode |
| `url` | string (optional) | Proxy server URL (for fixed_servers mode) |
| `bypass` | string (optional) | Bypass rules (comma-separated patterns) |

### Shortcut (Referenced, owned by F008)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `key` | string | PK | Action identifier (e.g., `'showMainWindow'`) |
| `shortcut` | string[] | required | Key combinations (e.g., `['CommandOrControl+Shift+A']`) |
| `enabled` | boolean | required | Whether the shortcut is active |

---

## Dexie Schema (v1)

```
files: id, name, type, created_at
```

Future versions will add tables for other Features:
- v2 (F005): `topics: &id` and `message_blocks: id, messageId`
- v3 (F004): `knowledge_notes: &id, baseId, type`

---

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| FileMetadata | KnowledgeItem (F004) | 1:N | Knowledge items reference files by `uniqueId` |
| FileMetadata | Message (F005) | M:N | Messages contain file attachments via `files[]` |
| ConfigKeys.Shortcuts | Shortcut (F008) | 1:N | Config stores the shortcut definitions |
