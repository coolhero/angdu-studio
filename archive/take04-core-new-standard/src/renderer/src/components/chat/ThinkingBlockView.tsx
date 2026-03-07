import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { BlockStatus } from '@shared/types'

interface ThinkingBlockViewProps {
  content: string
  duration?: number
  status: BlockStatus
}

export function ThinkingBlockView({ content, duration, status }: ThinkingBlockViewProps) {
  const isStreaming = status === 'streaming'

  return (
    <Collapsible.Root defaultOpen={isStreaming}>
      <Collapsible.Trigger className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ChevronRight
          size={14}
          className={cn('transition-transform group-data-[state=open]:rotate-90')}
        />
        <span>
          {isStreaming ? 'Thinking...' : 'Thinking'}
          {!isStreaming && duration != null && ` (${(duration / 1000).toFixed(1)}s)`}
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-1 overflow-hidden border-l-2 border-muted pl-3 text-sm text-muted-foreground data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
