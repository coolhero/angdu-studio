import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

type IpcHandler = (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown

const handlers = new Map<IpcChannel, IpcHandler>()

export function registerHandler(channel: IpcChannel, handler: IpcHandler): void {
  if (handlers.has(channel)) {
    ipcMain.removeHandler(channel)
  }
  handlers.set(channel, handler)
  ipcMain.handle(channel, handler)
}

export function registerHandlers(
  entries: Array<[IpcChannel, IpcHandler]>
): void {
  for (const [channel, handler] of entries) {
    registerHandler(channel, handler)
  }
}

export function unregisterHandler(channel: IpcChannel): void {
  if (handlers.has(channel)) {
    ipcMain.removeHandler(channel)
    handlers.delete(channel)
  }
}

export function unregisterAll(): void {
  for (const channel of handlers.keys()) {
    ipcMain.removeHandler(channel)
  }
  handlers.clear()
}
