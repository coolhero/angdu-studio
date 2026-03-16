import type { ProviderType } from '../types/provider'

export interface SystemProviderDef {
  id: string
  type: ProviderType
  name: string
  defaultApiHost: string
  requiresApiKey: boolean
}

/**
 * System provider definitions. Users activate by adding an API key.
 * Provider instances are created from these defs on first launch.
 */
export const SYSTEM_PROVIDERS: SystemProviderDef[] = [
  // --- OpenAI-compatible ---
  { id: 'openai', type: 'openai', name: 'OpenAI', defaultApiHost: 'https://api.openai.com', requiresApiKey: true },
  { id: 'azure-openai', type: 'azure-openai', name: 'Azure OpenAI', defaultApiHost: '', requiresApiKey: true },
  { id: 'github-copilot', type: 'openai', name: 'GitHub Copilot', defaultApiHost: 'https://api.githubcopilot.com', requiresApiKey: true },

  // --- Anthropic ---
  { id: 'anthropic', type: 'anthropic', name: 'Anthropic', defaultApiHost: 'https://api.anthropic.com', requiresApiKey: true },
  { id: 'vertex-anthropic', type: 'vertex-anthropic', name: 'Vertex AI (Anthropic)', defaultApiHost: '', requiresApiKey: true },

  // --- Google ---
  { id: 'gemini', type: 'gemini', name: 'Google Gemini', defaultApiHost: 'https://generativelanguage.googleapis.com', requiresApiKey: true },
  { id: 'vertexai', type: 'vertexai', name: 'Google Vertex AI', defaultApiHost: '', requiresApiKey: true },

  // --- Others ---
  { id: 'mistral', type: 'mistral', name: 'Mistral AI', defaultApiHost: 'https://api.mistral.ai', requiresApiKey: true },
  { id: 'aws-bedrock', type: 'aws-bedrock', name: 'AWS Bedrock', defaultApiHost: '', requiresApiKey: true },
  { id: 'ollama', type: 'ollama', name: 'Ollama', defaultApiHost: 'http://localhost:11434', requiresApiKey: false },

  // --- OpenAI-compatible services ---
  { id: 'groq', type: 'openai', name: 'Groq', defaultApiHost: 'https://api.groq.com/openai', requiresApiKey: true },
  { id: 'together', type: 'openai', name: 'Together AI', defaultApiHost: 'https://api.together.xyz', requiresApiKey: true },
  { id: 'fireworks', type: 'openai', name: 'Fireworks AI', defaultApiHost: 'https://api.fireworks.ai/inference', requiresApiKey: true },
  { id: 'deepseek', type: 'openai', name: 'DeepSeek', defaultApiHost: 'https://api.deepseek.com', requiresApiKey: true },
  { id: 'openrouter', type: 'openai', name: 'OpenRouter', defaultApiHost: 'https://openrouter.ai/api', requiresApiKey: true },
  { id: 'perplexity', type: 'openai', name: 'Perplexity', defaultApiHost: 'https://api.perplexity.ai', requiresApiKey: true },
  { id: 'moonshot', type: 'openai', name: 'Moonshot AI', defaultApiHost: 'https://api.moonshot.cn', requiresApiKey: true },
  { id: 'zhipu', type: 'openai', name: 'Zhipu AI (GLM)', defaultApiHost: 'https://open.bigmodel.cn/api/paas', requiresApiKey: true },
  { id: 'baichuan', type: 'openai', name: 'Baichuan', defaultApiHost: 'https://api.baichuan-ai.com', requiresApiKey: true },
  { id: 'minimax', type: 'openai', name: 'MiniMax', defaultApiHost: 'https://api.minimax.chat', requiresApiKey: true },
  { id: 'qwen', type: 'openai', name: 'Qwen (Alibaba)', defaultApiHost: 'https://dashscope.aliyuncs.com/compatible-mode', requiresApiKey: true },
  { id: 'yi', type: 'openai', name: 'Yi (01.AI)', defaultApiHost: 'https://api.lingyiwanwu.com', requiresApiKey: true },
  { id: 'stepfun', type: 'openai', name: 'StepFun', defaultApiHost: 'https://api.stepfun.com', requiresApiKey: true },
  { id: 'doubao', type: 'openai', name: 'Doubao (ByteDance)', defaultApiHost: 'https://ark.cn-beijing.volces.com/api', requiresApiKey: true },
  { id: 'siliconflow', type: 'openai', name: 'SiliconFlow', defaultApiHost: 'https://api.siliconflow.cn', requiresApiKey: true },
  { id: 'lmstudio', type: 'openai', name: 'LM Studio', defaultApiHost: 'http://localhost:1234', requiresApiKey: false },
  { id: 'xai', type: 'openai', name: 'xAI (Grok)', defaultApiHost: 'https://api.x.ai', requiresApiKey: true },
  { id: 'cohere', type: 'openai', name: 'Cohere', defaultApiHost: 'https://api.cohere.com/compatibility', requiresApiKey: true },
  { id: 'novita', type: 'openai', name: 'Novita AI', defaultApiHost: 'https://api.novita.ai', requiresApiKey: true },
  { id: 'infini', type: 'openai', name: 'Infini AI', defaultApiHost: 'https://cloud.infini-ai.com/maas', requiresApiKey: true },

  // --- Gateway/Hub ---
  { id: 'aihubmix', type: 'openai', name: 'AiHubMix', defaultApiHost: 'https://aihubmix.com', requiresApiKey: true },
  { id: 'oneapi', type: 'openai', name: 'OneAPI / New API', defaultApiHost: '', requiresApiKey: true },
  { id: 'gpustack', type: 'openai', name: 'GPUStack', defaultApiHost: 'http://localhost:80', requiresApiKey: false }
]
