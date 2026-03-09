import React from 'react'
import { cn } from '@renderer/lib/utils'

interface NarrowLayoutProps {
  children: React.ReactNode
  narrowMode: boolean
}

const NarrowLayout: React.FC<NarrowLayoutProps> = ({ children, narrowMode }) => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden',
        narrowMode ? 'mx-auto w-full max-w-2xl px-2' : ''
      )}
    >
      {children}
    </div>
  )
}

export default React.memo(NarrowLayout)
