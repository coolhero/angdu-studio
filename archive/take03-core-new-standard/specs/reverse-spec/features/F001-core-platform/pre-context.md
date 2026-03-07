# Pre-Context: Core Platform

**Feature ID**: F001-core-platform
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/index.ts` | Electron main process entry point |
| `src/main/bootstrap.ts` | App initialization sequence |
| `src/main/config.ts` | Configuration constants and defaults |
| `src/main/constant.ts` | Platform constants (NODE_ENV, portable detection) |
| `src/main/ipc.ts` | IPC handler registration hub |
| `src/preload/index.ts` | Preload script (IPC bridge exposing window.api) |
| `packages/shared/IpcChannel.ts` | IPC channel name enum (central registry) |
| `packages/shared/config/constant.ts` | Shared constants across processes |
| `src/renderer/src/App.tsx` | Root React component (app entry) |
| `src/renderer/src/Router.tsx` | Route definitions |
| `src/renderer/src/store/index.ts` | Redux store configuration (source reference) |
| `src/renderer/src/context/` | All context providers |
| `src/renderer/src/i18n/` | Internationalization setup |
| `src/renderer/src/databases/index.ts` | Dexie IndexedDB schema definition |
| `src/main/services/WindowService.ts` | Window creation and lifecycle management |
| `src/main/services/TrayService.ts` | System tray icon and context menu |
| `src/main/services/AppMenuService.ts` | Application menu bar |
| `src/main/services/ThemeService.ts` | Theme management (light/dark/system with nativeTheme) |
| `src/main/services/FileStorage.ts` | File upload, read, write, delete with reference counting |
| `src/main/services/FileSystemService.ts` | File system operations |
| `src/main/services/ConfigManager.ts` | electron-store based configuration persistence |
| `src/main/services/LoggerService.ts` | Winston-based logging with daily rotation |
| `src/main/utils/` | All utility files (init, shell-env, etc.) |
| `electron.vite.config.ts` | Vite-based build configuration for main/preload/renderer |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **IPC architecture, file storage patterns, window management lifecycle, config schemas, i18n setup, and theming logic**
- Do not reference: Redux patterns (migrating to Zustand), Ant Design components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only), React Router definitions (migrating to TanStack Router)
- **Extract**: IPC channel contract definitions, file storage API surface, window management lifecycle, config key schemas, i18n locale structure, theme switching logic, Dexie schema definitions, Electron main process service orchestration
- **Ignore**: Redux store setup (`configureStore`, `createSlice`, `useSelector`, `useDispatch`), Redux Persist configuration, styled-components wrappers, Ant Design `ConfigProvider`/`ThemeProvider`, React Router `<Route>` JSX definitions

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `build/icon.png` | Image | `build/icon.png` | App icon (base) |
| `build/icon.ico` | Image | `build/icon.ico` | Windows app icon |
| `build/icon.icns` | Image | `build/icon.icns` | macOS app icon |
| `build/icons/` | Image | `build/icons/` | Multi-size icons (16x16 to 512x512, ~9 sizes) |
| `build/tray_icon.png` | Image | `build/tray_icon.png` | System tray icon (default) |
| `build/tray_icon_dark.png` | Image | `build/tray_icon_dark.png` | Dark theme tray icon |
| `build/tray_icon_light.png` | Image | `build/tray_icon_light.png` | Light theme tray icon |
| `build/logo.png` | Image | `build/logo.png` | App logo |
| `build/entitlements.mac.plist` | Config | `build/entitlements.mac.plist` | macOS entitlements for code signing |
| `build/nsis-installer.nsh` | Config | `build/nsis-installer.nsh` | Windows NSIS installer customization script |
| `src/renderer/src/assets/fonts/` | Font | `src/renderer/src/assets/fonts/` | Ubuntu, icon-fonts, country-flag-fonts (13 files) |
| `src/renderer/src/assets/styles/` | CSS | `src/renderer/src/assets/styles/` | Global CSS files (13 files) |
| `src/renderer/src/i18n/locales/en-us.json` | i18n | `src/renderer/src/i18n/locales/en-us.json` | English translations |
| `src/renderer/src/i18n/locales/zh-cn.json` | i18n | `src/renderer/src/i18n/locales/zh-cn.json` | Chinese (Simplified) translations |
| `src/renderer/src/i18n/locales/zh-tw.json` | i18n | `src/renderer/src/i18n/locales/zh-tw.json` | Chinese (Traditional) translations |
| `src/renderer/src/i18n/translate/` | i18n | `src/renderer/src/i18n/translate/` | 8 additional language translation JSON files |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `NODE_OPTIONS` | config | No | Node.js memory limit for the Electron process | `--max-old-space-size=8000` |
| `NODE_ENV` | config | No | Runtime environment (development/production) | `production` |
| `CSLOGGER_MAIN_LEVEL` | config | No | Main process log level | `info` |
| `CSLOGGER_RENDERER_LEVEL` | config | No | Renderer process log level | `info` |
| `VITE_MAIN_BUNDLE_ID` | config | No | App bundle ID override for build | `com.kangfenmao.CherryStudio` |
| `XDG_SESSION_TYPE` | platform | No | Linux session type detection (wayland/x11) | `wayland` |
| `XDG_CURRENT_DESKTOP` | platform | No | Linux desktop environment detection | `GNOME` |
| `APPIMAGE` | platform | No | Linux AppImage path (set when running as AppImage) | `/path/to/app.AppImage` |
| `PORTABLE_EXECUTABLE_DIR` | platform | No | Portable mode executable directory (Windows) | `C:\Users\user\Desktop` |

**Shared variables** (defined by other Features but also used here):

None -- F001 is the foundation feature and defines the base environment variables used by other Features.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F001-core-platform provides the foundational Electron shell that all other features build upon. It implements the 3-process architecture (main, preload, renderer) with a typed IPC bridge, file management with encryption support, theming (light/dark/system), i18n with 11 locales, system tray, window management, configuration persistence, centralized logging, Dexie IndexedDB initialization, and platform detection across Windows/macOS/Linux.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | App launch | User launches the app; main process initializes, creates the browser window, loads the renderer, restores last-used state |
| P1 | Theme switching | User changes theme (light/dark/system) in settings; app immediately reflects the new theme across all UI components |
| P1 | File upload | User uploads a file via the UI; file is stored in the app's data directory and a FileMetadata record is created |
| P1 | Config persistence | User modifies settings; changes persist across app restarts via store persistence |
| P2 | System tray | User minimizes the app to system tray; tray icon appears with context menu for restore/quit |
| P2 | Language switch | User changes language in settings; UI updates immediately to selected locale without restart |
| P2 | Keyboard shortcuts | User configures global shortcuts; shortcuts work even when app is not focused |
| P3 | Platform detection | App detects OS platform and adapts behavior (portable mode, AppImage, Wayland vs X11) |
| P3 | Logging | App logs events with configurable levels; logs rotate daily for troubleshooting |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Electron shell lifecycle with main/preload/renderer 3-process architecture and context isolation
- **FR-002**: Typed IPC bridge with centralized channel enum for secure inter-process communication
- **FR-003**: Window management (main window creation, minimize/maximize/close, window state persistence)
- **FR-004**: Configuration persistence using electron-store with typed keys
- **FR-005**: Internationalization (i18n) with i18next supporting 11 locales (3 primary + 8 translated)
- **FR-006**: Theme system (light/dark/system) with native theme sync and CSS variable-based theming
- **FR-007**: File storage service with upload, download, read, write, delete, and encryption support
- **FR-008**: Platform detection for Windows, macOS, and Linux (including portable mode, AppImage, Wayland)
- **FR-009**: Centralized logging system with configurable levels and daily rotation
- **FR-010**: Dexie IndexedDB database initialization and schema management for renderer-side persistence

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: App launches on Windows, macOS, and Linux without errors within 3 seconds
- **SC-002**: IPC calls between renderer and main process complete within 100ms for non-IO operations
- **SC-003**: File upload/download handles files up to 50MB correctly
- **SC-004**: Theme switches reflect in under 200ms with no visual flicker
- **SC-005**: All settings persist correctly across app restarts

### Edge Cases

- Portable mode detection changes file storage paths (user data stored alongside executable)
- System theme change while app is running triggers automatic theme update
- Corrupted config store falls back to defaults gracefully
- Large file operations (>50MB) with progress tracking
- Database schema migration when upgrading from older versions
- Linux AppImage special handling for auto-update and file paths
- Multiple app instances prevented via single-instance lock

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

None -- F001-core-platform is the foundation feature with no upstream dependencies.

### Related Entities (data-model.md draft)

#### Owned Entities

**FileMetadata** -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique file identifier (UUID) |
| name | string | required | Original file name |
| path | string | required | Storage path relative to app data directory |
| size | number | required | File size in bytes |
| ext | string | required | File extension |
| type | string | required | MIME type |
| count | number | optional | Reference count |
| created_at | number | required | Creation timestamp |

**Shortcut** (shared with F008-settings-ui) -- Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| key | string | PK | Shortcut action identifier |
| shortcut | string[] | required | Key combination(s) |
| enabled | boolean | required | Whether shortcut is active |

#### Referenced Entities (owned by other Features)

None -- F001 is the foundation feature.

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `app:*` | App lifecycle, info, paths, backups, proxy, language, launch-at-login |
| IPC | `config:*` | Get/set configuration values |
| IPC | `file:*` | File upload, download, read, write, delete, move, rename, open, base64 |
| IPC | `window:*` | Window show, hide, minimize, maximize, set size, set position |
| IPC | `system:*` | System info, clipboard, screen, device type |
| IPC | `open:*` | Open external URLs and file paths |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

None -- F001 is the foundation feature.

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Electron main process orchestrates 20+ services. Preload script exposes typed API bridge. File storage manages files with UUID IDs and reference counting. ConfigManager wraps electron-store. ThemeService syncs with nativeTheme. WindowService manages multiple BrowserWindow instances.
- **Recommended implementation approach**: Keep the same Electron 3-process architecture and IPC patterns. Replace Redux store initialization with Zustand stores using `persist()` middleware. Set up shadcn/ui + Tailwind CSS 4 theme system with CSS variables (replacing Ant Design ConfigProvider). Use TanStack Router for route definitions (replacing React Router). Keep Dexie for IndexedDB.
- **Caveats**: Redux Persist migrations need a one-time migration strategy to Zustand persist format. Theme system must switch from Ant Design's token-based theming to CSS variable-based theming with Tailwind's dark mode utility.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| IPC channel availability | F002-provider-management | Verify F002 can access config:* IPC channels for provider configuration persistence |
| IPC channel availability | F004-knowledge-base | Verify F004 can access file:* channels for document upload and storage |
| IPC channel availability | F005-ai-chat | Verify F005 can access file:* channels for attachment uploads and app:* for proxy configuration |
| IPC channel availability | F006-mcp-integration | Verify F006 can access app:* and system:* channels for process management |
| Database schema compatibility | F002-provider-management | Verify Dexie schema includes tables needed by F002 (providers, models) |
| Database schema compatibility | F005-ai-chat | Verify Dexie schema includes tables needed by F005 (messages, messageBlocks) |
| Zustand store integration | F002-provider-management | Verify F002's Zustand stores integrate correctly with F001's store initialization and persistence |
| Zustand store integration | F005-ai-chat | Verify F005's Zustand stores integrate correctly with F001's store initialization and persistence |
| Theme system | All Features | Verify CSS variable-based theme system is accessible to all Feature UI components |
| TanStack Router setup | F005-ai-chat | Verify F005's page routes are registered in F001's TanStack Router configuration |
| FileMetadata entity | F005-ai-chat | Verify F005 correctly references FileMetadata for message attachments |
| FileMetadata entity | F004-knowledge-base | Verify F004 correctly references FileMetadata for uploaded documents |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| All Features | IPC change impact | If IPC channel names or signatures change, all consuming Features need modification |
| F002-provider-management | Store change impact | If Zustand store structure or persistence config changes, F002's stores may need migration |
| F005-ai-chat | Store change impact | If Zustand store structure or persistence config changes, F005's stores may need migration |
| F004-knowledge-base | File storage impact | If file storage API or FileMetadata schema changes, F004's document pipeline needs modification |
| All Features | Theme change impact | If CSS variable-based theme system changes, all Features' UI components need verification |
| All Features | Router change impact | If TanStack Router configuration changes, all page-level Features need route verification |
