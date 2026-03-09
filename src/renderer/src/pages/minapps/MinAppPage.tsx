import { useMiniAppsStore } from '@renderer/stores/useMiniAppsStore'
import { Button } from '@renderer/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface MinAppPageProps {
  appId: string
  onBack?: () => void
}

export default function MinAppPage({ appId, onBack }: MinAppPageProps): JSX.Element {
  const miniApps = useMiniAppsStore((s) => s.miniApps)
  const app = miniApps.find((a) => a.id === appId)

  if (!app) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Mini app not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {app.icon && <span className="text-lg">{app.icon}</span>}
          <h1 className="text-sm font-semibold">{app.name}</h1>
        </div>
      </div>

      {/* Webview */}
      <div className="flex-1">
        <webview
          src={app.url}
          className="h-full w-full"
          // @ts-expect-error -- Electron webview attributes not in standard JSX types
          allowpopups="true"
        />
      </div>
    </div>
  )
}
