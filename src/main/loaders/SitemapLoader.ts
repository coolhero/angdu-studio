import { loadUrl } from './UrlLoader'
import { logger } from '../services/LoggerService'

/**
 * Parse a sitemap XML and extract text content from each URL found.
 */
export async function loadSitemap(sitemapUrl: string): Promise<string[]> {
  const xml = await fetchSitemapXml(sitemapUrl)
  const urls = extractUrlsFromSitemap(xml)

  logger.info(`[SitemapLoader] Found ${urls.length} URLs in sitemap ${sitemapUrl}`)

  const results: string[] = []

  for (const url of urls) {
    try {
      const text = await loadUrl(url)
      if (text.length > 0) {
        results.push(text)
      }
    } catch (err) {
      logger.warn(`[SitemapLoader] Failed to load URL ${url}:`, err)
    }
  }

  logger.info(`[SitemapLoader] Successfully loaded ${results.length}/${urls.length} URLs`)
  return results
}

async function fetchSitemapXml(url: string): Promise<string> {
  // Reuse UrlLoader's fetch but we need the raw HTML/XML
  // loadUrl strips HTML, so we fetch directly here
  const { net } = await import('electron')

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
 * Extract <loc> URLs from sitemap XML.
 */
function extractUrlsFromSitemap(xml: string): string[] {
  const urls: string[] = []
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi
  let match: RegExpExecArray | null

  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim()
    if (url) {
      urls.push(url)
    }
  }

  return urls
}
