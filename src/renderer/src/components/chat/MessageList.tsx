import { useRef, useEffect, useCallback, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMessages, useHasMoreMessages, useMessageStore } from '@renderer/stores/useMessageStore'
import { useBlockStore } from '@renderer/stores/useBlockStore'
import { useIsStreaming } from '@renderer/stores/useChatStore'
import { MessageItem } from './MessageItem'
import { EmptyState } from './EmptyState'
import { ScrollToBottom } from './ScrollToBottom'

interface MessageListProps {
  onEditMessage?: (messageId: string, currentText: string) => void
}

export function MessageList({ onEditMessage }: MessageListProps) {
  const messages = useMessages()
  const hasMore = useHasMoreMessages()
  const isStreaming = useIsStreaming()
  const parentRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Load blocks for visible messages
  useEffect(() => {
    if (messages.length === 0) return
    const messageIds = messages.map((m) => m.id)
    const { blocksByMessage } = useBlockStore.getState()
    const missing = messageIds.filter((id) => !blocksByMessage[id])
    if (missing.length > 0) {
      useBlockStore.getState().loadBlocks(missing)
    }
  }, [messages])

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5
  })

  // Check if at bottom
  const handleScroll = useCallback(() => {
    const el = parentRef.current
    if (!el) return
    const threshold = 50
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  // Auto-scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
    }
  }, [messages.length, isStreaming, isAtBottom]) // eslint-disable-line react-hooks/exhaustive-deps

  // Also auto-scroll during streaming block updates
  useEffect(() => {
    if (isStreaming && isAtBottom) {
      const el = parentRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    }
  })

  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
      setIsAtBottom(true)
    }
  }, [messages.length, virtualizer])

  // Load more when scrolling to top
  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      useMessageStore.getState().loadMore()
    }
  }, [hasMore])

  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          handleLoadMore()
        }
      },
      { root: el, threshold: 0.1 }
    )

    // Observe a sentinel element at the top
    const sentinel = el.querySelector('[data-load-more-sentinel]')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMore, handleLoadMore])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
      >
        {hasMore && (
          <div data-load-more-sentinel className="h-1" />
        )}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <MessageItem
                  message={message}
                  onEdit={onEditMessage}
                />
              </div>
            )
          })}
        </div>
      </div>
      <ScrollToBottom visible={!isAtBottom} onClick={scrollToBottom} />
    </div>
  )
}
