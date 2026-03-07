# Pre-Context: Core Platform

**Feature ID**: F001-core-platform
**Tier**: Tier 1
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/index.ts` | App entry, single instance, platform detection |
| `src/main/services/WindowService.ts` | Window lifecycle, crash recovery, mini window |
| `src/main/services/ConfigManager.ts` | Config persistence, observer pattern |
| `src/main/services/ThemeService.ts` | Theme switching, broadcast |
| `src/main/services/FileStorage.ts` | File operations, upload, watcher |
| `src/main/services/LoggerService.ts` | Winston logging, rotation |
| `src/main/ipc.ts` | IPC handler registration (286 handlers) |
| `src/preload/index.ts` | contextBridge API exposure |
| `packages/shared/IpcChannel.ts` | IPC channel enum (344 members) |
| `src/renderer/src/store/index.ts` | Store configuration |
| `src/renderer/src/store/migrate.ts` | 187 state migrations |
| `src/main/services/AppService.ts` | App lifecycle, platform detection |
| `src/main/services/TrayService.ts` | System tray management |
| `src/main/services/MenuService.ts` | macOS application menu |
| `src/main/services/ProtocolClient.ts` | Deep link protocol handler |
| `src/main/services/ShortcutService.ts` | Global keyboard shortcuts |
| `src/main/services/ProxyManager.ts` | Proxy configuration |
| `src/renderer/src/i18n/` | i18n configuration and locale files |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **IPC architecture, file storage patterns, window management lifecycle, config schemas, i18n setup, theming logic, crash recovery, mini window behavior, tray management, deep link protocol, shortcut registration, and proxy configuration**
- Do not reference: Redux patterns (migrating to Zustand), Ant Design components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only), React Router definitions (migrating to TanStack Router)
- **Extract**: IPC channel contract definitions (344 members), file storage API surface with FileMetadata entity, window management lifecycle (main + mini window), config key schemas with observer pattern, i18n locale structure (11 locales), theme switching logic (Light/Dark/System), Dexie schema definitions with 187 migrations, Electron main process service orchestration, crash recovery logic (>60s reload / <60s exit), tray icon management, deep link protocol handler, global shortcut registration, proxy mode configuration
- **Ignore**: Redux store setup (`configureStore`, `createSlice`, `useSelector`, `useDispatch`), Redux Persist configuration, styled-components wrappers, Ant Design `ConfigProvider`/`ThemeProvider`, React Router `<Route>` JSX definitions

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/` | Mixed | `src/renderer/src/assets/` | App icons, images |
| `resources/` | Mixed | `resources/` | Electron builder resources, platform icons |
| `src/renderer/src/i18n/locales/en-us.json` | i18n | `src/renderer/src/i18n/locales/en-us.json` | English translations |
| `src/renderer/src/i18n/locales/zh-cn.json` | i18n | `src/renderer/src/i18n/locales/zh-cn.json` | Chinese (Simplified) translations |
| `src/renderer/src/i18n/locales/zh-tw.json` | i18n | `src/renderer/src/i18n/locales/zh-tw.json` | Chinese (Traditional) translations |
| `src/renderer/src/i18n/locales/ja-jp.json` | i18n | `src/renderer/src/i18n/locales/ja-jp.json` | Japanese translations |
| `src/renderer/src/i18n/locales/ru-ru.json` | i18n | `src/renderer/src/i18n/locales/ru-ru.json` | Russian translations |
| `src/renderer/src/i18n/locales/de-de.json` | i18n | `src/renderer/src/i18n/locales/de-de.json` | German translations |
| `src/renderer/src/i18n/locales/el-gr.json` | i18n | `src/renderer/src/i18n/locales/el-gr.json` | Greek translations |
| `src/renderer/src/i18n/locales/es-es.json` | i18n | `src/renderer/src/i18n/locales/es-es.json` | Spanish translations |
| `src/renderer/src/i18n/locales/fr-fr.json` | i18n | `src/renderer/src/i18n/locales/fr-fr.json` | French translations |
| `src/renderer/src/i18n/locales/pt-pt.json` | i18n | `src/renderer/src/i18n/locales/pt-pt.json` | Portuguese translations |
| `src/renderer/src/i18n/locales/ro-ro.json` | i18n | `src/renderer/src/i18n/locales/ro-ro.json` | Romanian translations |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `CSLOGGER_MAIN_LEVEL` | config | No | Main process log level | `info` |
| `CSLOGGER_MAIN_SHOW_MODULES` | config | No | Main process log module filter | `WindowService,ConfigManager` |
| `CSLOGGER_RENDERER_LEVEL` | config | No | Renderer process log level | `info` |
| `CSLOGGER_RENDERER_SHOW_MODULES` | config | No | Renderer process log module filter | `store,hooks` |
| `NODE_ENV` | config | No | Runtime environment (auto-set by build) | `production` |
| `VITE_MAIN_BUNDLE_ID` | config | No | App bundle ID override for build | `com.kangfenmao.CherryStudio` |

**Shared variables** (defined by other Features but also used here):

None -- F001 is the foundation feature and defines the base environment variables used by other Features.

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F001-core-platform provides the foundational Electron shell that all other features build upon. It implements the 3-process architecture (main, preload, renderer) with a typed IPC bridge (344 channel enum members, 286 registered handlers), file management with duplicate detection and image compression, theming (Light/Dark/System) with OS sync and multi-window propagation, i18n with 11 locales (en-us, zh-cn, zh-tw, ja-jp, ru-ru, de-de, el-gr, es-es, fr-fr, pt-pt, ro-ro) and dayjs integration, system tray, main and mini window management with crash recovery, configuration persistence with observer pattern, centralized logging with Winston and daily rotation, Dexie IndexedDB initialization with 187 forward migrations, platform detection across Windows/macOS/Linux (including portable mode, Wayland, and AppImage), deep link protocol handling (cherry-studio://), global keyboard shortcuts, and proxy configuration.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | App launch | User launches the app; main process initializes, creates the browser window, loads the renderer, restores last-used state |
| P1 | Theme switching | User changes theme (Light/Dark/System) in settings; app immediately reflects the new theme across all UI components and windows via CSS variables |
| P1 | File upload | User uploads a file via the UI; file is stored with duplicate detection, >1MB images are compressed, and a FileMetadata record is created |
| P1 | Config persistence | User modifies settings; changes persist across app restarts via electron-store with observer pattern notifications |
| P2 | System tray | User minimizes the app to system tray; platform-specific tray icon appears with context menu for restore/quit |
| P2 | Language switch | User changes language in settings; UI updates immediately to selected locale with dayjs integration, no restart required |
| P2 | Mini window (Quick Assistant) | User activates the Quick Assistant; frameless, always-on-top mini window appears centered on the active monitor with auto-hide and pin support |
| P2 | Keyboard shortcuts | User configures global shortcuts; shortcuts work even when app is not focused, with per-shortcut enable/disable |
| P2 | Deep link | User clicks a cherry-studio:// link externally; app receives and handles the protocol action |
| P3 | Platform detection | App detects OS platform and adapts behavior (portable mode, AppImage, Wayland vs X11, macOS application menu) |
| P3 | Logging | App logs events with configurable levels via Winston; logs rotate daily (10MB/30d, error 60d) with context-scoped and renderer-to-main forwarding |
| P3 | Crash recovery | Renderer process crashes; if running >60s app reloads, if <60s app exits to avoid crash loops |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Electron 3-process architecture (main/preload/renderer) with context isolation
- **FR-002**: Typed IPC bridge with centralized channel enum (344 members)
- **FR-003**: Main window management (create, min/max/close, state persistence, platform-specific frame)
- **FR-004**: Mini window (Quick Assistant) -- frameless, always-on-top, auto-hide, pin, multi-monitor centering
- **FR-005**: Single-instance enforcement
- **FR-006**: Configuration persistence with typed keys, observer pattern (subscribe/notify)
- **FR-007**: i18n with 10+ locales, dayjs integration, missing key logging
- **FR-008**: Date/time locale formatting
- **FR-009**: Theme system (Light/Dark/System) with OS sync, multi-window propagation, CSS variable-based
- **FR-010**: File storage (upload with duplicate detection, download, read with encoding detection, write, delete, move, copy, rename, image compression >1MB)
- **FR-011**: FileMetadata entity (UUID id, name, path, size, ext, type, ref count, created_at)
- **FR-012**: File watching (configurable patterns, debounce 1000ms, stability 500ms, max depth 10)
- **FR-013**: Platform detection (macOS/Windows/Linux adaptations, portable mode, Wayland, AppImage)
- **FR-014**: Centralized logging (Winston, daily rotation 10MB/30d, error 60d, context-scoped, renderer-to-main forwarding)
- **FR-015**: Versioned client-side database (Dexie IndexedDB) with forward migrations (187 migrations)
- **FR-016**: System tray (platform icons, context menu, configurable click behavior)
- **FR-017**: macOS application menu (standard menus, i18n labels)
- **FR-018**: Deep link protocol handler (cherry-studio://)
- **FR-019**: Renderer crash recovery (>60s reload, <60s exit)
- **FR-020**: Global keyboard shortcuts (work when unfocused, per-shortcut enable/disable)
- **FR-021**: Proxy configuration (system/fixed_servers/direct modes)
- **FR-022**: Hardware acceleration toggle (requires restart)

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: App launches on Windows, macOS, and Linux without errors within 3 seconds
- **SC-002**: IPC calls between renderer and main process complete within 100ms for non-IO operations
- **SC-003**: File upload/download handles files up to 50MB correctly
- **SC-004**: Theme switches reflect in under 200ms with no visual flicker
- **SC-005**: All settings persist correctly across app restarts
- **SC-006**: System tray operations (minimize to tray, restore, quit) work correctly on all platforms
- **SC-007**: Language switch updates all visible UI text without requiring restart

### Edge Cases

- Portable mode detection changes file storage paths (user data stored alongside executable)
- System theme change while app is running triggers automatic theme update
- Corrupted config store falls back to defaults gracefully
- Large file operations (>50MB) handled without crashing
- Database schema migration when upgrading from older versions (187 migrations)
- Linux AppImage special handling for auto-update and file paths
- Crash loops prevented (renderer crash <60s triggers exit instead of reload)
- Mini window multi-monitor centering (centers on the active monitor, not primary)
- File watcher retry on failure with debounce and stability thresholds
- Proxy bypass for local addresses

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

**Shortcut** -- Refer to the corresponding section in entity-registry.md

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
| IPC | `config:*` | Get/set configuration values with observer notifications |
| IPC | `file:*` | File upload, download, read, write, delete, move, rename, open, base64 |
| IPC | `window:*` | Window show, hide, minimize, maximize, set size, set position, mini window |
| IPC | `system:*` | System info, clipboard, screen, device type |
| IPC | `open:*` | Open external URLs and file paths |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

None -- F001 is the foundation feature.

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Electron main process orchestrates 20+ services. Preload script exposes typed API bridge via contextBridge. File storage manages files with UUID IDs, reference counting, duplicate detection, and >1MB image compression. ConfigManager wraps electron-store with observer pattern (subscribe/notify). ThemeService syncs with nativeTheme and propagates across windows. WindowService manages main and mini (Quick Assistant) windows with crash recovery. 187 state migrations in the renderer store. 344 IPC channel enum members with 286 registered handlers.
- **Recommended implementation approach**: Keep the same Electron 3-process architecture and IPC patterns. Replace Redux store initialization with Zustand stores using `persist()` middleware. Set up shadcn/ui + Tailwind CSS 4 theme system with CSS variables (replacing Ant Design ConfigProvider). Use TanStack Router for route definitions (replacing React Router). Keep Dexie for IndexedDB. Maintain all main process services as-is since they are stack-independent.
- **Caveats**: Redux Persist migrations (187 total) need a one-time migration strategy to Zustand persist format. Theme system must switch from Ant Design's token-based theming to CSS variable-based theming with Tailwind's dark mode utility. Mini window behavior (frameless, always-on-top, auto-hide, pin) is entirely main process logic and stack-independent.

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
| All 11 downstream Features | IPC change impact | If IPC channel names or signatures change, all consuming Features need modification |
| F002-provider-management | Store change impact | If Zustand store structure or persistence config changes, F002's stores may need migration |
| F005-ai-chat | Store change impact | If Zustand store structure or persistence config changes, F005's stores may need migration |
| F004-knowledge-base | File storage impact | If file storage API or FileMetadata schema changes, F004's document pipeline needs modification |
| All Features | Theme change impact | If CSS variable-based theme system changes, all Features' UI components need verification |
| All Features | Router change impact | If TanStack Router configuration changes, all page-level Features need route verification |
