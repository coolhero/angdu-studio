import { useEffect } from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import type { AppNotification } from '@shared/types'

function NotificationCenter(): JSX.Element {
  const { notifications, dismiss } = useNotificationStore()

  useEffect(() => {
    // Auto-dismiss notifications
    const timers: NodeJS.Timeout[] = []
    for (const notification of notifications) {
      const timeout = notification.dismissAfterMs ?? 5000
      if (timeout > 0) {
        const timer = setTimeout(() => dismiss(notification.id), timeout)
        timers.push(timer)
      }
    }
    return () => timers.forEach(clearTimeout)
  }, [notifications, dismiss])

  if (notifications.length === 0) return <></>

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex min-w-[320px] max-w-[400px] items-start gap-3 rounded-lg border p-4 shadow-lg
            ${n.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : ''}
            ${n.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' : ''}
            ${n.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : ''}
            ${n.type === 'info' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' : ''}
          `}
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{n.message}</p>
            {n.actions && n.actions.length > 0 && (
              <div className="mt-2 flex gap-2">
                {n.actions.map((action) => (
                  <button
                    key={action.action}
                    className="rounded bg-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    onClick={() => {
                      window.api.notification.dismiss(n.id)
                      dismiss(n.id)
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationCenter
