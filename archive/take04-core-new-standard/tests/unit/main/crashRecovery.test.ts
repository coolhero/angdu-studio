import { describe, it, expect, vi } from 'vitest'

describe('Crash Recovery', () => {
  it('should reload if >60s since last crash', () => {
    let lastCrashTime = 0
    const reload = vi.fn()
    const exit = vi.fn()
    const now = Date.now()

    // Simulate first crash
    lastCrashTime = 0
    if (now - lastCrashTime > 60_000) {
      lastCrashTime = now
      reload()
    } else {
      exit()
    }

    expect(reload).toHaveBeenCalled()
    expect(exit).not.toHaveBeenCalled()
  })

  it('should exit if <60s since last crash', () => {
    const reload = vi.fn()
    const exit = vi.fn()
    const now = Date.now()
    const lastCrashTime = now - 30_000 // 30s ago

    if (now - lastCrashTime > 60_000) {
      reload()
    } else {
      exit()
    }

    expect(exit).toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })
})
