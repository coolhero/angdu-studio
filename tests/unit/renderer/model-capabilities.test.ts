import { describe, it, expect } from 'vitest'
import {
  hasCapability,
  isVisionModel,
  isReasoningModel,
  supportsFunctionCalling,
  shouldEnableReasoning,
  getReasoningConfig,
  detectReasoningStyle
} from '../../../src/renderer/src/aiCore/prepareParams/modelCapabilities'
import type { Model } from '../../../src/renderer/src/types/provider'

const makeModel = (capabilities: Model['capabilities'] = []): Model => ({
  id: 'test-model', provider: 'test', name: 'Test', group: 'Test',
  capabilities
})

describe('Model Capabilities', () => {
  it('detects vision capability', () => {
    expect(isVisionModel(makeModel(['vision']))).toBe(true)
    expect(isVisionModel(makeModel(['reasoning']))).toBe(false)
  })

  it('detects reasoning capability', () => {
    expect(isReasoningModel(makeModel(['reasoning']))).toBe(true)
    expect(isReasoningModel(makeModel(['vision']))).toBe(false)
  })

  it('detects function calling capability', () => {
    expect(supportsFunctionCalling(makeModel(['function_calling']))).toBe(true)
    expect(supportsFunctionCalling(makeModel([]))).toBe(false)
  })

  it('handles undefined capabilities', () => {
    const model = { ...makeModel(), capabilities: undefined }
    expect(hasCapability(model, 'vision')).toBe(false)
    expect(isVisionModel(model)).toBe(false)
  })
})

describe('Reasoning Mode Detection', () => {
  it('enables reasoning when model has reasoning capability', () => {
    expect(shouldEnableReasoning(makeModel(['reasoning']))).toBe(true)
  })

  it('enables reasoning when effort is configured', () => {
    expect(shouldEnableReasoning(makeModel([]), 'high')).toBe(true)
  })

  it('enables reasoning when provider flag is set', () => {
    expect(shouldEnableReasoning(makeModel([]), undefined, true)).toBe(true)
  })

  it('disables reasoning when no conditions met', () => {
    expect(shouldEnableReasoning(makeModel([]))).toBe(false)
  })
})

describe('Reasoning Config', () => {
  it('returns anthropic extended thinking for anthropic', () => {
    const config = getReasoningConfig('anthropic')
    expect(config?.style).toBe('anthropic-extended-thinking')
  })

  it('returns openai reasoning effort for openai', () => {
    const config = getReasoningConfig('openai')
    expect(config?.style).toBe('openai-reasoning-effort')
  })

  it('returns undefined for unsupported providers', () => {
    const config = getReasoningConfig('ollama')
    expect(config).toBeUndefined()
  })

  it('detects Qwen models for enable_thinking style', () => {
    const qwenModel = makeModel(['reasoning'])
    qwenModel.id = 'qwen2.5-72b'
    const config = detectReasoningStyle(qwenModel, 'ollama')
    expect(config?.style).toBe('qwen-enable-thinking')
  })
})
