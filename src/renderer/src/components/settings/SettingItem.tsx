'use client'

import type { ReactNode } from 'react'

interface SettingItemProps {
  title: string
  description?: string
  children: ReactNode
}

function SettingItem({ title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 space-y-0.5">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
        {description && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export { SettingItem }
export type { SettingItemProps }
