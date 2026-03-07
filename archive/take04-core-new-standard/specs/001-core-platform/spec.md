# Feature Specification: Core Platform

**Feature Branch**: `001-core-platform`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Core Platform - Electron shell, IPC bridge, window management, configuration persistence, i18n, theming, file storage, logging, and database initialization for Cherry Studio desktop AI assistant."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Launch & Shell (Priority: P1)

A user launches Cherry Studio. The application initializes its core services in a defined order, creates the main browser window, loads the renderer process, and restores the user's last window state (position, size, maximized/normal). If the user already has an instance running, the second launch attempt brings the existing window to the foreground instead of opening a duplicate.

**Why this priority**: The application shell is the absolute foundation. Without a functioning launch sequence, window creation, and single-instance enforcement, no other feature can operate. This is the entry point for every user interaction.

**Independent Test**: Can be fully tested by launching the application, verifying the window appears with correct dimensions, closing and relaunching to confirm state restoration, and attempting a second instance launch to verify single-instance enforcement.

**Acceptance Scenarios**:

1. **Given** the app is not running, **When** the user launches Cherry Studio, **Then** the main window appears within 3 seconds with default or previously saved dimensions and position
2. **Given** the app is launching for the first time, **When** initialization completes, **Then** all core services are active (config, logging, theme, IPC, file storage, database) and the renderer loads without errors
3. **Given** the app is already running, **When** the user attempts to launch a second instance, **Then** the existing window is brought to the foreground and focused, and the second process exits
4. **Given** the user previously maximized the window, **When** they relaunch the app, **Then** the window opens maximized at the same monitor position

---

### User Story 2 - Configuration & Theme Persistence (Priority: P1)

A user modifies application settings such as theme (Light, Dark, or System), language, zoom level, or proxy configuration. Changes take effect immediately without requiring a restart. The system persists all configuration changes so they survive application restarts. When the OS dark mode setting changes while the app is running, the "System" theme option automatically follows the OS change.

**Why this priority**: Configuration persistence and theming are foundational user experience requirements. Every subsequent feature depends on the config system for its own settings, and theming affects the entire visual layer.

**Independent Test**: Can be tested by changing theme from Light to Dark and verifying immediate visual update, restarting the app and confirming the Dark theme is restored, and changing the OS to dark mode while "System" theme is selected to verify automatic follow.

**Acceptance Scenarios**:

1. **Given** the app is running with Light theme, **When** the user switches to Dark theme, **Then** the entire UI updates within 200ms with no visual flicker
2. **Given** the user has set Dark theme, **When** the app is closed and relaunched, **Then** Dark theme is restored without any flash of Light theme
3. **Given** the user has selected "System" theme and the OS is in light mode, **When** the OS switches to dark mode, **Then** the app theme automatically updates to dark within 200ms
4. **Given** multiple windows are open (main + mini), **When** the user changes the theme in one window, **Then** all windows update to the new theme simultaneously
5. **Given** the user changes any configuration value, **When** other parts of the app are subscribed to that value, **Then** subscribers receive the updated value immediately via the observer pattern

---

### User Story 3 - File Upload & Storage (Priority: P1)

A user uploads files (documents, images, or other attachments) through the application UI. Each uploaded file is stored in the application data directory with a unique identifier, and metadata (name, size, type, extension, creation time) is recorded in the local database. Images larger than 1MB are automatically compressed. Users can also read, download, delete, move, copy, and rename stored files.

**Why this priority**: File storage is a core dependency for knowledge base (F004) and AI chat attachments (F005). Without a functioning file storage layer, users cannot provide context to AI conversations.

**Independent Test**: Can be tested by uploading a file, verifying it appears in the app data directory, confirming metadata is stored, then performing read/delete/copy operations and verifying each completes correctly.

**Acceptance Scenarios**:

1. **Given** the user is in the app, **When** they upload a file up to 50MB, **Then** the file is stored with a unique identifier and a FileMetadata record is created with correct name, size, extension, and type
2. **Given** the user uploads an image larger than 1MB, **When** the upload completes, **Then** the image is compressed before storage and the FileMetadata reflects the compressed size
3. **Given** a file is stored, **When** the user requests to read it, **Then** the file contents are returned with correct encoding detection (UTF-8, GBK, etc.)
4. **Given** a file is stored, **When** the user deletes it, **Then** the file is removed from disk and its FileMetadata record is removed from the database
5. **Given** the user pastes an image from the clipboard, **When** the paste event is processed, **Then** the image is saved as a file with a generated name and associated FileMetadata

---

### User Story 4 - Internationalization (Priority: P2)

A user changes the application language from the settings. The entire UI immediately updates to the selected language without requiring a restart. The application supports 11 locales: English (en-US), Chinese Simplified (zh-CN), Chinese Traditional (zh-TW), Japanese (ja-JP), Russian (ru-RU), German (de-DE), Greek (el-GR), Spanish (es-ES), French (fr-FR), Portuguese (pt-PT), and Romanian (ro-RO). Date and time displays are also formatted according to the selected locale.

**Why this priority**: Internationalization is essential for the global user base but does not block other features from functioning. The app can operate in English-only as an MVP.

**Independent Test**: Can be tested by switching the language to each supported locale and verifying that all UI labels, menus, dialogs, and date/time formats update correctly without restart.

**Acceptance Scenarios**:

1. **Given** the app is in English, **When** the user switches to Japanese, **Then** all visible UI text updates to Japanese immediately without a restart
2. **Given** the app is set to French, **When** the user views date/time values, **Then** dates are formatted according to French locale conventions (e.g., DD/MM/YYYY)
3. **Given** the app is set to a language with a missing translation key, **When** that text is displayed, **Then** the missing key is logged for debugging and the English fallback is shown

---

### User Story 5 - System Tray & Mini Window (Priority: P2)

A user minimizes the application to the system tray. A platform-appropriate tray icon appears with a context menu offering options to show the main window, open the mini window (Quick Assistant), and quit. The mini window is a compact, frameless floating window (550x400 default, resizable from 350x380 to 1024x768) that stays on top of other windows, appears on all virtual desktops, auto-hides when it loses focus (unless pinned), and centers on the user's active monitor in multi-monitor setups.

**Why this priority**: System tray and mini window enhance daily usability but are not required for the core AI assistant workflow. The main window alone provides full functionality.

**Independent Test**: Can be tested by minimizing to tray, verifying the tray icon and context menu appear, opening the mini window from the tray, testing auto-hide behavior, pinning, and multi-monitor centering.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user minimizes to tray, **Then** the main window is hidden and a tray icon with context menu appears
2. **Given** the tray icon is visible, **When** the user clicks "Show" in the context menu, **Then** the main window is restored to its previous position and size
3. **Given** the tray is active, **When** the user selects "Mini Window", **Then** a frameless, always-on-top window appears centered on the active monitor at 550x400 pixels
4. **Given** the mini window is open and not pinned, **When** the user clicks outside the mini window, **Then** the mini window hides automatically
5. **Given** the mini window is pinned, **When** the user clicks outside, **Then** the mini window remains visible
6. **Given** a multi-monitor setup, **When** the mini window is opened, **Then** it centers on the monitor where the user's cursor is located
7. **Given** macOS, **When** the tray icon is displayed, **Then** it uses the appropriate light/dark variant matching the system menu bar appearance

---

### User Story 6 - Keyboard Shortcuts & Deep Links (Priority: P2)

A user configures global keyboard shortcuts that work even when the application is not focused. Each shortcut can be individually enabled or disabled. Additionally, users can click external links with the `cherry-studio://` protocol, which the application intercepts and processes (e.g., opening a specific conversation or triggering an action).

**Why this priority**: Global shortcuts and deep links improve power-user workflow efficiency but are not required for basic application usage.

**Independent Test**: Can be tested by registering a global shortcut, switching to another application, pressing the shortcut, and verifying the action triggers. For deep links, clicking a `cherry-studio://` link externally and verifying the app processes it.

**Acceptance Scenarios**:

1. **Given** the user has configured a global shortcut, **When** they press the shortcut while a different application is focused, **Then** Cherry Studio performs the associated action (e.g., show main window, show mini window)
2. **Given** a shortcut is disabled, **When** the user presses the key combination, **Then** nothing happens
3. **Given** the app is running, **When** the user clicks a `cherry-studio://action` link in an external application, **Then** the app receives and processes the link action
4. **Given** the app is not running, **When** the user clicks a `cherry-studio://` link, **Then** the app launches and processes the link after initialization

---

### User Story 7 - Platform Adaptation (Priority: P3)

The application detects the current operating system and adapts its behavior accordingly. On macOS, it uses native title bar with traffic light controls and provides a standard application menu. On Windows, it uses a frameless window with custom controls, supports portable mode (storing data alongside the executable), and disables CSS animations for performance. On Linux, it offers an optional system title bar, supports Wayland compositors, and handles AppImage packaging specifics.

**Why this priority**: Platform adaptations improve native feel but the application is functional on all platforms with a baseline configuration.

**Independent Test**: Can be tested by running the application on each platform and verifying platform-specific behaviors: title bar style, menu presence, portable mode on Windows, and Wayland support on Linux.

**Acceptance Scenarios**:

1. **Given** the app runs on macOS, **When** it creates the main window, **Then** native traffic light controls appear in the title bar and the standard application menu is available
2. **Given** the app runs on Windows, **When** it creates the main window, **Then** the window is frameless with custom title bar controls
3. **Given** the app runs on Windows in portable mode, **When** the app stores data, **Then** all user data is saved alongside the executable rather than in the system AppData directory
4. **Given** the app runs on Linux with Wayland, **When** the window is created, **Then** the application uses appropriate Wayland-compatible window management

---

### User Story 8 - Logging & Crash Recovery (Priority: P3)

The application maintains structured logs that rotate daily. Combined logs are capped at 10MB and retained for 30 days; error-specific logs are retained for 60 days. Each log entry includes the module context for traceability. If the renderer process crashes after running for more than 60 seconds, the application automatically reloads the renderer. If the renderer crashes within 60 seconds of the last crash (indicating a crash loop), the application exits to prevent continuous restarts.

**Why this priority**: Logging and crash recovery improve reliability and debuggability but the app functions without them. They become critical in production but are not user-facing features.

**Independent Test**: Can be tested by generating log entries, verifying rotation occurs at the size limit, and simulating a renderer crash to verify reload vs. exit behavior.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** a module logs an event, **Then** the log entry includes timestamp, level, module context, and message in the daily log file
2. **Given** the daily log file exceeds 10MB, **When** a new log entry is written, **Then** a new rotated log file is created and the old file is archived
3. **Given** log files older than 30 days exist, **When** the daily cleanup runs, **Then** logs older than 30 days are deleted (error logs retained for 60 days)
4. **Given** the renderer has been running for more than 60 seconds, **When** the renderer process crashes, **Then** the application automatically reloads the renderer
5. **Given** the renderer crashed and was reloaded less than 60 seconds ago, **When** the renderer crashes again, **Then** the application exits completely to prevent a crash loop
6. **Given** the renderer logs an event, **When** the log is forwarded, **Then** the log entry is sent from the renderer to the main process and written to the same log system

---

### Edge Cases

- Portable mode detection on Windows changes all file storage paths to be relative to the executable location
- System theme change while the app is running triggers an automatic theme update across all windows
- If the configuration store file is corrupted or unreadable, the system falls back to default values gracefully without crashing
- File operations on files larger than 50MB are handled without crashing or blocking the UI, with appropriate progress indication
- Database schema migration runs automatically when the app upgrades from an older version with a different schema
- On Linux, AppImage packaging requires special handling for file paths and auto-update mechanisms
- The single-instance lock must work reliably across all platforms including when the app is launched from different user contexts
- The mini window must handle edge cases where the cursor monitor is disconnected between opening events
- File watcher handles system events at a high rate by debouncing (1000ms) and only processing files that have been stable for 500ms
- Proxy bypass rules must correctly handle local addresses (localhost, 127.0.0.1) and custom bypass patterns
- Hardware acceleration toggle requires a full application restart to take effect; the app must clearly communicate this to the user

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a 3-process architecture (main, preload, renderer) with context isolation enabled to enforce security boundaries
- **FR-002**: System MUST provide a typed inter-process communication (IPC) bridge where all channels are defined in a centralized enumeration with no string literal channel names anywhere in the codebase
- **FR-003**: System MUST manage the main application window including creation, minimize, maximize, close, and persist/restore window state (position, size, maximized) across sessions
- **FR-004**: System MUST provide a mini window (Quick Assistant) that is frameless, always-on-top, visible on all virtual desktops, auto-hides on blur (unless pinned by the user), resizable from 350x380 to 1024x768, with a default size of 550x400, and centers on the user's active monitor in multi-monitor setups
- **FR-005**: System MUST enforce single-instance execution — if the app is already running, a second launch attempt MUST activate the existing window instead of creating a new instance
- **FR-006**: System MUST persist all configuration values using a typed key system and provide an observer pattern (subscribe/unsubscribe/setAndNotify) so that subscribers receive live updates when any configuration value changes
- **FR-007**: System MUST support 11 locales (en-US, zh-CN, zh-TW, ja-JP, ru-RU, de-DE, el-GR, es-ES, fr-FR, pt-PT, ro-RO) with immediate UI language switching (no restart required) and log missing translation keys for debugging
- **FR-008**: System MUST format all date and time values according to the selected locale's conventions
- **FR-009**: System MUST provide a theme system supporting Light, Dark, and System (follows OS) modes with multi-window propagation — when the theme changes, all open windows (main and mini) MUST update simultaneously
- **FR-010**: System MUST provide file storage operations: upload (with duplicate detection and progress reporting for large files), download, read (with encoding detection for text files), write, delete, move, copy, and rename. Images larger than 1MB MUST be automatically compressed before storage
- **FR-011**: System MUST create and maintain a FileMetadata record for each stored file containing: unique identifier (UUID), original name, storage path, size in bytes, file extension, file type classification, reference count, and creation timestamp
- **FR-012**: System MUST support file watching with configurable patterns, a debounce interval of 1000ms, a file stability threshold of 500ms, and a maximum directory depth of 10 levels
- **FR-013**: System MUST detect the current platform (macOS, Windows, Linux) and adapt behavior: native title bar on macOS with traffic lights, frameless window on Windows with custom controls, optional system title bar on Linux. MUST detect portable mode on Windows, AppImage on Linux, and Wayland vs X11 display servers
- **FR-014**: System MUST provide centralized structured logging with daily log rotation (10MB maximum per file, 30-day retention), separate error log rotation (10MB maximum, 60-day retention), context-scoped logging (module name in each entry), and forwarding of renderer-process logs to the main process
- **FR-015**: System MUST initialize a versioned client-side database with forward-only migration support — each schema version MUST have a registered migration function that runs automatically when a version mismatch is detected
- **FR-016**: System MUST provide a system tray icon with a context menu (Show main window, Open mini window, Quit) using platform-appropriate icons (light/dark variants on macOS) and configurable click behavior
- **FR-017**: System MUST provide a macOS application menu with standard menu items (Cherry Studio, Edit, View, Window, Help) using localized labels matching the current language
- **FR-018**: System MUST register as the handler for the `cherry-studio://` protocol on all platforms and process incoming deep link URLs, including when the app is already running and when it is launched by the link
- **FR-019**: System MUST implement renderer crash recovery: if the renderer crashes after running for more than 60 seconds, reload the renderer; if it crashes within 60 seconds of the last crash, exit the application to prevent crash loops
- **FR-020**: System MUST support global keyboard shortcuts that function even when the application window is not focused, with per-shortcut enable/disable configuration
- **FR-021**: System MUST support proxy configuration with three modes: system (use OS proxy settings), fixed servers (user-specified proxy URL), and direct (no proxy), with configurable bypass rules
- **FR-022**: System MUST allow toggling hardware acceleration on or off, clearly communicating to the user that a full application restart is required for the change to take effect

### Key Entities

- **FileMetadata**: Represents metadata for a stored file. Key attributes: unique identifier, original file name, storage path, file size, file extension, file type classification (image, video, audio, document, text, code, archive, other), reference count, and creation timestamp
- **Shortcut**: Represents a registered global keyboard shortcut. Key attributes: action identifier (unique key), key combination(s), and enabled/disabled state

### Assumptions

- The application will use the standard OS-provided application data directory for file storage by default (except in portable mode on Windows)
- File type classification follows a fixed set of categories: image, video, audio, document, text, code, archive, other
- The 187 existing state migrations from the original codebase will be adapted into the new database migration system as part of the database initialization
- The "System" theme option follows the OS dark/light mode preference and updates in real time
- The renderer-to-main log forwarding uses the same IPC bridge as other features, not a separate channel
- Missing translation keys fall back to the English (en-US) value

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application launches and displays the main window on Windows, macOS, and Linux within 3 seconds of user action
- **SC-002**: All user-initiated configuration changes take effect immediately (within 200ms) without requiring an application restart
- **SC-003**: File upload and download operations handle files up to 50MB successfully, with progress indication for files over 1MB
- **SC-004**: Theme switching completes across all open windows within 200ms with no visual flicker or unstyled content flash
- **SC-005**: All user settings persist correctly across application restarts, including theme, language, window state, proxy configuration, and shortcuts
- **SC-006**: System tray operations (minimize to tray, restore from tray, open mini window, quit) complete without errors on all three platforms
- **SC-007**: Language switching updates all visible UI text immediately without requiring an application restart, for all 11 supported locales
- **SC-008**: The single-instance mechanism prevents duplicate instances 100% of the time on all platforms
- **SC-009**: Renderer crash recovery correctly distinguishes between first-crash (reload) and crash-loop (exit) scenarios with the 60-second threshold
- **SC-010**: The mini window correctly centers on the active monitor in multi-monitor configurations and respects the always-on-top, auto-hide, and pin behaviors
