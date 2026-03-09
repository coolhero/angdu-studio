import React, { useMemo, useCallback } from 'react'
import { List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import type { Message } from '@renderer/types/message'
import { MessageBlockType } from '@renderer/types/message-block'
import type { MainTextMessageBlock } from '@renderer/types/message-block'

interface MessageOutlineProps {
  messages: Message[]
}

interface HeadingEntry {
  level: number
  text: string
  messageId: string
}

/** Extract markdown headings from assistant messages */
function extractHeadings(
  messages: Message[],
  getBlocksForMessage: (id: string) => import('@renderer/types/message-block').MessageBlock[]
): HeadingEntry[] {
  const headings: HeadingEntry[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue

    const blocks = getBlocksForMessage(msg.id)
    for (const block of blocks) {
      if (block.type !== MessageBlockType.MAIN_TEXT) continue
      const content = (block as MainTextMessageBlock).content
      let match: RegExpExecArray | null

      while ((match = headingRegex.exec(content)) !== null) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          messageId: msg.id,
        })
      }
    }
  }

  return headings
}

const INDENT_PX: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-3',
  3: 'pl-6',
  4: 'pl-9',
  5: 'pl-12',
  6: 'pl-14',
}

const MessageOutline: React.FC<MessageOutlineProps> = ({ messages }) => {
  const { t } = useTranslation()
  const getBlocksForMessage = useMessageBlockStore((s) => s.getBlocksForMessage)

  const headings = useMemo(
    () => extractHeadings(messages, getBlocksForMessage),
    [messages, getBlocksForMessage]
  )

  const handleClick = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  if (headings.length === 0) return null

  return (
    <div
      className={cn(
        'absolute right-4 top-16 z-30 w-48 rounded-lg border p-2',
        'border-zinc-200 bg-white/95 shadow-md backdrop-blur-sm',
        'dark:border-zinc-700 dark:bg-zinc-800/95'
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <List className="h-3.5 w-3.5" />
        {t('chat.outline.title', 'Outline')}
      </div>
      <nav className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {headings.map((h, i) => (
          <button
            key={`${h.messageId}-${i}`}
            onClick={() => handleClick(h.messageId)}
            className={cn(
              'truncate rounded px-1.5 py-0.5 text-left text-xs',
              'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              'dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
              INDENT_PX[h.level] ?? 'pl-0'
            )}
            title={h.text}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default React.memo(MessageOutline)
