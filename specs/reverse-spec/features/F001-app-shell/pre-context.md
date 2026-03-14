# F001-app-shell Pre-Context

## Feature Overview

Electron window management, IPC architecture, security model, bootstrap sequence, and native OS integration. This is the foundation feature -- all other features depend on it.

Angdu Studio is a rebuild of Cherry Studio. This feature covers the main process entry, preload bridge, window lifecycle, system tray, global shortcuts, theme management, protocol handling, proxy configuration, auto-update, power monitoring, store sync across windows, and electron-builder packaging.

Identity remapping: CherryStudio -> AngduStudio, cherrystudio:// -> angdustudio://, com.kangfenmao.CherryStudio -> com.angdu.AngduStudio, CherryHQ -> Angdu, cherry-ai.com -> angdu.com.

## Runtime Exploration Results

- **Platform**: Electron (electron-toolkit, electron-vite, electron-builder)
- **Process model**: Main (Node.js) + Preload (contextBridge) + Renderer (React)
- **State management**: Redux (cross-window sync via StoreSyncService)
- **Config persistence**: electron-store (main process ConfigManager)
- **Single instance**: app.requestSingleInstanceLock() enforced
- **Window state**: electron-window-state for position/size persistence
- **Min window size**: MIN_WINDOW_WIDTH x MIN_WINDOW_HEIGHT (imported from shared constants)
- **Mini window**: 550x400 default, 350x380 min, 1024x768 max; always-on-top floating panel
- **Title bar**: macOS hidden titleBarStyle with trafficLightPosition; Windows/Linux frameless (optional system title bar on Linux)
- **Protocol**: cherrystudio:// with hostname-based routing (mcp, providers, generic)
- **Proxy**: ProxyManager supports direct/system/custom modes; HTTP/HTTPS/SOCKS4/SOCKS5; bypass rules with CIDR, wildcard, domain matching
- **Crash recovery**: Renderer crash auto-reload if >1 min since last crash; exit if <1 min (repeated crash protection)

## Source Reference

All paths relative to cherry-studio root.

| File | Purpose | Lines |
|------|---------|-------|
| `src/main/index.ts` | Main entry point: app lifecycle, single-instance, service init | ~288 |
| `src/main/bootstrap.ts` | Data directory initialization, occupied dir copy for Windows | ~34 |
| `src/main/ipc.ts` | IPC handler registration (60+ service imports) | ~1178 |
| `src/main/config.ts` | DATA_PATH, titleBarOverlay configs, CHERRYAI_CLIENT_SECRET | ~25 |
| `src/main/constant.ts` | Platform detection: isMac, isWin, isLinux, isDev, isPortable | ~5 |
| `src/preload/index.ts` | contextBridge API surface -- ~100 IPC channels exposed as window.api | ~720 |
| `src/main/services/WindowService.ts` | Singleton WindowService: main + mini window creation, show/hide/toggle | ~719 |
| `src/main/services/ThemeService.ts` | nativeTheme sync, titleBarOverlay update on theme change | ~48 |
| `src/main/services/TrayService.ts` | System tray: icon, context menu, click-to-show, config subscription | ~143 |
| `src/main/services/AppMenuService.ts` | macOS-only application menu with localized labels | ~133 |
| `src/main/services/ShortcutService.ts` | Global shortcuts: register on focus, unregister on blur, accelerator format conversion | ~323 |
| `src/main/services/AppUpdater.ts` | Auto-update with multi-channel (latest/rc/beta), mirror URLs, delta update | ~50+ |
| `src/main/services/PowerMonitorService.ts` | Power event handling (suspend/resume) | - |
| `src/main/services/NotificationService.ts` | Desktop notification dispatch | - |
| `src/main/services/ProxyManager.ts` | Proxy configuration: system/custom/direct, bypass rules, fetch/http/session proxy | ~592 |
| `src/main/services/ProtocolClient.ts` | cherrystudio:// protocol handler, AppImage deep link setup | ~130 |
| `src/main/services/StoreSyncService.ts` | Redux action broadcast across BrowserWindow instances | ~50+ |
| `src/main/services/ConfigManager.ts` | electron-store wrapper with subscribe/notify pattern | ~297 |
| `electron-builder.yml` | Build/packaging config: appId, protocols, targets, signing | ~185 |
| `electron.vite.config.ts` | Vite build config for main/preload/renderer | - |

## Source Behavior Inventory

### B001 — App Bootstrap Sequence
- **Source**: `src/main/index.ts` lines 1-7, `src/main/bootstrap.ts`
- **Behavior**: Import order matters: bootstrap (initAppDataDir) runs first, then config sets DATA_PATH. In packaged mode, userData is initialized. Dev mode appends "Dev" suffix to userData path.
- **Rule**: Bootstrap must execute before any other module. Occupied dirs are copied in main process before renderer starts (Windows only, for locked files).

### B002 — Single Instance Lock
- **Source**: `src/main/index.ts` lines 129-132
- **Behavior**: app.requestSingleInstanceLock(). If lock fails, quit immediately. On second-instance event, show main window and process protocol URL from argv.

### B003 — Hardware Acceleration Toggle
- **Source**: `src/main/index.ts` lines 57-60
- **Behavior**: configManager.getDisableHardwareAcceleration() checked before app.ready. Must call app.disableHardwareAcceleration() before ready event.

### B004 — Main Window Creation
- **Source**: `src/main/services/WindowService.ts` lines 46-110
- **Behavior**: Singleton pattern. Uses electron-window-state for position/size persistence. macOS: hidden titleBarStyle with trafficLightPosition {x:8, y:13}. Windows/Linux: frameless unless useSystemTitleBar (Linux only). webPreferences: sandbox=false, webSecurity=false, webviewTag=true, backgroundThrottling=false. Preloads miniWindow if enableQuickAssistant is true.

### B005 — Mini Window Management
- **Source**: `src/main/services/WindowService.ts` lines 499-697
- **Behavior**: Floating panel (alwaysOnTop=true level='floating'). macOS: transparent + vibrancy='under-window', type='panel'. Pinnable (blur won't hide). Cross-screen detection: if miniWindow is on different screen than cursor, move to cursor screen center. Windows: minimize instead of hide (workaround for focus restoration). macOS >=26: skip app.hide() after miniWindow hide.

### B006 — Window Close Behavior
- **Source**: `src/main/services/WindowService.ts` lines 349-409
- **Behavior**: On close, sends App_SaveData to renderer. If app.isQuitting, proceed to quit. If tray disabled OR (tray enabled AND trayOnClose disabled): Win/Linux quit, macOS default behavior. If tray enabled AND trayOnClose enabled: hide window, hide dock icon on macOS.

### B007 — Show Main Window
- **Source**: `src/main/services/WindowService.ts` lines 411-473
- **Behavior**: Hides miniWindow first. Restores if minimized. Linux special: hide-then-show for bringing to front. Non-Linux: setVisibleOnAllWorkspaces true/false dance. Exits fullscreen if not visible (fixes macOS bug after fullscreen close).

### B008 — System Tray
- **Source**: `src/main/services/TrayService.ts`
- **Behavior**: Subscribes to ConfigKeys.Tray, Language, EnableQuickAssistant, SelectionAssistantEnabled. Icon varies by platform and theme. Tooltip: 'Cherry Studio'. Click: showMiniWindow (if quickAssistant enabled AND clickTrayToShowQuickAssistant) else showMainWindow. Right-click: context menu with show, mini window, selection assistant toggle, quit.

### B009 — Global Shortcuts
- **Source**: `src/main/services/ShortcutService.ts`
- **Behavior**: Register on window focus, unregister on blur (keep universal shortcuts: show_app, mini_window, selection_assistant_toggle/select_text). Zoom shortcuts (in/out/reset) use hardcoded accelerators. Shortcut format conversion: JS key names -> Electron accelerator format. When launching to tray, only register universal shortcuts.

### B010 — Theme Service
- **Source**: `src/main/services/ThemeService.ts`
- **Behavior**: Reads theme from configManager (dark/light/system). Sets nativeTheme.themeSource. On nativeTheme 'updated' event, updates all windows' titleBarOverlay and sends ThemeUpdated IPC to renderers.

### B011 — Protocol Client
- **Source**: `src/main/services/ProtocolClient.ts`
- **Behavior**: Registers cherrystudio:// as default protocol client. URL routing by hostname: 'mcp' -> handleMcpProtocolUrl, 'providers' -> handleProvidersProtocolUrl, default -> send to renderer via 'protocol-data' IPC. Linux AppImage: creates .desktop file for x-scheme-handler.

### B012 — Proxy Manager
- **Source**: `src/main/services/ProxyManager.ts`
- **Behavior**: Three modes: direct, system, custom. System mode polls every 60s for changes. Sets environment variables (HTTP_PROXY, HTTPS_PROXY, SOCKS_PROXY, ALL_PROXY, grpc_proxy). Configures undici global dispatcher, Electron session proxy, and Node http/https agents. Bypass rules support: <local>, CIDR, IP wildcard, domain wildcard, subdomain wildcard, scheme+port filtering. SelectiveDispatcher routes bypassed requests to direct dispatcher.

### B013 — Preload API Surface
- **Source**: `src/preload/index.ts`
- **Behavior**: Exposes window.electron (electronAPI) and window.api (custom). API namespaces: app, notification, system, devTools, zip, backup, file, fs, export, obsidian, shortcuts, knowledgeBase, memory, window, fileService, selectionMenu, vertexAI, ovms, config, miniWindow, aes, mcp, python, shell, copilot, cherryin, protocol, externalApps, nutstore, searchService, webview, storeSync, selection, agentTools, trace, anthropic_oauth, codeTools, ocr, cherryai, windowControls, apiServer, claudeCodePlugin, localTransfer, openclaw, analytics.

### B014 — Crash Reporter & Recovery
- **Source**: `src/main/index.ts` lines 47-52, `src/main/services/WindowService.ts` lines 137-151
- **Behavior**: crashReporter.start with uploadToServer=false. Renderer crash: if >1 min since last crash, reload; if <1 min, exit app (prevents crash loop). Unresponsive renderer: collects JS call stack via mainFrame.collectJavaScriptCallStack().

### B015 — Store Sync Service
- **Source**: `src/main/services/StoreSyncService.ts`
- **Behavior**: Singleton. Manages window subscriptions for Redux store sync. Broadcasts Redux actions from one window to all others. Adds metadata to prevent infinite sync loops.

### B016 — Web Security Headers
- **Source**: `src/main/services/WindowService.ts` lines 318-334
- **Behavior**: Removes X-Frame-Options and Content-Security-Policy headers from all responses. This allows embedding external content in webviews.

### B017 — External Link Handling
- **Source**: `src/main/services/WindowService.ts` lines 261-313
- **Behavior**: will-navigate: prevent default and open external (except localhost:517* for dev). setWindowOpenHandler: allow OAuth provider URLs in persist:webview partition; file:// URLs open via shell.openPath; all others open external.

## Environment Variables

| Variable | Context | Purpose |
|----------|---------|---------|
| `VITE_MAIN_BUNDLE_ID` | Build | App bundle ID override (default: com.kangfenmao.CherryStudio) |
| `ELECTRON_RENDERER_URL` | Dev | Renderer dev server URL |
| `NODE_ENV` | Runtime | 'development' detection |
| `PORTABLE_EXECUTABLE_DIR` | Windows | Portable mode detection |
| `XDG_SESSION_TYPE` | Linux | Wayland detection for GlobalShortcutsPortal |
| `APPIMAGE` | Linux | AppImage path for deep link setup |
| `HTTP_PROXY`, `HTTPS_PROXY`, `SOCKS_PROXY`, `ALL_PROXY`, `grpc_proxy`, `no_proxy` | Runtime | Set by ProxyManager |
| `MAIN_VITE_CHERRYAI_CLIENT_SECRET` | Build | CherryAI integration secret |

## For /speckit.specify

- System greeting / setup: App bootstrap sequence, single instance, data directory init
- Window management: Main window (persistent state, titlebar, close-to-tray), mini window (floating panel, cross-screen, pinnable)
- IPC contract: ~100 channels grouped into namespaces, invoke-based (request/response), some event-based (on/off)
- Security model: sandbox=false, webSecurity=false (intentional for AI API calls), CSP/X-Frame-Options stripped
- Native OS integration: Tray, global shortcuts, protocol handler, app menu (macOS), power monitor, notifications, auto-update

## For /speckit.plan

- Electron main/preload/renderer architecture: Three-process model with contextBridge isolation
- IPC channel design: Typed enum (IpcChannel), invoke pattern for all calls, event pattern for push notifications (theme, resize, protocol)
- Window state persistence: electron-window-state for main + mini windows
- Config persistence: electron-store in main process, accessed via IPC from renderer
- Build pipeline: electron-vite for dev, electron-builder for packaging (NSIS/portable on Windows, DMG/ZIP on macOS, AppImage/deb/rpm on Linux)

## Feature Contracts

### Provided (downstream features depend on these)

| Contract | Consumer | Description |
|----------|----------|-------------|
| `window.api.*` | All renderer features | Preload API surface for IPC calls |
| `window.electron` | All renderer features | Electron toolkit API |
| `ConfigManager.get/set` | F002-settings, all features | Main process config persistence |
| `WindowService.getMainWindow()` | All main-process services | Access to main BrowserWindow |
| `IpcChannel enum` | All features | Typed IPC channel names |
| `ThemeUpdated` IPC event | F002-settings, UI features | Theme change notifications |
| `ProxyManager.configureProxy()` | F003-provider, network features | Proxy configuration |
| `protocol-data` IPC event | F003-provider | Protocol URL data forwarding |

### Required (this feature depends on)

None. This is the foundation feature.
