// Tests for BlockRenderUtils (T056)

import { describe, it, expect } from 'vitest'
import {
  getMainTextContent,
  getThinkingContent,
  getCodeContent,
  getToolInfo,
  getCitationRefs,
  getErrorContent,
  getImageInfo,
  getFileInfo,
  getTranslationContent,
  getVideoInfo,
  getCompactContent,
  getBlockContent
} from '../../../../src/renderer/src/services/BlockRenderUtils'
import type {
  MainTextBlock,
  ThinkingBlock,
  CodeBlock,
  ToolBlock,
  CitationBlock,
  ErrorBlock,
  ImageBlock,
  FileBlock,
  TranslationBlock,
  VideoBlock,
  CompactBlock,
  UnknownBlock,
  MessageBlock
} from '@shared/types'
import type { FileMetadata } from '@shared/types'
import { FileType } from '@shared/types'
import type { KnowledgeReference } from '@shared/types'

// ── Shared base factory ──

function makeBase(type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: 'block-1',
    messageId: 'msg-1',
    type,
    status: 'success' as const,
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

// ── Block factories ──

function makeMainTextBlock(overrides: Partial<MainTextBlock> = {}): MainTextBlock {
  return {
    ...makeBase('main_text'),
    type: 'main_text',
    content: 'Hello world',
    ...overrides
  }
}

function makeThinkingBlock(overrides: Partial<ThinkingBlock> = {}): ThinkingBlock {
  return {
    ...makeBase('thinking'),
    type: 'thinking',
    content: 'Reasoning here',
    ...overrides
  }
}

function makeCodeBlock(overrides: Partial<CodeBlock> = {}): CodeBlock {
  return {
    ...makeBase('code'),
    type: 'code',
    content: 'const x = 1',
    ...overrides
  }
}

function makeToolBlock(overrides: Partial<ToolBlock> = {}): ToolBlock {
  return {
    ...makeBase('tool'),
    type: 'tool',
    ...overrides
  }
}

function makeCitationBlock(overrides: Partial<CitationBlock> = {}): CitationBlock {
  return {
    ...makeBase('citation'),
    type: 'citation',
    ...overrides
  }
}

function makeErrorBlock(overrides: Partial<ErrorBlock> = {}): ErrorBlock {
  return {
    ...makeBase('error'),
    type: 'error',
    error: 'Something went wrong',
    ...overrides
  }
}

function makeFileMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
  return {
    id: 'file-1',
    name: 'document.pdf',
    origin_name: 'document.pdf',
    path: '/tmp/document.pdf',
    size: 1024,
    ext: 'pdf',
    type: FileType.Document,
    created_at: Date.now(),
    ...overrides
  }
}

function makeImageBlock(overrides: Partial<ImageBlock> = {}): ImageBlock {
  return {
    ...makeBase('image'),
    type: 'image',
    ...overrides
  }
}

function makeFileBlock(overrides: Partial<FileBlock> = {}): FileBlock {
  return {
    ...makeBase('file'),
    type: 'file',
    ...overrides
  }
}

function makeTranslationBlock(overrides: Partial<TranslationBlock> = {}): TranslationBlock {
  return {
    ...makeBase('translation'),
    type: 'translation',
    content: 'Translated text',
    ...overrides
  }
}

function makeVideoBlock(overrides: Partial<VideoBlock> = {}): VideoBlock {
  return {
    ...makeBase('video'),
    type: 'video',
    ...overrides
  }
}

function makeCompactBlock(overrides: Partial<CompactBlock> = {}): CompactBlock {
  return {
    ...makeBase('compact'),
    type: 'compact',
    content: 'Summary of conversation',
    ...overrides
  }
}

function makeUnknownBlock(overrides: Partial<UnknownBlock> = {}): UnknownBlock {
  return {
    ...makeBase('unknown'),
    type: 'unknown',
    content: 'unknown block content',
    ...overrides
  }
}

function makeKnowledgeReference(overrides: Partial<KnowledgeReference> = {}): KnowledgeReference {
  return {
    id: 'kr-1',
    content: 'Knowledge content',
    ...overrides
  }
}

// ── Tests ──

describe('getMainTextContent', () => {
  it('returns the content string', () => {
    const block = makeMainTextBlock({ content: 'Hello, world!' })
    expect(getMainTextContent(block)).toBe('Hello, world!')
  })

  it('returns an empty string when content is empty', () => {
    const block = makeMainTextBlock({ content: '' })
    expect(getMainTextContent(block)).toBe('')
  })

  it('returns content with newlines intact', () => {
    const block = makeMainTextBlock({ content: 'Line one\nLine two\nLine three' })
    expect(getMainTextContent(block)).toBe('Line one\nLine two\nLine three')
  })

  it('returns content with markdown formatting', () => {
    const block = makeMainTextBlock({ content: '**bold** _italic_ `code`' })
    expect(getMainTextContent(block)).toBe('**bold** _italic_ `code`')
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getThinkingContent', () => {
  it('returns content and duration when thinking_millsec is set', () => {
    const block = makeThinkingBlock({ content: 'Step by step reasoning', thinking_millsec: 3200 })
    const result = getThinkingContent(block)
    expect(result.content).toBe('Step by step reasoning')
    expect(result.duration).toBe(3200)
  })

  it('returns content with duration undefined when thinking_millsec is absent', () => {
    const block = makeThinkingBlock({ content: 'Quick thought' })
    const result = getThinkingContent(block)
    expect(result.content).toBe('Quick thought')
    expect(result.duration).toBeUndefined()
  })

  it('returns content with duration undefined when thinking_millsec is explicitly undefined', () => {
    const block = makeThinkingBlock({ content: 'Thought', thinking_millsec: undefined })
    const result = getThinkingContent(block)
    expect(result.duration).toBeUndefined()
  })

  it('returns zero duration correctly', () => {
    const block = makeThinkingBlock({ content: 'Instant', thinking_millsec: 0 })
    const result = getThinkingContent(block)
    expect(result.duration).toBe(0)
  })

  it('returns large duration values correctly', () => {
    const block = makeThinkingBlock({ content: 'Deep thought', thinking_millsec: 120000 })
    expect(getThinkingContent(block).duration).toBe(120000)
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getCodeContent', () => {
  it('returns content and language when both are set', () => {
    const block = makeCodeBlock({ content: 'console.log("hi")', language: 'javascript' })
    const result = getCodeContent(block)
    expect(result.content).toBe('console.log("hi")')
    expect(result.language).toBe('javascript')
  })

  it('returns content with language undefined when language is absent', () => {
    const block = makeCodeBlock({ content: 'SELECT * FROM users' })
    const result = getCodeContent(block)
    expect(result.content).toBe('SELECT * FROM users')
    expect(result.language).toBeUndefined()
  })

  it('returns content with language undefined when language is explicitly undefined', () => {
    const block = makeCodeBlock({ content: 'some code', language: undefined })
    expect(getCodeContent(block).language).toBeUndefined()
  })

  it('returns empty string content', () => {
    const block = makeCodeBlock({ content: '' })
    expect(getCodeContent(block).content).toBe('')
  })

  it('handles various language values', () => {
    for (const lang of ['python', 'typescript', 'rust', 'sql', 'bash']) {
      const block = makeCodeBlock({ language: lang })
      expect(getCodeContent(block).language).toBe(lang)
    }
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getToolInfo', () => {
  it('returns toolName, arguments and response when all are set', () => {
    const response = { result: 'ok', data: [1, 2, 3] }
    const block = makeToolBlock({
      toolName: 'web_search',
      arguments: '{"query":"vitest"}',
      rawMcpToolResponse: response
    })
    const result = getToolInfo(block)
    expect(result.toolName).toBe('web_search')
    expect(result.arguments).toBe('{"query":"vitest"}')
    expect(result.response).toEqual(response)
  })

  it('returns undefined for all fields when block has no optional fields', () => {
    const block = makeToolBlock()
    const result = getToolInfo(block)
    expect(result.toolName).toBeUndefined()
    expect(result.arguments).toBeUndefined()
    expect(result.response).toBeUndefined()
  })

  it('returns only toolName when arguments and response are absent', () => {
    const block = makeToolBlock({ toolName: 'calculator' })
    const result = getToolInfo(block)
    expect(result.toolName).toBe('calculator')
    expect(result.arguments).toBeUndefined()
    expect(result.response).toBeUndefined()
  })

  it('accepts null rawMcpToolResponse', () => {
    const block = makeToolBlock({ rawMcpToolResponse: null })
    expect(getToolInfo(block).response).toBeNull()
  })

  it('accepts complex nested rawMcpToolResponse object', () => {
    const complex = { nested: { deep: { value: 42 } }, list: ['a', 'b'] }
    const block = makeToolBlock({ rawMcpToolResponse: complex })
    expect(getToolInfo(block).response).toEqual(complex)
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getCitationRefs', () => {
  describe('empty inputs', () => {
    it('returns empty array when block has no citation sources', () => {
      const block = makeCitationBlock()
      expect(getCitationRefs(block)).toEqual([])
    })

    it('returns empty array when webSearchResults has empty results array', () => {
      const block = makeCitationBlock({ webSearchResults: { results: [] } })
      expect(getCitationRefs(block)).toEqual([])
    })

    it('returns empty array when all arrays are empty', () => {
      const block = makeCitationBlock({
        webSearchResults: { results: [] },
        knowledgeReferences: [],
        memoryReferences: []
      })
      expect(getCitationRefs(block)).toEqual([])
    })
  })

  describe('webSearchResults merging', () => {
    it('returns refs from webSearchResults with sequential 1-based indices', () => {
      const block = makeCitationBlock({
        webSearchResults: {
          results: [
            { url: 'https://example.com', title: 'Example', content: 'Content A' },
            { url: 'https://other.com', title: 'Other', content: 'Content B' }
          ]
        }
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(2)
      expect(refs[0]).toEqual({ url: 'https://example.com', title: 'Example', content: 'Content A', index: 1 })
      expect(refs[1]).toEqual({ url: 'https://other.com', title: 'Other', content: 'Content B', index: 2 })
    })

    it('deduplicates webSearchResults by URL — keeps first occurrence', () => {
      const block = makeCitationBlock({
        webSearchResults: {
          results: [
            { url: 'https://example.com', title: 'First', content: 'Content A' },
            { url: 'https://example.com', title: 'Duplicate', content: 'Content B' },
            { url: 'https://other.com', title: 'Other', content: 'Content C' }
          ]
        }
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(2)
      expect(refs[0].url).toBe('https://example.com')
      expect(refs[0].title).toBe('First')
      expect(refs[1].url).toBe('https://other.com')
    })

    it('includes result without content field', () => {
      const block = makeCitationBlock({
        webSearchResults: {
          results: [{ url: 'https://example.com', title: 'No Content' }]
        }
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].title).toBe('No Content')
      expect(refs[0].content).toBeUndefined()
    })
  })

  describe('knowledgeReferences merging', () => {
    it('returns refs from knowledgeReferences using sourceUrl as key when present', () => {
      const block = makeCitationBlock({
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: 'https://docs.example.com', content: 'Doc content' })
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0]).toEqual({
        url: 'https://docs.example.com',
        content: 'Doc content',
        index: 1
      })
    })

    it('uses id as key and url when sourceUrl is absent', () => {
      const block = makeCitationBlock({
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-42', content: 'Local knowledge', sourceUrl: undefined })
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].url).toBe('kr-42')
      expect(refs[0].content).toBe('Local knowledge')
    })

    it('deduplicates knowledgeReferences by sourceUrl', () => {
      const block = makeCitationBlock({
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: 'https://docs.example.com', content: 'First' }),
          makeKnowledgeReference({ id: 'kr-2', sourceUrl: 'https://docs.example.com', content: 'Duplicate' })
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].content).toBe('First')
    })

    it('deduplicates knowledgeReferences by id when no sourceUrl', () => {
      const block = makeCitationBlock({
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', content: 'First', sourceUrl: undefined }),
          makeKnowledgeReference({ id: 'kr-1', content: 'Duplicate', sourceUrl: undefined })
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].content).toBe('First')
    })
  })

  describe('memoryReferences merging', () => {
    it('returns refs from memoryReferences using id as key and url', () => {
      const block = makeCitationBlock({
        memoryReferences: [
          { id: 'mem-1', content: 'Memory content', score: 0.95 }
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0]).toEqual({ url: 'mem-1', content: 'Memory content', index: 1 })
    })

    it('deduplicates memoryReferences by id', () => {
      const block = makeCitationBlock({
        memoryReferences: [
          { id: 'mem-1', content: 'First' },
          { id: 'mem-1', content: 'Duplicate' },
          { id: 'mem-2', content: 'Second' }
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(2)
      expect(refs[0].content).toBe('First')
      expect(refs[1].content).toBe('Second')
    })
  })

  describe('cross-source merging and deduplication', () => {
    it('merges refs from all three sources in order: web → knowledge → memory', () => {
      const block = makeCitationBlock({
        webSearchResults: {
          results: [{ url: 'https://web.com', title: 'Web result', content: 'Web content' }]
        },
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: 'https://kb.example.com', content: 'KB content' })
        ],
        memoryReferences: [{ id: 'mem-1', content: 'Memory content' }]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(3)
      expect(refs[0].url).toBe('https://web.com')
      expect(refs[1].url).toBe('https://kb.example.com')
      expect(refs[2].url).toBe('mem-1')
    })

    it('assigns sequential 1-based indices across all sources', () => {
      const block = makeCitationBlock({
        webSearchResults: {
          results: [
            { url: 'https://a.com', title: 'A' },
            { url: 'https://b.com', title: 'B' }
          ]
        },
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: 'https://c.com', content: 'C' })
        ],
        memoryReferences: [{ id: 'mem-1', content: 'D' }]
      })
      const refs = getCitationRefs(block)
      expect(refs[0].index).toBe(1)
      expect(refs[1].index).toBe(2)
      expect(refs[2].index).toBe(3)
      expect(refs[3].index).toBe(4)
    })

    it('deduplicates when webSearchResults URL matches a knowledgeReference sourceUrl — keeps web version', () => {
      const sharedUrl = 'https://shared.example.com'
      const block = makeCitationBlock({
        webSearchResults: {
          results: [{ url: sharedUrl, title: 'From web', content: 'Web version' }]
        },
        knowledgeReferences: [
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: sharedUrl, content: 'KB version' })
        ]
      })
      const refs = getCitationRefs(block)
      // Web result gets inserted first, so knowledge ref is skipped
      expect(refs).toHaveLength(1)
      expect(refs[0].title).toBe('From web')
      expect(refs[0].content).toBe('Web version')
    })

    it('renumbers indices sequentially after deduplication', () => {
      const sharedUrl = 'https://shared.example.com'
      const block = makeCitationBlock({
        webSearchResults: {
          results: [
            { url: 'https://a.com', title: 'A' },
            { url: sharedUrl, title: 'Shared' }
          ]
        },
        knowledgeReferences: [
          // This duplicate should be dropped
          makeKnowledgeReference({ id: 'kr-1', sourceUrl: sharedUrl, content: 'Duplicate' }),
          // This unique one should appear
          makeKnowledgeReference({ id: 'kr-2', sourceUrl: 'https://unique.com', content: 'Unique' })
        ]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(3)
      expect(refs.map((r) => r.index)).toEqual([1, 2, 3])
    })
  })

  describe('single-source edge cases', () => {
    it('handles single webSearchResult', () => {
      const block = makeCitationBlock({
        webSearchResults: { results: [{ url: 'https://only.com', title: 'Only' }] }
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].index).toBe(1)
    })

    it('handles single knowledgeReference without sourceUrl', () => {
      const block = makeCitationBlock({
        knowledgeReferences: [makeKnowledgeReference({ id: 'solo', content: 'Solo', sourceUrl: undefined })]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].url).toBe('solo')
      expect(refs[0].index).toBe(1)
    })

    it('handles single memoryReference', () => {
      const block = makeCitationBlock({
        memoryReferences: [{ id: 'mem-solo', content: 'Solo memory' }]
      })
      const refs = getCitationRefs(block)
      expect(refs).toHaveLength(1)
      expect(refs[0].url).toBe('mem-solo')
      expect(refs[0].index).toBe(1)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getErrorContent', () => {
  it('returns the error string', () => {
    const block = makeErrorBlock({ error: 'Network timeout' })
    expect(getErrorContent(block)).toBe('Network timeout')
  })

  it('returns an empty string error', () => {
    const block = makeErrorBlock({ error: '' })
    expect(getErrorContent(block)).toBe('')
  })

  it('returns multi-line error messages', () => {
    const msg = 'Error on line 1\nDetails on line 2'
    const block = makeErrorBlock({ error: msg })
    expect(getErrorContent(block)).toBe(msg)
  })

  it('returns JSON error strings', () => {
    const msg = '{"code":500,"message":"Internal server error"}'
    const block = makeErrorBlock({ error: msg })
    expect(getErrorContent(block)).toBe(msg)
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getImageInfo', () => {
  it('returns url, file and metadata when all are present', () => {
    const file = makeFileMetadata({ type: FileType.Image, ext: 'png' })
    const metadata = { width: 1920, height: 1080, alt: 'Screenshot' }
    const block = makeImageBlock({ url: 'https://cdn.example.com/img.png', file, imageMetadata: metadata })
    const result = getImageInfo(block)
    expect(result.url).toBe('https://cdn.example.com/img.png')
    expect(result.file).toEqual(file)
    expect(result.metadata).toEqual(metadata)
  })

  it('returns undefined for all when block has no optional fields', () => {
    const block = makeImageBlock()
    const result = getImageInfo(block)
    expect(result.url).toBeUndefined()
    expect(result.file).toBeUndefined()
    expect(result.metadata).toBeUndefined()
  })

  it('returns null url when explicitly null', () => {
    const block = makeImageBlock({ url: null })
    expect(getImageInfo(block).url).toBeNull()
  })

  it('returns null file when explicitly null', () => {
    const block = makeImageBlock({ file: null })
    expect(getImageInfo(block).file).toBeNull()
  })

  it('returns only url when file and metadata are absent', () => {
    const block = makeImageBlock({ url: 'https://example.com/photo.jpg' })
    const result = getImageInfo(block)
    expect(result.url).toBe('https://example.com/photo.jpg')
    expect(result.file).toBeUndefined()
    expect(result.metadata).toBeUndefined()
  })

  it('returns only file when url and metadata are absent', () => {
    const file = makeFileMetadata()
    const block = makeImageBlock({ file })
    const result = getImageInfo(block)
    expect(result.file).toEqual(file)
    expect(result.url).toBeUndefined()
    expect(result.metadata).toBeUndefined()
  })

  it('returns metadata with partial fields', () => {
    const block = makeImageBlock({ imageMetadata: { width: 800 } })
    expect(getImageInfo(block).metadata).toEqual({ width: 800 })
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getFileInfo', () => {
  it('returns FileMetadata when file is set', () => {
    const file = makeFileMetadata()
    const block = makeFileBlock({ file })
    expect(getFileInfo(block)).toEqual(file)
  })

  it('returns undefined when file is absent', () => {
    const block = makeFileBlock()
    expect(getFileInfo(block)).toBeUndefined()
  })

  it('returns file with all metadata fields intact', () => {
    const file = makeFileMetadata({
      id: 'f-99',
      name: 'report.docx',
      origin_name: 'Annual Report.docx',
      path: '/documents/report.docx',
      size: 204800,
      ext: 'docx',
      type: FileType.Document,
      tokens: 5000,
      count: 12
    })
    const block = makeFileBlock({ file })
    const result = getFileInfo(block)
    expect(result).toEqual(file)
    expect(result?.tokens).toBe(5000)
    expect(result?.count).toBe(12)
  })

  it('returns image file metadata', () => {
    const file = makeFileMetadata({ ext: 'jpg', type: FileType.Image })
    const block = makeFileBlock({ file })
    expect(getFileInfo(block)?.type).toBe(FileType.Image)
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getTranslationContent', () => {
  it('returns content, sourceLanguage and targetLanguage when all set', () => {
    const block = makeTranslationBlock({
      content: 'Bonjour',
      sourceLanguage: 'fr',
      targetLanguage: 'en'
    })
    const result = getTranslationContent(block)
    expect(result.content).toBe('Bonjour')
    expect(result.sourceLanguage).toBe('fr')
    expect(result.targetLanguage).toBe('en')
  })

  it('returns undefined for sourceLanguage and targetLanguage when absent', () => {
    const block = makeTranslationBlock({ content: 'Hello' })
    const result = getTranslationContent(block)
    expect(result.content).toBe('Hello')
    expect(result.sourceLanguage).toBeUndefined()
    expect(result.targetLanguage).toBeUndefined()
  })

  it('returns only targetLanguage when sourceLanguage is absent', () => {
    const block = makeTranslationBlock({ content: 'Hola', targetLanguage: 'es' })
    const result = getTranslationContent(block)
    expect(result.sourceLanguage).toBeUndefined()
    expect(result.targetLanguage).toBe('es')
  })

  it('returns empty string content', () => {
    const block = makeTranslationBlock({ content: '' })
    expect(getTranslationContent(block).content).toBe('')
  })

  it('handles BCP-47 language tags', () => {
    const block = makeTranslationBlock({
      content: '你好',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US'
    })
    const result = getTranslationContent(block)
    expect(result.sourceLanguage).toBe('zh-CN')
    expect(result.targetLanguage).toBe('en-US')
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getVideoInfo', () => {
  it('returns url and filePath when both are set', () => {
    const block = makeVideoBlock({ url: 'https://cdn.example.com/video.mp4', filePath: '/tmp/video.mp4' })
    const result = getVideoInfo(block)
    expect(result.url).toBe('https://cdn.example.com/video.mp4')
    expect(result.filePath).toBe('/tmp/video.mp4')
  })

  it('returns undefined for url and filePath when both are absent', () => {
    const block = makeVideoBlock()
    const result = getVideoInfo(block)
    expect(result.url).toBeUndefined()
    expect(result.filePath).toBeUndefined()
  })

  it('returns null url when explicitly null', () => {
    const block = makeVideoBlock({ url: null })
    expect(getVideoInfo(block).url).toBeNull()
  })

  it('returns null filePath when explicitly null', () => {
    const block = makeVideoBlock({ filePath: null })
    expect(getVideoInfo(block).filePath).toBeNull()
  })

  it('returns only url when filePath is absent', () => {
    const block = makeVideoBlock({ url: 'https://example.com/clip.webm' })
    const result = getVideoInfo(block)
    expect(result.url).toBe('https://example.com/clip.webm')
    expect(result.filePath).toBeUndefined()
  })

  it('returns only filePath when url is absent', () => {
    const block = makeVideoBlock({ filePath: '/downloads/lecture.mp4' })
    const result = getVideoInfo(block)
    expect(result.filePath).toBe('/downloads/lecture.mp4')
    expect(result.url).toBeUndefined()
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getCompactContent', () => {
  it('returns content and compactedContent when both are set', () => {
    const block = makeCompactBlock({
      content: 'Full conversation history',
      compactedContent: 'Summary of conversation'
    })
    const result = getCompactContent(block)
    expect(result.content).toBe('Full conversation history')
    expect(result.compactedContent).toBe('Summary of conversation')
  })

  it('returns compactedContent as undefined when absent', () => {
    const block = makeCompactBlock({ content: 'Only content' })
    const result = getCompactContent(block)
    expect(result.content).toBe('Only content')
    expect(result.compactedContent).toBeUndefined()
  })

  it('returns empty string content', () => {
    const block = makeCompactBlock({ content: '' })
    expect(getCompactContent(block).content).toBe('')
  })

  it('returns empty string compactedContent', () => {
    const block = makeCompactBlock({ content: 'original', compactedContent: '' })
    expect(getCompactContent(block).compactedContent).toBe('')
  })

  it('handles long content strings', () => {
    const longContent = 'A'.repeat(10000)
    const block = makeCompactBlock({ content: longContent })
    expect(getCompactContent(block).content).toBe(longContent)
  })
})

// ──────────────────────────────────────────────────────────────────────────────

describe('getBlockContent', () => {
  it('returns content from a MainTextBlock', () => {
    const block = makeMainTextBlock({ content: 'Main text' }) as MessageBlock
    expect(getBlockContent(block)).toBe('Main text')
  })

  it('returns content from a ThinkingBlock', () => {
    const block = makeThinkingBlock({ content: 'Thinking...' }) as MessageBlock
    expect(getBlockContent(block)).toBe('Thinking...')
  })

  it('returns content from a CodeBlock', () => {
    const block = makeCodeBlock({ content: 'const y = 2' }) as MessageBlock
    expect(getBlockContent(block)).toBe('const y = 2')
  })

  it('returns content from a TranslationBlock', () => {
    const block = makeTranslationBlock({ content: 'Translated text' }) as MessageBlock
    expect(getBlockContent(block)).toBe('Translated text')
  })

  it('returns content from a CompactBlock', () => {
    const block = makeCompactBlock({ content: 'Compacted summary' }) as MessageBlock
    expect(getBlockContent(block)).toBe('Compacted summary')
  })

  it('returns content from an UnknownBlock', () => {
    const block = makeUnknownBlock({ content: 'Unknown content' }) as MessageBlock
    expect(getBlockContent(block)).toBe('Unknown content')
  })

  it('returns empty string for ToolBlock (no content field)', () => {
    const block = makeToolBlock() as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string for CitationBlock (no content field)', () => {
    const block = makeCitationBlock() as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string for ErrorBlock — error field is string but not named content', () => {
    const block = makeErrorBlock({ error: 'oops' }) as MessageBlock
    // ErrorBlock has no `content` field — only `error`
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string for ImageBlock (no content field)', () => {
    const block = makeImageBlock() as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string for FileBlock (no content field)', () => {
    const block = makeFileBlock() as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string for VideoBlock (no content field)', () => {
    const block = makeVideoBlock() as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })

  it('returns empty string when content is an empty string', () => {
    const block = makeMainTextBlock({ content: '' }) as MessageBlock
    expect(getBlockContent(block)).toBe('')
  })
})
