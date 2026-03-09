import React from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'

const PROMPT_SUGGESTIONS = [
  'Tell me about yourself',
  'Help me write an email',
  'Explain a concept',
  'Brainstorm ideas',
]

interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
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
          <button
            key={suggestion}
            type="button"
            className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
            onClick={() => onSuggestionClick?.(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default React.memo(EmptyState)
