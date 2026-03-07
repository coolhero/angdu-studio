# Data Model: App Core

**Feature Branch**: `001-app-core`
**Date**: 2026-03-07

## Entities

### Shortcut

Represents a registered global keyboard shortcut.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| key | string | Yes | — | Unique action identifier (PK) |
| shortcut | string[] | Yes | — | Key combination(s), e.g. `["CommandOrControl+Shift+A"]` |
| enabled | boolean | Yes | true | Whether the shortcut is currently active |

**Validation**:
- `key` MUST be a non-empty string
- `shortcut` MUST contain at least one valid Electron accelerator string
- `enabled` MUST be a boolean

**Storage**: Persisted in ConfigStore under the `shortcuts` key.

---

### WindowState

Persisted window geometry restored on launch.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| x | number | No | centered | Window X position |
| y | number | No | centered | Window Y position |
| width | number | Yes | 1200 | Window width in pixels |
| height | number | Yes | 800 | Window height in pixels |
| isMaximized | boolean | Yes | false | Whether window was maximized |

**Validation**:
- `width` MUST be >= 400 and <= screen width
- `height` MUST be >= 300 and <= screen height
- `x` and `y` MUST place the window within visible screen bounds (at least 100px visible)

**Storage**: Persisted in ConfigStore under the `windowState` key.

---

### ConfigStore (Conceptual)

Key-value persistence layer. Not a traditional entity — it's the storage mechanism itself.

| Aspect | Detail |
|--------|--------|
| Backend | electron-store (JSON file on disk) |
| Location | `app.getPath('userData')/config.json` (standard) or `./config.json` (portable mode) |
| Schema | Validated via Zod on read |
| Observer | `subscribe(key, callback)` pattern for reactive updates |
| Fallback | Corrupted file → reset to defaults, log warning |

**Key config keys used by F001**:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Active theme |
| `language` | string | system locale | App language |
| `launchOnBoot` | boolean | false | Auto-start on login |
| `proxyMode` | `'system' \| 'fixed' \| 'direct'` | `'system'` | Proxy mode |
| `proxyUrl` | string | `''` | Proxy URL (HTTP/SOCKS) |
| `shortcuts` | Shortcut[] | default shortcuts | Registered shortcuts |
| `windowState` | WindowState | default geometry | Last window state |
| `dataPath` | string | `''` | Custom data directory (empty = default) |
| `logLevel` | string | `'info'` | Main process log level |
| `logShowModules` | string | `''` | Comma-separated module filter |

---

### AppTheme

Runtime theme state synchronized across windows.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mode | `'light' \| 'dark' \| 'system'` | Yes | User-selected theme mode |
| resolved | `'light' \| 'dark'` | Yes | Actual resolved theme (system → light or dark) |

**Storage**: Zustand `useThemeStore` with sync middleware. Config key `theme` persists the user selection.

---

## Relationships

```
ConfigStore
├── contains → Shortcut[] (shortcuts key)
├── contains → WindowState (windowState key)
├── contains → theme setting
└── observed by → all services and renderer stores

AppTheme
├── derived from → ConfigStore.theme + OS nativeTheme
└── synced via → Zustand broadcast middleware to all windows
```

## Zustand Store Definitions

### useThemeStore

| Field | Type | Description |
|-------|------|-------------|
| mode | `'light' \| 'dark' \| 'system'` | User-selected mode |
| resolved | `'light' \| 'dark'` | Actual applied theme |
| setTheme | `(mode) => void` | Sets theme, updates config, applies CSS class |

### useAppStore

| Field | Type | Description |
|-------|------|-------------|
| version | string | App version |
| platform | string | Current platform (darwin/win32/linux) |
| dataPath | string | Active data directory |
| isPortable | boolean | Whether running in portable mode |
