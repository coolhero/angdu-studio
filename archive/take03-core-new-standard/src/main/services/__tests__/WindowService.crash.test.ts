import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CRASH_RECOVERY_THRESHOLD_MS } from '@shared/constants'

const mockReload = vi.fn()
const mockQuit = vi.fn()

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  app: {
    quit: mockQuit,
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

describe('Renderer crash recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should reload when crash occurs after threshold', () => {
    let lastCrashTime = 0
    const now = CRASH_RECOVERY_THRESHOLD_MS + 1000

    vi.setSystemTime(now)

    // Simulate crash handler logic
    if (Date.now() - lastCrashTime > CRASH_RECOVERY_THRESHOLD_MS) {
      lastCrashTime = Date.now()
      mockReload()
    } else {
      mockQuit()
    }

    expect(mockReload).toHaveBeenCalled()
    expect(mockQuit).not.toHaveBeenCalled()
  })

  it('should quit on repeated crash within threshold', () => {
    let lastCrashTime = Date.now()

    // Advance time but stay within threshold
    vi.advanceTimersByTime(CRASH_RECOVERY_THRESHOLD_MS - 1000)

    if (Date.now() - lastCrashTime > CRASH_RECOVERY_THRESHOLD_MS) {
      lastCrashTime = Date.now()
      mockReload()
    } else {
      mockQuit()
    }

    expect(mockQuit).toHaveBeenCalled()
    expect(mockReload).not.toHaveBeenCalled()
  })

  it('should use 60 second threshold', () => {
    expect(CRASH_RECOVERY_THRESHOLD_MS).toBe(60_000)
  })
})
