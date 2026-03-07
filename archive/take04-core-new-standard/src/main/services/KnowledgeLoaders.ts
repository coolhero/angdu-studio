// KnowledgeLoaders — Document loaders for 6 knowledge item types (F004)

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { extractText } from 'unpdf'
import * as cheerio from 'cheerio'
import Sitemapper from 'sitemapper'
import { withContext } from '../logger'
import type { Model } from '@shared/types'

const log = withContext('knowledge:loaders')

// Supported text file extensions for directory scanning
const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.csv', '.log', '.json', '.xml', '.yaml', '.yml',
  '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs',
  '.c', '.cpp', '.h', '.css', '.html', '.sql', '.sh', '.bat',
  '.ini', '.cfg', '.conf', '.toml', '.env', '.gitignore',
  '.rb', '.php', '.swift', '.kt', '.scala', '.r', '.m',
  '.tex', '.rst', '.org', '.adoc'
])

// ── File Loader ──

export async function loadFile(filePath: string): Promise<string> {
  const ext = extname(filePath).toLowerCase()

  if (ext === '.pdf') {
    return loadPdf(filePath)
  }

  // Read text file — detect encoding with utf-8 default
  const buffer = readFileSync(filePath)

  // Simple BOM detection for utf-16
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le')
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    // UTF-16 BE — swap bytes and decode
    for (let i = 0; i < buffer.length - 1; i += 2) {
      const temp = buffer[i]
      buffer[i] = buffer[i + 1]
      buffer[i + 1] = temp
    }
    return buffer.toString('utf16le')
  }

  return buffer.toString('utf-8')
}

async function loadPdf(filePath: string): Promise<string> {
  const buffer = readFileSync(filePath)
  const uint8 = new Uint8Array(buffer)
  const { text } = await extractText(uint8)
  return text
}

// ── URL Loader ──

export async function loadUrl(url: string): Promise<string> {
  log.debug(`Fetching URL: ${url}`)
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CherryStudio/1.0; +https://cherry-ai.com)'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  return extractTextFromHtml(html)
}

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html)

  // Remove non-content elements
  $('script, style, nav, header, footer, noscript, iframe, svg, form').remove()
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()
  $('[aria-hidden="true"]').remove()

  // Prefer article content, fall back to main, then body
  let content = $('article').text()
  if (!content || content.trim().length < 100) {
    content = $('main').text()
  }
  if (!content || content.trim().length < 100) {
    content = $('body').text()
  }

  // Normalize whitespace
  return (content || '')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Sitemap Loader ──

export async function loadSitemap(url: string): Promise<string[]> {
  log.debug(`Loading sitemap: ${url}`)
  const sitemap = new Sitemapper({ url, timeout: 30000 })
  const { sites } = await sitemap.fetch()
  log.debug(`Sitemap returned ${sites.length} URLs`)
  return sites
}

// ── Note Loader ──

export function loadNote(content: string): string {
  return content
}

// ── Directory Loader ──

export async function loadDirectory(
  dirPath: string,
  onProgress?: (percent: number) => void
): Promise<{ filePath: string; content: string }[]> {
  log.debug(`Loading directory: ${dirPath}`)
  const files = discoverFiles(dirPath)
  const results: { filePath: string; content: string }[] = []
  let processed = 0

  for (const filePath of files) {
    try {
      const content = await loadFile(filePath)
      if (content.trim()) {
        results.push({ filePath, content })
      }
    } catch (err) {
      log.warn(`Skipping file ${filePath}: ${(err as Error).message}`)
    }

    processed++
    if (onProgress) {
      onProgress(Math.round((processed / files.length) * 100))
    }
  }

  log.debug(`Directory loaded: ${results.length}/${files.length} files`)
  return results
}

function discoverFiles(dirPath: string): string[] {
  const results: string[] = []

  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      // Skip hidden files and common non-content directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue
      }

      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (TEXT_EXTENSIONS.has(ext) || ext === '.pdf') {
          results.push(fullPath)
        }
      }
    }
  }

  walk(dirPath)
  return results
}

// ── Video (SRT Transcript) Loader ──

export async function loadVideo(srtPath: string): Promise<string> {
  const raw = readFileSync(srtPath, 'utf-8')
  return stripSrtTimestamps(raw)
}

function stripSrtTimestamps(srt: string): string {
  // SRT format:
  // 1
  // 00:00:01,000 --> 00:00:04,000
  // This is the subtitle text
  //
  // Remove sequence numbers, timestamps, and blank lines — keep only text
  const lines = srt.split('\n')
  const textLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip blank lines
    if (!trimmed) continue
    // Skip sequence numbers (pure digits)
    if (/^\d+$/.test(trimmed)) continue
    // Skip timestamp lines (e.g., 00:00:01,000 --> 00:00:04,000)
    if (/^\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->/.test(trimmed)) continue
    // Keep actual subtitle text
    textLines.push(trimmed)
  }

  return textLines.join(' ')
}

// ── PDF Preprocessing (AI-based) — Placeholder ──

const _pdfCache = new Map<string, string>()

export async function preprocessPdf(
  filePath: string,
  _model: Model,
  _provider: string
): Promise<string> {
  // File-hash-based caching
  const { createHash } = await import('crypto')
  const buffer = readFileSync(filePath)
  const hash = createHash('sha256').update(buffer).digest('hex')

  const cached = _pdfCache.get(hash)
  if (cached) {
    return cached
  }

  // TODO: Implement AI-based preprocessing
  // For now, fall back to standard PDF extraction
  const text = await loadPdf(filePath)
  _pdfCache.set(hash, text)
  return text
}
