import { useBlockRenderer } from '../../hooks/useBlockRenderer'
import { BlockRenderer } from './BlockRenderer'
import { cn } from '../../lib/utils'
import { User, Bot } from 'lucide-react'
import dayjs from 'dayjs'
import type { Message } from '@shared/types'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const { blocks } = useBlockRenderer(message.id)
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 px-4 py-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={cn('min-w-0 max-w-[80%] space-y-2', isUser && 'items-end')}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{isUser ? 'You' : message.model?.name ?? 'Assistant'}</span>
          <span>{dayjs(message.createdAt).format('HH:mm')}</span>
        </div>
        <div
          className={cn(
            'space-y-2 rounded-lg px-3 py-2',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  )
}
