import * as React from 'react'
import { RadioGroup as RadixRadioGroup } from 'radix-ui'
import { Circle } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadixRadioGroup.Root>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
))
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadixRadioGroup.Item>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadixRadioGroup.Indicator className="flex items-center justify-center">
      <Circle className="h-2.5 w-2.5 fill-current" />
    </RadixRadioGroup.Indicator>
  </RadixRadioGroup.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
