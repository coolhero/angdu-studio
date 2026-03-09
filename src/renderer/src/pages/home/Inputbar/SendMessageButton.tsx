import React from 'react'
import { Send, Square } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface SendMessageButtonProps {
  isGenerating: boolean
  onSend: () => void
  onStop: () => void
  disabled: boolean
}

const SendMessageButton: React.FC<SendMessageButtonProps> = ({
  isGenerating,
  onSend,
  onStop,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={isGenerating ? onStop : onSend}
      disabled={!isGenerating && disabled}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
        isGenerating
          ? 'bg-red-500 text-white hover:bg-red-600'
          : disabled
            ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
            : 'bg-blue-500 text-white hover:bg-blue-600'
      )}
    >
      {isGenerating ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
    </button>
  )
}

export default React.memo(SendMessageButton)
