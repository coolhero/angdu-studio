// System Provider Configuration
// Defines all built-in provider entries and their default API endpoints.
// Models are populated separately from SYSTEM_MODELS config.

import type { Provider, SystemProviderId, ProviderType } from '@shared/types'

// ── Helper ──

interface SystemProviderDef {
  id: SystemProviderId
  name: string
  type: ProviderType
  apiHost: string
  apiKey: string
  models: []
  enabled: boolean
  isSystem: true
}

function sp(id: SystemProviderId, name: string, type: ProviderType, apiHost: string): SystemProviderDef {
  return { id, name, type, apiHost, apiKey: '', models: [], enabled: false, isSystem: true as const }
}

// ── CherryAI Provider (standalone, always enabled) ──

export const CHERRYAI_PROVIDER: Provider = {
  id: 'cherryin',
  name: 'CherryAI',
  type: 'openai',
  apiHost: 'https://api.cherry-ai.com',
  apiKey: '',
  models: [],
  enabled: true,
  isSystem: true
}

// ── System Providers (63 entries) ──

export const SYSTEM_PROVIDERS: Provider[] = [
  // CherryIN ecosystem
  sp('cherryin', 'CherryIN', 'openai', 'https://open.cherryin.net'),

  // Chinese cloud / aggregator providers
  sp('silicon', 'Silicon', 'openai', 'https://api.siliconflow.cn'),
  sp('aihubmix', 'AiHubMix', 'openai', 'https://aihubmix.com'),
  sp('ocoolai', 'ocoolAI', 'openai', 'https://api.ocoolai.com'),
  sp('zhipu', 'ZhiPu', 'openai', 'https://open.bigmodel.cn/api/paas/v4/'),
  sp('deepseek', 'deepseek', 'openai', 'https://api.deepseek.com'),
  sp('alayanew', 'AlayaNew', 'openai', 'https://deepseek.alayanew.com'),
  sp('dmxapi', 'DMXAPI', 'openai', 'https://www.dmxapi.cn'),
  sp('aionly', 'AIOnly', 'openai', 'https://api.aiionly.com'),
  sp('burncloud', 'BurnCloud', 'openai', 'https://ai.burncloud.com'),
  sp('tokenflux', 'TokenFlux', 'openai', 'https://api.tokenflux.ai/openai/v1'),
  sp('302ai', '302.AI', 'openai', 'https://api.302.ai'),
  sp('cephalon', 'Cephalon', 'openai', 'https://cephalon.cloud/user-center/v1/model'),
  sp('lanyun', 'LANYUN', 'openai', 'https://maas-api.lanyun.net'),
  sp('ph8', 'PH8', 'openai', 'https://ph8.co'),
  sp('sophnet', 'SophNet', 'openai', 'https://www.sophnet.com/api/open-apis/v1'),
  sp('ppio', 'PPIO', 'openai', 'https://api.ppinfra.com/v3/openai/'),
  sp('qiniu', 'Qiniu', 'openai', 'https://api.qnaigc.com'),

  // Routing / aggregator
  sp('openrouter', 'OpenRouter', 'openai', 'https://openrouter.ai/api/v1/'),

  // Local inference
  sp('ollama', 'Ollama', 'ollama', 'http://localhost:11434'),
  sp('ovms', 'OpenVINO Model Server', 'openai', 'http://localhost:8000/v3/'),
  sp('new-api', 'New API', 'new-api', 'http://localhost:3000'),
  sp('lmstudio', 'LM Studio', 'openai', 'http://localhost:1234'),

  // Tier-1 commercial APIs
  sp('anthropic', 'Anthropic', 'anthropic', 'https://api.anthropic.com'),
  sp('openai', 'OpenAI', 'openai-response', 'https://api.openai.com'),
  sp('azure-openai', 'Azure OpenAI', 'azure-openai', ''),
  sp('gemini', 'Gemini', 'gemini', 'https://generativelanguage.googleapis.com'),
  sp('vertexai', 'VertexAI', 'vertexai', ''),

  // GitHub
  sp('github', 'Github Models', 'openai', 'https://models.github.ai/inference'),
  sp('copilot', 'Github Copilot', 'openai', 'https://api.githubcopilot.com/'),

  // Chinese LLM vendors
  sp('yi', 'Yi', 'openai', 'https://api.lingyiwanwu.com'),
  sp('moonshot', 'Moonshot AI', 'openai', 'https://api.moonshot.cn'),
  sp('baichuan', 'BAICHUAN AI', 'openai', 'https://api.baichuan-ai.com'),
  sp('dashscope', 'Bailian', 'openai', 'https://dashscope.aliyuncs.com/compatible-mode/v1/'),
  sp('stepfun', 'StepFun', 'openai', 'https://api.stepfun.com'),
  sp('doubao', 'doubao', 'openai', 'https://ark.cn-beijing.volces.com/api/v3/'),
  sp('infini', 'Infini', 'openai', 'https://cloud.infini-ai.com/maas'),
  sp('minimax', 'MiniMax', 'openai', 'https://api.minimaxi.com/v1/'),

  // International inference providers
  sp('groq', 'Groq', 'openai', 'https://api.groq.com/openai'),
  sp('together', 'Together', 'openai', 'https://api.together.xyz'),
  sp('fireworks', 'Fireworks', 'openai', 'https://api.fireworks.ai/inference'),
  sp('nvidia', 'nvidia', 'openai', 'https://integrate.api.nvidia.com'),
  sp('grok', 'Grok', 'openai', 'https://api.x.ai'),
  sp('hyperbolic', 'Hyperbolic', 'openai', 'https://api.hyperbolic.xyz'),
  sp('mistral', 'Mistral', 'openai', 'https://api.mistral.ai'),
  sp('jina', 'Jina', 'openai', 'https://api.jina.ai'),
  sp('perplexity', 'Perplexity', 'openai', 'https://api.perplexity.ai/'),

  // Chinese platform / cloud providers
  sp('modelscope', 'ModelScope', 'openai', 'https://api-inference.modelscope.cn/v1/'),
  sp('xirang', 'Xirang', 'openai', 'https://wishub-x1.ctyun.cn'),
  sp('hunyuan', 'hunyuan', 'openai', 'https://api.hunyuan.cloud.tencent.com'),
  sp('zhinao', '360 Zhinao', 'openai', 'https://api.360.cn'),
  sp('gitee-ai', 'Gitee AI', 'openai', 'https://ai.gitee.com'),
  sp('o3', 'O3', 'openai', 'https://api.o3.fan'),
  sp('tencent-cloud-ti', 'Tencent Cloud TI', 'openai', 'https://api.lkeap.cloud.tencent.com'),
  sp('baidu-cloud', 'Baidu Cloud', 'openai', 'https://qianfan.baidubce.com/v2/'),
  sp('gpustack', 'GPUStack', 'openai', ''),

  // Embedding / specialty
  sp('voyageai', 'VoyageAI', 'openai', 'https://api.voyageai.com'),

  // AWS
  sp('aws-bedrock', 'AWS Bedrock', 'aws-bedrock', ''),

  // Misc
  sp('poe', 'Poe', 'openai', 'https://api.poe.com/v1/'),
  sp('longcat', 'LongCat', 'openai', 'https://api.longcat.chat/openai'),
  sp('huggingface', 'Hugging Face', 'openai-response', 'https://router.huggingface.co/v1/'),
  sp('gateway', 'Vercel AI Gateway', 'gateway', 'https://ai-gateway.vercel.sh/v1/ai'),
  sp('cerebras', 'Cerebras AI', 'openai', 'https://api.cerebras.ai/v1'),
  sp('mimo', 'Xiaomi MiMo', 'openai', 'https://api.xiaomimimo.com')
]

// ── Provider URLs (documentation, API key pages, etc.) ──

export const PROVIDER_URLS: Record<
  string,
  { api?: string; website?: string; apiKey?: string; docs?: string; models?: string }
> = {
  // Tier-1 commercial
  openai: {
    api: 'https://api.openai.com',
    website: 'https://openai.com',
    apiKey: 'https://platform.openai.com/api-keys',
    docs: 'https://platform.openai.com/docs',
    models: 'https://platform.openai.com/docs/models'
  },
  anthropic: {
    api: 'https://api.anthropic.com',
    website: 'https://anthropic.com',
    apiKey: 'https://console.anthropic.com/settings/keys',
    docs: 'https://docs.anthropic.com',
    models: 'https://docs.anthropic.com/en/docs/about-claude/models'
  },
  gemini: {
    api: 'https://generativelanguage.googleapis.com',
    website: 'https://ai.google.dev',
    apiKey: 'https://aistudio.google.com/app/apikey',
    docs: 'https://ai.google.dev/gemini-api/docs',
    models: 'https://ai.google.dev/gemini-api/docs/models/gemini'
  },
  'azure-openai': {
    website: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
    apiKey: 'https://portal.azure.com',
    docs: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/'
  },
  vertexai: {
    website: 'https://cloud.google.com/vertex-ai',
    docs: 'https://cloud.google.com/vertex-ai/docs'
  },

  // DeepSeek
  deepseek: {
    api: 'https://api.deepseek.com',
    website: 'https://deepseek.com',
    apiKey: 'https://platform.deepseek.com/api_keys',
    docs: 'https://api-docs.deepseek.com',
    models: 'https://api-docs.deepseek.com/quick_start/pricing'
  },

  // Chinese LLM vendors
  zhipu: {
    api: 'https://open.bigmodel.cn/api/paas/v4/',
    website: 'https://open.bigmodel.cn',
    apiKey: 'https://open.bigmodel.cn/usercenter/apikeys',
    docs: 'https://open.bigmodel.cn/dev/howuse/introduction'
  },
  dashscope: {
    api: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
    website: 'https://dashscope.aliyun.com',
    apiKey: 'https://dashscope.console.aliyun.com/apiKey',
    docs: 'https://help.aliyun.com/zh/dashscope/'
  },
  moonshot: {
    api: 'https://api.moonshot.cn',
    website: 'https://moonshot.cn',
    apiKey: 'https://platform.moonshot.cn/console/api-keys',
    docs: 'https://platform.moonshot.cn/docs'
  },
  baichuan: {
    api: 'https://api.baichuan-ai.com',
    website: 'https://www.baichuan-ai.com',
    apiKey: 'https://platform.baichuan-ai.com/console/apikey',
    docs: 'https://platform.baichuan-ai.com/docs'
  },
  yi: {
    api: 'https://api.lingyiwanwu.com',
    website: 'https://www.lingyiwanwu.com',
    apiKey: 'https://platform.lingyiwanwu.com/apikeys',
    docs: 'https://platform.lingyiwanwu.com/docs'
  },
  stepfun: {
    api: 'https://api.stepfun.com',
    website: 'https://www.stepfun.com',
    apiKey: 'https://platform.stepfun.com/interface-key',
    docs: 'https://platform.stepfun.com/docs/overview/concept'
  },
  doubao: {
    api: 'https://ark.cn-beijing.volces.com/api/v3/',
    website: 'https://www.volcengine.com/product/doubao',
    apiKey: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    docs: 'https://www.volcengine.com/docs/82379/1263482'
  },
  minimax: {
    api: 'https://api.minimaxi.com/v1/',
    website: 'https://www.minimaxi.com',
    apiKey: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
    docs: 'https://platform.minimaxi.com/document/introduction'
  },
  hunyuan: {
    api: 'https://api.hunyuan.cloud.tencent.com',
    website: 'https://hunyuan.tencent.com',
    docs: 'https://cloud.tencent.com/document/product/1729'
  },
  zhinao: {
    api: 'https://api.360.cn',
    website: 'https://ai.360.cn',
    apiKey: 'https://ai.360.cn/platform/keys',
    docs: 'https://ai.360.cn/platform/docs/overview'
  },
  infini: {
    api: 'https://cloud.infini-ai.com/maas',
    website: 'https://cloud.infini-ai.com',
    docs: 'https://docs.infini-ai.com/gen-studio/overview.html'
  },

  // Cloud platform providers
  'tencent-cloud-ti': {
    api: 'https://api.lkeap.cloud.tencent.com',
    website: 'https://cloud.tencent.com/product/ti'
  },
  'baidu-cloud': {
    api: 'https://qianfan.baidubce.com/v2/',
    website: 'https://qianfan.cloud.baidu.com',
    docs: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html'
  },
  modelscope: {
    api: 'https://api-inference.modelscope.cn/v1/',
    website: 'https://modelscope.cn',
    docs: 'https://modelscope.cn/docs'
  },
  xirang: {
    api: 'https://wishub-x1.ctyun.cn',
    website: 'https://xirang.ctyun.cn'
  },
  'gitee-ai': {
    api: 'https://ai.gitee.com',
    website: 'https://ai.gitee.com',
    docs: 'https://ai.gitee.com/docs'
  },

  // International inference providers
  groq: {
    api: 'https://api.groq.com/openai',
    website: 'https://groq.com',
    apiKey: 'https://console.groq.com/keys',
    docs: 'https://console.groq.com/docs/overview',
    models: 'https://console.groq.com/docs/models'
  },
  together: {
    api: 'https://api.together.xyz',
    website: 'https://www.together.ai',
    apiKey: 'https://api.together.ai/settings/api-keys',
    docs: 'https://docs.together.ai',
    models: 'https://docs.together.ai/docs/chat-models'
  },
  fireworks: {
    api: 'https://api.fireworks.ai/inference',
    website: 'https://fireworks.ai',
    apiKey: 'https://fireworks.ai/account/api-keys',
    docs: 'https://docs.fireworks.ai'
  },
  nvidia: {
    api: 'https://integrate.api.nvidia.com',
    website: 'https://build.nvidia.com',
    apiKey: 'https://build.nvidia.com/explore/discover',
    docs: 'https://docs.api.nvidia.com'
  },
  grok: {
    api: 'https://api.x.ai',
    website: 'https://x.ai',
    apiKey: 'https://console.x.ai',
    docs: 'https://docs.x.ai'
  },
  hyperbolic: {
    api: 'https://api.hyperbolic.xyz',
    website: 'https://www.hyperbolic.xyz',
    apiKey: 'https://app.hyperbolic.xyz/settings',
    docs: 'https://docs.hyperbolic.xyz'
  },
  mistral: {
    api: 'https://api.mistral.ai',
    website: 'https://mistral.ai',
    apiKey: 'https://console.mistral.ai/api-keys/',
    docs: 'https://docs.mistral.ai',
    models: 'https://docs.mistral.ai/getting-started/models/'
  },
  perplexity: {
    api: 'https://api.perplexity.ai/',
    website: 'https://www.perplexity.ai',
    apiKey: 'https://www.perplexity.ai/settings/api',
    docs: 'https://docs.perplexity.ai'
  },
  cerebras: {
    api: 'https://api.cerebras.ai/v1',
    website: 'https://cerebras.ai',
    apiKey: 'https://cloud.cerebras.ai/',
    docs: 'https://inference-docs.cerebras.ai/introduction'
  },

  // Specialty / embedding
  jina: {
    api: 'https://api.jina.ai',
    website: 'https://jina.ai',
    apiKey: 'https://jina.ai/api-dashboard/',
    docs: 'https://docs.jina.ai'
  },
  voyageai: {
    api: 'https://api.voyageai.com',
    website: 'https://www.voyageai.com',
    apiKey: 'https://dash.voyageai.com/api-keys',
    docs: 'https://docs.voyageai.com'
  },

  // Routing / aggregator
  openrouter: {
    api: 'https://openrouter.ai/api/v1/',
    website: 'https://openrouter.ai',
    apiKey: 'https://openrouter.ai/keys',
    docs: 'https://openrouter.ai/docs',
    models: 'https://openrouter.ai/models'
  },
  silicon: {
    api: 'https://api.siliconflow.cn',
    website: 'https://siliconflow.cn',
    apiKey: 'https://cloud.siliconflow.cn/account/ak',
    docs: 'https://docs.siliconflow.cn'
  },
  aihubmix: {
    api: 'https://aihubmix.com',
    website: 'https://aihubmix.com',
    docs: 'https://doc.aihubmix.com'
  },

  // GitHub
  github: {
    api: 'https://models.github.ai/inference',
    website: 'https://github.com/marketplace/models',
    docs: 'https://docs.github.com/en/github-models'
  },
  copilot: {
    api: 'https://api.githubcopilot.com/',
    website: 'https://github.com/features/copilot',
    docs: 'https://docs.github.com/en/copilot'
  },

  // AWS
  'aws-bedrock': {
    website: 'https://aws.amazon.com/bedrock/',
    docs: 'https://docs.aws.amazon.com/bedrock/'
  },

  // Hugging Face
  huggingface: {
    api: 'https://router.huggingface.co/v1/',
    website: 'https://huggingface.co',
    apiKey: 'https://huggingface.co/settings/tokens',
    docs: 'https://huggingface.co/docs/api-inference'
  },

  // Local inference
  ollama: {
    api: 'http://localhost:11434',
    website: 'https://ollama.com',
    docs: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
    models: 'https://ollama.com/library'
  },
  lmstudio: {
    api: 'http://localhost:1234',
    website: 'https://lmstudio.ai',
    docs: 'https://lmstudio.ai/docs'
  },
  ovms: {
    api: 'http://localhost:8000/v3/',
    website: 'https://docs.openvino.ai/2024/ovms_what_is_openvino_model_server.html',
    docs: 'https://docs.openvino.ai/2024/ovms_what_is_openvino_model_server.html'
  },
  gpustack: {
    website: 'https://gpustack.ai',
    docs: 'https://docs.gpustack.ai'
  },
  'new-api': {
    website: 'https://github.com/Calcium-Ion/new-api',
    docs: 'https://github.com/Calcium-Ion/new-api'
  },

  // Gateway
  gateway: {
    api: 'https://ai-gateway.vercel.sh/v1/ai',
    website: 'https://sdk.vercel.ai/docs/ai-sdk-core/ai-gateway',
    docs: 'https://sdk.vercel.ai/docs/ai-sdk-core/ai-gateway'
  },

  // Misc Chinese aggregators / resellers
  cherryin: {
    api: 'https://open.cherryin.net',
    website: 'https://cherry-ai.com'
  },
  ocoolai: {
    api: 'https://api.ocoolai.com',
    website: 'https://www.ocoolai.com'
  },
  alayanew: {
    api: 'https://deepseek.alayanew.com',
    website: 'https://www.alayanew.com'
  },
  dmxapi: {
    api: 'https://www.dmxapi.cn',
    website: 'https://www.dmxapi.cn'
  },
  aionly: {
    api: 'https://api.aiionly.com',
    website: 'https://aiionly.com'
  },
  burncloud: {
    api: 'https://ai.burncloud.com',
    website: 'https://burncloud.com'
  },
  tokenflux: {
    api: 'https://api.tokenflux.ai/openai/v1',
    website: 'https://tokenflux.ai'
  },
  '302ai': {
    api: 'https://api.302.ai',
    website: 'https://302.ai',
    docs: 'https://doc.302.ai'
  },
  cephalon: {
    api: 'https://cephalon.cloud/user-center/v1/model',
    website: 'https://cephalon.cloud'
  },
  lanyun: {
    api: 'https://maas-api.lanyun.net',
    website: 'https://maas.lanyun.net'
  },
  ph8: {
    api: 'https://ph8.co',
    website: 'https://ph8.co'
  },
  sophnet: {
    api: 'https://www.sophnet.com/api/open-apis/v1',
    website: 'https://www.sophnet.com'
  },
  ppio: {
    api: 'https://api.ppinfra.com/v3/openai/',
    website: 'https://ppinfra.com',
    docs: 'https://ppinfra.com/docs'
  },
  qiniu: {
    api: 'https://api.qnaigc.com',
    website: 'https://qnaigc.com'
  },
  o3: {
    api: 'https://api.o3.fan',
    website: 'https://o3.fan'
  },
  poe: {
    api: 'https://api.poe.com/v1/',
    website: 'https://poe.com',
    docs: 'https://creator.poe.com/docs/poe-protocol-specification'
  },
  longcat: {
    api: 'https://api.longcat.chat/openai',
    website: 'https://longcat.chat'
  },
  mimo: {
    api: 'https://api.xiaomimimo.com',
    website: 'https://xiaomimimo.com'
  }
}
