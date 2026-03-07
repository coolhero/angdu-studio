import path from 'node:path'
import { isDev } from '@main/constant'
import { app } from 'electron'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logDir = path.join(app.getPath('userData'), 'logs')

const logLevel = process.env.CSLOGGER_MAIN_LEVEL || (isDev ? 'debug' : 'info')

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
      const ctx = context ? `[${context}]` : ''
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp} ${level.toUpperCase()} ${ctx} ${message}${metaStr}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'cherry-studio-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})

class LoggerService {
  private context: string

  constructor(context = 'Main') {
    this.context = context
  }

  withContext(context: string): LoggerService {
    return new LoggerService(context)
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, { context: this.context, ...meta })
  }

  info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, { context: this.context, ...meta })
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, { context: this.context, ...meta })
  }

  error(message: string, meta?: Record<string, unknown>): void {
    logger.error(message, { context: this.context, ...meta })
  }

  getLogDir(): string {
    return logDir
  }
}

export const loggerService = new LoggerService()
export default loggerService
