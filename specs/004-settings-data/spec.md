# Feature Specification: Settings & Data Management

**Feature Branch**: `004-settings-data`
**Created**: 2026-03-09
**Status**: Draft
**Input**: Comprehensive settings management system with 50+ configurable fields, multi-backend backup/restore (local, WebDAV, S3), file management, mini app embedding, keyboard shortcut configuration, and quick phrase management.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Settings Management (Priority: P1)

A user opens the settings page and navigates through categorized sections to configure their app preferences. They change the language to Korean, adjust the send message shortcut to Shift+Enter, set up a custom proxy, and modify display preferences like font size and theme colors. All changes take effect immediately and persist across app restarts.

**Why this priority**: Settings management is the foundational capability — without it, users cannot customize their experience or configure the app to work in their environment.

**Independent Test**: Can be fully tested by opening settings, changing values in each category, restarting the app, and verifying all values persisted correctly.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user opens settings and changes the language to Korean, **Then** the UI language updates immediately without requiring restart [source: B057]
2. **Given** the user is in General settings, **When** they change the send message shortcut to Shift+Enter, **Then** the shortcut is saved and the chat input responds to the new key combination [source: B058]
3. **Given** the user is in General settings, **When** they set proxy mode to "custom" and enter a proxy URL, **Then** all subsequent network requests route through the configured proxy [source: B059]
4. **Given** the user has changed multiple settings, **When** they close and reopen the app, **Then** all settings reflect the previously saved values [source: B056]
5. **Given** the user is in Display settings, **When** they change font size, primary theme color, or code font, **Then** the chat UI reflects these changes immediately [source: B076, B077]
6. **Given** the user is in General settings, **When** they toggle launch on boot or launch to tray, **Then** the system startup behavior changes accordingly [source: B060]

---

### User Story 2 - Backup and Restore (Priority: P1)

A user wants to safeguard their app data by creating backups and restoring from them when needed. They can back up to a local directory, a WebDAV server, or an S3-compatible bucket. Before backing up remotely, they test the connection. When restoring, the system validates the backup data and replaces the current state, then restarts the app.

**Why this priority**: Data protection is critical — users with extensive conversation history, provider configurations, and file attachments need reliable backup/restore to prevent data loss.

**Independent Test**: Can be fully tested by creating a backup to each target, modifying app state, restoring from the backup, and verifying data integrity.

**Acceptance Scenarios**:

1. **Given** the user is in Data settings, **When** they initiate a local backup, **Then** all app data (settings, conversations, files) is exported as a compressed archive to the selected directory [source: B061]
2. **Given** the user has a local backup, **When** they choose to restore it, **Then** the app validates the backup, replaces current state, and restarts with the restored data [source: B062]
3. **Given** the user enters WebDAV credentials, **When** they click "Test Connection", **Then** the connection result is displayed within 5 seconds [source: B065]
4. **Given** a valid WebDAV connection, **When** the user creates a backup, **Then** the archive is uploaded to the WebDAV server and appears in the backup list [source: B063]
5. **Given** the user enters S3 credentials (bucket, region, access key, secret key, endpoint), **When** they click "Test Connection", **Then** the connection result is displayed within 5 seconds [source: B065]
6. **Given** a valid S3 connection, **When** the user creates a backup, **Then** the archive is uploaded to the S3 bucket and appears in the backup list [source: B064]
7. **Given** a backup exists on WebDAV or S3, **When** the user selects it and restores, **Then** the app downloads the archive, validates it, replaces current state, and restarts [source: B062]
8. **Given** a corrupted or incompatible backup file, **When** the user attempts to restore, **Then** the system shows an error message and does not modify current state

---

### User Story 3 - File Management (Priority: P1)

A user uploads files (images, PDFs, documents) to the app for use in conversations. They can browse, rename, move, and delete files through a file management interface. The system tracks file metadata and reference counts.

**Why this priority**: File management underpins conversation attachments, knowledge base documents, and image handling — core functionality that other features depend on.

**Independent Test**: Can be fully tested by uploading files, verifying they appear in the file list, performing rename/move/delete operations, and confirming metadata accuracy.

**Acceptance Scenarios**:

1. **Given** the user is in the file management page, **When** they upload a file, **Then** the file is stored in the app directory with metadata (name, size, type, extension) tracked [source: B066]
2. **Given** files exist in the file list, **When** the user renames a file, **Then** the new name is persisted and displayed [source: B067]
3. **Given** files exist in the file list, **When** the user moves a file to a different directory, **Then** the file path updates and the file is accessible from the new location [source: B067]
4. **Given** a file exists in the file list, **When** the user deletes it, **Then** the file is removed from storage and metadata is cleaned up [source: B067]
5. **Given** the user provides a URL, **When** they initiate a file download, **Then** the file is downloaded and stored with appropriate metadata [source: B068]
6. **Given** an image file, **When** conversion is requested, **Then** the system converts between base64 and binary formats correctly [source: B069]

---

### User Story 4 - Mini App Management (Priority: P2)

A user adds custom web apps as mini apps within the Angdu Studio interface. They can configure each mini app with a name, URL, and icon. Mini apps render in an embedded webview and can be reordered.

**Why this priority**: Mini apps extend functionality by embedding external tools, but they are not essential for core chat operations.

**Independent Test**: Can be fully tested by adding a mini app with a URL, verifying it renders, editing its properties, reordering, and deleting it.

**Acceptance Scenarios**:

1. **Given** the user is in the mini apps page, **When** they add a new mini app with a name and URL, **Then** the mini app appears in the list and renders in an embedded webview [source: B070]
2. **Given** mini apps exist, **When** the user edits a mini app's name or URL, **Then** the changes are saved and reflected immediately [source: B070]
3. **Given** multiple mini apps exist, **When** the user reorders them via drag-and-drop, **Then** the new order persists [source: B070]
4. **Given** a mini app exists, **When** the user deletes it, **Then** it is removed from the list

---

### User Story 5 - Keyboard Shortcut Configuration (Priority: P2)

A user customizes keyboard shortcuts for common actions (e.g., new topic, search, toggle sidebar). The system detects conflicts with existing shortcuts and warns the user before saving.

**Why this priority**: Keyboard shortcuts improve power-user productivity but are not required for basic app operation.

**Independent Test**: Can be fully tested by changing a shortcut, verifying the new binding works, and testing conflict detection.

**Acceptance Scenarios**:

1. **Given** the user is in Shortcuts settings, **When** they view the shortcut list, **Then** all configurable shortcuts are displayed with their current key bindings [source: B071]
2. **Given** the user clicks to reassign a shortcut, **When** they press a key combination, **Then** the new binding is captured and displayed [source: B071]
3. **Given** the new key combination conflicts with an existing shortcut, **When** the user attempts to save, **Then** a warning is shown identifying the conflict [source: B071]
4. **Given** a conflict warning is shown, **When** the user confirms, **Then** the conflicting shortcut is unbound and the new binding is saved

---

### User Story 6 - Quick Phrase Management (Priority: P2)

A user creates, edits, and deletes saved text snippets (quick phrases) for rapid insertion into the chat input. Quick phrases can have labels for easy identification.

**Why this priority**: Quick phrases improve chat efficiency but are a convenience feature, not essential for core operations.

**Independent Test**: Can be fully tested by creating a quick phrase, using it in chat input, editing it, and deleting it.

**Acceptance Scenarios**:

1. **Given** the user is in Quick Phrases settings, **When** they create a new phrase with text and label, **Then** the phrase appears in the list [source: B072]
2. **Given** quick phrases exist, **When** the user is in the chat input and triggers quick phrase insertion, **Then** the phrase text is inserted at the cursor position [source: B072]
3. **Given** a quick phrase exists, **When** the user edits its text or label, **Then** the changes are saved and reflected
4. **Given** a quick phrase exists, **When** the user deletes it, **Then** it is removed from the list

---

### User Story 7 - Sidebar Customization (Priority: P2)

A user configures which icons appear in the sidebar navigation and their display order. They can show or hide specific sidebar items to match their workflow.

**Why this priority**: Sidebar customization improves navigation efficiency but the default layout is functional for all users.

**Independent Test**: Can be fully tested by toggling sidebar icons on/off, reordering them, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** the user is in Display settings, **When** they toggle sidebar icon visibility, **Then** the sidebar updates to show/hide the selected items [source: B073]
2. **Given** sidebar items are visible, **When** the user reorders them, **Then** the new order persists and displays correctly [source: B073]

---

### User Story 8 - App Data Directory Migration (Priority: P2)

A user wants to change where Angdu Studio stores its data (e.g., moving to a larger disk). The system copies all data to the new location and begins using it, with the option to clean up the old location.

**Why this priority**: Data directory migration is an advanced but important capability for users managing disk space.

**Independent Test**: Can be fully tested by changing the data directory, verifying data was copied, and confirming the app works from the new location.

**Acceptance Scenarios**:

1. **Given** the user is in Data settings, **When** they select a new data directory, **Then** the system shows a confirmation dialog with the old and new paths [source: B074]
2. **Given** the user confirms the migration, **When** the copy process starts, **Then** a progress indicator is shown and all data is copied to the new location [source: B074]
3. **Given** the migration completes, **When** the app restarts, **Then** it uses the new data directory and all data is accessible
4. **Given** the migration fails midway, **When** the user is notified, **Then** the app continues using the old directory without data loss

---

### Edge Cases

- What happens when a backup restore encounters data from a newer version of the app?
- How does the system handle concurrent backup/restore operations (prevent double execution)?
- What happens when WebDAV/S3 connection is lost during backup upload?
- What happens when the user sets a keyboard shortcut that conflicts with a system-level shortcut?
- What happens when the selected data migration directory is on a read-only filesystem?
- What happens when a mini app URL is unreachable or returns an error?
- What happens when file upload exceeds available disk space?
- What happens when settings are corrupted on disk?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System SHALL provide a settings UI with categorized sections including General, Display, Data, Shortcuts, Quick Phrases, and About [source: B056]
- **FR-002**: System SHALL persist all settings changes immediately to storage without requiring an explicit save action [source: B056]
- **FR-003**: System SHALL support changing the application language with immediate UI update and persistence across restarts [source: B057]
- **FR-004**: System SHALL provide configurable send message shortcut with options including Enter, Shift+Enter, Ctrl+Enter, Command+Enter, and Alt+Enter [source: B058]
- **FR-005**: System SHALL support proxy configuration with three modes: system, custom (with URL), and none [source: B059]
- **FR-006**: System SHALL support configuring launch on boot and launch to tray behaviors [source: B060]
- **FR-007**: System SHALL support backup of all app data (settings, conversations, files) to a local directory as a compressed archive [source: B061]
- **FR-008**: System SHALL support restoring app state from a local backup with data validation and app restart [source: B062]
- **FR-009**: System SHALL support backup and restore to/from WebDAV servers with create, list, delete, and restore operations [source: B063]
- **FR-010**: System SHALL support backup and restore to/from S3-compatible storage with create, list, delete, and restore operations [source: B064]
- **FR-011**: System SHALL verify WebDAV/S3 connectivity before allowing backup operations [source: B065]
- **FR-012**: System SHALL support file upload to app storage with metadata tracking (name, size, type, extension, creation date, reference count) [source: B066]
- **FR-013**: System SHALL support file operations including read, delete, rename, and move for files and directories [source: B067]
- **FR-014**: System SHALL support downloading files from URLs and storing them with appropriate metadata [source: B068]
- **FR-015**: System SHALL support converting images between base64 and binary formats [source: B069]
- **FR-016**: System SHALL support managing mini apps with CRUD operations (add, edit, remove) and drag-and-drop reordering [source: B070]
- **FR-017**: System SHALL support configuring keyboard shortcuts with conflict detection and resolution [source: B071]
- **FR-018**: System SHALL support managing quick phrases with CRUD operations (create, read, update, delete) for chat text insertion [source: B072]
- **FR-019**: System SHALL support configuring sidebar icon visibility and display order [source: B073]
- **FR-020**: System SHALL support changing the app data directory with data migration (copy) and progress indication [source: B074]
- **FR-021**: System SHALL support configuring display settings including font size, primary theme color, font family, code font, and message dividers [source: B076, B077]

### Key Entities

- **SettingsState**: Centralized application preferences store containing 50+ configurable fields organized into categories (display, behavior, proxy, code execution, painting provider, translate prompt, user theme). Each field has a defined default value and is immediately persisted on change.
- **FileMetadata**: Represents a stored file with attributes: unique identifier, stored filename, original display name, file system path, size, extension, file type classification (image/video/audio/text/document/other), creation date, reference count, and optional token estimate. Referenced by messages and knowledge base items.
- **BackupConfig**: Configuration for remote backup targets — WebDAV (URL, username, password, path) and S3 (bucket, region, access key, secret key, endpoint).
- **MiniApp**: Embedded web application with identifier, name, URL, and optional icon. Supports user-defined ordering.
- **Shortcut**: Keyboard shortcut binding with identifier, display name, key combination, and associated action. Includes conflict detection across all registered shortcuts.
- **QuickPhrase**: Saved text snippet with identifier, display label, and text content for quick insertion into chat input.
- **SidebarIcon**: Navigation sidebar item with identifier, icon reference, visibility flag, and display order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can change any setting and see the change take effect immediately without restarting the app [source: B056]
- **SC-002**: Users can switch language and the entire UI updates within 1 second [source: B057]
- **SC-003**: Users can complete a full backup-restore round-trip and all data (conversations, settings, files) is identical before and after [source: B061, B062]
- **SC-004**: WebDAV/S3 connection test returns a pass/fail result within 5 seconds of initiation [source: B065]
- **SC-005**: Users can upload a file, see it in the file list, rename it, and confirm the new name persists across sessions [source: B066, B067]
- **SC-006**: Users can add a mini app with a URL and see it render in an embedded view within the app [source: B070]
- **SC-007**: Users can assign a keyboard shortcut, receive a conflict warning if applicable, and the shortcut works immediately after saving [source: B071]
- **SC-008**: Users can create a quick phrase and insert it into the chat input in 2 actions or fewer [source: B072]
- **SC-009**: Users can change the app data directory and have all data accessible from the new location after migration completes [source: B074]
- **SC-010**: Users can customize font size, theme color, and sidebar layout with changes reflected in the UI within 1 second [source: B076, B077, B073]

## Scope

### In Scope

- Settings UI with categorized navigation (General, Display, Data, Shortcuts, Quick Phrases, About)
- Settings persistence via Zustand + electron-store (immediate save)
- Local backup/restore with compressed archive format
- WebDAV and S3 backup/restore with connection testing
- File upload, download, storage, and CRUD operations
- FileMetadata entity management (Dexie)
- Mini app CRUD and embedded webview rendering
- Keyboard shortcut configuration with conflict detection
- Quick phrase CRUD and chat insertion
- Sidebar icon visibility and order configuration
- App data directory migration with progress tracking
- Display settings (font, theme, message dividers)
- Language switching with i18next
- Proxy configuration (system/custom/none)
- Launch on boot / launch to tray configuration
- Image format conversion (base64/binary)

### Out of Scope

- Export conversation to Word document (B075 — deferred P3)
- Nutstore SSO and sync integration (B078 — deferred P3)
- LAN transfer device discovery and file send (B079 — deferred P3)
- Externally installed app detection (B080 — deferred P3)
- Provider/model CRUD operations (owned by F002 ai-provider; F004 only displays provider settings)
- Conversation/message management (owned by F003 chat-core; F004 includes conversation data in backups but does not manage it)
- MCP server settings (owned by F006 mcp-tools)
- Memory settings (owned by F008 memory)
- Agent settings (owned by F009 agents)

## Assumptions

- The app uses Zustand with electron-store persistence middleware for settings (replacing the original Redux pattern)
- FileMetadata is stored in Dexie (IndexedDB), consistent with the F003 chat-core data layer
- Backup archives include all Zustand stores, Dexie databases, and file attachments
- The settings UI uses shadcn/ui components (replacing Ant Design from the original)
- All identifiers use Angdu/AngduStudio naming (not Cherry/CherryStudio)
- Provider settings display in F004 reads from F002's store but does not write to it
- Settings persistence is handled via IPC to the main process electron-store (consistent with F001 app-core patterns)

## Dependencies

- **F001 (app-core)**: IPC bridge for main-process operations (file I/O, backup, system settings), config store, theme system, proxy manager, window management
- **F002 (ai-provider)**: Provider and model entities (read-only access from settings display), provider health check
- **F003 (chat-core)**: Conversation data (topics, messages, blocks) included in backup archive; assistant entity for default settings template
