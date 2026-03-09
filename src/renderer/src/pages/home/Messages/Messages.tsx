import React, { useCallback, useEffect, useRef, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTopicMessages } from '@renderer/hooks/useTopicMessages'
import { useTopicLoading } from '@renderer/hooks/useTopicLoading'
import { useScrollPosition } from '@renderer/hooks/useScrollPosition'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useChatContext } from '@renderer/hooks/useChatContext'
import type { Message as MessageType, MultiModelStyle } from '@renderer/types/message'
import Message from './Message'
import MessageGroup from './MessageGroup'
import SelectionBox from './SelectionBox'
import MessageOutline from './MessageOutline'
import ChatNavigation from './ChatNavigation'
import NarrowLayout from './NarrowLayout'
import EmptyState from './EmptyState'

interface MessagesProps {
  topicId: string
  onSuggestionClick?: (text: string) => void
}

/** Render item: either a single message or a grouped set sharing an askId */
interface RenderItem {
  type: 'single' | 'group'
  key: string
  message?: MessageType
  messages?: MessageType[]
  askId?: string
  style?: MultiModelStyle
}

function buildRenderItems(messages: MessageType[]): RenderItem[] {
  const items: RenderItem[] = []
  const processed = new Set<string>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (processed.has(msg.id)) continue

    // Check if this message belongs to a multi-model group
    if (msg.askId && msg.role === 'assistant') {
      const grouped = messages.filter(
        (m) => m.askId === msg.askId && m.role === 'assistant' && !processed.has(m.id)
      )

      if (grouped.length > 1) {
        for (const g of grouped) processed.add(g.id)
        items.push({
          type: 'group',
          key: `group-${msg.askId}`,
          messages: grouped,
          askId: msg.askId,
          style: msg.multiModelMessageStyle ?? 'vertical',
        })
        continue
      }
    }

    processed.add(msg.id)
    items.push({ type: 'single', key: msg.id, message: msg })
  }

  return items
}

const Messages: React.FC<MessagesProps> = ({ topicId, onSuggestionClick }) => {
  const { messages, isLoading, loadMore, hasMore } = useTopicMessages(topicId)
  const { isStreaming } = useTopicLoading(topicId)
  const { scrollRef, savePosition } = useScrollPosition(topicId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const narrowMode = useSettingsStore((s) => s.narrowMode)
  const showMessageOutline = useSettingsStore((s) => s.showMessageOutline)
  const { isMultiSelectMode, selectMessage, deselectMessage, selectedMessageIds } = useChatContext()

  // Build render items with grouping
  const renderItems = useMemo(() => buildRenderItems(messages), [messages])

  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      for (const id of Array.from(selectedMessageIds)) {
        if (!ids.includes(id)) deselectMessage(id)
      }
      for (const id of ids) {
        if (!selectedMessageIds.has(id)) selectMessage(id)
      }
    },
    [selectedMessageIds, selectMessage, deselectMessage]
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  // Continuously scroll to bottom during streaming (content updates don't change messages array)
  useEffect(() => {
    if (!isStreaming) return

    let rafId: number
    const scrollToBottom = () => {
      const container = scrollRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
      }
      rafId = requestAnimationFrame(scrollToBottom)
    }
    rafId = requestAnimationFrame(scrollToBottom)

    return () => cancelAnimationFrame(rafId)
  }, [isStreaming, scrollRef])

  // Save scroll position on scroll
  const handleScroll = useCallback(() => {
    savePosition()
  }, [savePosition])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      loadMore()
    }
  }, [isLoading, loadMore])

  // Empty state
  if (!isLoading && messages.length === 0) {
    return (
      <NarrowLayout narrowMode={narrowMode}>
        <EmptyState onSuggestionClick={onSuggestionClick} />
      </NarrowLayout>
    )
  }

  return (
    <NarrowLayout narrowMode={narrowMode}>
      <div className="relative flex-1 overflow-hidden">
        {/* Multi-select drag overlay */}
        <SelectionBox isActive={isMultiSelectMode} onSelectionChange={handleSelectionChange} />

        {/* Message outline sidebar */}
        {showMessageOutline && <MessageOutline messages={messages} />}

        <div
          id="messages-scroll-container"
          ref={scrollRef}
          className="h-full overflow-y-auto"
          style={{ willChange: 'transform' }}
          onScroll={handleScroll}
        >
          <InfiniteScroll
            dataLength={messages.length}
            next={handleLoadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-2">
                <span className="text-xs text-zinc-400">Loading...</span>
              </div>
            }
            inverse
            scrollableTarget="messages-scroll-container"
            className="flex flex-col-reverse"
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
          >
            <div className="flex flex-col gap-1 pb-4">
              {renderItems.map((item) => {
                if (item.type === 'group' && item.messages && item.askId) {
                  return (
                    <MessageGroup
                      key={item.key}
                      messages={item.messages}
                      askId={item.askId}
                      style={item.style ?? 'vertical'}
                    />
                  )
                }

                const message = item.message!
                return (
                  <div key={item.key} data-message-id={message.id}>
                    <Message
                      message={message}
                      isStreaming={
                        isStreaming &&
                        message.role === 'assistant' &&
                        message.status === 'processing'
                      }
                    />
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </InfiniteScroll>
        </div>
        <ChatNavigation scrollContainerRef={scrollRef} />
      </div>
    </NarrowLayout>
  )
}

export default React.memo(Messages)
