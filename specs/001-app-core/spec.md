# Feature Specification: App Core

**Feature Branch**: `001-app-core`
**Created**: 2026-03-08
**Status**: Draft
**Input**: Electron shell, window management, IPC bridge, config store, theme system, auto-update, tray, proxy

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Launch & Window Management (Priority: P1)

User launches Angdu Studio for the first time. The main window appears centered on screen with a default size. On subsequent launches, the window restores to its last size and position. The window has platform-appropriate chrome: hidden titlebar with traffic lights on macOS, frameless with custom overlay controls on Windows/Linux. Minimum window size is enforced (1080x600).

**Why this priority**: The main window is the entry point for all functionality. Without it, nothing works.

**Independent Test**: Launch the app, verify window appears with correct dimensions, close and relaunch to verify position/size persistence.

**Acceptance Scenarios**:

1. **Given** a fresh install, **When** the user launches the app, **Then** the main window appears centered with default dimensions (1080x600 minimum) within 3 seconds [source: B001]
2. **Given** a previous session where the user resized and moved the window, **When** the user relaunches, **Then** the window restores to the exact previous size and position [source: B001]
3. **Given** the app is running, **When** the user launches a second instance, **Then** the existing window is focused and brought to front instead of creating a new window [source: B002]
4. **Given** the app is running on macOS, **When** the user views the window, **Then** it displays a hidden titlebar with native traffic light controls [source: B001]
5. **Given** the app is running on Windows/Linux, **When** the user views the window, **Then** it displays a frameless window with custom minimize/maximize/close overlay controls [source: B001]

---

### User Story 2 - IPC Bridge & Configuration (Priority: P1)

User interacts with the app (triggering renderer-side actions), and these actions communicate with the main process through a typed IPC bridge. Configuration changes (like settings) are persisted to disk via electron-store and survive app restarts. All IPC channels are registered centrally via a shared enum.

**Why this priority**: The IPC bridge is the communication backbone. Every feature depends on it. Configuration persistence is essential for user preferences.

**Independent Test**: Change a setting in the renderer, verify it's persisted by restarting the app and checking the value.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the renderer invokes an IPC channel, **Then** the main process handles the request and returns a response within 100ms for local operations [source: B003, B004]
2. **Given** the app is running, **When** a user changes a configuration value, **Then** the value is persisted to disk and available after restart [source: B005]
3. **Given** the app starts, **When** IPC registration completes, **Then** all channels defined in the IpcChannel enum are registered and functional [source: B003]
4. **Given** the preload script loads, **When** the renderer accesses `window.api`, **Then** only whitelisted IPC methods are exposed (contextIsolation enforced) [source: B004]

---

### User Story 3 - Theme Switching (Priority: P1)

User opens settings and switches between dark, light, and system theme modes. The theme change applies immediately to all open windows without requiring a restart. Title bar overlays update to match the selected theme.

**Why this priority**: Theme is a fundamental visual experience. Users expect immediate feedback and consistency across windows.

**Independent Test**: Switch theme from light to dark, verify all windows update; switch to system and verify it follows OS setting.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the user selects dark mode, **Then** all windows transition to dark theme within 100ms [source: B006]
2. **Given** the app is in system mode on macOS, **When** the OS switches from light to dark mode, **Then** the app follows the OS theme automatically [source: B006]
3. **Given** a theme switch occurs, **When** title bar overlays are present, **Then** they update their colors to match the new theme [source: B006]

---

### User Story 4 - Proxy Configuration (Priority: P2)

User configures a proxy for network access. The app supports three proxy modes: system (use OS settings), custom (user-provided URL with optional bypass rules), and none (direct connection). Changes take effect immediately without restart.

**Why this priority**: Essential for users behind corporate firewalls or using VPNs. Must work before any network-dependent feature.

**Independent Test**: Configure a custom proxy, verify network requests route through it; switch to none, verify direct connection.

**Acceptance Scenarios**:

1. **Given** the user selects "system" proxy mode, **When** the app makes network requests, **Then** it uses the OS proxy settings [source: B007]
2. **Given** the user enters a custom SOCKS/HTTP proxy URL, **When** the setting is saved, **Then** all network requests (Electron session, axios, undici) route through the proxy without restart [source: B007]
3. **Given** the user has bypass rules configured (CIDR, domain, wildcard), **When** a request matches a bypass rule, **Then** it bypasses the proxy and connects directly [source: B007]
4. **Given** the user selects "none" proxy mode, **When** the app makes requests, **Then** no proxy is applied [source: B007]

---

### User Story 5 - System Tray & Window Controls (Priority: P2)

User minimizes the app to the system tray. The tray icon provides a context menu for show/hide, quick assistant toggle, and quit. Window controls (minimize, maximize, close, fullscreen) work on all platforms.

**Why this priority**: Expected desktop app behavior. Tray provides persistent presence without cluttering the taskbar.

**Independent Test**: Minimize to tray, verify icon appears with context menu; use context menu to restore window.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user views the system tray, **Then** the Angdu Studio icon is visible with a context menu [source: B009]
2. **Given** the tray context menu is open, **When** the user selects "Show/Hide", **Then** the main window toggles visibility [source: B009]
3. **Given** the app is running on macOS, **When** the tray is displayed, **Then** it uses template images for proper light/dark mode adaptation [source: B009]
4. **Given** the main window is visible, **When** the user clicks minimize/maximize/close controls, **Then** the corresponding window action executes correctly on all platforms [source: B013]
5. **Given** the app is running, **When** the user creates/toggles the mini window, **Then** a compact window (550x400) appears and can be pinned on top [source: B012]

---

### User Story 6 - Auto-Update (Priority: P2)

User receives update notifications when a new version is available. The app checks for updates on launch and allows the user to download and install. Update channels (latest, rc, beta) and mirror selection are configurable.

**Why this priority**: Keeps the app current. Not blocking for MVP functionality but important for user retention.

**Independent Test**: Mock an available update, verify notification appears and download/install flow works.

**Acceptance Scenarios**:

1. **Given** the app starts, **When** a newer version is available on the configured channel, **Then** the user is notified with release notes [source: B008]
2. **Given** the user accepts an update, **When** the download completes, **Then** the app installs the update and restarts [source: B008]
3. **Given** the user configures a different update channel (beta), **When** the app checks for updates, **Then** it checks the correct feed URL [source: B008]

---

### User Story 7 - Deep Links & Shortcuts (Priority: P2)

User clicks an `angdu-studio://` link in a browser or external app. The app activates and processes the deep link action (e.g., install MCP server, import provider). The user can also configure global keyboard shortcuts that work even when the app is not focused.

**Why this priority**: Enables integration with external tools and workflows. Shortcuts improve power-user efficiency.

**Independent Test**: Open an `angdu-studio://` URL, verify app processes it; set a global shortcut, verify it triggers from another app.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user opens an `angdu-studio://` URL, **Then** the app receives and processes the deep link [source: B010]
2. **Given** the app is not focused, **When** the user presses a registered global shortcut, **Then** the app performs the associated action [source: B011]
3. **Given** the user changes a shortcut binding, **When** the change is saved, **Then** the old shortcut is unregistered and the new one takes effect immediately [source: B011]

---

### User Story 8 - App Lifecycle & Quit (Priority: P1)

User quits the app. All services (MCP connections, background processes) are cleaned up gracefully before the app exits. Crash reports are collected for troubleshooting.

**Why this priority**: Proper cleanup prevents data corruption and resource leaks. Crash reporting is essential for reliability.

**Independent Test**: Quit the app, verify all background services are stopped cleanly; simulate crash, verify report is generated.

**Acceptance Scenarios**:

1. **Given** the app is running with active services, **When** the user quits, **Then** all services are cleaned up (MCP, analytics, API server) before exit [source: B015]
2. **Given** a renderer crash occurs, **When** the crash reporter is active, **Then** a local crash report with JS call stack is generated [source: B015]

---

### Edge Cases

- What happens when electron-store config file is corrupted? → App resets to defaults and notifies user
- What happens when the saved window position is outside visible screen bounds (monitor disconnected)? → Window repositions to primary display center
- What happens when proxy URL is invalid? → App displays error and falls back to direct connection
- What happens when auto-update download is interrupted? → Retry on next launch
- What happens when two deep links arrive simultaneously? → Queue and process sequentially

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: App MUST create a single main BrowserWindow with platform-appropriate chrome (hidden titlebar + traffic lights on macOS; frameless + custom overlay on Windows/Linux) and persisted size/position via electron-window-state [source: B001]
- **FR-002**: App MUST enforce single-instance execution; second instance focuses existing window [source: B002]
- **FR-003**: App MUST register all IPC channels defined in the shared IpcChannel enum via `ipcMain.handle()` during bootstrap [source: B003]
- **FR-004**: App MUST expose a minimal typed API via preload script with `contextIsolation: true` [source: B004]
- **FR-005**: App MUST persist configuration using electron-store with typed ConfigKeys enum and reactive subscriber pattern [source: B005]
- **FR-006**: App MUST support three theme modes (dark, light, system) with synchronization to `nativeTheme` and title bar overlay updates [source: B006]
- **FR-007**: App MUST support three proxy modes (system, custom, none) with bypass rules (CIDR, IP, domain, wildcard), applying to Electron session, axios, and undici [source: B007]
- **FR-008**: App MUST check for updates via electron-updater with configurable channels (latest/rc/beta) and mirror selection [source: B008]
- **FR-009**: App MUST display a system tray icon with context menu (show/hide, quick assistant toggle, quit) using platform-appropriate icons [source: B009]
- **FR-010**: App MUST handle custom protocol URLs (`angdu-studio://`) for deep linking actions [source: B010]
- **FR-011**: App MUST register and manage configurable global keyboard shortcuts [source: B011]
- **FR-012**: App MUST provide a mini window (550x400 default) for quick assistant, toggleable and pinnable [source: B012]
- **FR-013**: App MUST support standard window controls (minimize, maximize, close, fullscreen) on all platforms [source: B013]
- **FR-014**: App MUST provide a macOS application menu with standard entries [source: B014]
- **FR-015**: App MUST perform graceful shutdown, cleaning up all active services before exit [source: B015]
- **FR-016**: App MUST collect local crash reports with JS call stack on unresponsive renderer [source: B015]
- **FR-017**: App MUST replace Redux store sync with Zustand store sync mechanism for main↔renderer state synchronization
- **FR-018**: App MUST initialize app data directory structure on first launch
- **FR-019**: App MUST provide a notification system (in-app and system notifications) for cross-feature use

### Key Entities

- **AppConfig**: Persisted application configuration (theme, proxy, shortcuts, update channel, window state)
- **ThemeMode**: Enumeration of dark | light | system
- **ProxyConfig**: Proxy mode, URL, bypass rules
- **Notification**: Runtime notification object with type, title, message, progress, source
- **IpcChannel**: Shared enum defining all IPC channel names

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Main window opens and is interactive within 3 seconds of cold launch
- **SC-002**: Theme switch applies visually to all open windows within 100ms of user selection
- **SC-003**: Proxy configuration changes take effect on subsequent network requests without app restart
- **SC-004**: Second app instance launch focuses existing window within 500ms instead of creating a duplicate
- **SC-005**: All IPC channels respond within 100ms for local (non-network) operations
- **SC-006**: Window size and position persist correctly across 10 consecutive app restarts
- **SC-007**: System tray icon and context menu are functional on macOS, Windows, and Linux
- **SC-008**: App quit completes all service cleanup within 5 seconds
- **SC-009**: Configuration changes via electron-store are durable (survive unexpected process termination)
- **SC-010**: Mini window toggles visibility within 200ms of trigger
