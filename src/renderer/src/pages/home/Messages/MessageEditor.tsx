import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Check, Send, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { Message } from '@renderer/types/message'

interface MessageEditorProps {
  message: Message
  initialContent: string
  onSave: (content: string) => void
  onResend: (content: string) => void
  onCancel: () => void
}

const MessageEditor: React.FC<MessageEditorProps> = ({
  message,
  initialContent,
  onSave,
  onResend,
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [onCancel]
  )

  const handleSave = useCallback(() => {
    const trimmed = content.trim()
    if (trimmed) {
      onSave(trimmed)
    }
  }, [content, onSave])

  const handleResend = useCallback(() => {
    const trimmed = content.trim()
    if (trimmed) {
      onResend(trimmed)
    }
  }, [content, onResend])

  return (
    <div className="my-1 rounded-md border border-blue-300 bg-white dark:border-blue-700 dark:bg-zinc-900">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full resize-none border-none bg-transparent px-3 py-2 text-sm outline-none',
          'text-zinc-900 dark:text-zinc-100',
          'placeholder:text-zinc-400'
        )}
        rows={3}
        placeholder="Edit message..."
      />
      <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
            'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
            'transition-colors'
          )}
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!content.trim()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
            'bg-zinc-200 text-zinc-700 hover:bg-zinc-300',
            'dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Check className="h-3.5 w-3.5" />
          Save
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={!content.trim()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
            'bg-blue-500 text-white hover:bg-blue-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Send className="h-3.5 w-3.5" />
          Resend
        </button>
      </div>
    </div>
  )
}

export default React.memo(MessageEditor)
