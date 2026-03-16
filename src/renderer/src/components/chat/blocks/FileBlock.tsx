import { memo } from 'react'
import { FileIcon, Download } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import type { FileBlock as FileBlockType } from '@shared/types/message'

interface FileBlockProps {
  block: FileBlockType
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const FileBlock = memo(function FileBlock({ block }: FileBlockProps) {
  const handleOpen = () => {
    window.api.invoke['shell:showItemInFolder'](block.content.filePath)
  }

  return (
    <div className="my-2 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <FileIcon className="h-8 w-8 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{block.content.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(block.content.fileSize)} · {block.content.mimeType}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleOpen}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
})
