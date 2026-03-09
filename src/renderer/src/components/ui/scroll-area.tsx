import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {}

function ScrollArea({ className, children, ref, ...props }: ScrollAreaProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ScrollBar({ className, orientation = 'vertical', ...props }: HTMLAttributes<HTMLDivElement> & { orientation?: 'vertical' | 'horizontal' }) {
  return null // Scrollbar styling handled via CSS classes on ScrollArea
}

export { ScrollArea, ScrollBar }
export type { ScrollAreaProps }
