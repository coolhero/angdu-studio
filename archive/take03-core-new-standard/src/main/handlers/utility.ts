import { shell, Notification } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { registerHandlers } from '../ipc'

export function registerUtilityHandlers(): void {
  registerHandlers([
    [
      IpcChannel.Open_Url,
      async (_event, url: unknown) => {
        await shell.openExternal(url as string)
      }
    ],
    [
      IpcChannel.Open_Path,
      async (_event, path: unknown) => {
        await shell.openPath(path as string)
      }
    ],
    [
      IpcChannel.Notification_Send,
      (_event, options: unknown) => {
        const opts = options as { title: string; body: string }
        const notification = new Notification({
          title: opts.title,
          body: opts.body
        })
        notification.show()
      }
    ],
    [
      IpcChannel.Analytics_Track,
      (_event, _eventName: unknown, _data: unknown) => {
        // Analytics placeholder — opt-in only (Constitution X)
      }
    ]
  ])
}
