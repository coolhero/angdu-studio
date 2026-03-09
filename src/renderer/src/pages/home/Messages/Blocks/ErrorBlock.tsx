import React, { useState } from 'react'
import { AlertTriangle, ChevronRight, RotateCw } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ErrorMessageBlock } from '@renderer/types/message-block'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@renderer/components/ui/collapsible'

interface ErrorBlockProps {
  block: ErrorMessageBlock
  isStreaming: boolean
  onRetry?: () => void
}

const ErrorBlock: React.FC<ErrorBlockProps> = ({ block, onRetry }) => {
  const error = block.error
  const content = block.content
  const errorName = error?.name || 'Error'
  const errorMessage = error?.message || content || 'An unexpected error occurred'
  const stack = error?.stack

  return (
    <div className="my-1 rounded-md border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10">
      <div className="flex items-start gap-2 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {errorName}
          </p>
          <p className="mt-0.5 text-sm text-red-600 dark:text-red-400/80">
            {errorMessage}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
              'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30',
              'transition-colors'
            )}
          >
            <RotateCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>

      {/* Stack trace in collapsible (dev mode) */}
      {stack && (
        <Collapsible className="border-t border-red-200 dark:border-red-800/50">
          <CollapsibleTrigger
            className={cn(
              'flex w-full items-center gap-1.5 px-3 py-1.5 text-xs',
              'text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/20',
              'transition-colors'
            )}
          >
            <ChevronRight className="h-3 w-3" />
            <span>Stack trace</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-[11px] text-red-600/70 dark:text-red-400/60">
              {stack}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export default React.memo(ErrorBlock)
