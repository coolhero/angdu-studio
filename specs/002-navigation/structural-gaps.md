# F002 Navigation — Structural Gaps (Guard 3, 7)

> Source app (Cherry Studio) vs Target app (Angdu Studio) structural comparison.
> Each gap is classified: CRITICAL (affects downstream features), HIGH (affects UX), MEDIUM (detail difference).

## Gap Summary

| # | Gap | Severity | Affects |
|---|-----|----------|---------|
| G2-01 | Per-page Navbar missing in left mode | HIGH | F005 chat header needs independent navbar-like content area |
| G2-02 | Tab icons not rendered | MEDIUM | Visual fidelity — source shows icon + title per tab |
| G2-03 | Sidebar icons not user-configurable | MEDIUM | Source allows reordering/hiding sidebar icons via settings |
| G2-04 | Theme toggle absent from navigation | MEDIUM | Source has theme toggle in both sidebar and tab bar |
| G2-05 | No Add Tab / Launchpad entry point | MEDIUM | Source has + button opening Launchpad page |
| G2-06 | Settings path memory missing | MEDIUM | Source remembers last settings sub-page, target always opens /settings/provider |
| G2-07 | Navbar is unified but source has two distinct Navbar roles | HIGH | Source's Navbar.tsx is a per-page content bar (not the tab/sidebar chrome). Target's Navbar is the top-level chrome only. F005 builds its own ChatHeader to compensate, but this diverges from source architecture. |

## Detailed Analysis

### G2-01: Per-page Navbar Missing in Left Mode (HIGH)

**Source behavior**: In left sidebar mode, `Navbar.tsx` (`components/app/Navbar.tsx`) serves as a per-page content navbar with `NavbarLeft`, `NavbarCenter`, `NavbarRight`, `NavbarMain` slots. Each page fills these slots with its own controls (e.g., HomePage puts sidebar toggle + search + narrow mode in the Navbar). The Navbar also provides the window drag region and WindowControls in left mode.

**Target behavior**: `Navbar.tsx` (`components/navigation/Navbar.tsx`) is the unified top-level navigation chrome. In left mode, it renders only a drag area. There is no per-page content slot system.

**Impact**: F005's ChatHeader has to independently implement sidebar toggle, model selector, and topic display that would normally be in the per-page Navbar. This works but diverges from source architecture. Not blocking for F006+.

### G2-02: Tab Icons Not Rendered (MEDIUM)

**Source behavior**: Each tab in `TabsContainer` renders `getTabIcon(tabId)` which returns a LucideIcon or MinAppIcon, plus `getTabTitle(tabId)` for the label.

**Target behavior**: `TabItem` renders title text only. No icon.

**Impact**: Visual fidelity difference. Tabs are text-only in target.

### G2-03: Sidebar Icons Not User-Configurable (MEDIUM)

**Source behavior**: `sidebarIcons.visible[]` in settings controls which icons appear and their order. Users can add/remove/reorder sidebar items.

**Target behavior**: Sidebar items come from static `ROUTES` array filtered by `showInSidebar`. No runtime configuration.

**Impact**: Power-user feature missing. Does not affect downstream features.

### G2-04: Theme Toggle Absent from Navigation (MEDIUM)

**Source behavior**: Theme toggle button in both Sidebar (bottom, left mode) and TabsBar (right section, top mode). Cycles through dark/light/system.

**Target behavior**: No theme toggle in navigation. Theme is changed only via F003 Settings → Display.

**Impact**: Convenience feature. Theme change requires navigating to Settings.

### G2-05: No Add Tab / Launchpad Entry Point (MEDIUM)

**Source behavior**: `AddTabButton` (`+` PlusOutlined) in tab bar opens `/launchpad` page, which is a visual page picker.

**Target behavior**: No add-tab button. Tabs are auto-created when navigating via sidebar. No Launchpad page.

**Impact**: Different navigation paradigm. Target's approach is simpler but less discoverable for multi-tab workflows.

### G2-06: Settings Path Memory Missing (MEDIUM)

**Source behavior**: Settings button navigates to `lastSettingsPath` (remembered via Redux), so users return to where they left off in settings.

**Target behavior**: Settings gear always navigates to `/settings` which redirects to `/settings/provider`.

**Impact**: Minor UX friction — users always land on Provider settings, not their last settings page.

### G2-07: Navbar Dual-Role Architecture Divergence (HIGH)

**Source behavior**: The source has two conceptually distinct Navbar roles:
1. **App chrome bar** (TabsContainer in top mode): tab strip, theme, settings, window controls
2. **Per-page content bar** (Navbar in left mode): page-specific controls, filled by each page

These are separate components. Each page fills its own Navbar slots (e.g., HomePage puts sidebar toggles, search icon, narrow mode toggle).

**Target behavior**: Single `Navbar` component serves both roles partially. In top mode, it includes TabBar + settings gear. In left mode, it's just a drag area. Pages create their own headers independently (F005's ChatHeader).

**Impact**: Not structurally blocking, but creates divergence in how pages contribute controls to the top bar. Each new page must implement its own header rather than using a shared slot system.

## Recommendations

| Gap | Action | Priority |
|-----|--------|----------|
| G2-01 | Document as architectural choice. F005's ChatHeader approach works. | Can defer |
| G2-02 | Add icons to TabItem if visual fidelity is a priority | Low |
| G2-03 | Keep static routes for now — configurable icons is a power-user feature | Defer |
| G2-04 | Consider adding theme toggle to sidebar bottom section | Low |
| G2-05 | Current approach is intentionally simpler | Keep as-is |
| G2-06 | Store lastSettingsPath in useTabsStore | Low effort fix |
| G2-07 | Document as architectural divergence. Consider adding slot system if F006+ pages need per-page navbar | Defer, reassess at F006 |
