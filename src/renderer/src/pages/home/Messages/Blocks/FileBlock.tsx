import React, { useCallback } from 'react'
import { FileIcon, Download } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { FileMessageBlock } from '@renderer/types/message-block'

interface FileBlockProps {
  block: FileMessageBlock
  isStreaming: boolean
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const FileBlock: React.FC<FileBlockProps> = ({ block }) => {
  const { file } = block

  const handleClick = useCallback(() => {
    if (file.path && window.api?.openFile) {
      window.api.openFile(file.path)
    } else if (file.url) {
      window.open(file.url, '_blank')
    }
  }, [file])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'my-1 flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2',
        'hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800',
        'transition-colors text-left w-fit max-w-xs'
      )}
    >
      <FileIcon className="h-8 w-8 shrink-0 text-zinc-400 dark:text-zinc-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {file.name}
        </p>
        {file.size !== undefined && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatFileSize(file.size)}
          </p>
        )}
      </div>
      <Download className="h-4 w-4 shrink-0 text-zinc-400" />
    </button>
  )
}

export default React.memo(FileBlock)
