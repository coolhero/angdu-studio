# Feature Specification: App Core

**Feature Branch**: `001-app-core`
**Created**: 2026-03-07
**Status**: Draft
**Input**: User description: "F001-app-core — foundational Electron shell for Angdu Studio"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Launch and Initialization (Priority: P1)

The user double-clicks Angdu Studio. The application starts, initializes all core services, creates the main window, restores the previous window position and size, and presents a ready-to-use interface. The system tray icon appears with platform-appropriate styling.

**Why this priority**: Without a working app shell, no other feature can function. This is the absolute foundation.

**Independent Test**: Launch the app on each platform (Windows, macOS, Linux) and verify the window appears with correct dimensions and the tray icon is visible.

**Acceptance Scenarios**:

1. **Given** a fresh install, **When** the user launches the app, **Then** the main window appears within 3 seconds with default size and position, and the system tray icon is visible
2. **Given** a previous session with a custom window size and position, **When** the user launches the app, **Then** the window restores to the saved size and position
3. **Given** a previous session that was maximized, **When** the user launches the app, **Then** the window opens maximized
4. **Given** the renderer crashes within 60 seconds of launch, **When** the crash is detected, **Then** the app exits cleanly instead of entering a reload loop

---

### User Story 2 - Configuration Persistence (Priority: P1)

The user changes application settings (theme, language, proxy, launch-on-boot, etc.). These settings persist across app restarts without data loss. Other parts of the application are notified of changes in real time via an observer pattern.

**Why this priority**: Every feature depends on configuration. Without persistence and change notification, the app cannot maintain state.

**Independent Test**: Change a setting, restart the app, and verify the setting is retained. Change a setting and verify subscribers receive the notification.

**Acceptance Scenarios**:

1. **Given** the user changes a setting, **When** the app is restarted, **Then** the setting retains its new value
2. **Given** a corrupted config file, **When** the app starts, **Then** it falls back to default settings without crashing
3. **Given** a setting change, **When** the change is committed, **Then** all registered observers are notified within the same event loop tick
4. **Given** portable mode (executable alongside data), **When** the user changes settings, **Then** config is stored relative to the executable directory, not the OS user-data path

---

### User Story 3 - Theme Switching (Priority: P1)

The user selects a theme (Light, Dark, or System). The entire application immediately reflects the new theme across all open windows. When "System" is selected, the app follows the OS theme preference and updates automatically when the OS theme changes.

**Why this priority**: Theme is a core visual foundation that all UI features depend on. The CSS variable system established here is consumed by every downstream feature.

**Independent Test**: Switch between Light, Dark, and System themes and verify all windows update immediately with no flicker.

**Acceptance Scenarios**:

1. **Given** the user selects "Dark" theme, **When** the theme is applied, **Then** all windows reflect the dark theme within 200ms with no visual flicker
2. **Given** the user selects "System" theme and the OS is in dark mode, **When** the OS theme changes to light, **Then** the app automatically switches to light theme
3. **Given** multiple windows are open, **When** the theme is changed, **Then** all windows update simultaneously

---

### User Story 4 - IPC Communication Bridge (Priority: P1)

The renderer process invokes typed APIs exposed through the preload bridge. The main process handles each request and returns results. All communication is type-safe and follows a consistent channel naming convention.

**Why this priority**: Every feature requires IPC to communicate between renderer and main process. This is the transport layer for the entire application.

**Independent Test**: Invoke several IPC channels from the renderer and verify correct responses from the main process.

**Acceptance Scenarios**:

1. **Given** the renderer calls a typed IPC method, **When** the main process handles it, **Then** the result is returned within 100ms for non-IO operations
2. **Given** an IPC call to a non-existent channel, **When** the call is made, **Then** a typed error is returned (not a silent failure)
3. **Given** the preload bridge, **When** inspected from the renderer, **Then** only explicitly exposed APIs are available (no arbitrary Node.js access)

---

### User Story 5 - System Tray and Window Management (Priority: P2)

The user minimizes the app to the system tray. The tray icon provides a context menu with show/hide and quit actions. On macOS, the tray uses template images for proper menu bar integration. The user can show/hide the window from the tray.

**Why this priority**: Tray support is expected for desktop productivity apps and enables background operation.

**Independent Test**: Minimize to tray, verify icon appears, use context menu to restore, verify window reappears.

**Acceptance Scenarios**:

1. **Given** the user clicks minimize-to-tray, **When** the window hides, **Then** the tray icon appears with a context menu containing Show, Hide, and Quit
2. **Given** the tray icon is visible, **When** the user clicks "Show" in the tray menu, **Then** the main window appears and gains focus
3. **Given** macOS, **When** the tray icon is displayed, **Then** it uses a template image that adapts to the menu bar appearance

---

### User Story 6 - Global Shortcuts and Launch on Boot (Priority: P2)

The user registers global keyboard shortcuts that work even when the app is not focused. Shortcuts can be individually enabled/disabled. The user can also configure the app to launch automatically on system login.

**Why this priority**: Global shortcuts enable productivity workflows. Launch-on-boot ensures the app is always available.

**Independent Test**: Register a shortcut, switch to another app, press the shortcut, and verify the action fires. Enable launch-on-boot and verify the app starts after system login.

**Acceptance Scenarios**:

1. **Given** a registered global shortcut, **When** the user presses it while another app is focused, **Then** the shortcut action fires
2. **Given** two shortcuts registered to the same key combination, **When** the second is registered, **Then** the second takes precedence (last-write-wins)
3. **Given** a disabled shortcut, **When** the user presses the key combination, **Then** no action fires
4. **Given** launch-on-boot is enabled, **When** the system restarts, **Then** the app starts automatically

---

### User Story 7 - Proxy Configuration (Priority: P2)

The user configures an HTTP, HTTPS, or SOCKS proxy. All outbound network requests from the application route through the configured proxy. The user can bypass the proxy for local addresses.

**Why this priority**: Many users operate behind corporate proxies. Without proxy support, the app cannot reach AI providers.

**Independent Test**: Configure a proxy, make an outbound request, and verify it routes through the proxy.

**Acceptance Scenarios**:

1. **Given** an HTTP proxy is configured, **When** the app makes an outbound HTTP request, **Then** the request routes through the proxy
2. **Given** a SOCKS proxy is configured, **When** the app makes an outbound request, **Then** the request routes through the SOCKS proxy
3. **Given** proxy bypass rules include "localhost", **When** a request is made to localhost, **Then** it bypasses the proxy

---

### User Story 8 - Logging, Notifications, and Auxiliary Services (Priority: P2)

The application provides centralized structured logging with daily rotation and module-level filters. Desktop notifications alert the user to background events. Context menus provide right-click actions. Version info is accessible programmatically.

**Why this priority**: Logging is essential for debugging. Notifications, context menus, and version tracking are expected desktop app capabilities.

**Independent Test**: Trigger a log entry and verify it appears in the structured log file with correct module tag. Send a notification and verify it appears in the OS notification center.

**Acceptance Scenarios**:

1. **Given** a service logs a message, **When** the log is written, **Then** it is structured with timestamp, level, module, and message fields
2. **Given** the module filter is set to show only "AppService", **When** other modules log, **Then** their messages are filtered out
3. **Given** a background event completes, **When** a notification is sent, **Then** the OS notification center displays it
4. **Given** a right-click on an editable area, **When** the context menu appears, **Then** it includes Cut, Copy, Paste, and Select All

---

### User Story 9 - Zustand Store Sync Across Windows (Priority: P2)

When state changes in one Electron window (main window or mini-program), all other windows reflect the change. This replaces the previous Redux-based sync mechanism with Zustand broadcast middleware.

**Why this priority**: Multi-window state consistency is required for mini-programs and popout windows that share data with the main window.

**Independent Test**: Open two windows, change state in one, and verify the other window reflects the change.

**Acceptance Scenarios**:

1. **Given** two windows are open, **When** state changes in window A, **Then** window B reflects the change within 100ms
2. **Given** a window is opened after a state change, **When** it initializes, **Then** it receives the current state (not stale state)

---

### User Story 10 - Power Monitor and Cache (Priority: P3)

The application responds to system sleep/wake events by pausing and resuming background tasks. An in-memory LRU cache provides fast access to frequently used data.

**Why this priority**: These are auxiliary services that improve reliability and performance but are not blocking for core functionality.

**Independent Test**: Trigger a system sleep event and verify background tasks pause. Verify cache stores and evicts entries correctly.

**Acceptance Scenarios**:

1. **Given** the system goes to sleep, **When** the suspend event fires, **Then** background tasks (e.g., active streams) are paused
2. **Given** the system wakes, **When** the resume event fires, **Then** paused tasks are resumed
3. **Given** an LRU cache with a capacity of N, **When** N+1 items are inserted, **Then** the least recently used item is evicted

---

### Edge Cases

- Portable mode detection changes file storage paths (user data stored alongside executable)
- Corrupted config store falls back to defaults gracefully without data loss
- Renderer crash within 60 seconds of launch triggers app exit instead of infinite reload loop
- Linux AppImage requires special handling for auto-update paths and file system access
- System theme change while app is running triggers automatic theme update across all windows
- Proxy bypass applies to local addresses (127.0.0.1, localhost, ::1)
- Multiple shortcut registrations for same key combination: last-write-wins semantics
- Power monitor events during active AI streaming coordinate pause/resume gracefully
- Custom data directory path that becomes unwritable after initial validation

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize the main process, create a browser window, set up the system tray, and register all IPC handlers during startup [source: B003, B006, B018]
- **FR-002**: System MUST persist configuration across sessions using a key-value store with an observer pattern for change notifications [source: B002]
- **FR-003**: System MUST support theme switching (Light, Dark, System) with immediate visual application across all open windows and automatic OS theme sync [source: B005]
- **FR-004**: System MUST provide a system tray icon with show/hide/quit actions and platform-specific icon styling [source: B004, B006]
- **FR-005**: System MUST support global keyboard shortcut registration with per-shortcut enable/disable capability [source: B007, B008]
- **FR-006**: System MUST support cross-platform launch-on-boot configuration [source: B001]
- **FR-007**: System MUST support HTTP, HTTPS, and SOCKS proxy configuration with local address bypass [source: B017]
- **FR-008**: System MUST expose a typed API bridge from main process to renderer via a preload script, with no arbitrary Node.js access [source: B019]
- **FR-009**: System MUST support desktop notifications for background events [source: B009]
- **FR-010**: System MUST provide configurable right-click context menus [source: B010]
- **FR-011**: System MUST provide centralized structured logging with daily file rotation and module-level filtering [source: B011]
- **FR-012**: System MUST expose version and app info programmatically [source: B012]
- **FR-013**: System MUST synchronize Zustand store state across all open windows in real time [source: B014, B015]
- **FR-014**: System MUST support a custom data directory with writable verification at startup [source: B020]
- **FR-015**: System MUST provide an in-memory LRU cache with configurable capacity [source: B016]
- **FR-016**: System MUST respond to system suspend/resume events to coordinate background task lifecycle [source: B013]
- **FR-017**: System MUST restore window state (position, size, maximized) from the previous session on launch
- **FR-018**: System MUST prevent crash loops by exiting if the renderer crashes within 60 seconds of launch
- **FR-019**: System MUST detect portable mode and adjust data paths accordingly

### Key Entities

- **Shortcut**: Represents a registered global keyboard shortcut with a unique action key, key combination(s), and enabled/disabled state
- **ConfigStore**: Key-value persistence layer with observer pattern for real-time change notifications across the application
- **WindowState**: Persisted window geometry (x, y, width, height, isMaximized) restored on launch

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application launches and presents a ready-to-use window within 3 seconds on all supported platforms (Windows, macOS, Linux)
- **SC-002**: Inter-process communication calls complete within 100ms for non-IO operations
- **SC-003**: Theme switches are visually reflected across all windows within 200ms with no flicker
- **SC-004**: Configuration changes persist correctly across application restarts (100% round-trip fidelity)
- **SC-005**: System tray operations (minimize, restore, quit) work correctly on all three platforms
- **SC-006**: Global shortcuts fire correctly when the application is not the focused window
- **SC-007**: Proxy configuration applies to all outbound network requests
- **SC-008**: Log entries are structured with timestamp, level, module, and message; written to daily-rotated files
- **SC-009**: State changes in one window are reflected in all other windows within 100ms
- **SC-010**: Window position and size are restored from the previous session with pixel-level accuracy
