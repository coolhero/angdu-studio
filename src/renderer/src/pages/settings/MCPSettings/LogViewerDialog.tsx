import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import type { MCPServer } from '@renderer/types/mcp'
import type { ServerLogEntry } from '@renderer/types/mcp'

interface LogViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server: MCPServer
}

function levelColor(level: ServerLogEntry['level']): string {
  switch (level) {
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'warn':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'info':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'debug':
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
  }
}

export default function LogViewerDialog({
  open,
  onOpenChange,
  server,
}: LogViewerDialogProps): JSX.Element {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<(ServerLogEntry & { serverId?: string })[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load initial logs and subscribe to new ones
  useEffect(() => {
    if (!open) return

    // Load history
    window.api.mcp
      .getServerLogs(server)
      .then((history) => setLogs(history as (ServerLogEntry & { serverId?: string })[]))
      .catch(() => {
        /* ignore */
      })

    // Subscribe to live logs
    const unsubscribe = window.api.mcp.onServerLog((entry: unknown) => {
      const log = entry as ServerLogEntry & { serverId?: string }
      if (log.serverId && log.serverId !== server.id) return
      setLogs((prev) => {
        const merged = [...prev, log]
        return merged.length > 200 ? merged.slice(-200) : merged
      })
    })

    return () => {
      unsubscribe()
    }
  }, [open, server.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  const handleClear = () => setLogs([])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t('settings.mcp.logs', 'Server Logs')} - {server.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              {t('common.clear', 'Clear')}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh]">
          <div className="space-y-2 p-1">
            {logs.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">
                {t('settings.mcp.noLogs', 'No logs yet')}
              </p>
            )}
            {logs.map((log, idx) => (
              <div
                key={`${log.timestamp}-${idx}`}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="shrink-0 text-[10px] text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={cn(
                      'inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                      levelColor(log.level),
                    )}
                  >
                    {log.level}
                  </span>
                  <span className="break-words text-xs text-zinc-700 dark:text-zinc-300">
                    {log.message}
                  </span>
                </div>
                {log.data && (
                  <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-zinc-100 p-2 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
