import { ChevronRight } from 'lucide-react'

interface MemorySearchToolProps {
  count: number
}

/**
 * Memory search tool display in chat messages.
 * Shows chevron + count + "memory" when memory search results are displayed.
 * Matches source MessageMemorySearch pattern.
 */
export default function MemorySearchTool({ count }: MemorySearchToolProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ChevronRight className="h-3 w-3" />
      <span>
        {count} memor{count === 1 ? 'y' : 'ies'}
      </span>
    </div>
  )
}
