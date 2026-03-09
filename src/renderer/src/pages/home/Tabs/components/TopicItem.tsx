import React, { useCallback, useState } from 'react'
import { cn } from '@renderer/lib/utils'
import { Pin, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@renderer/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import type { Topic } from '@renderer/types/conversation'

interface TopicItemProps {
  topic: Topic
  isActive: boolean
  onClick: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onTogglePin: () => void
}

const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  isActive,
  onClick,
  onRename,
  onDelete,
  onTogglePin,
}) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(topic.name)

  const handleSubmitRename = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== topic.name) {
      onRename(trimmed)
    }
    setIsEditing(false)
  }, [editName, topic.name, onRename])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmitRename()
      } else if (e.key === 'Escape') {
        setEditName(topic.name)
        setIsEditing(false)
      }
    },
    [handleSubmitRename, topic.name]
  )

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSubmitRename}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full rounded border border-blue-500 bg-white px-1.5 py-0.5 text-sm',
            'outline-none dark:bg-zinc-800'
          )}
        />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
          isActive
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onContextMenu={(e) => {
          e.preventDefault()
        }}
      >
        {topic.pinned && <Pin className="h-3 w-3 flex-shrink-0 text-blue-500" />}
        <span className="min-w-0 flex-1 truncate">{topic.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => {
            setEditName(topic.name)
            setIsEditing(true)
          }}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          {t('common.rename', 'Rename')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTogglePin}>
          <Pin className="mr-2 h-3.5 w-3.5" />
          {topic.pinned ? t('common.unpin', 'Unpin') : t('common.pin', 'Pin')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {t('common.delete', 'Delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default React.memo(TopicItem)
