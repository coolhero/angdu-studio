import type { Model, ModelCapability } from '../types/provider'

interface SystemModelDef {
  id: string
  provider: string
  name: string
  group: string
  capabilities?: ModelCapability[]
}

export const SYSTEM_MODELS: SystemModelDef[] = [
  // ── OpenAI ──
  { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', group: 'GPT-4', capabilities: ['vision', 'function_calling'] },
  { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini', group: 'GPT-4', capabilities: ['vision', 'function_calling'] },
  { id: 'gpt-4-turbo', provider: 'openai', name: 'GPT-4 Turbo', group: 'GPT-4', capabilities: ['vision', 'function_calling'] },
  { id: 'gpt-3.5-turbo', provider: 'openai', name: 'GPT-3.5 Turbo', group: 'GPT-3.5', capabilities: ['function_calling'] },
  { id: 'o1', provider: 'openai', name: 'o1', group: 'o1', capabilities: ['reasoning', 'vision'] },
  { id: 'o1-mini', provider: 'openai', name: 'o1 Mini', group: 'o1', capabilities: ['reasoning'] },
  { id: 'o1-pro', provider: 'openai', name: 'o1 Pro', group: 'o1', capabilities: ['reasoning', 'vision'] },
  { id: 'o3-mini', provider: 'openai', name: 'o3 Mini', group: 'o3', capabilities: ['reasoning'] },
  { id: 'o4-mini', provider: 'openai', name: 'o4 Mini', group: 'o4', capabilities: ['reasoning', 'vision', 'function_calling'] },

  // ── Anthropic ──
  { id: 'claude-sonnet-4-20250514', provider: 'anthropic', name: 'Claude Sonnet 4', group: 'Claude 4', capabilities: ['vision', 'reasoning', 'function_calling'] },
  { id: 'claude-opus-4-20250514', provider: 'anthropic', name: 'Claude Opus 4', group: 'Claude 4', capabilities: ['vision', 'reasoning', 'function_calling'] },
  { id: 'claude-haiku-4-5-20251001', provider: 'anthropic', name: 'Claude Haiku 4.5', group: 'Claude 4.5', capabilities: ['vision', 'function_calling'] },
  { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', name: 'Claude 3.5 Sonnet', group: 'Claude 3.5', capabilities: ['vision', 'function_calling'] },
  { id: 'claude-3-5-haiku-20241022', provider: 'anthropic', name: 'Claude 3.5 Haiku', group: 'Claude 3.5', capabilities: ['vision', 'function_calling'] },

  // ── Google Gemini ──
  { id: 'gemini-2.5-pro-preview-05-06', provider: 'gemini', name: 'Gemini 2.5 Pro', group: 'Gemini 2.5', capabilities: ['vision', 'reasoning', 'function_calling', 'web_search'] },
  { id: 'gemini-2.5-flash-preview-05-20', provider: 'gemini', name: 'Gemini 2.5 Flash', group: 'Gemini 2.5', capabilities: ['vision', 'reasoning', 'function_calling', 'web_search'] },
  { id: 'gemini-2.0-flash', provider: 'gemini', name: 'Gemini 2.0 Flash', group: 'Gemini 2.0', capabilities: ['vision', 'function_calling', 'web_search'] },
  { id: 'gemini-1.5-pro', provider: 'gemini', name: 'Gemini 1.5 Pro', group: 'Gemini 1.5', capabilities: ['vision', 'function_calling'] },
  { id: 'gemini-1.5-flash', provider: 'gemini', name: 'Gemini 1.5 Flash', group: 'Gemini 1.5', capabilities: ['vision', 'function_calling'] },

  // ── Mistral ──
  { id: 'mistral-large-latest', provider: 'mistral', name: 'Mistral Large', group: 'Mistral', capabilities: ['function_calling'] },
  { id: 'mistral-medium-latest', provider: 'mistral', name: 'Mistral Medium', group: 'Mistral', capabilities: ['function_calling'] },
  { id: 'mistral-small-latest', provider: 'mistral', name: 'Mistral Small', group: 'Mistral', capabilities: ['function_calling'] },
  { id: 'codestral-latest', provider: 'mistral', name: 'Codestral', group: 'Mistral', capabilities: ['function_calling'] },

  // ── Ollama (local) ──
  { id: 'llama3', provider: 'ollama', name: 'Llama 3', group: 'Llama', capabilities: [] },
  { id: 'qwen2.5', provider: 'ollama', name: 'Qwen 2.5', group: 'Qwen', capabilities: ['reasoning'] },
  { id: 'deepseek-r1', provider: 'ollama', name: 'DeepSeek R1', group: 'DeepSeek', capabilities: ['reasoning'] }
] as const

export function getSystemModels(): Model[] {
  return SYSTEM_MODELS.map((def) => ({
    id: def.id,
    provider: def.provider,
    name: def.name,
    group: def.group,
    capabilities: def.capabilities ?? []
  }))
}

export function getModelsForProvider(providerId: string): Model[] {
  return getSystemModels().filter((m) => m.provider === providerId)
}
