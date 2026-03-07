import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { MessageSquare, Pin, PinOff, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Topic } from '@shared/types'

interface TopicItemProps {
  topic: Topic
  isActive: boolean
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onPin: (id: string) => void
  onUnpin: (id: string) => void
  onDelete: (id: string) => void
}

export function TopicItem({
  topic,
  isActive,
  onSelect,
  onRename,
  onPin,
  onUnpin,
  onDelete
}: TopicItemProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const handleRename = useCallback(() => {
    const name = inputRef.current?.value.trim()
    if (name && name !== topic.name) {
      onRename(topic.id, name)
    }
    setEditing(false)
  }, [topic.id, topic.name, onRename])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleRename()
      if (e.key === 'Escape') setEditing(false)
    },
    [handleRename]
  )

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <button
          onClick={() => onSelect(topic.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
            isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <MessageSquare size={14} className="shrink-0 text-muted-foreground" />
          {editing ? (
            <input
              ref={inputRef}
              defaultValue={topic.name}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded border border-input bg-background px-1 text-sm outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate">{topic.name}</span>
          )}
          {topic.pinned && <Pin size={12} className="shrink-0 text-muted-foreground" />}
        </button>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          <ContextMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent"
            onSelect={() => setEditing(true)}
          >
            <Pencil size={14} />
            Rename
          </ContextMenu.Item>
          <ContextMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent"
            onSelect={() => (topic.pinned ? onUnpin(topic.id) : onPin(topic.id))}
          >
            {topic.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            {topic.pinned ? 'Unpin' : 'Pin'}
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-border" />
          <ContextMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10"
            onSelect={() => onDelete(topic.id)}
          >
            <Trash2 size={14} />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
