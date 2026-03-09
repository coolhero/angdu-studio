import { type HTMLAttributes, type ReactNode, useState } from 'react'
import { cn } from '../../lib/utils'

interface TooltipProviderProps {
  children: ReactNode
  delayDuration?: number
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipProps {
  children: ReactNode
}

function Tooltip({ children }: TooltipProps) {
  return <div className="relative inline-flex">{children}</div>
}

interface TooltipTriggerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

function TooltipTrigger({ children, asChild, className, ...props }: TooltipTriggerProps) {
  return (
    <div className={cn('inline-flex', className)} {...props}>
      {children}
    </div>
  )
}

interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
}

function TooltipContent({
  children,
  className,
  side = 'top',
  ...props
}: TooltipContentProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 hidden rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50 opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-zinc-50 dark:text-zinc-900',
        positionClasses[side],
        className,
      )}
      role="tooltip"
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
