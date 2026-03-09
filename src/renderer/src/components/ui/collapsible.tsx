import {
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'
import { cn } from '../../lib/utils'

interface CollapsibleContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextValue>({
  open: false,
  setOpen: () => {},
})

interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Collapsible({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  className,
  ...props
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className={className} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  children,
  className,
  asChild,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = useContext(CollapsibleContext)
  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  )
}

function CollapsibleContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useContext(CollapsibleContext)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0)

  useEffect(() => {
    if (!contentRef.current) return
    if (open) {
      const h = contentRef.current.scrollHeight
      setHeight(h)
      const timer = setTimeout(() => setHeight(undefined), 200)
      return () => clearTimeout(timer)
    } else {
      setHeight(contentRef.current.scrollHeight)
      requestAnimationFrame(() => setHeight(0))
    }
  }, [open])

  return (
    <div
      ref={contentRef}
      className={cn('overflow-hidden transition-[height] duration-200', className)}
      style={{ height: height !== undefined ? `${height}px` : undefined }}
      {...props}
    >
      {open && children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
