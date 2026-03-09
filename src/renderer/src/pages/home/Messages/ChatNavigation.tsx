import React, { useCallback, useEffect, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { AnimatePresence, motion } from 'motion/react'

interface ChatNavigationProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

const ChatNavigation: React.FC<ChatNavigationProps> = ({ scrollContainerRef }) => {
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      // Show button when scrolled up more than 200px from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setShowScrollButton(distanceFromBottom > 200)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [scrollContainerRef])

  return (
    <AnimatePresence>
      {showScrollButton && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-4 right-4 z-10',
            'flex h-8 w-8 items-center justify-center rounded-full',
            'bg-white shadow-md border border-zinc-200',
            'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
            'dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400',
            'dark:hover:bg-zinc-700 dark:hover:text-zinc-100',
            'transition-colors'
          )}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default React.memo(ChatNavigation)
