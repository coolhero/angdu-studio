import { memo, useMemo } from 'react'
import { Bot, Trash2, Pencil } from 'lucide-react'
import type { Assistant } from '@shared/types/assistant'
import { Button } from '@renderer/components/ui/button'

interface AssistantListProps {
  assistants: Assistant[]
  activeAssistantId: string
  searchQuery: string
  onSelect: (id: string) => void
  onEdit: (assistant: Assistant) => void
  onDelete: (id: string) => void
}

export const AssistantList = memo(function AssistantList({
  assistants,
  activeAssistantId,
  searchQuery,
  onSelect,
  onEdit,
  onDelete
}: AssistantListProps) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return assistants
    const q = searchQuery.toLowerCase()
    return assistants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q)) ||
        a.category?.toLowerCase().includes(q)
    )
  }, [assistants, searchQuery])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Assistant[]> = {}
    for (const a of filtered) {
      const cat = a.category || 'default'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(a)
    }
    return groups
  }, [filtered])

  if (filtered.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No assistants found
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          {category !== 'default' && (
            <div className="px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground">
              {category}
            </div>
          )}
          {items.map((assistant) => (
            <div
              key={assistant.id}
              className={`group flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted ${
                assistant.id === activeAssistantId ? 'bg-muted' : ''
              }`}
              onClick={() => onSelect(assistant.id)}
            >
              <span className="text-lg">{assistant.emoji ?? ''}</span>
              {!assistant.emoji && <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{assistant.name}</p>
                {assistant.description && (
                  <p className="truncate text-xs text-muted-foreground">{assistant.description}</p>
                )}
              </div>
              {!assistant.isDefault && (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(assistant)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(assistant.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
})
