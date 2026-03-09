import React, { useState } from 'react'
import { Wrench, ChevronRight } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ToolMessageBlock } from '@renderer/types/message-block'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@renderer/components/ui/collapsible'
import ToolBlock from './ToolBlock'

interface ToolBlockGroupProps {
  blocks: ToolMessageBlock[]
  isStreaming: boolean
}

const ToolBlockGroup: React.FC<ToolBlockGroupProps> = ({ blocks, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (blocks.length === 1) {
    return <ToolBlock block={blocks[0]} isStreaming={isStreaming} />
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-1">
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
          'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
          'transition-colors'
        )}
      >
        <Wrench className="h-4 w-4 shrink-0" />
        <span className="font-medium">Tool calls</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-200 px-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          {blocks.length}
        </span>
        <ChevronRight
          className={cn(
            'ml-auto h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-2">
        {blocks.map((block) => (
          <ToolBlock key={block.id} block={block} isStreaming={isStreaming} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default React.memo(ToolBlockGroup)
