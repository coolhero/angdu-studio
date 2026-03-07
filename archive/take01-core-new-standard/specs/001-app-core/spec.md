# Feature Specification: App Core

**Feature Branch**: `001-app-core`
**Created**: 2026-03-02
**Status**: Draft
**Input**: Electron shell, window management, IPC bridge, config management, file storage, i18n, shortcuts

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Launch and Window Management (Priority: P1)

A user launches Cherry Studio for the first time (or subsequent times). The application opens a main window with the correct theme, language, and any previously saved window position and size restored. The user can minimize, maximize, close, and resize the window. A system tray icon is available for quick access.

**Why this priority**: Without a functioning application shell and window, no other feature can operate. This is the absolute foundation.

**Independent Test**: Launch the app binary and verify the main window appears, can be resized/minimized/maximized, remembers its position after restart, and the tray icon is functional.

**Acceptance Scenarios**:

1. **Given** the app is not running, **When** the user launches it, **Then** the main window appears within 3 seconds with the default or last-used theme applied
2. **Given** the main window is open, **When** the user resizes it and closes the app, **Then** on next launch the window restores to the same size and position
3. **Given** the main window has a minimum size constraint, **When** the user tries to resize below 1000x600, **Then** the window does not shrink below that minimum
4. **Given** the app is running, **When** the user clicks the tray icon, **Then** the main window toggles visibility (show if hidden, focus if visible)
5. **Given** the app is running on macOS, **When** the user closes the main window, **Then** the app remains in the dock/tray (does not fully quit unless explicitly requested)

---

### User Story 2 - File Storage and Management (Priority: P1)

A user attaches a file to a conversation (via file picker, drag-and-drop, or paste). The system stores the file in a managed directory with a unique identifier, creates metadata for tracking, and makes it retrievable by other features. Files support reference counting so they can be cleaned up when no longer used.

**Why this priority**: File storage is a shared infrastructure service used by multiple downstream features (chat attachments, knowledge base documents, image generation outputs).

**Independent Test**: Upload a file through the file picker, verify it appears in the storage directory with a unique ID, and confirm the metadata is queryable.

**Acceptance Scenarios**:

1. **Given** the user clicks "attach file", **When** they select a file from the picker, **Then** the file is copied to the app's data directory with a unique ID and metadata is created
2. **Given** a file has been uploaded, **When** another feature requests the file by its ID, **Then** the file content is returned correctly
3. **Given** a file has a reference count of 1, **When** the referencing entity is deleted, **Then** the reference count drops to 0 and the file becomes eligible for cleanup
4. **Given** the user pastes an image from clipboard, **When** the paste event is handled, **Then** the image is saved as a file with appropriate metadata (type, size, extension)
5. **Given** a file upload is in progress, **When** the file exceeds reasonable size limits, **Then** the system handles it gracefully without crashing or running out of memory

---

### User Story 3 - Inter-Process Communication Bridge (Priority: P1)

The application provides a typed communication bridge between the main process (which handles system-level operations) and the renderer process (which displays the UI). All features in the application communicate through this bridge using named channels with defined request/response types.

**Why this priority**: Every other feature depends on IPC to function. Without a reliable, typed communication layer, the application cannot perform any meaningful work.

**Independent Test**: Send a message through each registered channel from the renderer and verify the correct response is returned from the main process.

**Acceptance Scenarios**:

1. **Given** the IPC bridge is initialized, **When** the renderer sends a message on a registered channel, **Then** the main process handler receives the message and returns a typed response
2. **Given** all channels are defined in a central registry, **When** a developer attempts to use a channel not in the registry, **Then** a compile-time error is raised
3. **Given** the renderer process, **When** it attempts to access system APIs directly (file system, child processes), **Then** the access is blocked by context isolation

---

### User Story 4 - Configuration Persistence (Priority: P2)

The application stores user preferences and configuration values persistently. Settings survive app restarts and are available to all features. Configuration values are typed and have sensible defaults.

**Why this priority**: Many features read configuration to determine behavior (theme, proxy, language, model defaults). This is needed before most other features can function correctly.

**Independent Test**: Set a configuration value, restart the app, and verify the value persists. Verify typed access works correctly.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** a feature writes a configuration value, **Then** the value is immediately persisted to disk
2. **Given** a configuration value was previously saved, **When** the app restarts, **Then** the value is available without any user action
3. **Given** a configuration key has no saved value, **When** a feature reads it, **Then** the default value is returned
4. **Given** the configuration store becomes corrupted, **When** the app starts, **Then** it falls back to default values rather than crashing

---

### User Story 5 - Internationalization (Priority: P2)

The application supports 14+ languages. The user can switch between languages, and all visible UI text updates immediately without restarting the application. Language files are loaded efficiently.

**Why this priority**: Cherry Studio targets a global user base with English and Chinese as primary languages. Language support is core to user experience.

**Independent Test**: Switch the language setting and verify all visible UI text changes to the selected language without restart.

**Acceptance Scenarios**:

1. **Given** the app is running in English, **When** the user switches language to Chinese, **Then** all visible UI text updates to Chinese immediately
2. **Given** a translation key exists in the English file but not in the target language file, **When** that text is displayed, **Then** the English fallback is used
3. **Given** the app launches for the first time, **When** the system locale is detected, **Then** the app defaults to the closest supported language

---

### User Story 6 - Logging and Diagnostics (Priority: P3)

The application maintains structured logs for troubleshooting. Logs are organized by source module, support configurable log levels, and rotate daily to prevent disk space exhaustion. Console output is routed through the centralized logger.

**Why this priority**: Essential for debugging and support, but the app can function without it. Becomes critical during development and issue resolution.

**Independent Test**: Trigger various application events and verify they appear in the log files with correct formatting, timestamps, and source module labels.

**Acceptance Scenarios**:

1. **Given** the logging service is active, **When** an event occurs in any module, **Then** a log entry is created with timestamp, level, source module, and message
2. **Given** the log level is set to "warn", **When** a "debug" message is logged, **Then** it is suppressed and not written to the log file
3. **Given** log files accumulate over time, **When** a new day begins, **Then** a new log file is created and old files are rotated

---

### User Story 7 - Keyboard Shortcuts (Priority: P3)

The application supports global keyboard shortcuts for common actions. Shortcuts can be customized by the user. The system handles conflicts gracefully.

**Why this priority**: Convenience feature that improves power user experience but is not required for basic functionality.

**Independent Test**: Register a shortcut, press the key combination, and verify the associated action is triggered.

**Acceptance Scenarios**:

1. **Given** default shortcuts are configured, **When** the user presses a registered key combination, **Then** the associated action is triggered
2. **Given** the user customizes a shortcut, **When** the new key combination is saved, **Then** the old combination is deregistered and the new one takes effect immediately
3. **Given** the app is minimized or in the background, **When** a global shortcut is pressed, **Then** the action is triggered and the app is brought to focus if needed

---

### Edge Cases

- Portable mode: When launched from a portable executable, all data (config, files, logs) must be stored relative to the executable directory, not the user's home directory
- Linux AppImage: Auto-update behavior differs; file paths and permissions may differ from standard installs
- Duplicate file names: Two files with the same name can coexist because each file gets a unique UUID-based identifier
- Corrupted configuration: If the config store file is corrupted or unreadable, the app must reset to defaults and continue running
- Large file uploads: Files significantly larger than typical attachments must be handled without blocking the UI or exhausting memory
- Missing locale files: If a language file is missing or malformed, the app must fall back to English without crashing
- Custom data directory: Users can configure a custom data directory; the app must validate the path exists and is writable before using it
- Multiple instances: The app should handle single-instance locking to prevent data corruption from concurrent access

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a desktop application shell with a main window, system tray icon, and standard window controls (minimize, maximize, close, resize)
- **FR-002**: System MUST enforce a minimum window size of 1000x600 pixels for the main window
- **FR-003**: System MUST persist window state (size, position, maximized state) across application restarts
- **FR-004**: System MUST provide a typed inter-process communication bridge with a centralized channel registry shared between all processes
- **FR-005**: System MUST enforce context isolation — the UI process MUST NOT have direct access to system-level APIs
- **FR-006**: System MUST provide a file storage service that assigns unique identifiers to uploaded files, copies them to a managed directory, and creates queryable metadata
- **FR-007**: System MUST support file reference counting to track how many entities reference each file
- **FR-008**: System MUST support file upload via file picker dialog, drag-and-drop, clipboard paste, and URL download
- **FR-009**: System MUST provide a configuration persistence service with typed keys, default values, and immediate disk writes
- **FR-010**: System MUST handle corrupted or missing configuration gracefully by resetting to defaults
- **FR-011**: System MUST support internationalization with 14+ languages, with English and Chinese as primary languages
- **FR-012**: System MUST update all visible UI text immediately when the language is changed, without requiring a restart
- **FR-013**: System MUST provide a centralized logging service with configurable log levels (silly, debug, info, warn, error) and daily log rotation
- **FR-014**: System MUST support global keyboard shortcuts that can be customized by the user
- **FR-015**: System MUST support portable mode where all data is stored relative to the executable directory
- **FR-016**: System MUST register a custom protocol (`cherrystudio://`) for deep linking
- **FR-017**: System MUST provide a monorepo structure with shared packages for types, constants, and utilities accessible by all processes
- **FR-018**: System MUST provide a client-side database infrastructure (Dexie/IndexedDB) for renderer-process data persistence. The database schema definitions for specific entities (e.g., Settings KV) are owned by their respective Features
- **FR-019**: System MUST enforce single-instance locking to prevent multiple concurrent instances from causing data corruption
- **FR-020**: System MUST support both light and dark tray icon variants that match the current system theme

### Key Entities

- **FileMetadata**: Represents a stored file with a unique identifier, original name, storage path, file size, extension, MIME type, creation timestamp, reference count, and optional token count and purpose classification
- **Shortcut**: Represents a keyboard shortcut binding with a key identifier, key combination string, editability flag, and enabled state
- **Settings (Key-Value)**: Database infrastructure provided by F001; schema owned by F002-settings-theme

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application launches and displays the main window within 3 seconds on all supported platforms (Windows, macOS, Linux)
- **SC-002**: File upload completes and returns valid metadata within 2 seconds for files up to 50MB
- **SC-003**: All registered IPC channels respond to requests within 100ms under normal operation
- **SC-004**: Language switching updates all visible UI text within 500ms without requiring an application restart
- **SC-005**: Window state (size, position) is correctly restored after application restart with pixel-level accuracy
- **SC-006**: Configuration values persist across 100 consecutive application restart cycles without data loss
- **SC-007**: Log files rotate daily and the logging service handles at least 1000 log entries per second without performance degradation
- **SC-008**: The application runs on Windows 10+, macOS 12+, and Ubuntu 22.04+ without platform-specific issues
- **SC-009**: Corrupted configuration or missing locale files result in graceful fallback behavior (no crashes, no data loss)
- **SC-010**: Custom keyboard shortcuts take effect immediately upon registration without requiring an application restart
