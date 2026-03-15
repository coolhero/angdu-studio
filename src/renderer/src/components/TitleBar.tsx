import { useCallback } from 'react'

const isMac = navigator.userAgent.includes('Macintosh')

export function TitleBar() {
  const handleMinimize = useCallback(() => {
    window.api.invoke['window:minimize']()
  }, [])

  const handleMaximize = useCallback(() => {
    window.api.invoke['window:maximize']()
  }, [])

  const handleClose = useCallback(() => {
    window.api.invoke['window:close']()
  }, [])

  return (
    <div
      className="flex h-11 items-center justify-between border-b border-border bg-background select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS: native traffic lights are in the left area (hiddenInset) */}
      <div className={`flex items-center ${isMac ? 'pl-20' : 'pl-4'}`}>
        <span className="text-sm font-medium text-foreground">Angdu Studio</span>
      </div>

      {/* Windows/Linux: custom window controls on the right */}
      {!isMac && (
        <div
          className="flex h-full"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="flex h-full w-12 items-center justify-center text-foreground/60 hover:bg-muted"
            aria-label="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="flex h-full w-12 items-center justify-center text-foreground/60 hover:bg-muted"
            aria-label="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="flex h-full w-12 items-center justify-center text-foreground/60 hover:bg-red-500 hover:text-white"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <line x1="1" y1="1" x2="9" y2="9" strokeWidth="1.2" />
              <line x1="9" y1="1" x2="1" y2="9" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
