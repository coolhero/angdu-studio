import { useCallback, useRef, useState } from 'react'

interface SmoothStreamState {
  displayedText: string
  isAnimating: boolean
  addChunk: (chunk: string) => void
  flush: () => void
  reset: () => void
}

const CHARS_PER_FRAME = 4

export function useSmoothStream(): SmoothStreamState {
  const [displayedText, setDisplayedText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const bufferRef = useRef('')
  const displayedRef = useRef('')
  const rafIdRef = useRef<number | null>(null)

  const drain = useCallback(() => {
    if (bufferRef.current.length === 0) {
      setIsAnimating(false)
      rafIdRef.current = null
      return
    }

    const chars = bufferRef.current.slice(0, CHARS_PER_FRAME)
    bufferRef.current = bufferRef.current.slice(CHARS_PER_FRAME)
    displayedRef.current += chars
    setDisplayedText(displayedRef.current)

    rafIdRef.current = requestAnimationFrame(drain)
  }, [])

  const addChunk = useCallback(
    (chunk: string) => {
      bufferRef.current += chunk
      if (!rafIdRef.current) {
        setIsAnimating(true)
        rafIdRef.current = requestAnimationFrame(drain)
      }
    },
    [drain]
  )

  const flush = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    displayedRef.current += bufferRef.current
    bufferRef.current = ''
    setDisplayedText(displayedRef.current)
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    bufferRef.current = ''
    displayedRef.current = ''
    setDisplayedText('')
    setIsAnimating(false)
  }, [])

  return { displayedText, isAnimating, addChunk, flush, reset }
}
