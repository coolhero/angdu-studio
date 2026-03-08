# F001-app-core — Pre-Context

**Feature**: Electron shell, window management, IPC bridge, config, theme, auto-update, proxy, tray, system integration
**Release Group**: RG-1 | **Tier**: T1

---

## 1. Runtime Exploration Results

- **Main Window**: BrowserWindow created via `WindowService.createMainWindow()` using `electron-window-state` for persisted size/position. Minimum 1080x600. Mac uses hidden titlebar with traffic lights; Windows/Linux uses frameless with custom title-bar overlay controls.
- **Mini Window**: Secondary compact window (550x400 default) for quick assistant, toggleable and pinnable.
- **Tray**: System tray icon with context menu (show/hide, quick assistant toggle, quit). Mac uses template images; separate dark/light tray icons.
- **Theme**: Three modes — `dark`, `light`, `system`. `ThemeService` syncs `nativeTheme.themeSource` and broadcasts `ThemeUpdated` IPC to all windows, updating title bar overlays.
- **Auto-Update**: `electron-updater` with configurable feed URLs, mirror selection, upgrade channels (latest/rc/beta), multi-language release notes.
- **Proxy**: System/custom/none modes. `ProxyManager` supports SOCKS/HTTP proxies with bypass rules (CIDR, IP, domain, wildcard). Patches `axios`, `undici`, and Electron session.
- **Config**: `electron-store` backed `ConfigManager` with typed getters/setters, subscriber pattern for reactive config changes.
- **Single Instance**: `app.requestSingleInstanceLock()` with second-instance window restoration.
- **Protocol Handler**: Custom `cherry-studio://` deep link protocol for MCP installs and provider imports.
- **Crash Reporter**: Local crash reporting via `crashReporter.start()` with JS call stack collection from unresponsive renderers.

---

## 2. Source Reference

| File | Role |
|------|------|
| `src/main/index.ts` | Main entry: app lifecycle, single instance, crash reporter, service init |
| `src/main/ipc.ts` | IPC channel registration (~60+ handlers) |
| `src/main/bootstrap.ts` | App data directory initialization |
| `src/main/config.ts` | Shared config imports |
| `src/main/constant.ts` | Platform detection (`isMac`, `isWin`, `isLinux`, `isDev`, `isPortable`) |
| `src/main/services/ConfigManager.ts` | `electron-store` wrapper with ConfigKeys enum |
| `src/main/services/WindowService.ts` | Main window + mini window creation and management |
| `src/main/services/ThemeService.ts` | Theme mode handling, nativeTheme sync |
| `src/main/services/TrayService.ts` | System tray icon and context menu |
| `src/main/services/AppUpdater.ts` | Auto-update via electron-updater |
| `src/main/services/ProxyManager.ts` | Proxy configuration (SOCKS, HTTP, bypass rules) |
| `src/main/services/AppMenuService.ts` | macOS application menu |
| `src/main/services/AppService.ts` | App-level utility operations |
| `src/main/services/ShortcutService.ts` | Global keyboard shortcuts |
| `src/main/services/ProtocolClient.ts` | Deep link protocol handling |
| `src/main/services/PowerMonitorService.ts` | System power events |
| `src/main/services/LoggerService.ts` | Structured logging |
| `src/main/services/NotificationService.ts` | System notifications |
| `src/main/services/ContextMenu.ts` | Right-click context menus |
| `src/main/services/SelectionService.ts` | Text selection assistant |
| `src/main/services/WebviewService.ts` | Webview hotkeys and configuration |
| `src/main/services/VersionService.ts` | Version tracking |
| `src/main/services/CacheService.ts` | Cache management |
| `src/preload/index.ts` | Preload bridge: exposes `api` and `electron` objects to renderer |
| `src/renderer/src/App.tsx` | Root React component |
| `src/renderer/src/init.ts` | Renderer initialization |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Source |
|----|----------|----------|--------|
| B001 | Create main BrowserWindow with persisted state (position, size) and platform-specific frame | P1 | `WindowService.createMainWindow()` |
| B002 | Enforce single-instance lock; focus existing window on second launch | P1 | `src/main/index.ts` |
| B003 | Register and handle all IPC channels via `registerIpc()` | P1 | `src/main/ipc.ts` |
| B004 | Expose preload API to renderer via `contextBridge` | P1 | `src/preload/index.ts` |
| B005 | Read/write app config through `electron-store` with typed keys | P1 | `ConfigManager` |
| B006 | Switch theme (dark/light/system) and sync with nativeTheme + title bar overlays | P1 | `ThemeService` |
| B007 | Apply proxy settings (system/custom/none) to Electron session, axios, undici | P1 | `ProxyManager` |
| B008 | Check for updates, download, and install via electron-updater | P2 | `AppUpdater` |
| B009 | Create and manage system tray icon with context menu | P2 | `TrayService` |
| B010 | Handle custom protocol URLs (`cherry-studio://`) for deep linking | P2 | `ProtocolClient` |
| B011 | Register global keyboard shortcuts | P2 | `ShortcutService` |
| B012 | Create/toggle mini window for quick assistant | P2 | `WindowService` |
| B013 | Manage window controls (minimize, maximize, close, fullscreen) | P2 | `WindowService`, IPC handlers |
| B014 | Setup macOS application menu | P3 | `AppMenuService` |
| B015 | Handle app quit lifecycle (cleanup MCP, analytics, API server, OVMS) | P1 | `src/main/index.ts` |

---

## 4. UI Component Features

| AntD Component (Current) | shadcn/ui Replacement | Usage Context |
|---------------------------|----------------------|---------------|
| N/A (custom window chrome) | Custom titlebar component | Window frame controls |
| Menu (tray context) | N/A (native Electron Menu) | System tray |
| Switch, Select | Switch, Select | Settings toggles |

> F001 is primarily main-process; minimal renderer UI beyond window chrome.

---

## 5. Naming Remapping

| Current Identifier | Location | Suggested Replacement |
|--------------------|----------|-----------------------|
| `CherryStudio` (productName, class, name) | `src/main/index.ts` | `AngduStudio` |
| `CherryHQ` (companyName) | `src/main/index.ts` | `AngduHQ` |
| `com.kangfenmao.CherryStudio` (bundle ID) | `src/main/index.ts` | `com.angdu.AngduStudio` |
| `CHERRY_STUDIO_PROTOCOL` | `src/main/services/ProtocolClient.ts` | `ANGDU_STUDIO_PROTOCOL` |
| `HOME_CHERRY_DIR` | `@shared/config/constant` | `HOME_ANGDU_DIR` |
| `Cherry Studio` (tray tooltip) | `src/main/services/TrayService.ts` | `Angdu Studio` |
| `CherryINOAuthService` | `src/main/services/CherryINOAuthService.ts` | `AngduINOAuthService` |
| `cherryai` (preload namespace) | `src/preload/index.ts` | `angduai` |
| `cherryin` (preload namespace) | `src/preload/index.ts` | `angduin` |
| `IpcChannel.CherryIN_*` | IPC channels | `IpcChannel.AngduIN_*` |
| `IpcChannel.Cherryai_*` | IPC channels | `IpcChannel.Angduai_*` |
| `cherry-studio` (protocol scheme) | `ProtocolClient.ts` | `angdu-studio` |

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| App icon | `build/icon.png` | Window icon |
| Tray icons | `build/tray_icon.png`, `build/tray_icon_dark.png`, `build/tray_icon_light.png` | Platform-specific tray icons |
| Logo | `src/renderer/src/assets/images/logo.png` | App logo |
| Text logo SVG | `src/renderer/src/assets/images/cherry-text-logo.svg` | Rename to `angdu-text-logo.svg` |
| i18n locales | `src/renderer/src/i18n/locales/en-us.json`, `zh-cn.json`, `zh-tw.json` | Shared across features |
| Fonts | `src/renderer/src/assets/fonts/` | Custom fonts |

---

## 7. Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `VITE_MAIN_BUNDLE_ID` | Main | App bundle identifier, fallback `com.kangfenmao.CherryStudio` |
| `VITE_RENDERER_INTEGRATED_MODEL` | Renderer | Integrated model configuration |
| `XDG_SESSION_TYPE` | System | Linux Wayland detection |

---

## 8. For /speckit.specify

**Feature Summary**: Electron application shell providing window management, IPC bridge between main and renderer processes, persistent configuration, theme switching, auto-update, proxy management, system tray, and OS integration (deep links, global shortcuts, single instance).

**User Scenarios**:
- US-001: User launches app; main window appears with restored size/position
- US-002: User switches theme from light to dark; all windows update immediately
- US-003: User configures custom proxy; all network requests route through proxy
- US-004: App checks for update on launch; user prompted to install
- US-005: User clicks tray icon to toggle window visibility
- US-006: User opens `angdu-studio://` URL; app processes deep link

**Draft Requirements**:
- FR-001: App SHALL create a single main window with platform-appropriate chrome
- FR-002: App SHALL enforce single-instance execution
- FR-003: App SHALL provide a typed IPC bridge between main and renderer processes
- FR-004: App SHALL persist configuration via electron-store
- FR-005: App SHALL support dark, light, and system theme modes
- FR-006: App SHALL support proxy configuration (system, custom URL, none) with bypass rules
- FR-007: App SHALL check for and apply auto-updates via configurable channels
- FR-008: App SHALL provide system tray with context menu
- FR-009: App SHALL handle custom protocol deep links
- FR-010: App SHALL register configurable global keyboard shortcuts

**Success Criteria**:
- SC-001: Main window opens in under 3 seconds on cold start
- SC-002: Theme switch applies to all open windows within 100ms
- SC-003: Proxy changes take effect without app restart
- SC-004: Second app instance focuses existing window instead of creating new

---

## 9. For /speckit.plan

**Dependencies**:
- No upstream feature dependencies (F001 is foundational)
- Downstream: All features depend on F001 for IPC bridge, config, and window management

**Entity/API Contracts**:
- `AppConfig` — persisted via electron-store with `ConfigKeys` enum
- `ThemeMode` — enum: `dark | light | system`
- `ProxyConfig` — `{ mode: 'system' | 'custom' | 'none', url?: string, bypassRules?: string }`
- IPC contract: `window.api.*` namespace exposed via preload
- IPC channel groups: `App_*`, `Config_*`, `Windows_*`, `System_*`, `Notification_*`, `Zip_*`

---

## 10. For /speckit.analyze

**Cross-Feature Verification Points**:
- F001 <-> F002: Proxy settings must propagate to all AI provider HTTP clients
- F001 <-> F004: Settings page reads/writes config through IPC; config changes must trigger reactive updates
- F001 <-> F005: Theme changes must propagate to chat UI markdown rendering (code highlighting themes)
- F001 <-> F006: MCP servers inherit proxy settings; protocol handler processes `angdu-studio://mcp-install` URLs
- F001 <-> ALL: IPC bridge stability is critical path for all features
- Redux->Zustand migration: `ConfigManager` is main-process only (electron-store); no Redux dependency. But `StoreSyncService` syncs Redux state across windows — must be replaced with Zustand sync mechanism.
