import { useCallback, useRef, useEffect } from 'react'

export function useTimer(
  callback: () => void,
  delay: number,
  type: 'debounce' | 'throttle' = 'debounce'
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallRef = useRef(0)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const trigger = useCallback(() => {
    if (type === 'debounce') {
      cancel()
      timerRef.current = setTimeout(() => callbackRef.current(), delay)
    } else {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callbackRef.current()
      }
    }
  }, [delay, type, cancel])

  useEffect(() => cancel, [cancel])

  return { trigger, cancel }
}
