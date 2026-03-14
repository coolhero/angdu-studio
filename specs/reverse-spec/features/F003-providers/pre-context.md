# F003-providers Pre-Context

## Feature Summary

| Field | Value |
|-------|-------|
| **Feature ID** | F003-providers |
| **Description** | LLM provider management (50+ types), model registry, API key management, provider configuration |
| **Tier** | 1 |
| **Release Group** | RG-2 |
| **Dependencies** | F001-shell, F002-i18n-theme |

## Global Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **Target**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- All source paths are RELATIVE to `cherry-studio`

## Source Reference

| File | Role |
|------|------|
| `src/renderer/src/config/providers.ts` | Provider type definitions and defaults |
| `src/renderer/src/config/models/` | Model configurations per provider |
| `src/renderer/src/store/llm.ts` | Redux slice for LLM state |
| `src/renderer/src/types/provider.ts` | Provider/Model TypeScript types |
| `src/renderer/src/services/ModelService.ts` | Model management service |

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B025 | `src/renderer/src/store/llm.ts` | `addProvider()` | Adds a new LLM provider with config | P1 | extracted |
| B026 | `src/renderer/src/store/llm.ts` | `updateProvider()` | Updates provider settings (API key, host, models) | P1 | extracted |
| B027 | `src/renderer/src/store/llm.ts` | `deleteProvider()` | Removes a provider and its models | P1 | extracted |
| B028 | `src/renderer/src/store/llm.ts` | `setDefaultModel()` | Sets the default model for new conversations | P1 | extracted |
| B029 | `src/renderer/src/config/providers.ts` | `getSystemProviders()` | Returns list of built-in system providers | P1 | extracted |
| B030 | `src/renderer/src/services/ModelService.ts` | `fetchModels()` | Fetches available models from provider API | P2 | extracted |
| B031 | `src/renderer/src/services/ModelService.ts` | `validateApiKey()` | Tests provider API key validity | P2 | extracted |
| B032 | `src/renderer/src/types/provider.ts` | `ProviderType` enum | Defines 50+ provider type identifiers | P1 | extracted |

## For /speckit.specify

- Support 50+ provider types (OpenAI, Anthropic, Google, Azure, Ollama, etc.)
- Each provider has: API key, base URL, model list, rate limits, auth type options
- System providers pre-configured with defaults

## For /speckit.plan

- Migration: Redux llm slice -> Zustand store with persist middleware
- Provider type enum stays same
