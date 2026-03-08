import { app, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import { ANGDU_STUDIO_PROTOCOL } from '@shared/constants'
import process from 'node:process'

const isMac = process.platform === 'darwin'

class ProtocolService {
  private urlQueue: string[] = []
  private isProcessing = false

  init(): void {
    // Register protocol
    if (!app.isDefaultProtocolClient(ANGDU_STUDIO_PROTOCOL)) {
      app.setAsDefaultProtocolClient(ANGDU_STUDIO_PROTOCOL)
    }

    // macOS: handle open-url event
    if (isMac) {
      app.on('open-url', (event, url) => {
        event.preventDefault()
        this.queueUrl(url)
      })
    }

    // Windows/Linux: handle second-instance args
    app.on('second-instance', (_event, commandLine) => {
      const url = commandLine.find((arg) => arg.startsWith(`${ANGDU_STUDIO_PROTOCOL}://`))
      if (url) {
        this.queueUrl(url)
      }
    })
  }

  private queueUrl(url: string): void {
    this.urlQueue.push(url)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.urlQueue.length > 0) {
      const url = this.urlQueue.shift()!
      await this.handleUrl(url)
    }

    this.isProcessing = false
  }

  private async handleUrl(url: string): Promise<void> {
    try {
      const parsed = new URL(url)
      const params: Record<string, string> = {}
      parsed.searchParams.forEach((value, key) => {
        params[key] = value
      })

      const data = {
        url,
        params
      }

      // Forward to all windows
      for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send(IpcChannel.Protocol_OnReceive, data)
      }

      // Focus the main window
      const mainWindow = BrowserWindow.getAllWindows()[0]
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    } catch (error) {
      console.error('Failed to parse protocol URL:', url, error)
    }
  }
}

export const protocolService = new ProtocolService()
