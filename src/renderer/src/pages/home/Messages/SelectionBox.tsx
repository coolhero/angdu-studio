import React, { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@renderer/lib/utils'

interface SelectionBoxProps {
  isActive: boolean
  onSelectionChange: (ids: string[]) => void
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function rectsOverlap(a: DOMRect, b: Rect): boolean {
  return !(
    a.right < b.x ||
    a.left > b.x + b.width ||
    a.bottom < b.y ||
    a.top > b.y + b.height
  )
}

const SelectionBox: React.FC<SelectionBoxProps> = ({ isActive, onSelectionChange }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSelection = useCallback(
    (rect: Rect) => {
      const container = containerRef.current?.parentElement
      if (!container) return

      const messageElements = container.querySelectorAll('[data-message-id]')
      const selected: string[] = []

      messageElements.forEach((el) => {
        const domRect = el.getBoundingClientRect()
        if (rectsOverlap(domRect, rect)) {
          const id = el.getAttribute('data-message-id')
          if (id) selected.push(id)
        }
      })

      onSelectionChange(selected)
    },
    [onSelectionChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isActive || e.button !== 0) return
      startPos.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      setSelectionRect(null)
    },
    [isActive]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !startPos.current) return

      const x = Math.min(startPos.current.x, e.clientX)
      const y = Math.min(startPos.current.y, e.clientY)
      const width = Math.abs(e.clientX - startPos.current.x)
      const height = Math.abs(e.clientY - startPos.current.y)

      const rect = { x, y, width, height }
      setSelectionRect(rect)
      updateSelection(rect)
    },
    [isDragging, updateSelection]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    startPos.current = null
    setSelectionRect(null)
  }, [])

  // Clean up on deactivation
  useEffect(() => {
    if (!isActive) {
      setIsDragging(false)
      setSelectionRect(null)
      startPos.current = null
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: 'crosshair' }}
    >
      {selectionRect && isDragging && (
        <div
          className={cn(
            'pointer-events-none absolute rounded border',
            'border-blue-400 bg-blue-400/10 dark:border-blue-500 dark:bg-blue-500/10'
          )}
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
            position: 'fixed',
          }}
        />
      )}
    </div>
  )
}

export default React.memo(SelectionBox)
