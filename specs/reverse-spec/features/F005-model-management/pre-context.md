# F005 — Model Management — Pre-Context

> Feature ID: F005 | Tier: 1 | Release Group: RG-3

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/index.ts` | Model, ModelType, ModelTag, ModelPricing, EndpointType types |
| `src/renderer/src/store/llm.ts` | defaultModel, topicNamingModel, quickModel, translateModel state |
| `src/renderer/src/config/models.ts` | SYSTEM_MODELS definitions |
| `src/renderer/src/pages/settings/` | Model settings UI |
| `src/renderer/src/hooks/` | useModel hooks for model operations |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B050 | `types/index.ts` | `Model` type | Model entity: id, provider, name, group, owned_by, description, capabilities, pricing, endpoint_type | P1 | Source |
| B051 | `store/llm.ts` | `defaultModel` | Global default model; used when assistant has no model set | P1 | Source |
| B052 | `store/llm.ts` | `topicNamingModel` | Model used for auto-naming topics (deprecated but functional) | P2 | Source |
| B053 | `store/llm.ts` | `quickModel` / `translateModel` | Purpose-specific model assignments | P2 | Source |
| B054 | `types/index.ts` | `ModelType` / `ModelTag` | Type tags: text, vision, embedding, reasoning, function_calling, web_search, rerank, free | P1 | Source |
| B055 | `types/index.ts` | `ModelPricing` | Pricing info: input_per_million_tokens, output_per_million_tokens, currencySymbol | P2 | Source |
| B056 | `types/index.ts` | `EndpointType` | API endpoint types: openai, openai-response, anthropic, gemini, image-generation, jina-rerank | P1 | Source |
| B057 | `store/llm.ts` | model deduplication | Models merged by ID using lodash uniqBy | P1 | Source |
| B058 | `config/models.ts` | `SYSTEM_MODELS` | Pre-configured default models per role | P1 | Source |
| B059 | `types/index.ts` | `ModelCapability` | Capability flags for feature detection (vision, tools, etc.) | P1 | Source |
| B060 | `store/llm.ts` | provider.models | Models array embedded in Provider; fetched from provider APIs and stored | P1 | Source |

---

## For /speckit.specify Hints

- Define model listing/fetching protocol per provider type
- Specify model search and filter criteria
- Document pin/favorite mechanism
- Define default model selection cascade (assistant -> global -> first available)
- Specify token counting configuration

## For /speckit.plan Hints

- Task 1: Model Zustand store
- Task 2: Model listing from provider APIs
- Task 3: Model search/filter UI
- Task 4: Pin favorites and default selection
- Task 5: Model capability detection

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F004 | Provider Management | Provider config for API access |
| Provides to F006 | Chat Core | Selected model for LLM calls |
| Provides to F010 | Chat Advanced | Model list for @-mentions |
| Provides to F011 | Knowledge Base | Embedding model selection |
