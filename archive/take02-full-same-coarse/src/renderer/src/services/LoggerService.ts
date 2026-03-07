type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const configuredLevel: LogLevel =
  (typeof process !== 'undefined' && (process.env?.CSLOGGER_RENDERER_LEVEL as LogLevel)) || 'info'

class LoggerService {
  private context: string

  constructor(context = 'Renderer') {
    this.context = context
  }

  withContext(context: string): LoggerService {
    return new LoggerService(context)
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel]
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `${timestamp} ${level.toUpperCase()} [${this.context}] ${message}`
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }
}

export const loggerService = new LoggerService()
export default loggerService
