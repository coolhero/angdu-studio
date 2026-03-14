# F001-shell Pre-Context

## Feature Summary

| Field | Value |
|-------|-------|
| **Feature ID** | F001-shell |
| **Description** | Electron main process, window management, IPC bridge, tray, auto-updates, app menus, system integration, deep linking |
| **Tier** | 1 |
| **Release Group** | RG-1 |
| **Dependencies** | none |

## Global Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **Target**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- All source paths are RELATIVE to `cherry-studio`

## Source Reference

| File | Role |
|------|------|
| `src/main/index.ts` | Main process entry, service boot order |
| `src/main/bootstrap.ts` | App data directory initialization |
| `src/main/ipc.ts` | IPC channel handler registration (1178 lines) |
| `src/main/config.ts` | Configuration management |
| `src/main/constant.ts` | Constants |
| `src/preload/index.ts` | Preload bridge API |
| `src/main/services/WindowService.ts` | Window creation/management |
| `src/main/services/AppMenuService.ts` | Application menu |
| `src/main/services/AppUpdater.ts` | Auto-update via electron-updater |
| `src/main/services/TrayService.ts` | System tray |
| `src/main/services/ShortcutService.ts` | Global shortcuts |
| `src/main/services/ProtocolClient.ts` | Deep linking (`cherrystudio://`) |
| `src/main/services/SelectionService.ts` | Selection toolbar/action windows |
| `src/main/services/WebviewService.ts` | Webview management |
| `electron-builder.yml` | Build configuration |
| `electron.vite.config.ts` | Vite config for Electron |

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B001 | `src/main/index.ts` | `createWindow()` | Creates main BrowserWindow with configured options | P1 | extracted |
| B002 | `src/main/index.ts` | `registerIpcHandlers()` | Registers all IPC handlers from ipc.ts | P1 | extracted |
| B003 | `src/main/bootstrap.ts` | `initAppDataDir()` | Initializes app data directory structure | P1 | extracted |
| B004 | `src/main/services/WindowService.ts` | `createMainWindow()` | Creates main window with state persistence | P1 | extracted |
| B005 | `src/main/services/WindowService.ts` | `handleWindowClose()` | Handles close behavior (minimize-to-tray or quit) | P1 | extracted |
| B006 | `src/main/services/AppMenuService.ts` | `buildMenu()` | Builds platform-specific application menu | P2 | extracted |
| B007 | `src/main/services/AppUpdater.ts` | `checkForUpdate()` | Checks for app updates via electron-updater | P2 | extracted |
| B008 | `src/main/services/AppUpdater.ts` | `quitAndInstall()` | Applies pending update and restarts | P2 | extracted |
| B009 | `src/main/services/TrayService.ts` | `createTray()` | Creates system tray icon with context menu | P2 | extracted |
| B010 | `src/main/services/ShortcutService.ts` | `registerGlobalShortcuts()` | Registers global keyboard shortcuts | P2 | extracted |
| B011 | `src/main/services/ProtocolClient.ts` | `handleProtocol()` | Handles `cherrystudio://` deep links | P3 | extracted |
| B012 | `src/main/services/SelectionService.ts` | `showSelectionToolbar()` | Shows floating selection toolbar window | P3 | extracted |
| B013 | `src/preload/index.ts` | `exposeApi()` | Exposes IPC bridge to renderer via contextBridge | P1 | extracted |
| B014 | `src/main/ipc.ts` | `handleAppInfo()` | Returns app version, paths, arch, isPackaged | P1 | extracted |
| B015 | `src/main/ipc.ts` | `handleAppProxy()` | Sets HTTP/HTTPS proxy configuration | P2 | extracted |
| B016 | `src/main/ipc.ts` | `handleZoomFactor()` | Handles zoom in/out with delta | P3 | extracted |
| B017 | `src/main/ipc.ts` | `handleFullScreen()` | Toggles fullscreen mode | P3 | extracted |
| B018 | `src/main/ipc.ts` | `handleClearCache()` | Clears application cache | P3 | extracted |

## For /speckit.specify

- Core shell must support: window creation, IPC bridge, tray, menus, updates, deep linking
- Platform: macOS, Windows, Linux
- Window features: state persistence, zoom, fullscreen, frameless with custom titlebar
- Multi-window support: main, mini, selection toolbar, selection action, trace windows

## For /speckit.plan

- Preceding dependencies: None (foundation Feature)
- Key architectural decision: IPC channel design (preload bridge pattern)
- Migration note: electron-vite -> Vite 7 + @electron-toolkit
- BrowserWindow options: `frame:false` requires custom titlebar with `-webkit-app-region:drag`

## Naming Remapping

| Original | File | Suggested New | Type |
|----------|------|--------------|------|
| CherryStudio | `electron-builder.yml` | AngduStudio | product name |
| com.kangfenmao.CherryStudio | `electron-builder.yml` | com.angdu.AngduStudio | app ID |
| cherrystudio | `electron-builder.yml` | angdustudio | protocol scheme |
