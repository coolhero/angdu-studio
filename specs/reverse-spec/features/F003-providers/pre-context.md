# F003-providers Pre-Context

> Feature: AI provider management (60+ system providers), model configuration, API key storage, provider health check, model capabilities detection
> Tier: 1 | SBI Range: B071–B110

---

## 1. Runtime Exploration Results

Reference: `specs/reverse-spec/runtime-exploration.md`

- **Settings screen**: #/settings → Model Provider section in left nav
- **Provider list**: Scrollable list of providers with logo, name, enable toggle
- **API key entry**: Per-provider API key input with test button
- **Model management**: Add/remove models per provider, model capabilities badges
- **Default model selector**: Settings → Default Model — select default, quick, translate models
- **CherryIN provider**: Pre-configured with `cherryin` system provider, OAuth flow available
- **Model selector dropdown**: Visible on chat screen top bar — "Qwen3-Next-80B | CherryIN"

---

## 2. Source Reference

| File Path | Role | Rebuild Target |
|-----------|------|----------------|
| `packages/aiCore/src/index.ts` | AI Core package exports: createExecutor, streamText, generateText, generateImage | `[TBD]` |
| `packages/aiCore/src/core/providers/index.ts` | Provider registry exports: register, create, get language/image/embedding models | `[TBD]` |
| `packages/aiCore/src/core/providers/registry.ts` | Global provider registry: registration, initialization, model resolution | `[TBD]` |
| `packages/aiCore/src/core/providers/factory.ts` | ProviderConfigBuilder + ProviderConfigFactory: type-safe config creation | `[TBD]` |
| `packages/aiCore/src/core/providers/schemas.ts` | Base provider IDs, Zod schemas for provider config validation | `[TBD]` |
| `packages/aiCore/src/core/providers/types.ts` | Provider type definitions: AiSdkModel, ProviderSettingsMap, etc. | `[TBD]` |
| `packages/aiCore/src/core/providers/utils.ts` | Utility: formatPrivateKey for service accounts | `[TBD]` |
| `packages/aiCore/src/core/providers/HubProvider.ts` | Hub provider: dynamic provider creation from hub config | `[TBD]` |
| `packages/aiCore/src/core/providers/RegistryManagement.ts` | Registry lifecycle management | `[TBD]` |
| `packages/ai-sdk-provider/src/cherryin-provider.ts` | CherryIN Vercel AI SDK provider: multi-endpoint (OpenAI, Anthropic, Gemini) | `[TBD]` |
| `src/renderer/src/config/providers.ts` | SYSTEM_PROVIDERS array: 60+ provider configs with logos, API hosts, default models | `[TBD]` |
| `src/renderer/src/config/models/default.ts` | SYSTEM_MODELS: default model definitions per provider (1000+ models) | `[TBD]` |
| `src/renderer/src/config/models/index.ts` | Model config barrel exports (default, embedding, vision, reasoning, tooluse, websearch, etc.) | `[TBD]` |
| `src/renderer/src/config/models/embedding.ts` | Embedding model capability flags | `[TBD]` |
| `src/renderer/src/config/models/vision.ts` | Vision model capability flags | `[TBD]` |
| `src/renderer/src/config/models/reasoning.ts` | Reasoning model capability flags | `[TBD]` |
| `src/renderer/src/config/models/tooluse.ts` | Tool-use model capability flags | `[TBD]` |
| `src/renderer/src/config/models/websearch.ts` | Web search model capability flags | `[TBD]` |
| `src/renderer/src/store/llm.ts` | LLM Redux slice: providers state, model selection, provider-specific settings | `[TBD]` |
| `src/main/services/AnthropicService.ts` | Anthropic OAuth: PKCE flow, token management, credential persistence | `[TBD]` |
| `src/main/services/VertexAIService.ts` | Vertex AI authentication: service account, access token, auth header caching | `[TBD]` |
| `src/renderer/src/i18n/label.ts` | Provider display name i18n (providerKeyMap with 60+ entries) | `[TBD]` |

---

## 3. Source Behavior Inventory (SBI)

| ID | Source Location | Behavior | Category |
|----|----------------|----------|----------|
| B071 | `config/providers.ts:69-78` | `CHERRYAI_PROVIDER` — system-level CherryAI provider config (api.cherry-ai.com) | config |
| B072 | `config/providers.ts:80+` | `SYSTEM_PROVIDERS_CONFIG` — 60+ provider configs (id, name, type, apiHost, models, enabled) | config |
| B073 | `config/models/default.ts:17-27` | `SYSTEM_MODELS.defaultModel` — 4 default models (assistant, topic naming, translation, quick) | config |
| B074 | `config/models/default.ts:28+` | `SYSTEM_MODELS[providerId]` — pre-configured model lists per provider (1000+ models total) | config |
| B075 | `config/models/index.ts` | Barrel exports for model capabilities: embedding, vision, reasoning, tooluse, websearch | config |
| B076 | `store/llm.ts:56-65` | `LlmState` — providers array, defaultModel, quickModel, translateModel, settings | state |
| B077 | `store/llm.ts:67-104` | `initialState` — default LLM state with system providers, provider-specific settings | state |
| B078 | `store/llm.ts:155-160` | `updateProvider()` — update single provider by ID (partial update) | state |
| B079 | `store/llm.ts:161-163` | `updateProviders()` — replace entire providers array | state |
| B080 | `store/llm.ts:164-166` | `addProvider()` — add new provider to beginning of list | state |
| B081 | `store/llm.ts:167-172` | `removeProvider()` — remove provider by ID | state |
| B082 | `store/llm.ts:173-183` | `addModel()` — add model to provider, deduplicate by ID, auto-enable provider | state |
| B083 | `store/llm.ts:184-192` | `removeModel()` — remove model from provider by ID | state |
| B084 | `store/llm.ts:194-196` | `setDefaultModel()` — set default assistant model | state |
| B085 | `store/llm.ts:197-199` | `setQuickModel()` — set quick assistant model | state |
| B086 | `store/llm.ts:200-202` | `setTranslateModel()` — set translation model | state |
| B087 | `store/llm.ts:140-149` | `moveProvider()` — reorder provider in list by position | state |
| B088 | `store/llm.ts:207-241` | Provider-specific settings: Ollama/LMStudio/GPUStack keepAliveTime, VertexAI credentials, AWS Bedrock auth | state |
| B089 | `store/llm.ts:243-260` | `setCherryInTokens()` / `clearCherryInTokens()` — manage CherryIN OAuth tokens | state |
| B090 | `store/llm.ts:261-276` | `updateModel()` — update model within provider by model ID | state |
| B091 | `aiCore/src/index.ts:9-15` | `createExecutor`, `streamText`, `generateText`, `generateImage` — main AI runtime API | runtime |
| B092 | `aiCore/src/index.ts:18` | `modelResolver` — global model resolution (isV2Model, isV3Model) | runtime |
| B093 | `aiCore/src/core/providers/registry.ts` | `providerRegistry` — global provider instance registry | registry |
| B094 | `aiCore/src/core/providers/registry.ts` | `registerProviderConfig()` — register provider config with ID | registry |
| B095 | `aiCore/src/core/providers/registry.ts` | `createAndRegisterProvider()` — create AI SDK provider instance and register | registry |
| B096 | `aiCore/src/core/providers/registry.ts` | `getLanguageModel()` / `getImageModel()` / `getTextEmbeddingModel()` — resolve model by provider+modelId | registry |
| B097 | `aiCore/src/core/providers/factory.ts:42-121` | `ProviderConfigBuilder` — fluent builder for provider configs (apiKey, baseURL, azure, custom) | factory |
| B098 | `aiCore/src/core/providers/factory.ts:127-291` | `ProviderConfigFactory` — static factory methods (createOpenAI, createAnthropic, createAzureOpenAI, createGoogle, createOpenAICompatible) | factory |
| B099 | `aiCore/src/core/providers/schemas.ts` | `baseProviderIds` — canonical list of base provider types (openai, anthropic, google, azure, etc.) | schema |
| B100 | `ai-sdk-provider/cherryin-provider.ts:152-337` | `createCherryIn()` — multi-endpoint provider: routes to Anthropic/Gemini/OpenAI SDK models by prefix | provider |
| B101 | `ai-sdk-provider/cherryin-provider.ts:99-100` | Model routing: `anthropic/` prefix → Anthropic SDK, `google/` prefix → Gemini SDK | provider |
| B102 | `ai-sdk-provider/cherryin-provider.ts:119-126` | Custom fetch: remove empty `tools` array + `tool_choice` from request body | provider |
| B103 | `AnthropicService.ts:36-43` | `generatePKCE()` — PKCE code verifier/challenge generation for OAuth | auth |
| B104 | `AnthropicService.ts:45-57` | `getAuthorizationURL()` — build Anthropic OAuth URL with PKCE | auth |
| B105 | `AnthropicService.ts:60-90` | `exchangeCodeForTokens()` — exchange authorization code for access/refresh tokens | auth |
| B106 | `AnthropicService.ts:93-115` | `refreshAccessToken()` — refresh expired access token | auth |
| B107 | `AnthropicService.ts:135-153` | `getValidAccessToken()` — return valid token, auto-refresh if expired | auth |
| B108 | `AnthropicService.ts:156-173` | `startOAuthFlow()` — initiate OAuth, open browser, store PKCE state | auth |
| B109 | `VertexAIService.ts:63-115` | `getAuthHeaders()` — Google service account auth with cache, PEM key formatting | auth |
| B110 | `VertexAIService.ts:117-146` | `getAccessToken()` — get OAuth2 access token for Vertex AI | auth |

---

## 4. UI Component Features

| Component | Source Hint | Description |
|-----------|------------|-------------|
| Provider List | Settings → Model Provider | List of 60+ providers with logo, name, toggle |
| Provider Config Form | Settings → Model Provider → [Provider] | API key input, host URL, model management |
| Model Selector Dropdown | Chat top bar | Provider + model name, searchable |
| Default Model Settings | Settings → Default Model | Set default, quick, translate models |
| Provider Add Button | Settings → Model Provider | Add custom OpenAI-compatible provider |
| OAuth Flow UI | Provider config (Anthropic, CherryIN) | OAuth authorization code input |
| Provider Logos | `src/renderer/src/assets/images/providers/` | 60+ provider logo images |

---

## 5. Interaction Behavior Inventory

| ID | Trigger | Response | Notes |
|----|---------|----------|-------|
| I013 | User enables a provider toggle | `updateProvider({ id, enabled: true })` → provider appears in model selector | Redux dispatch |
| I014 | User enters API key | `updateProvider({ id, apiKey })` → persisted to Redux state | Encrypted storage TBD |
| I015 | User clicks "Add Model" | Model search/fetch from provider API → `addModel({ providerId, model })` | Auto-enables provider |
| I016 | User removes a model | `removeModel({ providerId, model })` → model removed from provider | |
| I017 | User selects default model | `setDefaultModel({ model })` → used as chat default | |
| I018 | User clicks Anthropic OAuth | `startOAuthFlow()` → browser opens → user returns with code → `completeOAuthWithCode()` | PKCE flow |
| I019 | User reorders providers | `moveProvider(providers, id, position)` → provider list reordered | Drag-and-drop |
| I020 | User adds custom provider | `addProvider(provider)` → unshift to providers array | OpenAI-compatible |

---

## 6. Foundation Decisions

| Decision | Cherry Studio Value | Angdu Studio Target |
|----------|-------------------|-------------------|
| AI SDK | Vercel AI SDK v3 (`@ai-sdk/*`) | Same |
| Provider architecture | `@cherrystudio/ai-core` package | `@angdustudio/ai-core` package |
| State management | Redux (llm slice) | Zustand |
| API key storage | Redux persist (localStorage) | Zustand persist (consider encryption) |
| Provider routing | CherryIN provider routes by model prefix | AngduIN provider (same pattern) |
| Model capabilities | Static config files (vision.ts, reasoning.ts, etc.) | Same pattern |

---

## 7. Foundation Dependencies

| Package | Role |
|---------|------|
| `@ai-sdk/openai` | OpenAI provider for Vercel AI SDK |
| `@ai-sdk/anthropic` | Anthropic provider for Vercel AI SDK |
| `@ai-sdk/google` | Google/Gemini provider for Vercel AI SDK |
| `@ai-sdk/openai-compatible` | Generic OpenAI-compatible provider |
| `@ai-sdk/provider` | Provider interface definitions (V3) |
| `@ai-sdk/provider-utils` | Utilities (loadApiKey, withoutTrailingSlash) |
| `google-auth-library` | Google service account authentication (VertexAI) |
| `zod` | Schema validation for provider configs |

---

## 8. Naming Remapping

| Cherry Studio Identifier | Angdu Studio Identifier |
|--------------------------|------------------------|
| `@cherrystudio/ai-core` (package name) | `@angdustudio/ai-core` |
| `CHERRYIN_PROVIDER_NAME = 'cherryin'` | `ANGDUIN_PROVIDER_NAME = 'angduin'` |
| `DEFAULT_CHERRYIN_BASE_URL` | `DEFAULT_ANGDUIN_BASE_URL` |
| `DEFAULT_CHERRYIN_ANTHROPIC_BASE_URL` | `DEFAULT_ANGDUIN_ANTHROPIC_BASE_URL` |
| `DEFAULT_CHERRYIN_GEMINI_BASE_URL` | `DEFAULT_ANGDUIN_GEMINI_BASE_URL` |
| `CherryInProviderSettings` (interface) | `AngduInProviderSettings` |
| `CherryInProvider` (interface) | `AngduInProvider` |
| `createCherryIn()` (factory) | `createAngduIn()` |
| `cherryin.anthropic` (provider name) | `angduin.anthropic` |
| `cherryin.openai-chat` (provider name) | `angduin.openai-chat` |
| `CHERRYIN_API_KEY` (env var) | `ANGDUIN_API_KEY` |
| `CherryAI` (provider display name) | `AngduAI` |
| `CHERRYAI_PROVIDER` (constant) | `ANGDUAI_PROVIDER` |
| `api.cherry-ai.com` (API host) | TBD (Angdu API host) |
| `open.cherryin.net` (CherryIN API host) | TBD (AngduIN API host) |
| `cherryin.png` (provider logo) | `angduin.png` |
| `cherryIn` (LLM settings key) | `angduIn` |
| `setCherryInTokens` / `clearCherryInTokens` | `setAngduInTokens` / `clearAngduInTokens` |
| `IpcChannel.CherryIN_*` (6 channels) | `IpcChannel.AngduIN_*` |
| `Cherryai_GetSignature` (IPC channel) | `Angduai_GetSignature` |

---

## 9. Static Resources

| Resource | Source Path | Notes |
|----------|-----------|-------|
| Provider logos (60+) | `src/renderer/src/assets/images/providers/*.{png,webp,svg,jpeg}` | Per-provider branding |
| Model logos | `src/renderer/src/assets/images/models/*.png` | Per-model-family icons |
| CherryIN logo | `src/renderer/src/assets/images/providers/cherryin.png` | Replace with AngduIN |

---

## 10. Environment Variables

| Variable | Usage |
|----------|-------|
| `CHERRYIN_API_KEY` | Fallback API key for CherryIN provider → rename to `ANGDUIN_API_KEY` |
| `VITE_RENDERER_INTEGRATED_MODEL` | Local AI integrated model JSON (when isLocalAi=true) |
| `MAIN_VITE_CHERRYAI_CLIENT_SECRET` | CherryAI API signing secret → rename to `MAIN_VITE_ANGDUAI_CLIENT_SECRET` |

---

## 11. Feature Contracts

### Provides (exported by F003)

| Contract | Consumer | Type |
|----------|----------|------|
| `Provider[]` (state) | Chat, translate, paintings, agents — all AI features | Zustand state |
| `defaultModel` / `quickModel` / `translateModel` | Chat, Quick Assistant, Translate | Zustand state |
| `createExecutor()` / `streamText()` / `generateText()` | All AI inference features | import from ai-core |
| `getLanguageModel()` / `getImageModel()` | Runtime model resolution | import from ai-core |
| `SYSTEM_PROVIDERS` / `SYSTEM_MODELS` | Initial state, settings UI | import from config |
| Provider-specific auth (Anthropic OAuth, VertexAI) | Provider config UI | IPC |

### Consumes (required by F003)

| Contract | Provider | Type |
|----------|----------|------|
| `IpcChannel.*` | F001-shell (IPC infrastructure) | IPC |
| `window.api.vertexAI.*` | F001-shell (preload bridge) | IPC |
| `window.api.anthropic_oauth.*` | F001-shell (preload bridge) | IPC |
| `window.api.cherryin.*` | F001-shell (preload bridge) | IPC |
| `getProviderLabel()` | F002-i18n-theme (i18n labels) | import |
| Theme CSS variables | F002-i18n-theme (styling) | CSS |
| ConfigManager | F001-shell (persist provider config in main) | IPC |

---

## 12. For /speckit.specify

- The provider system has 3 layers: (1) renderer config/state, (2) preload bridge, (3) main process services
- `ai-core` package is a standalone NPM package with its own registry — this architecture should be preserved
- CherryIN provider is a custom Vercel AI SDK provider that routes models to different backends (OpenAI, Anthropic, Gemini) based on model ID prefix — complex but important for Angdu
- The 60+ system provider configs are static data — large but straightforward to migrate
- Model capability detection (vision, reasoning, tooluse, etc.) is done via static lookup tables, not runtime API calls
- API key storage is currently in Redux persist (localStorage) — consider more secure storage for Angdu

---

## 13. For /speckit.plan

- **Phase 1**: Provider type definitions + Zustand LLM store (providers, models, settings)
- **Phase 2**: `@angdustudio/ai-core` package scaffold + provider registry
- **Phase 3**: System provider configs (SYSTEM_PROVIDERS, SYSTEM_MODELS) migration with naming changes
- **Phase 4**: AngduIN custom provider (ai-sdk-provider) + model routing logic
- **Phase 5**: Anthropic OAuth service + VertexAI auth service (main process)
- **Phase 6**: Provider settings UI + model selector component

---

## 14. For /speckit.analyze

- **Key migration**: Redux `llm` slice → Zustand store with same shape but simpler boilerplate
- **Key migration**: All `cherry*` / `CherryIN*` identifiers → `angdu*` / `AngduIN*` (see Section 8)
- **Scope question**: Should the 1000+ model definitions in `default.ts` be shipped as static config or fetched from API?
- **Security**: API keys stored in plain text in localStorage via Redux persist — evaluate electron-keytar or similar
- **Package boundary**: `ai-core` and `ai-sdk-provider` are separate packages in a monorepo — preserve this structure
- The `SYSTEM_PROVIDERS_CONFIG` has provider-specific fields (anthropicApiHost, etc.) that vary by provider type — maintain this flexibility
