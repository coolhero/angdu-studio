import { readFileSync } from 'node:fs'
import mammoth from 'mammoth'
import { logger } from '../services/LoggerService'

/**
 * Extract text content from a DOCX file.
 */
export async function loadDocx(filePath: string): Promise<string> {
  const buffer = readFileSync(filePath)
  const result = await mammoth.extractRawText({ buffer })

  if (result.messages.length > 0) {
    logger.warn(`[DocxLoader] Warnings for ${filePath}:`, result.messages)
  }

  logger.info(`[DocxLoader] Loaded ${filePath} (${result.value.length} chars)`)
  return result.value
}
