import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { MessageSquare, Pin, Trash2, Pencil, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Topic } from '@shared/types/topic'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'

interface TopicListProps {
  topics: Topic[]
  activeTopicId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export const TopicList = memo(function TopicList({
  topics,
  activeTopicId,
  onSelect,
  onRename,
  onDelete
}: TopicListProps) {
  const { t } = useTranslation()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const handleStartRename = useCallback((topic: Topic) => {
    setRenamingId(topic.id)
    setRenameValue(topic.name)
    setContextMenuId(null)
  }, [])

  const handleFinishRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }, [renamingId, renameValue, onRename])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // Sort: pinned first, then by updatedAt desc
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  if (sortedTopics.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {t('chat.noTopics', '대화가 없습니다')}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {sortedTopics.map((topic) => (
        <div
          key={topic.id}
          className={`group relative flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted ${
            topic.id === activeTopicId ? 'bg-muted' : ''
          }`}
          onClick={() => onSelect(topic.id)}
        >
          {topic.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {renamingId === topic.id ? (
            <Input
              ref={renameInputRef}
              className="h-6 flex-1 px-1 text-xs"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename()
                if (e.key === 'Escape') setRenamingId(null)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-sm">{topic.name}</span>
          )}
          <span className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
            {topic.messageCount}
          </span>
          <div className="relative shrink-0 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setContextMenuId(contextMenuId === topic.id ? null : topic.id)
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            {contextMenuId === topic.id && (
              <div
                className="absolute right-0 top-full z-20 w-32 rounded-md border border-border bg-background py-1 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted"
                  onClick={() => handleStartRename(topic)}
                >
                  <Pencil className="h-3 w-3" />
                  {t('chat.rename', '이름 변경')}
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-muted"
                  onClick={() => {
                    setContextMenuId(null)
                    onDelete(topic.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  {t('chat.deleteTopic', '삭제')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
})
