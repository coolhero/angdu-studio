# F002 - navigation: Pre-Context

## 1. Runtime Exploration Results

| Observation | Value | Relevance |
|---|---|---|
| navbarPosition | "top" (default) | Top navbar with tab mode is the default layout |
| Navbar height | 44px | Fixed height for top navigation bar |
| Hash routing | #/settings, #/translate, etc. | HashRouter for all page navigation |
| Assistants panel width | 210px | Left panel in home page (not the sidebar mode nav) |
| Window size | 960x600 | Layout must fit within this minimum |

**Screens owned**: Top navbar (tab bar), sidebar (left mode), all route targets (as layout wrappers).

## 2. Source Reference

| File Path | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/Router.tsx | Route definitions (HashRouter) | [TBD] |
| src/renderer/src/pages/home/Navbar.tsx | Top navbar with tabs | [TBD] |
| src/renderer/src/components/app/Sidebar.tsx | Left sidebar navigation (sidebar mode) | [TBD] |
| src/renderer/src/components/app/TabsContainer.tsx | Tab management UI | [TBD] |
| src/renderer/src/store/tabs.ts | Tab state (Redux slice) | [TBD] |
| src/renderer/src/services/TabsService.ts | Tab lifecycle service | [TBD] |
| src/renderer/src/services/NavigationService.ts | Navigation service | [TBD] |
| src/renderer/src/components/Layout/ | Layout wrapper components | [TBD] |

## 3. Source Behavior Inventory

| ID | File | Behavior | Priority |
|---|---|---|---|
| B041 | Router.tsx | Define hash routes for all pages (home, settings, translate, etc.) | P1 |
| B042 | Router.tsx | Lazy-load route components | P2 |
| B043 | Router.tsx | Redirect unknown routes to home | P1 |
| B044 | Navbar.tsx | Render top navbar with Home tab always present | P1 |
| B045 | Navbar.tsx | Render dynamic tabs for open pages | P1 |
| B046 | Navbar.tsx | Tab click → navigate to corresponding route | P1 |
| B047 | Navbar.tsx | Tab close button → close tab and navigate away | P1 |
| B048 | Navbar.tsx | Tab drag-to-reorder | P3 |
| B049 | Navbar.tsx | Window drag region in navbar (frameless window) | P1 |
| B050 | Sidebar.tsx | Render icon-based sidebar navigation (sidebar mode) | P2 |
| B051 | Sidebar.tsx | Active route indicator on sidebar icon | P2 |
| B052 | TabsContainer.tsx | Manage tab overflow (scroll or collapse) | P2 |
| B053 | tabs.ts | Add/remove/reorder tabs in state | P1 |
| B054 | tabs.ts | Persist open tabs across sessions | P2 |
| B055 | NavigationService.ts | Programmatic navigation (navigate, goBack) | P1 |

## 4. UI Component Features

| Source Component | Library | Usage | New Stack Equivalent |
|---|---|---|---|
| Tabs | AntD Tabs | Top tab bar | shadcn/ui Tabs or custom tab bar |
| Menu | AntD Menu | Sidebar navigation items | shadcn/ui NavigationMenu |
| Tooltip | AntD Tooltip | Sidebar icon tooltips | shadcn/ui Tooltip |
| Layout | AntD Layout (Sider, Content) | Page layout structure | Tailwind4 flex/grid layout |
| Dropdown | AntD Dropdown | Tab context menu (close, close others) | shadcn/ui DropdownMenu |

## 5. Interaction Behavior Inventory

| Interaction | Trigger | Behavior |
|---|---|---|
| Tab click | Click on tab | Navigate to tab's route |
| Tab close | Click X on tab | Remove tab, navigate to adjacent tab |
| Tab middle-click | Middle-click on tab | Close tab (shortcut) |
| Tab context menu | Right-click on tab | Show menu: Close, Close Others, Close All |
| Tab drag | Drag tab left/right | Reorder tabs |
| Sidebar icon click | Click sidebar icon (left mode) | Navigate to route |
| Sidebar icon hover | Hover sidebar icon | Show tooltip with page name |
| Navbar mode switch | Change navbarPosition in settings | Switch between top tab bar and left sidebar |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Router | HashRouter (react-router-dom) | Electron file:// protocol requires hash routing |
| State management | Zustand (new stack) | Replace Redux tabs slice with Zustand store |
| Layout modes | Top (tabs) + Left (sidebar) | Two navigation paradigms, user-configurable |
| Tab persistence | Persist to config | Restore user's open tabs on restart |

## 7. Foundation Dependencies

| Relationship | Item | Direction |
|---|---|---|
| **owns** | Route definitions | F002 defines all routes |
| **owns** | Tab state and lifecycle | F002 exclusive |
| **owns** | Navigation layout (navbar/sidebar) | F002 exclusive |
| **consumes** | IPC bridge | From F001 (window drag region, config) |
| **consumes** | Config API | From F001 (persist tab state, navbarPosition) |
| **extends** | App.tsx root | F002 provides Router inside F001's root component |

## 8. Naming Remapping

| Source Identifier | Target Identifier | Location |
|---|---|---|
| CherryStudio route names | AngduStudio route names | Router.tsx |
| No significant cherry-specific naming in navigation | — | — |

## 9. Static Resources

| Resource | Path | Usage |
|---|---|---|
| Sidebar icons | src/renderer/src/assets/icons/ | Navigation icons (home, settings, etc.) |
| Tab close icon | (inline SVG or icon library) | Close button on tabs |

## 10. Environment Variables

| Variable | Usage | Feature |
|---|---|---|
| None specific to navigation | — | — |

## 11. Feature Contracts

### Provides
- **Route Registry**: All available routes and their components → all features that add pages
- **Tab API**: openTab(route, title), closeTab(id), switchTab(id) → F003 (settings tabs), F005 (chat tabs)
- **Navigation API**: navigate(path), goBack() → all features
- **Layout Container**: Content area where routed pages render → all page features
- **navbarPosition**: Current layout mode (top/left) → all layout-aware components

### Requires
- **From F001**: IPC bridge for config persistence (tab state, navbar position)
- **From F001**: Window chrome integration (drag region in navbar)

## 12. For /speckit.specify

### Draft Functional Requirements
- FR-011: App must use HashRouter for all page navigation
- FR-012: Top navbar must show Home tab (always) plus dynamic tabs
- FR-013: Tabs must be closable (except Home), reorderable, and support context menu
- FR-014: Sidebar mode must show icon-based navigation with tooltips
- FR-015: Navigation mode (top/left) must be switchable via settings
- FR-016: Open tabs must persist across app restarts
- FR-017: Unknown routes must redirect to home

### Draft Success Criteria
- SC-005: Route transition < 100ms (no visible jank)
- SC-006: Tab open/close responds within 1 frame
- SC-007: Layout mode switch is instantaneous (no reload)

### Edge Cases
- All tabs closed → Home tab remains (cannot be closed)
- Tab opened for already-open route → switch to existing tab (no duplicate)
- Deep link arrives → open as new tab if not already open
- Sidebar mode with many items → scroll or overflow handling
- Tab title too long → truncate with ellipsis, full title in tooltip

## 13. For /speckit.plan

### Dependencies
- react-router-dom (HashRouter)
- Zustand (tab state store)

### Entity Drafts
- **Tab**: { id, route, title, icon?, closable, order }
- **NavbarConfig**: { position: "top" | "left", collapsible: boolean }

### API Drafts
- Store: `useTabsStore` — tabs[], activeTabId, addTab, removeTab, reorderTabs
- Service: `NavigationService.navigate(path)`, `.openInNewTab(path, title)`

### Tech Decisions
- Zustand store for tabs (replaces Redux slice)
- react-router-dom v6 with HashRouter
- Tailwind4 flex layout (replaces AntD Layout)

## 14. For /speckit.analyze

### Cross-Feature Verification Points
- F002↔F001: Hash routing must be configured in BrowserWindow webPreferences
- F002↔F001: Window drag region must coexist with tab click targets in navbar
- F002↔F003: Settings page must be openable as a tab; navbarPosition setting must trigger layout switch
- F002↔F005: Chat conversations should open as tabs; switching tabs must preserve chat scroll position
- F002↔F004: Provider settings may open as sub-tabs within settings
- Tab state persistence must survive app crash (write on change, not just on quit)
