import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { logsDir } from './bootstrap'

const logLevel = process.env.CSLOGGER_MAIN_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
const showModules = process.env.CSLOGGER_MAIN_SHOW_MODULES?.split(',')

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.printf(({ timestamp, level, module, message }) => {
    const mod = module ? `[${module}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${mod} ${message}`
  })
)

const moduleFilter = format((info) => {
  if (showModules && info.module && !showModules.includes(info.module as string)) {
    return false
  }
  return info
})

const logger = createLogger({
  level: logLevel,
  format: format.combine(moduleFilter(), logFormat),
  transports: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '10m',
      maxFiles: '60d'
    })
  ]
})

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    })
  )
}

export function withContext(module: string) {
  return logger.child({ module })
}

export default logger
