// KnowledgeChunker — Recursive character text splitter (F004)

const PARAGRAPH_SEPARATOR = /\n\n+/
const SENTENCE_SEPARATOR = /(?<=[.!?])\s+/
const WORD_SEPARATOR = /\s+/

/**
 * Split text into chunks using a recursive strategy:
 * 1. Try splitting on paragraph breaks
 * 2. Fall back to sentence boundaries
 * 3. Fall back to word boundaries
 * 4. Fall back to character splitting
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (trimmed.length <= chunkSize) return [trimmed]

  const separators = [PARAGRAPH_SEPARATOR, SENTENCE_SEPARATOR, WORD_SEPARATOR]
  return recursiveSplit(trimmed, separators, chunkSize, chunkOverlap)
}

function recursiveSplit(
  text: string,
  separators: RegExp[],
  chunkSize: number,
  chunkOverlap: number
): string[] {
  if (text.length <= chunkSize) return [text]

  for (const separator of separators) {
    const parts = text.split(separator).filter((p) => p.length > 0)
    if (parts.length > 1) {
      return mergeIntoParts(parts, separator, chunkSize, chunkOverlap)
    }
  }

  // Character-level fallback
  return characterSplit(text, chunkSize, chunkOverlap)
}

function mergeIntoParts(
  parts: string[],
  _separator: RegExp,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const chunks: string[] = []
  let current = ''

  for (const part of parts) {
    const candidate = current ? current + ' ' + part : part

    if (candidate.length > chunkSize && current) {
      chunks.push(current.trim())

      // Create overlap by keeping the tail of the current chunk
      if (chunkOverlap > 0) {
        const overlapText = current.slice(-chunkOverlap)
        current = overlapText + ' ' + part
      } else {
        current = part
      }
    } else {
      current = candidate
    }
  }

  if (current.trim()) {
    chunks.push(current.trim())
  }

  return chunks
}

function characterSplit(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = []
  const step = Math.max(1, chunkSize - chunkOverlap)
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    if (end >= text.length) break
    start += step
  }

  return chunks
}
