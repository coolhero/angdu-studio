import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FILE_WATCHER_DEBOUNCE_MS, FILE_WATCHER_STABILITY_THRESHOLD_MS } from '@shared/constants'

const { mockWatcher, mockWatch } = vi.hoisted(() => {
  const mockWatcher = {
    on: vi.fn().mockReturnThis(),
    close: vi.fn().mockResolvedValue(undefined),
    add: vi.fn()
  }
  return {
    mockWatcher,
    mockWatch: vi.fn().mockReturnValue(mockWatcher)
  }
})

vi.mock('chokidar', () => ({
  watch: mockWatch
}))

vi.mock('electron', () => ({
  BrowserWindow: { getAllWindows: vi.fn().mockReturnValue([]) }
}))

import { FileWatcherService } from '../FileWatcherService'

describe('FileWatcherService', () => {
  let service: FileWatcherService

  beforeEach(() => {
    vi.clearAllMocks()
    mockWatcher.on.mockReturnThis()
    service = new FileWatcherService()
  })

  describe('startWatcher', () => {
    it('should create a watcher for a path', () => {
      service.startWatcher('test-id', { path: '/mock/dir' })
      expect(mockWatch).toHaveBeenCalledWith(
        '/mock/dir',
        expect.objectContaining({
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: FILE_WATCHER_STABILITY_THRESHOLD_MS,
            pollInterval: 100
          }
        })
      )
    })

    it('should register event handlers', () => {
      service.startWatcher('test-id', { path: '/mock/dir' })
      expect(mockWatcher.on).toHaveBeenCalledWith('add', expect.any(Function))
      expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function))
      expect(mockWatcher.on).toHaveBeenCalledWith('unlink', expect.any(Function))
    })
  })

  describe('stopWatcher', () => {
    it('should close the watcher', async () => {
      service.startWatcher('test-id', { path: '/mock/dir' })
      await service.stopWatcher('test-id')
      expect(mockWatcher.close).toHaveBeenCalled()
    })

    it('should handle stopping non-existent watcher', async () => {
      await service.stopWatcher('non-existent')
    })
  })

  describe('constants', () => {
    it('should use correct debounce value', () => {
      expect(FILE_WATCHER_DEBOUNCE_MS).toBe(1000)
    })

    it('should use correct stability threshold', () => {
      expect(FILE_WATCHER_STABILITY_THRESHOLD_MS).toBe(500)
    })
  })
})
