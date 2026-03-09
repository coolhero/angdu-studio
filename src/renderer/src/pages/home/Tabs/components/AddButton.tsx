import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface AddButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  title?: string
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, disabled, className, title }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md',
        'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700',
        'dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
        'transition-colors disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <Plus className="h-4 w-4" />
    </button>
  )
}

export default React.memo(AddButton)
