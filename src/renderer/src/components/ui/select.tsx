import { type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

function Select({
  className,
  ref,
  children,
  ...props
}: SelectProps & { ref?: React.Ref<HTMLSelectElement> }) {
  return (
    <select
      className={cn(
        'flex h-9 w-full min-w-[140px] rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm',
        'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-900 dark:text-zinc-100',
        'dark:focus-visible:ring-zinc-600',
        'appearance-none bg-no-repeat bg-[length:16px_16px] bg-[right_8px_center]',
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
        'pr-8',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
export type { SelectProps }
