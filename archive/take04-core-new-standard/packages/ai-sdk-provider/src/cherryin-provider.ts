// CherryIN Provider — multi-backend routing (F003)

import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModelV1 as LanguageModel, EmbeddingModelV1 as EmbeddingModel, ImageModelV1 as ImageModel } from 'ai'
import type { CherryInProviderSettings } from './types'

export interface CherryInProvider {
  (modelId: string): LanguageModel
  languageModel(modelId: string): LanguageModel
  chat(modelId: string): LanguageModel
  responses(modelId: string): LanguageModel
  embedding(modelId: string): EmbeddingModel<string>
  image(modelId: string): ImageModel
}

export function createCherryInProvider(settings: CherryInProviderSettings = {}): CherryInProvider {
  const endpointType = settings.endpointType ?? 'openai'

  // Create provider instances based on endpoint type
  const createBackend = () => {
    switch (endpointType) {
      case 'anthropic':
        return createAnthropic({
          apiKey: settings.apiKey,
          baseURL: settings.anthropicBaseURL ?? settings.baseURL,
          headers: settings.headers
        })

      case 'gemini':
        return createGoogleGenerativeAI({
          apiKey: settings.apiKey,
          baseURL: settings.geminiBaseURL ?? settings.baseURL,
          headers: settings.headers
        })

      case 'openai':
      case 'openai-response':
      case 'image-generation':
      default:
        return createOpenAI({
          apiKey: settings.apiKey,
          baseURL: settings.baseURL,
          headers: settings.headers,
          compatibility: 'compatible'
        })
    }
  }

  // Always create an OpenAI-compatible instance for embedding/image
  const openaiBackend = createOpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.baseURL,
    headers: settings.headers,
    compatibility: 'compatible'
  })

  const backend = createBackend()

  const languageModel = (modelId: string): LanguageModel => {
    if ('languageModel' in backend && typeof backend.languageModel === 'function') {
      return backend.languageModel(modelId)
    }
    return (backend as (id: string) => LanguageModel)(modelId)
  }

  const embedding = (modelId: string): EmbeddingModel<string> => {
    if ('textEmbeddingModel' in openaiBackend && typeof openaiBackend.textEmbeddingModel === 'function') {
      return openaiBackend.textEmbeddingModel(modelId)
    }
    throw new Error('Embedding model not supported')
  }

  const image = (modelId: string): ImageModel => {
    if ('image' in openaiBackend && typeof openaiBackend.image === 'function') {
      return openaiBackend.image(modelId) as ImageModel
    }
    throw new Error('Image model not supported')
  }

  // Build the provider function
  const provider = ((modelId: string) => languageModel(modelId)) as CherryInProvider
  provider.languageModel = languageModel
  provider.chat = languageModel
  provider.responses = languageModel
  provider.embedding = embedding
  provider.image = image

  return provider
}
