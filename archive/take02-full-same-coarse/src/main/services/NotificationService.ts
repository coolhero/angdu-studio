import { loggerService } from '@main/services/LoggerService'
import { IpcChannel } from '@shared/IpcChannel'
import { BrowserWindow, Notification } from 'electron'

const logger = loggerService.withContext('NotificationService')

interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
}

class NotificationService {
  show(options: NotificationOptions): void {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      silent: options.silent ?? false
    })

    notification.on('click', () => {
      logger.info('Notification clicked', { title: options.title })
      BrowserWindow.getAllWindows().forEach((w) => {
        w.webContents.send(IpcChannel.Notification_Click, {
          title: options.title,
          body: options.body
        })
      })
    })

    notification.on('close', () => {
      logger.debug('Notification closed', { title: options.title })
    })

    notification.show()
    logger.info('Notification shown', { title: options.title })
  }
}

export const notificationService = new NotificationService()
export default notificationService
