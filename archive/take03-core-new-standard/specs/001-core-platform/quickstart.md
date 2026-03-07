# Quickstart: Core Platform

**Feature**: 001-core-platform
**Date**: 2026-03-04

## Prerequisites

- Node.js >= 24.11.1
- pnpm 10
- Git

## Setup

```bash
# Clone and install dependencies
pnpm install

# Start in development mode
pnpm dev
```

## Verify Feature

### 1. App Launch (US1 - P1)
```bash
pnpm dev
# Verify: Main window appears within 3 seconds
# Verify: Window restores last position/size (after first run)
```

### 2. Configuration Persistence (US2 - P1)
- Open Settings
- Change zoom factor
- Restart app (`Ctrl+R` or quit and relaunch)
- Verify: Zoom factor is restored

### 3. Theme Switching (US3 - P1)
- Open Settings > Appearance
- Switch between Light, Dark, System
- Verify: UI updates within 200ms, no flicker
- Change OS theme while "System" is selected
- Verify: App follows OS theme

### 4. File Upload (US4 - P1)
- Use the file upload UI (or dev console: `window.api.file.upload({ filePath: '/path/to/test.pdf' })`)
- Verify: File appears in app data directory
- Verify: FileMetadata record exists in IndexedDB (DevTools > Application > IndexedDB > CherryStudio > files)

### 5. Language Switch (US5 - P2)
- Open Settings > Language
- Switch to Korean (ko-KR)
- Verify: All UI labels update without restart
- Verify: Date formatting follows Korean locale

### 6. System Tray (US6 - P2)
- Ensure tray is enabled in settings
- Minimize window
- Verify: Tray icon appears
- Right-click tray icon: verify context menu
- Click tray icon: verify window restores

### 7. Mini Window (US7 - P2)
- Enable Quick Assistant in settings
- Use the configured shortcut or tray menu
- Verify: Mini window appears on cursor's monitor
- Click outside: verify auto-hide
- Pin the window: verify it stays on blur

## Build

```bash
# Production build
pnpm build

# Package for current platform
pnpm package
```

## Test

```bash
# Run unit tests
pnpm test

# Run specific test file
pnpm test src/main/services/__tests__/FileStorageService.test.ts
```
