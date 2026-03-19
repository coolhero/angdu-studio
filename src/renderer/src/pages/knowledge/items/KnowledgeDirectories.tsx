import { Plus, Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { StatusIcon } from '@renderer/pages/knowledge/components/StatusIcon'
import type { KnowledgeItem } from '@shared/types/knowledge'

interface KnowledgeDirectoriesProps {
  items: KnowledgeItem[]
  baseId: string
  onAddDirectory: () => void
  onRemoveItem: (itemId: string) => void
}

export default function KnowledgeDirectories({
  items,
  baseId,
  onAddDirectory,
  onRemoveItem
}: KnowledgeDirectoriesProps) {
  const dirItems = items.filter((i) => i.type === 'directory')

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Directories</h3>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddDirectory}>
          <FolderOpen className="h-3.5 w-3.5" />
          Add Directory
        </Button>
      </div>

      {dirItems.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No directories added yet.</p>
      ) : (
        <div className="divide-y divide-border rounded-md border border-border">
          {dirItems.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 px-3 py-2">
              <StatusIcon status={item.status} error={item.error} />
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{item.content}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100"
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
