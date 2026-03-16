import * as React from 'react'
import { Slider as RadixSlider } from 'radix-ui'
import { cn } from '@renderer/lib/utils'

const Slider = React.forwardRef<
  React.ComponentRef<typeof RadixSlider.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSlider.Root>
>(({ className, ...props }, ref) => (
  <RadixSlider.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <RadixSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
      <RadixSlider.Range className="absolute h-full bg-primary" />
    </RadixSlider.Track>
    <RadixSlider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </RadixSlider.Root>
))
Slider.displayName = 'Slider'

export { Slider }
