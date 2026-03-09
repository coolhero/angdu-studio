import { useState, useCallback, useLayoutEffect, type RefObject } from 'react'

const MIN_HEIGHT = 80
const MAX_HEIGHT_NORMAL = 300
const MAX_HEIGHT_EXPANDED_VH = 0.6

export function useTextareaResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value?: string
) {
  const [isExpanded, setIsExpanded] = useState(false)

  const maxHeight = isExpanded
    ? Math.max(MAX_HEIGHT_NORMAL, window.innerHeight * MAX_HEIGHT_EXPANDED_VH)
    : MAX_HEIGHT_NORMAL

  // useLayoutEffect runs synchronously after DOM mutations, before paint.
  // This prevents the flicker from height='auto' → measured height.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return

    // Reset height to measure scrollHeight correctly
    el.style.height = '0px'
    const scrollH = el.scrollHeight
    const clamped = Math.min(Math.max(scrollH, MIN_HEIGHT), maxHeight)
    el.style.height = `${clamped}px`
  }, [textareaRef, maxHeight, isExpanded, value])

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
