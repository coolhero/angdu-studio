import type { Model, ModelCapability, ProviderType } from '../../types/provider'

export function hasCapability(model: Model, capability: ModelCapability): boolean {
  return model.capabilities?.includes(capability) ?? false
}

export function isVisionModel(model: Model): boolean {
  return hasCapability(model, 'vision')
}

export function isReasoningModel(model: Model): boolean {
  return hasCapability(model, 'reasoning')
}

export function supportsFunctionCalling(model: Model): boolean {
  return hasCapability(model, 'function_calling')
}

export function supportsWebSearch(model: Model): boolean {
  return hasCapability(model, 'web_search')
}

export function supportsReranking(model: Model): boolean {
  return hasCapability(model, 'rerank')
}

// ── Reasoning Mode Detection ──
// 3 OR conditions:
// 1. Model has reasoning capability
// 2. Reasoning effort is configured
// 3. Provider-specific reasoning flag

export function shouldEnableReasoning(
  model: Model,
  reasoningEffort?: 'low' | 'medium' | 'high',
  providerReasoningEnabled?: boolean
): boolean {
  return isReasoningModel(model) || !!reasoningEffort || !!providerReasoningEnabled
}

// ── Provider-Specific Reasoning Config ──

export interface ReasoningConfig {
  style: 'anthropic-extended-thinking' | 'openai-reasoning-effort' | 'qwen-enable-thinking'
}

const REASONING_CONFIGS: Partial<Record<ProviderType, ReasoningConfig>> = {
  anthropic: { style: 'anthropic-extended-thinking' },
  'vertex-anthropic': { style: 'anthropic-extended-thinking' },
  openai: { style: 'openai-reasoning-effort' },
  'openai-response': { style: 'openai-reasoning-effort' },
  'azure-openai': { style: 'openai-reasoning-effort' }
}

export function getReasoningConfig(providerType: ProviderType): ReasoningConfig | undefined {
  return REASONING_CONFIGS[providerType]
}

// For Qwen models detected by ID pattern
export function detectReasoningStyle(model: Model, providerType: ProviderType): ReasoningConfig | undefined {
  if (model.id.startsWith('qwen') || model.id.startsWith('Qwen')) {
    return { style: 'qwen-enable-thinking' }
  }
  return getReasoningConfig(providerType)
}
