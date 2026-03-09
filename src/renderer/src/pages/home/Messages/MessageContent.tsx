import React from 'react'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import type { Message } from '@renderer/types/message'
import MessageBlockRenderer from './Blocks'

interface MessageContentProps {
  message: Message
  isStreaming: boolean
}

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  isStreaming,
}) => {
  const blocks = useMessageBlockStore((s) => s.getBlocksForMessage(message.id))

  return (
    <div className="message-content min-w-0 flex-1">
      <MessageBlockRenderer
        blocks={blocks}
        message={message}
        isStreaming={isStreaming}
      />
    </div>
  )
}

export default React.memo(MessageContent)
