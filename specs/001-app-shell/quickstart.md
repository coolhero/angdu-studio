# Quickstart: App Shell

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# Install dependencies
pnpm install

# Start development
pnpm run dev
```

## Development

The app uses electron-vite 5 with hot reload:
- Main process changes trigger automatic restart
- Renderer changes trigger HMR via Vite

## Build

```bash
# Build for current platform
pnpm run build

# Package for distribution
pnpm run package
```

## Project Structure

- `src/main/` — Electron main process (Node.js)
- `src/preload/` — Preload bridge (contextBridge)
- `src/renderer/` — React UI (browser context)
- `packages/shared/` — Shared types and enums

## Key Files

| File | Purpose |
|------|---------|
| `src/main/index.ts` | App entry point |
| `src/main/services/WindowService.ts` | Window management |
| `src/main/services/ConfigManager.ts` | Configuration |
| `src/preload/index.ts` | IPC bridge |
| `src/renderer/index.html` | Main window |
