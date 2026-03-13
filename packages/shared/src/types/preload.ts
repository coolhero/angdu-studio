import type { AppInfo, ProxyConfig, ThemeMode } from './config'

export interface PreloadAPI {
  windowControls: {
    minimize(): void
    maximize(): void
    close(): void
    isMaximized(): Promise<boolean>
  }
  miniWindow: {
    show(): void
    hide(): void
    close(): void
    toggle(): void
    setPin(pinned: boolean): void
  }
  setTheme(theme: ThemeMode): void
  app: {
    getInfo(): Promise<AppInfo>
    reload(): void
    quit(): void
    quitAndInstall(): void
    clearCache(): Promise<void>
    getSystemFonts(): Promise<string[]>
    getIpCountry(): Promise<string>
    setProxy(config: ProxyConfig): Promise<void>
    setFullScreen(enabled: boolean): void
    isFullScreen(): Promise<boolean>
    openExternal(url: string): void
    checkForUpdates(): Promise<{ currentVersion: string; updateInfo: unknown | null }>
    downloadUpdate(): Promise<void>
    cancelDownload(): void
  }
  on(channel: string, callback: (...args: unknown[]) => void): () => void
}
