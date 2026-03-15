import { useEffect, useRef, useCallback } from 'react'

interface TabContextMenuProps {
  x: number
  y: number
  tabId: string
  closable: boolean
  onClose: () => void
  onCloseTab: (tabId: string) => void
  onCloseOthers: (tabId: string) => void
  onCloseAll: () => void
}

export function TabContextMenu({
  x,
  y,
  tabId,
  closable,
  onClose,
  onCloseTab,
  onCloseOthers,
  onCloseAll
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-36 rounded-md border border-border bg-popover py-1 shadow-md"
      style={{ left: x, top: y }}
    >
      {closable && (
        <button
          className="flex w-full px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-muted"
          onClick={() => {
            onCloseTab(tabId)
            onClose()
          }}
        >
          Close
        </button>
      )}
      <button
        className="flex w-full px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-muted"
        onClick={() => {
          onCloseOthers(tabId)
          onClose()
        }}
      >
        Close Others
      </button>
      <button
        className="flex w-full px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-muted"
        onClick={() => {
          onCloseAll()
          onClose()
        }}
      >
        Close All
      </button>
    </div>
  )
}
