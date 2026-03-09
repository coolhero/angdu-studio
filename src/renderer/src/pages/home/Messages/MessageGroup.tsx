import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { Message as MessageType } from '@renderer/types/message'
import type { MultiModelStyle } from '@renderer/types/message'
import Message from './Message'

interface MessageGroupProps {
  messages: MessageType[]
  askId: string
  style: MultiModelStyle
}

const MessageGroup: React.FC<MessageGroupProps> = ({ messages, askId, style }) => {
  const [expandedIndex, setExpandedIndex] = useState(0)

  if (messages.length <= 1) {
    return messages[0] ? <Message message={messages[0]} isStreaming={false} /> : null
  }

  if (style === 'horizontal') {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-2" data-ask-id={askId}>
        {messages.map((msg) => (
          <div key={msg.id} className="min-w-[300px] flex-1">
            <Message message={msg} isStreaming={false} />
          </div>
        ))}
      </div>
    )
  }

  if (style === 'vertical') {
    return (
      <div className="flex flex-col" data-ask-id={askId}>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} isStreaming={false} />
        ))}
      </div>
    )
  }

  if (style === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2 px-4 py-2" data-ask-id={askId}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <Message message={msg} isStreaming={false} />
          </div>
        ))}
      </div>
    )
  }

  // fold (accordion)
  return (
    <div className="flex flex-col" data-ask-id={askId}>
      {messages.map((msg, i) => {
        const isOpen = expandedIndex === i || msg.foldSelected
        return (
          <div key={msg.id} className="border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setExpandedIndex(i)}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs',
                'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              )}
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <span>{msg.model?.name ?? msg.modelId ?? `Response ${i + 1}`}</span>
            </button>
            {isOpen && <Message message={msg} isStreaming={false} />}
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(MessageGroup)
