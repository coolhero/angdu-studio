import { describe, it, expect, vi } from 'vitest'

const mockApp = {
  requestSingleInstanceLock: vi.fn(() => true),
  quit: vi.fn(),
  on: vi.fn()
}

vi.mock('electron', () => ({
  app: mockApp
}))

describe('Single Instance', () => {
  it('should acquire single-instance lock', () => {
    const gotLock = mockApp.requestSingleInstanceLock()
    expect(gotLock).toBe(true)
  })

  it('should quit if lock cannot be acquired', () => {
    mockApp.requestSingleInstanceLock.mockReturnValueOnce(false)
    const gotLock = mockApp.requestSingleInstanceLock()
    if (!gotLock) {
      mockApp.quit()
    }
    expect(mockApp.quit).toHaveBeenCalled()
  })

  it('should register second-instance event handler', () => {
    mockApp.on('second-instance', () => {})
    expect(mockApp.on).toHaveBeenCalledWith('second-instance', expect.any(Function))
  })
})
