# Data Model: 004-settings-data

## Entity: FileMetadata

**Storage**: Dexie (IndexedDB) — `files` table
**Owner**: F004 settings-data

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | nanoid() | Unique identifier |
| name | string | yes | — | Stored filename (sanitized) |
| origin_name | string | yes | — | Original display name |
| path | string | yes | — | Absolute filesystem path |
| size | number | yes | — | Size in bytes |
| ext | string | yes | — | Extension with dot (e.g., '.pdf') |
| type | FileType | yes | — | image \| video \| audio \| text \| document \| other |
| created_at | string | yes | ISO now | ISO 8601 datetime |
| count | number | yes | 0 | Reference count |
| tokens | number | no | — | Estimated token count |
| purpose | string | no | — | OpenAI file purpose |

### Relationships

- Referenced by `Message` (F003) via `blocks` containing `ImageMessageBlock` or `FileMessageBlock`
- Referenced by `KnowledgeItem` (F007) via `content` field

### Indexes

- Primary: `id`
- Index: `type` (for filtering by file type)
- Index: `created_at` (for chronological listing)

### Validation Rules

- `name` must not contain path separators or null bytes
- `ext` must start with `.` or be empty string
- `size` must be >= 0
- `type` must be one of the FileType enum values
- `count` must be >= 0

---

## Entity: SettingsState

**Storage**: Zustand store (`useSettingsStore`) persisted to electron-store
**Owner**: F004 settings-data

### General Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| language | string | 'ko' | App language (ko \| en) |
| sendMessageShortcut | SendMessageShortcut | 'Enter' | Enter \| Shift+Enter \| Ctrl+Enter \| Command+Enter \| Alt+Enter |
| launchOnBoot | boolean | false | Auto-start on system boot |
| launchToTray | boolean | false | Start minimized to tray |

### Proxy Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| proxyMode | ProxyMode | 'system' | system \| custom \| none |
| proxyUrl | string | '' | Custom proxy URL |

### Display Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| themeMode | ThemeMode | 'dark' | dark \| light \| auto |
| fontSize | number | 14 | Base font size (px) |
| fontFamily | string | 'system-ui' | Main font family |
| codeFontFamily | string | 'monospace' | Code font family |
| primaryColor | string | '#1890ff' | Theme primary color (hex) |
| showMessageDivider | boolean | true | Show divider between messages |
| topicPosition | TopicPosition | 'left' | Topic list position: left \| right |
| windowStyle | WindowStyle | 'default' | Window chrome style |
| sidebarIcons | SidebarIcon[] | DEFAULT_SIDEBAR_ICONS | Visible sidebar icons |

### Behavior Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| pasteAsFileThreshold | number | 500 | Char count threshold to paste as file |
| clickToShowTopic | boolean | false | Click to expand topic list |
| useTopicNamingForMessageTitle | boolean | true | Use LLM for topic naming |

### Provider-Specific Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| ollamaKeepAliveTime | string | '5m' | Ollama keep-alive duration |
| vertexaiServiceAccount | string | '' | VertexAI service account JSON |
| awsBedrockAuthType | string | 'keys' | keys \| profile |

### Validation Rules

- `language` must be 'ko' or 'en' (Constitution VIII)
- `fontSize` must be between 10 and 24
- `primaryColor` must be valid hex color (#RRGGBB or #RGB)
- `proxyUrl` must be valid URL when proxyMode is 'custom'

---

## Entity: BackupConfig

**Storage**: Zustand store (`useBackupStore`) persisted to electron-store
**Owner**: F004 settings-data

### WebDAV Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| webdavUrl | string | yes | WebDAV server URL |
| webdavUsername | string | yes | Authentication username |
| webdavPassword | string | yes | Authentication password |
| webdavPath | string | yes | Remote directory path |

### S3 Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| s3Bucket | string | yes | S3 bucket name |
| s3Region | string | yes | AWS region |
| s3AccessKeyId | string | yes | AWS access key ID |
| s3SecretAccessKey | string | yes | AWS secret access key |
| s3Endpoint | string | no | Custom endpoint URL (for S3-compatible services) |

### Backup State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| lastBackupTime | string \| null | null | ISO datetime of last backup |
| autoBackupEnabled | boolean | false | Enable auto backup |
| autoBackupInterval | number | 24 | Auto backup interval (hours) |

---

## Entity: MiniApp

**Storage**: Zustand store (`useMiniAppsStore`) persisted to electron-store
**Owner**: F004 settings-data

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | nanoid() | Unique identifier |
| name | string | yes | — | Display name |
| url | string | yes | — | Web app URL |
| icon | string | no | — | Icon URL or emoji |
| order | number | yes | — | Display order (lower = first) |

### Validation Rules

- `name` must be non-empty, max 100 characters
- `url` must be valid URL (http:// or https://)
- `order` values are recomputed on reorder (0, 1, 2, ...)

---

## Entity: Shortcut

**Storage**: Zustand store (`useShortcutsStore`) persisted to electron-store
**Owner**: F004 settings-data

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | — | Action identifier (e.g., 'newTopic', 'search') |
| name | string | yes | — | i18n key for display name |
| keys | string | yes | — | Key combination (e.g., 'Ctrl+N', 'Cmd+K') |
| action | string | yes | — | Action to trigger |

### Validation Rules

- `keys` must be a valid key combination string
- No two shortcuts may have the same `keys` value (conflict detection)

---

## Entity: QuickPhrase

**Storage**: Nested in `useSettingsStore` → `quickPhrases` array
**Owner**: F004 settings-data

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | nanoid() | Unique identifier |
| label | string | yes | — | Display label |
| text | string | yes | — | Phrase content to insert |

### Validation Rules

- `label` must be non-empty, max 50 characters
- `text` must be non-empty

---

## Entity: SidebarIcon

**Storage**: Nested in `useSettingsStore` → `sidebarIcons` array
**Owner**: F004 settings-data

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | — | Sidebar item identifier |
| icon | string | yes | — | Lucide icon name |
| visible | boolean | yes | true | Whether the icon is shown |
| order | number | yes | — | Display order |

---

## Dexie Schema Addition

Add `files` table to the existing F003 Dexie database:

```typescript
// Add to existing database schema (version N+1)
db.version(N+1).stores({
  // existing tables from F003...
  files: 'id, type, created_at'
})
```
