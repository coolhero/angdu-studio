import { type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({
  className,
  checked = false,
  onCheckedChange,
  ref,
  ...props
}: SwitchProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:focus-visible:ring-zinc-600 dark:ring-offset-zinc-900',
        checked
          ? 'bg-zinc-900 dark:bg-zinc-50'
          : 'bg-zinc-200 dark:bg-zinc-700',
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform',
          checked
            ? 'translate-x-4 bg-white dark:bg-zinc-900'
            : 'translate-x-0 bg-white dark:bg-zinc-400',
        )}
      />
    </button>
  )
}

export { Switch }
export type { SwitchProps }
