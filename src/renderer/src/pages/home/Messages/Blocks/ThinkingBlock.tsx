import React, { useEffect, useState } from 'react'
import { Brain, ChevronRight } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ThinkingMessageBlock } from '@renderer/types/message-block'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@renderer/components/ui/collapsible'
import Markdown from '../../Markdown/Markdown'

interface ThinkingBlockProps {
  block: ThinkingMessageBlock
  isStreaming: boolean
}

function formatThinkingTime(ms: number): string {
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ block, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(isStreaming)

  // Auto-collapse when streaming ends
  useEffect(() => {
    if (!isStreaming) {
      setIsOpen(false)
    }
  }, [isStreaming])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-1">
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
          'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
          'transition-colors'
        )}
      >
        <Brain className="h-4 w-4 shrink-0" />
        <span className="font-medium">
          {isStreaming ? 'Thinking...' : 'Thought'}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {formatThinkingTime(block.thinking_millsec)}
        </span>
        <ChevronRight
          className={cn(
            'ml-auto h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 pr-2">
        <div className="border-l-2 border-zinc-200 pl-3 py-1 dark:border-zinc-700">
          <Markdown
            content={block.content}
            isStreaming={isStreaming}
            className="text-sm text-zinc-600 dark:text-zinc-400"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default React.memo(ThinkingBlock)
