import { useState, useCallback, type ReactNode } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Download, Upload } from 'lucide-react'

interface BackupCardProps {
  title: string
  description: string
  onBackup: () => Promise<void>
  onRestore: () => Promise<void>
  progress?: { percent: number; stage: string } | null
  children?: ReactNode // credential inputs
}

export function BackupCard({
  title,
  description,
  onBackup,
  onRestore,
  progress,
  children
}: BackupCardProps): JSX.Element {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const handleBackup = useCallback(async () => {
    setIsBackingUp(true)
    try {
      await onBackup()
    } finally {
      setIsBackingUp(false)
    }
  }, [onBackup])

  const handleRestore = useCallback(async () => {
    setIsRestoring(true)
    try {
      await onRestore()
    } finally {
      setIsRestoring(false)
    }
  }, [onRestore])

  const isBusy = isBackingUp || isRestoring

  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-700">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      {children && <div className="mb-4">{children}</div>}

      {progress && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{progress.stage}</span>
            <span>{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleBackup}
          disabled={isBusy}
        >
          <Upload className="h-4 w-4" />
          {isBackingUp ? 'Backing up...' : 'Backup'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRestore}
          disabled={isBusy}
        >
          <Download className="h-4 w-4" />
          {isRestoring ? 'Restoring...' : 'Restore'}
        </Button>
      </div>
    </div>
  )
}
