import type { Provider, ProviderType } from '../types/provider'

interface SystemProviderDef {
  id: string
  type: ProviderType
  name: string
  apiHost: string
  authType?: 'apiKey' | 'oauth'
}

export const SYSTEM_PROVIDERS: SystemProviderDef[] = [
  { id: 'openai', type: 'openai', name: 'OpenAI', apiHost: 'https://api.openai.com' },
  { id: 'anthropic', type: 'anthropic', name: 'Anthropic', apiHost: 'https://api.anthropic.com' },
  { id: 'gemini', type: 'gemini', name: 'Google Gemini', apiHost: 'https://generativelanguage.googleapis.com' },
  { id: 'azure-openai', type: 'azure-openai', name: 'Azure OpenAI', apiHost: '' },
  { id: 'mistral', type: 'mistral', name: 'Mistral AI', apiHost: 'https://api.mistral.ai' },
  { id: 'ollama', type: 'ollama', name: 'Ollama', apiHost: 'http://localhost:11434' },
  { id: 'vertexai', type: 'vertexai', name: 'Vertex AI', apiHost: '', authType: 'oauth' },
  { id: 'aws-bedrock', type: 'aws-bedrock', name: 'AWS Bedrock', apiHost: '', authType: 'oauth' },
  { id: 'vertex-anthropic', type: 'vertex-anthropic', name: 'Vertex AI (Anthropic)', apiHost: '', authType: 'oauth' },
  { id: 'new-api', type: 'new-api', name: 'New API', apiHost: '' },
  { id: 'gateway', type: 'gateway', name: 'API Gateway', apiHost: '' },
  { id: 'openai-response', type: 'openai-response', name: 'OpenAI (Response API)', apiHost: 'https://api.openai.com' },
  { id: 'angduin', type: 'openai', name: 'AngduIN', apiHost: 'https://api.angdu.in', authType: 'oauth' },
  { id: 'github-copilot', type: 'openai', name: 'GitHub Copilot', apiHost: 'https://api.githubcopilot.com', authType: 'oauth' }
] as const

export function createSystemProvider(def: SystemProviderDef): Provider {
  return {
    id: def.id,
    type: def.type,
    name: def.name,
    apiKey: '',
    apiHost: def.apiHost,
    models: [],
    enabled: false,
    isSystem: true,
    authType: def.authType ?? 'apiKey'
  }
}

export function getSystemProviders(): Provider[] {
  return SYSTEM_PROVIDERS.map(createSystemProvider)
}
