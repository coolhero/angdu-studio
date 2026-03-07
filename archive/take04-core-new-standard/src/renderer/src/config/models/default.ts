import type { Model, SystemProviderId } from '@shared/types'

// ── CherryAI Default Models ──

export const qwen38bModel: Model = {
  id: 'qwen3-8b',
  name: 'Qwen 3 8B',
  provider: 'cherryin',
  group: 'Qwen'
}

export const qwen3Next80BModel: Model = {
  id: 'qwen3-next-80b',
  name: 'Qwen 3 Next 80B',
  provider: 'cherryin',
  group: 'Qwen'
}

// ── System Models ──

export const SYSTEM_MODELS: Record<SystemProviderId | 'defaultModel', Model[]> = {
  // ── Providers with default models ──

  openai: [
    {
      id: 'gpt-5.1',
      name: 'GPT-5.1',
      provider: 'openai',
      group: 'GPT-5.1',
      capabilities: ['vision', 'reasoning', 'function_calling', 'web_search']
    },
    {
      id: 'gpt-5',
      name: 'GPT-5',
      provider: 'openai',
      group: 'GPT-5',
      capabilities: ['vision', 'reasoning', 'function_calling', 'web_search']
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      provider: 'openai',
      group: 'GPT-5',
      capabilities: ['vision', 'reasoning', 'function_calling', 'web_search']
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      provider: 'openai',
      group: 'GPT-5',
      capabilities: ['vision', 'function_calling']
    },
    {
      id: 'gpt-5-pro',
      name: 'GPT-5 Pro',
      provider: 'openai',
      group: 'GPT-5',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'openai', group: 'Image' }
  ],

  anthropic: [
    {
      id: 'claude-opus-4-6-20260301',
      name: 'Claude Opus 4.6',
      provider: 'anthropic',
      group: 'Claude 4.6',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'claude-sonnet-4-6-20260301',
      name: 'Claude Sonnet 4.6',
      provider: 'anthropic',
      group: 'Claude 4.6',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'claude-sonnet-4-5-20241022',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      group: 'Claude 4.5',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'claude-haiku-4-5-20241022',
      name: 'Claude Haiku 4.5',
      provider: 'anthropic',
      group: 'Claude 4.5',
      capabilities: ['vision', 'function_calling']
    },
    {
      id: 'claude-opus-4-5-20250515',
      name: 'Claude Opus 4.5',
      provider: 'anthropic',
      group: 'Claude 4.5',
      capabilities: ['vision', 'reasoning', 'function_calling']
    }
  ],

  gemini: [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      group: 'Gemini 2.5',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'gemini',
      group: 'Gemini 2.5',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3 Pro Preview',
      provider: 'gemini',
      group: 'Gemini 3',
      capabilities: ['vision', 'reasoning', 'function_calling']
    }
  ],

  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'deepseek',
      group: 'DeepSeek',
      capabilities: ['function_calling']
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      provider: 'deepseek',
      group: 'DeepSeek',
      capabilities: ['reasoning']
    }
  ],

  groq: [
    {
      id: 'llama-4-scout-17b-16e-instruct',
      name: 'Llama 4 Scout',
      provider: 'groq',
      group: 'Llama 4'
    },
    {
      id: 'llama-4-maverick-17b-128e-instruct',
      name: 'Llama 4 Maverick',
      provider: 'groq',
      group: 'Llama 4'
    }
  ],

  grok: [
    {
      id: 'grok-4',
      name: 'Grok 4',
      provider: 'grok',
      group: 'Grok',
      capabilities: ['vision', 'reasoning', 'function_calling']
    },
    {
      id: 'grok-3',
      name: 'Grok 3',
      provider: 'grok',
      group: 'Grok',
      capabilities: ['reasoning', 'function_calling']
    },
    {
      id: 'grok-3-mini',
      name: 'Grok 3 Mini',
      provider: 'grok',
      group: 'Grok',
      capabilities: ['reasoning', 'function_calling']
    }
  ],

  mistral: [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: 'mistral',
      group: 'Mistral',
      capabilities: ['vision', 'function_calling']
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: 'mistral',
      group: 'Mistral',
      capabilities: ['function_calling']
    }
  ],

  // ── CherryAI default ──

  defaultModel: [qwen3Next80BModel, qwen38bModel],

  // ── Providers with empty defaults ──

  cherryin: [],
  silicon: [],
  aihubmix: [],
  ocoolai: [],
  ppio: [],
  alayanew: [],
  qiniu: [],
  dmxapi: [],
  burncloud: [],
  tokenflux: [],
  '302ai': [],
  cephalon: [],
  lanyun: [],
  ph8: [],
  openrouter: [],
  ollama: [],
  ovms: [],
  'new-api': [],
  lmstudio: [],
  'azure-openai': [],
  vertexai: [],
  github: [],
  copilot: [],
  zhipu: [],
  yi: [],
  moonshot: [],
  baichuan: [],
  dashscope: [],
  stepfun: [],
  doubao: [],
  infini: [],
  minimax: [],
  together: [],
  fireworks: [],
  nvidia: [],
  hyperbolic: [],
  jina: [],
  perplexity: [],
  modelscope: [],
  xirang: [],
  hunyuan: [],
  zhinao: [],
  'gitee-ai': [],
  o3: [],
  'tencent-cloud-ti': [],
  'baidu-cloud': [],
  gpustack: [],
  voyageai: [],
  'aws-bedrock': [],
  poe: [],
  aionly: [],
  longcat: [],
  huggingface: [],
  sophnet: [],
  gateway: [],
  cerebras: [],
  mimo: []
}
