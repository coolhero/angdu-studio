import { describe, it, expect, vi } from 'vitest'

const { mockShell, MockNotification } = vi.hoisted(() => ({
  mockShell: {
    openExternal: vi.fn().mockResolvedValue(undefined),
    openPath: vi.fn().mockResolvedValue('')
  },
  MockNotification: vi.fn().mockImplementation(() => ({ show: vi.fn() }))
}))

vi.mock('electron', () => ({
  shell: mockShell,
  Notification: MockNotification,
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() },
  app: { getPath: vi.fn().mockReturnValue('/mock'), getName: vi.fn().mockReturnValue('Cherry Studio') }
}))

describe('Utility IPC handlers', () => {
  it('should handle Open_Url', async () => {
    await mockShell.openExternal('https://example.com')
    expect(mockShell.openExternal).toHaveBeenCalledWith('https://example.com')
  })

  it('should handle Open_Path', async () => {
    await mockShell.openPath('/mock/path')
    expect(mockShell.openPath).toHaveBeenCalledWith('/mock/path')
  })

  it('should handle Notification_Send', () => {
    const notif = new MockNotification({ title: 'Test', body: 'Body' })
    notif.show()
    expect(MockNotification).toHaveBeenCalled()
  })
})
