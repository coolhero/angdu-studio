# Feature Specification: Core Platform

**Feature Branch**: `001-core-platform`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Core Platform - Electron shell, IPC bridge, window management, configuration persistence, i18n, theming, file storage, logging, and database initialization for Cherry Studio desktop AI assistant."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Launch and Shell Initialization (Priority: P1)

A user double-clicks the Cherry Studio application. The app initializes its services in the correct order, creates the main browser window, and restores the user's last-used window state (position, size, maximized status). If the app is already running, the existing instance is brought to the front instead of launching a duplicate.

**Why this priority**: Without a functioning application shell, no other feature can operate. This is the absolute foundation — the Electron main process, preload bridge, renderer entry point, and service initialization sequence.

**Independent Test**: Can be fully tested by launching the app binary on each target platform and verifying the window appears with correct dimensions and restored state. Delivers a running desktop application shell.

**Acceptance Scenarios**:

1. **Given** the app is not running, **When** the user launches Cherry Studio, **Then** the main window appears within 3 seconds with the last-used size and position restored.
2. **Given** the app is not running and no prior state exists, **When** the user launches Cherry Studio for the first time, **Then** the main window appears centered on the primary monitor with default dimensions.
3. **Given** the app is already running, **When** the user attempts to launch a second instance, **Then** the existing instance's window is brought to the front and focused — no duplicate process is created.
4. **Given** the app is running, **When** the renderer process crashes, **Then** the app automatically reloads the renderer if the last crash was more than 60 seconds ago, or exits gracefully if crashes are continuous (less than 60 seconds apart).
5. **Given** the app is launching, **When** the "launch to tray" setting is enabled, **Then** the app starts minimized to the system tray without showing the main window.

---

### User Story 2 - Configuration Persistence (Priority: P1)

A user modifies application settings (theme, language, zoom level, proxy, tray behavior, shortcuts). The changes take effect immediately without restart and persist across app restarts.

**Why this priority**: Configuration persistence underpins every other feature's settings. All downstream features depend on the ability to read and write persistent configuration values with live notification of changes.

**Independent Test**: Can be tested by changing each configuration key, verifying immediate effect, restarting the app, and confirming the value was retained.

**Acceptance Scenarios**:

1. **Given** the user is on the settings page, **When** they change the zoom factor, **Then** the UI immediately reflects the new zoom level and the value persists across restarts.
2. **Given** any configuration value, **When** it is updated via the configuration manager, **Then** all subscribed components receive a notification of the change within the same event-loop tick.
3. **Given** the configuration file is corrupted or missing, **When** the app starts, **Then** all configuration keys fall back to their documented defaults without error.
4. **Given** a configuration key with subscribers, **When** the value changes, **Then** each subscriber callback is invoked exactly once with the new value.

---

### User Story 3 - Theme Switching (Priority: P1)

A user changes the visual theme between Light, Dark, and System modes. The entire UI updates immediately with no flicker. When "System" mode is selected, the app follows the operating system's light/dark preference in real time.

**Why this priority**: Theming is a cross-cutting visual concern that affects every UI component. All downstream features render within the theme context established here.

**Independent Test**: Can be tested by toggling between all three theme modes and verifying visual consistency, then changing the OS theme while "System" is selected.

**Acceptance Scenarios**:

1. **Given** the user is in Light mode, **When** they switch to Dark mode, **Then** the entire UI updates to dark colors within 200ms with no visible flicker.
2. **Given** the user selects System mode, **When** the OS switches from light to dark, **Then** the app automatically follows the OS theme change within one event-loop tick.
3. **Given** multiple windows are open (main and mini), **When** the theme changes, **Then** all windows update to the new theme simultaneously.
4. **Given** the app stores an invalid theme value (from a version migration), **When** the app starts, **Then** it falls back to System mode gracefully.

---

### User Story 4 - File Upload and Storage (Priority: P1)

A user uploads a file through the UI (attachment, document, image). The file is stored in the app's local data directory, a metadata record is created in the local database, and the file can be retrieved, previewed, or deleted later.

**Why this priority**: File storage is a foundational service consumed by chat attachments (F005), knowledge base documents (F004), and other features. Without file management, no feature can persist user-provided files.

**Independent Test**: Can be tested by uploading files of various types and sizes, verifying metadata creation, then retrieving and deleting files.

**Acceptance Scenarios**:

1. **Given** the user selects a file (up to 50MB) for upload, **When** the upload begins, **Then** the file is stored in the app data directory and a FileMetadata record is created with correct id, name, path, size, extension, and MIME type.
2. **Given** a stored file, **When** the user requests to read it, **Then** the correct file contents are returned with proper encoding detection for text files.
3. **Given** a stored file, **When** the user deletes it, **Then** both the physical file and its metadata record are removed.
4. **Given** an image file, **When** the app processes it, **Then** base64 encoding, binary access, and paste-from-clipboard capture all work correctly.
5. **Given** a file larger than 5MB, **When** the upload proceeds, **Then** progress is reported incrementally to the UI.
6. **Given** a file with a reference count greater than 1, **When** one reference is removed, **Then** the file is retained until all references are removed.

---

### User Story 5 - Internationalization (Priority: P2)

A user changes the display language in settings. All visible text throughout the application updates immediately to the selected language without requiring an app restart. The app supports 10 locales.

**Why this priority**: Language support is important for the global user base but is not a prerequisite for other features to function. The i18n infrastructure must be established early since all UI text flows through it.

**Independent Test**: Can be tested by switching between each of the 10 supported locales and verifying that UI text, date formatting, and menu labels update correctly.

**Acceptance Scenarios**:

1. **Given** the user is viewing the app in English, **When** they switch to Korean, **Then** all visible UI labels, menu items, and system messages update to Korean immediately without restart.
2. **Given** a language change, **When** the main process receives the update, **Then** the system tray context menu and application menu (macOS) also update to the new language.
3. **Given** a translation key that has no translation in the selected locale, **When** that key is rendered, **Then** the English fallback text is displayed and the missing key is logged for debugging.
4. **Given** the app starts, **When** no language preference is stored, **Then** the language defaults to the OS locale if supported, otherwise English.
5. **Given** date/time values in the UI, **When** the language changes, **Then** date formatting follows the conventions of the selected locale.

---

### User Story 6 - System Tray (Priority: P2)

A user minimizes the app or closes the window with "close to tray" enabled. A system tray icon appears with a context menu providing quick actions (show window, show mini window, quit). Clicking the tray icon restores the app.

**Why this priority**: System tray is a key desktop UX pattern that keeps the app accessible without occupying taskbar space. Important for user convenience but not a prerequisite for core functionality.

**Independent Test**: Can be tested by enabling tray, minimizing the app, interacting with the tray icon and context menu, and restoring the window.

**Acceptance Scenarios**:

1. **Given** the tray setting is enabled, **When** the user minimizes the app, **Then** a platform-appropriate tray icon appears (light/dark variants on macOS, standard icon on Windows/Linux).
2. **Given** the tray icon is visible, **When** the user right-clicks it, **Then** a context menu appears with "Show Window", "Show Mini Window" (if Quick Assistant is enabled), and "Quit" options.
3. **Given** the tray icon is visible, **When** the user left-clicks it, **Then** the main window is shown and focused (or the mini window, if configured).
4. **Given** the tray setting is disabled, **When** the user starts the app, **Then** no tray icon is created.
5. **Given** the language or Quick Assistant setting changes, **When** the tray menu is next opened, **Then** it reflects the updated labels and options.

---

### User Story 7 - Mini Window (Quick Assistant) (Priority: P2)

A user activates the Quick Assistant via a keyboard shortcut or tray icon. A small floating window appears on the current monitor, always on top, allowing quick interaction. The window auto-hides when it loses focus (unless pinned).

**Why this priority**: The mini window provides a secondary interaction surface for quick AI access. It depends on window management but is independently testable.

**Independent Test**: Can be tested by enabling Quick Assistant, activating the mini window via shortcut, interacting with it, and verifying auto-hide and pin behavior.

**Acceptance Scenarios**:

1. **Given** Quick Assistant is enabled, **When** the user triggers it via shortcut or tray, **Then** a frameless floating window appears centered on the monitor where the cursor is located.
2. **Given** the mini window is visible and unpinned, **When** it loses focus, **Then** it auto-hides.
3. **Given** the mini window is visible and pinned, **When** it loses focus, **Then** it remains visible.
4. **Given** the mini window dimensions (default 550x400), **When** the user resizes it, **Then** it respects minimum (350x380) and maximum (1024x768) constraints.
5. **Given** a multi-monitor setup, **When** the mini window is activated, **Then** it appears on the monitor where the cursor is currently located.

---

### User Story 8 - Keyboard Shortcuts (Priority: P2)

A user configures global keyboard shortcuts for common actions (show app, toggle mini window, etc.). These shortcuts work even when the app is not focused.

**Why this priority**: Global shortcuts improve desktop integration but depend on the window management and configuration persistence established in P1 stories.

**Acceptance Scenarios**:

1. **Given** a configured global shortcut, **When** the user presses the key combination from any application, **Then** the configured action is executed (e.g., show main window, toggle mini window).
2. **Given** a shortcut configuration, **When** the user disables a specific shortcut, **Then** the key combination is unregistered and no longer triggers the action.
3. **Given** a shortcut key combination that conflicts with another application, **When** registration fails, **Then** the user is informed that the shortcut could not be registered.

---

### User Story 9 - Platform-Specific Behavior (Priority: P3)

The application adapts its behavior and appearance based on the host operating system — macOS, Windows, or Linux — including window chrome, portable mode detection, and desktop environment integration.

**Why this priority**: Platform-specific polish enhances user experience on each OS but is not required for core functionality. The app can operate with generic behavior initially.

**Independent Test**: Can be tested by running the app on each platform and verifying platform-specific behaviors (title bar style, dock/taskbar, portable mode, Wayland support).

**Acceptance Scenarios**:

1. **Given** the app is running on macOS, **When** the main window is displayed, **Then** it uses the native title bar style with traffic light buttons at the correct position, and the dock icon is managed based on window visibility.
2. **Given** the app is running on Windows, **When** the main window is displayed, **Then** it uses a frameless window with custom controls and window animations are disabled for performance.
3. **Given** the app is running on Linux, **When** the user enables "use system title bar" in settings, **Then** the window switches to the native Linux title bar; Wayland-specific shortcuts use the GlobalShortcutsPortal.
4. **Given** the app is running from a portable directory (Windows portable or Linux AppImage), **When** the app initializes, **Then** user data is stored alongside the executable rather than in the system user-data directory.

---

### User Story 10 - Logging and Diagnostics (Priority: P3)

The application logs events at configurable severity levels. Logs rotate daily and are available for troubleshooting. The renderer process can forward log entries to the main process logger.

**Why this priority**: Logging is an infrastructure concern that aids debugging. It is valuable but not user-facing or blocking for other features.

**Independent Test**: Can be tested by triggering various log-level events and verifying log files are created, rotated, and contain expected entries.

**Acceptance Scenarios**:

1. **Given** the app is running in production, **When** events occur, **Then** logs are written to daily-rotated files (max 10MB per file, 30-day retention for general logs, 60-day retention for error logs).
2. **Given** a renderer-side event, **When** it is logged, **Then** the log entry is forwarded to the main process logger via IPC with the source window, module, and context.
3. **Given** the CSLOGGER_MAIN_LEVEL environment variable is set, **When** the app starts in development mode, **Then** the console log level is overridden to the specified level.
4. **Given** a logger created with withContext("ModuleName"), **When** a log entry is written, **Then** the module name and any contextual data are included in the log output.

---

### User Story 11 - Deep Link Protocol (Priority: P3)

The app registers a custom protocol (cherry-studio://) and handles incoming URLs. When another application or website directs the user to a cherry-studio:// URL, the app opens and processes the request.

**Why this priority**: Deep linking enables external integrations (OAuth callbacks, shared agents/conversations) but is not required for standalone operation.

**Independent Test**: Can be tested by invoking a cherry-studio:// URL from the command line or browser and verifying the app receives and processes it.

**Acceptance Scenarios**:

1. **Given** the app is not running, **When** a cherry-studio:// URL is invoked, **Then** the app launches and processes the URL payload.
2. **Given** the app is already running, **When** a cherry-studio:// URL is invoked, **Then** the existing instance is brought to the front and the URL is processed — no duplicate instance is created.
3. **Given** a malformed or unrecognized cherry-studio:// URL, **When** it is received, **Then** the app logs a warning and ignores the invalid URL without crashing.

---

### Edge Cases

- **Corrupted configuration**: If the electron-store configuration file is corrupted or contains invalid JSON, the app MUST fall back to all default values and log a warning — it MUST NOT crash.
- **Portable mode path resolution**: When running in portable mode (Windows PORTABLE_EXECUTABLE_DIR or Linux APPIMAGE), all user data paths MUST resolve relative to the executable directory, not the system user-data directory.
- **System theme change during runtime**: When the OS theme changes while the app is running in System mode, the app MUST update within one event-loop tick.
- **Large file handling**: File operations on files exceeding 50MB MUST report progress incrementally and MUST NOT block the UI thread.
- **Database schema migration**: When the app upgrades from an older version, the database MUST apply all necessary forward migrations without data loss.
- **Multi-monitor mini window**: The mini window MUST appear on the monitor where the cursor is located, not always on the primary monitor.
- **Continuous renderer crash**: If the renderer crashes twice within 60 seconds, the app MUST exit rather than enter a crash-reload loop.
- **File watcher stability**: File watchers MUST debounce events (1000ms) and wait for file stability (500ms) before emitting change events, to avoid duplicate notifications from incomplete writes.
- **Proxy configuration**: The app MUST support three proxy modes: system (OS proxy), fixed_servers (custom URL with bypass rules), and direct (no proxy).
- **IPC channel integrity**: All inter-process communication MUST go through typed IPC channels defined in a centralized enum — no string-literal channel names are permitted.
- **Concurrent file operations**: Multiple simultaneous file uploads MUST NOT corrupt metadata or produce race conditions in the database.
- **macOS dock visibility**: When the app is hidden to tray on macOS, the dock icon MUST be hidden; when the window is shown, the dock icon MUST reappear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement the Electron 3-process architecture (main, preload, renderer) with context isolation enabled, where the renderer has no direct access to Node.js APIs.
- **FR-002**: System MUST provide a typed IPC bridge using a centralized channel enum shared between main and renderer processes. All inter-process communication MUST reference this enum — string-literal channel names are prohibited.
- **FR-003**: System MUST manage the main application window including creation, minimize, maximize, close, and full-screen transitions, with window state (position, size, maximized) persisted across sessions.
- **FR-004**: System MUST provide a mini window (Quick Assistant) that is frameless, always-on-top, visible on all workspaces, auto-hides on blur (unless pinned), and supports multi-monitor centering on the cursor's screen. Resizable between 350x380 and 1024x768, default 550x400.
- **FR-005**: System MUST enforce single-instance operation — launching a second instance MUST activate the existing instance's window and pass any protocol URL to it.
- **FR-006**: System MUST persist configuration using a typed key-value store that supports an observer pattern (subscribe, unsubscribe, setAndNotify) for live change propagation to all subscribers.
- **FR-007**: System MUST support internationalization with 10 locales (en-US, ko-KR, ja-JP, ru-RU, de-DE, el-GR, es-ES, fr-FR, pt-PT, ro-RO), with immediate UI updates on language change (no restart), English fallback for missing keys, and missing-key logging.
- **FR-008**: System MUST support date/time formatting that follows the conventions of the selected locale.
- **FR-009**: System MUST implement a theme system with three modes (Light, Dark, System) where System mode automatically follows the OS preference. Theme changes MUST propagate to all open windows.
- **FR-010**: System MUST provide a file storage service supporting: upload (with progress for large files), download, read (with encoding detection for text files), write, delete, move, copy, rename, and image handling (base64 encoding, binary access, paste-from-clipboard capture).
- **FR-011**: System MUST create and maintain a FileMetadata record for each stored file, tracking: unique identifier, original name, storage path, size, extension, MIME type, reference count, and creation timestamp.
- **FR-012**: System MUST support file watching with configurable patterns, debounced events (1000ms), file stability detection (500ms), retry on error, and maximum directory depth.
- **FR-013**: System MUST detect the host platform (Windows, macOS, Linux) and adapt window chrome (native title bar on macOS, frameless on Windows, configurable on Linux), portable mode paths, and desktop environment integration (Wayland shortcuts, AppImage detection).
- **FR-014**: System MUST provide centralized, structured logging with daily log rotation (10MB max file size, 30-day retention for general logs, 60-day retention for error-level logs), context-scoped entries (module name + metadata), and renderer-to-main log forwarding via IPC.
- **FR-015**: System MUST initialize a versioned client-side database with support for forward-only migrations. Each schema version change MUST have a migration function that handles upgrades from any previous version to current.
- **FR-016**: System MUST provide a system tray icon (with platform-specific variants: light/dark on macOS, standard on Windows/Linux) and a context menu with configurable actions. Tray creation MUST be conditional on user configuration.
- **FR-017**: System MUST provide an application menu on macOS with standard menu items (About, Edit, View, Window, Help), dynamic labels following the current language, and links to external resources.
- **FR-018**: System MUST register a custom protocol handler (cherry-studio://) for deep linking, processing incoming URLs on all platforms including when the app is not running.
- **FR-019**: System MUST detect and recover from renderer process crashes — auto-reload if the last crash was more than 60 seconds ago, or exit gracefully if crashes are continuous (under 60 seconds apart).
- **FR-020**: System MUST support global keyboard shortcuts that work even when the app is not focused, with per-shortcut enable/disable configuration.
- **FR-021**: System MUST support proxy configuration with three modes: system (inherit OS proxy), fixed_servers (user-specified URL with bypass rules), and direct (no proxy).
- **FR-022**: System MUST support hardware acceleration toggle, requiring an app restart to take effect.

### Key Entities

- **FileMetadata**: Represents a file stored by the application. Key attributes: unique identifier (UUID), original file name, storage path relative to app data directory, file size in bytes, file extension, MIME type, reference count (for shared file usage), creation timestamp.
- **Shortcut**: Represents a configurable keyboard shortcut. Key attributes: action identifier (unique key), key combination(s), enabled/disabled state. Shared with settings UI (F008).

### Assumptions

- The application targets Electron with the latest stable Chromium and Node.js runtime.
- All user data is stored locally on the user's machine — no mandatory cloud services are involved.
- The 10 locale translation files already exist (carried over from original project static resources, with Korean replacing Chinese).
- File storage uses the OS-provided app data directory (or portable directory) — no custom server or external storage for this feature.
- The Dexie IndexedDB database schema will start fresh with version 1 in the new codebase (not migrating from the original project's 10-version history).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The application launches and displays the main window on Windows, macOS, and Linux within 3 seconds from invocation.
- **SC-002**: Configuration changes take effect immediately (same event-loop tick for in-process subscribers) and persist correctly across app restarts with 100% reliability.
- **SC-003**: Theme switches (Light/Dark/System) are reflected across all open windows within 200ms with no visible flicker.
- **SC-004**: File upload and retrieval works correctly for files up to 50MB, with progress indication for files above 5MB.
- **SC-005**: Language switching updates all visible UI text, menus, and date formatting without requiring an app restart.
- **SC-006**: System tray operations (minimize to tray, restore from tray, context menu actions) complete without errors on all three platforms.
- **SC-007**: The mini window (Quick Assistant) appears centered on the cursor's monitor within 300ms of activation, and auto-hide/pin behaviors work correctly.
- **SC-008**: Database migrations execute without data loss when upgrading between any two schema versions.
- **SC-009**: Log files are created, rotated daily, and contain correctly structured entries including module context and severity level.
- **SC-010**: Deep link URLs (cherry-studio://) are correctly received and processed on all three platforms, whether the app is already running or not.
