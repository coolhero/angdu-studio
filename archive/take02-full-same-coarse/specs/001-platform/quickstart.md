# Quickstart: Platform Infrastructure

**Feature**: F001-platform | **Date**: 2026-03-02

## Prerequisites

- Node.js >= 24.11.1
- pnpm >= 10.27
- Git

## Setup

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Start development mode:
   ```bash
   pnpm dev
   ```

   This launches electron-vite in dev mode with HMR for the renderer process.

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Electron app in development mode with HMR |
| `pnpm build` | Build all processes (main, preload, renderer) for production |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm lint` | Run Biome linter and formatter check |
| `pnpm format` | Auto-format code with Biome |
| `pnpm dist` | Build and package for current platform |

## Validation Scenarios

### VS-001: Application Launch

1. Run `pnpm dev`
2. Verify: Main window appears within 5 seconds
3. Verify: Window shows the home interface with sidebar and main content area
4. Verify: No errors in the terminal or DevTools console

### VS-002: Theme Switching

1. Open Settings > Display
2. Select "Dark" theme
3. Verify: All UI components switch to dark mode within 200ms
4. Select "System" theme
5. Change OS theme (System Preferences on macOS, Settings on Windows)
6. Verify: App theme follows OS change automatically

### VS-003: File Upload

1. Click file upload button in the UI
2. Select a file (< 50MB)
3. Verify: File appears in managed files list
4. Verify: File can be opened with system default app
5. Verify: File can be downloaded to a user-chosen location

### VS-004: Settings Persistence

1. Change any setting (e.g., language, theme, launch at login)
2. Close the app completely
3. Reopen the app with `pnpm dev`
4. Verify: All changed settings are preserved with their modified values

### VS-005: System Tray

1. Minimize the app to tray (close window with tray enabled)
2. Verify: Tray icon appears in the system notification area
3. Right-click the tray icon
4. Verify: Context menu shows "Restore" and "Quit" options
5. Click "Restore" from the tray menu
6. Verify: App window reappears and is focused

### VS-006: Keyboard Shortcuts

1. Open Settings > Shortcuts
2. Configure a global shortcut (e.g., CmdOrCtrl+Shift+Space for Show/Hide)
3. Switch to another application (browser, file manager, etc.)
4. Press the configured shortcut
5. Verify: Cherry Studio responds to the shortcut (shows or hides)

### VS-007: Single Instance

1. Start the app with `pnpm dev`
2. In a new terminal, run `pnpm dev` again
3. Verify: The second instance does not open a new window
4. Verify: The existing window is brought to focus

### VS-008: Proxy Configuration

1. Open Settings > General (or Network section)
2. Set proxy mode to "Manual"
3. Enter proxy host and port
4. Verify: Network requests route through the configured proxy
5. Set proxy mode to "System"
6. Verify: App uses the system proxy settings

## Demo

### Demo Setup

```bash
pnpm install
pnpm dev
```

### Demo Walkthrough

1. **Launch** (VS-001): App opens showing the Cherry Studio interface with sidebar navigation and main content area. Point out the fast startup time (<5s).

2. **Theme** (VS-002): Navigate to Settings > Display. Switch themes: light -> dark -> system. Show that all UI components (sidebar, buttons, backgrounds, text) update immediately. Toggle OS theme to demonstrate system-follow mode.

3. **File Management** (VS-003): Upload a sample file (PDF or image). Show it appears in the file list with correct metadata (name, size, type). Open it with the system default app. Download it to the desktop.

4. **Settings Persistence** (VS-004): Change the language setting. Close and reopen the app. Show that the language change persists.

5. **System Tray** (VS-005): Close the main window. Show the tray icon in the system notification area. Right-click for the context menu. Restore the window from the tray.

6. **Shortcuts** (VS-006): Open Settings > Shortcuts. Set a global shortcut. Switch to another application. Press the shortcut to toggle Cherry Studio visibility.

### Demo Talking Points

- "The 3-process architecture ensures security: the renderer cannot access the file system or OS APIs directly."
- "All 260+ IPC channels are type-safe with a centralized enum, preventing runtime errors."
- "Files are sandboxed to the app data directory. Path traversal is blocked."
- "Settings persistence uses selective Redux persistence: user preferences survive restarts, but runtime state resets cleanly."
- "The app supports Windows, macOS, and Linux from a single codebase."
