# F001 — Electron Shell — Pre-Context

> Feature ID: F001 | Tier: 1 | Release Group: RG-1

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/main/index.ts` | App bootstrap, BrowserWindow creation, single-instance lock |
| `src/main/ipc.ts` | IPC handler registration (App_*, System_*, Windows_* subset) |
| `src/main/bootstrap.ts` | Pre-boot initialization |
| `src/main/config.ts` | Electron app configuration |
| `src/main/constant.ts` | Platform detection (isMac, isWin, isLinux, isDev, isPortable) |
| `src/main/services/AppService.ts` | App lifecycle, launch-on-boot |
| `src/main/services/AppUpdater.ts` | Auto-update via electron-updater |
| `src/main/services/TrayService.ts` | System tray icon and menu |
| `src/main/services/WindowService.ts` | Window management, mini window |
| `src/main/services/PowerMonitorService.ts` | Shutdown handler registration |
| `src/main/services/LoggerService.ts` | Structured logging |
| `src/main/utils/zoom.ts` | Zoom factor management |
| `src/main/utils/init.ts` | Data path initialization, app registration |
| `src/main/utils/lifecycle.ts` | Graceful shutdown, close data connections |
| `src/preload/index.ts` | Context bridge, IPC exposure |
| `src/shared/config/constant.ts` | MIN_WINDOW_WIDTH (1080), MIN_WINDOW_HEIGHT (600) |
| `src/shared/IpcChannel.ts` | IPC channel enum definitions |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B001 | `src/main/index.ts` | `createMainWindow()` | Creates BrowserWindow with platform-specific titlebar (hidden on macOS with traffic lights at 10,16; custom on Win/Linux) | P1 | Source |
| B002 | `src/main/index.ts` | `app.requestSingleInstanceLock()` | Ensures single app instance; second instance focuses existing window | P1 | Source |
| B003 | `src/main/ipc.ts` | `App_Info` handler | Returns app metadata: version, paths (files, notes, config, appData, resources, logs), arch, isPortable, installPath | P1 | Source |
| B004 | `src/main/services/AppUpdater.ts` | `checkForUpdates()` | Checks for updates from configured feed; supports test plan and upgrade channel | P1 | Source |
| B005 | `src/main/services/AppUpdater.ts` | `quitAndInstall()` | Downloads and installs update, then relaunches | P1 | Source |
| B006 | `src/main/services/TrayService.ts` | tray setup | Creates system tray icon with context menu (show/hide, quit) | P1 | Source |
| B007 | `src/main/ipc.ts` | `App_SetFullScreen` | Toggles fullscreen mode on main window | P2 | Source |
| B008 | `src/main/utils/zoom.ts` | `handleZoomFactor()` | Adjusts zoom by delta or resets; applies to all windows; persists to config | P1 | Source |
| B009 | `src/main/ipc.ts` | `App_Quit` / `App_RelaunchApp` | Quit app; relaunch with platform-specific handling (AppImage args, portable exe path) | P1 | Source |
| B010 | `src/main/ipc.ts` | `App_SetStopQuitApp` | Prevents quit during critical ops; shows notification with reason | P2 | Source |
| B011 | `src/main/ipc.ts` | `App_ResetData` | Factory reset: closes all DB connections, deletes data directory | P2 | Source |
| B012 | `src/main/services/PowerMonitorService.ts` | `registerShutdownHandler()` | Registers callbacks for system shutdown; disables auto-update and saves data | P1 | Source |
| B013 | `src/main/ipc.ts` | `App_ClearCache` | Clears session cache, cookies, filesystem, shader cache across all sessions + temp files | P2 | Source |
| B014 | `src/main/ipc.ts` | `App_GetCacheSize` | Calculates and returns cache directory size in MB | P2 | Source |
| B015 | `src/preload/index.ts` | `contextBridge.exposeInMainWorld()` | Exposes typed IPC methods to renderer via contextBridge | P1 | Source |

---

## For /speckit.specify Hints

- Define BrowserWindow creation options per platform
- Specify tray menu items and behaviors
- Document zoom factor range and persistence
- Define shutdown sequence (save data -> close connections -> quit)
- Specify auto-update flow (check -> download -> notify -> install)

## For /speckit.plan Hints

- Task 1: Main process bootstrap and BrowserWindow
- Task 2: Preload bridge with typed IPC
- Task 3: Tray service
- Task 4: Auto-update service
- Task 5: Zoom and fullscreen management
- Task 6: Graceful shutdown and lifecycle

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Provides to F002 | Navigation & Layout | MainWindow reference, window state events (maximize/unmaximize) |
| Provides to F003 | Theme & Appearance | ThemeService IPC, window style (transparent/opaque) |
| Provides to F007 | Settings System | ConfigManager IPC (Config_Set, Config_Get) |
| Provides to F008 | Data & Storage | File system access, data path management |
| Depends on F008 | Data & Storage | Data path initialization, close connections on shutdown |
| Provides to All | — | IPC bridge infrastructure, platform detection constants |
