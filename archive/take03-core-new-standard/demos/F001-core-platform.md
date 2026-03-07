# Demo: F001 Core Platform

**Feature**: Core Platform - Electron shell, IPC bridge, window management, configuration, i18n, theming, file storage, logging, database
**Status**: Implementation complete

## Prerequisites

- Node.js 20+
- pnpm 9+
- Dependencies installed: `pnpm install`

## Demo Steps

### 1. App Launch (US1)

```bash
pnpm dev
```

**Verify**:
- Main window appears within 3 seconds
- Window restores previous position/size on re-launch
- Second instance shows existing window (try running `pnpm dev` again)

### 2. Configuration Persistence (US2)

- Open DevTools (Ctrl+Shift+I / Cmd+Option+I)
- In console: `await window.api.config.set('zoomFactor', 1.2)`
- Reload app — zoom factor persists

### 3. Theme Switching (US3)

- In console: `await window.api.app.setTheme('dark')`
- UI switches to dark mode within 200ms
- In console: `await window.api.app.setTheme('light')`
- Switch back to light mode
- In console: `await window.api.app.setTheme('system')`
- Follows OS theme

### 4. File Operations (US4)

- In console: `await window.api.file.select()`
- File picker opens
- Select a file — returns array of paths

### 5. i18n (US5)

- In console: `await window.api.app.setLanguage('ko-KR')`
- Language setting persists

### 6. System Info

- In console: `await window.api.app.getInfo()`
- Returns app version, paths, platform, architecture
- In console: `await window.api.app.getSystemInfo()`
- Returns CPU, memory, OS info

### 7. Window Controls

- In console: `await window.api.window.minimize()`
- Window minimizes
- In console: `await window.api.window.maximize()`
- Window maximizes

## Demo Components

| Component | Type | Fate |
|-----------|------|------|
| DevTools console interaction | Demo-only | Temporary — will be replaced by Settings UI (F008) |
| Home page placeholder | Demo-scaffold | Will be extended by F005 (AI Chat) |
| Window chrome | Promotable | Production-ready, used by all features |

## Running Tests

```bash
pnpm test
```

All unit tests should pass.
