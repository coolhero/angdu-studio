# F004 Model Provider — Interface Verification (Guard 6a)

> Provides interface verification from F005 consumer perspective.

## 1. useModelStore.hydrate()

**Interface**: `async () => Promise<void>` — fetches providers from main via `provider:list` IPC
**Consumer**: `App.tsx` calls on startup
**Verification**: Code path traced:
- `App.tsx` → `useProviderStore.getState().hydrate()`
- `hydrate()` → `window.api.invoke('provider:list')` → `ProviderService.list()`
- Response merged with localStorage state (API keys stripped from persist)
- **Result**: ✅ PASS — hydrate chain complete, providers available after startup

## 2. AI SDK .chat() API

**Interface**: `providerClient.chat(providerId, modelId, messages, options)` → IPC `ai:chat`
**Consumer**: `useChatStore.sendMessage()`
**Verification**: Code path traced:
- `useChatStore` → `providerClient.chat()`
- `provider-client.ts:15` → `window.api.invoke('ai:chat', ...)`
- `AICoreService.chat()` → `streamText()` from `ai` package
- `createSdkModel()` uses `.chat(model.id)` pattern → forces `/v1/chat/completions`
- **Result**: ✅ PASS — chat path works end-to-end with correct API endpoint

## 3. baseURL /v1 Pattern

**Interface**: Provider endpoint URL normalization
**Consumer**: All provider API calls
**Verification**: Code review of `AICoreService.createSdkModel()`:
- `URL_TRANSFORM_RULES` in `@shared/types/provider.ts` handles per-provider URL normalization
- Gemini: appends `/openai` suffix
- Ollama: strips `/api` suffix
- OpenAI-compatible: uses endpoint as-is
- `.chat()` call forces `/v1/chat/completions` path regardless of AI SDK v6 default
- **Result**: ✅ PASS — URL transforms correctly applied, chat endpoint forced

## 4. Stream Event Flow

**Interface**: `ai:stream-chunk`, `ai:stream-complete`, `ai:stream-error` IPC events
**Consumer**: `ChatStreamService.ts`
**Verification**: Code path traced:
- `AICoreService.chat()` iterates `streamText().fullStream`
- Each chunk → `window.webContents.send('ai:stream-chunk', { requestId, chunk })`
- On complete → `ai:stream-complete` with optional `usage` data
- On error → `ai:stream-error` with serialized error
- `ChatStreamService` subscribes via `window.api.on()` and routes by `requestId`
- `BlockBuilder` processes chunks into block state
- **Result**: ✅ PASS — stream lifecycle correctly managed with requestId correlation

## 5. API Key Security

**Interface**: Electron safeStorage for API key encryption
**Consumer**: ProviderService (main process only)
**Verification**:
- `useProviderStore` persists providers with `apiKey: ''` (stripped)
- Actual keys stored via `provider:setApiKey` IPC → `ProviderService.setApiKey()` → `safeStorage.encryptString()`
- Keys never cross IPC boundary in plaintext after initial set
- **Result**: ✅ PASS — keys encrypted at rest, not leaked to renderer persist

## Summary

All 5 Provides interfaces verified from consumer perspective. No blocking issues found.
