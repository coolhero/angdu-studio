import React, { useCallback } from 'react'
import { cn } from '@renderer/lib/utils'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
}

const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href) return

      // Handle external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        e.preventDefault()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = (window as any).api as
          | { openExternal?: (url: string) => void }
          | undefined
        if (api?.openExternal) {
          api.openExternal(href)
        } else {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    },
    [href]
  )

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export default React.memo(Link)
