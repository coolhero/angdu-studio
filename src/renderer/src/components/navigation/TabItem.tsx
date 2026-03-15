import { useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import { X } from 'lucide-react'

interface TabItemProps {
  id: string
  title: string
  isActive: boolean
  closable: boolean
  onClick: () => void
  onClose: () => void
  onContextMenu: (e: ReactMouseEvent) => void
}

export function TabItem({
  id,
  title,
  isActive,
  closable,
  onClick,
  onClose,
  onContextMenu
}: TabItemProps) {
  const handleAuxClick = useCallback(
    (e: ReactMouseEvent) => {
      // Middle-click to close
      if (e.button === 1 && closable) {
        e.preventDefault()
        onClose()
      }
    },
    [closable, onClose]
  )

  const handleCloseClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation()
      onClose()
    },
    [onClose]
  )

  return (
    <div
      role="tab"
      tabIndex={0}
      className={`group flex h-8 max-w-40 shrink-0 cursor-pointer items-center gap-1 rounded-md px-3 text-xs transition-colors select-none ${
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onClick={onClick}
      onAuxClick={handleAuxClick}
      onContextMenu={onContextMenu}
      title={title}
    >
      <span className="truncate">{title}</span>
      {closable && (
        <button
          className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          onClick={handleCloseClick}
          aria-label={`Close ${title}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
