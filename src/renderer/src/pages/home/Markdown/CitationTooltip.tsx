import React from 'react'
import { cn } from '@renderer/lib/utils'

interface CitationTooltipProps {
  citation: {
    url: string
    title?: string
    snippet?: string
  }
}

const CitationTooltip: React.FC<CitationTooltipProps> = ({ citation }) => {
  return (
    <div className="group relative inline-block">
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        {citation.title || citation.url}
      </a>
      <div
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2',
          'hidden w-64 rounded-md bg-zinc-900 p-3 text-left shadow-lg',
          'group-hover:block',
          'dark:bg-zinc-100'
        )}
      >
        {citation.title && (
          <p className="mb-1 text-xs font-medium text-white dark:text-zinc-900">
            {citation.title}
          </p>
        )}
        {citation.snippet && (
          <p className="mb-1.5 line-clamp-3 text-xs text-zinc-300 dark:text-zinc-600">
            {citation.snippet}
          </p>
        )}
        <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
          {citation.url}
        </p>
      </div>
    </div>
  )
}

export default React.memo(CitationTooltip)
