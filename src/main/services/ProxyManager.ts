import { session } from 'electron'
import http from 'node:http'
import https from 'node:https'
import type { ProxyMode } from '@shared/types'
import { configManager, ConfigKeys } from './ConfigManager'

interface ProxyState {
  mode: ProxyMode
  url?: string
  bypassRules: string[]
}

class ProxyManager {
  private state: ProxyState = { mode: 'none', bypassRules: [] }
  private systemProxyTimer: ReturnType<typeof setInterval> | null = null
  private originalHttpGet = http.get
  private originalHttpRequest = http.request
  private originalHttpsGet = https.get
  private originalHttpsRequest = https.request

  async init(): Promise<void> {
    const mode = configManager.getProxyMode()
    const url = configManager.get<string>(ConfigKeys.ProxyUrl, '')
    const bypassStr = configManager.get<string>(ConfigKeys.ProxyBypassRules, '')
    const bypassRules = bypassStr ? bypassStr.split(';').map((r) => r.trim()).filter(Boolean) : []

    await this.configureProxy({ mode, url, bypassRules })

    if (mode === 'system') {
      this.startSystemProxyPolling()
    }
  }

  async configureProxy(config: { mode: ProxyMode; url?: string; bypassRules?: string[] }): Promise<void> {
    this.state = {
      mode: config.mode,
      url: config.url,
      bypassRules: config.bypassRules ?? []
    }

    switch (config.mode) {
      case 'none':
        await this.clearProxy()
        break
      case 'custom':
        if (config.url) {
          await this.applyProxy(config.url, config.bypassRules ?? [])
        }
        break
      case 'system':
        await this.detectAndApplySystemProxy()
        break
    }
  }

  private async applyProxy(url: string, bypassRules: string[]): Promise<void> {
    try {
      // Set Electron session proxy
      const bypassStr = bypassRules.join(';')
      await session.defaultSession.setProxy({
        proxyRules: url,
        proxyBypassRules: bypassStr || undefined
      })

      // Set environment variables
      this.setEnvironment(url, bypassRules)
    } catch (error) {
      console.error('Failed to apply proxy:', error)
      await this.clearProxy()
    }
  }

  private async clearProxy(): Promise<void> {
    await session.defaultSession.setProxy({ mode: 'direct' })
    this.clearEnvironment()
  }

  private setEnvironment(url: string, bypassRules: string[]): void {
    const proxyUrl = url
    process.env.HTTP_PROXY = proxyUrl
    process.env.http_proxy = proxyUrl
    process.env.HTTPS_PROXY = proxyUrl
    process.env.https_proxy = proxyUrl

    if (url.startsWith('socks')) {
      process.env.SOCKS_PROXY = proxyUrl
      process.env.socks_proxy = proxyUrl
    }

    process.env.ALL_PROXY = proxyUrl
    process.env.all_proxy = proxyUrl

    if (bypassRules.length > 0) {
      const noProxy = bypassRules.join(',')
      process.env.NO_PROXY = noProxy
      process.env.no_proxy = noProxy
    }
  }

  private clearEnvironment(): void {
    const vars = [
      'HTTP_PROXY', 'http_proxy',
      'HTTPS_PROXY', 'https_proxy',
      'SOCKS_PROXY', 'socks_proxy',
      'ALL_PROXY', 'all_proxy',
      'NO_PROXY', 'no_proxy'
    ]
    for (const v of vars) {
      delete process.env[v]
    }
  }

  private async detectAndApplySystemProxy(): Promise<void> {
    try {
      const { getProxyConfig } = await import('os-proxy-config')
      const proxyConfig = await getProxyConfig()

      if (proxyConfig?.url) {
        const bypassRules = proxyConfig.noProxy
          ? proxyConfig.noProxy.split(',').map((r: string) => r.trim())
          : []
        await this.applyProxy(proxyConfig.url, bypassRules)
      } else {
        await this.clearProxy()
      }
    } catch {
      console.warn('Failed to detect system proxy, using direct connection')
      await this.clearProxy()
    }
  }

  private startSystemProxyPolling(): void {
    this.stopSystemProxyPolling()
    this.systemProxyTimer = setInterval(() => {
      if (this.state.mode === 'system') {
        this.detectAndApplySystemProxy()
      }
    }, 60_000) // Poll every 60 seconds
  }

  stopSystemProxyPolling(): void {
    if (this.systemProxyTimer) {
      clearInterval(this.systemProxyTimer)
      this.systemProxyTimer = null
    }
  }

  isBypass(hostname: string): boolean {
    for (const rule of this.state.bypassRules) {
      if (rule === '<local>' && !hostname.includes('.')) return true
      if (rule.startsWith('*.') && hostname.endsWith(rule.slice(1))) return true
      if (rule === hostname) return true
      // CIDR matching would go here with ipaddr.js
    }
    return false
  }

  async cleanup(): Promise<void> {
    this.stopSystemProxyPolling()
    await this.clearProxy()
  }
}

export const proxyManager = new ProxyManager()
