import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { logger } from '../services/LoggerService'

const SUPPORTED_TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.csv', '.json', '.xml', '.yaml', '.yml', '.log'])

/**
 * Load text content from a plain text file (.txt, .md, etc.).
 * Throws if the file extension is not supported.
 */
export function loadFile(filePath: string): string {
  const ext = extname(filePath).toLowerCase()

  if (!SUPPORTED_TEXT_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported file extension: ${ext}. Supported: ${[...SUPPORTED_TEXT_EXTENSIONS].join(', ')}`)
  }

  const content = readFileSync(filePath, 'utf-8')
  logger.info(`[FileLoader] Loaded ${filePath} (${content.length} chars)`)
  return content
}
