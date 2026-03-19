import { net } from 'electron'
import { logger } from '../services/LoggerService'

/**
 * Fetch a URL and extract text content by stripping HTML tags.
 */
export async function loadUrl(url: string): Promise<string> {
  const html = await fetchUrl(url)
  const text = stripHtml(html)
  logger.info(`[UrlLoader] Loaded ${url} (${text.length} chars)`)
  return text
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request(url)

    request.on('response', (response) => {
      const chunks: string[] = []

      response.on('data', (chunk: Buffer) => {
        chunks.push(chunk.toString('utf-8'))
      })

      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        } else {
          resolve(chunks.join(''))
        }
      })

      response.on('error', (err: Error) => {
        reject(err)
      })
    })

    request.on('error', (err: Error) => {
      reject(err)
    })

    request.end()
  })
}

/**
 * Basic HTML to text conversion: strip tags, decode common entities, collapse whitespace.
 */
function stripHtml(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}
