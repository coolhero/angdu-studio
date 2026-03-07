# Quickstart: AI Core Engine

## Quick Test Scenarios

### 1. Create an Executor and Stream Text

```typescript
import { createExecutor } from '@cherrystudio/ai-core'

const executor = createExecutor('openai', {
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1'
})

const result = await executor.streamText({
  model: 'gpt-4.1',
  messages: [{ role: 'user', content: 'Hello!' }]
})

for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
```

### 2. Generate Text (Non-Streaming)

```typescript
const result = await executor.generateText({
  model: 'gpt-4.1',
  messages: [{ role: 'user', content: 'Summarize in one sentence.' }]
})

console.log(result.text)
```

### 3. Use Plugins

```typescript
import { createExecutor, definePlugin } from '@cherrystudio/ai-core'

const loggingPlugin = definePlugin({
  name: 'my-logger',
  onRequestStart: (ctx) => console.log(`Start: ${ctx.requestId}`),
  onRequestEnd: (ctx, result) => console.log(`End: ${ctx.requestId}`),
  onError: (error, ctx) => console.error(`Error: ${error.message}`)
})

const executor = createExecutor('openai', settings, [loggingPlugin])
```

### 4. Provider Options

```typescript
import { createOpenAIOptions, createAnthropicOptions } from '@cherrystudio/ai-core'

const openaiOpts = createOpenAIOptions({ temperature: 0.7, maxTokens: 4096 })
const anthropicOpts = createAnthropicOptions({ cacheControl: { type: 'ephemeral' } })
```

### 5. CherryIN Provider

```typescript
import { createCherryIn } from '@cherrystudio/ai-sdk-provider'

const provider = createCherryIn({
  apiKey: 'cherry-...',
  baseURL: 'https://api.cherry-ai.com/v1',
  endpointType: 'openai'
})

const model = provider.languageModel('qwen3-next-80b')
```

### 6. Error Handling

```typescript
import { AiCoreError, ModelResolutionError } from '@cherrystudio/ai-core'

try {
  await executor.streamText({ model: 'nonexistent-model', messages: [] })
} catch (error) {
  if (error instanceof ModelResolutionError) {
    console.log('Model not found:', error.context)
  } else if (error instanceof AiCoreError) {
    console.log('AI error:', error.code, error.message)
  }
}
```
