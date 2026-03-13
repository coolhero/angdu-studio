# Feature Specification: App Shell

**Feature Branch**: `001-app-shell`
**Created**: 2026-03-13
**Status**: Draft
**Input**: Electron main process infrastructure — window management (main + mini), system tray, auto-update, global shortcuts, IPC bridge, theme synchronization, and platform-specific behaviors.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Launch and Window Management (Priority: P1)

The user launches Angdu Studio. The application creates a single main window with platform-appropriate frame behavior (hidden titlebar with traffic lights on macOS, frameless on Windows/Linux). If the app is already running, the existing window is focused instead of creating a duplicate. Window position, size, and maximized state are restored from the previous session.

**Why this priority**: Without a window, nothing else works. This is the absolute foundation of the desktop experience.

**Independent Test**: Launch the app and verify the main window appears with correct frame style and restored state. Launch again and verify the existing window focuses.

**Acceptance Scenarios**:

1. **Given** the app is not running, **When** the user launches Angdu Studio, **Then** a main window appears with the last-saved position/size (or default 960×600 centered)
2. **Given** the app is already running, **When** the user launches a second instance, **Then** the existing main window is focused and brought to front; no new window is created
3. **Given** the user is on macOS, **When** the main window renders, **Then** native traffic light buttons appear at position (8, 13) within a hidden titlebar
4. **Given** the user is on Windows or Linux, **When** the main window renders, **Then** the window is frameless with a custom titlebar providing minimize/maximize/close controls [source: B013, B002]

---

### User Story 2 - Mini Window (Quick Assistant) (Priority: P1)

The user activates a compact "quick assistant" mini window via a global shortcut or tray action. This small, always-on-top window provides fast access to chat without switching to the full app. The user can pin the mini window to prevent it from auto-hiding on blur.

**Why this priority**: The mini window is a core productivity feature that differentiates the desktop experience from a web app.

**Independent Test**: Press the configured global shortcut and verify the mini window appears on the current monitor near the cursor. Click outside to verify auto-hide. Pin it and verify it stays visible.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user presses the mini window global shortcut, **Then** a compact always-on-top window appears on the monitor where the cursor is [source: B022, B023]
2. **Given** the mini window is visible and unpinned, **When** the window loses focus, **Then** the mini window hides automatically [source: B024]
3. **Given** the mini window is visible, **When** the user pins it, **Then** the mini window remains visible even when focus moves elsewhere [source: B026]
4. **Given** text is selected in the mini window, **When** the user triggers "quote to main", **Then** the selected text is sent to the main window's chat input [source: B027]

---

### User Story 3 - System Tray (Priority: P1)

The user interacts with Angdu Studio through the system tray. The tray icon provides quick access to show/hide the main window, toggle the mini window, and quit the app. On supported platforms, clicking the tray icon shows the main window (or mini window if configured).

**Why this priority**: System tray is essential for the "always available" desktop experience and the tray-on-close workflow.

**Independent Test**: Verify the tray icon appears after launch. Right-click to see the context menu. Click to toggle window visibility. Close the main window and verify the app stays running (tray mode).

**Acceptance Scenarios**:

1. **Given** the app launches, **When** initialization completes, **Then** a system tray icon appears with a platform-appropriate icon [source: B028]
2. **Given** the tray icon exists, **When** the user right-clicks, **Then** a context menu shows: Show Window, Mini Window, Selection Assistant toggle, Quit [source: B029]
3. **Given** trayOnClose is enabled, **When** the user closes the main window, **Then** the window hides to tray instead of quitting [source: B019]
4. **Given** the user configured clickTrayToShowQuickAssistant, **When** clicking the tray icon, **Then** the mini window toggles instead of the main window [source: B030]

---

### User Story 4 - Theme Synchronization (Priority: P2)

The user switches between dark, light, and system-follow themes. The theme change propagates to all open windows (main, mini, trace) immediately. The titlebar overlay color updates to match the active theme.

**Why this priority**: Visual consistency across windows is expected behavior but not structurally blocking.

**Independent Test**: Switch theme in settings and verify all windows update their appearance. Verify system theme following works.

**Acceptance Scenarios**:

1. **Given** the user selects "dark" theme, **When** the theme is applied, **Then** all open windows switch to dark mode and the titlebar overlay updates [source: B038, B039, B040]
2. **Given** the user selects "system" theme, **When** the OS theme changes, **Then** all windows follow the OS theme change automatically

---

### User Story 5 - Auto-Update (Priority: P2)

The user is notified when a new version of Angdu Studio is available. Updates can be downloaded and installed with a single action. The update feed URL is configurable for different channels (stable, RC, beta).

**Why this priority**: Updates ensure users get bug fixes and new features, but the app is usable without this.

**Independent Test**: Trigger an update check and verify the app reports the current version and any available update.

**Acceptance Scenarios**:

1. **Given** auto-update is enabled, **When** the app starts, **Then** it checks for updates from the configured feed URL [source: B032, B033]
2. **Given** an update is available, **When** the user chooses to install, **Then** the update downloads and the app restarts to apply it [source: B036]
3. **Given** a download is in progress, **When** the user cancels, **Then** the download stops cleanly [source: B037]

---

### User Story 6 - Global Shortcuts and Platform Behaviors (Priority: P2)

The user registers global keyboard shortcuts that work even when the app is not focused. Shortcuts include toggling the main window, toggling the mini window, and zoom controls. Platform-specific behaviors (launch on boot, Wayland support, AppImage relaunch) work correctly.

**Why this priority**: Global shortcuts enhance productivity but are not essential for basic operation.

**Independent Test**: Register a shortcut, switch to another app, press the shortcut, and verify it triggers the expected action.

**Acceptance Scenarios**:

1. **Given** the show_app shortcut is configured, **When** the user presses it from any app, **Then** the main window toggles visibility [source: B041]
2. **Given** launch on boot is enabled, **When** the system starts, **Then** Angdu Studio starts automatically [source: B049]
3. **Given** the app runs on Linux with AppImage, **When** relaunch is triggered, **Then** the app correctly uses the APPIMAGE executable path [source: B005]

---

### User Story 7 - IPC Bridge and Preload API (Priority: P1)

All communication between the renderer process and the main process goes through the typed IPC bridge exposed via the preload script. The preload API provides window controls (minimize, maximize, close, isMaximized), theme setting, mini window control, and app information to the renderer.

**Why this priority**: The IPC bridge is the communication backbone — all features depend on it.

**Independent Test**: Call each preload API method from the renderer and verify the expected main process action occurs.

**Acceptance Scenarios**:

1. **Given** the renderer loads, **When** it accesses `window.api`, **Then** all declared API methods are available (windowControls, miniWindow, setTheme, etc.) [source: B053]
2. **Given** the renderer calls `window.api.windowControls.minimize()`, **When** the IPC message reaches the main process, **Then** the main window minimizes [source: B054]
3. **Given** contextIsolation is true, **When** the renderer attempts to access Node.js globals directly, **Then** access is denied [source: B009/FR-009]

---

### User Story 8 - Protocol Handler and Deep Linking (Priority: P3)

The user clicks an `angdustudio://` URL from another application or website. Angdu Studio receives the URL and processes the embedded data (e.g., import configuration, open specific content).

**Why this priority**: Deep linking is a convenience feature, not required for core functionality.

**Independent Test**: Open an `angdustudio://data?...` URL and verify the app receives and processes it.

**Acceptance Scenarios**:

1. **Given** the app is installed, **When** the user clicks an `angdustudio://` link, **Then** the app opens (or focuses) and processes the URL data [source: B010]

---

### Edge Cases

- **Renderer crash**: If the renderer becomes unresponsive, the app reloads the page automatically — but only if more than 1 minute has passed since the last crash (to prevent crash loops) [source: B015]
- **Mini window multi-monitor**: The mini window appears on the monitor where the cursor currently is, not necessarily the primary monitor [source: B023]
- **Linux Wayland vs X11**: Global shortcuts use different APIs (GlobalShortcutsPortal on Wayland, standard on X11). Window visibility behavior differs [source: B041, B012]
- **macOS fullscreen**: Closing and reopening while in fullscreen state should restore fullscreen [source: B013]
- **Config notification system**: ConfigManager changes propagate to tray, theme, shortcuts, and other services via pub/sub [source: B051, XR-003]
- **Shutdown save**: Before quit, the app sends a save signal to the renderer to persist state, and checks for active operations that should block quit [source: B002, BR-002, BR-003]
- **Factory reset**: Cleans up all data connections before deleting the data directory; failures are logged but never block the reset [source: BR-006]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce single-instance execution. If the app is already running, a second launch MUST focus the existing main window instead of creating a new instance [source: B001, B002]
- **FR-002**: System MUST create a main window with platform-appropriate frame: macOS uses hidden titlebar with traffic lights at (8, 13); Windows/Linux use frameless mode with custom titlebar controls [source: B013, B014]
- **FR-003**: System MUST persist and restore window state (position, size, maximized) across sessions using electron-window-state [source: B013, B003]
- **FR-004**: System MUST provide a mini window (quick assistant) that is always-on-top, supports pin/unpin, auto-hides on blur (when unpinned), and positions on the cursor's current monitor [source: B022, B023, B024, B025, B026]
- **FR-005**: System MUST display a system tray icon with a right-click context menu offering: show main window, toggle mini window, toggle selection assistant, and quit [source: B028, B029, B030]
- **FR-006**: System MUST support auto-update via electron-updater with configurable feed URL and update channels (stable/rc/beta). Users MUST be able to check, download, cancel, and install updates [source: B032, B033, B034, B036, B037]
- **FR-007**: System MUST register configurable global keyboard shortcuts for: show/toggle main window, toggle mini window, zoom in/out/reset. Shortcuts MUST work when the app is not focused [source: B041, B042, B043, B044]
- **FR-008**: System MUST synchronize theme (dark/light/system) across all open windows. Theme changes MUST update the titlebar overlay color and broadcast the change via IPC to all renderers [source: B038, B039, B040]
- **FR-009**: System MUST expose a typed preload API via `contextBridge.exposeInMainWorld` with `contextIsolation: true`. The preload bridge provides: window controls (min/max/close/isMaximized), mini window controls (show/hide/toggle/pin), theme setting, app info, and zoom factor [source: B053, B054, B055, B056]
- **FR-010**: System MUST register and handle the `angdustudio://` protocol for deep linking. URL data MUST be parsed and dispatched to the appropriate handler [source: B010]
- **FR-011**: System MUST handle window close behavior based on configuration: if trayOnClose is enabled, closing the main window hides it to tray; otherwise the app quits. On macOS, the app MUST hide on close (not quit) unless explicitly quitting [source: B019]
- **FR-012**: System MUST send a save signal to the renderer before quit so it can persist state. Active operations (e.g., backup) MUST be able to block quit via a prevent-quit guard [source: B002, BR-002, BR-003]
- **FR-013**: System MUST recover from renderer crashes by reloading the page, throttled to prevent crash loops (no reload if last crash was < 1 minute ago) [source: B015]
- **FR-014**: System MUST provide a ConfigManager service for electron-store based configuration with get/set/subscribe/notify pattern. Config changes MUST propagate to all subscribing services [source: B050, B051, B052]
- **FR-015**: System MUST support platform-specific behaviors: launch on boot (macOS login items, Windows registry, Linux .desktop), relaunch handling for AppImage and portable Windows, Linux window class/name, and Wayland-specific adaptations [source: B005, B012, B045, B046, B049]
- **FR-016**: System MUST open external links in the system default browser, not within the Electron window [source: B017]
- **FR-017**: System MUST provide a macOS application menu with standard sections (About, Edit with clipboard shortcuts, View, Window, Help) [source: B047]
- **FR-018**: System MUST initialize the app data directory during bootstrap, creating required subdirectories if they don't exist [source: B057]
- **FR-019**: System MUST provide a factory reset capability that closes all data connections, deletes the data directory, and relaunches the app. Errors during cleanup MUST be logged but MUST NOT block the reset [source: BR-006]
- **FR-020**: System MUST support proxy configuration with three modes: system (use OS proxy), custom (fixed_servers with bypass rules), and direct (no proxy) [source: BR-004]
- **FR-021**: System MUST provide data path migration allowing users to move the app data directory to a new location with write permission validation and file copy with exclusion filters [source: WF-002]

### Key Entities

- **WindowState**: Persisted main window position (x, y), size (width, height), and maximized flag
- **AppConfig**: Electron-store persisted configuration containing theme, language, tray settings, shortcut mappings, proxy config, launch preferences, and update channel
- **PreloadAPI**: Typed interface exposed to the renderer via contextBridge — defines all available IPC methods grouped by domain (windowControls, miniWindow, theme, app, file, backup, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Given the app is running, when a second instance is launched, then the existing window focuses within 500ms and no duplicate window is created [source: B002]
- **SC-002**: Given trayOnClose is enabled, when the user closes the main window via the close button, then the window hides and the tray icon remains visible [source: B019]
- **SC-003**: Given the quick assistant shortcut is configured, when the user presses it from any application, then the mini window appears on the cursor's monitor within 300ms [source: B022, B023]
- **SC-004**: Given auto-update is enabled and an update is available, when the app checks for updates, then the update info is returned and the user can initiate download [source: B032, B033]
- **SC-005**: Given the theme is set to "dark", when a new window opens (main or mini), then it renders in dark mode with the correct titlebar overlay color [source: B038, B039]
- **SC-006**: Given the renderer calls `window.api.windowControls.minimize()`, then the main window minimizes. Same pattern for maximize, close, and isMaximized query [source: B054]
- **SC-007**: Given the mini window is unpinned and visible, when focus moves to another window, then the mini window hides within 200ms [source: B024]
- **SC-008**: Given the renderer crashes, when more than 1 minute has passed since the last crash, then the renderer reloads automatically [source: B015]
- **SC-009**: Given the app launches, then the system tray icon is visible and the context menu contains at least 4 items (show window, mini window, selection assistant, quit) [source: B028, B029]
- **SC-010**: Given window state was saved from a previous session (position x:100 y:200, size 1200×800, maximized:false), when the app relaunches, then the window appears at the saved position and size [source: B013]
- **SC-011**: Given `angdustudio://data?key=value` URL is opened, then the app receives the URL and the handler processes the data parameter [source: B010]
- **SC-012**: Given a before-quit handler has a pending operation, when the user tries to quit, then the quit is blocked and the user is notified [source: BR-003]
