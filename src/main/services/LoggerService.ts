import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { app } from 'electron'
import path from 'path'

export class LoggerService {
  private static instance: LoggerService
  private logger: winston.Logger

  private constructor() {
    const logDir = path.join(app.getPath('userData'), 'logs')
    const isDev = !app.isPackaged

    const level = process.env.ANGDU_LOGGER_MAIN_LEVEL || (isDev ? 'debug' : 'info')

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'angdu-studio' },
      transports: [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m',
          maxFiles: '30d'
        }),
        new DailyRotateFile({
          dirname: logDir,
          filename: 'app-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '10m',
          maxFiles: '60d'
        })
      ]
    })

    if (isDev) {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp(), winston.format.json())
        })
      )
    }
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  withContext(module: string, context?: Record<string, unknown>): LoggerService {
    const child = Object.create(this) as LoggerService
    child.logger = this.logger.child({ module, ...context })
    return child
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta)
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta)
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta)
  }

  verbose(message: string, meta?: Record<string, unknown>): void {
    this.logger.verbose(message, meta)
  }
}
