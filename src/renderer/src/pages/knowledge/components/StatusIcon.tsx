import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import type { ItemStatus } from '@shared/types/knowledge'

interface StatusIconProps {
  status: ItemStatus
  error?: string
  className?: string
}

export function StatusIcon({ status, error, className = '' }: StatusIconProps) {
  switch (status) {
    case 'pending':
      return (
        <Clock
          className={`h-4 w-4 text-muted-foreground ${className}`}
          aria-label="Pending"
        />
      )
    case 'processing':
      return (
        <Loader2
          className={`h-4 w-4 animate-spin text-blue-500 ${className}`}
          aria-label="Processing"
        />
      )
    case 'completed':
      return (
        <CheckCircle2
          className={`h-4 w-4 text-green-500 ${className}`}
          aria-label="Completed"
        />
      )
    case 'failed':
      return (
        <span title={error ?? 'Processing failed'}>
          <XCircle
            className={`h-4 w-4 text-destructive ${className}`}
            aria-label="Failed"
          />
        </span>
      )
    default:
      return null
  }
}
