# Quick-Start Guide: F001-app-core

**Feature**: App Core
**Date**: 2026-03-08

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | >= 20.x LTS | `node --version` |
| pnpm | >= 9.x | `pnpm --version` |
| Git | >= 2.x | `git --version` |

macOS: Xcode Command Line Tools (`xcode-select --install`)
Linux: `build-essential`, `libgtk-3-dev`, `libnotify-dev`, `libnss3`, `libxss1`
Windows: Visual Studio Build Tools (Desktop C++ workload)

---

## Setup

```bash
# Clone and enter
cd /Users/coolhero/Develop/angdu-studio

# Install dependencies
pnpm install

# Verify electron-vite is available
pnpm exec electron-vite --version
```

---

## Development Mode

```bash
# Start in dev mode (hot-reload for renderer, restart for main)
pnpm dev
```

This launches:
1. electron-vite dev server for the renderer (Vite HMR on port 5173)
2. Main process with watch mode (restarts on changes to `src/main/**`)
3. Preload script compilation

---

## Verifying Key Behaviors

### 1. Window Management (US1)

| Behavior | How to Verify |
|----------|---------------|
| Main window appears | Launch app, window should open within 3 seconds |
| Default size | Window should be at least 1080x600 |
| Position persistence | Resize and move the window, quit, relaunch — same position and size |
| Single instance | While app is running, run `pnpm dev` again — existing window should focus |
| macOS chrome | On macOS: hidden title bar with traffic light buttons visible |
| Windows/Linux chrome | Frameless window with custom minimize/maximize/close buttons in title bar area |
| Minimum size enforcement | Try resizing below 1080x600 — should be blocked |

### 2. IPC Bridge & Config (US2)

| Behavior | How to Verify |
|----------|---------------|
| IPC channels registered | Open DevTools (Ctrl+Shift+I / Cmd+Opt+I), in Console run: `window.api.getAppInfo()` — should return AppInfo object |
| Config persistence | In Console: `await window.api.config.set('theme', 'dark')` then quit and relaunch. Run `await window.api.config.get('theme')` — should return `'dark'` |
| contextIsolation | In Console: `window.require` should be `undefined`. `window.api` should be a plain object (no prototype chain to ipcRenderer). |

### 3. Theme Switching (US3)

| Behavior | How to Verify |
|----------|---------------|
| Set dark theme | Console: `await window.api.setTheme('dark')` — window should switch to dark mode |
| Set light theme | Console: `await window.api.setTheme('light')` — window should switch to light mode |
| System theme follow | Console: `await window.api.setTheme('system')` — toggle macOS appearance in System Settings, app should follow |
| Title bar updates | On Windows: title bar overlay colors should match the active theme |

### 4. Proxy (US4)

| Behavior | How to Verify |
|----------|---------------|
| Set custom proxy | Console: `await window.api.setProxy('http://127.0.0.1:8080')` — check main process logs for proxy application |
| Clear proxy | Console: `await window.api.setProxy(undefined)` — direct connection restored |
| Bypass rules | Console: `await window.api.setProxy('http://127.0.0.1:8080', '<local>;*.example.com')` — localhost requests bypass proxy |

### 5. Tray & Mini Window (US5)

| Behavior | How to Verify |
|----------|---------------|
| System tray icon | After launch, look for Angdu Studio icon in system tray / menu bar |
| Tray context menu | Right-click (or click on macOS) the tray icon — menu with Show/Hide and Quit should appear |
| Mini window toggle | Console: `await window.api.miniWindow.toggle()` — compact window should appear |
| Mini window pin | Console: `await window.api.miniWindow.setPin(true)` — mini window stays on top of all windows |

### 6. Auto-Update (US6)

| Behavior | How to Verify |
|----------|---------------|
| Check for update | Console: `await window.api.checkForUpdate()` — returns update info or `null` |
| Update channel | Console: `await window.api.config.set('updateChannel', 'beta')` — subsequent checks use beta channel |

Note: Full update flow requires a published release. In dev mode, `checkForUpdate()` will likely return `null` or error.

### 7. Deep Links & Shortcuts (US7)

| Behavior | How to Verify |
|----------|---------------|
| Protocol registration | In a terminal: `open angdu-studio://settings` (macOS) or equivalent — app should activate |
| Shortcut listing | Console: `await window.api.shortcuts.getAll()` — returns default shortcut bindings |
| Zoom shortcuts | Press Cmd+= / Ctrl+= to zoom in, Cmd+- / Ctrl+- to zoom out, Cmd+0 / Ctrl+0 to reset |

### 8. Lifecycle & Crash (US8)

| Behavior | How to Verify |
|----------|---------------|
| Graceful shutdown | Quit the app, check main process logs — should show cleanup steps for each service |
| Crash report | Console: `await window.api.devTools.toggle()` then deliberately crash renderer — check `{userData}/crash-reports/` for report file |

---

## Running Tests

```bash
# Unit tests (Vitest)
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests (Playwright + Electron)
pnpm test:e2e
```

---

## Build

```bash
# Production build (current platform)
pnpm build

# Build output is in dist/
```

---

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts             # Entry point, app lifecycle, bootstrap
│   ├── ipc.ts               # IPC channel registration
│   ├── config.ts            # Window config, title bar overlays
│   └── services/
│       ├── ConfigManager.ts
│       ├── ThemeService.ts
│       ├── ProxyManager.ts
│       ├── TrayService.ts
│       ├── WindowService.ts
│       ├── MiniWindowService.ts
│       ├── ShortcutService.ts
│       ├── UpdateService.ts
│       ├── NotificationService.ts
│       └── ProtocolService.ts
├── preload/
│   └── index.ts             # contextBridge API surface
├── renderer/
│   └── src/
│       ├── App.tsx
│       ├── stores/          # Zustand stores
│       │   ├── useAppStore.ts
│       │   ├── useThemeStore.ts
│       │   └── useNotificationStore.ts
│       └── ...
└── shared/
    ├── ipc-channels.ts      # IpcChannel enum
    ├── types.ts             # Shared type definitions
    └── constants.ts         # Shared constants
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `electron-vite` not found | Run `pnpm install` again. Check that `electron-vite` is in `devDependencies`. |
| Window doesn't appear | Check main process console for errors. Ensure `src/main/index.ts` calls `createWindow()` after `app.whenReady()`. |
| IPC timeout | Verify the channel is registered in `src/main/ipc.ts`. Check for typos in `IpcChannel` enum values. |
| Tray icon missing | On Linux, ensure `libappindicator3-1` is installed. On macOS, check template image naming (icon must end with `Template.png`). |
| Config not persisting | Check file permissions on `app.getPath('userData')`. Look for `config.json` in that directory. |
| Proxy not working | Check all four layers: session proxy, env vars, undici dispatcher, http/https agent. Main process logs show proxy application. |
