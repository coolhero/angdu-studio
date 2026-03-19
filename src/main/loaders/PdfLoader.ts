import { readFileSync } from 'node:fs'
import pdfParse from 'pdf-parse'
import { logger } from '../services/LoggerService'

/**
 * Extract text content from a PDF file.
 */
export async function loadPdf(filePath: string): Promise<string> {
  const buffer = readFileSync(filePath)
  const data = await pdfParse(buffer)
  logger.info(`[PdfLoader] Loaded ${filePath} (${data.numpages} pages, ${data.text.length} chars)`)
  return data.text
}
