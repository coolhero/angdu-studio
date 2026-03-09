import { useEffect } from 'react'

/**
 * Hook for subscribing to IPC events from the main process.
 * Automatically cleans up the listener on unmount.
 */
export function useIpcListener(
  subscribe: (cb: (...args: unknown[]) => void) => () => void,
  callback: (...args: unknown[]) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const cleanup = subscribe(callback)
    return cleanup
  }, deps) // eslint-disable-line
}
