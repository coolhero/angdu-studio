import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { IpcChannel } from '@shared/IpcChannel'
import type { IpcChannelMap } from '@shared/types'

/**
 * Type-safe wrapper around ipcMain.handle.
 * Ensures the handler function signature matches the IpcChannelMap
 * definition for the given channel.
 */
export function typedHandle<C extends IpcChannel>(
  channel: C,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: IpcChannelMap[C]['request']
  ) => Promise<IpcChannelMap[C]['response']> | IpcChannelMap[C]['response']
): void {
  ipcMain.handle(channel, handler as Parameters<typeof ipcMain.handle>[1])
}
