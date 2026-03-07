// useBlockRenderer — hook for rendering message blocks (T033-T034)

import { useMessageStore } from '../stores/useMessageStore'
import {
  getMainTextContent,
  getThinkingContent,
  getCodeContent,
  getToolInfo,
  getCitationRefs,
  getErrorContent,
  getImageInfo,
  getFileInfo,
  getTranslationContent,
  getVideoInfo,
  getCompactContent,
  getBlockContent
} from '../services/BlockRenderUtils'

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
  FileMetadata,
  TranslationBlock,
  VideoBlock,
  CompactBlock
} from '@shared/types'

// ── Return type union for getBlockData ──

export type BlockData =
  | string
  | { content: string; duration?: number }
  | { content: string; language?: string }
  | { toolName?: string; arguments?: string; response?: unknown }
  | CitationRef[]
  | { url?: string | null; file?: FileMetadata | null; metadata?: ImageMetadata }
  | FileMetadata
  | undefined
  | { content: string; sourceLanguage?: string; targetLanguage?: string }
  | { url?: string | null; filePath?: string | null }
  | { content: string; compactedContent?: string }

// ── Hook ──

export function useBlockRenderer(messageId: string): {
  blocks: MessageBlock[]
  getBlockData: (block: MessageBlock) => BlockData
} {
  const getBlocksForMessage = useMessageStore((state) => state.getBlocksForMessage)
  const blocks = getBlocksForMessage(messageId)

  function getBlockData(block: MessageBlock): BlockData {
    switch (block.type) {
      case 'main_text':
        return getMainTextContent(block as MainTextBlock)
      case 'thinking':
        return getThinkingContent(block as ThinkingBlock)
      case 'code':
        return getCodeContent(block as CodeBlock)
      case 'tool':
        return getToolInfo(block as ToolBlock)
      case 'citation':
        return getCitationRefs(block as CitationBlock)
      case 'error':
        return getErrorContent(block as ErrorBlock)
      case 'image':
        return getImageInfo(block as ImageBlock)
      case 'file':
        return getFileInfo(block as FileBlock)
      case 'translation':
        return getTranslationContent(block as TranslationBlock)
      case 'video':
        return getVideoInfo(block as VideoBlock)
      case 'compact':
        return getCompactContent(block as CompactBlock)
      default:
        return getBlockContent(block)
    }
  }

  return { blocks, getBlockData }
}
