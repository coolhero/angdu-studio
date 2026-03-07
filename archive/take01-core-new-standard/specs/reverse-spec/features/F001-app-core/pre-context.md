# Pre-Context: App Core

**Feature ID**: F001
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/index.ts` | Electron main process entry point |
| `src/main/ipc.ts` | IPC handler registration hub (~232 channels) |
| `src/main/constant.ts` | App constants, paths, portable detection |
| `src/preload/index.ts` | Preload bridge defining window.api |
| `src/main/services/WindowService.ts` | Window creation and management |
| `src/main/services/FileStorage.ts` | File upload, read, write, image handling |
| `src/main/services/AppService.ts` | App lifecycle (launch on boot, etc.) |
| `src/main/services/ConfigManager.ts` | Electron-store based config management |
| `src/main/services/LoggerService.ts` | Winston-based logging with daily rotation |
| `src/main/services/ShortcutService.ts` | Global keyboard shortcuts |
| `src/main/services/NotificationService.ts` | Desktop notifications |
| `src/main/services/VersionService.ts` | Version info, update channels |
| `src/main/utils/init.ts` | App initialization utilities |
| `src/main/utils/shell-env.ts` | Shell environment resolution |
| `packages/shared/IpcChannel.ts` | IPC channel enum (central registry) |
| `packages/shared/config/constant.ts` | Shared constants |
| `packages/shared/config/types.ts` | Shared IPC payload types |
| `packages/shared/config/logger.ts` | Log level definitions |
| `packages/shared/utils/index.ts` | Shared utility functions |
| `src/renderer/src/types/file.ts` | FileMetadata type definition |
| `src/renderer/src/i18n/` | Internationalization setup and locale files |
| `src/renderer/src/databases/index.ts` | Dexie database schema |
| `electron.vite.config.ts` | Build configuration |
| `electron-builder.yml` | Packaging configuration |
| `pnpm-workspace.yaml` | Monorepo workspace config |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding IPC architecture, file storage patterns, and window management logic
- Do not reference: Redux patterns (migrating to Zustand), Ant Design components (migrating to Shadcn/ui)
- **Extract**: IPC channel contract definitions, file storage API surface, window management lifecycle, config key schemas
- **Ignore**: Styled Components styling, Redux middleware for store sync

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/logo.png` | Image | `src/renderer/src/assets/images/logo.png` | App logo |
| `src/renderer/src/assets/images/avatar.png` | Image | `src/renderer/src/assets/images/avatar.png` | Default avatar |
| `src/renderer/src/assets/images/cherry-text-logo.svg` | Image | `src/renderer/src/assets/images/cherry-text-logo.svg` | Text logo |
| `src/renderer/src/assets/fonts/ubuntu/` | Font | `src/renderer/src/assets/fonts/ubuntu/` | Ubuntu font family (8 TTF files + CSS) |
| `src/renderer/src/assets/fonts/icon-fonts/` | Font | `src/renderer/src/assets/fonts/icon-fonts/` | Custom icon font (WOFF2 + CSS) |
| `src/renderer/src/assets/fonts/country-flag-fonts/` | Font | `src/renderer/src/assets/fonts/country-flag-fonts/` | Country flag emoji font (WOFF2 + CSS) |
| `src/renderer/src/i18n/locales/en-us.json` | i18n | `src/renderer/src/i18n/locales/en-us.json` | English translations |
| `src/renderer/src/i18n/locales/zh-cn.json` | i18n | `src/renderer/src/i18n/locales/zh-cn.json` | Chinese (Simplified) translations |
| `src/renderer/src/i18n/locales/zh-tw.json` | i18n | `src/renderer/src/i18n/locales/zh-tw.json` | Chinese (Traditional) translations |
| `src/renderer/src/i18n/translate/*.json` | i18n | `src/renderer/src/i18n/translate/*.json` | 11 additional language translations |
| `build/icons/` | Image | `build/icons/` | App icons in multiple sizes (16x16 to 1024x1024) |
| `build/icon.ico` | Image | `build/icon.ico` | Windows icon |
| `build/icon.png` | Image | `build/icon.png` | App icon |
| `build/tray_icon.png` | Image | `build/tray_icon.png` | System tray icon |
| `build/tray_icon_dark.png` | Image | `build/tray_icon_dark.png` | Dark mode tray icon |
| `build/tray_icon_light.png` | Image | `build/tray_icon_light.png` | Light mode tray icon |
| `src/renderer/src/assets/styles/` | CSS | `src/renderer/src/assets/styles/` | Base CSS files |

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `NODE_OPTIONS` | config | No | Node.js memory limit | `--max-old-space-size=8000` |
| `VITE_MAIN_BUNDLE_ID` | config | No | Electron bundle ID | `com.kangfenmao.CherryStudio` |
| `CSLOGGER_MAIN_LEVEL` | config | No | Main process log level | `info` |
| `CSLOGGER_RENDERER_LEVEL` | config | No | Renderer log level | `info` |

---

## For /speckit.specify

### Existing Feature Summary

App Core provides the foundational Electron infrastructure: main process entry, IPC bridge with 232+ typed channels, file storage system with reference counting, window management (main + mini + selection + trace windows), configuration persistence via electron-store, centralized logging, keyboard shortcuts, desktop notifications, i18n (14+ languages), and the monorepo package structure.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | App Launch | User launches app; main window opens with correct theme, language, and last-used state restored |
| P1 | File Upload | User attaches a file to chat; file is copied to app data, metadata created with UUID |
| P1 | Window Management | User minimizes/maximizes/closes; window state persisted. Tray icon available |
| P2 | Language Switch | User changes language in settings; UI updates immediately to selected locale |
| P2 | Keyboard Shortcuts | User presses configured shortcut; corresponding action triggers |
| P2 | Auto Update | App checks for updates on launch; user can download and install |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Establish Electron main process with context-isolated renderer and typed IPC bridge
- **FR-002**: Implement file storage service with UUID-based IDs, upload, read, write, delete, and reference counting
- **FR-003**: Implement window management (main window, mini window shell, tray icon with dark/light variants)
- **FR-004**: Implement configuration persistence using electron-store with typed keys
- **FR-005**: Implement centralized logging service with daily rotation and configurable log levels
- **FR-006**: Implement i18n with i18next supporting 14+ language files
- **FR-007**: Implement global keyboard shortcut management
- **FR-008**: Set up monorepo structure with shared packages (shared, aiCore, mcp-trace)
- **FR-009**: Implement Dexie/IndexedDB database schema for renderer-side persistence
- **FR-010**: Implement custom protocol handler (`cherrystudio://`) for deep linking

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: App launches and displays main window within 3 seconds on all platforms (Windows/Mac/Linux)
- **SC-002**: File upload creates a valid FileMetadata record and copies file to app data directory
- **SC-003**: All 232+ IPC channels are registered with type-safe handlers and preload bridge
- **SC-004**: Language switch updates all visible UI text without app restart
- **SC-005**: Window state (size, position, maximized) persists across app restarts

### Edge Cases

- Portable mode: app data stored next to executable (PORTABLE_EXECUTABLE_DIR)
- Linux AppImage: special handling for auto-update and file paths
- File upload with duplicate names: UUID ensures uniqueness
- Corrupted config store: fallback to defaults
- Large file uploads: memory-efficient handling needed

---

## For /speckit.plan

### Preceding Feature Dependencies

None — F001 is the foundation with no dependencies.

### Related Entities (data-model.md draft)

#### Owned Entities

**FileMetadata** — See entity-registry.md for full schema (11 fields: id, name, origin_name, path, size, ext, type, created_at, count, tokens, purpose)

**Shortcut** — See entity-registry.md (4 fields: key, shortcut, editable, enabled, system)

**Settings (KV)** — Dexie key-value store (2 fields: id, value)

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | app:info | Get app info (version, paths, arch) |
| IPC | app:select | Show file/folder picker dialog |
| IPC | app:set-language | Set app language |
| IPC | app:set-theme | Set theme mode |
| IPC | app:check-for-update | Check for app updates |
| IPC | file:select | Select files via dialog |
| IPC | file:upload | Upload file to app storage |
| IPC | file:read | Read file content by ID |
| IPC | file:write | Write content to file |
| IPC | file:delete | Delete file by ID |
| IPC | file:download | Download file from URL |
| IPC | config:get | Get config value by key |
| IPC | config:set | Set config value |
| IPC | window:minimize/maximize/close | Window controls |
| IPC | shortcuts:update | Update keyboard shortcuts |
| IPC | zip:compress/decompress | Data compression |
| IPC | system:getDeviceType | Get device info |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Electron main process orchestrates 30+ services. Preload script exposes typed API bridge. File storage manages files with UUID IDs and reference counting. ConfigManager wraps electron-store.
- **Recommended implementation approach**: Keep the same Electron architecture. Replace Redux store initialization with Zustand. Set up Shadcn/ui + TailwindCSS theme system. Use better-sqlite3 instead of LibSQL for Drizzle. Keep Dexie for IndexedDB.
- **Caveats**: The 199 Redux persist migrations need a one-time migration strategy to Zustand persist format. Consider implementing a migration bridge.

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| IPC channel registry | All Features | Verify all Features' IPC channels are registered in shared IpcChannel enum |
| File storage API | F004, F006 | Verify FileMetadata schema is compatible with chat attachments and knowledge items |
| Config keys | F002 | Verify config key schema matches settings Feature expectations |
| Window management | F013 | Verify mini window and selection window shells are available for utilities Feature |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| All Features | IPC contract | If IPC channel signatures change, all consumers need updates |
| F004 | File storage | If FileMetadata schema changes, message attachment handling needs updates |
| F002 | Config | If config storage mechanism changes, settings persistence is affected |
