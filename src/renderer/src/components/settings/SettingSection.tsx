import type { ReactNode } from 'react'
import { Separator } from '@renderer/components/ui/separator'

interface SettingSectionProps {
  title: string
  children: ReactNode
}

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <Separator />
      <div className="mt-2">{children}</div>
    </div>
  )
}
