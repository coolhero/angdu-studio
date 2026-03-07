# F001 Core Platform Demo

## Prerequisites
- Node.js 20+, pnpm installed
- Run `pnpm install` in project root

## Demo Steps

### 1. App Launch
```bash
pnpm dev
```
- Main window appears within 3 seconds
- Window restores last-used position and size

### 2. Theme Toggle
- Open settings (or use devtools console)
- Switch between Light / Dark / System
- Verify immediate visual update, no flicker

### 3. Language Switch
- Change language from en-US to another locale
- All visible UI text updates without restart

### 4. File Upload
- Use the file upload dialog
- Verify file stored in app data directory
- FileMetadata saved in IndexedDB

### 5. System Tray
- Minimize to tray (if enabled)
- Click tray icon → main window restores
- Right-click tray → context menu with Show/Mini Window/Quit

### 6. Mini Window (Quick Assistant)
- Open mini window from tray or shortcut
- Verify frameless, always-on-top
- Click outside → auto-hides (unless pinned)
- Multi-monitor: opens centered on cursor's screen

### 7. Global Shortcuts
- Register a global shortcut
- Switch to another application
- Press the shortcut → Cherry Studio activates

### 8. Persistence
- Close and relaunch the app
- Theme, language, window position all restored

### 9. Crash Recovery
- Force-crash the renderer (devtools → Performance → Crash tab)
- If >60s since last crash → auto-reloads
- If <60s → app exits (crash loop prevention)

## Demo Components

| Component | Category | Fate |
|-----------|----------|------|
| Home page placeholder | Demo-only | Replace with actual content in F005 |
| Mini window placeholder | Demo-scaffold | Extended by F005 chat integration |
| Button component | Promotable | Reused across all Features |
