import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '@renderer/stores/useNotificationStore'
import type { AppNotification } from '@shared/types'

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] })
  })

  it('adds a notification', () => {
    const notification: AppNotification = {
      id: 'test-1',
      type: 'info',
      title: 'Test',
      message: 'Test message',
      source: 'test',
      createdAt: Date.now()
    }

    useNotificationStore.getState().add(notification)
    expect(useNotificationStore.getState().notifications).toHaveLength(1)
    expect(useNotificationStore.getState().notifications[0].id).toBe('test-1')
  })

  it('dismisses a notification by id', () => {
    const notification: AppNotification = {
      id: 'test-dismiss',
      type: 'warning',
      title: 'Warn',
      message: 'Warning',
      source: 'test',
      createdAt: Date.now()
    }

    useNotificationStore.getState().add(notification)
    expect(useNotificationStore.getState().notifications).toHaveLength(1)

    useNotificationStore.getState().dismiss('test-dismiss')
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  it('clears all notifications', () => {
    useNotificationStore.getState().add({
      id: 'a', type: 'info', title: 'A', message: 'a', source: 'test', createdAt: Date.now()
    })
    useNotificationStore.getState().add({
      id: 'b', type: 'info', title: 'B', message: 'b', source: 'test', createdAt: Date.now()
    })

    expect(useNotificationStore.getState().notifications).toHaveLength(2)
    useNotificationStore.getState().clear()
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })
})
