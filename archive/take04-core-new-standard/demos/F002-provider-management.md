# F002 — Provider Management Demo

**Feature**: F002-provider-management
**Status**: Demo-Ready

## Prerequisites

- F001-core-platform complete (app shell, IPC, stores)
- `pnpm install` completed
- App running via `pnpm dev`

## Demo Scenarios

### 1. View System Provider List

1. Open the app with `pnpm dev`
2. The LLM store initializes with 64 system providers from `SYSTEM_PROVIDERS`
3. Verify in DevTools Console:
   ```js
   // Access the store
   const state = JSON.parse(localStorage.getItem('cherry-studio-llm'))
   console.log('Provider count:', state.state.providers.length)
   ```

### 2. Add API Key to Provider

1. In DevTools Console, test the store actions:
   ```js
   // Import is not needed — the store is already initialized via Zustand persist
   const store = JSON.parse(localStorage.getItem('cherry-studio-llm'))

   // Or test via the preload API (from renderer):
   // The store can be accessed through React hooks (useProvider, useModel)
   ```

2. Verify the provider's `apiKey` is updated and `enabled` stays as-is

### 3. Test Provider Connectivity

1. From DevTools Console in the renderer:
   ```js
   window.api.provider.checkConnectivity({
     id: 'openai',
     name: 'OpenAI',
     type: 'openai',
     apiKey: 'YOUR_API_KEY',
     apiHost: 'https://api.openai.com',
     models: [],
     enabled: true,
     isSystem: true
   }).then(result => console.log('Connectivity:', result))
   ```
2. With a valid API key, expect `{ ok: true, models: [...] }`
3. Without a key, expect `{ ok: false, error: 'HTTP 401: ...' }`

### 4. Add Custom Provider

1. Use the store action to add a custom (non-system) provider:
   ```js
   // The addProvider action prepends to the provider list
   // New providers appear at the top
   ```
2. Verify the provider appears in the list with `isSystem: false`

### 5. Model Management

1. Add a model to a provider — auto-enables the provider
2. Add a duplicate model ID — should be deduplicated
3. Remove a model — provider stays enabled

### 6. Default Model Selection

1. Default models are pre-configured:
   - Chat: Qwen 3 Next 80B (CherryAI)
   - Topic Naming: Qwen 3 8B (CherryAI)
   - Quick Actions: Qwen 3 Next 80B
   - Translation: Qwen 3 Next 80B

2. Change default model via store:
   ```js
   useLlmStore.getState().setDefaultModel({ id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai' })
   ```

### 7. OAuth Flows (Main Process)

OAuth services run in the main process. Testing requires actual credentials:

- **Copilot**: Device Code flow — opens GitHub login, user enters code
- **CherryIN**: PKCE flow — opens browser, callback via deep link
- **Anthropic**: PKCE flow — opens console.anthropic.com, user pastes code
- **VertexAI**: Service account auth — uses GCP credentials

### 8. CherryAI Fallback

1. Even with no providers enabled, CherryAI is always available
2. The `useProviders()` hook injects CherryAI at the end of the enabled list
3. Default models point to CherryAI's Qwen models

## Demo Components

| Component | Type | Fate |
|-----------|------|------|
| `src/renderer/src/config/providers.ts` | Promotable | Core provider config — used by F008 Settings UI |
| `src/renderer/src/config/models/` | Promotable | Model config + utils — used by F003 AI Core, F005 Chat |
| `src/renderer/src/stores/useLlmStore.ts` | Promotable | Provider state management — used by all AI features |
| `src/renderer/src/hooks/useProvider.ts` | Promotable | Provider hooks — used by F005 Chat, F008 Settings |
| `src/renderer/src/hooks/useModel.ts` | Promotable | Model hooks — used by F005 Chat |
| `src/main/services/CopilotService.ts` | Promotable | Copilot OAuth — used by F008 Settings UI |
| `src/main/services/CherryINOAuthService.ts` | Promotable | CherryIN OAuth — used by F008 Settings UI |
| `src/main/services/AnthropicOAuthService.ts` | Promotable | Anthropic OAuth — used by F008 Settings UI |
| `src/main/services/VertexAIService.ts` | Promotable | VertexAI auth — used by F003 AI Core |
| `src/preload/api/provider.ts` | Promotable | IPC bridge — used by renderer for all OAuth/connectivity |
| `src/main/ipc/provider.ipc.ts` | Promotable | IPC handlers — wires all provider operations |
| Provider logo assets (80 images) | Promotable | Static assets — used by F008 Settings UI |
| Model logo assets (145 images) | Promotable | Static assets — used by F005 Chat UI |

## Test Coverage

```
Tests:  118 passed (118)
- Provider types: 9 tests
- Provider config: 16 tests
- LLM store: 21 tests (17 original + 4 settings)
- CopilotService: 9 tests
- CherryINOAuthService: 8 tests
- AnthropicOAuthService: 12 tests
- VertexAIService: 8 tests
- F001 tests: 35 tests (unchanged)
```
