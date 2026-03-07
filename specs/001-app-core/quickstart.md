# Quickstart: App Core

**Feature Branch**: `001-app-core`
**Date**: 2026-03-07

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Git

## Setup

```bash
# Clone and install
git clone <repo-url> angdu-studio
cd angdu-studio
pnpm install

# Copy environment template
cp .env.example .env
```

## Development

```bash
# Start in development mode (electron-vite dev server)
pnpm dev
```

This launches the Electron app with hot-reload for both main and renderer processes.

## Build

```bash
# Build for current platform
pnpm build
```

## Test

```bash
# Run unit and integration tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests (requires built app)
pnpm test:e2e
```

## Key Directories

| Path | Purpose |
|------|---------|
| `src/main/` | Main process (Node.js services, IPC handlers) |
| `src/main/services/` | Singleton services (ConfigManager, WindowService, etc.) |
| `src/preload/` | Preload bridge (contextBridge API) |
| `src/renderer/src/` | Renderer process (React UI) |
| `src/renderer/src/stores/` | Zustand stores |
| `src/renderer/src/components/ui/` | shadcn/ui components |
| `src/shared/` | Shared types and IPC channel constants |
| `specs/001-app-core/` | Feature specifications and plans |

## Verification

After setup, verify the app core works:

1. `pnpm dev` — App window opens with default theme
2. Toggle theme (Light/Dark/System) — Immediate visual change
3. Check system tray — Icon with context menu
4. Check logs — `userData/logs/` directory contains structured JSON logs
