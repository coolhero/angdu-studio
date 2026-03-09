import { Trash2, ExternalLink, FileIcon } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'

interface FileListItemProps {
  name: string
  size: number
  type: string
  path: string
  onDelete: () => void
  onOpen: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function FileListItem({ name, size, type, onDelete, onOpen }: FileListItemProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50">
      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(size)} · {type}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onOpen}>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
