# Feature Specification: Navigation

**Feature Branch**: `002-navigation`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Tab-based routing, sidebar/top navigation mode, page navigation, tab lifecycle management

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hash-Based Page Routing and Tab Navigation (Priority: P1)

A user launches Angdu Studio and sees a top navigation bar with a "Home" tab that is always present. As the user opens different features (settings, chat, translate), each feature opens in a new tab in the navbar. Clicking a tab navigates to that feature's page. The URL uses hash-based routing (e.g., `#/settings`, `#/chat`) to work with Electron's `file://` protocol. If the user enters an unknown route, they are redirected to the home page.

**Why this priority**: Routing and tab navigation are the foundational interaction pattern. Without them, users cannot access any feature in the application. Every other feature depends on the ability to navigate between pages.

**Independent Test**: Launch the app, verify Home tab is visible. Open a feature page and verify a new tab appears. Click between tabs and verify the correct page content is displayed. Enter an invalid hash route and verify redirect to home.

**Acceptance Scenarios**:

1. **Given** the app has launched, **When** the user looks at the navigation bar, **Then** a "Home" tab is displayed and is selected by default
2. **Given** the user is on the home page, **When** they trigger navigation to the settings page, **Then** a "Settings" tab appears in the navbar and the settings page content is displayed
3. **Given** multiple tabs are open, **When** the user clicks on a tab, **Then** the corresponding page is displayed and the tab is visually marked as active
4. **Given** the user navigates to a route that does not exist (e.g., `#/nonexistent`), **When** the route resolves, **Then** the user is redirected to the home page [source: B043]
5. **Given** a feature page is already open in a tab, **When** the user navigates to the same route again, **Then** the existing tab is activated instead of creating a duplicate [source: B041, B044, B045, B046]

---

### User Story 2 - Tab Lifecycle Management (Priority: P1)

A user works with multiple open tabs and needs to manage them. Tabs can be closed by clicking the close button (except the Home tab, which is permanent). Right-clicking a tab reveals a context menu with options to close the current tab, close all other tabs, or close all tabs. Middle-clicking a tab closes it as a shortcut. When a tab is closed, the user is navigated to the nearest adjacent tab.

**Why this priority**: Tab lifecycle is essential for a productive multi-feature workflow. Without close, context menu, and focus management, the tab bar becomes unusable as the user opens more features.

**Independent Test**: Open several tabs, close one via the X button and verify navigation to an adjacent tab. Right-click a tab and verify the context menu appears with the correct options. Close all other tabs and verify only the selected and Home tabs remain.

**Acceptance Scenarios**:

1. **Given** the Home tab is the only tab, **When** the user looks for a close button on the Home tab, **Then** no close button is displayed — Home cannot be closed [source: B044]
2. **Given** a non-Home tab is open, **When** the user clicks the close button on that tab, **Then** the tab is removed and the user is navigated to the nearest remaining tab [source: B047]
3. **Given** a non-Home tab is open, **When** the user middle-clicks on that tab, **Then** the tab is closed (same as clicking the close button)
4. **Given** a tab is open, **When** the user right-clicks on it, **Then** a context menu appears with "Close", "Close Others", and "Close All" options
5. **Given** the context menu is open and "Close Others" is selected, **When** the action completes, **Then** all tabs except the right-clicked tab and the Home tab are closed
6. **Given** the context menu is open and "Close All" is selected, **When** the action completes, **Then** all tabs except the Home tab are closed, and the Home tab is activated
7. **Given** all non-Home tabs have been closed, **When** the last tab closes, **Then** the Home tab is activated automatically [source: B053]

---

### User Story 3 - Tab State Persistence Across Sessions (Priority: P2)

A user has several tabs open (settings, chat, translate) and quits the application. When they relaunch Angdu Studio, all previously open tabs are restored in the same order, and the last active tab is re-selected. This allows users to resume their work exactly where they left off.

**Why this priority**: Session continuity is a key desktop application expectation but is not strictly required for basic navigation to function.

**Independent Test**: Open three tabs, note their order. Quit and relaunch the app. Verify all three tabs are restored in the same order with the previously active tab selected.

**Acceptance Scenarios**:

1. **Given** tabs [Home, Settings, Chat] are open with Chat active, **When** the user quits and relaunches the app, **Then** the same three tabs appear in the same order with Chat active [source: B054]
2. **Given** persisted tabs include a route that no longer exists (feature removed), **When** the app launches, **Then** the invalid tab is silently discarded and the remaining tabs are restored
3. **Given** the tab persistence data is corrupted or unreadable, **When** the app launches, **Then** only the Home tab is shown (safe fallback)

---

### User Story 4 - Sidebar Navigation Mode (Priority: P2)

A user prefers a left sidebar layout over top tabs. They switch the navigation mode in settings from "top" to "left". The top tab bar is replaced by a vertical icon-based sidebar on the left side. Each icon represents a page, and hovering over an icon shows a tooltip with the page name. Clicking an icon navigates to that page. An active route indicator highlights the current page's icon.

**Why this priority**: Sidebar mode provides an alternative layout paradigm that some users prefer, but the application is fully functional with only the top tab mode.

**Independent Test**: Switch navigation mode to "left" in settings. Verify the sidebar appears with icons. Click icons and verify navigation. Hover and verify tooltips. Switch back to "top" and verify tabs return.

**Acceptance Scenarios**:

1. **Given** the user is in top navigation mode, **When** the user changes the navigation position setting to "left", **Then** the top tab bar is replaced by a left sidebar with icons, without page reload [source: B050]
2. **Given** the user is in sidebar mode, **When** they hover over a sidebar icon, **Then** a tooltip displays the page name
3. **Given** the user is in sidebar mode, **When** they click a sidebar icon, **Then** the corresponding page is displayed and the icon shows an active indicator [source: B051]
4. **Given** the user switches from left mode back to top mode, **When** the switch completes, **Then** the top tab bar reappears with the current page active

---

### User Story 5 - Tab Reordering via Drag and Drop (Priority: P3)

A user has many tabs open and wants to rearrange them. They click and drag a tab to a new position in the tab bar. The other tabs shift to accommodate the move. The new order is reflected immediately and persisted across sessions.

**Why this priority**: Tab reordering is a quality-of-life feature. Users can function without it, but it significantly improves the multi-tab experience for power users.

**Independent Test**: Open three tabs. Drag the second tab to the first position. Verify the order changes. Restart the app and verify the new order is preserved.

**Acceptance Scenarios**:

1. **Given** tabs [Home, A, B, C] are open, **When** the user drags tab C between Home and A, **Then** the order becomes [Home, C, A, B] [source: B048]
2. **Given** the user has reordered tabs, **When** the app is restarted, **Then** the custom tab order is preserved
3. **Given** the Home tab is in the first position, **When** the user tries to drag the Home tab, **Then** the Home tab cannot be moved (it always stays first)

---

### User Story 6 - Programmatic Navigation and Deep Link Tab Opening (Priority: P2)

Other features need to programmatically navigate users to specific pages — for example, a deep link arriving via the `angdu://` protocol should open the target page as a new tab. The navigation system provides a programmatic API (navigate to path, open in new tab, go back) that any feature can use.

**Why this priority**: Programmatic navigation is required for deep links (F001), settings page opening (F003), and chat tab creation (F005). It is the integration surface for other features.

**Independent Test**: Trigger a programmatic navigation call (e.g., from a deep link). Verify the correct page opens in a new tab if not already open, or the existing tab is activated.

**Acceptance Scenarios**:

1. **Given** a deep link `angdu://settings` arrives, **When** the navigation system processes it, **Then** the Settings page opens in a new tab (or existing Settings tab is activated) [source: B055]
2. **Given** a feature calls the navigate-back API, **When** the navigation resolves, **Then** the user returns to the previously active tab
3. **Given** a feature requests to open a page in a new tab with a custom title, **When** the tab is created, **Then** it appears with the specified title [source: B055]

---

### User Story 7 - Frameless Window Drag Region in Navbar (Priority: P1)

The application uses a frameless window (from F001). The top navigation bar must include a drag region so users can move the window by dragging the navbar area. Interactive elements within the navbar (tabs, buttons) must NOT trigger window dragging — only the empty space between and around tabs serves as the drag area.

**Why this priority**: Without a drag region in the frameless window, users cannot move the application window at all. This is critical for basic usability.

**Independent Test**: Drag the empty area of the navbar and verify the window moves. Click on a tab and verify it navigates instead of dragging.

**Acceptance Scenarios**:

1. **Given** the app is in top navigation mode, **When** the user drags an empty area of the navbar, **Then** the window moves [source: B049]
2. **Given** the app is in top navigation mode, **When** the user clicks on a tab or button in the navbar, **Then** the click action fires and the window does NOT start dragging
3. **Given** the app is in sidebar navigation mode, **When** the user drags the top area of the window (above content), **Then** the window moves

---

### User Story 8 - Lazy-Loaded Route Components (Priority: P2)

Route components are loaded on demand (lazy-loaded) rather than bundled together. When the user navigates to a page for the first time, the component is loaded. This keeps the initial application startup fast by not loading all feature pages upfront.

**Why this priority**: Lazy loading improves startup performance but is not required for basic navigation to work.

**Independent Test**: Launch the app and measure initial bundle size. Navigate to a new page and verify the component loads on demand without a noticeable delay.

**Acceptance Scenarios**:

1. **Given** the app has just launched, **When** the initial bundle loads, **Then** only the Home page component is included (other pages are not loaded) [source: B042]
2. **Given** the user navigates to a page for the first time, **When** the route is resolved, **Then** the page component is loaded on demand and rendered within the route transition time target
3. **Given** the user has visited a page before, **When** they navigate back to it, **Then** the page loads instantly (already cached in memory)

---

### Edge Cases

- **All tabs closed**: If all non-Home tabs are closed, Home tab remains and is activated — Home tab can never be closed
- **Duplicate tab prevention**: Opening a route that is already displayed in an existing tab activates that tab instead of creating a duplicate
- **Deep link during startup**: If a deep link arrives while the app is still initializing routes, the link is queued and processed after the navigation system is ready
- **Sidebar mode with many items**: If the sidebar has more navigation items than fit vertically, the overflow items are accessible via scroll
- **Tab title too long**: If a tab title exceeds the available width, it is truncated with an ellipsis and the full title is shown in a tooltip on hover
- **Tab overflow in top mode**: When more tabs are open than fit in the navbar width, a scroll mechanism or overflow indicator is provided [source: B052]
- **Rapid tab open/close**: Opening and immediately closing tabs in rapid succession does not leave orphaned route state
- **Tab state corrupted**: If persisted tab data is corrupt, the app gracefully falls back to showing only the Home tab

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use hash-based routing for all page navigation to work with Electron's file:// protocol [source: B041]
- **FR-002**: System MUST display a top navigation bar with a permanent Home tab that cannot be closed [source: B044]
- **FR-003**: System MUST render dynamic tabs in the navbar for each open page, with tab click navigating to the corresponding route [source: B045, B046]
- **FR-004**: System MUST support closing non-Home tabs via a close button, middle-click, and context menu (Close, Close Others, Close All) [source: B047]
- **FR-005**: System MUST redirect unknown or invalid routes to the home page [source: B043]
- **FR-006**: System MUST prevent duplicate tabs — navigating to an already-open route MUST activate the existing tab
- **FR-007**: System MUST persist open tabs (order, active tab) across application restarts and restore them on launch [source: B054]
- **FR-008**: System MUST support switching navigation mode between "top" (tab bar) and "left" (icon sidebar) via a configurable setting [source: B050]
- **FR-009**: System MUST render an icon-based sidebar with tooltips on hover and an active route indicator when in left navigation mode [source: B050, B051]
- **FR-010**: System MUST expose a programmatic navigation API (navigate to path, open in new tab with title, go back) for use by other features [source: B055]
- **FR-011**: System MUST support tab reordering via drag-and-drop, with the Home tab always first [source: B048]
- **FR-012**: System MUST provide a window drag region in the top navbar area (frameless window) where empty space allows window dragging but interactive elements (tabs, buttons) do not trigger drag [source: B049]
- **FR-013**: System MUST lazy-load route page components on first navigation to minimize initial bundle size [source: B042]
- **FR-014**: System MUST handle tab overflow when more tabs are open than fit in the navbar width, via horizontal scrolling or an overflow indicator [source: B052]
- **FR-015**: System MUST truncate long tab titles with an ellipsis and show the full title in a tooltip on hover
- **FR-016**: System MUST manage tab state (add, remove, reorder, active tab) in a centralized store [source: B053]
- **FR-017**: System MUST use Angdu Studio naming in all route identifiers and navigation labels (no Cherry Studio references)

### Key Entities

- **Tab**: Represents an open tab in the navigation bar — includes a unique identifier, the route path, a display title, an optional icon, whether it is closable, and sort order
- **NavbarConfig**: Represents the navigation layout configuration — includes the position mode ("top" or "left") and whether the sidebar is collapsible

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Route transitions between pages complete in under 100ms with no visible layout jank or flicker [source: B041]
- **SC-002**: Tab open and close operations are visually reflected within one animation frame (16ms) [source: B045, B047]
- **SC-003**: Switching navigation mode between top and left is instantaneous with no page reload — all page content and state is preserved [source: B050]
- **SC-004**: Window drag from the navbar empty space works correctly — tabs and buttons remain clickable without initiating window drag [source: B049]
- **SC-005**: All P1 source behaviors (B041, B043–B047, B049, B053) are covered by at least one FR with a verifiable acceptance scenario
- **SC-006**: Tab state (open tabs, order, active tab) persists correctly across quit/relaunch cycles with zero data loss under normal conditions [source: B054]
- **SC-007**: Context menu on right-click provides Close, Close Others, and Close All actions that execute correctly on the target tab
- **SC-008**: Deep links and programmatic navigation open the correct page as a new tab or activate an existing tab without duplicates [source: B055]
- **SC-009**: Lazy-loaded route components load on first navigation without user-perceivable delay (under 100ms for cached bundles) [source: B042]
- **SC-010**: Tab overflow is handled gracefully — all open tabs remain accessible via scrolling or overflow controls [source: B052]

### Assumptions

- The default navigation mode is "top" (tab bar) as verified at runtime from the original source
- The Home tab always occupies the first position and cannot be closed, moved, or hidden
- Tab persistence uses F001's config persistence API (IPC bridge to main process)
- Route components correspond to feature pages (settings, chat, translate, etc.) that will be implemented by subsequent Features
- Sidebar icons are provided by the application's icon set (lucide-react or similar)
- The navigation system provides routes for features defined in the roadmap; placeholder pages are acceptable for features not yet implemented
