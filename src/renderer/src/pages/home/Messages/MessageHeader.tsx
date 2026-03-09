import React from 'react'
import { User, Bot } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { Message } from '@renderer/types/message'

interface MessageHeaderProps {
  message: Message
  isLastInGroup: boolean
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  message,
  isLastInGroup,
}) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const displayName = isUser
    ? 'You'
    : message.model?.name ?? message.modelId ?? 'Assistant'

  const AvatarIcon = isUser ? User : Bot

  return (
    <div
      className={cn(
        'flex items-center gap-2 mb-1',
        !isLastInGroup && 'hidden'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
        )}
      >
        <AvatarIcon className="h-3.5 w-3.5" />
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {displayName}
      </span>

      {/* Timestamp */}
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {formatTimestamp(message.createdAt)}
      </span>
    </div>
  )
}

export default React.memo(MessageHeader)
