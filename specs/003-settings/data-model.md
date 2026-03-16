# Data Model: Settings

## UserSettings (extends AppConfig)

Settings values stored as typed keys in F001's AppConfig (electron-store). F003 defines additional config keys beyond F001's base set.

### Additional Config Keys (owned by F003)

| Key | Value Type | Default | Description |
|-----|-----------|---------|-------------|
| fontSize | number | 14 | UI font size in pixels (min: 12, max: 24) |
| sendKey | 'enter' \| 'ctrl+enter' | 'enter' | Default message send key |
| messageStyle | 'bubble' \| 'plain' | 'bubble' | Chat message display style |
| avatarStyle | 'default' \| 'identicon' \| 'initials' | 'default' | Avatar display style |
| codeBlockTheme | string | 'github-dark' | Code syntax highlight theme |
| customCSS | string | '' | User-injected custom CSS |
| launchAtLogin | boolean | false | Start app on OS login |
| startMinimized | boolean | false | Start minimized to tray |
| quickPhrases | string | '[]' | JSON-serialized QuickPhrase[] |
| shortcuts | string | '[]' | JSON-serialized Shortcut[] |
| backupMaxRetained | number | 5 | Maximum number of retained backups |

### Validation Rules

- `fontSize` MUST be >= 12 and <= 24
- `sendKey` MUST be one of: 'enter', 'ctrl+enter'
- `messageStyle` MUST be one of: 'bubble', 'plain'
- `avatarStyle` MUST be one of: 'default', 'identicon', 'initials'
- `customCSS` MUST NOT contain `@import` directives (security)
- `quickPhrases` MUST be valid JSON deserializing to QuickPhrase[]
- `shortcuts` MUST be valid JSON deserializing to Shortcut[]
- `backupMaxRetained` MUST be >= 1

### Combined Config Keys (full AppConfig)

F001-owned keys: theme, language, proxyUrl, autoUpdate, updateInterval, globalShortcut, schemaVersion, navbarPosition, openTabs, activeTabId

F003-owned keys: fontSize, sendKey, messageStyle, avatarStyle, codeBlockTheme, customCSS, launchAtLogin, startMinimized, quickPhrases, shortcuts, backupMaxRetained

All keys validated by Zod schema in `@angdu/shared`.

---

## QuickPhrase

Predefined text snippet for quick insertion into chat input. Stored as JSON array in config key `quickPhrases`.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | uuid | Unique phrase identifier |
| title | string | Yes | — | Display title (non-empty) |
| content | string | Yes | — | Phrase content to insert (non-empty) |
| createdAt | number | Yes | Date.now() | Creation timestamp (epoch ms) |
| updatedAt | number | Yes | Date.now() | Update timestamp (epoch ms) |
| order | number | No | 0 | Sort order (>= 0) |

### Validation Rules

- `id` MUST be unique across all quick phrases
- `title` MUST be non-empty string
- `content` MUST be non-empty string
- `order` MUST be >= 0 when specified

### Relationships

- Referenced by Assistant entity (F005) via `regularPhrases` field
- Managed globally via F003 settings UI, consumed by F005 chat input

---

## Shortcut

Configurable keyboard shortcut binding. Stored as JSON array in config key `shortcuts`.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| key | string | Yes | — | Action identifier (e.g., 'newChat', 'toggleSidebar') |
| shortcut | string[] | Yes | — | Key combination (e.g., ['CommandOrControl', 'N']) |
| editable | boolean | Yes | — | Whether user can modify this binding |
| enabled | boolean | Yes | true | Whether shortcut is currently active |
| system | boolean | Yes | — | Whether this is a global (OS-level) shortcut |

### Validation Rules

- `key` MUST be unique across all shortcuts
- `shortcut` array MUST contain valid Electron accelerator key identifiers
- If `system` is true, the shortcut is registered via Electron's globalShortcut API
- If `editable` is false, the shortcut cannot be modified by the user

### Relationships

- Managed by ShortcutService in main process (F001 extends with registration)
- Configured via F003 settings UI

---

## ExportManifest

Metadata included in the exported ZIP archive. Not persisted — generated at export time.

| Field | Type | Description |
|-------|------|-------------|
| version | string | App version at export time |
| schemaVersion | number | Config schema version |
| exportedAt | string (ISO 8601) | Export timestamp |
| platform | string | OS platform |
| features | string[] | Feature IDs with data included |

### Validation Rules (on import)

- `schemaVersion` MUST be <= current app's schemaVersion (forward-compatible only)
- If `schemaVersion` < current, run migrations before applying

---

## Relationships

```
AppConfig (F001) 1:N UserSettings keys (F003 extends the key set)
QuickPhrase[] serialized in AppConfig.quickPhrases
Shortcut[] serialized in AppConfig.shortcuts
QuickPhrase → referenced by Assistant.regularPhrases (F005)
Shortcut → registered by ShortcutService in main process (F001)
```
