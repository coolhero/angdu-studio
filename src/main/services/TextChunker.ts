import { KNOWLEDGE_DEFAULTS } from '@shared/types/knowledge'

/**
 * Split text into chunks of `chunkSize` characters with `chunkOverlap` overlap.
 */
export function chunkText(
  text: string,
  chunkSize: number = KNOWLEDGE_DEFAULTS.chunkSize,
  chunkOverlap: number = KNOWLEDGE_DEFAULTS.chunkOverlap
): string[] {
  if (!text || text.length === 0) return []
  if (chunkSize <= 0) throw new Error('chunkSize must be positive')
  if (chunkOverlap < 0) throw new Error('chunkOverlap must be non-negative')
  if (chunkOverlap >= chunkSize) throw new Error('chunkOverlap must be less than chunkSize')

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))

    if (end >= text.length) break
    start += chunkSize - chunkOverlap
  }

  return chunks
}
