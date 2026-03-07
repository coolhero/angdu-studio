import { useEffect } from 'react'
import { useAppStore } from './stores/app.store'

/**
 * Minimal app shell. Loads app info on mount and renders a placeholder.
 */
export default function App() {
  const setIsMaximized = useAppStore((s) => s.setIsMaximized)

  useEffect(() => {
    // Fetch initial maximized state
    window.api.isWindowMaximized().then(setIsMaximized)
  }, [setIsMaximized])

  return (
    <div id="app">
      <h1>Cherry Studio</h1>
    </div>
  )
}
