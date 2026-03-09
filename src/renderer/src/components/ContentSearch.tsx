import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import { useShortcut } from '@renderer/hooks/useShortcut'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import type { Message } from '@renderer/types/message'
import { MessageBlockType } from '@renderer/types/message-block'
import type { MainTextMessageBlock, ThinkingMessageBlock, CodeMessageBlock } from '@renderer/types/message-block'

interface ContentSearchProps {
  messages: Message[]
  onLocate: (messageId: string) => void
  onClose: () => void
}

/** Extract searchable text from all blocks belonging to a message */
function getMessageTextContent(
  messageId: string,
  getBlocksForMessage: (id: string) => import('@renderer/types/message-block').MessageBlock[]
): string {
  const blocks = getBlocksForMessage(messageId)
  return blocks
    .map((b) => {
      switch (b.type) {
        case MessageBlockType.MAIN_TEXT:
          return (b as MainTextMessageBlock).content
        case MessageBlockType.THINKING:
          return (b as ThinkingMessageBlock).content
        case MessageBlockType.CODE:
          return (b as CodeMessageBlock).content
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join(' ')
}

const ContentSearch: React.FC<ContentSearchProps> = ({ messages, onLocate, onClose }) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const getBlocksForMessage = useMessageBlockStore((s) => s.getBlocksForMessage)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Escape to close
  useShortcut('Escape', onClose)

  // Matching message IDs
  const matches = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return messages
      .filter((m) => {
        const text = getMessageTextContent(m.id, getBlocksForMessage)
        return text.toLowerCase().includes(lowerQuery)
      })
      .map((m) => m.id)
  }, [query, messages, getBlocksForMessage])

  // Clamp current index
  useEffect(() => {
    if (currentIndex >= matches.length) {
      setCurrentIndex(Math.max(0, matches.length - 1))
    }
  }, [matches.length, currentIndex])

  // Navigate to current match
  useEffect(() => {
    if (matches.length > 0 && matches[currentIndex]) {
      onLocate(matches[currentIndex])
    }
  }, [currentIndex, matches, onLocate])

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : matches.length - 1))
  }, [matches.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i < matches.length - 1 ? i + 1 : 0))
  }, [matches.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          handlePrev()
        } else {
          handleNext()
        }
        e.preventDefault()
      }
    },
    [handlePrev, handleNext]
  )

  return (
    <div
      className={cn(
        'absolute left-1/2 top-2 z-50 flex -translate-x-1/2 items-center gap-1',
        'rounded-lg border border-zinc-200 bg-white px-3 py-1.5 shadow-lg',
        'dark:border-zinc-700 dark:bg-zinc-800'
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('chat.search.placeholder', 'Search messages...')}
        className={cn(
          'w-52 bg-transparent px-1.5 py-0.5 text-sm outline-none',
          'text-zinc-900 placeholder:text-zinc-400',
          'dark:text-zinc-100 dark:placeholder:text-zinc-500'
        )}
      />

      {query.trim() && (
        <span className="shrink-0 text-xs text-zinc-400">
          {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : t('chat.search.noResults', '0 results')}
        </span>
      )}

      <button
        onClick={handlePrev}
        disabled={matches.length === 0}
        className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 dark:hover:text-zinc-300"
        aria-label={t('chat.search.previous', 'Previous match')}
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <button
        onClick={handleNext}
        disabled={matches.length === 0}
        className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 dark:hover:text-zinc-300"
        aria-label={t('chat.search.next', 'Next match')}
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      <button
        onClick={onClose}
        className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        aria-label={t('common.close', 'Close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default React.memo(ContentSearch)
