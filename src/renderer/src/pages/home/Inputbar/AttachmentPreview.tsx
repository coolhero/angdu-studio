import React from 'react'
import { File, Image, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { FileMetadata } from '@renderer/types/message-block'

interface AttachmentPreviewProps {
  files: FileMetadata[]
  onRemove: (id: string) => void
}

function isImageMimeType(mimeType?: string): boolean {
  return mimeType?.startsWith('image/') ?? false
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-1 py-1">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            'group relative flex items-center gap-2 rounded-md border px-2 py-1.5',
            'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800',
            'text-sm text-zinc-700 dark:text-zinc-300'
          )}
        >
          {isImageMimeType(file.mimeType) ? (
            file.url ? (
              <img
                src={file.url}
                alt={file.name}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <Image className="h-4 w-4 shrink-0 text-zinc-400" />
            )
          ) : (
            <File className="h-4 w-4 shrink-0 text-zinc-400" />
          )}
          <span className="max-w-[120px] truncate text-xs">{file.name}</span>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className={cn(
              'ml-1 flex h-4 w-4 items-center justify-center rounded-full',
              'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600',
              'dark:hover:bg-zinc-600 dark:hover:text-zinc-200',
              'transition-colors'
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default React.memo(AttachmentPreview)
