import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface ToolApprovalActionsProps {
  onApprove: () => void
  onDeny: () => void
  pending: boolean
}

const ToolApprovalActions: React.FC<ToolApprovalActionsProps> = ({
  onApprove,
  onDeny,
  pending,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={!pending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
          'bg-green-500 text-white hover:bg-green-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors'
        )}
        aria-label="Approve"
      >
        <Check className="h-3.5 w-3.5" />
        Approve
      </button>
      <button
        type="button"
        onClick={onDeny}
        disabled={!pending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
          'bg-red-500 text-white hover:bg-red-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors'
        )}
        aria-label="Deny"
      >
        <X className="h-3.5 w-3.5" />
        Deny
      </button>
    </div>
  )
}

export default React.memo(ToolApprovalActions)
