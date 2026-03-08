import { describe, it, expect, vi } from 'vitest'
import { PluginPipeline, definePlugin } from '../../../src/renderer/src/aiCore/plugins/PluginBuilder'
import type { PluginContext, AICoreParams, AICoreResult } from '../../../src/renderer/src/types/ai-core'

const makeContext = (): PluginContext => ({
  provider: {
    id: 'test', type: 'openai', name: 'Test', apiKey: 'sk-test',
    apiHost: 'https://api.openai.com', models: [], enabled: true
  },
  model: { id: 'gpt-4o', provider: 'test', name: 'GPT-4o', group: 'GPT-4' }
})

const makeParams = (): AICoreParams => ({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})

const makeResult = (): AICoreResult => ({
  text: 'Hello back',
  blocks: [{ type: 'text', content: 'Hello back' }],
  usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }
})

describe('PluginPipeline', () => {
  it('registers and returns plugin names', () => {
    const pipeline = new PluginPipeline()
    pipeline.register(definePlugin('alpha', {}))
    pipeline.register(definePlugin('beta', {}))
    expect(pipeline.getPluginNames()).toEqual(['alpha', 'beta'])
  })

  it('executes pre plugins before normal and post plugins', async () => {
    const order: string[] = []
    const pipeline = new PluginPipeline()

    pipeline.register(definePlugin('normal', {
      onRequestStart: () => { order.push('normal') }
    }))
    pipeline.register(definePlugin('post', {
      onRequestStart: () => { order.push('post') }
    }, 'post'))
    pipeline.register(definePlugin('pre', {
      onRequestStart: () => { order.push('pre') }
    }, 'pre'))

    await pipeline.onRequestStart(makeContext())
    expect(order).toEqual(['pre', 'normal', 'post'])
  })

  it('transforms params through plugin chain', () => {
    const pipeline = new PluginPipeline()

    pipeline.register(definePlugin('addTemp', {
      transformParams: (params) => ({ ...params, temperature: 0.7 })
    }))
    pipeline.register(definePlugin('addMaxTokens', {
      transformParams: (params) => ({ ...params, maxTokens: 1000 })
    }))

    const result = pipeline.transformParams(makeParams(), makeContext())
    expect(result.temperature).toBe(0.7)
    expect(result.maxTokens).toBe(1000)
  })

  it('configures context through plugin chain', () => {
    const pipeline = new PluginPipeline()

    pipeline.register(definePlugin('addFlag', {
      configureContext: (ctx) => ({ ...ctx, customFlag: true })
    }))

    const result = pipeline.configureContext(makeContext())
    expect(result.customFlag).toBe(true)
  })

  it('catches and logs plugin errors without breaking the pipeline', () => {
    const pipeline = new PluginPipeline()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    pipeline.register(definePlugin('failing', {
      transformParams: () => { throw new Error('Plugin error') }
    }))
    pipeline.register(definePlugin('working', {
      transformParams: (params) => ({ ...params, temperature: 0.5 })
    }))

    const result = pipeline.transformParams(makeParams(), makeContext())
    expect(result.temperature).toBe(0.5)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('failing'),
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('calls onRequestEnd for all plugins', async () => {
    const endCalled: string[] = []
    const pipeline = new PluginPipeline()

    pipeline.register(definePlugin('a', {
      onRequestEnd: () => { endCalled.push('a') }
    }))
    pipeline.register(definePlugin('b', {
      onRequestEnd: () => { endCalled.push('b') }
    }))

    await pipeline.onRequestEnd(makeResult(), makeContext())
    expect(endCalled).toEqual(['a', 'b'])
  })
})

describe('definePlugin', () => {
  it('creates a plugin definition with correct structure', () => {
    const plugin = definePlugin('test', {
      configureContext: (ctx) => ctx,
      transformParams: (params) => params
    }, 'pre')

    expect(plugin.name).toBe('test')
    expect(plugin.enforce).toBe('pre')
    expect(plugin.hooks.configureContext).toBeDefined()
    expect(plugin.hooks.transformParams).toBeDefined()
  })
})
