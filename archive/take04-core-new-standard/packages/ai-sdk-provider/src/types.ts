// CherryIN Provider Types (F003)

export interface CherryInProviderSettings {
  apiKey?: string
  baseURL?: string
  anthropicBaseURL?: string
  geminiBaseURL?: string
  headers?: Record<string, string>
  endpointType?: 'openai' | 'openai-response' | 'anthropic' | 'gemini' | 'image-generation'
}
