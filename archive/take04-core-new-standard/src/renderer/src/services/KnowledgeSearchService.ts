// KnowledgeSearchService — Search orchestration for renderer (F004)

import type { KnowledgeReference, Model } from '@shared/types'

/**
 * Search the knowledge base vector index for relevant content.
 */
export async function search(
  baseId: string,
  query: string,
  count?: number
): Promise<KnowledgeReference[]> {
  const results = await window.api?.knowledge?.search(baseId, query, count)
  return (results as KnowledgeReference[]) ?? []
}

/**
 * Rerank search results using an AI model for improved relevance.
 */
export async function rerank(
  baseId: string,
  query: string,
  results: KnowledgeReference[],
  model: Model
): Promise<KnowledgeReference[]> {
  const reranked = await window.api?.knowledge?.rerank(baseId, query, results, model)
  return (reranked as KnowledgeReference[]) ?? results
}
