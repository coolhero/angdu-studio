# Data Model: App Shell

## WindowState

Persisted window geometry and display state. Stored in the `window_state` table of the config SQLite database.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | 'main' | Window identifier (allows future multi-window) |
| x | number | No | centered | Window X position (pixels) |
| y | number | No | centered | Window Y position (pixels) |
| width | number | Yes | 960 | Window width (pixels) |
| height | number | Yes | 600 | Window height (pixels) |
| isMaximized | boolean | Yes | false | Whether window is maximized |
| displayId | string | No | null | Display identifier for multi-monitor restore |

### Validation Rules

- `width` MUST be >= 960 (MIN_WINDOW_WIDTH)
- `height` MUST be >= 600 (MIN_WINDOW_HEIGHT)
- `x` and `y` MUST be within bounds of an available display, or null for auto-center
- `id` MUST be unique

### State Transitions

```
[not persisted] → save on window move/resize/maximize → [persisted]
[persisted] → restore on app launch → [applied to BrowserWindow]
[persisted] → reset on offscreen detection → [default values]
```

---

## AppConfig

Application-wide configuration store. Stored in the `config` table as key-value pairs with JSON serialization.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| key | string | Yes | — | Configuration key (primary key) |
| value | string (JSON) | Yes | — | JSON-serialized configuration value |
| updatedAt | string (ISO 8601) | Yes | now | Last update timestamp |

### Typed Config Keys

| Key | Value Type | Default | Description |
|-----|-----------|---------|-------------|
| theme | 'light' \| 'dark' \| 'system' | 'light' | Theme preference |
| language | string | system locale | UI language code |
| proxyUrl | string \| null | null | HTTP/SOCKS proxy URL |
| autoUpdate | boolean | true | Auto-update enabled |
| updateInterval | number | 3600000 | Update check interval (ms) |
| globalShortcut | string \| null | null | Global show/hide shortcut key combo |
| schemaVersion | number | 1 | Config schema version for migration |

### Validation Rules

- `key` MUST be a known config key (typed enum)
- `value` MUST be valid JSON that deserializes to the expected type for the key
- `theme` MUST be one of: 'light', 'dark', 'system'
- `proxyUrl` if not null, MUST be a valid URL with http://, https://, socks4://, or socks5:// scheme
- `updateInterval` MUST be >= 60000 (1 minute minimum)
- `schemaVersion` MUST be a positive integer

### Migration Rules

- On app start, read `schemaVersion` from config
- If `schemaVersion` < current app schema version, run migrations sequentially
- Each migration transforms config keys/values from version N to N+1
- Migration failures reset config to defaults (log warning per FR-009)

---

## Relationships

```
AppConfig 1:1 WindowState (both in same SQLite database, separate tables)
WindowState belongs to a display (displayId references system display)
```
