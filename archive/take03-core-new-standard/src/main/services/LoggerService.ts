import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { LOG_MAX_SIZE, LOG_MAX_FILES_GENERAL, LOG_MAX_FILES_ERROR } from '@shared/constants'
import type { LogEntry } from '@shared/types'

const { combine, timestamp, printf, colorize, errors } = format

const logFormat = printf(({ level, message, timestamp: ts, module: mod, ...meta }) => {
  const moduleStr = mod ? `[${mod}]` : ''
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  return `${ts} ${level} ${moduleStr} ${message}${metaStr}`
})

export class LoggerService {
  private logger: ReturnType<typeof createLogger>

  constructor(logsPath: string) {
    const level = process.env.CSLOGGER_MAIN_LEVEL ?? 'info'

    this.logger = createLogger({
      level,
      format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        logFormat
      ),
      transports: [
        // General daily rotation
        new DailyRotateFile({
          dirname: logsPath,
          filename: 'main-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: LOG_MAX_SIZE,
          maxFiles: LOG_MAX_FILES_GENERAL
        }),
        // Error-specific rotation with longer retention
        new DailyRotateFile({
          dirname: logsPath,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: LOG_MAX_SIZE,
          maxFiles: LOG_MAX_FILES_ERROR
        })
      ]
    })

    // Console transport in dev
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: combine(colorize(), logFormat)
        })
      )
    }
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

  // Renderer→main log forwarding (FR-014)
  logFromRenderer(entry: LogEntry): void {
    const method = this.logger[entry.level] ?? this.logger.info
    method.call(this.logger, entry.message, {
      module: entry.module,
      source: 'renderer',
      ...(entry.context ?? {})
    })
  }

  withContext(module: string): ContextLogger {
    return new ContextLogger(this, module)
  }
}

class ContextLogger {
  constructor(
    private parent: LoggerService,
    private module: string
  ) {}

  info(message: string, meta?: Record<string, unknown>): void {
    this.parent.info(message, { module: this.module, ...meta })
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.parent.warn(message, { module: this.module, ...meta })
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.parent.error(message, { module: this.module, ...meta })
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.parent.debug(message, { module: this.module, ...meta })
  }
}
