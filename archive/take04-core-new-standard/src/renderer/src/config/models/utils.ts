import type { Model } from '@shared/types'

export function isSupportedModel(model: Model): boolean {
  const id = model.id.toLowerCase()
  return !id.includes('tts') && !id.includes('whisper') && !id.includes('speech')
}

export function isAnthropicModel(model: Model): boolean {
  return model.id.toLowerCase().startsWith('claude')
}

export function isGeminiModel(model: Model): boolean {
  return model.id.toLowerCase().startsWith('gemini')
}

export function isGrokModel(model: Model): boolean {
  return model.id.toLowerCase().startsWith('grok')
}

export function isOpenAIModel(model: Model): boolean {
  const id = model.id.toLowerCase()
  return id.startsWith('gpt') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')
}

export function isZhipuModel(model: Model): boolean {
  const id = model.id.toLowerCase()
  return id.startsWith('glm') || id.startsWith('cogview')
}

export function isMoonshotModel(model: Model): boolean {
  return model.id.toLowerCase().startsWith('moonshot')
}

export function isMaxTemperatureOneModel(model: Model): boolean {
  return isZhipuModel(model) || isAnthropicModel(model) || isMoonshotModel(model)
}

export function isEmbeddingModel(model: Model): boolean {
  const id = model.id.toLowerCase()
  return id.includes('embedding') || id.includes('embed')
}

export function isRerankModel(model: Model): boolean {
  return model.id.toLowerCase().includes('rerank')
}

export function isVisionModel(model: Model): boolean {
  if (model.capabilities?.includes('vision')) return true
  const id = model.id.toLowerCase()
  return (
    id.includes('vision') ||
    id.includes('gpt-5') ||
    id.includes('gpt-4') ||
    id.startsWith('claude') ||
    id.startsWith('gemini') ||
    id.startsWith('grok')
  )
}

export function isReasoningModel(model: Model): boolean {
  if (model.capabilities?.includes('reasoning')) return true
  const id = model.id.toLowerCase()
  return (
    id.includes('o1') ||
    id.includes('o3') ||
    id.includes('o4') ||
    id.includes('reasoner') ||
    id.includes('thinking') ||
    id.includes('gpt-5-pro') ||
    id.includes('gpt-5.1')
  )
}

export function isFunctionCallingModel(model: Model): boolean {
  if (model.capabilities?.includes('function_calling')) return true
  const id = model.id.toLowerCase()
  if (isEmbeddingModel(model) || isRerankModel(model)) return false
  return (
    id.startsWith('gpt') ||
    id.startsWith('claude') ||
    id.startsWith('gemini') ||
    id.startsWith('grok') ||
    id.includes('mistral')
  )
}

export function isWebSearchModel(model: Model): boolean {
  if (model.capabilities?.includes('web_search')) return true
  const id = model.id.toLowerCase()
  return id.includes('search') || id.startsWith('perplexity')
}

export function agentModelFilter(model: Model): boolean {
  return !isEmbeddingModel(model) && !isRerankModel(model) && isSupportedModel(model)
}

export function hasCapability(model: Model, capability: import('@shared/types').ModelCapability): boolean {
  return model.capabilities?.includes(capability) ?? false
}
