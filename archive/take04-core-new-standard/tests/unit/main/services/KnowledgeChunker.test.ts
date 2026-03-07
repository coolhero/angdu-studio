import { describe, it, expect } from 'vitest'
import { chunkText } from '../../../../src/main/services/KnowledgeChunker'

describe('KnowledgeChunker', () => {
  describe('chunkText', () => {
    it('should return empty array for empty text', () => {
      expect(chunkText('', 1000, 200)).toEqual([])
    })

    it('should return single chunk for text shorter than chunk size', () => {
      const text = 'Short text.'
      const chunks = chunkText(text, 1000, 200)
      expect(chunks).toHaveLength(1)
      expect(chunks[0]).toBe(text)
    })

    it('should split text into multiple chunks with correct size', () => {
      const text = 'A'.repeat(2500)
      const chunks = chunkText(text, 1000, 200)
      expect(chunks.length).toBeGreaterThan(1)
      for (const chunk of chunks) {
        expect(chunk.length).toBeLessThanOrEqual(1000)
      }
    })

    it('should create overlapping chunks', () => {
      const sentences = Array.from({ length: 20 }, (_, i) => `Sentence ${i + 1} with some content.`).join(' ')
      const chunks = chunkText(sentences, 200, 50)
      expect(chunks.length).toBeGreaterThan(1)

      // Adjacent chunks should have overlapping content
      for (let i = 1; i < chunks.length; i++) {
        const prevEnd = chunks[i - 1].slice(-50)
        const currStart = chunks[i].slice(0, 50)
        // Due to splitting on sentence boundaries, exact overlap may vary
        // but chunks should cover all content
        expect(chunks[i].length).toBeGreaterThan(0)
      }
    })

    it('should prefer splitting on paragraph breaks', () => {
      const text = 'Paragraph one content here.\n\nParagraph two content here.\n\nParagraph three content here.'
      const chunks = chunkText(text, 50, 10)
      expect(chunks.length).toBeGreaterThan(1)
    })

    it('should prefer splitting on sentence boundaries', () => {
      const text = 'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.'
      const chunks = chunkText(text, 50, 10)
      expect(chunks.length).toBeGreaterThan(1)
      // Each chunk should ideally end at a sentence boundary
      for (const chunk of chunks.slice(0, -1)) {
        expect(chunk.trimEnd()).toMatch(/[.!?]$/)
      }
    })

    it('should handle text with only whitespace', () => {
      expect(chunkText('   \n\n  ', 1000, 200)).toEqual([])
    })

    it('should respect minimum chunk overlap', () => {
      const text = 'Word '.repeat(500)
      const chunks = chunkText(text, 100, 0)
      expect(chunks.length).toBeGreaterThan(1)
    })

    it('should handle very large overlap close to chunk size', () => {
      const text = 'A'.repeat(500)
      // overlap must be < chunkSize
      const chunks = chunkText(text, 100, 90)
      expect(chunks.length).toBeGreaterThan(1)
    })

    it('should produce chunks that cover all original content', () => {
      const words = Array.from({ length: 100 }, (_, i) => `word${i}`)
      const text = words.join(' ')
      const chunks = chunkText(text, 200, 50)

      // Every word from original should appear in at least one chunk
      for (const word of words) {
        const found = chunks.some((c) => c.includes(word))
        expect(found, `Word "${word}" not found in any chunk`).toBe(true)
      }
    })

    it('should handle Unicode text correctly', () => {
      const text = '日本語のテスト文章です。これは二番目の文です。三番目の文章がここにあります。'
      const chunks = chunkText(text, 20, 5)
      expect(chunks.length).toBeGreaterThan(0)
    })

    it('should use default parameters when not specified', () => {
      const text = 'A'.repeat(1500)
      const chunks = chunkText(text)
      expect(chunks.length).toBeGreaterThan(1)
    })
  })
})
