import React from 'react'
import { cn } from '@renderer/lib/utils'

interface PlaceholderBlockProps {
  isStreaming: boolean
}

const PlaceholderBlock: React.FC<PlaceholderBlockProps> = ({ isStreaming }) => {
  return (
    <div className={cn('flex items-center gap-1.5 py-2', !isStreaming && 'hidden')}>
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500 [animation-delay:-0.3s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500 [animation-delay:-0.15s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
    </div>
  )
}

export default React.memo(PlaceholderBlock)
