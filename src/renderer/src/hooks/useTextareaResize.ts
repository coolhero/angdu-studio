import { useState, useCallback, useLayoutEffect, type RefObject } from 'react'

const MIN_HEIGHT = 30
const MAX_HEIGHT_NORMAL = 500
const MAX_HEIGHT_EXPANDED_VH = 0.6

export function useTextareaResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value?: string
) {
  const [isExpanded, setIsExpanded] = useState(false)

  const maxHeight = isExpanded
    ? Math.max(MAX_HEIGHT_NORMAL, window.innerHeight * MAX_HEIGHT_EXPANDED_VH)
    : MAX_HEIGHT_NORMAL

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return

    // Hide overflow during measurement to prevent scrollbar-induced width
    // changes that cause text reflow and height oscillation
    el.style.overflowY = 'hidden'

    // Reset to 0 with no min-height so scrollHeight reflects true content
    el.style.minHeight = '0px'
    el.style.height = '0px'

    // scrollHeight includes padding but not border; add border for border-box
    const borderY = el.offsetHeight - el.clientHeight
    const scrollH = el.scrollHeight + borderY
    const clamped = Math.min(Math.max(scrollH, MIN_HEIGHT), maxHeight)

    el.style.height = `${clamped}px`
    el.style.minHeight = `${MIN_HEIGHT}px`
    el.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden'
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
