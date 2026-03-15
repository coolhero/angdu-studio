# Research: Navigation

**Feature**: 002-navigation | **Date**: 2026-03-16

## R-001: Hash Router for Electron

**Decision**: react-router-dom v7 with `createHashRouter`
**Rationale**: Electron loads content via `file://` protocol. BrowserRouter requires a server to handle URL rewrites. HashRouter uses `#/path` fragments that work client-side without server support. react-router-dom v7 is the latest stable version available in the project's node_modules (already installed via F001).
**Alternatives considered**:
- BrowserRouter: Requires custom protocol handler or static file server — unnecessary complexity
- TanStack Router: More powerful but adds a new dependency and learning curve for simple tab-based routing
- Manual hash routing: Lower-level but reinvents what react-router provides

## R-002: Tab State Management with Zustand

**Decision**: Zustand store (`useTabsStore`) with `persist` middleware using F001's ConfigService IPC
**Rationale**: Constitution mandates Zustand (replaces Redux). Persist middleware provides built-in serialization. Custom storage adapter wraps `window.api.config.get/set` IPC calls for cross-process persistence. Tab state is small (< 1KB) so config store is appropriate.
**Alternatives considered**:
- localStorage: Works but doesn't survive renderer crashes (main process has no access)
- IndexedDB (Dexie): Overkill for a few tab entries
- In-memory only: Loses tabs on restart (violates FR-007)

## R-003: Tab Drag-and-Drop Library

**Decision**: @dnd-kit/core + @dnd-kit/sortable
**Rationale**: dnd-kit is the modern React DnD library with excellent sortable support, keyboard accessibility, and small bundle size (~15KB). Works well with Zustand (no Redux dependency). Supports horizontal sortable lists which is exactly the tab bar use case.
**Alternatives considered**:
- react-beautiful-dnd: Deprecated, no longer maintained
- react-dnd: More complex API, HTML5 backend has Electron quirks
- Native HTML drag-and-drop: Poor cross-platform behavior in Electron, no animation

## R-004: Sidebar Component Strategy

**Decision**: Custom sidebar with shadcn/ui Tooltip + lucide-react icons
**Rationale**: The sidebar is a simple icon list with tooltips and active indicator — no need for a complex navigation component. shadcn/ui NavigationMenu is designed for dropdown nav, which doesn't match our icon-only vertical sidebar pattern. Custom Tailwind + lucide-react is simpler and matches the design.
**Alternatives considered**:
- shadcn/ui NavigationMenu: Designed for horizontal dropdown navigation, not vertical icon sidebar
- Radix Navigation: Same as above
- Full sidebar component library: Overkill for icon-only navigation

## R-005: Tab Context Menu

**Decision**: shadcn/ui ContextMenu (Radix-based)
**Rationale**: Radix ContextMenu provides accessible right-click menus with keyboard support. Already part of shadcn/ui, consistent with project component strategy.
**Alternatives considered**:
- Custom right-click handler + Popover: More work, less accessible
- electron-context-menu: Works but creates native menus that look inconsistent with React UI

## R-006: Window Drag Region Strategy

**Decision**: CSS `-webkit-app-region: drag` on navbar container, `no-drag` on interactive children
**Rationale**: This is the standard Electron approach for frameless window dragging. The navbar acts as the drag region with interactive elements (tabs, buttons) explicitly marked as `no-drag`. F001 already established this pattern in the TitleBar component.
**Alternatives considered**:
- Custom mouse event handling: Fragile across platforms, doesn't integrate with OS window management
- Separate drag handle component: Adds visual clutter to the navbar
