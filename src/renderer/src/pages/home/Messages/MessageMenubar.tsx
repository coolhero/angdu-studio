import React, { useCallback } from 'react'
import {
  Copy,
  Pencil,
  RotateCw,
  Trash2,
  Languages,
  GitBranch,
  Volume2,
  Bookmark,
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import type { Message } from '@renderer/types/message'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import { MessageBlockType, type MainTextMessageBlock } from '@renderer/types/message-block'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@renderer/components/ui/tooltip'

interface MessageMenubarProps {
  message: Message
  onEdit?: () => void
  onDelete?: () => void
  onRetry?: () => void
  onCopy?: () => void
  onTranslate?: () => void
  onFork?: () => void
  onTTS?: () => void
  onBookmark?: () => void
}

interface ActionButtonProps {
  icon: React.ElementType
  label: string
  onClick?: () => void
  variant?: 'default' | 'destructive'
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}) => (
  <Tooltip>
    <TooltipTrigger>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
          variant === 'destructive'
            ? 'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        )}
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top">{label}</TooltipContent>
  </Tooltip>
)

const MessageMenubar: React.FC<MessageMenubarProps> = ({
  message,
  onEdit,
  onDelete,
  onRetry,
  onCopy,
  onTranslate,
  onFork,
  onTTS,
  onBookmark,
}) => {
  const { confirm } = useConfirmDialog()
  const getBlocksForMessage = useMessageBlockStore((s) => s.getBlocksForMessage)

  const handleCopy = useCallback(() => {
    if (onCopy) {
      onCopy()
      return
    }
    // Default copy: get main text block content
    const blocks = getBlocksForMessage(message.id)
    const mainBlock = blocks.find(
      (b) => b.type === MessageBlockType.MAIN_TEXT
    ) as MainTextMessageBlock | undefined

    if (mainBlock?.content) {
      navigator.clipboard.writeText(mainBlock.content).catch(console.error)
    }
  }, [onCopy, message.id, getBlocksForMessage])

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Delete message',
      description: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    })
    if (confirmed) {
      onDelete?.()
    }
  }, [confirm, onDelete])

  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1 py-0.5 shadow-sm',
        'dark:border-zinc-700 dark:bg-zinc-800'
      )}
    >
      <ActionButton icon={Copy} label="Copy" onClick={handleCopy} />
      {isUser && onEdit && (
        <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />
      )}
      {onRetry && (
        <ActionButton icon={RotateCw} label="Retry" onClick={onRetry} />
      )}
      {onTranslate && (
        <ActionButton icon={Languages} label="Translate" onClick={onTranslate} />
      )}
      {onTTS && (
        <ActionButton icon={Volume2} label="Read aloud" onClick={onTTS} />
      )}
      {onFork && (
        <ActionButton icon={GitBranch} label="Branch" onClick={onFork} />
      )}
      {onBookmark && (
        <ActionButton icon={Bookmark} label="Bookmark" onClick={onBookmark} />
      )}
      {onDelete && (
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={handleDelete}
          variant="destructive"
        />
      )}
    </div>
  )
}

export default React.memo(MessageMenubar)
