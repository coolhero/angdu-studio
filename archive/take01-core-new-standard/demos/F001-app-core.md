# F001 App Core — Demo Guide

## Prerequisites

- Node.js >= 20.0.0
- pnpm

## Setup

```bash
pnpm install && pnpm dev
```

## Demo Walkthrough

1. **Launch App** — Run `pnpm dev`. The Electron window should open with the Cherry Studio UI.
2. **Resize Window** — Drag the window edges. The window state (size, position) is persisted across restarts.
3. **Upload File** — Use the file select dialog to pick a file. Metadata (name, size, type) is displayed.
4. **Change Language** — Open Settings > Language. Switch between English and Chinese. The UI updates in real-time.
5. **Use Shortcuts** — Press `CommandOrControl+N` to trigger a registered shortcut (if configured).
6. **Check Logs** — Logs are written to the app data directory with daily rotation.

## Demo Components

| Component | Location | Category | Fate |
|-----------|----------|----------|------|
| Demo script | demos/scripts/demo-F001.ts | Demo-only | Remove after full UI |
| Locale files | src/renderer/src/i18n/locales/ | Production | Keep |
| ShortcutService | src/main/services/ShortcutService.ts | Production | Keep |
| LoggerService | src/main/services/LoggerService.ts | Production | Keep |
| DatabaseService | src/main/services/DatabaseService.ts | Production | Keep |
| System IPC | src/main/ipc/system.ipc.ts | Production | Keep |
| Shortcuts IPC | src/main/ipc/shortcuts.ipc.ts | Production | Keep |
| Shortcuts Store | src/renderer/src/stores/shortcuts.store.ts | Production | Keep |
