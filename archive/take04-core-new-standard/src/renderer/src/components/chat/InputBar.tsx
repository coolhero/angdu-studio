import { useCallback, useRef, type KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '../ui/button'

interface InputBarProps {
  onSend: (content: string) => void
  onCancel: () => void
  generating: boolean
}

export function InputBar({ onSend, onCancel, generating }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const content = textarea.value.trim()
    if (!content) return
    onSend(content)
    textarea.value = ''
    textarea.style.height = 'auto'
  }, [onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!generating) handleSend()
      }
    },
    [generating, handleSend]
  )

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [])

  return (
    <div className="border-t border-border bg-background p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        {generating ? (
          <Button size="icon" variant="destructive" onClick={onCancel}>
            <Square size={16} />
          </Button>
        ) : (
          <Button size="icon" onClick={handleSend}>
            <Send size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
