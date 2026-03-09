import React, { useState, useCallback } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ImageMessageBlock } from '@renderer/types/message-block'
import ImageViewer from '@renderer/components/ImageViewer'

interface ImageBlockProps {
  block: ImageMessageBlock
  isStreaming: boolean
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  const src = block.url || block.file?.url
  const alt = block.file?.name || 'Image'

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  if (!src) {
    return (
      <div className="my-1 flex h-32 w-48 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        <ImageIcon className="h-8 w-8 text-zinc-400" />
      </div>
    )
  }

  return (
    <>
      <div className="relative my-1 inline-block max-w-md">
        {isLoading && (
          <div className="flex h-32 w-48 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        )}
        {hasError ? (
          <div className="flex h-32 w-48 items-center justify-center rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <span className="text-xs text-red-500">Failed to load image</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={cn(
              'max-h-80 max-w-full cursor-pointer rounded-md border border-zinc-200 object-contain dark:border-zinc-700',
              'hover:opacity-90 transition-opacity',
              isLoading && 'hidden'
            )}
            onLoad={handleLoad}
            onError={handleError}
            onClick={() => setShowViewer(true)}
          />
        )}
      </div>
      {showViewer && (
        <ImageViewer
          src={src}
          alt={alt}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  )
}

export default React.memo(ImageBlock)
