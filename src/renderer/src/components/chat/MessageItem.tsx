import { memo, useState, useCallback } from 'react'
import { User, Bot } from 'lucide-react'
import type { Message } from '@shared/types/message'
import { useBlocksForMessage } from '@renderer/stores/useBlockStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useChatStore } from '@renderer/stores/useChatStore'
import { BlockRenderer } from './blocks/BlockRenderer'
import { MessageActions } from './MessageActions'

interface MessageItemProps {
  message: Message
  onEdit?: (messageId: string, currentText: string) => void
}

export const MessageItem = memo(function MessageItem({ message, onEdit }: MessageItemProps) {
  const blocks = useBlocksForMessage(message.id)
  const [hovered, setHovered] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = useCallback(() => {
    const text = blocks
      .filter((b) => b.type === 'main_text')
      .map((b) => (b as { content: { text: string } }).content.text)
      .join('\n\n')
    window.api.invoke['clipboard:write'](text)
  }, [blocks])

  const handleDelete = useCallback(async () => {
    await useMessageStore.getState().deleteMessage(message.id)
  }, [message.id])

  const handleRegenerate = useCallback(async () => {
    await useChatStore.getState().regenerate(message.id)
  }, [message.id])

  const handleEdit = useCallback(() => {
    if (!onEdit) return
    const text = blocks
      .filter((b) => b.type === 'main_text')
      .map((b) => (b as { content: { text: string } }).content.text)
      .join('\n\n')
    onEdit(message.id, text)
  }, [blocks, message.id, onEdit])

  const handleRetry = useCallback(async () => {
    await useChatStore.getState().regenerate(message.id)
  }, [message.id])

  // Token usage display
  const usage = message.usage
  const metrics = message.metrics

  return (
    <div
      className={`group relative flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={`min-w-0 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-lg px-3 py-2 text-left ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          {blocks.length === 0 && message.status === 'sending' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
              <span>...</span>
            </div>
          )}
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              onRetry={block.type === 'error' ? handleRetry : undefined}
            />
          ))}
        </div>

        {/* Metadata */}
        {usage && !isUser && (
          <div className="mt-1 text-xs text-muted-foreground">
            {usage.totalTokens != null && <span>{usage.totalTokens} tokens</span>}
            {metrics?.totalDuration != null && (
              <span className="ml-2">{(metrics.totalDuration / 1000).toFixed(1)}s</span>
            )}
          </div>
        )}

        {/* Hover actions */}
        {hovered && (
          <div className={`absolute ${isUser ? 'left-0' : 'right-0'} top-2 z-10`}>
            <MessageActions
              messageId={message.id}
              role={message.role}
              onCopy={handleCopy}
              onEdit={isUser ? handleEdit : undefined}
              onDelete={handleDelete}
              onRegenerate={!isUser ? handleRegenerate : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
})
