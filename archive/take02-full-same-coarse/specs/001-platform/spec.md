# Feature Specification: Platform Infrastructure

**Feature Branch**: `001-platform`
**Created**: 2026-03-02
**Status**: Draft
**Input**: Platform Infrastructure — Electron shell, window management, IPC bridge, config, theme, shortcuts, tray, updater, file management, settings UI, database, state management

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Launch and Initialization (Priority: P1)

A user launches Cherry Studio on their desktop (Windows, macOS, or Linux). The application initializes all platform services, creates the main window, and displays the home interface ready for use. The app remembers the user's previous window size, position, and state.

**Why this priority**: Without a working application shell, no other feature can function. This is the absolute foundation — all 6 downstream features depend on the app launching correctly.

**Independent Test**: Can be fully tested by launching the app binary on each supported platform and verifying the main window appears with the correct layout, previous window state is restored, and the app is responsive to user input.

**Acceptance Scenarios**:

1. **Given** the app is installed on a supported OS, **When** the user launches it for the first time, **Then** the main window opens at default size and position with the home interface displayed within 5 seconds
2. **Given** the app was previously closed with a custom window size and position, **When** the user relaunches, **Then** the window restores to the previous size and position
3. **Given** the app is already running, **When** the user attempts to launch a second instance, **Then** the existing window is focused instead of opening a duplicate
4. **Given** the app is running, **When** a system shutdown or power event occurs, **Then** the app saves its current state before exiting

---

### User Story 2 - File Management (Priority: P1)

A user uploads files (documents, images) through the application interface. Files are securely stored in the application's managed data directory and can be referenced by other features (chat attachments, knowledge documents). Users can also download, open, and delete managed files.

**Why this priority**: File management is used by chat (attachments), knowledge (documents), and creative (images). It is a cross-cutting foundation service required by 4 downstream features.

**Independent Test**: Can be tested by uploading a file via the UI, verifying it appears in the managed files list, and successfully downloading/opening it.

**Acceptance Scenarios**:

1. **Given** the user is in the application, **When** they upload a file via the file picker, **Then** the file is copied to the managed data directory and a file record is created with name, size, type, and creation date
2. **Given** a file has been uploaded, **When** the user requests to download or open it, **Then** the file is retrieved from the managed directory and opened or saved to the user's chosen location
3. **Given** a file exists in the managed directory, **When** the user deletes it, **Then** the file and its record are removed
4. **Given** the user uploads a file larger than 50 MB, **When** the upload is in progress, **Then** a progress indicator is shown and the upload completes without crashing

---

### User Story 3 - Theme and Display Settings (Priority: P1)

A user navigates to Settings and changes the application theme between light, dark, and system-follow modes. The entire application UI immediately reflects the new theme. Users can also configure display preferences.

**Why this priority**: Visual appearance is a core UX requirement. Theme switching is visible across all features and must work before any downstream feature UI is built.

**Independent Test**: Can be tested by changing the theme in settings and verifying all UI components reflect the change immediately.

**Acceptance Scenarios**:

1. **Given** the user is in Settings > Display, **When** they select "Dark" theme, **Then** all UI components switch to dark mode within 200 milliseconds
2. **Given** the user has selected "System" theme mode, **When** the operating system switches from light to dark mode, **Then** the app theme updates automatically to match
3. **Given** the user changes the theme, **When** they close and reopen the app, **Then** the selected theme persists

---

### User Story 4 - Settings Management (Priority: P1)

A user accesses the Settings panel to configure general preferences, display options, keyboard shortcuts, and data management options. All settings persist across application restarts.

**Why this priority**: The settings UI framework is used by every downstream feature that adds its own settings pages (providers, models, knowledge, etc.). It must exist first.

**Independent Test**: Can be tested by modifying various settings, restarting the app, and verifying all changes persist.

**Acceptance Scenarios**:

1. **Given** the user is in Settings, **When** they modify a general setting (language, launch at login, etc.), **Then** the change takes effect immediately and persists across restarts
2. **Given** the user navigates through settings tabs (General, Display, Shortcuts, Data, About), **When** switching between tabs, **Then** each tab loads its content correctly with the current values

---

### User Story 5 - System Tray Integration (Priority: P2)

A user minimizes the application to the system tray. The tray icon provides a context menu to restore the app or quit. The tray icon appearance matches the current system theme.

**Why this priority**: Tray integration is expected for desktop apps that run in the background. Important for UX but not required for core feature functionality.

**Independent Test**: Can be tested by minimizing to tray, verifying the icon appears, using the context menu to restore, and checking icon appearance in light/dark system themes.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user minimizes to tray, **Then** the app window hides and a tray icon appears with a context menu
2. **Given** the app is in the tray, **When** the user clicks the tray icon or selects "Restore" from the context menu, **Then** the app window is shown and focused
3. **Given** the system is using dark theme, **When** the tray icon is displayed, **Then** it uses the appropriate light-colored icon for visibility

---

### User Story 6 - Auto-Update (Priority: P2)

The application checks for updates on startup. When an update is available, the user is notified and can choose to download and install it. Users can select their preferred update channel (stable, release candidate, beta).

**Why this priority**: Important for keeping users on the latest version, but the app functions fully without it.

**Independent Test**: Can be tested by configuring the update channel, triggering an update check, and verifying the notification and download behavior.

**Acceptance Scenarios**:

1. **Given** the app launches, **When** an update is available on the configured channel, **Then** the user sees a notification about the available update
2. **Given** an update notification is shown, **When** the user chooses to install, **Then** the update downloads in the background and installs on next restart
3. **Given** the user is in Settings, **When** they change the update channel (stable/rc/beta), **Then** subsequent update checks use the selected channel

---

### User Story 7 - Keyboard Shortcuts (Priority: P2)

A user configures global keyboard shortcuts for common actions. Shortcuts work even when the application is not focused (global shortcuts). Users can customize shortcut bindings in Settings.

**Why this priority**: Enhances power user productivity. Not required for basic functionality but significantly improves daily usage.

**Independent Test**: Can be tested by registering a global shortcut, switching to another app, pressing the shortcut, and verifying the expected action fires.

**Acceptance Scenarios**:

1. **Given** the user has set a global shortcut for "Show/Hide App", **When** they press that key combination while in another application, **Then** Cherry Studio is shown or hidden accordingly
2. **Given** the user is in Settings > Shortcuts, **When** they modify a shortcut binding, **Then** the new binding takes effect immediately and persists across restarts

---

### User Story 8 - Proxy Configuration (Priority: P2)

A user behind a corporate firewall configures an HTTP, HTTPS, or SOCKS proxy. All outgoing network requests from the application route through the configured proxy. The app can also detect and use the system proxy settings.

**Why this priority**: Essential for users in restricted network environments. Without proxy support, the app is unusable for a significant user segment.

**Independent Test**: Can be tested by configuring a proxy, making a network request (e.g., checking for updates), and verifying the request routes through the proxy.

**Acceptance Scenarios**:

1. **Given** the user configures an HTTP/HTTPS proxy with host and port, **When** the app makes outgoing network requests, **Then** all requests route through the configured proxy
2. **Given** the user selects "Use system proxy", **When** the system has a proxy configured, **Then** the app automatically uses the system proxy settings
3. **Given** a proxy requires authentication, **When** the user provides username and password, **Then** the proxy connection authenticates successfully

---

### User Story 9 - Multi-Window Support (Priority: P3)

A user opens secondary windows (mini chat window, selection toolbar) that communicate with the main application window. Each window type serves a specific purpose and operates independently.

**Why this priority**: Enhances the multi-tasking experience but is not required for core functionality. Can be deferred without impacting the primary chat workflow.

**Independent Test**: Can be tested by opening each secondary window type and verifying it appears, functions, and communicates with the main window.

**Acceptance Scenarios**:

1. **Given** the main window is open, **When** the user triggers the mini window, **Then** a compact window opens that can operate independently while staying in sync with the main app state
2. **Given** the user is in any application, **When** they trigger the selection toolbar via shortcut, **Then** a floating toolbar appears for quick AI actions on selected text

---

### User Story 10 - Data Path Management (Priority: P3)

A user changes the application data storage location (e.g., moving data to an external drive). The app migrates all data to the new location and relaunches using the updated path. The app also supports "portable mode" where data is stored alongside the executable.

**Why this priority**: Useful for advanced users and portable installations. Not needed for standard usage.

**Independent Test**: Can be tested by changing the data path in settings, verifying the app relaunches, and confirming data is accessible at the new location.

**Acceptance Scenarios**:

1. **Given** the user selects a new data storage path, **When** they confirm the change, **Then** the app copies all data to the new location and relaunches with the new path active
2. **Given** the app is installed in portable mode, **When** it launches, **Then** all user data is stored in a directory alongside the executable

---

### Edge Cases

- System shutdown or power loss during operation — app saves state before exit via power monitor events
- File path containment violation — all file operations are sandboxed to the app data directory; any attempt to access outside paths is rejected
- Minimum window size enforcement — windows cannot be resized below the minimum threshold
- Missing required system binaries — graceful error with guidance when external tools (uv, bun) are not found
- Database schema migration on app upgrade — seamless data migration when upgrading from an older version
- Write permission failure — clear user feedback when the app data directory is not writable
- Large file operations (>50 MB) — progress tracking without UI freeze
- Concurrent file access from multiple windows — file operations are serialized to prevent conflicts

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a multi-platform desktop application shell that runs on Windows (x64/arm64), macOS (x64/arm64), and Linux (x64/arm64)
- **FR-002**: System MUST implement a secure inter-process communication bridge between the main process and renderer process, with context isolation enforced so the renderer cannot access system-level APIs directly
- **FR-003**: System MUST manage files (upload, download, read, write, delete, move, rename) within a sandboxed data directory, rejecting any operation targeting paths outside the sandbox
- **FR-004**: System MUST support three theme modes (light, dark, system-follow) with immediate UI updates when the theme changes and persistence across restarts
- **FR-005**: System MUST support configurable global keyboard shortcuts that work even when the application is not focused
- **FR-006**: System MUST provide system tray integration with minimize-to-tray, restore, and quit functionality, with platform-appropriate tray icon rendering
- **FR-007**: System MUST check for application updates on startup and support user-selectable update channels (stable, release candidate, beta) with background download and user-triggered installation
- **FR-008**: System MUST support multiple simultaneous windows (main, mini, selection toolbar, selection action, trace) with inter-window state synchronization
- **FR-009**: System MUST support HTTP, HTTPS, and SOCKS proxy configuration with system proxy detection, including proxy authentication and bypass rules
- **FR-010**: System MUST provide a settings UI framework with tabbed navigation (General, Display, Shortcuts, Data, About) that other features can extend with their own settings pages
- **FR-011**: System MUST initialize and manage a client-side database for the renderer process with versioned schema migrations
- **FR-012**: System MUST manage application state with selective persistence — user preferences and configuration persist across restarts while runtime-only state (active tabs, temporary UI state) does not
- **FR-013**: System MUST prevent multiple simultaneous instances of the application via single-instance lock
- **FR-014**: System MUST provide structured logging with configurable log levels for both the main process and renderer process

### Key Entities

- **FileMetadata**: Represents a managed file in the application data directory. Attributes: unique identifier, original file name, storage path, file size, file extension, MIME type, creation timestamp
- **Shortcut**: Represents a user-configurable keyboard shortcut. Attributes: action identifier, key combination(s), enabled state
- **User**: Represents the local user profile. Attributes: identifier, display name, avatar
- **AppInfo**: Represents application runtime information. Attributes: version, installation path, data directory path, platform, architecture

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application launches successfully on Windows, macOS, and Linux within 5 seconds from cold start
- **SC-002**: Inter-process communication calls complete within 100 milliseconds for non-I/O operations
- **SC-003**: File upload and download operations handle files up to 50 MB without errors or UI freezes
- **SC-004**: Theme switching reflects across the entire UI within 200 milliseconds
- **SC-005**: All user-configured settings persist correctly across 10 consecutive application restarts
- **SC-006**: System tray icon renders correctly on all three supported operating systems in both light and dark system themes
- **SC-007**: Global keyboard shortcuts trigger their associated actions within 200 milliseconds, even when the application is not focused
- **SC-008**: Application prevents multiple instances — launching a second instance activates the existing window instead
- **SC-009**: Database schema migration completes without data loss when upgrading from the previous version

## Assumptions

- Users have standard desktop operating system installations (no headless/server environments)
- Network connectivity is not required for core application launch and local operations
- The application has read/write access to its designated data directory
- System tray is available on the target operating system (fallback: minimize to taskbar on systems without tray support)
- Global shortcuts may conflict with OS-level or other application shortcuts — the app handles conflicts gracefully by notifying the user

## Dependencies

- **No upstream Feature dependencies** — F001-platform is the foundation feature
- **Downstream**: F002 (ai-foundation), F003 (chat), F004 (knowledge), F005 (data-mgmt), F006 (creative), F007 (extensions) all depend on F001

## Scope Boundaries

### In Scope
- Application shell and window management
- IPC bridge infrastructure
- File management system
- Theme, shortcuts, tray, auto-update
- Proxy configuration
- Settings UI framework
- Database initialization and schema management
- State management with selective persistence
- Logging infrastructure

### Out of Scope
- AI provider management (F002)
- Chat functionality (F003)
- Knowledge base operations (F004)
- Backup/restore and sync (F005)
- Image generation and translation (F006)
- Notes, agents, and API server (F007)
