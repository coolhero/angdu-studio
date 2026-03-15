# F004 — Provider Management — Pre-Context

> Feature ID: F004 | Tier: 1 | Release Group: RG-3

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/provider.ts` | Provider, ProviderType, SystemProvider types; Zod schemas |
| `src/renderer/src/store/llm.ts` | Provider state, LlmSettings (Vertex, AWS, Copilot creds) |
| `src/renderer/src/config/providers.ts` | SYSTEM_PROVIDERS definitions |
| `src/main/services/CopilotService.ts` | GitHub Copilot OAuth device code flow |
| `src/main/services/AnthropicService.ts` | Anthropic OAuth authorization code flow |
| `src/main/services/VertexAIService.ts` | Google Vertex AI auth (service account) |
| `src/main/services/CherryINOAuthService.ts` | CherryIN OAuth (maps to AngduIN) |
| `src/main/utils/aes.ts` | API key encryption/decryption |
| `src/main/ipc.ts` | Copilot_*, Anthropic_*, VertexAI_*, CherryIN_* handlers |
| `src/renderer/src/pages/settings/` | Provider settings UI |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B038 | `types/provider.ts` | `ProviderTypeSchema` | 12 provider types: openai, openai-response, anthropic, gemini, azure-openai, vertexai, mistral, aws-bedrock, vertex-anthropic, new-api, gateway, ollama | P1 | Source |
| B039 | `types/provider.ts` | `Provider` type | Provider entity with id, type, name, apiKey, apiHost, models[], enabled, isSystem | P1 | Source |
| B040 | `types/provider.ts` | `SystemProviderIdSchema` | 60+ system provider IDs (openai, anthropic, gemini, ollama, deepseek, etc.) | P1 | Source |
| B041 | `store/llm.ts` | `providers: Provider[]` | State array of all configured providers (system + custom) | P1 | Source |
| B042 | `store/llm.ts` | `LlmSettings` | Provider-specific settings: ollama keepAlive, vertexai service account, awsBedrock auth | P1 | Source |
| B043 | `CopilotService.ts` | `getAuthMessage()` / `getCopilotToken()` | GitHub Copilot device code OAuth flow | P1 | Source |
| B044 | `AnthropicService.ts` | `startOAuthFlow()` / `completeOAuthWithCode()` | Anthropic authorization code OAuth | P1 | Source |
| B045 | `utils/aes.ts` | `encrypt()` / `decrypt()` | AES encryption for API key storage at rest | P1 | Source |
| B046 | `types/provider.ts` | `ProviderApiOptions` | Per-provider feature flags: isNotSupportArrayContent, isNotSupportStreamOptions, etc. | P2 | Source |
| B047 | `types/provider.ts` | `ServiceTier` | OpenAI service tier: auto, default, flex, priority | P2 | Source |
| B048 | `types/provider.ts` | `AnthropicCacheControlSettings` | Anthropic prompt caching: tokenThreshold, cacheSystemMessage, cacheLastNMessages | P2 | Source |
| B049 | `store/llm.ts` | provider add/update/remove | CRUD operations on providers array with Redux actions | P1 | Source |

---

## For /speckit.specify Hints

- Define provider CRUD operations and validation rules
- Specify API key encryption scheme
- Document OAuth flows (device code for Copilot, auth code for Anthropic)
- Define health check protocol per provider type
- Specify system provider immutability rules

## For /speckit.plan Hints

- Task 1: Provider Zustand store with persist
- Task 2: Provider CRUD UI (add/edit/delete)
- Task 3: API key encryption service (main process)
- Task 4: OAuth flows (Copilot device code, Anthropic auth code)
- Task 5: Provider health check
- Task 6: System provider registry

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | IPC bridge for OAuth and encryption |
| Depends on F008 | Data & Storage | Provider persistence |
| Provides to F005 | Model Management | Provider config for model listing APIs |
| Provides to F006 | Chat Core | Provider config for LLM API calls |
| Depends on F007 | Settings System | Provider settings UI integration |
