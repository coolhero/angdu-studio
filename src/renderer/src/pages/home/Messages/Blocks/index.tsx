import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import type { MessageBlock } from '@renderer/types/message-block'
import {
  MessageBlockType,
  MessageBlockStatus,
  type MainTextMessageBlock,
  type ThinkingMessageBlock,
  type ToolMessageBlock,
  type ImageMessageBlock,
  type VideoMessageBlock,
  type FileMessageBlock,
  type CitationMessageBlock,
  type ErrorMessageBlock,
  type TranslationMessageBlock,
  type CompactMessageBlock,
  type CodeMessageBlock,
} from '@renderer/types/message-block'
import type { Message } from '@renderer/types/message'
import MainTextBlock from './MainTextBlock'
import PlaceholderBlock from './PlaceholderBlock'
import ThinkingBlock from './ThinkingBlock'
import ToolBlock from './ToolBlock'
import ToolBlockGroup from './ToolBlockGroup'
import ImageBlock from './ImageBlock'
import VideoBlock from './VideoBlock'
import FileBlock from './FileBlock'
import CitationBlock from './CitationBlock'
import ErrorBlock from './ErrorBlock'
import TranslationBlock from './TranslationBlock'
import CompactBlock from './CompactBlock'

interface MessageBlockRendererProps {
  blocks: MessageBlock[]
  message: Message
  isStreaming: boolean
}

/**
 * Groups consecutive TOOL blocks together.
 * Returns an array of render items: single blocks or grouped tool blocks.
 */
interface RenderItem {
  type: 'single'
  block: MessageBlock
}

interface RenderToolGroup {
  type: 'tool-group'
  blocks: ToolMessageBlock[]
  key: string
}

type RenderEntry = RenderItem | RenderToolGroup

function groupBlocks(blocks: MessageBlock[]): RenderEntry[] {
  const entries: RenderEntry[] = []
  let toolGroup: ToolMessageBlock[] = []

  const flushToolGroup = () => {
    if (toolGroup.length > 0) {
      entries.push({
        type: 'tool-group',
        blocks: [...toolGroup],
        key: toolGroup.map((b) => b.id).join('-'),
      })
      toolGroup = []
    }
  }

  for (const block of blocks) {
    if (block.type === MessageBlockType.TOOL) {
      toolGroup.push(block as ToolMessageBlock)
    } else {
      flushToolGroup()
      entries.push({ type: 'single', block })
    }
  }
  flushToolGroup()

  return entries
}

const MessageBlockRenderer: React.FC<MessageBlockRendererProps> = ({
  blocks,
  message,
  isStreaming,
}) => {
  const entries = useMemo(() => groupBlocks(blocks), [blocks])

  return (
    <>
      {entries.map((entry) => {
        if (entry.type === 'tool-group') {
          return (
            <motion.div
              key={entry.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ToolBlockGroup blocks={entry.blocks} isStreaming={isStreaming} />
            </motion.div>
          )
        }

        const block = entry.block
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {renderBlock(block, isStreaming)}
          </motion.div>
        )
      })}
      {isStreaming &&
        blocks.length > 0 &&
        blocks.every((b) => b.status === MessageBlockStatus.PENDING) && (
          <PlaceholderBlock isStreaming={isStreaming} />
        )}
    </>
  )
}

function renderBlock(block: MessageBlock, isStreaming: boolean): React.ReactNode {
  // Pending/Processing blocks show placeholder
  if (
    block.status === MessageBlockStatus.PENDING ||
    block.status === MessageBlockStatus.PROCESSING
  ) {
    return <PlaceholderBlock isStreaming={isStreaming} />
  }

  switch (block.type) {
    case MessageBlockType.MAIN_TEXT:
      return (
        <MainTextBlock
          block={block as MainTextMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.THINKING:
      return (
        <ThinkingBlock
          block={block as ThinkingMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.CODE:
      return (
        <MainTextBlock
          block={{
            ...(block as CodeMessageBlock),
            type: MessageBlockType.MAIN_TEXT,
            content: `\`\`\`${(block as CodeMessageBlock).language}\n${(block as CodeMessageBlock).content}\n\`\`\``,
          } as MainTextMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.IMAGE:
      return (
        <ImageBlock
          block={block as ImageMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.TOOL:
      return (
        <ToolBlock
          block={block as ToolMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.FILE:
      return (
        <FileBlock
          block={block as FileMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.ERROR:
      return (
        <ErrorBlock
          block={block as ErrorMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.CITATION:
      return (
        <CitationBlock
          block={block as CitationMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.VIDEO:
      return (
        <VideoBlock
          block={block as VideoMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.TRANSLATION:
      return (
        <TranslationBlock
          block={block as TranslationMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.COMPACT:
      return (
        <CompactBlock
          block={block as CompactMessageBlock}
          isStreaming={isStreaming}
        />
      )
    case MessageBlockType.UNKNOWN:
      return (
        <div className="py-1 text-xs italic text-zinc-400">
          Unknown block type
        </div>
      )
    default:
      return null
  }
}

export default React.memo(MessageBlockRenderer)
