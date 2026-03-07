import { useEffect, useRef, useCallback } from 'react'
import { MessageItem } from './MessageItem'
import type { Message } from '@shared/types'

interface MessageListProps {
  messages: Message[]
  streamingMessageId: string | null
}

export function MessageList({ messages, streamingMessageId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottom = useRef(true)

  const checkNearBottom = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }, [])

  useEffect(() => {
    if (isNearBottom.current) {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight })
    }
  }, [messages, streamingMessageId])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Start a conversation
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={checkNearBottom}
      className="flex-1 overflow-y-auto"
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  )
}
