import { create } from 'zustand'
import type { AppNotification } from '@shared/types'

interface NotificationState {
  notifications: AppNotification[]
  add: (notification: AppNotification) => void
  dismiss: (id: string) => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  add: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),

  clear: () => set({ notifications: [] })
}))
