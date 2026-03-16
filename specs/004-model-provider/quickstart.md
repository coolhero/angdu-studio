# Quickstart: Model Provider

## Prerequisites
- F001 app-shell completed (Config API, IPC bridge, safeStorage)
- F003 settings completed (Settings page with sidebar navigation)
- Node.js 24+, pnpm

## Development
```bash
pnpm install
pnpm run dev
# Navigate to Settings → Model Provider (default sub-page)
```

## Key Files
- **Types**: `src/shared/types/provider.ts`, `src/shared/types/ai-core.ts`
- **System Providers**: `src/shared/providers/system-providers.ts`
- **Main Services**: `src/main/services/ProviderService.ts`, `ModelService.ts`, `AICoreService.ts`
- **IPC Handlers**: `src/main/ipc/provider-handlers.ts`
- **Stores**: `src/renderer/src/stores/useProviderStore.ts`, `useModelStore.ts`
- **UI**: `src/renderer/src/pages/settings/ProviderSettings/`, `ModelSettings/`

## Architecture Overview
All provider API calls run in the main process. Renderer communicates via IPC. API keys are encrypted at rest via Electron safeStorage and never sent to the renderer process.
