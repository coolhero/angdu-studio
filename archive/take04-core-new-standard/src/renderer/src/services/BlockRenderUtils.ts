// BlockRenderUtils — utility functions for processing blocks for rendering (T032)

import type {
  MessageBlock,
  MainTextBlock,
  ThinkingBlock,
  CodeBlock,
  ToolBlock,
  CitationBlock,
  CitationRef,
  ErrorBlock,
  ImageBlock,
  ImageMetadata,
  FileBlock,
  TranslationBlock,
  VideoBlock,
  CompactBlock,
  FileMetadata
} from '@shared/types'

// ── MainTextBlock ──

export function getMainTextContent(block: MainTextBlock): string {
  return block.content
}

// ── ThinkingBlock ──

export function getThinkingContent(block: ThinkingBlock): { content: string; duration?: number } {
  return {
    content: block.content,
    duration: block.thinking_millsec
  }
}

// ── CodeBlock ──

export function getCodeContent(block: CodeBlock): { content: string; language?: string } {
  return {
    content: block.content,
    language: block.language
  }
}

// ── ToolBlock ──

export function getToolInfo(block: ToolBlock): {
  toolName?: string
  arguments?: string
  response?: unknown
} {
  return {
    toolName: block.toolName,
    arguments: block.arguments,
    response: block.rawMcpToolResponse
  }
}

// ── CitationBlock ──

export function getCitationRefs(block: CitationBlock): CitationRef[] {
  const seen = new Map<string, CitationRef>()

  // Merge webSearchResults.results
  if (block.webSearchResults?.results) {
    for (const result of block.webSearchResults.results) {
      if (!seen.has(result.url)) {
        seen.set(result.url, {
          url: result.url,
          title: result.title,
          content: result.content
        })
      }
    }
  }

  // Merge knowledgeReferences (use sourceUrl as the dedup key when available)
  if (block.knowledgeReferences) {
    for (const ref of block.knowledgeReferences) {
      const key = ref.sourceUrl ?? ref.id
      if (!seen.has(key)) {
        seen.set(key, {
          url: ref.sourceUrl ?? ref.id,
          content: ref.content
        })
      }
    }
  }

  // Merge memoryReferences (no URL — use id as synthetic key)
  if (block.memoryReferences) {
    for (const ref of block.memoryReferences) {
      const key = ref.id
      if (!seen.has(key)) {
        seen.set(key, {
          url: key,
          content: ref.content
        })
      }
    }
  }

  // Assign sequential 1-based index
  let index = 1
  const refs: CitationRef[] = []
  for (const ref of seen.values()) {
    refs.push({ ...ref, index: index++ })
  }

  return refs
}

// ── ErrorBlock ──

export function getErrorContent(block: ErrorBlock): string {
  return block.error
}

// ── ImageBlock ──

export function getImageInfo(block: ImageBlock): {
  url?: string | null
  file?: FileMetadata | null
  metadata?: ImageMetadata
} {
  return {
    url: block.url,
    file: block.file,
    metadata: block.imageMetadata
  }
}

// ── FileBlock ──

export function getFileInfo(block: FileBlock): FileMetadata | undefined {
  return block.file
}

// ── TranslationBlock ──

export function getTranslationContent(block: TranslationBlock): {
  content: string
  sourceLanguage?: string
  targetLanguage?: string
} {
  return {
    content: block.content,
    sourceLanguage: block.sourceLanguage,
    targetLanguage: block.targetLanguage
  }
}

// ── VideoBlock ──

export function getVideoInfo(block: VideoBlock): { url?: string | null; filePath?: string | null } {
  return {
    url: block.url,
    filePath: block.filePath
  }
}

// ── CompactBlock ──

export function getCompactContent(block: CompactBlock): {
  content: string
  compactedContent?: string
} {
  return {
    content: block.content,
    compactedContent: block.compactedContent
  }
}

// ── Generic content extraction ──

export function getBlockContent(block: MessageBlock): string {
  if ('content' in block && typeof block.content === 'string') {
    return block.content
  }
  return ''
}
