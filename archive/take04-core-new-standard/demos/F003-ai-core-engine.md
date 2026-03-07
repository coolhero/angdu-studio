# Demo: F003 — AI Core Engine

**Feature**: AI Core Engine (aiCore package + ai-sdk-provider + services)
**Status**: Implemented
**Date**: 2026-03-04

---

## Demo Components

| Component | Type | Location | Fate |
|-----------|------|----------|------|
| Unit tests (84 tests) | Promotable | `tests/unit/aiCore/`, `tests/unit/services/` | Production test suite |
| aiCore package | Promotable | `packages/aiCore/src/` | Core AI engine |
| ai-sdk-provider package | Promotable | `packages/ai-sdk-provider/src/` | CherryIN custom provider |
| ContextWindowService | Promotable | `src/renderer/src/services/ContextWindowService.ts` | Context window management |
| AiCoreService | Promotable | `src/renderer/src/services/AiCoreService.ts` | Service bridge to F002 providers |

---

## Prerequisites

```bash
# From project root
pnpm install
```

---

## Demo 1: Run Test Suite

Verify all 84 F003-specific tests pass across 9 test files:

```bash
pnpm vitest run tests/unit/aiCore/ tests/unit/services/
```

Expected: All tests pass (providers, model resolver, executor, plugin manager, plugin engine, options, errors, CherryIN, context window).

---

## Demo 2: Create an Executor (Code Walkthrough)

```typescript
import { createExecutor, type OpenAIProviderSettings } from '@aiCore/index'

// Create an OpenAI executor
const executor = createExecutor('openai', {
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1'
})

// Stream text
const result = await executor.streamText({
  model: 'gpt-4.1',
  messages: [{ role: 'user', content: 'Hello!' }]
})
```

---

## Demo 3: Plugin System

```typescript
import { createExecutor, definePlugin } from '@aiCore/index'

const loggingPlugin = definePlugin({
  name: 'my-logger',
  enforce: 'pre',
  onRequestStart: (ctx) => {
    console.log(`[${ctx.providerId}] Request started for ${ctx.model?.modelId}`)
  },
  onRequestEnd: (ctx, result) => {
    console.log(`[${ctx.providerId}] Request completed`)
  },
  onError: (err, ctx) => {
    console.error(`[${ctx.providerId}] Error: ${err.message}`)
  }
})

const executor = createExecutor('openai', { apiKey: 'sk-...' })
executor.use(loggingPlugin)
```

---

## Demo 4: Provider Resolution

```typescript
import { ModelResolver, modelResolver } from '@aiCore/index'

// Traditional format — resolves using the executor's provider
const model1 = modelResolver.resolveLanguageModel('gpt-4.1', openaiProvider)

// Namespaced format — auto-resolves provider from prefix
const model2 = modelResolver.resolveLanguageModel('anthropic:claude-3', anthropicProvider)
```

---

## Demo 5: Options Builders

```typescript
import {
  createOpenAIOptions,
  createAnthropicOptions,
  mergeProviderOptions
} from '@aiCore/index'

const base = createOpenAIOptions({ temperature: 0.7 })
const override = createOpenAIOptions({ maxTokens: 4096 })
const merged = mergeProviderOptions(base, override)
// { temperature: 0.7, maxTokens: 4096 }
```

---

## Demo 6: Context Window Management

```typescript
import {
  filterContextMessages,
  getContextCount,
  checkRateLimit,
  DEFAULT_CONTEXT_COUNT
} from '@renderer/services/ContextWindowService'

const messages = [/* 100 messages */]
const filtered = filterContextMessages(messages, DEFAULT_CONTEXT_COUNT)
// Returns last 5 messages (preserving system prompts)

const rateCheck = checkRateLimit({ rateLimit: 5 }, lastRequestTime)
// { blocked: true/false, waitSeconds: N }
```

---

## Demo 7: CherryIN Custom Provider

```typescript
import { createCherryIn } from '@ai-sdk-provider/index'

// Routes to OpenAI backend
const openaiProvider = createCherryIn({ apiKey: 'key', endpointType: 'openai' })
const model = openaiProvider.languageModel('gpt-4.1')

// Routes to Anthropic backend
const anthropicProvider = createCherryIn({ apiKey: 'key', endpointType: 'anthropic' })
const claude = anthropicProvider.languageModel('claude-3')

// Routes to Google backend
const googleProvider = createCherryIn({ apiKey: 'key', endpointType: 'gemini' })
const gemini = googleProvider.languageModel('gemini-pro')
```

---

## Verification Checklist

- [x] 84 unit tests pass across 9 test files
- [x] All 8 provider types resolve correctly
- [x] Plugin ordering (pre/normal/post) works
- [x] Recursive depth limiting throws RecursiveDepthError
- [x] Context window filtering preserves system prompts
- [x] Rate limiting blocks/allows correctly
- [x] CherryIN routes to correct backends
- [x] Error hierarchy with instanceof, toJSON, cause chain
- [x] Options builders produce typed output with deep merge
- [x] Service bridge maps F002 ProviderType to F003 ProviderId
