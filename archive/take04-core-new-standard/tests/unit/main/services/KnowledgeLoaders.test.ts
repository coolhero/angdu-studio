import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

// ── Module mocks (must be declared before any imports of the module under test) ──

vi.mock('../../../../src/main/logger', () => ({
  withContext: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }))
}))

// unpdf is only relevant for PDF paths — stub it so import succeeds
vi.mock('unpdf', () => ({
  extractText: vi.fn().mockResolvedValue({ text: 'pdf content' })
}))

// Sitemapper mock — replaced per-test via mockImplementation
const mockSitemapperFetch = vi.fn()
vi.mock('sitemapper', () => ({
  default: vi.fn().mockImplementation(() => ({
    fetch: mockSitemapperFetch
  }))
}))

// ── Helpers ──

function makeTempDir(): string {
  const dir = join(tmpdir(), `kl-test-${randomUUID()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

function writeTemp(dir: string, name: string, content: string): string {
  const filePath = join(dir, name)
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

// ── Tests ──

describe('KnowledgeLoaders', () => {
  let tempDir: string

  beforeEach(() => {
    vi.clearAllMocks()
    tempDir = makeTempDir()
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  // ── loadFile ──

  describe('loadFile', () => {
    it('reads a UTF-8 text file correctly', async () => {
      const { loadFile } = await import('../../../../src/main/services/KnowledgeLoaders')
      const filePath = writeTemp(tempDir, 'hello.txt', 'Hello, world!')
      const content = await loadFile(filePath)
      expect(content).toBe('Hello, world!')
    })

    it('handles an empty file', async () => {
      const { loadFile } = await import('../../../../src/main/services/KnowledgeLoaders')
      const filePath = writeTemp(tempDir, 'empty.txt', '')
      const content = await loadFile(filePath)
      expect(content).toBe('')
    })

    it('throws for a non-existent file', async () => {
      const { loadFile } = await import('../../../../src/main/services/KnowledgeLoaders')
      const missingPath = join(tempDir, 'does-not-exist.txt')
      await expect(loadFile(missingPath)).rejects.toThrow()
    })
  })

  // ── loadNote ──

  describe('loadNote', () => {
    it('returns the content as-is', async () => {
      const { loadNote } = await import('../../../../src/main/services/KnowledgeLoaders')
      const note = 'This is my note content.\nWith a second line.'
      expect(loadNote(note)).toBe(note)
    })

    it('returns an empty string unchanged', async () => {
      const { loadNote } = await import('../../../../src/main/services/KnowledgeLoaders')
      expect(loadNote('')).toBe('')
    })
  })

  // ── loadVideo / stripSrtTimestamps ──

  describe('loadVideo / stripSrtTimestamps', () => {
    const srtContent = [
      '1',
      '00:00:01,000 --> 00:00:04,000',
      'Hello, welcome to the video.',
      '',
      '2',
      '00:00:05,000 --> 00:00:08,500',
      'Today we cover testing.',
      '',
      '3',
      '00:00:09,000 --> 00:00:12,000',
      'Thanks for watching!',
      ''
    ].join('\n')

    it('strips SRT sequence numbers', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const srtPath = writeTemp(tempDir, 'sub.srt', srtContent)
      const result = await loadVideo(srtPath)
      // Pure digit lines (1, 2, 3) must not appear as standalone tokens
      expect(result).not.toMatch(/(?:^| )1(?= |$)/)
      expect(result).not.toMatch(/(?:^| )2(?= |$)/)
      expect(result).not.toMatch(/(?:^| )3(?= |$)/)
    })

    it('strips SRT timestamp lines', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const srtPath = writeTemp(tempDir, 'sub.srt', srtContent)
      const result = await loadVideo(srtPath)
      expect(result).not.toContain('-->')
      expect(result).not.toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('keeps subtitle text', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const srtPath = writeTemp(tempDir, 'sub.srt', srtContent)
      const result = await loadVideo(srtPath)
      expect(result).toContain('Hello, welcome to the video.')
      expect(result).toContain('Today we cover testing.')
      expect(result).toContain('Thanks for watching!')
    })

    it('joins subtitle lines with spaces', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const srtPath = writeTemp(tempDir, 'sub.srt', srtContent)
      const result = await loadVideo(srtPath)
      // Result should be a single line (no newlines from the SRT)
      expect(result).not.toContain('\n')
      expect(result).toBe(
        'Hello, welcome to the video. Today we cover testing. Thanks for watching!'
      )
    })

    it('handles SRT with period-style millisecond separator', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const webvttLike = [
        '1',
        '00:00:01.000 --> 00:00:04.000',
        'WebVTT style subtitle.',
        ''
      ].join('\n')
      const srtPath = writeTemp(tempDir, 'sub2.srt', webvttLike)
      const result = await loadVideo(srtPath)
      expect(result).toBe('WebVTT style subtitle.')
      expect(result).not.toContain('-->')
    })

    it('returns empty string for an SRT with no subtitle text', async () => {
      const { loadVideo } = await import('../../../../src/main/services/KnowledgeLoaders')
      const onlyTimestamps = ['1', '00:00:01,000 --> 00:00:02,000', ''].join('\n')
      const srtPath = writeTemp(tempDir, 'empty.srt', onlyTimestamps)
      const result = await loadVideo(srtPath)
      expect(result).toBe('')
    })
  })

  // ── extractTextFromHtml (via loadUrl mock) ──

  describe('extractTextFromHtml (via loadUrl)', () => {
    beforeEach(() => {
      // Reset the global fetch mock before each test
      vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    function mockFetchWith(html: string) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue(html)
      }))
    }

    it('removes script, style, and nav elements', async () => {
      const { loadUrl } = await import('../../../../src/main/services/KnowledgeLoaders')
      mockFetchWith(`
        <html>
          <body>
            <script>alert('xss')</script>
            <style>body { color: red; }</style>
            <nav>Home | About | Contact</nav>
            <article>Real content here that is long enough to pass the threshold and be selected by the extractor logic.</article>
          </body>
        </html>
      `)
      const result = await loadUrl('https://example.com')
      expect(result).not.toContain("alert('xss')")
      expect(result).not.toContain('color: red')
      expect(result).not.toContain('Home | About | Contact')
      expect(result).toContain('Real content here')
    })

    it('prefers article content over body', async () => {
      const { loadUrl } = await import('../../../../src/main/services/KnowledgeLoaders')
      const articleText = 'This is the article content. '.repeat(10)
      mockFetchWith(`
        <html>
          <body>
            <div>Body noise that should be ignored when article exists</div>
            <article>${articleText}</article>
          </body>
        </html>
      `)
      const result = await loadUrl('https://example.com')
      expect(result).toContain('This is the article content.')
    })

    it('falls back to body when no article is present', async () => {
      const { loadUrl } = await import('../../../../src/main/services/KnowledgeLoaders')
      mockFetchWith(`
        <html>
          <body>
            <p>Body fallback content without any article or main tag present at all in the document.</p>
          </body>
        </html>
      `)
      const result = await loadUrl('https://example.com')
      expect(result).toContain('Body fallback content')
    })

    it('throws when fetch returns a non-OK status', async () => {
      const { loadUrl } = await import('../../../../src/main/services/KnowledgeLoaders')
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: vi.fn().mockResolvedValue('')
      }))
      await expect(loadUrl('https://example.com/missing')).rejects.toThrow('404')
    })
  })

  // ── loadDirectory ──

  describe('loadDirectory', () => {
    it('discovers text files recursively', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')

      writeTemp(tempDir, 'root.txt', 'Root level file content.')
      const subDir = join(tempDir, 'sub')
      mkdirSync(subDir)
      writeTemp(subDir, 'nested.md', '# Nested markdown content')

      const results = await loadDirectory(tempDir)
      const paths = results.map((r) => r.filePath)

      expect(paths).toContain(join(tempDir, 'root.txt'))
      expect(paths).toContain(join(subDir, 'nested.md'))
    })

    it('skips hidden files and directories', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')

      writeTemp(tempDir, 'visible.txt', 'Visible content here.')
      writeTemp(tempDir, '.hidden.txt', 'Hidden file content.')
      const hiddenDir = join(tempDir, '.git')
      mkdirSync(hiddenDir)
      writeTemp(hiddenDir, 'config', 'git config content')

      const results = await loadDirectory(tempDir)
      const paths = results.map((r) => r.filePath)

      expect(paths).toContain(join(tempDir, 'visible.txt'))
      expect(paths).not.toContain(join(tempDir, '.hidden.txt'))
      expect(paths.every((p) => !p.includes('.git'))).toBe(true)
    })

    it('skips node_modules directories', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')

      writeTemp(tempDir, 'index.ts', 'export const x = 1')
      const nmDir = join(tempDir, 'node_modules', 'some-pkg')
      mkdirSync(nmDir, { recursive: true })
      writeTemp(nmDir, 'index.js', 'module.exports = {}')

      const results = await loadDirectory(tempDir)
      const paths = results.map((r) => r.filePath)

      expect(paths).toContain(join(tempDir, 'index.ts'))
      expect(paths.every((p) => !p.includes('node_modules'))).toBe(true)
    })

    it('only includes files with supported extensions', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')

      writeTemp(tempDir, 'doc.txt', 'Text file content.')
      writeTemp(tempDir, 'image.png', '\x89PNG\r\n\x1a\n')  // unsupported binary
      writeTemp(tempDir, 'archive.zip', 'PK\x03\x04')       // unsupported binary

      const results = await loadDirectory(tempDir)
      const paths = results.map((r) => r.filePath)

      expect(paths).toContain(join(tempDir, 'doc.txt'))
      expect(paths).not.toContain(join(tempDir, 'image.png'))
      expect(paths).not.toContain(join(tempDir, 'archive.zip'))
    })

    it('reports progress via the callback', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')

      writeTemp(tempDir, 'a.txt', 'File A content.')
      writeTemp(tempDir, 'b.txt', 'File B content.')
      writeTemp(tempDir, 'c.txt', 'File C content.')

      const progressValues: number[] = []
      await loadDirectory(tempDir, (pct) => progressValues.push(pct))

      expect(progressValues.length).toBe(3)
      // Progress must be monotonically non-decreasing and end at 100
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1])
      }
      expect(progressValues[progressValues.length - 1]).toBe(100)
    })

    it('returns empty array for an empty directory', async () => {
      const { loadDirectory } = await import('../../../../src/main/services/KnowledgeLoaders')
      const results = await loadDirectory(tempDir)
      expect(results).toEqual([])
    })
  })

  // ── loadSitemap ──

  describe('loadSitemap', () => {
    it('returns array of URLs from the sitemap', async () => {
      const urls = [
        'https://example.com/',
        'https://example.com/about',
        'https://example.com/blog/post-1'
      ]
      mockSitemapperFetch.mockResolvedValue({ sites: urls })

      const { loadSitemap } = await import('../../../../src/main/services/KnowledgeLoaders')
      const result = await loadSitemap('https://example.com/sitemap.xml')

      expect(result).toEqual(urls)
    })

    it('returns an empty array when sitemap has no URLs', async () => {
      mockSitemapperFetch.mockResolvedValue({ sites: [] })

      const { loadSitemap } = await import('../../../../src/main/services/KnowledgeLoaders')
      const result = await loadSitemap('https://example.com/sitemap.xml')

      expect(result).toEqual([])
    })

    it('passes the URL to Sitemapper', async () => {
      const Sitemapper = (await import('sitemapper')).default
      mockSitemapperFetch.mockResolvedValue({ sites: ['https://example.com/'] })

      const { loadSitemap } = await import('../../../../src/main/services/KnowledgeLoaders')
      await loadSitemap('https://example.com/sitemap.xml')

      expect(Sitemapper).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://example.com/sitemap.xml' })
      )
    })
  })
})
