import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/angdu-test-logs'),
    isPackaged: false
  }
}))

vi.mock('winston', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    child: vi.fn(),
    add: vi.fn()
  }
  mockLogger.child.mockReturnValue(mockLogger)
  return {
    default: {
      createLogger: vi.fn(() => mockLogger),
      format: {
        combine: vi.fn(),
        timestamp: vi.fn(),
        json: vi.fn(),
        printf: vi.fn(),
        errors: vi.fn()
      },
      transports: {
        Console: vi.fn(),
        File: vi.fn()
      }
    }
  }
})

vi.mock('winston-daily-rotate-file', () => ({
  default: vi.fn()
}))

describe('LoggerService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should create a singleton instance', async () => {
    const { LoggerService } = await import('../../../src/main/services/LoggerService')
    const a = LoggerService.getInstance()
    const b = LoggerService.getInstance()
    expect(a).toBe(b)
  })

  it('should create a child logger with module context', async () => {
    const { LoggerService } = await import('../../../src/main/services/LoggerService')
    const logger = LoggerService.getInstance()
    const child = logger.withContext('TestModule')
    expect(child).toBeDefined()
  })

  it('should expose standard log level methods', async () => {
    const { LoggerService } = await import('../../../src/main/services/LoggerService')
    const logger = LoggerService.getInstance()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })
})
