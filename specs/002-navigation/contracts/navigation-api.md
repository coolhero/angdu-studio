# Navigation API Contract

F002 exposes a programmatic navigation API for other features to use. This is a renderer-side TypeScript API, not a REST endpoint.

## NavigationService

Singleton service providing programmatic navigation for use by other features (deep links, settings opening, chat tab creation).

### navigate(path: string): void

Navigate to a route. If a tab for this route exists, activate it. If not, create a new tab and navigate.

**Parameters**:
- `path` (string, required): Hash route path (e.g., "/settings", "/chat")

**Behavior**:
- If tab with matching route exists → activate that tab
- If no matching tab → create new tab with default title for route, then navigate

### openInNewTab(path: string, title: string, icon?: string): void

Open a route in a new tab with a custom title.

**Parameters**:
- `path` (string, required): Hash route path
- `title` (string, required): Tab display title
- `icon` (string, optional): Lucide icon name

**Behavior**:
- If tab with matching route exists → activate existing tab (no duplicate)
- If no matching tab → create tab with given title/icon, navigate to path

### goBack(): void

Navigate to the previously active tab.

**Behavior**:
- If history exists → activate previous tab
- If no history → activate Home tab

### getActiveRoute(): string

Returns the currently active route path.

---

## useTabsStore API

Zustand store exposing tab state and actions for direct access by components.

### State

| Property | Type | Description |
|----------|------|-------------|
| tabs | Tab[] | All open tabs, ordered |
| activeTabId | string | Currently active tab ID |

### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| addTab | (route, title, icon?) → void | Add tab if not duplicate, activate it |
| removeTab | (id) → void | Remove tab, activate adjacent |
| setActiveTab | (id) → void | Set active tab |
| reorderTabs | (activeId, overId) → void | Reorder via DnD |
| restoreTabs | () → void | Load persisted tabs from config |
| persistTabs | () → void | Save current tabs to config |

---

## Route Registry

Static registry of known routes and their metadata. Used for tab creation defaults and sidebar icon mapping.

| Route | Title | Icon | Closable | Sidebar |
|-------|-------|------|----------|---------|
| / | Home | Home | false | yes |
| /settings | Settings | Settings | true | yes |
| /chat | Chat | MessageSquare | true | yes |
| /translate | Translate | Languages | true | yes |
| /knowledge | Knowledge | BookOpen | true | yes |
| /files | Files | FolderOpen | true | yes |
| /notes | Notes | FileText | true | yes |

Routes for features not yet implemented will render placeholder pages.
