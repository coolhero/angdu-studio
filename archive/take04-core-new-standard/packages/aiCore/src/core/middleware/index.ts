// Middleware utilities (F003)

import { wrapLanguageModel, type Experimental_LanguageModelV1Middleware as LanguageModelMiddleware, type LanguageModelV1 as LanguageModel } from 'ai'

export type { LanguageModelMiddleware }

export function createMiddlewares(...middlewares: LanguageModelMiddleware[]): LanguageModelMiddleware[] {
  return middlewares.filter(Boolean)
}

export function wrapModelWithMiddlewares(model: LanguageModel, middlewares: LanguageModelMiddleware[]): LanguageModel {
  if (middlewares.length === 0) return model

  let wrappedModel = model
  for (const middleware of middlewares) {
    wrappedModel = wrapLanguageModel({ model: wrappedModel, middleware })
  }
  return wrappedModel
}
