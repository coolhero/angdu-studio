import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@renderer/lib/utils'

export interface QuickPanelItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface QuickPanelProps {
  trigger: string
  items: QuickPanelItem[]
  onSelect: (item: QuickPanelItem) => void
  onClose: () => void
  position: { top: number; left: number }
}

const QuickPanel: React.FC<QuickPanelProps> = ({ trigger, items, onSelect, onClose, position }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Reset active index when items change
  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  // Scroll active item into view
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
          e.preventDefault()
          if (items[activeIndex]) {
            onSelect(items[activeIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, items, onSelect, onClose])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (items.length === 0) return null

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute z-50 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg',
        'dark:border-zinc-700 dark:bg-zinc-800',
        'max-h-60 overflow-y-auto py-1'
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
        {trigger === '/' ? 'Commands' : 'Mentions'}
      </div>
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className={cn(
              'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm',
              'text-zinc-700 dark:text-zinc-300',
              index === activeIndex && 'bg-zinc-100 dark:bg-zinc-700'
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => onSelect(item)}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />}
            <span className="truncate">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(QuickPanel)
