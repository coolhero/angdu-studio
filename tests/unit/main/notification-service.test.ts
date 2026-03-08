import { describe, it, expect, vi } from 'vitest'

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: vi.fn(() => [{
      webContents: {
        send: vi.fn()
      }
    }])
  }
}))

const { notificationService } = await import('@main/services/NotificationService')

describe('NotificationService', () => {
  it('generates unique IDs for notifications', () => {
    const id1 = notificationService.show({
      type: 'info',
      title: 'Test 1',
      message: 'msg1',
      source: 'test'
    })
    const id2 = notificationService.show({
      type: 'info',
      title: 'Test 2',
      message: 'msg2',
      source: 'test'
    })
    expect(id1).not.toBe(id2)
  })

  it('broadcasts notification to all windows', async () => {
    const electron = await import('electron')
    const mockSend = vi.fn()
    vi.mocked(electron.BrowserWindow.getAllWindows).mockReturnValue([
      { webContents: { send: mockSend } } as any
    ])

    notificationService.show({
      type: 'success',
      title: 'Done',
      message: 'Task complete',
      source: 'test'
    })

    expect(mockSend).toHaveBeenCalled()
  })
})
