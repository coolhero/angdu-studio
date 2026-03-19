import { Trash2, StickyNote } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { StatusIcon } from '@renderer/pages/knowledge/components/StatusIcon'
import type { KnowledgeItem } from '@shared/types/knowledge'

interface KnowledgeNotesProps {
  items: KnowledgeItem[]
  baseId: string
  onRemoveItem: (itemId: string) => void
}

export default function KnowledgeNotes({ items, baseId, onRemoveItem }: KnowledgeNotesProps) {
  const noteItems = items.filter((i) => i.type === 'note')

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Notes</h3>
      {noteItems.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No notes added yet. Save notes from the notes page or chat messages.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-md border border-border">
          {noteItems.map((item) => (
            <div key={item.id} className="group flex items-start gap-3 px-3 py-2">
              <StatusIcon status={item.status} error={item.error} className="mt-0.5" />
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm line-clamp-2">{item.content}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-red-500 opacity-0 group-hover:opacity-100"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
