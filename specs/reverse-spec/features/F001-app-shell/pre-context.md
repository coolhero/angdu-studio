# F001 - app-shell: Pre-Context

## 1. Runtime Exploration Results

| Observation | Value | Relevance |
|---|---|---|
| Window size | 960x600 (default) | WindowService creates BrowserWindow with this size |
| Default theme | "light" | ThemeService sets initial theme |
| Hash routing | Enabled (#/settings, etc.) | Main process must configure webPreferences for hash routing |
| Navbar height | 44px | App shell defines the top-level layout chrome |
| navbarPosition | "top" | ConfigManager stores this as default |

**Screens owned**: None directly (app-shell is infrastructure), but it provides the root BrowserWindow and App.tsx mount point.

## 2. Source Reference

| File Path | Role | Rebuild Target |
|---|---|---|
| src/main/index.ts | Main process entry, app lifecycle events | [TBD] |
| src/main/bootstrap.ts | App initialization sequence | [TBD] |
| src/preload/index.ts | Preload bridge — 42KB, 100+ API methods | [TBD] |
| src/main/ipc.ts | IPC handlers — 49KB, 274 handlers | [TBD] |
| src/main/services/WindowService.ts | BrowserWindow creation, state persistence | [TBD] |
| src/main/services/TrayService.ts | System tray icon and menu | [TBD] |
| src/main/services/ShortcutService.ts | Global keyboard shortcuts | [TBD] |
| src/main/services/AppService.ts | App lifecycle (quit, relaunch, platform checks) | [TBD] |
| src/main/services/AppUpdater.ts | Auto-update via electron-updater | [TBD] |
| src/main/services/ProtocolClient.ts | Deep linking (angdu:// protocol) | [TBD] |
| src/main/services/ConfigManager.ts | Configuration read/write (electron-store or similar) | [TBD] |
| src/main/services/LoggerService.ts | Logging (main process) | [TBD] |
| src/main/services/ProxyManager.ts | HTTP/SOCKS proxy configuration | [TBD] |
| src/main/services/VersionService.ts | Version info and update checks | [TBD] |
| src/main/services/AppMenuService.ts | macOS native menu bar | [TBD] |
| src/main/services/ContextMenu.ts | Right-click context menus | [TBD] |
| src/main/services/FileStorage.ts | File storage (userData path management) | [TBD] |
| src/main/services/ThemeService.ts | Theme management (nativeTheme sync) | [TBD] |
| src/main/services/PowerMonitorService.ts | Power/sleep/resume events | [TBD] |
| src/renderer/src/App.tsx | Root React component, provider wrappers | [TBD] |
| electron.vite.config.ts | Electron-Vite build configuration | [TBD] |

## 3. Source Behavior Inventory

| ID | File | Behavior | Priority |
|---|---|---|---|
| B001 | index.ts | App ready event → create main window | P1 |
| B002 | index.ts | Single instance lock — prevent duplicate app | P1 |
| B003 | index.ts | App activate event → show/recreate window (macOS) | P1 |
| B004 | index.ts | App before-quit → cleanup and persist state | P1 |
| B005 | bootstrap.ts | Sequential service initialization on startup | P1 |
| B006 | bootstrap.ts | Register all IPC handlers before window load | P1 |
| B007 | preload/index.ts | Expose contextBridge API (ipcRenderer wrappers) | P1 |
| B008 | preload/index.ts | Type-safe channel whitelisting | P1 |
| B009 | preload/index.ts | Bidirectional IPC: invoke (request/response) | P1 |
| B010 | preload/index.ts | Bidirectional IPC: on/send (event-based) | P1 |
| B011 | ipc.ts | File system IPC handlers (read, write, delete) | P1 |
| B012 | ipc.ts | Config IPC handlers (get, set, reset) | P1 |
| B013 | ipc.ts | Window control IPC (minimize, maximize, close) | P1 |
| B014 | ipc.ts | Shell IPC (openExternal, openPath, showItemInFolder) | P2 |
| B015 | ipc.ts | Dialog IPC (showOpenDialog, showSaveDialog) | P2 |
| B016 | ipc.ts | Clipboard IPC (read, write, readImage) | P2 |
| B017 | ipc.ts | Theme IPC (get/set theme, nativeTheme sync) | P2 |
| B018 | ipc.ts | App info IPC (version, paths, platform) | P2 |
| B019 | WindowService.ts | Create BrowserWindow with 960x600 default | P1 |
| B020 | WindowService.ts | Window state persistence (position, size, maximized) | P2 |
| B021 | WindowService.ts | Window focus/blur event handling | P2 |
| B022 | WindowService.ts | frameless window with custom title bar (platform-aware) | P1 |
| B023 | TrayService.ts | Create system tray icon | P2 |
| B024 | TrayService.ts | Tray context menu (show/hide, quit) | P2 |
| B025 | TrayService.ts | Tray click → toggle window visibility | P2 |
| B026 | ShortcutService.ts | Register global shortcuts on app ready | P2 |
| B027 | ShortcutService.ts | Unregister shortcuts on app blur/quit | P2 |
| B028 | AppService.ts | App quit handling (graceful shutdown) | P1 |
| B029 | AppService.ts | App relaunch (restart) | P2 |
| B030 | AppService.ts | Platform detection utilities | P2 |
| B031 | AppUpdater.ts | Check for updates on interval | P2 |
| B032 | AppUpdater.ts | Download and install update | P2 |
| B033 | AppUpdater.ts | Update progress notification to renderer | P2 |
| B034 | ProtocolClient.ts | Register custom protocol (angdu://) | P3 |
| B035 | ProtocolClient.ts | Parse deep link URL and route to feature | P3 |
| B036 | ConfigManager.ts | Read/write config with defaults | P1 |
| B037 | ConfigManager.ts | Config migration on version upgrade | P2 |
| B038 | LoggerService.ts | File-based logging with rotation | P2 |
| B039 | ProxyManager.ts | Set HTTP/SOCKS proxy for session | P2 |
| B040 | PowerMonitorService.ts | Suspend/resume event → pause/resume background tasks | P3 |

## 4. UI Component Features

| Source Component | Library | Usage | New Stack Equivalent |
|---|---|---|---|
| N/A (main process feature) | — | — | — |
| App.tsx root providers | AntD ConfigProvider, theme | Global theme/locale wrapper | shadcn/ui ThemeProvider + Tailwind4 |
| App.tsx error boundary | React ErrorBoundary | Top-level crash fallback | Same (React ErrorBoundary) |

## 5. Interaction Behavior Inventory

| Interaction | Trigger | Behavior |
|---|---|---|
| Window drag | Drag title bar area | Moves window (frameless, -webkit-app-region: drag) |
| Window controls | Click minimize/maximize/close buttons | Sends IPC to main process window controls |
| Tray click | Click tray icon | Toggle window show/hide |
| Tray right-click | Right-click tray icon | Show tray context menu |
| Deep link open | Click angdu:// URL externally | App focuses and routes to target |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| IPC pattern | Typed invoke + on/send | Type-safe, matches preload bridge pattern |
| Config storage | electron-store (or better-sqlite3) | Persistent key-value config; new stack uses better-sqlite3 |
| Build tool | electron-vite | Fast builds, ESM support |
| Window frame | Frameless + custom title bar | Consistent cross-platform UX |
| Protocol | angdu:// custom protocol | Deep linking for external integrations |
| Logging | File-based with rotation | Debugging in production |

## 7. Foundation Dependencies

| Relationship | Item | Direction |
|---|---|---|
| **owns** | IPC bridge (preload + handlers) | F001 defines, all features consume |
| **owns** | Window management | F001 exclusive |
| **owns** | App lifecycle | F001 exclusive |
| **owns** | Config persistence layer | F001 defines, F003 consumes heavily |
| **owns** | System tray | F001 exclusive |
| **owns** | Global shortcuts | F001 defines, F003 configures |
| **owns** | Theme sync (main↔renderer) | F001 defines, F003 controls |
| **owns** | File storage paths | F001 defines, many features consume |
| **owns** | Proxy management | F001 defines, F004 consumes |
| **consumes** | None | F001 has no dependencies |

## 8. Naming Remapping

| Source Identifier | Target Identifier | Location |
|---|---|---|
| cherry-studio | angdu-studio | package.json, app name |
| CherryStudio | AngduStudio | Window title, about dialog |
| cherry:// | angdu:// | ProtocolClient.ts deep link scheme |
| CherryINOAuthService | (remove or rebrand) | OAuth service naming |
| CHERRY_ env prefix | ANGDU_ env prefix | Environment variables |

## 9. Static Resources

| Resource | Path | Usage |
|---|---|---|
| App icon | src/main/resources/icon.png (+ .icns, .ico) | Window icon, tray icon |
| Tray icon | src/main/resources/tray/ | System tray (template icons for macOS) |
| About logo | src/renderer/src/assets/logo.png | About dialog / splash |

## 10. Environment Variables

| Variable | Usage | Feature |
|---|---|---|
| NODE_ENV | Development vs production mode | Build/runtime |
| ANGDU_DEV_TOOLS | Enable DevTools in production | Debug |
| ANGDU_PROXY | Default proxy URL | ProxyManager |
| ANGDU_LOG_LEVEL | Logging verbosity | LoggerService |
| ANGDU_UPDATE_URL | Custom update server URL | AppUpdater |

## 11. Feature Contracts

### Provides
- **IPC Bridge**: Typed invoke/on/send methods via contextBridge → all renderer features
- **Window Control API**: minimize, maximize, close, setSize, setPosition → F002, F003
- **Config API**: get/set/reset config values → F003, F004
- **Theme API**: getTheme, setTheme, onThemeChanged → F003
- **File Storage API**: read/write/delete files in userData → F004, F005
- **Shell API**: openExternal, openPath → F005
- **Platform Info**: OS, version, paths → all features

### Requires
- Nothing (root feature, no dependencies)

## 12. For /speckit.specify

### Draft Functional Requirements
- FR-001: App must enforce single instance lock
- FR-002: Main window must open at 960x600 centered on primary display
- FR-003: Window position/size must persist across restarts
- FR-004: Preload bridge must expose typed IPC methods via contextBridge
- FR-005: System tray must show app icon with show/hide and quit options
- FR-006: Global shortcuts must be configurable and registered/unregistered on focus
- FR-007: Auto-updater must check on startup and at interval, with progress notifications
- FR-008: Deep link protocol (angdu://) must route to appropriate feature
- FR-009: Config must persist via main-process storage with defaults and migration
- FR-010: App must handle power suspend/resume gracefully

### Draft Success Criteria
- SC-001: Cold start to window visible < 2 seconds
- SC-002: IPC round-trip latency < 10ms for config operations
- SC-003: Window state restored correctly after restart
- SC-004: Tray icon visible on all supported platforms

### Edge Cases
- Second instance launched → focus existing window, pass args
- Config file corrupted → reset to defaults, log warning
- Update download interrupted → retry on next check
- Deep link received while app starting → queue and process after ready
- Proxy config invalid → fallback to direct connection

## 13. For /speckit.plan

### Dependencies
- electron (framework)
- electron-vite (build)
- electron-updater (auto-update)
- electron-store or better-sqlite3 (config persistence)
- electron-log (logging)

### Entity Drafts
- **AppConfig**: { theme, language, proxyUrl, autoUpdate, windowState, ... }
- **WindowState**: { x, y, width, height, isMaximized }

### API Drafts
- Main→Renderer: `window:state-changed`, `theme:changed`, `update:progress`
- Renderer→Main: `window:minimize`, `window:maximize`, `window:close`, `config:get`, `config:set`

### Tech Decisions
- Config storage: better-sqlite3 (new stack decision) instead of electron-store
- Build: electron-vite (keep from source)
- IPC: typed channels with Zod validation (new improvement)

## 14. For /speckit.analyze

### Cross-Feature Verification Points
- F001↔F002: Navigation must work within the window F001 creates; hash routing config must match
- F001↔F003: Config API must support all settings F003 needs to read/write
- F001↔F003: Theme IPC must sync nativeTheme with renderer theme state
- F001↔F004: Proxy settings from F001 must be applied to API requests in F004
- F001↔F005: File storage API must support attachment/image storage for chat
- F001→ALL: Preload bridge must expose all IPC channels each feature requires
- IPC handler count: Source has 274 handlers; rebuild should audit and reduce to essential set
