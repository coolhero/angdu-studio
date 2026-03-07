import { Notification } from 'electron'

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  send(title: string, body: string): void {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  }
}
