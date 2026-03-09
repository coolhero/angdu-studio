import { type HTMLAttributes, type ImgHTMLAttributes, useState } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {}

function Avatar({ className, ref, ...props }: AvatarProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

function AvatarImage({ className, src, alt, ref, ...props }: AvatarImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full', className)}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {}

function AvatarFallback({ className, ref, ...props }: AvatarFallbackProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps }
