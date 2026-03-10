import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { MCPPrompt } from '@renderer/types/mcp'

interface MCPPromptsSectionProps {
  prompts: MCPPrompt[]
}

function PromptRow({ prompt }: { prompt: MCPPrompt }): JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const hasArgs = prompt.arguments && prompt.arguments.length > 0

  return (
    <div className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => hasArgs && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-2.5 text-left',
          hasArgs && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        )}
      >
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform',
            !hasArgs && 'invisible',
            expanded && 'rotate-180',
          )}
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{prompt.name}</span>
          {prompt.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{prompt.description}</p>
          )}
        </div>
        {hasArgs && (
          <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {prompt.arguments!.length} {t('settings.mcp.prompts.args', 'args')}
          </span>
        )}
      </button>

      {expanded && hasArgs && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="space-y-2">
            {prompt.arguments!.map((arg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{arg.name}</span>
                {arg.required && <span className="text-xs text-red-500">*</span>}
                {arg.description && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{arg.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MCPPromptsSection({ prompts }: MCPPromptsSectionProps): JSX.Element {
  const { t } = useTranslation()

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-400">
        {t('settings.mcp.prompts.noPromptsAvailable', 'No prompts available')}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {t('settings.mcp.prompts.availablePrompts', 'Available Prompts')} ({prompts.length})
        </span>
      </div>
      {prompts.map((prompt) => (
        <PromptRow key={prompt.id || prompt.name} prompt={prompt} />
      ))}
    </div>
  )
}
