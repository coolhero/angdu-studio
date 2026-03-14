# F003-provider Pre-Context

## Feature Overview

AI provider configuration, API key management, model listing, and multi-provider support. This feature manages 60+ system provider definitions, custom provider creation, model registries, provider-specific configuration (VertexAI, AWS Bedrock, Ollama, LM Studio, GPUStack), API key rotation, model fetching, and provider health checks. The provider/model architecture is the core data layer for all AI interactions.

Identity remapping: cherryin/CherryIN -> angduin/AngduIN (or remove entirely), CherryAI -> AngduAI.

## Runtime Exploration Results

- **State management**: Redux Toolkit `llm` slice in renderer
- **Provider count**: 60+ system providers defined in SystemProviderIdSchema
- **Provider types**: 11 ProviderType variants: openai, openai-response, anthropic, gemini, azure-openai, vertexai, mistral, aws-bedrock, vertex-anthropic, new-api, gateway, ollama
- **Model types**: 7 ModelType variants: text, vision, embedding, reasoning, function_calling, web_search, rerank
- **Endpoint types**: 6 EndpointType variants: openai, openai-response, anthropic, gemini, image-generation, jina-rerank
- **Model registry**: 12 model config files (default, embedding, openai, qwen, reasoning, tooluse, vision, websearch, logo, utils, index, tests)
- **Provider service**: Lookup functions (getProviderByModel, getProviderById, getProviderName)
- **Auth types**: apiKey (standard), oauth (302ai, silicon, aihubmix, ppio, tokenflux, aionly), IAM (AWS Bedrock), service account (VertexAI), Copilot device flow

## Source Reference

All paths relative to cherry-studio root.

| File | Purpose | Lines |
|------|---------|-------|
| `src/renderer/src/store/llm.ts` | LLM Redux slice: LlmState, provider CRUD, model CRUD, LlmSettings | ~308 |
| `src/renderer/src/types/provider.ts` | Provider/ProviderType/SystemProviderId type definitions, 60+ system provider IDs | ~318 |
| `src/renderer/src/types/index.ts` (lines 282-328) | Model, ModelType, ModelCapability, ModelPricing, EndpointType types | ~50 |
| `src/renderer/src/services/ProviderService.ts` | getProviderByModel, getProviderById, getProviderName, auth/charge support checks | ~58 |
| `src/renderer/src/hooks/useProvider.ts` | useProviders, useProvider, useAllProviders, useSystemProviders, useUserProviders hooks | ~101 |
| `src/renderer/src/config/providers.ts` | SYSTEM_PROVIDERS array: 60+ provider definitions with id, name, type, apiHost, logo | ~1000+ |
| `src/renderer/src/config/models/index.ts` | SYSTEM_MODELS aggregation | - |
| `src/renderer/src/config/models/default.ts` | Default model definitions | - |
| `src/renderer/src/config/models/openai.ts` | OpenAI model registry | - |
| `src/renderer/src/config/models/qwen.ts` | Qwen model registry | - |
| `src/renderer/src/config/models/reasoning.ts` | Reasoning model definitions | - |
| `src/renderer/src/config/models/vision.ts` | Vision-capable model definitions | - |
| `src/renderer/src/config/models/embedding.ts` | Embedding model definitions | - |
| `src/renderer/src/config/models/tooluse.ts` | Function-calling model definitions | - |
| `src/renderer/src/config/models/websearch.ts` | Web-search-capable model definitions | - |
| `src/renderer/src/config/models/logo.ts` | Model logo/icon mappings | - |
| `src/renderer/src/config/models/utils.ts` | Model utility functions | - |
| `src/renderer/src/pages/settings/ProviderSettings/` | Provider settings UI (enable/disable, apiKey, apiHost, models) | - |
| `src/renderer/src/pages/settings/ModelSettings/` | Model settings UI (capabilities, pricing) | - |
| `src/renderer/src/aiCore/provider/providerConfig.ts` | Provider factory config, formatProviderApiHost, prepareSpecialProviderConfig | - |
| `packages/shared/config/providers.ts` | Shared provider configurations | - |

## Source Behavior Inventory

### B001 — Provider Data Model
- **Source**: `src/renderer/src/types/provider.ts` lines 103-139
- **Behavior**: Provider type: id (string, matches SystemProviderId for built-in), type (ProviderType enum), name, apiKey, apiHost, anthropicApiHost (optional), apiVersion (optional), models (Model[]), enabled (bool), isSystem (bool), isAuthed (bool), rateLimit (number), apiOptions (ProviderApiOptions), serviceTier, verbosity, authType ('apiKey'|'oauth'), isVertex, notes, extra_headers, anthropicCacheControl.

### B002 — Model Data Model
- **Source**: `src/renderer/src/types/index.ts` lines 312-328
- **Behavior**: Model type: id (string), provider (string, reference to Provider.id), name (display name), group (category string), owned_by (optional), description (optional), capabilities (ModelCapability[]), type (deprecated ModelType[]), pricing (ModelPricing: input_per_million_tokens, output_per_million_tokens, currencySymbol), endpoint_type (EndpointType), supported_endpoint_types (EndpointType[]), supported_text_delta (bool).

### B003 — System Provider Registry
- **Source**: `src/renderer/src/types/provider.ts` lines 141-273, `src/renderer/src/config/providers.ts`
- **Behavior**: 60+ system providers defined in SystemProviderIdSchema. Each has a unique string ID. isSystemProvider() checks both ID match and isSystem flag. SYSTEM_PROVIDERS array in config/providers.ts provides full definitions with logos, default apiHost, and type mapping.

### B004 — LLM State Management
- **Source**: `src/renderer/src/store/llm.ts`
- **Behavior**: LlmState contains: providers (Provider[]), defaultModel, topicNamingModel (deprecated), quickModel, translateModel, quickAssistantId, settings (LlmSettings). LlmSettings contains provider-specific configs: ollama/lmstudio/gpustack (keepAliveTime), vertexai (serviceAccount, projectId, location), awsBedrock (authType, accessKeyId, secretAccessKey, apiKey, region), cherryIn (accessToken, refreshToken).

### B005 — Provider CRUD Operations
- **Source**: `src/renderer/src/store/llm.ts` lines 155-172
- **Behavior**: updateProvider: partial update by id (Object.assign). updateProviders: replace entire array. addProvider: unshift (prepend). removeProvider: splice by id. moveProvider: reorder by index.

### B006 — Model CRUD Operations
- **Source**: `src/renderer/src/store/llm.ts` lines 173-195
- **Behavior**: addModel: concat to provider's models array with uniqBy('id'), auto-enables provider. removeModel: filter out by model.id. updateModel: find provider, find model index, replace. setDefaultModel, setQuickModel, setTranslateModel: direct assignment.

### B007 — Provider Lookup
- **Source**: `src/renderer/src/services/ProviderService.ts`
- **Behavior**: getProviderByModel(model): looks up provider by model.provider ID from store. Special case: if provider is 'cherryai', maps specific model IDs (Qwen3-8B, Qwen3-Next-80B) to 'cherryin' provider. getProviderById(id): simple find from store providers.

### B008 — Provider Hook API
- **Source**: `src/renderer/src/hooks/useProvider.ts`
- **Behavior**: useProviders(): returns enabled providers + CHERRYAI_PROVIDER, with CRUD dispatch functions. useProvider(id): returns single provider with update/addModel/removeModel/updateModel dispatchers. useAllProviders(): all providers. useSystemProviders(): filtered to isSystemProvider. useUserProviders(): filtered to !isSystemProvider. All providers are normalized (trailing slash removed from apiHost via withoutTrailingSlash).

### B009 — Provider API Options
- **Source**: `src/renderer/src/types/provider.ts` lines 25-48
- **Behavior**: ProviderApiOptions flags (all boolean, undefined=supported): isNotSupportArrayContent, isNotSupportStreamOptions, isNotSupportDeveloperRole (deprecated) / isSupportDeveloperRole, isNotSupportServiceTier (deprecated) / isSupportServiceTier, isNotSupportEnableThinking, isNotSupportAPIVersion, isNotSupportVerbosity. These control parameter inclusion when making API calls to different providers.

### B010 — Service Tier Configuration
- **Source**: `src/renderer/src/types/provider.ts` lines 53-90
- **Behavior**: OpenAIServiceTier: 'auto'|'default'|'flex'|'priority'|undefined|null. GroqServiceTier: 'auto'|'on_demand'|'flex'|undefined|null. ServiceTier = union of both. Each provider can have its own serviceTier override. Null means explicitly off, undefined means use default.

### B011 — Auth Type Support
- **Source**: `src/renderer/src/services/ProviderService.ts` lines 45-53
- **Behavior**: isProviderSupportAuth: only '302ai', 'silicon', 'aihubmix', 'ppio', 'tokenflux', 'aionly' support OAuth. isProviderSupportCharge: only '302ai', 'silicon', 'aihubmix', 'ppio' support balance/charge checking.

### B012 — AWS Bedrock Auth
- **Source**: `src/renderer/src/store/llm.ts`, `src/renderer/src/types/provider.ts` lines 92-101
- **Behavior**: Two auth types: 'iam' (accessKeyId + secretAccessKey) and 'apiKey' (simple API key). Settings stored in LlmSettings.awsBedrock, not in individual provider objects.

### B013 — VertexAI Configuration
- **Source**: `src/renderer/src/store/llm.ts` lines 82-90
- **Behavior**: Requires serviceAccount (privateKey, clientEmail), projectId, location. Settings stored in LlmSettings.vertexai. VertexProvider type extends Provider with googleCredentials, project, location.

### B014 — Local Provider Settings
- **Source**: `src/renderer/src/store/llm.ts` lines 74-81
- **Behavior**: ollama, lmstudio, gpustack each have keepAliveTime setting (default 0). Controls how long local models stay loaded in memory.

### B015 — CherryIN Token Management
- **Source**: `src/renderer/src/store/llm.ts` lines 243-260
- **Behavior**: setCherryInTokens: stores accessToken and optional refreshToken in LlmSettings.cherryIn. clearCherryInTokens: resets both to empty string. Lazy initialization of cherryIn object if missing.

### B016 — Provider Type to Endpoint Mapping
- **Source**: `src/renderer/src/types/provider.ts` (ProviderTypeSchema), `src/renderer/src/types/index.ts` (EndPointTypeSchema)
- **Behavior**: ProviderType determines the API client and request format. EndpointType determines the specific API endpoint used for a model within a provider. A single provider may support multiple endpoint types (e.g., openai provider can have both 'openai' and 'openai-response' endpoint models).

### B017 — Anthropic Cache Control
- **Source**: `src/renderer/src/types/provider.ts` lines 82-86
- **Behavior**: Per-provider AnthropicCacheControlSettings: tokenThreshold (minimum tokens to trigger caching), cacheSystemMessage (bool), cacheLastNMessages (number). Only applicable to Anthropic-type providers.

### B018 — Model Capabilities System
- **Source**: `src/renderer/src/types/index.ts` lines 303-310
- **Behavior**: ModelCapability has type (ModelType) and isUserSelected (optional bool). If isUserSelected is true, user manually enabled this capability; if false, user manually disabled it; if undefined, use default detection. This allows overriding auto-detected capabilities per model.

## Environment Variables

| Variable | Context | Purpose |
|----------|---------|---------|
| `VITE_RENDERER_INTEGRATED_MODEL` | Build | Pre-configured model JSON for integrated/local-AI mode |

## For /speckit.specify

- Provider data model: 60+ system providers, custom provider support, per-provider API options and service tiers
- Model registry: Static model definitions (capabilities, pricing, endpoint types) + dynamic model fetching
- Auth patterns: API key (most), OAuth (6 providers), IAM (AWS Bedrock), service account (VertexAI), device flow (Copilot)
- Configuration hierarchy: LlmSettings (provider-specific) + Provider.apiOptions (per-provider API behavior)
- CRUD: Full provider and model lifecycle management via Redux actions and hooks

## For /speckit.plan

- State migration: Redux llm slice -> Zustand store. LlmState shape is the primary target.
- Provider registry: SYSTEM_PROVIDERS array defines all built-in providers. Custom providers are user-created and stored alongside system providers.
- Model registry: Config files under config/models/ define static model metadata. Dynamic model fetching adds/updates models at runtime.
- Hook API: useProviders/useProvider pattern provides component-level access with dispatch wrappers
- Provider config: aiCore/provider/providerConfig.ts handles provider-specific API configuration (special headers, URL formatting, parameter preparation)

## Feature Contracts

### Provided (downstream features depend on these)

| Contract | Consumer | Description |
|----------|----------|-------------|
| `LlmState.providers` | Chat, assistant, painting features | Available provider list |
| `LlmState.defaultModel` | Chat feature | Default model for new conversations |
| `getProviderByModel(model)` | Chat, AI core features | Provider lookup by model reference |
| `Provider.apiKey/apiHost` | AI core (API calls) | Credentials and endpoint for API requests |
| `Provider.type` | AI core (client factory) | Determines which API client to use |
| `Model.capabilities` | Chat, assistant features | Model capability detection |
| `Model.endpoint_type` | AI core | API endpoint selection |
| `useProvider(id)` | Settings UI, chat components | Provider data + CRUD hooks |
| `LlmSettings.vertexai/awsBedrock/ollama` | AI core (provider config) | Provider-specific auth and settings |

### Required (this feature depends on)

| Contract | Provider | Description |
|----------|----------|-------------|
| `window.api.config.get/set` | F001-app-shell | IPC for CherryIN token persistence |
| `ConfigManager` | F001-app-shell | Main process config for provider-related settings |
| `SettingsState.proxyMode/Url` | F002-settings | Proxy for API calls |
| `SettingsState.openAI.*` | F002-settings | OpenAI-specific parameters (summaryText, verbosity, streamOptions) |
