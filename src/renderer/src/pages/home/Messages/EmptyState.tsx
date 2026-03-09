import React from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'

const PROMPT_SUGGESTIONS = [
  'Tell me about yourself',
  'Help me write an email',
  'Explain a concept',
  'Brainstorm ideas',
]

const EmptyState: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <MessageCircle className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('chat.emptyState', 'Start a conversation')}
        </h3>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {t('chat.emptyStateHint', 'Type a message below to begin')}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {PROMPT_SUGGESTIONS.map((suggestion) => (
          <span
            key={suggestion}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  )
}

export default React.memo(EmptyState)
