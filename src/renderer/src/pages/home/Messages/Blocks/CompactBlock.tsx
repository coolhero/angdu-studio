import React, { useState } from 'react'
import { Minimize2, ChevronRight } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { CompactMessageBlock } from '@renderer/types/message-block'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@renderer/components/ui/collapsible'
import Markdown from '../../Markdown/Markdown'

interface CompactBlockProps {
  block: CompactMessageBlock
  isStreaming: boolean
}

const CompactBlock: React.FC<CompactBlockProps> = ({ block, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-1">
      {/* Summary */}
      <Markdown content={block.content} isStreaming={isStreaming} />

      {/* Expandable original content */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            'mt-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
            'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
            'transition-colors'
          )}
        >
          <Minimize2 className="h-3 w-3" />
          <span>{isOpen ? 'Hide original' : 'Show original'}</span>
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              isOpen && 'rotate-90'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
          <Markdown
            content={block.compactedContent}
            className="text-sm text-zinc-500 dark:text-zinc-400"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default React.memo(CompactBlock)
