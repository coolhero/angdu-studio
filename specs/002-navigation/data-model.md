# Data Model: Navigation

## Tab

Represents an open tab in the navigation bar. Managed by the `useTabsStore` Zustand store in the renderer process. Persisted to F001's AppConfig via IPC.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | derived from route | Unique tab identifier (e.g., "home", "settings") |
| route | string | Yes | — | Hash route path (e.g., "/", "/settings") |
| title | string | Yes | — | Display title shown on tab |
| icon | string | No | null | Lucide icon name (e.g., "Home", "Settings") |
| closable | boolean | Yes | true | Whether the tab can be closed (false for Home) |
| order | number | Yes | — | Sort position in the tab bar |

### Validation Rules

- `id` MUST be unique across all open tabs
- `route` MUST be a valid hash route path starting with "/"
- `title` MUST be non-empty
- `closable` MUST be `false` for the Home tab (id="home")
- `order` MUST be >= 0; Home tab always has `order` = 0
- `order` values MUST be unique (no two tabs share the same position)

### State Transitions

```
[not open] → addTab(route, title, icon) → [open, order = last+1]
[open] → removeTab(id) → [not open, adjacent tab activated]
[open] → reorderTab(id, newOrder) → [open, order updated]
[open, not active] → setActiveTab(id) → [open, active]
[open] → app quit → [persisted to config]
[persisted] → app launch → [restored from config]
```

---

## NavbarConfig

Navigation layout configuration. Stored as typed config keys in F001's AppConfig store.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| navbarPosition | "top" \| "left" | Yes | "top" | Navigation mode |

### Persistence

NavbarConfig is NOT a separate entity — it is stored as a typed config key in F001's AppConfig:

| Config Key | Value Type | Default | Description |
|-----------|-----------|---------|-------------|
| navbarPosition | "top" \| "left" | "top" | Navigation layout mode |
| openTabs | Tab[] (JSON) | [homeTab] | Serialized open tabs array |
| activeTabId | string | "home" | Currently active tab ID |

### Validation Rules

- `navbarPosition` MUST be one of: "top", "left"
- `openTabs` MUST always contain at least the Home tab
- `activeTabId` MUST reference an ID that exists in `openTabs`

---

## Relationships

```
Tab[] managed by useTabsStore (Zustand, renderer)
Tab[] persisted as "openTabs" config key in AppConfig (F001, main process)
NavbarConfig persisted as "navbarPosition" config key in AppConfig (F001, main process)
Tab.route references a hash route defined in the Router
```
