import { useCallback, useEffect, useRef } from 'react'

const scrollPositions = new Map<string, number>()

export function useScrollPosition(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const savePosition = useCallback(() => {
    if (scrollRef.current) {
      scrollPositions.set(key, scrollRef.current.scrollTop)
    }
  }, [key])

  const restorePosition = useCallback(() => {
    const saved = scrollPositions.get(key)
    if (scrollRef.current && saved !== undefined) {
      scrollRef.current.scrollTop = saved
    }
  }, [key])

  // Save position on unmount / key change
  useEffect(() => {
    return () => {
      if (scrollRef.current) {
        scrollPositions.set(key, scrollRef.current.scrollTop)
      }
    }
  }, [key])

  // Restore position when key changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const frame = requestAnimationFrame(() => {
      restorePosition()
    })
    return () => cancelAnimationFrame(frame)
  }, [restorePosition])

  return { scrollRef, savePosition, restorePosition }
}
