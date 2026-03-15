import log from 'electron-log'
import { app } from 'electron'
import path from 'path'

class LoggerService {
  private static instance: LoggerService | null = null

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  initialize(): void {
    log.transports.file.resolvePathFn = () =>
      path.join(app.getPath('logs'), 'angdu-studio.log')
    log.transports.file.maxSize = 10 * 1024 * 1024 // 10MB
    log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}'
    log.info('[LoggerService] Initialized')
  }

  info(message: string, ...args: unknown[]): void {
    log.info(message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    log.warn(message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    log.error(message, ...args)
  }

  debug(message: string, ...args: unknown[]): void {
    log.debug(message, ...args)
  }
}

export const logger = LoggerService.getInstance()
