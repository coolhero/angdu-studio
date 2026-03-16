import type { ReactNode } from 'react'

interface SettingItemProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
