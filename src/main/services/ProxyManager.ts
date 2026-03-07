import { session } from 'electron'

export class ProxyManager {
  private static instance: ProxyManager
  private currentMode: 'system' | 'fixed' | 'direct' = 'system'
  private currentUrl = ''

  private constructor() {}

  static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager()
    }
    return ProxyManager.instance
  }

  setProxy(mode: 'system' | 'fixed' | 'direct', url?: string): void {
    this.currentMode = mode
    if (url !== undefined) this.currentUrl = url

    const ses = session.defaultSession

    switch (mode) {
      case 'system':
        ses.setProxy({ mode: 'system' })
        break
      case 'fixed':
        ses.setProxy({
          mode: 'fixed_servers',
          proxyRules: this.currentUrl,
          proxyBypassRules: 'localhost,127.0.0.1,::1'
        })
        break
      case 'direct':
        ses.setProxy({ mode: 'direct' })
        break
    }
  }

  getProxy(): { mode: string; url: string } {
    return { mode: this.currentMode, url: this.currentUrl }
  }
}
