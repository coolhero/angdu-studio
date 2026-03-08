import { useEffect, useState } from 'react'

function TitleBar(): JSX.Element | null {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    window.api.getAppInfo().then((info) => {
      setIsMac(info.platform === 'darwin')
    })

    window.api.windowControls.isMaximized().then(setIsMaximized)
    const cleanup = window.api.windowControls.onMaximizedChange(setIsMaximized)
    return cleanup
  }, [])

  // macOS uses native traffic lights — no custom title bar needed
  if (isMac) return null

  return (
    <div className="flex h-9 select-none items-center justify-between bg-white dark:bg-zinc-900"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="pl-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Angdu Studio
      </div>
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          className="flex h-9 w-12 items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          onClick={() => window.api.windowControls.minimize()}
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          className="flex h-9 w-12 items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          onClick={() =>
            isMaximized
              ? window.api.windowControls.unmaximize()
              : window.api.windowControls.maximize()
          }
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <rect x="2" y="0" width="8" height="8" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" strokeWidth="1" fill="var(--bg, white)" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <rect x="0" y="0" width="10" height="10" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          className="flex h-9 w-12 items-center justify-center text-zinc-500 hover:bg-red-500 hover:text-white dark:text-zinc-400"
          onClick={() => window.api.windowControls.close()}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M1 0L5 4L9 0L10 1L6 5L10 9L9 10L5 6L1 10L0 9L4 5L0 1Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
