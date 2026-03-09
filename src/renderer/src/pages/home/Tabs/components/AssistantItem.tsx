import React from 'react'
import { cn } from '@renderer/lib/utils'
import { Badge } from '@renderer/components/ui/badge'
import type { Assistant } from '@renderer/types/assistant'

interface AssistantItemProps {
  assistant: Assistant
  isActive: boolean
  onClick: () => void
}

const AssistantItem: React.FC<AssistantItemProps> = ({ assistant, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        isActive
          ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
      )}
    >
      <span className="flex-shrink-0 text-base">{assistant.emoji || '🤖'}</span>
      <span className="min-w-0 flex-1 truncate">{assistant.name}</span>
      {assistant.topics.length > 0 && (
        <Badge variant="secondary" className="ml-auto flex-shrink-0 px-1.5 py-0 text-[10px]">
          {assistant.topics.length}
        </Badge>
      )}
    </button>
  )
}

export default React.memo(AssistantItem)
