import { BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import type { AppNotification, NotificationAction } from '@shared/types'

class NotificationService {
  private counter = 0

  show(notification: Omit<AppNotification, 'id' | 'createdAt'>): string {
    const id = `notif-${Date.now()}-${++this.counter}`
    const fullNotification: AppNotification = {
      ...notification,
      id,
      createdAt: Date.now()
    }

    this.broadcast(fullNotification)
    return id
  }

  dismiss(id: string): void {
    // Broadcast dismiss to all windows
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannel.Notification_Dismiss, id)
    }
  }

  handleAction(id: string, action: string): void {
    // Route action to appropriate handler
    // Downstream features will register action handlers
    console.log(`Notification action: ${id} -> ${action}`)
  }

  private broadcast(notification: AppNotification): void {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannel.Notification_Show, notification)
    }
  }
}

export const notificationService = new NotificationService()
