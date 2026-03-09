import React, { useState, useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import type { Message as MessageType } from '@renderer/types/message'
import { MessageBlockType, type MainTextMessageBlock } from '@renderer/types/message-block'
import MessageHeader from './MessageHeader'
import MessageContent from './MessageContent'
import MessageMenubar from './MessageMenubar'
import MessageEditor from './MessageEditor'
import MessageTokens from './MessageTokens'
import MessageAttachments from './MessageAttachments'

interface MessageProps {
  message: MessageType
  isStreaming: boolean
  onEditMessage?: (messageId: string, content: string) => void
  onResendMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onRetryMessage?: (messageId: string) => void
}

const Message: React.FC<MessageProps> = ({
  message,
  isStreaming,
  onEditMessage,
  onResendMessage,
  onDeleteMessage,
  onRetryMessage,
}) => {
  const messageStyle = useSettingsStore((s) => s.messageStyle)
  const getBlocksForMessage = useMessageBlockStore((s) => s.getBlocksForMessage)
  const isUser = message.role === 'user'
  const isBubble = messageStyle === 'bubble'
  const isComplete = message.status === 'success' || message.status === 'error'

  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Get initial content for editor
  const getMainTextContent = useCallback((): string => {
    const blocks = getBlocksForMessage(message.id)
    const mainBlock = blocks.find(
      (b) => b.type === MessageBlockType.MAIN_TEXT
    ) as MainTextMessageBlock | undefined
    return mainBlock?.content ?? ''
  }, [message.id, getBlocksForMessage])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleEditSave = useCallback(
    (content: string) => {
      onEditMessage?.(message.id, content)
      setIsEditing(false)
    },
    [message.id, onEditMessage]
  )

  const handleEditResend = useCallback(
    (content: string) => {
      onResendMessage?.(message.id, content)
      setIsEditing(false)
    },
    [message.id, onResendMessage]
  )

  const handleEditCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleDelete = useCallback(() => {
    onDeleteMessage?.(message.id)
  }, [message.id, onDeleteMessage])

  const handleRetry = useCallback(() => {
    onRetryMessage?.(message.id)
  }, [message.id, onRetryMessage])

  return (
    <div
      className={cn(
        'group relative px-4 py-2',
        isBubble && 'flex',
        isBubble && isUser && 'justify-end',
        isBubble && !isUser && 'justify-start'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'max-w-3xl',
          isBubble && 'max-w-[80%]',
          isBubble && isUser && 'rounded-2xl rounded-br-sm bg-blue-500 px-4 py-2 text-white dark:bg-blue-600',
          isBubble && !isUser && 'rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2 dark:bg-zinc-800'
        )}
      >
        {/* Header: show for plain style, or for assistant in bubble style */}
        {(!isBubble || !isUser) && (
          <MessageHeader message={message} isLastInGroup />
        )}

        {/* Attachments (user messages) */}
        {isUser && <MessageAttachments message={message} />}

        {/* Content or Editor */}
        {isEditing ? (
          <MessageEditor
            message={message}
            initialContent={getMainTextContent()}
            onSave={handleEditSave}
            onResend={handleEditResend}
            onCancel={handleEditCancel}
          />
        ) : (
          <MessageContent message={message} isStreaming={isStreaming} />
        )}

        {/* Token usage (assistant messages, when complete) */}
        {!isUser && isComplete && (
          <MessageTokens usage={message.usage} />
        )}

        {/* Streaming indicator */}
        {isStreaming && !isUser && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Hover menubar */}
      {isHovered && !isStreaming && !isEditing && isComplete && (
        <div
          className={cn(
            'absolute -top-3 z-10',
            isUser ? 'right-6' : 'left-6'
          )}
        >
          <MessageMenubar
            message={message}
            onEdit={isUser && onEditMessage ? handleEdit : undefined}
            onDelete={onDeleteMessage ? handleDelete : undefined}
            onRetry={!isUser && onRetryMessage ? handleRetry : undefined}
          />
        </div>
      )}
    </div>
  )
}

export default React.memo(Message)
