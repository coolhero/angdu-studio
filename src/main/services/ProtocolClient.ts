import { app, BrowserWindow } from 'electron'
import { isMac } from '../constant'

const PROTOCOL = 'angdustudio'

export class ProtocolClient {
  private static instance: ProtocolClient

  private constructor() {}

  static getInstance(): ProtocolClient {
    if (!ProtocolClient.instance) {
      ProtocolClient.instance = new ProtocolClient()
    }
    return ProtocolClient.instance
  }

  /**
   * Register the angdustudio:// protocol as the default protocol client.
   * Must be called before app 'ready' or at startup.
   */
  register(): void {
    if (!app.isDefaultProtocolClient(PROTOCOL)) {
      app.setAsDefaultProtocolClient(PROTOCOL)
    }
  }

  /**
   * Set up protocol URL handling.
   * - macOS: uses 'open-url' event
   * - Windows/Linux: URL is passed as command-line arg on second-instance
   */
  init(): void {
    if (isMac) {
      // macOS: handle protocol URL via open-url event
      app.on('open-url', (event, url) => {
        event.preventDefault()
        this.handleProtocolUrl(url)
      })
    }
    // Windows/Linux: handled via second-instance event in index.ts
    // The second-instance handler should call handleSecondInstanceArgs
  }

  /**
   * Handle second-instance arguments (Windows/Linux).
   * Called from the second-instance event handler.
   */
  handleSecondInstanceArgs(argv: string[]): void {
    // On Windows/Linux, the protocol URL is the last argument
    const url = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
    if (url) {
      this.handleProtocolUrl(url)
    }
  }

  /**
   * Process a protocol URL.
   * Parses the URL and dispatches the appropriate action.
   */
  private handleProtocolUrl(url: string): void {
    try {
      const parsed = new URL(url)
      const action = parsed.hostname
      const params = Object.fromEntries(parsed.searchParams.entries())

      // Focus the main window
      const mainWindow = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()

        // Send the protocol action to the renderer
        mainWindow.webContents.send('protocol-action', { action, params })
      }
    } catch {
      // Invalid URL format, ignore
    }
  }
}
