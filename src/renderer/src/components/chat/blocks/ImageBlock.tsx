import { memo, useState } from 'react'
import type { ImageBlock as ImageBlockType } from '@shared/types/message'

interface ImageBlockProps {
  block: ImageBlockType
}

export const ImageBlock = memo(function ImageBlock({ block }: ImageBlockProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="my-2 flex h-32 items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
        Image failed to load
      </div>
    )
  }

  return (
    <div className="my-2">
      <img
        src={block.content.url}
        alt={block.content.alt ?? ''}
        className="max-h-96 max-w-full rounded-lg"
        style={{
          width: block.content.width ? `${block.content.width}px` : undefined,
          height: block.content.height ? `${block.content.height}px` : undefined
        }}
        onError={() => setError(true)}
      />
    </div>
  )
})
