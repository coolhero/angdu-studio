# Feature Specification: App Shell

**Feature Branch**: `001-app-shell`
**Created**: 2026-03-15
**Status**: Draft
**Input**: Electron bootstrap, window management, IPC bridge, system tray, global shortcuts, deep link handling. Foundation for all other features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Launch and Window Management (Priority: P1)

A user launches Angdu Studio for the first time. The application opens a single window centered on their primary display at a comfortable default size (960×600). The window uses a frameless design with a custom title bar that supports drag-to-move. If the user resizes or repositions the window and restarts the application, it remembers the last window state. If the user accidentally launches a second instance, the existing window is focused instead of opening a duplicate.

**Why this priority**: Without a working window and single-instance enforcement, no other feature can function. This is the absolute foundation.

**Independent Test**: Launch the application and verify the window appears. Resize, move, restart, and confirm state is restored. Launch a second instance and confirm the first window is focused.

**Acceptance Scenarios**:

1. **Given** no instance of Angdu Studio is running, **When** the user launches the application, **Then** a frameless window opens at 960×600 centered on the primary display within 2 seconds
2. **Given** the user has resized the window to 1200×800 and moved it, **When** the user quits and relaunches, **Then** the window opens at 1200×800 at the saved position
3. **Given** Angdu Studio is already running, **When** the user launches a second instance, **Then** the existing window is focused within 500ms and no duplicate window is created
4. **Given** the window was maximized when closed, **When** the user relaunches, **Then** the window opens in maximized state
5. **Given** the window was previously positioned on a now-disconnected display, **When** the user relaunches, **Then** the window resets to centered on the primary display
6. **Given** the frameless window is displayed, **When** the user drags the custom title bar area, **Then** the window moves. Interactive elements (buttons, inputs) in the title bar do NOT initiate drag

---

### User Story 2 - IPC Bridge and Cross-Process Communication (Priority: P1)

A developer building features on top of the app shell needs a typed, secure communication channel between the renderer process and the main process. The IPC bridge exposes a well-defined set of methods via the preload script, supporting both request/response (invoke) and event-based (on/send) patterns. All channels are statically defined and type-safe.

**Why this priority**: Every other feature depends on this communication bridge. Without it, the renderer cannot interact with main process services (config, files, theme, etc.).

**Independent Test**: Call an IPC method from the renderer (e.g., get app version) and verify a correct response is returned within acceptable latency.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the renderer invokes a config read operation via IPC, **Then** the response is returned within 10ms
2. **Given** an IPC channel is defined in the type system, **When** the renderer calls it, **Then** the call is type-checked at compile time and whitelisted at runtime
3. **Given** the renderer attempts to call an unregistered IPC channel, **When** the call is made, **Then** it is rejected (not silently ignored)
4. **Given** the main process emits a theme change event, **When** the event is sent, **Then** the renderer receives it via the event-based IPC pattern within 100ms

---

### User Story 3 - Configuration Persistence (Priority: P1)

A user configures application settings (theme, proxy, language, etc.). These settings persist across application restarts. If the configuration store is corrupted, the application starts with safe defaults and logs a warning. When the application is upgraded, stored configuration is migrated to the new schema.

**Why this priority**: Configuration persistence is required by every feature that stores user preferences (settings, model providers, chat behavior).

**Independent Test**: Set a configuration value, restart the app, and verify it is preserved. Corrupt the config store and verify the app recovers with defaults.

**Acceptance Scenarios**:

1. **Given** the user sets theme to "dark", **When** the app is restarted, **Then** the theme preference is "dark"
2. **Given** the configuration store is corrupted or unreadable, **When** the app starts, **Then** all settings reset to defaults and a warning is logged
3. **Given** the app is upgraded from version 1.0 to 2.0 with a schema change, **When** the app starts, **Then** the configuration is migrated to the new schema without data loss
4. **Given** a feature reads config via IPC, **When** a config key does not exist, **Then** the typed default value is returned

---

### User Story 4 - System Tray Integration (Priority: P2)

A user closes the application window. Instead of quitting, the app minimizes to the system tray. The tray icon provides a context menu to show/hide the window or fully quit. Clicking the tray icon toggles window visibility.

**Why this priority**: System tray is a standard desktop app expectation. It enables background operation while keeping the UI dismissible.

**Independent Test**: Close the window and verify the tray icon appears. Click the tray icon and verify the window toggles. Select quit from tray menu and verify the app exits.

**Acceptance Scenarios**:

1. **Given** the app is running with the window visible, **When** the user clicks the window close button, **Then** the window hides and the tray icon remains visible
2. **Given** the window is hidden, **When** the user clicks the tray icon, **Then** the window becomes visible and focused
3. **Given** the tray context menu is open, **When** the user selects "Quit", **Then** the application fully exits with cleanup
4. **Given** the app is running on macOS, Windows, or Linux, **When** the tray icon is created, **Then** it is visible and functional on all three platforms

---

### User Story 5 - Auto-Update (Priority: P2)

The application checks for updates on startup and periodically. When an update is available, the user is notified with download progress. Updates are downloaded in the background and installed on next restart. The user is never forced to update immediately.

**Why this priority**: Auto-update ensures users stay on the latest version with security patches and new features, without manual intervention.

**Independent Test**: Simulate an available update and verify the progress notification appears. Verify the user can dismiss the notification and continue working.

**Acceptance Scenarios**:

1. **Given** the app starts, **When** a newer version is available on the update server, **Then** the user is notified that an update is available
2. **Given** an update is downloading, **When** progress changes, **Then** the renderer displays download progress
3. **Given** an update download is interrupted (network loss), **When** connectivity returns, **Then** the download resumes or retries on the next check cycle
4. **Given** an update is ready to install, **When** the user chooses "Install Later", **Then** the update installs on the next app restart

---

### User Story 6 - Utility IPC Services (Priority: P2)

A user or feature needs to interact with the operating system: open a file in the system file manager, open a URL in the default browser, use the clipboard, or open native file dialogs for import/export. These capabilities are exposed through the IPC bridge as utility services.

**Why this priority**: Multiple features (chat attachments, file management, knowledge base import) depend on these OS-level utilities.

**Independent Test**: Call the "open external URL" IPC method and verify the default browser opens. Call the clipboard write/read methods and verify data round-trips.

**Acceptance Scenarios**:

1. **Given** a URL string, **When** the renderer calls the shell open-external IPC method, **Then** the URL opens in the user's default browser
2. **Given** text data, **When** the renderer writes to and reads from the clipboard via IPC, **Then** the same text is returned
3. **Given** the user needs to select a file, **When** a native open dialog is requested via IPC, **Then** a platform-native file picker is displayed and the selected path is returned
4. **Given** a file path, **When** the renderer calls show-in-folder via IPC, **Then** the system file manager opens with the file selected

---

### User Story 7 - Deep Link Handling (Priority: P3)

A user clicks an `angdu://` link in an external application (browser, chat client). If Angdu Studio is already running, the link is routed to the appropriate feature. If the app is not running, it launches and processes the link after initialization.

**Why this priority**: Deep links enable external integrations but are not required for core chat functionality.

**Independent Test**: Register the protocol handler, trigger an `angdu://` link externally, and verify the app receives and routes it.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** an external `angdu://settings` link is activated, **Then** the app focuses and navigates to the settings area
2. **Given** the app is not running, **When** an `angdu://` link is activated, **Then** the app launches and processes the link after initialization completes
3. **Given** the app is still initializing, **When** a deep link arrives, **Then** the link is queued and processed after the app is ready

---

### User Story 8 - Global Shortcuts and Power Management (Priority: P3)

A user registers global keyboard shortcuts to quickly show/hide the app or trigger specific actions regardless of which application has focus. The app also handles system power events (sleep/resume) to pause and resume background tasks gracefully.

**Why this priority**: Global shortcuts and power management are quality-of-life features that enhance the desktop experience but are not critical for core functionality.

**Independent Test**: Register a global shortcut, switch to another application, press the shortcut, and verify the app responds. Suspend the system and resume, verifying background tasks restart.

**Acceptance Scenarios**:

1. **Given** a global shortcut is registered, **When** the user presses the shortcut while another app has focus, **Then** Angdu Studio is activated/toggled
2. **Given** the app is in focus, **When** the app loses focus, **Then** global shortcuts remain active
3. **Given** the system enters sleep mode, **When** the system resumes, **Then** background tasks (update checks, etc.) resume without manual intervention

---

### Edge Cases

- **Second instance with CLI args**: A second instance is launched with command-line arguments (e.g., a file path). The existing instance receives those arguments and handles them.
- **Config corruption**: The configuration store is unreadable (corrupted file, permission issue). The app resets to defaults, logs a detailed warning, and continues starting.
- **Update download interrupted**: Network disconnects during update download. The partial download is discarded or resumed on the next check cycle.
- **Deep link during startup**: An `angdu://` link arrives while the app is still initializing services. The link is queued and processed after all services are ready.
- **Invalid proxy configuration**: The user sets an unreachable proxy. Network operations fall back to a direct connection and a warning is logged.
- **Window offscreen**: The window's saved position is on a display that is no longer connected. The window resets to centered on the primary display.
- **All displays removed except one**: Multiple saved display configurations no longer match. The window resets to the single remaining display.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce single-instance lock. A second launch MUST focus the existing window and forward any CLI arguments to it [source: B002]
- **FR-002**: System MUST create a frameless main window at 960×600 default size, centered on the primary display, with a custom title bar supporting drag-to-move [source: B001, B019, B022]
- **FR-003**: System MUST persist window state (position, size, maximized) and restore it on next launch. If the saved position is offscreen, it MUST reset to centered on the primary display [source: B003, B020]
- **FR-004**: System MUST expose a typed IPC bridge via contextBridge in the preload script, supporting both invoke (request/response) and on/send (event-based) patterns with channel whitelisting [source: B007, B008, B009, B010]
- **FR-005**: System MUST display a system tray icon with a context menu (show/hide window, quit) and click-to-toggle window visibility [source: B023, B024, B025]
- **FR-006**: System MUST support registering global keyboard shortcuts that work regardless of application focus, and unregister them on app quit [source: B026, B027]
- **FR-007**: System MUST check for updates on startup and at a configurable interval, download updates in the background, notify the renderer of download progress, and install on next restart [source: B031, B032, B033]
- **FR-008**: System MUST register the `angdu://` custom protocol and route incoming deep link URLs to the appropriate feature handler, queuing links received during initialization [source: B034, B035]
- **FR-009**: System MUST persist configuration in the main process with typed defaults, a get/set/reset API exposed via IPC, and automatic migration support on version upgrades. Corrupted config MUST reset to defaults with a logged warning [source: B036, B037, B012]
- **FR-010**: System MUST handle power suspend/resume events to pause and resume background tasks (update checks, network polling) [source: B040]
- **FR-011**: System MUST initialize services sequentially on startup and register all IPC handlers before the main window loads content [source: B005, B006]
- **FR-012**: System MUST persist state and clean up resources on before-quit. On macOS activate event, the system MUST show or recreate the main window [source: B004, B003, B028]
- **FR-013**: System MUST expose file system IPC handlers for read, write, and delete operations scoped to the userData directory [source: B011]
- **FR-014**: System MUST expose shell IPC methods for openExternal (URLs), openPath (directories), and showItemInFolder (files) [source: B014]
- **FR-015**: System MUST expose dialog IPC methods for showOpenDialog and showSaveDialog using native platform file pickers [source: B015]
- **FR-016**: System MUST expose clipboard IPC methods for read, write, and readImage [source: B016]
- **FR-017**: System MUST expose theme IPC methods (get/set) and synchronize nativeTheme changes from main to renderer. Default theme is "light" [source: B017]
- **FR-018**: System MUST expose app info IPC methods for querying version, platform paths, and OS detection [source: B018, B030]
- **FR-019**: System MUST provide file-based logging with rotation in the main process [source: B038]
- **FR-020**: System MUST support HTTP and SOCKS proxy configuration applied to network sessions, with fallback to direct connection on invalid config [source: B039]
- **FR-021**: System MUST emit window focus/blur events to the renderer via the event-based IPC pattern [source: B021]
- **FR-022**: System MUST support app relaunch/restart triggered from the renderer via IPC [source: B029]

### Key Entities

- **WindowState**: Represents the persisted window geometry and display state — position (x, y), size (width, height), maximized flag, and display identifier
- **AppConfig**: Represents the application-wide configuration store — key-value pairs with typed defaults, schema version for migration, and last-modified timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application window is visible and interactive within 2 seconds of cold start [source: B001]
- **SC-002**: IPC request/response round-trip completes within 10ms for config read operations [source: B009, B012]
- **SC-003**: Window state (position, size, maximized) is restored correctly after application restart [source: B020]
- **SC-004**: System tray icon is visible and functional (click-to-toggle, context menu) on macOS, Windows, and Linux [source: B023, B024, B025]
- **SC-005**: Second instance launch focuses the existing window within 500ms without creating a duplicate [source: B002]
- **SC-006**: User clicks window close button → window hides to tray (app continues running). User selects "Quit" from tray menu → application exits with cleanup [source: B023, B024]
- **SC-007**: Theme change triggered via IPC reflects in the renderer within 100ms [source: B017]
- **SC-008**: Corrupted configuration store → application starts with all defaults restored and a warning is logged [source: B036]
- **SC-009**: Frameless window custom title bar supports drag-to-move; interactive elements within the title bar do NOT initiate window drag [source: B022]
- **SC-010**: All IPC channels are statically typed at compile time and validated at runtime boundaries [source: B007, B008]

### Assumptions

- The application targets macOS, Windows, and Linux desktop platforms
- The navbarPosition default is "top" (tab mode) as verified at runtime, NOT sidebar mode
- The default theme is "light" as verified at runtime
- The default window size is 960×600 as verified at runtime
- better-sqlite3 is used for configuration persistence (new stack decision), not electron-store
- File system operations via IPC are scoped to the userData directory for security
- The `angdu://` protocol replaces the original `cherry://` protocol
