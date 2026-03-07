import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LOG_MAX_SIZE, LOG_MAX_FILES_GENERAL, LOG_MAX_FILES_ERROR } from '@shared/constants'

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    add: vi.fn()
  }
}))

vi.mock('winston', () => ({
  createLogger: vi.fn().mockReturnValue(mockLogger),
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    printf: vi.fn().mockReturnValue({}),
    colorize: vi.fn(),
    json: vi.fn(),
    errors: vi.fn()
  },
  transports: {
    Console: vi.fn()
  }
}))

vi.mock('winston-daily-rotate-file', () => ({
  default: vi.fn()
}))

import { LoggerService } from '../LoggerService'

describe('LoggerService', () => {
  let loggerService: LoggerService

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogger.info.mockClear()
    mockLogger.warn.mockClear()
    mockLogger.error.mockClear()
    mockLogger.debug.mockClear()
    mockLogger.verbose.mockClear()
    mockLogger.add.mockClear()
    loggerService = new LoggerService('/mock/logs')
  })

  it('should create a logger instance', () => {
    expect(loggerService).toBeDefined()
  })

  it('should log info messages', () => {
    loggerService.info('test message')
    expect(mockLogger.info).toHaveBeenCalledWith('test message', undefined)
  })

  it('should log error messages', () => {
    loggerService.error('error message')
    expect(mockLogger.error).toHaveBeenCalledWith('error message', undefined)
  })

  it('should create context-scoped logger', () => {
    const scoped = loggerService.withContext('TestModule')
    expect(scoped).toBeDefined()
    scoped.info('scoped message')
    expect(mockLogger.info).toHaveBeenCalledWith('scoped message', expect.objectContaining({ module: 'TestModule' }))
  })

  it('should use correct log rotation config', () => {
    expect(LOG_MAX_SIZE).toBe('10m')
    expect(LOG_MAX_FILES_GENERAL).toBe('30d')
    expect(LOG_MAX_FILES_ERROR).toBe('60d')
  })
})
