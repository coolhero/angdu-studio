import { app } from 'electron'
import { windowService } from './WindowService'
import { logger } from './LoggerService'

class ProtocolService {
  private static instance: ProtocolService | null = null
  private pendingUrls: string[] = []
  private isReady = false

  static getInstance(): ProtocolService {
    if (!ProtocolService.instance) {
      ProtocolService.instance = new ProtocolService()
    }
    return ProtocolService.instance
  }

  initialize(): void {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('angdu', process.execPath, [process.argv[1]])
      }
    } else {
      app.setAsDefaultProtocolClient('angdu')
    }

    // macOS: open-url event
    app.on('open-url', (_event, url) => {
      this.handleUrl(url)
    })

    logger.info('[ProtocolService] Initialized — angdu:// protocol registered')
  }

  handleUrl(url: string): void {
    if (!url.startsWith('angdu://')) return

    if (!this.isReady) {
      this.pendingUrls.push(url)
      logger.info(`[ProtocolService] URL queued (app not ready): ${url}`)
      return
    }

    const win = windowService.getMainWindow()
    if (win) {
      windowService.showMainWindow()
      win.webContents.send('deep-link:received', { url })
      logger.info(`[ProtocolService] URL dispatched: ${url}`)
    }
  }

  markReady(): void {
    this.isReady = true
    for (const url of this.pendingUrls) {
      this.handleUrl(url)
    }
    this.pendingUrls = []
  }

  handleSecondInstanceArgs(argv: string[]): void {
    // Windows/Linux: protocol URL comes via argv
    const url = argv.find((arg) => arg.startsWith('angdu://'))
    if (url) {
      this.handleUrl(url)
    }
  }
}

export const protocolService = ProtocolService.getInstance()
