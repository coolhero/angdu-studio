import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Download } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useMCPStore } from '@renderer/stores/useMCPStore'

export default function InstallNpxUv(): JSX.Element {
  const { t } = useTranslation()
  const isUvInstalled = useMCPStore((s) => s.isUvInstalled)
  const isBunInstalled = useMCPStore((s) => s.isBunInstalled)
  const setIsUvInstalled = useMCPStore((s) => s.setIsUvInstalled)
  const setIsBunInstalled = useMCPStore((s) => s.setIsBunInstalled)

  const [installingUv, setInstallingUv] = useState(false)
  const [installingBun, setInstallingBun] = useState(false)

  const checkBinaries = useCallback(async () => {
    try {
      // Check if binaries exist by trying to call API if available
      // This is a placeholder - actual implementation depends on window.api
      if (window.api && 'isBinaryExist' in window.api) {
        const uvExists = await (window.api as Record<string, (name: string) => Promise<boolean>>).isBinaryExist('uv')
        const bunExists = await (window.api as Record<string, (name: string) => Promise<boolean>>).isBinaryExist('bun')
        setIsUvInstalled(uvExists)
        setIsBunInstalled(bunExists)
      }
    } catch {
      // ignore
    }
  }, [setIsUvInstalled, setIsBunInstalled])

  useEffect(() => {
    checkBinaries()
  }, [checkBinaries])

  const handleInstallUv = async () => {
    try {
      setInstallingUv(true)
      if (window.api && 'installUVBinary' in window.api) {
        await (window.api as Record<string, () => Promise<void>>).installUVBinary()
        setIsUvInstalled(true)
        toast.success(t('settings.mcp.installSuccess', 'UV installed successfully'))
      }
    } catch {
      toast.error(t('settings.mcp.installError', 'Installation failed'))
    } finally {
      setInstallingUv(false)
      checkBinaries()
    }
  }

  const handleInstallBun = async () => {
    try {
      setInstallingBun(true)
      if (window.api && 'installBunBinary' in window.api) {
        await (window.api as Record<string, () => Promise<void>>).installBunBinary()
        setIsBunInstalled(true)
        toast.success(t('settings.mcp.installSuccess', 'Bun installed successfully'))
      }
    } catch {
      toast.error(t('settings.mcp.installError', 'Installation failed'))
    } finally {
      setInstallingBun(false)
      checkBinaries()
    }
  }

  const StatusIcon = ({ installed }: { installed: boolean }) =>
    installed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-yellow-500" />
    )

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-5">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t('settings.mcp.installRuntimes', 'Install Runtimes')}
        </h3>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t(
            'settings.mcp.installRuntimes.description',
            'MCP servers may require npx (Node.js) or uvx (Python) runtimes. Install them here if needed.',
          )}
        </p>

        <div className="space-y-3">
          {/* UV / uvx */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <StatusIcon installed={isUvInstalled} />
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">uv / uvx</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('settings.mcp.uvDescription', 'Python package runner for MCP servers')}
                </p>
              </div>
            </div>
            <Button
              variant={isUvInstalled ? 'ghost' : 'default'}
              size="sm"
              onClick={handleInstallUv}
              disabled={installingUv || isUvInstalled}
            >
              {isUvInstalled ? (
                t('settings.mcp.installed', 'Installed')
              ) : (
                <>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  {installingUv ? t('common.installing', 'Installing...') : t('common.install', 'Install')}
                </>
              )}
            </Button>
          </div>

          {/* Bun */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <StatusIcon installed={isBunInstalled} />
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Bun</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('settings.mcp.bunDescription', 'Fast JavaScript runtime and package manager')}
                </p>
              </div>
            </div>
            <Button
              variant={isBunInstalled ? 'ghost' : 'default'}
              size="sm"
              onClick={handleInstallBun}
              disabled={installingBun || isBunInstalled}
            >
              {isBunInstalled ? (
                t('settings.mcp.installed', 'Installed')
              ) : (
                <>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  {installingBun ? t('common.installing', 'Installing...') : t('common.install', 'Install')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
