import log from 'electron-log'

export type LogLevel = 'silly' | 'debug' | 'info' | 'warn' | 'error'

export interface ScopedLogger {
  silly: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

/**
 * Wraps electron-log with daily rotation, configurable log levels,
 * and module-scoped loggers.
 *
 * Log levels are configurable via environment variables:
 *   - CSLOGGER_MAIN_LEVEL: log level for the main process
 *   - CSLOGGER_RENDERER_LEVEL: log level for the renderer process
 */
export class LoggerService {
  private mainLevel: LogLevel
  private rendererLevel: LogLevel

  constructor() {
    this.mainLevel = (process.env.CSLOGGER_MAIN_LEVEL as LogLevel) || 'info'
    this.rendererLevel = (process.env.CSLOGGER_RENDERER_LEVEL as LogLevel) || 'warn'

    this.configure()
  }

  private configure(): void {
    // Configure daily rotation
    log.transports.file.maxSize = 10 * 1024 * 1024 // 10 MB
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}'
    log.transports.file.level = this.mainLevel

    // Console transport
    log.transports.console.level = this.mainLevel
    log.transports.console.format = '[{h}:{i}:{s}] [{level}] {text}'

    // Route console.log to logger
    Object.assign(console, log.functions)
  }

  /** Returns the configured main process log level */
  getMainLevel(): LogLevel {
    return this.mainLevel
  }

  /** Returns the configured renderer log level */
  getRendererLevel(): LogLevel {
    return this.rendererLevel
  }

  /**
   * Creates a scoped logger that prefixes all messages with [moduleName].
   */
  createLogger(moduleName: string): ScopedLogger {
    const scope = log.scope(moduleName)
    return {
      silly: (...args: unknown[]) => scope.silly(...args),
      debug: (...args: unknown[]) => scope.debug(...args),
      info: (...args: unknown[]) => scope.info(...args),
      warn: (...args: unknown[]) => scope.warn(...args),
      error: (...args: unknown[]) => scope.error(...args)
    }
  }

  /** Direct log methods on the main logger */
  silly(...args: unknown[]): void {
    log.silly(...args)
  }

  debug(...args: unknown[]): void {
    log.debug(...args)
  }

  info(...args: unknown[]): void {
    log.info(...args)
  }

  warn(...args: unknown[]): void {
    log.warn(...args)
  }

  error(...args: unknown[]): void {
    log.error(...args)
  }
}
