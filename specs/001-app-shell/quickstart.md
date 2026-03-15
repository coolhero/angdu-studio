# Quickstart: App Shell

## Prerequisites

- Node.js >= 24.11.1
- pnpm (package manager)
- Git

## Setup

```bash
# Clone and install
git clone <repo-url> angdu-studio
cd angdu-studio
pnpm install

# Start development
pnpm dev
```

## Development Commands

```bash
pnpm dev          # Start electron-vite dev server with HMR
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run Vitest unit/integration tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm lint         # Run linter
pnpm typecheck    # Run TypeScript type checking
```

## Project Layout

```
src/
├── main/           # Electron main process (Node.js)
├── preload/        # Preload scripts (contextBridge)
├── renderer/       # React UI (Chromium)
└── shared/         # Shared types (used by all processes)
```

## Verify App Shell

1. Run `pnpm dev` — window should appear at 960×600
2. Resize and close the window, then `pnpm dev` again — window should restore previous size/position
3. Check system tray — app icon should be visible
4. Click tray icon — window should toggle visibility
5. Check DevTools console — no errors on startup

## Key Architecture Decisions

- **IPC Bridge**: All main↔renderer communication via typed contextBridge (see `src/shared/types/ipc.ts`)
- **Config**: better-sqlite3 in main process (not electron-store)
- **State**: Zustand in renderer for UI state
- **Styling**: Tailwind CSS 4 + shadcn/ui components
