import type { Provider, Model, ProviderType } from '../../types/provider'
import type { AICoreParams, AICoreTool } from '../../types/ai-core'
import { buildProviderHeaders } from './header'
import { isReasoningModel, getReasoningConfig } from './modelCapabilities'

export interface ParamBuildInput {
  provider: Provider
  model: Model
  messages: AICoreParams['messages']
  temperature?: number
  topK?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
  stopSequences?: string[]
  seed?: number
  tools?: AICoreTool[]
  reasoningEffort?: 'low' | 'medium' | 'high'
  abortSignal?: AbortSignal
}

export function buildStreamTextParams(input: ParamBuildInput): AICoreParams {
  const { provider, model, messages, tools, abortSignal } = input

  const params: AICoreParams = {
    model: model.id,
    messages,
    abortSignal
  }

  // Apply optional parameters only if provided
  if (input.temperature !== undefined) params.temperature = input.temperature
  if (input.topK !== undefined) params.topK = input.topK
  if (input.topP !== undefined) params.topP = input.topP
  if (input.frequencyPenalty !== undefined) params.frequencyPenalty = input.frequencyPenalty
  if (input.presencePenalty !== undefined) params.presencePenalty = input.presencePenalty
  if (input.maxTokens !== undefined) params.maxTokens = input.maxTokens
  if (input.stopSequences?.length) params.stopSequences = input.stopSequences
  if (input.seed !== undefined) params.seed = input.seed

  // Include tools if model supports function_calling
  if (tools?.length && model.capabilities?.includes('function_calling')) {
    params.tools = tools
  }

  // Build provider-specific headers
  params.headers = buildProviderHeaders(provider)

  // Apply reasoning parameters
  if (isReasoningModel(model) && input.reasoningEffort) {
    params.providerOptions = getReasoningProviderOptions(
      provider.type,
      input.reasoningEffort,
      input.maxTokens
    )
  }

  // Apply service tier
  if (provider.serviceTier) {
    params.providerOptions = {
      ...params.providerOptions,
      serviceTier: provider.serviceTier
    }
  }

  return params
}

function getReasoningProviderOptions(
  providerType: ProviderType,
  effort: 'low' | 'medium' | 'high',
  maxTokens?: number
): Record<string, unknown> {
  const config = getReasoningConfig(providerType)
  if (!config) return {}

  switch (config.style) {
    case 'anthropic-extended-thinking':
      return {
        anthropic: {
          thinking: {
            type: 'enabled',
            budgetTokens: maxTokens ? Math.floor(maxTokens * 0.8) : 10000
          }
        }
      }

    case 'openai-reasoning-effort':
      return {
        openai: {
          reasoningEffort: effort
        }
      }

    case 'qwen-enable-thinking':
      return {
        openai: {
          enableThinking: true
        }
      }

    default:
      return {}
  }
}
