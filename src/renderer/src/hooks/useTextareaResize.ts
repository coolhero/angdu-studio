import { useState, useCallback, useEffect, type RefObject } from 'react'

const MIN_HEIGHT = 80
const MAX_HEIGHT_NORMAL = 300
const MAX_HEIGHT_EXPANDED_VH = 0.6

export function useTextareaResize(textareaRef: RefObject<HTMLTextAreaElement | null>) {
  const [isExpanded, setIsExpanded] = useState(false)

  const maxHeight = isExpanded
    ? Math.max(MAX_HEIGHT_NORMAL, window.innerHeight * MAX_HEIGHT_EXPANDED_VH)
    : MAX_HEIGHT_NORMAL

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    // Reset height to measure scrollHeight correctly
    el.style.height = 'auto'
    const scrollH = el.scrollHeight
    const clamped = Math.min(Math.max(scrollH, MIN_HEIGHT), maxHeight)
    el.style.height = `${clamped}px`
  }, [textareaRef, maxHeight])

  // Resize whenever expanded state changes
  useEffect(() => {
    resize()
  }, [resize, isExpanded])

  // Observe value changes via input event
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    const handleInput = () => resize()
    el.addEventListener('input', handleInput)
    // Initial sizing
    resize()

    return () => el.removeEventListener('input', handleInput)
  }, [textareaRef, resize])

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return {
    isExpanded,
    toggleExpand,
    maxHeight,
    minHeight: MIN_HEIGHT,
  }
}
