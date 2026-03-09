import React from 'react'
import { ImageIcon, FileIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import type { Message } from '@renderer/types/message'
import {
  MessageBlockType,
  type ImageMessageBlock,
  type FileMessageBlock,
} from '@renderer/types/message-block'

interface MessageAttachmentsProps {
  message: Message
}

const MessageAttachments: React.FC<MessageAttachmentsProps> = ({ message }) => {
  const blocks = useMessageBlockStore((s) => s.getBlocksForMessage(message.id))

  const attachments = blocks.filter(
    (b) => b.type === MessageBlockType.FILE || b.type === MessageBlockType.IMAGE
  )

  if (attachments.length === 0) return null

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {attachments.map((block) => {
        if (block.type === MessageBlockType.IMAGE) {
          const imageBlock = block as ImageMessageBlock
          const src = imageBlock.url || imageBlock.file?.url

          return (
            <div
              key={block.id}
              className={cn(
                'h-12 w-12 rounded-md border border-zinc-200 dark:border-zinc-700',
                'overflow-hidden bg-zinc-50 dark:bg-zinc-800'
              )}
            >
              {src ? (
                <img
                  src={src}
                  alt={imageBlock.file?.name || 'Attachment'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-zinc-400" />
                </div>
              )}
            </div>
          )
        }

        if (block.type === MessageBlockType.FILE) {
          const fileBlock = block as FileMessageBlock
          return (
            <div
              key={block.id}
              className={cn(
                'flex items-center gap-1.5 rounded-md border border-zinc-200 px-2 py-1',
                'dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400'
              )}
            >
              <FileIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[120px] truncate">{fileBlock.file.name}</span>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export default React.memo(MessageAttachments)
