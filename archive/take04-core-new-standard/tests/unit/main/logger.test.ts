import { describe, it, expect, vi } from 'vitest'

vi.mock('winston', () => {
  const formatFn = vi.fn(() => vi.fn(() => ({})))
  const format = Object.assign(formatFn, {
    combine: vi.fn(() => ({})),
    timestamp: vi.fn(() => ({})),
    printf: vi.fn(() => ({})),
    colorize: vi.fn(() => ({}))
  })
  return {
    format,
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(function (this: any) { return this }),
      add: vi.fn()
    })),
    transports: { Console: vi.fn() }
  }
})

vi.mock('winston-daily-rotate-file', () => ({
  default: vi.fn()
}))

vi.mock('../../../src/main/bootstrap', () => ({
  logsDir: '/tmp/logs'
}))

describe('Logger', () => {
  it('should export withContext function', async () => {
    const { withContext } = await import('../../../src/main/logger')
    expect(typeof withContext).toBe('function')
  })

  it('should create scoped logger via withContext', async () => {
    const { withContext } = await import('../../../src/main/logger')
    const log = withContext('test-module')
    expect(log).toBeDefined()
    expect(typeof log.info).toBe('function')
    expect(typeof log.error).toBe('function')
  })
})
