# Quickstart: F002-ai-provider

## Prerequisites

- Node.js 20+, pnpm
- F001-app-core implemented and working
- At least one AI provider API key (e.g., OpenAI, Anthropic)

## Setup

```bash
pnpm install
```

## Run

```bash
# Development mode
pnpm dev

# With CDP for Playwright testing
npx electron-vite dev -- --remote-debugging-port=9222
```

## Verify

```bash
# Run tests
pnpm test

# Run build
pnpm build
```

## Try It

1. Launch the app with `pnpm dev`
2. Open DevTools (Ctrl+Shift+I)
3. Test provider store:
   ```javascript
   // Add a provider
   window.__ZUSTAND_DEVTOOLS__?.useProviderStore?.getState()?.addProvider({
     id: 'test-openai',
     type: 'openai',
     name: 'Test OpenAI',
     apiKey: 'sk-test-...',
     apiHost: 'https://api.openai.com',
     models: [],
     enabled: true
   })

   // Check providers
   window.__ZUSTAND_DEVTOOLS__?.useProviderStore?.getState()?.providers
   ```

## Key Files

| File | Purpose |
|------|---------|
| `src/renderer/src/aiCore/` | AI Core — factory, plugins, streaming |
| `src/renderer/src/stores/useProviderStore.ts` | Provider Zustand store |
| `src/renderer/src/config/providers.ts` | System provider definitions |
| `src/renderer/src/config/models.ts` | System model definitions |
| `src/main/services/AnthropicService.ts` | Anthropic OAuth (main process) |
| `src/main/services/VertexAIService.ts` | VertexAI auth (main process) |
| `src/main/services/CopilotService.ts` | GitHub Copilot tokens (main process) |
