import { useEffect, useState } from 'react'
import { useTheme } from './hooks/useTheme'

function App(): React.ReactElement {
  useTheme()
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string } | null>(null)

  useEffect(() => {
    window.api.app.info().then(setAppInfo)
  }, [])

  return (
    <div className="flex h-full items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{appInfo?.name ?? 'Angdu Studio'}</h1>
        <p className="mt-2 text-muted-foreground">
          {appInfo ? `v${appInfo.version} — ${appInfo.platform}` : 'Loading...'}
        </p>
      </div>
    </div>
  )
}

export default App
