# Data Model: Core Platform

**Feature**: 001-core-platform
**Date**: 2026-03-04

---

## Entities

### FileMetadata

Represents any file managed by the application (uploads, attachments, knowledge docs, avatars).

**Storage**: Dexie IndexedDB (renderer process)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, uuid v4 | Unique file identifier |
| name | string | required | Display name of the file |
| origin_name | string | required | Original filename before processing |
| path | string | required | Storage path relative to app data directory |
| size | number | required, >= 0 | File size in bytes |
| ext | string | required | File extension including dot (e.g., `.pdf`) |
| type | FileType | required, enum | Category of file |
| created_at | number | required, auto | Unix epoch ms of creation |
| count | number | optional, >= 0 | Word/character count (text-based files) |
| tokens | number | optional, >= 0 | Estimated token count (for LLM context) |
| purpose | string | optional | Intended use: `knowledge`, `attachment`, `avatar`, etc. |

**Indexes**: `id` (PK), `type`, `purpose`, `created_at`

**Relationships**:
| Relationship | Target Entity | Cardinality | Owner Feature |
|-------------|---------------|-------------|---------------|
| referenced by | KnowledgeItem | N:1 | F004 |
| referenced by | MessageBlock (file/image) | N:1 | F005 |

---

### FileType (enum)

| Value | Description |
|-------|-------------|
| image | PNG, JPG, GIF, SVG, WebP, AVIF |
| video | MP4, WebM, MOV |
| audio | MP3, WAV, OGG |
| document | PDF, DOC, DOCX |
| text | TXT, MD, Markdown |
| code | Source code files |
| archive | ZIP, TAR, GZ |
| other | Unrecognized file types |

---

### Dexie Database Schema (Version 1)

```typescript
// Version 1 — F001 foundation tables only
const db = new Dexie('CherryStudio');

db.version(1).stores({
  files: 'id, type, purpose, created_at',
  settings: 'key',
});
```

**Notes**:
- `files` table stores FileMetadata records
- `settings` table provides key-value storage for renderer-side configuration cache
- Additional tables (topics, messages, message_blocks, providers, models, etc.) will be added by downstream features (F002-F005) via Dexie version bumps
- Transaction durability mode: `strict`

---

### ConfigKeys (typed configuration keys)

Configuration keys stored in electron-store (main process). Not a database entity — a typed enum defining all valid configuration keys.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| language | string | auto-detect | Display language locale code |
| theme | `'light' \| 'dark' \| 'system'` | `'system'` | Theme mode |
| zoomFactor | number | 1.0 | UI zoom level |
| launchToTray | boolean | false | Start minimized to tray |
| tray | boolean | true | Enable system tray icon |
| trayOnClose | boolean | false | Minimize to tray on window close |
| enableQuickAssistant | boolean | false | Enable mini window |
| clickTrayToShowQuickAssistant | boolean | false | Tray click shows mini window |
| disableHardwareAcceleration | boolean | false | Disable GPU acceleration |
| useSystemTitleBar | boolean | false | Use native title bar (Linux) |
| proxy | ProxyConfig \| null | null | Proxy configuration |
| shortcuts | Shortcut[] | [] | Registered keyboard shortcuts |
| enableDeveloperMode | boolean | false | Enable dev tools access |
| autoUpdate | boolean | true | Auto-check for updates |
| enableDataCollection | boolean | false | Opt-in analytics |
| spellCheckEnabled | boolean | false | Enable spell checking |
| spellCheckLanguages | string[] | [] | Spell check language codes |
| clientId | string | auto-generated | Unique installation identifier |

---

### ProxyConfig (value type)

| Field | Type | Description |
|-------|------|-------------|
| mode | `'system' \| 'fixed_servers' \| 'direct'` | Proxy mode |
| url | string \| undefined | Proxy URL (for fixed_servers mode) |
| bypassRules | string \| undefined | Comma-separated bypass patterns |

---

### Shortcut (shared with F008)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| key | string | PK | Action identifier (e.g., `show-main-window`) |
| shortcut | string[] | required | Key combination(s) (e.g., `['CommandOrControl+Shift+A']`) |
| enabled | boolean | required | Whether shortcut is active |

---

## State Machines

### ThemeMode

```
system ──┐
         ├──→ light
         ├──→ dark
light ───┤
         ├──→ system
         ├──→ dark
dark ────┤
         ├──→ system
         └──→ light
```

All transitions are user-initiated via settings. No automatic transitions except "system" mode following OS changes (which doesn't change the stored mode, only the rendered appearance).

---

## Migration Strategy

- **Dexie**: Version-based with `db.version(N).stores({...}).upgrade(fn)`. Each downstream feature bumps the version when adding tables.
- **electron-store**: No explicit versioning needed — new keys use defaults when absent. Invalid values fall back to defaults.
- **Zustand persist**: Version field in persist config. Migration functions transform old state shapes to current.
