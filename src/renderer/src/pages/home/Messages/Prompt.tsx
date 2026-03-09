import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'

interface PromptProps {
  prompt: string
}

const MAX_COLLAPSED_LINES = 2

const Prompt: React.FC<PromptProps> = ({ prompt }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!prompt.trim()) return null

  const lines = prompt.split('\n')
  const needsExpand = lines.length > MAX_COLLAPSED_LINES
  const displayText = isExpanded ? prompt : lines.slice(0, MAX_COLLAPSED_LINES).join('\n')

  return (
    <div
      className={cn(
        'mx-4 mb-2 mt-2 rounded-lg border px-3 py-2',
        'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50'
      )}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {t('chat.prompt.title', 'System Prompt')}
        </span>
        {needsExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={isExpanded ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      <p
        className={cn(
          'mt-1 whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400',
          !isExpanded && needsExpand && 'line-clamp-2'
        )}
      >
        {displayText}
      </p>
    </div>
  )
}

export default React.memo(Prompt)
