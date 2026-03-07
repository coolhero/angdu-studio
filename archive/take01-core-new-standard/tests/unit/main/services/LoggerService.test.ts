import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockLog, mockScope } = vi.hoisted(() => {
  const mockScope = {
    silly: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
  const mockLog = {
    silly: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    scope: vi.fn().mockReturnValue(mockScope),
    functions: {},
    transports: {
      file: {
        maxSize: 0,
        format: '',
        level: 'info' as string
      },
      console: {
        level: 'info' as string,
        format: ''
      }
    }
  }
  return { mockLog, mockScope }
})

vi.mock('electron-log', () => ({
  default: mockLog
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    getVersion: vi.fn().mockReturnValue('0.1.0')
  }
}))

import { LoggerService } from '@main/services/LoggerService'

describe('LoggerService', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('uses default log levels when env vars are not set', () => {
      delete process.env.CSLOGGER_MAIN_LEVEL
      delete process.env.CSLOGGER_RENDERER_LEVEL

      const logger = new LoggerService()
      expect(logger.getMainLevel()).toBe('info')
      expect(logger.getRendererLevel()).toBe('warn')
    })

    it('reads log levels from environment variables', () => {
      process.env.CSLOGGER_MAIN_LEVEL = 'debug'
      process.env.CSLOGGER_RENDERER_LEVEL = 'error'

      const logger = new LoggerService()
      expect(logger.getMainLevel()).toBe('debug')
      expect(logger.getRendererLevel()).toBe('error')
    })

    it('configures file transport with daily rotation settings', () => {
      new LoggerService()
      expect(mockLog.transports.file.maxSize).toBe(10 * 1024 * 1024)
      expect(mockLog.transports.file.format).toContain('{level}')
    })
  })

  describe('log methods', () => {
    it('calls electron-log silly', () => {
      const logger = new LoggerService()
      logger.silly('test message')
      expect(mockLog.silly).toHaveBeenCalledWith('test message')
    })

    it('calls electron-log debug', () => {
      const logger = new LoggerService()
      logger.debug('debug message')
      expect(mockLog.debug).toHaveBeenCalledWith('debug message')
    })

    it('calls electron-log info', () => {
      const logger = new LoggerService()
      logger.info('info message')
      expect(mockLog.info).toHaveBeenCalledWith('info message')
    })

    it('calls electron-log warn', () => {
      const logger = new LoggerService()
      logger.warn('warn message')
      expect(mockLog.warn).toHaveBeenCalledWith('warn message')
    })

    it('calls electron-log error', () => {
      const logger = new LoggerService()
      logger.error('error message')
      expect(mockLog.error).toHaveBeenCalledWith('error message')
    })
  })

  describe('module scoping', () => {
    it('creates a scoped logger with the given module name', () => {
      const logger = new LoggerService()
      const scoped = logger.createLogger('TestModule')

      expect(mockLog.scope).toHaveBeenCalledWith('TestModule')
      expect(scoped).toBeDefined()
      expect(typeof scoped.info).toBe('function')
    })

    it('scoped logger calls scope methods', () => {
      const logger = new LoggerService()
      const scoped = logger.createLogger('TestModule')

      scoped.info('scoped info')
      expect(mockScope.info).toHaveBeenCalledWith('scoped info')

      scoped.error('scoped error')
      expect(mockScope.error).toHaveBeenCalledWith('scoped error')
    })

    it('creates different scopes for different modules', () => {
      const logger = new LoggerService()
      logger.createLogger('Module1')
      logger.createLogger('Module2')

      expect(mockLog.scope).toHaveBeenCalledWith('Module1')
      expect(mockLog.scope).toHaveBeenCalledWith('Module2')
    })
  })
})
