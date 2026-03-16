# Feature Specification: Settings

**Feature Branch**: `003-settings`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Settings — Central configuration hub for Angdu Studio. Settings page with internal sidebar navigation, sub-pages (General, Display, Data, Shortcuts), keyboard shortcut configuration, quick phrases management, and data export/import/clear. All settings apply immediately without explicit save action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Settings Page Navigation and Immediate Preference Changes (Priority: P1)

A user opens the Settings page from the app navigation. A left sidebar lists categorized sub-pages: General, Display, Data, and Shortcuts. The active sub-page is visually highlighted. The user clicks "General" and sees options for language, navbar position, send key, startup behavior, proxy, and auto-update. Every change takes effect immediately — no save button needed. The user toggles navbar position from "top" to "left" and the app layout restructures instantly without a page reload.

**Why this priority**: Settings is the central control point for the entire application. Without a working settings page and immediate-apply behavior, users cannot configure any preference, blocking all downstream features that depend on user configuration.

**Independent Test**: Open settings, switch between sub-pages, change a setting (e.g., navbar position), and verify the change takes effect immediately and persists after app restart.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Settings page, **When** the page loads, **Then** a left sidebar displays categorized sub-pages (General, Display, Data, Shortcuts) and the default sub-page content is shown [source: B056]
2. **Given** the settings sidebar is visible, **When** the user clicks a sub-page item, **Then** the sidebar highlights the selected item and the content area displays the corresponding sub-page [source: B057]
3. **Given** the user is on the General settings sub-page, **When** they toggle the navbar position from "top" to "left", **Then** the app layout switches from top tab bar to left sidebar mode without page reload [source: B060]
4. **Given** the user changes any setting (toggle, dropdown, input), **When** the change is made, **Then** the new value takes effect within 100ms with no save button required [source: B028]
5. **Given** the user has changed settings, **When** they quit and relaunch the app, **Then** all changed settings are preserved [source: B027]
6. **Given** the user is on the General settings sub-page, **When** they change the default send key from Enter to Ctrl+Enter, **Then** the preference is stored and available to the chat feature [source: B062]
7. **Given** the user is on the General settings sub-page, **When** they toggle auto-update on or off, **Then** the preference is persisted immediately [source: B063]
8. **Given** the user is on the General settings sub-page, **When** they enter proxy settings (host, port, optional credentials), **Then** the proxy configuration is saved and applied to network requests [source: B061]
9. **Given** the user is on the General settings sub-page, **When** they toggle startup behaviors (launch at login, start minimized), **Then** the OS-level startup configuration is updated [source: B059]

---

### User Story 2 - Theme and Display Customization (Priority: P1)

A user wants to personalize the app's visual appearance. They go to the Display settings sub-page and find options for theme (light, dark, system), font size, message style (bubble or plain), avatar style, and code block theme. When they switch from light to dark theme, the entire app repaints with dark colors instantly. The font size slider clamps to safe boundaries so the user cannot set an unusable value.

**Why this priority**: Theme and display settings affect every visual element in the application. Users expect immediate visual feedback and the ability to match their OS preference. This is essential for accessibility and user comfort.

**Independent Test**: Switch theme from light to dark and verify all UI components update. Adjust font size to extremes and verify clamping. Change message style and verify the chat area reflects the change.

**Acceptance Scenarios**:

1. **Given** the user is on the Display settings sub-page, **When** they select "dark" theme, **Then** all UI components repaint with dark colors within 200ms [source: B064]
2. **Given** the user selects "system" theme, **When** the OS switches between light and dark mode, **Then** the app theme follows the OS preference automatically [source: B064]
3. **Given** the user adjusts the font size slider, **When** they drag to an extreme value, **Then** the value is clamped to min/max boundaries and the app text resizes accordingly [source: B065]
4. **Given** the user selects "bubble" message style, **When** they view the chat area, **Then** messages are displayed in bubble format [source: B067]
5. **Given** the user selects a different avatar style, **When** the change is applied, **Then** all avatar displays reflect the new style [source: B066]
6. **Given** the user selects a different code block theme, **When** they view code in chat, **Then** code blocks use the selected theme [source: B068]
7. **Given** the user enters custom CSS in the injection textarea, **When** the CSS is applied, **Then** the UI reflects the custom styles immediately [source: B069]

---

### User Story 3 - Language Selection (Priority: P1)

A user who prefers a non-English language opens General settings and selects their preferred language from a dropdown. All visible UI text updates to the selected language immediately. If a language file is missing or incomplete, the app falls back to English for those strings.

**Why this priority**: Internationalization is fundamental to user accessibility. The language setting affects every text element in the app.

**Independent Test**: Change language to a supported non-English locale and verify all UI labels, buttons, and messages update. Set language to a locale with a missing file and verify English fallback.

**Acceptance Scenarios**:

1. **Given** the user is on the General settings sub-page, **When** they select a different language from the dropdown, **Then** all visible UI text updates to the selected language [source: B058]
2. **Given** a selected language has a missing translation file, **When** the app attempts to load it, **Then** the app falls back to English for all strings
3. **Given** the user changes language, **When** they navigate to other pages, **Then** all pages display text in the selected language

---

### User Story 4 - Data Export, Import, and Clear (Priority: P1)

A user wants to back up their data before a major change. They go to the Data settings sub-page and click Export. The system creates a ZIP archive (named `angdu-studio.YYYYMMDDHHmm.zip`) containing all app state — conversations, settings, and optionally the data directory. Later, the user can Import a backup file; the system validates the file format and shows a warning if the version is incompatible. The user can also Clear all data, but only after confirming in an explicit dialog.

**Why this priority**: Data management is critical for user trust and safety. Users need confidence that they can back up, restore, and reset their data without risk of accidental loss.

**Independent Test**: Export data, verify the ZIP file is created with correct contents. Import the exported file and verify data is restored. Clear data and verify all user data is removed after confirmation.

**Acceptance Scenarios**:

1. **Given** the user clicks Export on the Data sub-page, **When** the export completes, **Then** a ZIP file named `angdu-studio.YYYYMMDDHHmm.zip` is saved to the user-selected location containing all app state [source: B070]
2. **Given** the user selects a valid backup file for Import, **When** the file is parsed, **Then** the data is validated and restored into the app [source: B071]
3. **Given** the user selects an invalid or incompatible backup file, **When** the import is attempted, **Then** a validation error or version mismatch warning is displayed and existing data is not corrupted [source: B071]
4. **Given** the user clicks Clear All Data, **When** the action is triggered, **Then** a confirmation dialog appears asking for explicit confirmation before any data is deleted [source: B072]
5. **Given** the user confirms the Clear action, **When** the clear completes, **Then** all user data is removed and the app resets to defaults
6. **Given** the user cancels the Clear confirmation dialog, **When** the dialog closes, **Then** no data is deleted
7. **Given** the Data sub-page is displayed, **When** the user views the storage location section, **Then** the current data storage path is shown as read-only information [source: B074]
8. **Given** an export is triggered while data is being written elsewhere, **When** the export runs, **Then** a consistent snapshot is produced without corruption

---

### User Story 5 - Keyboard Shortcut Configuration (Priority: P2)

A user wants to customize keyboard shortcuts. They open the Shortcuts sub-page and see a list of all available shortcuts with their current key bindings. Clicking on a shortcut field enters recording mode — the next key combination the user presses is captured as the new binding. If the combo conflicts with an existing shortcut, a warning is shown. The user can reset all shortcuts to defaults.

**Why this priority**: Keyboard shortcuts improve power-user productivity but are not required for basic app functionality. The app works without customized shortcuts.

**Independent Test**: View shortcuts list, click to edit a shortcut, press a key combo, verify it is captured. Set a conflicting combo and verify the warning. Reset to defaults and verify all bindings revert.

**Acceptance Scenarios**:

1. **Given** the user opens the Shortcuts sub-page, **When** the page loads, **Then** all available shortcuts are displayed with their current key bindings [source: B075]
2. **Given** the user clicks on a shortcut binding field, **When** they press a key combination, **Then** the new binding is captured and saved [source: B076]
3. **Given** the user records a key combo that conflicts with another shortcut, **When** the recording completes, **Then** a conflict warning is displayed identifying the conflicting shortcut [source: B076]
4. **Given** the user records a key combo that conflicts with a system shortcut, **When** the recording completes, **Then** a warning is shown but the binding is allowed
5. **Given** the user clicks "Reset to Defaults", **When** the action completes, **Then** all shortcut bindings revert to their original defaults [source: B077]
6. **Given** shortcut bindings are changed, **When** the change is saved, **Then** the main process registers/unregisters the updated shortcuts via IPC [source: B078]

---

### User Story 6 - Backup Configuration Management (Priority: P2)

A user wants to configure their backup preferences. They go to the Data sub-page and set up backup parameters such as the maximum number of retained backups. The configuration is persisted and governs future export operations.

**Why this priority**: Backup configuration enhances the data management experience but is not required for basic export/import to function.

**Independent Test**: Configure backup settings, perform an export, and verify the configuration governs the operation.

**Acceptance Scenarios**:

1. **Given** the user opens the Data settings sub-page, **When** they configure backup settings, **Then** the configuration is saved immediately [source: B073]
2. **Given** backup retention is configured, **When** the user exports data, **Then** the export respects the retention configuration

---

### User Story 7 - Quick Phrases Management (Priority: P3)

A user frequently types the same responses. They go to a Quick Phrases management area within settings and create, edit, reorder, and delete predefined text snippets. These phrases can be searched and inserted into chat input from the chat interface.

**Why this priority**: Quick phrases are a convenience feature that enhances chat productivity but is not required for core settings or chat functionality.

**Independent Test**: Create a quick phrase, verify it appears in the list. Edit and reorder it. Delete it. Search for a phrase by keyword and verify results.

**Acceptance Scenarios**:

1. **Given** the user opens the Quick Phrases management area, **When** they create a new phrase with a title and content, **Then** the phrase is saved and appears in the list [source: B079]
2. **Given** multiple quick phrases exist, **When** the user reorders them via drag or manual ordering, **Then** the new order is persisted [source: B079]
3. **Given** the user edits an existing phrase, **When** they save the changes, **Then** the updated content is persisted [source: B079]
4. **Given** the user deletes a phrase, **When** the deletion is confirmed, **Then** the phrase is removed from the list [source: B079]
5. **Given** the user searches for a phrase by keyword, **When** results are returned, **Then** matching phrases are displayed [source: B080]

---

### Edge Cases

- **Settings corruption**: If the settings store is corrupted or unreadable, the app resets all settings to defaults and displays a notification to the user
- **Incompatible import**: If a backup file is from an incompatible version, a version mismatch warning is shown and the import is rejected without affecting existing data
- **System shortcut conflict**: If a user records a keyboard shortcut that conflicts with an OS-level shortcut, a warning is displayed but the binding is allowed
- **Font size extremes**: Font size values are clamped to defined minimum and maximum bounds to prevent unusable UI
- **Concurrent export**: If an export is triggered while other data writes are in progress, the system ensures a consistent snapshot is produced
- **Missing language file**: If the selected language's translation file is missing or incomplete, the app falls back to English

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a Settings page with a left sidebar navigation containing categorized sub-pages (General, Display, Data, Shortcuts) and a right content area [source: B056]
- **FR-002**: System MUST visually highlight the active sub-page in the settings sidebar and navigate to the corresponding content on click [source: B057]
- **FR-003**: System MUST provide a language selection dropdown that changes the i18n locale and updates all visible UI text immediately [source: B058]
- **FR-004**: System MUST provide toggles for startup behavior: launch at login and start minimized [source: B059]
- **FR-005**: System MUST provide a navbar position toggle that switches between "top" (default, runtime-verified) and "left" layout modes, triggering the layout change without page reload [source: B060]
- **FR-006**: System MUST provide proxy settings input fields for host, port, and optional authentication credentials [source: B061]
- **FR-007**: System MUST provide a default send key configuration option (Enter vs Ctrl+Enter) [source: B062]
- **FR-008**: System MUST provide an auto-update toggle (on/off) [source: B063]
- **FR-009**: System MUST provide theme selection (light, dark, system) with "light" as the default (runtime-verified), updating all UI components instantly on change [source: B064]
- **FR-010**: System MUST provide a font size adjustment control with minimum and maximum clamping to prevent unusable values [source: B065]
- **FR-011**: System MUST provide avatar style selection with visual previews [source: B066]
- **FR-012**: System MUST provide message style options (bubble vs plain mode) [source: B067]
- **FR-013**: System MUST provide a code block theme selection control [source: B068]
- **FR-014**: System MUST provide a custom CSS injection area with immediate visual feedback [source: B069]
- **FR-015**: System MUST export all app state as a ZIP archive named `angdu-studio.YYYYMMDDHHmm.zip`, including conversations, settings, and optionally the data directory [source: B070]
- **FR-016**: System MUST import data from ZIP/BAK backup files, validating format before applying and showing a version mismatch warning for incompatible versions [source: B071]
- **FR-017**: System MUST require explicit user confirmation via a dialog before clearing all data [source: B072]
- **FR-018**: System MUST provide backup configuration management (e.g., retention settings) [source: B073]
- **FR-019**: System MUST display the current data storage location as read-only information [source: B074]
- **FR-020**: System MUST display all available keyboard shortcuts with their current key bindings [source: B075]
- **FR-021**: System MUST allow editing keyboard shortcut bindings via a recording mode that captures key combinations [source: B076]
- **FR-022**: System MUST detect keyboard shortcut conflicts and display a warning identifying the conflicting shortcut [source: B076]
- **FR-023**: System MUST provide a reset-to-defaults action for all keyboard shortcuts [source: B077]
- **FR-024**: System MUST register and unregister shortcut handlers in the main process when bindings change [source: B078]
- **FR-025**: System MUST support CRUD operations on quick phrases (predefined text snippets) with ordering [source: B079]
- **FR-026**: System MUST support searching and inserting quick phrases into chat input [source: B080]
- **FR-027**: System MUST persist all settings via the Config API and ensure they survive app restarts
- **FR-028**: System MUST apply all setting changes immediately without requiring an explicit save action

### Key Entities

- **UserSettings**: Represents all user preferences — theme, language, navbar position, font size, send key, auto-update, proxy configuration, message style, avatar style, code block theme, custom CSS. Stored via Config API.
- **KeyboardShortcut**: Represents a configurable key binding — action identifier, key combination, whether it is the default binding, whether it is a global (OS-level) shortcut.
- **QuickPhrase**: Represents a predefined text snippet — title, content, display order. Managed in settings, consumed by chat input.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any setting change (toggle, dropdown, slider, input) produces a visible effect within 100ms of the user interaction
- **SC-002**: Theme switch from light to dark (or vice versa) results in a full UI repaint with correct colors within 200ms
- **SC-003**: Data export of an app state containing 1000 conversations completes within 5 seconds
- **SC-004**: All settings values persist across app restarts — verified by reading settings after relaunch and confirming they match pre-restart values
- **SC-005**: Changing the navbar position causes the app layout to switch between tab and sidebar modes without a page reload
- **SC-006**: Keyboard shortcut recording captures the key combination and saves it; recording a conflicting combination displays a warning dialog before saving
- **SC-007**: Importing a file with an invalid format displays a validation error and does not alter or corrupt existing data
- **SC-008**: Clicking Clear All Data shows a confirmation dialog; data is only cleared after explicit user confirmation
- **SC-009**: Opening the Settings page displays the settings sidebar with the active sub-page highlighted, and the content area shows the corresponding sub-page content
- **SC-010**: Changing the language setting causes all visible UI text across the application to update to the selected language

## Assumptions

- The app uses the Config API from F001 (app-shell) for all settings persistence, backed by electron-store (JSON file)
- Theme switching uses CSS-level mechanisms (dark mode variant, CSS variables) for instant repainting
- The navigation system from F002 handles the settings page as a standard tab/route
- Language translations are provided as static locale files bundled with the application
- Quick phrases are stored locally and are not synced across devices
- Cloud backup backends (WebDAV, S3) and auto-sync periodic backup are deferred — only local export/import is in scope
- Model Provider settings and MCP Server settings are owned by their respective features (F004, F007) and are out of scope for F003

## Scope

### In Scope

- Settings UI with all sub-pages (General, Display, Data, Shortcuts)
- Settings state management
- Keyboard shortcuts configuration and conflict detection
- Quick phrases CRUD and search
- Data management: export, import, clear
- Integration with F001 Config API and Theme API
- Integration with F002 navigation (settings as tab, navbar position toggle)

### Out of Scope

- Model Provider settings (owned by F004)
- MCP Server settings (owned by F007)
- Per-assistant configuration (owned by F005)
- WebDAV/S3 cloud backup backends (deferred — local-only for core scope)
- Auto-sync periodic backup (deferred)
- Custom themes beyond light/dark/system
