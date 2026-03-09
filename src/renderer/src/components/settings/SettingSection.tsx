'use client'

import type { ReactNode } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { cn } from '../../lib/utils'

interface SettingSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

function SettingSection({ title, children, defaultOpen = true }: SettingSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-lg border border-zinc-200 dark:border-zinc-700">
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between px-4 py-3 text-sm font-semibold',
          'text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50',
          'transition-colors',
        )}
      >
        <span>{title}</span>
        <svg
          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 [[aria-expanded=true]>&]:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 border-t border-zinc-200 px-4 py-2 dark:border-zinc-700">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { SettingSection }
export type { SettingSectionProps }
