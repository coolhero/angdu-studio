import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import { useInputText } from '@renderer/hooks/useInputText'
import { useTextareaResize } from '@renderer/hooks/useTextareaResize'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import SendMessageButton from './SendMessageButton'

interface InputbarCoreProps {
  onSend: (content: string) => void
  onStop: () => void
  disabled: boolean
  isGenerating: boolean
  topicId: string
}

const InputbarCore: React.FC<InputbarCoreProps> = ({
  onSend,
  onStop,
  disabled,
  isGenerating,
  topicId,
}) => {
  const { t } = useTranslation()
  const { text, setText, clearText } = useInputText(topicId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isExpanded, maxHeight, minHeight } = useTextareaResize(textareaRef)
  const sendMessageShortcut = useSettingsStore((s) => s.sendMessageShortcut)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isGenerating) return
    onSend(trimmed)
    clearText()

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isGenerating, onSend, clearText])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter') return

      const shortcut = sendMessageShortcut

      if (shortcut === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleSend()
      } else if (shortcut === 'Shift+Enter' && e.shiftKey) {
        e.preventDefault()
        handleSend()
      } else if (shortcut === 'Ctrl+Enter' && e.ctrlKey) {
        e.preventDefault()
        handleSend()
      } else if (shortcut === 'Meta+Enter' && e.metaKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [sendMessageShortcut, handleSend]
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value)
    },
    [setText]
  )

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={t('chat.input.placeholder', 'Type a message...')}
        rows={1}
        style={{ minHeight, maxHeight }}
        className={cn(
          'flex-1 resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2',
          'text-sm text-zinc-900 placeholder:text-zinc-400',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
          'dark:focus:border-blue-400 dark:focus:ring-blue-400',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />
      <SendMessageButton
        isGenerating={isGenerating}
        onSend={handleSend}
        onStop={onStop}
        disabled={!text.trim()}
      />
    </div>
  )
}

export default React.memo(InputbarCore)
