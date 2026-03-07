import { app, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { withContext } from '../logger'

const log = withContext('protocol')

const PROTOCOL = 'cherry-studio'

export class ProtocolService {
  registerProtocol(): void {
    if (!app.isDefaultProtocolClient(PROTOCOL)) {
      app.setAsDefaultProtocolClient(PROTOCOL)
      log.info(`Registered protocol: ${PROTOCOL}://`)
    }
  }

  handleDeepLink(url: string): void {
    log.info(`Deep link received: ${url}`)
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.DeepLinkReceived, url)
    })
  }

  parseDeepLink(url: string): URL {
    return new URL(url)
  }
}
