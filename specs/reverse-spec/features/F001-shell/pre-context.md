# F001-shell Pre-Context

> Feature: Electron window management, custom titlebar, tray icon, app lifecycle, native menus, IPC infrastructure, single-instance lock, auto-start
> Tier: 1 | SBI Range: B001–B045

---

## 1. Runtime Exploration Results

Reference: `specs/reverse-spec/runtime-exploration.md`

- **Shell frame visible on all screens**: Top navbar with tab bar, window controls (min/max/close on Win/Linux; traffic lights on macOS)
- **Navigation**: Hash-based routing (`#/route`), top-level tab bar (Home, Assistant Library, Files, Notes, Knowledge Base, Paintings, Translate, Code, Apps, Settings)
- **Window default**: 960x600 (MIN_WINDOW_WIDTH x MIN_WINDOW_HEIGHT), resizable
- **Theme-aware titlebar**: Dark overlay `{ height: 42, color: 'rgba(0,0,0,0.02)', symbolColor: '#fff' }` / Light overlay `{ height: 42, color: 'rgba(255,255,255,0)', symbolColor: '#000' }`
- **Tray**: Configurable via settings, tooltip "Cherry Studio"
- **Mini window (Quick Assistant)**: 550x400 default, always-on-top, frameless, preloaded on macOS
- **Single instance**: Enforced via `app.requestSingleInstanceLock()`
- **Protocol**: `cherrystudio://` deep link

---

## 2. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| `src/main/index.ts` | Main process entry, app lifecycle orchestration | `[TBD]` |
| `src/main/bootstrap.ts` | Pre-ready data dir init, occupied dirs copy | `[TBD]` |
| `src/main/config.ts` | DATA_PATH, titlebar overlay configs, global secrets | `[TBD]` |
| `src/main/ipc.ts` | IPC handler registration (1178 lines, all ipcMain.handle calls) | `[TBD]` |
| `src/main/services/WindowService.ts` | BrowserWindow creation, main/mini window lifecycle | `[TBD]` |
| `src/main/services/TrayService.ts` | System tray icon, context menu | `[TBD]` |
| `src/main/services/AppMenuService.ts` | macOS native application menu | `[TBD]` |
| `src/main/services/AppService.ts` | Auto-start / login item management | `[TBD]` |
| `src/main/services/ShortcutService.ts` | Global keyboard shortcuts registration | `[TBD]` |
| `src/main/services/ConfigManager.ts` | Persistent config store (electron-store) | `[TBD]` |
| `src/preload/index.ts` | Context bridge: exposes `window.api` and `window.electron` | `[TBD]` |
| `packages/shared/IpcChannel.ts` | IPC channel enum (432 values) | `[TBD]` |
| `electron-builder.yml` | Build config: appId, protocols, targets, signing | `[TBD]` |

---

## 3. Source Behavior Inventory (SBI)

| ID | Source Location | Behavior | Category |
|----|----------------|----------|----------|
| B001 | `src/main/index.ts:129` | `app.requestSingleInstanceLock()` — enforce single instance, quit duplicate | lifecycle |
| B002 | `src/main/index.ts:137` | `app.whenReady()` — initialize all services on ready | lifecycle |
| B003 | `src/main/index.ts:144` | `electronApp.setAppUserModelId()` — set Windows taskbar identity | lifecycle |
| B004 | `src/main/index.ts:148-150` | Launch-to-tray: hide dock icon before window creation if configured | lifecycle |
| B005 | `src/main/index.ts:152` | `windowService.createMainWindow()` — create primary BrowserWindow | window |
| B006 | `src/main/index.ts:153` | `new TrayService()` — initialize system tray | tray |
| B007 | `src/main/index.ts:156` | `appMenuService.setupApplicationMenu()` — macOS-only app menu | menu |
| B008 | `src/main/index.ts:162-169` | `app.on('activate')` — macOS dock click: show or recreate window | lifecycle |
| B009 | `src/main/index.ts:171` | `registerShortcuts(mainWindow)` — global hotkeys | shortcuts |
| B010 | `src/main/index.ts:173` | `registerIpc(mainWindow, app)` — register all IPC handlers | ipc |
| B011 | `src/main/index.ts:237-243` | `app.on('second-instance')` — show window + handle protocol URL | lifecycle |
| B012 | `src/main/index.ts:249-259` | `app.on('before-quit')` — cleanup selection service, dispose transfers | lifecycle |
| B013 | `src/main/index.ts:261-283` | `app.on('will-quit')` — stop OVMS, analytics, MCP, API server | lifecycle |
| B014 | `src/main/index.ts:47-52` | `crashReporter.start()` — local crash reports | crash |
| B015 | `src/main/index.ts:57-59` | Disable hardware acceleration if config flag set | config |
| B016 | `src/main/index.ts:68-70` | Windows: disable window animations (`wm-window-animations-disabled`) | platform |
| B017 | `src/main/index.ts:76-78` | Linux Wayland: enable `GlobalShortcutsPortal` | platform |
| B018 | `src/main/index.ts:84-87` | Linux: set window class/name to 'CherryStudio' | platform |
| B019 | `src/main/index.ts:97-113` | `web-contents-created` — inject Document-Policy header, handle unresponsive renderer | crash |
| B020 | `src/main/services/WindowService.ts:46-110` | `createMainWindow()` — BrowserWindow with platform-specific frame config | window |
| B021 | `src/main/services/WindowService.ts:112-123` | `setupMainWindow()` — state keeper, maximize, context menu, spellcheck, events | window |
| B022 | `src/main/services/WindowService.ts:137-151` | Renderer crash recovery: reload if >1min since last crash, else exit | crash |
| B023 | `src/main/services/WindowService.ts:179-259` | Window events: zoom factor management on resize/restore/navigate, fullscreen IPC | window |
| B024 | `src/main/services/WindowService.ts:261-316` | Web contents handlers: external link interception, X-Frame-Options removal | window |
| B025 | `src/main/services/WindowService.ts:345-347` | `getMainWindow()` — return main BrowserWindow reference | window |
| B026 | `src/main/services/WindowService.ts:349-409` | Window close behavior: tray-to-close vs quit based on config (Win/Linux/Mac) | window |
| B027 | `src/main/services/WindowService.ts:411-473` | `showMainWindow()` — restore, focus, cross-workspace handling per platform | window |
| B028 | `src/main/services/WindowService.ts:475-497` | `toggleMainWindow()` — toggle visibility (respect fullscreen, tray config) | window |
| B029 | `src/main/services/WindowService.ts:499-588` | `createMiniWindow()` — Quick Assistant popup, always-on-top, preloadable | window |
| B030 | `src/main/services/WindowService.ts:590-651` | `showMiniWindow()` — show on cursor's screen, multi-monitor aware | window |
| B031 | `src/main/services/WindowService.ts:653-679` | `hideMiniWindow()` — platform-specific hide (minimize on Win, hide+dock on Mac) | window |
| B032 | `src/main/services/WindowService.ts:685-692` | `toggleMiniWindow()` — toggle mini window visibility | window |
| B033 | `src/main/services/WindowService.ts:694-696` | `setPinMiniWindow()` — pin mini window to prevent blur-hide | window |
| B034 | `src/main/services/WindowService.ts:702-715` | `quoteToMainWindow()` — send text from mini to main window via IPC | ipc |
| B035 | `src/main/services/TrayService.ts:28-69` | `createTray()` — platform-specific tray icon (template image on Mac), click handlers | tray |
| B036 | `src/main/services/TrayService.ts:72-105` | `updateContextMenu()` — localized tray menu (Show, Mini Window, Selection Assistant, Quit) | tray |
| B037 | `src/main/services/TrayService.ts:107-113` | `updateTray()` — show/destroy tray based on config | tray |
| B038 | `src/main/services/TrayService.ts:123-137` | `watchConfigChanges()` — subscribe to tray/language/quickAssistant/selection config changes | tray |
| B039 | `src/main/services/AppMenuService.ts:27-129` | `setupApplicationMenu()` — localized macOS menu (About, Edit, View, Window, Help) | menu |
| B040 | `src/main/services/AppMenuService.ts:13-17` | Language change subscription — rebuild menu on language change | menu |
| B041 | `src/main/services/AppService.ts:24-79` | `setAppLaunchOnBoot()` — Win/Mac login item, Linux .desktop autostart file | lifecycle |
| B042 | `src/main/services/ShortcutService.ts:163-305` | `registerShortcuts()` — register/unregister global shortcuts on window focus/blur | shortcuts |
| B043 | `src/main/services/ShortcutService.ts:40-80` | `getShortcutHandler()` — map shortcut keys to actions (zoom, show_app, mini_window, selection) | shortcuts |
| B044 | `src/main/services/ShortcutService.ts:82-161` | `convertShortcutFormat()` — JS key names to Electron accelerator format | shortcuts |
| B045 | `src/main/bootstrap.ts:12-33` | `copyOccupiedDirsInMainProcess()` — copy locked dirs on data path migration (Windows) | lifecycle |

---

## 4. UI Component Features

| Component | Source Hint | Description |
|-----------|------------|-------------|
| Custom Titlebar | WindowService + CSS `.drag` / `.nodrag` | macOS: hidden titlebar + traffic lights at (8,13). Win/Linux: frameless with custom controls |
| Window Controls | `preload/index.ts → windowControls` | Minimize, Maximize, Unmaximize, Close via IPC |
| Top Navbar | Renderer (not in F001 scope, but shell frame) | Tab bar navigation, draggable region |

---

## 5. Interaction Behavior Inventory

| ID | Trigger | Response | Notes |
|----|---------|----------|-------|
| I001 | User clicks tray icon | Show main window (or mini window if configured) | Config: `clickTrayToShowQuickAssistant` |
| I002 | User right-clicks tray | Show context menu (Show, Mini Window, Selection, Quit) | Localized labels |
| I003 | User clicks window close (X) | Hide to tray or quit based on tray config | Mac: always hide; Win/Linux: quit if no tray |
| I004 | User presses global shortcut `show_app` | Toggle main window visibility | Default unset |
| I005 | User presses global shortcut `mini_window` | Toggle mini window | Only if Quick Assistant enabled |
| I006 | Second app instance launched | Focus existing window, handle protocol URL | Single instance lock |
| I007 | macOS dock icon clicked | Show or recreate main window | `app.on('activate')` |

---

## 6. Foundation Decisions

| Decision | Cherry Studio Value | Angdu Studio Target |
|----------|-------------------|-------------------|
| Electron version | (per package.json) | Same major version |
| Window frame | macOS hidden titlebar, Win/Linux frameless | Same pattern |
| Preload strategy | Context isolation + contextBridge | Same |
| State persistence | electron-window-state for position/size | Same |
| Build tool | electron-vite | Same |
| Protocol scheme | `cherrystudio://` | `angdustudio://` |

---

## 7. Foundation Dependencies

| Package | Role |
|---------|------|
| `electron` | Runtime |
| `@electron-toolkit/utils` | `electronApp`, `optimizer`, `is` |
| `electron-window-state` | Window position/size persistence |
| `electron-builder` | Packaging |
| `electron-vite` | Build tooling |
| `electron-devtools-installer` | Dev tools (REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS) |

---

## 8. Naming Remapping

| Cherry Studio Identifier | Angdu Studio Identifier |
|--------------------------|------------------------|
| `CherryStudio` (window class, product name) | `AngduStudio` |
| `CherryHQ` (crashReporter companyName) | `AngduHQ` |
| `com.kangfenmao.CherryStudio` (appId) | `com.angdu.AngduStudio` |
| `cherrystudio://` (protocol scheme) | `angdustudio://` |
| `CHERRY_STUDIO_PROTOCOL` | `ANGDU_STUDIO_PROTOCOL` |
| `Cherry Studio` (tray tooltip, product name) | `Angdu Studio` |
| `cherry-studio.desktop` (Linux autostart) | `angdu-studio.desktop` |
| `cherrystudio` (Linux icon name) | `angdustudio` |
| `cherry-ai.com` (help menu URLs) | TBD (Angdu URLs) |
| `CherryHQ/cherry-studio` (GitHub URLs) | TBD |
| `CHERRYAI_CLIENT_SECRET` (global) | `ANGDUAI_CLIENT_SECRET` |
| `VITE_MAIN_BUNDLE_ID` | Same env var, different value |

---

## 9. Static Resources

| Resource | Source Path | Notes |
|----------|-----------|-------|
| App icon | `build/icon.png` | Main window icon |
| Tray icons | `build/tray_icon.png`, `tray_icon_dark.png`, `tray_icon_light.png` | Platform-specific tray |
| NSIS installer | `build/nsis-installer.nsh` | Windows installer customization |
| Mac entitlements | `build/entitlements.mac.plist` | Sandbox/permissions |

---

## 10. Environment Variables

| Variable | Usage |
|----------|-------|
| `ELECTRON_RENDERER_URL` | Dev server URL for hot reload |
| `VITE_MAIN_BUNDLE_ID` | App bundle ID override |
| `MAIN_VITE_CHERRYAI_CLIENT_SECRET` | CherryAI API secret → rename to `MAIN_VITE_ANGDUAI_CLIENT_SECRET` |
| `APPIMAGE` | Linux AppImage executable path |
| `XDG_SESSION_TYPE` | Linux Wayland detection |

---

## 11. Feature Contracts

### Provides (exported by F001)

| Contract | Consumer | Type |
|----------|----------|------|
| `windowService.getMainWindow()` | All features needing BrowserWindow reference | sync |
| `windowService.showMainWindow()` | Tray, shortcuts, protocol handler | sync |
| `windowService.createMiniWindow()` | Quick Assistant (F-chat) | sync |
| `IpcChannel` enum | All IPC communication | shared constant |
| `window.api.*` (preload bridge) | All renderer features | contextBridge |
| `window.api.windowControls.*` | Custom titlebar UI | IPC |
| `configManager.*` | All features needing persistent config | sync |

### Consumes (required by F001)

| Contract | Provider | Type |
|----------|----------|------|
| Theme mode (dark/light) | F002-i18n-theme | For titlebar overlay color |
| Language locale | F002-i18n-theme | For tray menu, app menu labels |

---

## 12. For /speckit.specify

- Window management is the highest-priority feature — all other features depend on the shell
- IPC handler file (`ipc.ts`) is 1178 lines and registers handlers for ALL features — F001 should only implement shell-related IPC handlers (window controls, app lifecycle, config, system info)
- The preload bridge (`preload/index.ts`) exposes ~700 lines of API surface — F001 should define the bridge structure but only implement shell-related methods
- Platform-specific logic is extensive: separate code paths for macOS, Windows, Linux throughout

---

## 13. For /speckit.plan

- **Phase 1**: Electron app scaffold + main process entry + BrowserWindow creation
- **Phase 2**: Preload bridge + IPC infrastructure (channel enum + registration pattern)
- **Phase 3**: Tray service + App menu (macOS) + window lifecycle (close/minimize/tray)
- **Phase 4**: Shortcuts service + single instance + protocol handler
- **Phase 5**: Auto-start + crash recovery + build config (electron-builder.yml)

---

## 14. For /speckit.analyze

- ConfigManager is a cross-cutting concern used by WindowService, TrayService, ShortcutService — consider its scope
- The `ipc.ts` monolith should be split per feature in the rebuild
- Mini window (Quick Assistant) has complex multi-monitor, multi-platform behavior — may be deferred
- Selection Assistant service is tightly coupled with shortcuts and tray — scope boundary decision needed
