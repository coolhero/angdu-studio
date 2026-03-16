# Implementation Plan: Navigation

**Branch**: `002-navigation` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-navigation/spec.md`

## Summary

Implement tab-based hash routing, dual navigation modes (top tab bar + left icon sidebar), tab lifecycle management (open, close, reorder, persist), and a programmatic navigation API. This feature replaces the placeholder App.tsx from F001 with a full routing and navigation system using react-router-dom (HashRouter), Zustand for tab state, shadcn/ui + Tailwind for UI components, and @dnd-kit for tab reordering.

## Technical Context

**Language/Version**: TypeScript 5.8+ (strict mode)
**Primary Dependencies**: react-router-dom v7 (HashRouter), Zustand, @dnd-kit/core + @dnd-kit/sortable, shadcn/ui (ContextMenu, Tooltip, DropdownMenu), lucide-react
**Storage**: F001's AppConfig via IPC (config:get/set) for tab and navbar persistence
**Testing**: Vitest (unit), Playwright (E2E via `_electron.launch()`)
**Target Platform**: macOS, Windows, Linux (Electron desktop)
**Project Type**: desktop-app (Electron)
**Performance Goals**: Route transition < 100ms, tab operations < 16ms (one frame)
**Constraints**: Hash routing required (file:// protocol), frameless window drag region in navbar
**Scale/Scope**: 7+ routes, 2 navigation modes, ~15 new/modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. SSoT | ✅ Pass | Tab type in `@shared/types/navigation.ts`, route registry single source |
| II. Explicit Over Implicit | ✅ Pass | All routes statically defined, navigation actions are named functions |
| III. Fail Loudly, Recover Gracefully | ✅ Pass | Corrupted tab data → Home tab fallback + warning; unknown routes → redirect |
| IV. Composition Over Inheritance | ✅ Pass | Tab bar, sidebar, layout composed from shadcn/ui primitives |
| V. Test the Contract | ✅ Pass | Test navigation behavior (navigate → correct page), not DOM structure |
| VI. Progressive Enhancement | ✅ Pass | Layer 0: Routes + store. Layer 1: Tab bar UI. Layer 2: Sidebar + persistence. Layer 3: DnD + overflow |
| ARC-01 IPC Bridge | ✅ Pass | Tab persistence via typed IPC (config:get/set), no direct Node.js |
| F7-02 Memory Budget | ✅ Pass | Single window with tab-based navigation (no extra BrowserWindows) |
| F7-03 Native Feel | ✅ Pass | Platform-aware drag region, system keyboard shortcuts respected |

## Project Structure

### Documentation (this feature)

```text
specs/002-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── navigation-api.md  # Navigation service + store API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── renderer/
│   └── src/
│       ├── App.tsx                              # Updated: ErrorBoundary + AppLayout
│       ├── Router.tsx                           # NEW: HashRouter + lazy routes
│       ├── routes.tsx                           # NEW: Route registry (static)
│       ├── stores/
│       │   └── useTabsStore.ts                  # NEW: Zustand tab state + persist
│       ├── services/
│       │   └── NavigationService.ts             # NEW: Programmatic navigation API
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppLayout.tsx                # NEW: Sidebar + Content layout
│       │   └── navigation/
│       │       ├── TabBar.tsx                   # NEW: Top tab bar (tabs mode)
│       │       ├── TabItem.tsx                  # NEW: Individual tab (sortable)
│       │       ├── TabContextMenu.tsx           # NEW: Right-click menu
│       │       ├── Sidebar.tsx                  # NEW: Left icon sidebar
│       │       ├── SidebarItem.tsx              # NEW: Individual sidebar icon
│       │       ├── Navbar.tsx                   # NEW: Content-area navbar (drag + controls)
│       │       └── NavbarWrapper.tsx            # NEW: Mode switch (tabs vs sidebar)
│       └── pages/
│           ├── HomePage.tsx                     # NEW: Home page placeholder
│           ├── SettingsPage.tsx                 # NEW: Settings placeholder
│           ├── ChatPage.tsx                     # NEW: Chat placeholder
│           ├── TranslatePage.tsx                # NEW: Translate placeholder
│           ├── KnowledgePage.tsx                # NEW: Knowledge placeholder
│           ├── FilesPage.tsx                    # NEW: Files placeholder
│           └── NotesPage.tsx                    # NEW: Notes placeholder
└── shared/
    └── types/
        └── navigation.ts                       # NEW: Tab, RouteConfig types
```

**Structure Decision**: Follows F001's established structure. All navigation code is in the renderer (no main process changes needed). Shared types extend F001's `@shared/types/` pattern. Pages are placeholders that subsequent Features will replace.

## Architecture

### Component Hierarchy

```
App.tsx
└── ErrorBoundary
    └── HashRouter
        └── AppLayout
            ├── Sidebar (when navbarPosition="left")
            │   ├── SidebarItem × N (icon + tooltip)
            │   └── SidebarFooter (settings gear)
            └── ContentArea
                ├── Navbar (drag region + WindowControls)
                │   └── TabBar (when navbarPosition="top")
                │       ├── TabItem × N (sortable, closable)
                │       └── TabContextMenu (on right-click)
                └── <Routes> (lazy-loaded page components)
```

### Layout Strategy (matching Cherry Studio source)

The layout follows the original Cherry Studio structure verified at runtime:

1. **Root**: `flex-direction: row` — Sidebar (left) + Content column (right)
2. **Sidebar**: Full height (100vh), 48px width, `-webkit-app-region: drag` on empty space
3. **Content column**: `flex-direction: column` — Navbar (top) + Routes (fill)
4. **Navbar**: Inside content area (not full-width above sidebar), contains TabBar + WindowControls, `-webkit-app-region: drag` on empty space
5. **Content area**: `border-top-left-radius: 10px` for visual separation from sidebar

In "top" mode, the Sidebar renders navigation icons. In "left" mode (sidebar-only), tabs are hidden and the sidebar expands.

### Data Flow

```
User clicks sidebar icon / tab
  → NavigationService.navigate(route)
    → useTabsStore.addTab(route, title, icon) — if not exists
    → useTabsStore.setActiveTab(tabId)
    → react-router navigate(route)
  → Route component lazy-loads and renders
  → useTabsStore.persistTabs() — debounced save to config

App launch
  → useTabsStore.restoreTabs()
    → window.api.config.get("openTabs") + config.get("activeTabId")
    → Hydrate store
    → Navigate to activeTabId's route
```

### Persistence Strategy

Tab state is persisted to F001's AppConfig store via IPC:

| Config Key | Type | Persistence Trigger |
|-----------|------|-------------------|
| openTabs | Tab[] (JSON) | Debounced (500ms) after any tab mutation |
| activeTabId | string | Debounced with openTabs |
| navbarPosition | "top" \| "left" | Immediate on change |

Custom Zustand storage adapter:
```typescript
const configStorage: StateStorage = {
  getItem: (name) => window.api.config.get(name),
  setItem: (name, value) => window.api.config.set(name, value),
  removeItem: (name) => window.api.config.set(name, null),
}
```

## Implementation Phases

### Phase 1: Foundation (Routes + Types + Store)

- Define shared types (`Tab`, `RouteConfig`) in `@shared/types/navigation.ts`
- Create route registry (`routes.tsx`) with all known routes and metadata
- Create `useTabsStore` Zustand store with core actions (add, remove, setActive, reorder)
- Create `Router.tsx` with HashRouter, lazy-loaded route components, catch-all redirect
- Create placeholder page components (Home, Settings, Chat, etc.)

### Phase 2: Layout + Sidebar

- Create `AppLayout.tsx` with flex-row structure (Sidebar + Content)
- Create `Sidebar.tsx` with icon-based navigation from route registry
- Create `SidebarItem.tsx` with active indicator and tooltip
- Create `Navbar.tsx` inside content area with drag region + WindowControls
- Update `App.tsx` to use Router + AppLayout (replacing F001's placeholder)
- Ensure drag region works in both modes

### Phase 3: Tab Bar + Tab Lifecycle

- Create `TabBar.tsx` with horizontal tab list
- Create `TabItem.tsx` with close button, middle-click, truncation/tooltip
- Create `TabContextMenu.tsx` with Close/Close Others/Close All
- Wire tab click → navigate, tab close → removeTab + navigate adjacent
- Handle Home tab protection (non-closable, non-movable)

### Phase 4: Persistence + Navigation Service

- Implement Zustand persist middleware with ConfigService IPC storage adapter
- Create `NavigationService.ts` with navigate, openInNewTab, goBack API
- Implement tab restoration on app launch
- Handle corrupted/invalid persisted data (fallback to Home only)

### Phase 5: Tab Reordering + Overflow

- Add @dnd-kit/sortable to TabBar for drag-to-reorder
- Persist new tab order via store
- Implement tab overflow scrolling when tabs exceed navbar width
- Home tab stays first (non-draggable)

### Phase 6: Mode Switch + Polish

- Implement navbarPosition toggle (top ↔ left) reading from config
- Ensure seamless mode switch without page reload
- Style polish: transitions, hover states, active indicators
- Error boundary per route

## Interaction Chains

| FR | User Action | Handler | Store Mutation | DOM Effect | Visual Result | Verify Method |
|----|-------------|---------|---------------|------------|---------------|---------------|
| FR-003 | Click tab | TabItem.onClick | setActiveTab(id) | .tab-item.active class | Tab highlighted, page changes | verify-state .tab-item[data-active] class "active" |
| FR-004 | Click tab close X | TabItem.onClose | removeTab(id) | Tab element removed, adjacent tab activated | Tab disappears, adjacent page shown | verify-effect .tab-bar childCount "decreased" |
| FR-004 | Middle-click tab | TabItem.onAuxClick | removeTab(id) | Same as close | Same as close | verify-effect .tab-bar childCount "decreased" |
| FR-004 | Right-click tab → Close Others | ContextMenu.onCloseOthers | removeAllExcept(id) | All tabs except target+Home removed | Only 2 tabs remain | verify-effect .tab-bar childCount "2" |
| FR-008 | Change navbarPosition | Settings.onModeChange | config.set("navbarPosition", val) | TabBar shown/hidden, Sidebar style changes | Layout switches instantly | verify-state [data-navbar-position] attr value |
| FR-009 | Hover sidebar icon | SidebarItem.onHover | — | Tooltip element appears | Tooltip shows page name | verify-state .tooltip visible |
| FR-009 | Click sidebar icon | SidebarItem.onClick | setActiveTab + addTab | .sidebar-item.active class | Icon highlighted, page changes | verify-state .sidebar-item[data-active] class "active" |
| FR-011 | Drag tab to new position | TabBar.onDragEnd | reorderTabs(activeId, overId) | Tab elements reorder in DOM | Tabs in new order | verify-effect .tab-bar children order |
| FR-012 | Drag empty navbar area | — (CSS) | — | Window position changes | Window moves | verify-effect window position "changed" |

## Integration Contracts

| Direction | Target Feature | Interface | Provider Shape | Consumer Shape | Bridge |
|-----------|---------------|-----------|---------------|---------------|--------|
| Consumes ← | F001-app-shell | window.api.config.get/set | `{key: string, value: JSON}` | `{key: string, value: JSON}` | — (direct IPC) |
| Consumes ← | F001-app-shell | WindowControls component | React component | React component | — (import) |
| Provides → | F003-settings | navbarPosition config key | `"top" \| "left"` | — | — |
| Provides → | F005-chat | NavigationService.openInNewTab | `(path, title, icon?) → void` | — | — |
| Provides → | F001-app-shell (deep links) | NavigationService.navigate | `(path) → void` | — | — |

## Pattern Constraints

| Stack Pattern | Constraint | Rationale |
|---|---|---|
| **Zustand + React** (External store + reactive framework) | Tab selectors MUST be referentially stable. Use `useShallow()` for array/object selectors. Never `tabs.filter()` inside selector. | Unstable selectors cause infinite re-renders in useSyncExternalStore |
| **Imperative DOM** (drag region measurement) | Use `useLayoutEffect` for drag region calculations, NOT `useEffect` | Async effect causes one frame of wrong drag behavior |
| **React 19 concurrent** | TabBar rendering must be pure. No side effects during render (persist in useEffect, not inline) | Concurrent mode may invoke render multiple times |
| **Error Boundary** | Each lazy-loaded route page MUST be wrapped in an ErrorBoundary | Uncaught render errors in one page must not crash the entire app |
| **CSS -webkit-app-region** | Interactive elements (tabs, buttons, inputs) inside drag regions MUST have `-webkit-app-region: no-drag` | Otherwise clicks are swallowed by the window drag handler |

## Complexity Tracking

No constitution violations. All patterns follow established conventions from F001.

## Source → Target Component Mapping

| Source Component | Source File | Target Component | Target File | Notes |
|---|---|---|---|---|
| Router (conditional HashRouter) | `cherry-studio/.../Router.tsx` | AppRouter + AppLayout | `Router.tsx` + `layout/AppLayout.tsx` | Source: inline HashRouter with conditional wrapping. Target: createHashRouter + RouterProvider (v7 data router) |
| Sidebar | `cherry-studio/.../components/app/Sidebar.tsx` | Sidebar | `navigation/Sidebar.tsx` | Source: styled-components, dynamic icon list from settings, avatar, theme toggle, minapp sections. Target: Tailwind, static route registry, no avatar/theme/minapp |
| MainMenus (inner FC) | `cherry-studio/.../components/app/Sidebar.tsx` | SidebarItem | `navigation/SidebarItem.tsx` | Source: renders from sidebarIcons.visible[] with AntD Tooltip. Target: renders from ROUTES.filter(showInSidebar) with native title |
| TabsContainer | `cherry-studio/.../Tab/TabContainer.tsx` | Navbar + TabBar | `navigation/Navbar.tsx` + `TabBar.tsx` | Source: monolithic. Target: split into chrome + tabs |
| Tab (styled) | `cherry-studio/.../Tab/TabContainer.tsx` | TabItem | `navigation/TabItem.tsx` | Source: icon + title + close. Target: title + close only (no icon) |
| Navbar (per-page content) | `cherry-studio/.../components/app/Navbar.tsx` | Navbar (in left mode) | `navigation/Navbar.tsx` | Source: multi-slot per-page navbar (Left/Center/Right). Target: unified bar for both modes |
| PinnedMinapps | `cherry-studio/.../components/app/PinnedMinapps.tsx` | — | — | deferred (MinApp feature out of scope) |
| NavigationHandler | `cherry-studio/.../NavigationHandler.tsx` | NavigationService | `services/NavigationService.ts` | Source: React component. Target: singleton class |
| Redux tabs slice | `cherry-studio/.../store/tabs.ts` | useTabsStore (Zustand) | `stores/useTabsStore.ts` | Redux → Zustand. Target adds closeOthers, closeAll, restoreTabs |
| WindowControls | `cherry-studio/.../WindowControls.tsx` | Inline buttons in Navbar | `navigation/Navbar.tsx` | Source: separate component. Target: inline buttons for Win/Linux |
| HorizontalScrollContainer | `cherry-studio/.../HorizontalScrollContainer.tsx` | overflow-x-auto | `navigation/TabBar.tsx` | Source: custom scroll component. Target: CSS overflow |
| useSettings().sidebarIcons | `cherry-studio/.../hooks/useSettings.ts` | ROUTES constant | `routes.tsx` | Source: user-configurable icon order. Target: static route list |
| useNavbarPosition | `cherry-studio/.../hooks/useSettings.ts` | useNavbarPosition selector | `stores/useTabsStore.ts` | Redux → Zustand selector |
| AddTabButton (+ PlusOutlined) | `cherry-studio/.../Tab/TabContainer.tsx` | — | — | removed (no Launchpad page needed, tabs auto-created on navigate) |
| ThemeButton (tab bar) | `cherry-studio/.../Tab/TabContainer.tsx` | — | — | deferred (theme toggle in F003 Settings, not in nav chrome) |
| UpdateAppButton | `cherry-studio/.../Tab/TabContainer.tsx` | — | — | deferred (update notification is F001 scope via tray/dialog) |
