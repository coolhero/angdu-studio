# Pre-Context: Platform Infrastructure

**Feature ID**: F001-platform
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/index.ts` | Main process entry point |
| `src/main/bootstrap.ts` | App initialization sequence |
| `src/main/ipc.ts` | IPC channel handler registration (260+ channels) |
| `src/main/config.ts` | App configuration constants |
| `src/main/constant.ts` | Environment constants (NODE_ENV, portable detection) |
| `src/preload/index.ts` | Preload script (IPC bridge) |
| `packages/shared/IpcChannel.ts` | All IPC channel name constants |
| `src/main/services/WindowService.ts` | Window management |
| `src/main/services/AppService.ts` | App lifecycle management |
| `src/main/services/ThemeService.ts` | Theme management |
| `src/main/services/TrayService.ts` | System tray |
| `src/main/services/ShortcutService.ts` | Keyboard shortcuts |
| `src/main/services/AppUpdater.ts` | Auto-update |
| `src/main/services/FileStorage.ts` | File storage service |
| `src/main/services/FileSystemService.ts` | File system operations |
| `src/main/services/ConfigManager.ts` | Configuration management |
| `src/main/services/ProxyManager.ts` | Proxy configuration |
| `src/main/services/LoggerService.ts` | Main process logging |
| `src/main/services/PowerMonitorService.ts` | Power/shutdown handling |
| `src/main/services/NotificationService.ts` | Desktop notifications |
| `src/main/services/SelectionService.ts` | Text selection service |
| `src/main/services/WebviewService.ts` | Webview management |
| `src/main/services/VersionService.ts` | Version management |
| `src/renderer/src/App.tsx` | Root React component |
| `src/renderer/src/Router.tsx` | Route definitions |
| `src/renderer/src/init.ts` | Renderer initialization |
| `src/renderer/src/databases/index.ts` | Dexie schema definition |
| `src/renderer/src/store/index.ts` | Redux store root |
| `src/renderer/src/store/runtime.ts` | Runtime state slice |
| `src/renderer/src/store/settings.ts` | Settings state slice |
| `src/renderer/src/store/shortcuts.ts` | Shortcuts state slice |
| `src/renderer/src/pages/settings/GeneralSettings.tsx` | General settings page |
| `src/renderer/src/pages/settings/ShortcutSettings.tsx` | Shortcut settings page |
| `src/renderer/src/pages/settings/DisplaySettings.tsx` | Display settings page |
| `src/renderer/src/pages/settings/DataSettings.tsx` | Data settings page |
| `src/renderer/src/pages/settings/AboutSettings.tsx` | About page |
| `src/renderer/src/services/LoggerService.ts` | Renderer logging |
| `src/renderer/src/types/index.ts` | Core type definitions |
| `electron.vite.config.ts` | Build configuration |
| `electron-builder.yml` | Distribution configuration |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Electron 3-process architecture (main/preload/renderer), IPC channel enum pattern, Redux Toolkit slice pattern with selective persistence, electron-vite build configuration, multi-window renderer entry points
- **Reusable code**:
  - `packages/shared/IpcChannel.ts:IpcChannel` — Centralized IPC channel name enum; reuse for type-safe IPC communication
  - `src/main/ipc.ts:registerIpcHandlers` — IPC handler registration pattern with 260+ channels; reuse pattern for modular handler setup
  - `src/main/services/WindowService.ts:WindowService` — Multi-window management with BrowserWindow factory; reuse for window lifecycle control
  - `src/main/services/ThemeService.ts:ThemeService` — Theme switching with nativeTheme sync; reuse for light/dark/system theme support
  - `src/main/services/TrayService.ts:TrayService` — System tray with context menu; reuse for tray icon management
  - `src/main/services/ShortcutService.ts:ShortcutService` — Global shortcut registration with accelerator strings; reuse for keyboard shortcut system
  - `src/main/services/AppUpdater.ts:AppUpdater` — electron-updater integration with channel selection; reuse for auto-update pipeline
  - `src/main/services/ProxyManager.ts:ProxyManager` — HTTP/HTTPS/SOCKS proxy with system detection; reuse for proxy configuration
  - `src/renderer/src/store/index.ts:store` — Redux store with redux-persist selective whitelist and migration; reuse for state management infrastructure
  - `src/renderer/src/store/settings.ts:settingsSlice` — Settings state slice with persistence; reuse as pattern for all persisted slices
  - `src/renderer/src/databases/index.ts:db` — Dexie database with versioned schema; reuse for IndexedDB management pattern

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated — they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `build/icon.png` | Image | `build/icon.png` | App icon (base) |
| `build/icon.ico` | Image | `build/icon.ico` | Windows app icon |
| `build/icon.icns` | Image | `build/icon.icns` | macOS app icon |
| `build/icons/` | Image | `build/icons/` | Multi-size icons (9 sizes: 16x16 to 512x512) |
| `build/tray_icon.png` | Image | `build/tray_icon.png` | System tray icon (default) |
| `build/tray_icon_dark.png` | Image | `build/tray_icon_dark.png` | Dark theme tray icon |
| `build/tray_icon_light.png` | Image | `build/tray_icon_light.png` | Light theme tray icon |
| `build/logo.png` | Image | `build/logo.png` | App logo |
| `build/entitlements.mac.plist` | Config | `build/entitlements.mac.plist` | macOS entitlements for code signing |
| `build/nsis-installer.nsh` | Config | `build/nsis-installer.nsh` | Windows NSIS installer customization script |
| `src/renderer/src/assets/fonts/` | Font | `src/renderer/src/assets/fonts/` | Ubuntu, icon, and flag fonts (13 files) |
| `src/renderer/src/assets/styles/` | CSS | `src/renderer/src/assets/styles/` | Global stylesheets (13 files) |
| `src/renderer/src/assets/images/logo.png` | Image | `src/renderer/src/assets/images/logo.png` | App logo for UI display |
| `src/renderer/src/assets/images/cherry-text-logo.svg` | Image | `src/renderer/src/assets/images/cherry-text-logo.svg` | Text logo SVG |
| `src/renderer/src/assets/images/avatar.png` | Image | `src/renderer/src/assets/images/avatar.png` | Default user avatar |
| `src/renderer/src/i18n/locales/` | i18n | `src/renderer/src/i18n/locales/` | 3 locale files (en-us, zh-cn, zh-tw) |
| `resources/cherry-studio/` | HTML | `resources/cherry-studio/` | Legal pages (license, privacy, releases) |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here — only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `NODE_OPTIONS` | config | No | Node.js memory limit for the Electron process | `--max-old-space-size=8000` |
| `CSLOGGER_MAIN_LEVEL` | config | No | Main process log level | `info` |
| `CSLOGGER_RENDERER_LEVEL` | config | No | Renderer process log level | `info` |
| `VITE_MAIN_BUNDLE_ID` | config | No | App bundle ID override for build | `com.kangfenmao.CherryStudio` |

**Shared variables** (defined by other Features but also used here):

None — F001 is the foundation feature and defines the base environment variables used by other Features.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F001-platform provides the foundational Electron shell that all other features build upon. It implements the 3-process architecture (main, preload, renderer) with a typed IPC bridge spanning 260+ channels, file management, theming, global shortcuts, system tray, auto-update, multi-window support, proxy configuration, and the settings UI framework. It also initializes the Dexie IndexedDB database and the Redux store with selective persistence.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | App launch | User launches the app; main process initializes, creates the browser window, loads the renderer, and displays the main UI |
| P1 | Theme switching | User changes theme (light/dark/system) in settings; app immediately reflects the new theme across all UI components |
| P1 | File upload | User uploads a file via the UI; file is stored in the app's data directory and a FileMetadata record is created |
| P1 | Settings management | User modifies settings (general, display, data, shortcuts); changes persist across app restarts via Redux persistence |
| P2 | System tray | User minimizes the app to system tray; tray icon appears with context menu for restore/quit |
| P2 | Auto-update | App checks for updates on startup; user is notified of available updates and can install them |
| P2 | Keyboard shortcuts | User configures global shortcuts for common actions; shortcuts work even when app is not focused |
| P2 | Proxy configuration | User sets HTTP/HTTPS/SOCKS proxy; all outgoing network requests route through the configured proxy |
| P3 | Multi-window | User opens mini window or selection toolbar; secondary windows communicate with main window via IPC |
| P3 | Data export/import | User exports app data as backup or imports from a previous backup |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Multi-platform Electron shell with main/preload/renderer process architecture
- **FR-002**: Typed IPC bridge with 260+ channels for secure inter-process communication
- **FR-003**: File management system (upload, download, read, write, delete, move, rename)
- **FR-004**: Theme system (light/dark/system) with native theme sync
- **FR-005**: Global keyboard shortcuts with customization
- **FR-006**: System tray integration with minimize-to-tray
- **FR-007**: Auto-update system with channel selection (stable/test)
- **FR-008**: Multi-window support (main, mini, selection toolbar, selection action, trace)
- **FR-009**: Proxy configuration (HTTP/HTTPS/SOCKS) with system proxy detection
- **FR-010**: Settings UI framework (reusable layout components used by other Features)
- **FR-011**: Dexie (IndexedDB) database initialization and schema management
- **FR-012**: Redux store with selective persistence and migration support

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: App launches on Windows, macOS, and Linux without errors
- **SC-002**: IPC calls between renderer and main process complete within 100ms for non-IO operations
- **SC-003**: File upload/download handles files up to 50MB
- **SC-004**: Theme switches in under 200ms
- **SC-005**: Auto-update detects new versions and downloads in background
- **SC-006**: All settings persist correctly across app restarts
- **SC-007**: System tray icon renders correctly on all three platforms
- **SC-008**: Global shortcuts register and trigger correctly even when app is not focused

### Edge Cases

- Portable mode detection changes file storage paths (user data stored alongside executable)
- System theme change while app is running triggers automatic theme update
- Power/shutdown events handled gracefully (save state before exit)
- Proxy configuration with authentication credentials
- NSIS installer handles upgrade from previous version (preserving user data)
- Multiple app instances prevented via single-instance lock
- Large file operations (>50MB) with progress tracking
- Database schema migration when upgrading from older versions

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

None — F001-platform is the foundation feature with no upstream dependencies.

### Related Entities (data-model.md draft)

#### Owned Entities

**FileMetadata** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique file identifier |
| name | string | required | Original file name |
| path | string | required | Storage path relative to app data directory |
| size | number | required | File size in bytes |
| ext | string | required | File extension |
| type | string | required | MIME type |
| count | number | optional | Reference count |
| created_at | number | required | Creation timestamp |

**Shortcut** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| key | string | PK | Shortcut action identifier |
| shortcut | string[] | required | Key combination(s) |
| enabled | boolean | required | Whether shortcut is active |

**User** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | User identifier |
| name | string | required | Display name |
| avatar | string | optional | Avatar image path |

**AppInfo** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| version | string | required | App version |
| isPackaged | boolean | required | Whether running as packaged build |
| appPath | string | required | App installation path |
| appDataPath | string | required | User data directory path |
| platform | string | required | Operating system platform |
| arch | string | required | CPU architecture |

#### Referenced Entities (owned by other Features)

None — F001 is the foundation feature.

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `app:*` (46 channels) | App lifecycle, info, paths, backups, proxy, language, launch-at-login |
| IPC | `file:*` (46 channels) | File upload, download, read, write, delete, move, rename, open, base64 |
| IPC | `window:*` (8 channels) | Window show, hide, minimize, maximize, set size, set position |
| IPC | `open:*` (2 channels) | Open external URLs and file paths |
| IPC | `config:*` (2 channels) | Get/set configuration values |
| IPC | `notification:*` (2 channels) | Show desktop notifications |
| IPC | `webview:*` (4 channels) | Webview management |
| IPC | `miniwindow:*` (5 channels) | Mini window operations |
| IPC | `system:*` (7 channels) | System info, clipboard, screen |
| IPC | `shortcuts:*` (1 channel) | Shortcut registration |
| IPC | `zip:*` (2 channels) | Zip/unzip operations |
| IPC | `export:*` (1 channel) | Data export |
| IPC | `aes:*` (2 channels) | AES encryption/decryption |
| IPC | `search-window:*` (3 channels) | Search window management |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

None — F001 is the foundation feature.

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Electron 3-process architecture with typed IPC enum; Redux Toolkit createSlice with selective redux-persist whitelist; electron-vite for unified build; Dexie for IndexedDB with versioned schema migrations
- **Existing libraries**: `electron` — App shell and native OS integration; `electron-updater` — Auto-update with GitHub/generic releases; `electron-vite` — Unified Vite-based build for main/preload/renderer; `dexie` — IndexedDB wrapper with schema versioning; `@reduxjs/toolkit` — State management with slices; `redux-persist` — Selective state persistence to localStorage; `antd` — UI component library; `i18next` — Internationalization
- **Existing architecture decisions**: IPC channels centralized in shared package for type safety across processes; Window management abstracted into WindowService with factory pattern; Theme follows system preference with manual override; File storage uses content-addressable paths in app data directory

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| IPC channel availability | F002-ai-foundation | Verify F002 can access file:* and config:* IPC channels for API key storage and provider config |
| IPC channel availability | F003-chat | Verify F003 can access file:* channels for attachment uploads and app:* for proxy configuration |
| IPC channel availability | F004-knowledge | Verify F004 can access file:* channels for document upload and storage |
| Database schema compatibility | F002-ai-foundation | Verify Dexie schema includes tables needed by F002 (providers, models, assistants, topics) |
| Database schema compatibility | F003-chat | Verify Dexie schema includes tables needed by F003 (messages, messageBlocks) |
| Redux store integration | F002-ai-foundation | Verify F002's Redux slices integrate correctly with F001's store configuration and persistence |
| Redux store integration | F003-chat | Verify F003's Redux slices integrate correctly with F001's store configuration and persistence |
| Settings UI framework | F002-ai-foundation | Verify F002's provider/model settings pages use F001's settings layout components |
| Settings UI framework | F004-knowledge | Verify F004's doc processing settings page uses F001's settings layout components |
| FileMetadata entity | F003-chat | Verify F003 correctly references FileMetadata for message attachments |
| FileMetadata entity | F004-knowledge | Verify F004 correctly references FileMetadata for uploaded documents |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F002-ai-foundation | IPC change impact | If IPC channel names or signatures change, F002's provider/model management calls need modification |
| F003-chat | IPC change impact | If file:* or app:* IPC channels change, F003's attachment handling and proxy usage need modification |
| F004-knowledge | IPC change impact | If file:* IPC channels change, F004's document upload pipeline needs modification |
| F002-ai-foundation | Store change impact | If Redux store structure or persistence config changes, F002's slices may need migration updates |
| F003-chat | Store change impact | If Redux store structure or persistence config changes, F003's slices may need migration updates |
| F004-knowledge | Store change impact | If Redux store structure or persistence config changes, F004's slices may need migration updates |
| F002-ai-foundation | Database change impact | If Dexie schema versioning changes, F002's entity tables need schema migration alignment |
| F003-chat | Database change impact | If Dexie schema versioning changes, F003's entity tables need schema migration alignment |
| All Features | Theme change impact | If theme CSS variables or theme switching mechanism changes, all Features' UI components need verification |
| All Features | Settings UI change impact | If settings layout components change, all Features' settings pages need verification |
