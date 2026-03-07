# Demo: F001-platform (Platform Infrastructure)

## Quick Start

```bash
pnpm install
pnpm dev
```

## Demo Walkthrough

### 1. Application Launch (VS-001)

1. Run `pnpm dev`
2. Main window appears within 5 seconds with sidebar and content area
3. DevTools open automatically in dev mode

### 2. Theme Switching (VS-002)

1. Navigate to Settings > Display
2. Select "Dark" — all UI components switch to dark mode
3. Select "Light" — switches back to light mode
4. Select "System" — follows OS theme preference

### 3. File Upload (VS-003)

1. Files can be uploaded via `file:upload` IPC channel
2. Files are stored in sandboxed `{dataDir}/files/` with UUID naming
3. Files can be opened with system default app via `file:open`
4. Path traversal is blocked — sandbox guard rejects `../` patterns

### 4. Settings Persistence (VS-004)

1. Open Settings > General
2. Change language, toggle "Launch at Login"
3. Close and reopen the app
4. All settings are preserved via redux-persist

### 5. System Tray (VS-005)

1. App initializes tray icon on launch
2. Right-click tray: "Restore" and "Quit" options
3. Click tray icon: shows/focuses main window

### 6. Keyboard Shortcuts (VS-006)

1. Open Settings > Shortcuts
2. View configured shortcuts (show-hide-app: CmdOrCtrl+Shift+Space)
3. Toggle enable/disable for each shortcut
4. Shortcuts are registered globally via Electron globalShortcut

### 7. Single Instance (VS-007)

1. Start the app with `pnpm dev`
2. Attempt second launch — existing window is focused instead

### 8. Proxy Configuration (VS-008)

1. Open Settings > General (scroll to Proxy section)
2. Select "Manual" mode
3. Enter proxy host/port/protocol
4. Save — proxy is applied to Electron session

## Demo Components

| Component | Type | Location | Fate |
|-----------|------|----------|------|
| Settings pages (General, Display, Shortcuts, Data, About) | Promotable | `src/renderer/src/pages/settings/` | Extended by F002-F007 |
| Redux store (settings, shortcuts, runtime) | Promotable | `src/renderer/src/store/` | Extended by F002-F007 |
| IPC handlers (40 channels) | Promotable | `src/main/ipc.ts` | Extended by F002-F007 |
| Main window | Promotable | `src/main/services/WindowService.ts` | Core production component |
| Mini window / Selection toolbar | Promotable | `src/main/services/WindowService.ts` | Used by F003-chat, F006-creative |
| Dexie database (files table) | Promotable | `src/renderer/src/databases/index.ts` | Extended by F003-F004 |
| ErrorBoundary | Promotable | `src/renderer/src/App.tsx` | Production error handling |
| i18n (en-US, zh-CN, zh-TW) | Promotable | `src/renderer/src/i18n/` | Extended with more translations |

## Validation

```bash
# Run unit tests (288 tests)
pnpm test

# Run E2E tests (requires built app)
pnpm build && pnpm test:e2e

# Lint check
pnpm lint
```
