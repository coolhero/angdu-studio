import { useCallback } from 'react'
import { Settings } from 'lucide-react'
import { useNavbarPosition, useTabsStore } from '../../stores/useTabsStore'
import { NavigationService } from '../../services/NavigationService'
import { TabBar } from './TabBar'

const isMac = navigator.userAgent.includes('Macintosh')

export function Navbar() {
  const navbarPosition = useNavbarPosition()

  const handleMinimize = useCallback(() => {
    window.api.invoke['window:minimize']()
  }, [])

  const handleMaximize = useCallback(() => {
    window.api.invoke['window:maximize']()
  }, [])

  const handleClose = useCallback(() => {
    window.api.invoke['window:close']()
  }, [])

  const handleOpenSettings = useCallback(() => {
    useTabsStore.getState().addTab('/settings')
    NavigationService.navigate('/settings')
  }, [])

  return (
    <div
      className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background/80 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS: space for traffic lights in top mode (no sidebar to hold them) */}
      {isMac && navbarPosition === 'top' && <div className="w-20 shrink-0" />}

      {/* Tab bar (top mode) or drag area (left mode) */}
      <div className="flex min-w-0 flex-1 items-center">
        {navbarPosition === 'top' ? (
          <TabBar />
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Right side: settings icon + window controls */}
      <div
        className="flex h-full shrink-0 items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Settings gear icon (always visible, like Cherry Studio) */}
        <button
          onClick={handleOpenSettings}
          className="flex h-full w-10 items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Windows/Linux: custom window controls */}
        {!isMac && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
