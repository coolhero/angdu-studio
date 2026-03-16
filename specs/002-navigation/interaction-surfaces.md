# F002 Navigation — Interaction Surfaces

> Guard 6b artifact. All user-facing interaction points in the navigation system.

| # | Surface | Component | Type | Verified |
|---|---------|-----------|------|----------|
| 1 | Sidebar nav icon click | SidebarItem | click → navigate | ✅ Code review |
| 2 | Sidebar nav icon tooltip | SidebarItem | hover → native title | ✅ Code review |
| 3 | Tab click (activate) | TabItem | click → setActiveTab + navigate | ✅ Code review |
| 4 | Tab middle-click (close) | TabItem | auxClick(button=1) → close | ✅ Code review |
| 5 | Tab close X button | TabItem | click → removeTab | ✅ Code review |
| 6 | Tab right-click context menu | TabItem → TabContextMenu | contextMenu → overlay | ✅ Code review |
| 7 | Context menu: Close | TabContextMenu | click → removeTab | ✅ Code review |
| 8 | Context menu: Close Others | TabContextMenu | click → closeOthers | ✅ Code review |
| 9 | Context menu: Close All | TabContextMenu | click → closeAll | ✅ Code review |
| 10 | Context menu dismiss | TabContextMenu | mousedown outside → close | ✅ Code review |
| 11 | Tab drag reorder | SortableTab (DndContext) | drag → reorderTabs | ✅ Code review |
| 12 | Settings gear icon | Navbar | click → addTab('/settings') + navigate | ✅ Code review |
| 13 | Window minimize (Win/Linux) | Navbar | click → window:minimize IPC | ✅ Code review |
| 14 | Window maximize (Win/Linux) | Navbar | click → window:maximize IPC | ✅ Code review |
| 15 | Window close (Win/Linux) | Navbar | click → window:close IPC | ✅ Code review |
| 16 | Title bar drag (window move) | Navbar / AppLayout | drag area → WebkitAppRegion | ✅ Code review |
| 17 | macOS traffic light spacer | Navbar / Sidebar | layout → 80px / 32px spacer | ✅ Code review |

## Controls in Source but Not in Target

| Source Control | Reason |
|----------------|--------|
| Avatar click → UserPopup | Out of scope (no user profile in F002) |
| Theme toggle (sidebar/tabbar) | Moved to F003 Settings |
| Add tab (+) button → Launchpad | removed (tabs auto-created on navigate) |
| Opened minapp tabs | deferred (MinApp feature) |
| Pinned app icons + drag | deferred (MinApp feature) |
| Update app button | deferred (F001 UpdateService handles via tray/dialog) |
| Tab icon display | Not implemented (title-only tabs) |
| lastSettingsPath memory | Not implemented (always opens /settings → /settings/provider) |

## Controls in Target but Not in Source

| Target Control | Notes |
|----------------|-------|
| Tab right-click context menu (Close/Close Others/Close All) | Enhancement over source (source only has middle-click close) |
