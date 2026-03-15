# F004 - model-provider: Pre-Context

## 1. Runtime Exploration Results

| Observation | Value | Relevance |
|---|---|---|
| Settings route | #/settings → Provider sub-page | Provider management lives within settings |
| No direct top-level screen | Provider/model config is sub-page of settings | UI is settings-embedded |

**Screens owned**: Provider settings page (add/edit/delete providers), Model settings page (model list, model config), provider-specific auth flows.

## 2. Source Reference

| File Path | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/store/llm.ts | LLM/provider state (Redux slice) | [TBD] |
| src/renderer/src/services/ProviderService.ts | Provider CRUD and management | [TBD] |
| src/renderer/src/services/ModelService.ts | Model info, capabilities, pricing | [TBD] |
| src/renderer/src/hooks/useModel.ts | Model selection hook | [TBD] |
| src/renderer/src/pages/settings/ProviderSettings/ | Provider settings UI (list, add, edit) | [TBD] |
| src/renderer/src/pages/settings/ModelSettings/ | Model settings UI (list, config) | [TBD] |
| packages/ai-core/ | AI core abstraction layer | [TBD] |
| packages/ai-sdk-provider/ | AI SDK provider bundle | [TBD] |
| src/main/services/AnthropicService.ts | Anthropic API integration | [TBD] |
| src/main/services/CopilotService.ts | GitHub Copilot integration | [TBD] |
| src/main/services/VertexAIService.ts | Google Vertex AI integration | [TBD] |
| src/main/services/CherryINOAuthService.ts | CherryIN OAuth service | [TBD] |
| src/renderer/src/types/index.d.ts | Model/Provider type definitions | [TBD] |

## 3. Source Behavior Inventory

| ID | File | Behavior | Priority |
|---|---|---|---|
| B081 | llm.ts | Store provider list in state | P1 |
| B082 | llm.ts | Store model list per provider | P1 |
| B083 | llm.ts | Active provider/model selection | P1 |
| B084 | llm.ts | Provider enable/disable toggle | P1 |
| B085 | ProviderService.ts | Add new provider (type, API key, endpoint) | P1 |
| B086 | ProviderService.ts | Edit provider configuration | P1 |
| B087 | ProviderService.ts | Delete provider with confirmation | P1 |
| B088 | ProviderService.ts | Test provider connection (API key validation) | P1 |
| B089 | ProviderService.ts | List available provider types (OpenAI, Anthropic, etc.) | P1 |
| B090 | ProviderService.ts | Provider-specific configuration fields | P2 |
| B091 | ModelService.ts | Fetch available models from provider API | P1 |
| B092 | ModelService.ts | Cache model list locally | P2 |
| B093 | ModelService.ts | Model capabilities metadata (vision, function calling, etc.) | P2 |
| B094 | ModelService.ts | Model pricing/token info | P3 |
| B095 | ModelService.ts | Custom model addition (manual entry) | P2 |
| B096 | useModel.ts | Get current model for active assistant | P1 |
| B097 | useModel.ts | Switch model and persist selection | P1 |
| B098 | ProviderSettings/ | Render provider list with status indicators | P1 |
| B099 | ProviderSettings/ | Provider add form (type selection, config fields) | P1 |
| B100 | ProviderSettings/ | Provider edit form with API key masking | P1 |
| B101 | ProviderSettings/ | Provider delete with dependency check | P2 |
| B102 | ModelSettings/ | Render model list grouped by provider | P1 |
| B103 | ModelSettings/ | Model search/filter | P2 |
| B104 | ModelSettings/ | Model enable/disable per provider | P2 |
| B105 | ai-core/ | Unified provider interface (chat, complete, stream) | P1 |
| B106 | ai-core/ | Request/response normalization across providers | P1 |
| B107 | ai-core/ | Error handling and retry logic | P1 |
| B108 | AnthropicService.ts | Anthropic-specific API integration (messages API) | P1 |
| B109 | VertexAIService.ts | Vertex AI OAuth and API integration | P2 |
| B110 | CopilotService.ts | GitHub Copilot token extraction and API | P3 |

## 4. UI Component Features

| Source Component | Library | Usage | New Stack Equivalent |
|---|---|---|---|
| Form | AntD Form | Provider add/edit forms | shadcn/ui Form (react-hook-form) |
| Input | AntD Input | API key, endpoint URL | shadcn/ui Input |
| Input.Password | AntD Input.Password | API key with show/hide | shadcn/ui Input type="password" |
| Select | AntD Select | Provider type, model selection | shadcn/ui Select |
| Switch | AntD Switch | Provider/model enable toggle | shadcn/ui Switch |
| List | AntD List | Provider list, model list | shadcn/ui custom list |
| Tag | AntD Tag | Model capabilities (vision, etc.) | shadcn/ui Badge |
| Button | AntD Button | Test connection, add, delete | shadcn/ui Button |
| Modal | AntD Modal | Confirm delete, add provider | shadcn/ui Dialog |
| Spin | AntD Spin | Loading during API calls | shadcn/ui loading spinner |
| message | AntD message | Success/error toast | shadcn/ui Toast (sonner) |

## 5. Interaction Behavior Inventory

| Interaction | Trigger | Behavior |
|---|---|---|
| Add provider | Click "Add Provider" button | Open provider type selector, then config form |
| Test connection | Click "Test" button | Send test request, show success/error |
| API key paste | Paste into API key field | Auto-trim whitespace, validate format |
| Provider delete | Click delete icon | Show confirmation if models in use |
| Model refresh | Click refresh on model list | Re-fetch models from provider API |
| Model search | Type in model search box | Filter model list in real-time |
| Provider reorder | Drag provider in list | Change provider display order |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Provider abstraction | Unified interface via ai-core | Swap providers without changing chat logic |
| API key storage | Encrypted in better-sqlite3 | Security: keys must not be plaintext on disk |
| Model list | Cached locally, refreshable | Avoid API call on every model selection |
| Provider SDK | Vercel AI SDK or custom | Evaluate: Vercel AI SDK simplifies multi-provider |
| State management | Zustand (new stack) | Replaces Redux llm slice |

## 7. Foundation Dependencies

| Relationship | Item | Direction |
|---|---|---|
| **owns** | Provider CRUD and state | F004 exclusive |
| **owns** | Model registry and metadata | F004 exclusive |
| **owns** | AI core abstraction layer | F004 defines, F005 consumes |
| **owns** | Provider-specific API integrations | F004 exclusive |
| **consumes** | Config API | From F001 (persist provider configs, API keys) |
| **consumes** | Proxy settings | From F001/F003 (API requests through proxy) |
| **consumes** | IPC bridge | From F001 (main process API calls) |
| **consumes** | Settings navigation | From F003 (provider settings is sub-page) |
| **consumes** | Navigation | From F002 (settings tab) |

## 8. Naming Remapping

| Source Identifier | Target Identifier | Location |
|---|---|---|
| CherryINOAuthService | Remove entirely | OAuth service specific to Cherry |
| cherry-studio provider keys | angdu-studio provider keys | Config keys |
| CherryStudio user agent | AngduStudio user agent | API request headers |
| packages/ai-core | packages/ai-core (keep) | Package name is generic |

## 9. Static Resources

| Resource | Path | Usage |
|---|---|---|
| Provider logos | src/renderer/src/assets/providers/ | Icons for OpenAI, Anthropic, etc. |
| Provider type definitions | (code-level) | Provider capability matrices |

## 10. Environment Variables

| Variable | Usage | Feature |
|---|---|---|
| ANGDU_DEFAULT_PROVIDER | Default provider type | ProviderService |
| ANGDU_ANTHROPIC_API_KEY | Dev-time Anthropic key override | AnthropicService |
| ANGDU_OPENAI_API_KEY | Dev-time OpenAI key override | ProviderService |
| ANGDU_PROXY | Proxy for API requests | All provider services |

## 11. Feature Contracts

### Provides
- **Provider Registry**: List of configured providers with status → F005 (model selection in chat)
- **Model Registry**: Available models with capabilities → F005 (model picker)
- **AI Core Interface**: Unified chat/complete/stream API → F005 (send message, receive stream)
- **Provider Config**: API keys, endpoints, custom headers → F005 (API requests)
- **Model Capabilities**: Vision, function calling, context window → F005 (UI adaptation)
- **Connection Test**: Validate provider config → F003 (settings UI feedback)

### Requires
- **From F001**: Config API (persist provider configs, encrypted API keys)
- **From F001**: IPC bridge (main process API calls for OAuth, proxy)
- **From F001**: Proxy settings (route API calls through proxy)
- **From F002**: Navigation (settings sub-page routing)
- **From F003**: Settings integration (provider/model settings pages)

## 12. For /speckit.specify

### Draft Functional Requirements
- FR-026: Users must be able to add multiple providers of the same type
- FR-027: API keys must be stored encrypted, never exposed in logs or exports
- FR-028: Provider connection test must validate API key and endpoint
- FR-029: Model list must be fetchable from provider API and cacheable
- FR-030: Custom models must be addable manually with user-defined parameters
- FR-031: Provider deletion must warn if models are in use by assistants
- FR-032: AI core must normalize request/response across all provider types
- FR-033: Streaming must be supported for all providers that offer it
- FR-034: Provider-specific error messages must be surfaced to user

### Draft Success Criteria
- SC-012: Provider add → connection test < 5 seconds
- SC-013: Model list fetch < 3 seconds
- SC-014: Switching provider in chat has no visible delay
- SC-015: API key never appears in plaintext in logs, exports, or IPC messages

### Edge Cases
- API key invalid → clear error message, do not save
- Provider endpoint unreachable → timeout with retry option
- Rate limit hit → surface rate limit message with cooldown info
- Model deprecated by provider → show warning, suggest alternative
- Multiple providers of same type → distinguish by user-given name
- Provider API returns unexpected model list → graceful fallback to cached list
- Network offline → use cached model list, show offline indicator

## 13. For /speckit.plan

### Dependencies
- Vercel AI SDK or custom ai-core (evaluate)
- Zustand (provider/model state)
- better-sqlite3 via F001 (encrypted key storage)
- node-fetch or undici (main process API calls)

### Entity Drafts
- **Provider**: { id, type, name, apiKey (encrypted), baseUrl, headers, isEnabled, models[], createdAt }
- **Model**: { id, providerId, name, displayName, capabilities: { vision, functionCalling, streaming }, contextWindow, maxOutputTokens }
- **ProviderType**: enum { OpenAI, Anthropic, Google, Azure, Ollama, Custom, ... }

### API Drafts
- Store: `useProviderStore` — providers[], addProvider, updateProvider, deleteProvider, testConnection
- Store: `useModelStore` — models[], fetchModels, getModelById, getModelsForProvider
- Service: `AICoreService.chat(provider, model, messages, options)` → AsyncIterable<StreamChunk>

### Tech Decisions
- Zustand for provider/model state (replaces Redux)
- Evaluate Vercel AI SDK vs custom ai-core for provider abstraction
- API keys encrypted with electron safeStorage API
- Model list cached in better-sqlite3

## 14. For /speckit.analyze

### Cross-Feature Verification Points
- F004↔F001: API key encryption must use electron safeStorage; proxy must be applied to all API calls
- F004↔F003: Provider settings UI must integrate into settings page navigation
- F004↔F005: Model selection in chat must reflect real-time provider/model availability
- F004↔F005: Streaming interface must be consumed correctly by chat streaming logic
- F004↔F005: Model capabilities must drive chat UI (e.g., show image upload only if vision supported)
- API key migration from source (Cherry) configs must be handled in data import (F003)
- Provider type extensibility: adding a new provider type should not require changes to F005
