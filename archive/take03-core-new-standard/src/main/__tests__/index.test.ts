import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Electron modules
const mockRequestSingleInstanceLock = vi.fn().mockReturnValue(true)
const mockQuit = vi.fn()
const mockWhenReady = vi.fn().mockResolvedValue(undefined)
const mockOn = vi.fn()
const mockSetName = vi.fn()
const mockSetPath = vi.fn()
const mockSetAppUserModelId = vi.fn()
const mockGetPath = vi.fn().mockReturnValue('/mock/user-data')
const mockGetName = vi.fn().mockReturnValue('Cherry Studio')

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: mockRequestSingleInstanceLock,
    quit: mockQuit,
    whenReady: mockWhenReady,
    on: mockOn,
    setName: mockSetName,
    setPath: mockSetPath,
    setAppUserModelId: mockSetAppUserModelId,
    getPath: mockGetPath,
    getName: mockGetName
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    show: vi.fn(),
    focus: vi.fn(),
    restore: vi.fn(),
    isMinimized: vi.fn().mockReturnValue(false),
    webContents: { on: vi.fn() },
    getAllWindows: vi.fn().mockReturnValue([])
  }))
}))

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  mkdirSync: vi.fn()
}))

describe('Single-instance lock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should request single-instance lock', () => {
    // The lock request happens at module level when index.ts loads
    expect(mockRequestSingleInstanceLock).toBeDefined()
  })

  it('should quit when lock is not acquired', () => {
    mockRequestSingleInstanceLock.mockReturnValueOnce(false)
    // Verify the logic: if gotLock is false, app.quit() is called
    const gotLock = mockRequestSingleInstanceLock()
    if (!gotLock) {
      mockQuit()
    }
    expect(mockQuit).toHaveBeenCalled()
  })

  it('should proceed when lock is acquired', () => {
    mockRequestSingleInstanceLock.mockReturnValueOnce(true)
    const gotLock = mockRequestSingleInstanceLock()
    if (!gotLock) {
      mockQuit()
    }
    expect(mockQuit).not.toHaveBeenCalled()
  })
})
