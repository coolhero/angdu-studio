# Pre-Context: App Core

**Feature ID**: F001-app-core
**Tier**: Tier 1
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/index.ts` | App entry point, single instance, platform detection |
| `src/main/ipc.ts` | IPC handler registration (280+ handlers) |
| `src/main/services/AppService.ts` | Launch-on-boot, app lifecycle, platform detection |
| `src/main/services/ConfigManager.ts` | Config persistence via electron-store, observer pattern |
| `src/main/services/WindowService.ts` | Window lifecycle, state persistence, crash recovery |
| `src/main/services/ThemeService.ts` | Theme management (Light/Dark/System), OS sync |
| `src/main/services/TrayService.ts` | System tray icon and menu |
| `src/main/services/ShortcutService.ts` | Global keyboard shortcuts |
| `src/main/services/NotificationService.ts` | Desktop notifications |
| `src/main/services/ContextMenu.ts` | Right-click context menus |
| `src/main/services/LoggerService.ts` | Winston logging with rotation |
| `src/main/services/VersionService.ts` | Version tracking |
| `src/main/services/PowerMonitorService.ts` | System sleep/wake events |
| `src/main/services/ReduxService.ts` | Store sync (will become ZustandSyncService) |
| `src/main/services/CacheService.ts` | In-memory LRU cache |
| `src/main/services/ProxyManager.ts` | HTTP/SOCKS proxy configuration |
| `src/preload/index.ts` | Preload bridge via contextBridge |
| `src/preload/preload.d.ts` | Bridge type definitions |
| `packages/shared/IpcChannel.ts` | IPC channel constants (344 members) |
| `packages/shared/config/` | Shared configuration constants |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **IPC architecture, window management lifecycle, config persistence schemas with observer pattern, theme switching logic, tray management, shortcut registration, notification dispatch, logging infrastructure, power monitor events, proxy configuration, preload bridge API surface, and cache eviction logic**
- Do not reference: Redux patterns (migrating to Zustand), Ant Design components (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind CSS 4)
- **Extract**: IPC channel contract definitions (344 members), window lifecycle (create, show, hide, minimize, maximize, close, state persistence), config key schemas with observer pattern (subscribe/notify), theme switching logic (Light/Dark/System with OS sync), tray icon management with platform-specific icons, global shortcut registration with per-shortcut enable/disable, desktop notification API, context menu construction, Winston logging with daily rotation, version info retrieval, power monitor suspend/resume handlers, LRU cache get/set/evict, proxy mode configuration (system/fixed_servers/direct), preload bridge typed API exposure
- **Ignore**: Redux store setup (`configureStore`, `createSlice`, `useSelector`, `useDispatch`), Redux Persist configuration, styled-components wrappers, Ant Design `ConfigProvider`/`ThemeProvider`

### SBI Table (B001-B020)

| SBI ID | Behavior | Priority | Description |
|--------|----------|----------|-------------|
| B001 | AppService.setLoginItemSettings | P1 | Sets app to launch on system boot (Windows/Mac/Linux) |
| B002 | ConfigManager.get/set | P1 | Gets/sets persistent config values via electron-store |
| B003 | WindowService.createMainWindow | P1 | Creates and configures main Electron BrowserWindow |
| B004 | WindowService.showWindow/hideWindow | P1 | Shows/hides main window |
| B005 | ThemeService.setTheme | P1 | Applies light/dark/system theme |
| B006 | TrayService.createTray | P1 | Creates system tray icon with menu |
| B007 | ShortcutService.registerShortcuts | P2 | Registers global keyboard shortcuts |
| B008 | ShortcutService.unregisterAllShortcuts | P2 | Unregisters all shortcuts |
| B009 | NotificationService.send | P2 | Sends desktop notification |
| B010 | ContextMenu.buildContextMenu | P2 | Builds right-click context menu |
| B011 | LoggerService.log | P2 | Structured logging with module filters |
| B012 | VersionService.getVersion | P2 | Returns app version info |
| B013 | PowerMonitorService.onSuspend/onResume | P3 | Handles system sleep/wake |
| B014 | ReduxService.selectState | P2 | Selects state from renderer store (will become Zustand equivalent) |
| B015 | ReduxService.dispatch | P2 | Dispatches action to renderer (will become Zustand equivalent) |
| B016 | CacheService.get/set | P3 | In-memory LRU cache |
| B017 | ProxyManager.setProxy | P2 | Configures HTTP/SOCKS proxy |
| B018 | ipc.ts:registerHandlers | P1 | Registers all IPC handlers |
| B019 | preload/index.ts:exposeAPI | P1 | Exposes typed API to renderer |
| B020 | AppService.setAppDataPath | P2 | Sets custom data directory |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `build/icon.icns` | Icon | `build/icon.icns` | macOS app icon |
| `build/icon.ico` | Icon | `build/icon.ico` | Windows app icon |
| `build/icon.png` | Icon | `build/icon.png` | Linux app icon |
| `build/tray_icon.png` | Icon | `build/tray_icon.png` | System tray icon (default) |
| `build/tray_icon_dark.png` | Icon | `build/tray_icon_dark.png` | System tray icon (dark mode) |
| `build/tray_icon_light.png` | Icon | `build/tray_icon_light.png` | System tray icon (light mode) |
| `build/logo.png` | Image | `build/logo.png` | App logo |
| `build/nsis-installer.nsh` | Script | `build/nsis-installer.nsh` | Windows NSIS installer script |
| `resources/cherry-studio/*.html` | HTML | `resources/angdu-studio/*.html` | License, privacy pages; rename directory |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `NODE_ENV` | config | No | Runtime environment (auto-set by build) | `production` |
| `APPIMAGE` | config | No | Linux AppImage path (auto-set) | `/path/to/AppImage` |
| `PORTABLE_EXECUTABLE_DIR` | config | No | Windows portable mode directory (auto-set) | `C:\AngduStudio` |
| `ANGDU_LOGGER_MAIN_LEVEL` | config | No | Main process log level (renamed from CSLOGGER_MAIN_LEVEL) | `info` |
| `HTTP_PROXY` | config | No | HTTP proxy URL | `http://proxy:8080` |
| `HTTPS_PROXY` | config | No | HTTPS proxy URL | `http://proxy:8080` |
| `SOCKS_PROXY` | config | No | SOCKS proxy URL | `socks5://proxy:1080` |

**Shared variables** (defined by other Features but also used here):

None -- F001 is the foundation feature and defines the base environment variables used by other Features.

### Naming Remapping

| Original | Replacement | Location |
|----------|------------|----------|
| `CherryStudio.desktop` | `AngduStudio.desktop` | `src/main/services/AppService.ts` |
| `cherry-studio` in protocol URLs | `angdu-studio` | Protocol handler registration |
| `CHERRY_` env var prefix | `ANGDU_` | All environment variable references |
| `CSLOGGER_MAIN_LEVEL` | `ANGDU_LOGGER_MAIN_LEVEL` | Logger configuration |
| `com.kangfenmao.CherryStudio` | TBD bundle ID | Build config |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F001-app-core provides the foundational Electron shell that all other features build upon. It implements the 3-process architecture (main, preload, renderer) with a typed IPC bridge (344 channel enum members, 280+ registered handlers), window management with state persistence, configuration persistence via electron-store with observer pattern, theming (Light/Dark/System) with OS sync, system tray with platform-specific icons, global keyboard shortcuts with per-shortcut enable/disable, desktop notifications, context menus, centralized logging with Winston and daily rotation, version tracking, power monitor events (suspend/resume), in-memory LRU caching, HTTP/SOCKS proxy configuration, and a preload bridge exposing a typed API to the renderer process. The main process orchestrates 47+ singleton services.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | App launch | User launches the app; main process initializes, creates browser window, loads renderer, restores last-used state |
| P1 | Config persistence | User modifies settings; changes persist across app restarts via electron-store with observer pattern |
| P1 | Theme switching | User changes theme (Light/Dark/System); app immediately reflects the new theme across all windows |
| P1 | IPC communication | Renderer calls typed API via preload bridge; main process handles request and returns result |
| P2 | System tray | User minimizes to tray; platform-specific tray icon appears with show/hide/quit context menu |
| P2 | Keyboard shortcuts | User registers global shortcuts; shortcuts work even when app is not focused |
| P2 | Launch on boot | User enables launch-on-boot; app auto-starts on system login |
| P2 | Proxy config | User configures HTTP/SOCKS proxy; all outbound requests route through proxy |
| P3 | Power events | System goes to sleep; app suspends background tasks and resumes on wake |
| P3 | Desktop notification | App sends notification for background events (e.g., download complete) |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: App must initialize Electron main process with window, tray, and IPC
- **FR-002**: Config must persist across sessions via electron-store
- **FR-003**: Theme switching (light/dark/system) must apply immediately
- **FR-004**: System tray with show/hide/quit actions
- **FR-005**: Global keyboard shortcuts registration
- **FR-006**: Cross-platform launch-on-boot support
- **FR-007**: Proxy configuration support (HTTP/SOCKS)
- **FR-008**: Preload bridge exposing typed API to renderer

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: App launches on Windows, macOS, and Linux without errors within 3 seconds
- **SC-002**: IPC calls between renderer and main process complete within 100ms for non-IO operations
- **SC-003**: Theme switches reflect in under 200ms with no visual flicker
- **SC-004**: All settings persist correctly across app restarts
- **SC-005**: System tray operations (minimize to tray, restore, quit) work correctly on all platforms
- **SC-006**: Global shortcuts register and fire correctly when app is not focused

### Edge Cases

- Portable mode detection changes file storage paths (user data stored alongside executable)
- System theme change while app is running triggers automatic theme update
- Corrupted config store falls back to defaults gracefully
- Crash loops prevented (renderer crash <60s triggers exit instead of reload)
- Linux AppImage special handling for auto-update and file paths
- Proxy bypass for local addresses
- Multiple shortcut registrations for same key combination (last-write-wins)
- Power monitor events during active streaming (pause/resume coordination)

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

None -- F001-app-core is the foundation feature with no upstream dependencies.

### Related Entities (data-model.md draft)

#### Owned Entities

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
| IPC | `app:*` | App lifecycle, info, paths, proxy, language, launch-at-login |
| IPC | `config:*` | Get/set configuration values with observer notifications |
| IPC | `window:*` | Window show, hide, minimize, maximize, set size, set position |
| IPC | `system:*` | System info, clipboard, screen, device type |
| IPC | `open:*` | Open external URLs and file paths |
| IPC | `theme:*` | Theme get/set with OS sync |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

None -- F001 is the foundation feature.

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Electron main process orchestrates 47+ singleton services. Preload script exposes typed API bridge via contextBridge. ConfigManager wraps electron-store with observer pattern (subscribe/notify). ThemeService syncs with nativeTheme and propagates across windows. WindowService manages main window with crash recovery (>60s reload, <60s exit). ReduxService syncs state between main and renderer (will become ZustandSyncService). 344 IPC channel enum members with 280+ registered handlers.
- **Recommended implementation approach**: Keep the same Electron 3-process architecture and IPC patterns. Replace Redux store sync (ReduxService) with Zustand equivalent (ZustandSyncService). Set up shadcn/ui + Tailwind CSS 4 theme system with CSS variables (replacing Ant Design ConfigProvider). All main process services are stack-independent and reusable as-is. IPC channel constants remain unchanged except for naming remaps.
- **Caveats**: ReduxService.selectState and ReduxService.dispatch (B014, B015) must be reimplemented for Zustand. Theme system must switch from Ant Design's token-based theming to CSS variable-based theming with Tailwind's dark mode utility. All CHERRY_/CS prefixed env vars and identifiers must be renamed to ANGDU_/AS equivalents.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| IPC channel availability | F002-ai-provider | Verify F002 can access config:* and app:* IPC channels for provider configuration and proxy |
| IPC channel availability | F003-chat | Verify F003 can access window:*, system:*, and app:* channels for UI operations |
| IPC channel availability | F004-editor | Verify F004 can access system:* channels for clipboard operations |
| Zustand store integration | F003-chat | Verify F003's Zustand stores integrate correctly with F001's store sync service |
| Theme system | All Features | Verify CSS variable-based theme system is accessible to all Feature UI components |
| Proxy configuration | F002-ai-provider | Verify F002's AI API calls respect F001's proxy settings |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| All downstream Features | IPC change impact | If IPC channel names or signatures change, all consuming Features need modification |
| F002-ai-provider | Proxy change impact | If proxy configuration API changes, F002's outbound requests are affected |
| F003-chat | Store sync impact | If ZustandSyncService interface changes, F003's state synchronization needs modification |
| All Features | Theme change impact | If CSS variable-based theme system changes, all Features' UI components need verification |
