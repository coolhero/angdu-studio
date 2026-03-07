import { BrowserWindow } from 'electron'

export class ZustandSyncService {
  private static instance: ZustandSyncService

  private constructor() {}

  static getInstance(): ZustandSyncService {
    if (!ZustandSyncService.instance) {
      ZustandSyncService.instance = new ZustandSyncService()
    }
    return ZustandSyncService.instance
  }

  broadcastState(channel: string, state: unknown): void {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(`zustand-sync:${channel}`, state)
    }
  }
}
