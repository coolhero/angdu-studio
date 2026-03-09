import React, { useCallback, useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface ImageViewerProps {
  src: string
  alt?: string
  onClose: () => void
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt = 'Image', onClose }) => {
  const [scale, setScale] = useState(1)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.25, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.25, 0.25))
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  )
}

export default React.memo(ImageViewer)
