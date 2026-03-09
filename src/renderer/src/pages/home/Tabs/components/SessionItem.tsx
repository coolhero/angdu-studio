import React from 'react'
import { cn } from '@renderer/lib/utils'

interface SessionItemProps {
  id: string
  name: string
  isActive: boolean
  onClick: () => void
}

const SessionItem: React.FC<SessionItemProps> = ({ name, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        isActive
          ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
      )}
    >
      <span className="min-w-0 flex-1 truncate">{name}</span>
    </button>
  )
}

export default React.memo(SessionItem)
