import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'path'

const mockFs = {
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  renameSync: vi.fn(),
  unlinkSync: vi.fn(),
  readFileSync: vi.fn(() => Buffer.from('test content')),
  writeFileSync: vi.fn(),
  statSync: vi.fn(() => ({ size: 1024, isFile: () => true, isDirectory: () => false, mtime: new Date() })),
  readdirSync: vi.fn(() => []),
  appendFileSync: vi.fn()
}

vi.mock('fs', () => mockFs)

vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'abc123')
  })),
  randomUUID: vi.fn(() => 'test-uuid-1234')
}))

vi.mock('electron', () => ({
  shell: { openPath: vi.fn() },
  app: { getPath: vi.fn(() => '/tmp') }
}))

vi.mock('../../../../src/main/bootstrap', () => ({
  filesDir: '/tmp/files'
}))

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should read file with default encoding', async () => {
    const { fileService } = await import('../../../../src/main/services/FileService')
    const content = fileService.read('/tmp/test.txt')
    expect(mockFs.readFileSync).toHaveBeenCalledWith('/tmp/test.txt', expect.any(Object))
  })

  it('should write data to file', async () => {
    const { fileService } = await import('../../../../src/main/services/FileService')
    fileService.write('/tmp/test.txt', 'hello')
    expect(mockFs.writeFileSync).toHaveBeenCalledWith('/tmp/test.txt', 'hello')
  })

  it('should delete file', async () => {
    const { fileService } = await import('../../../../src/main/services/FileService')
    fileService.delete('/tmp/test.txt')
    expect(mockFs.unlinkSync).toHaveBeenCalledWith('/tmp/test.txt')
  })

  it('should copy file', async () => {
    const { fileService } = await import('../../../../src/main/services/FileService')
    fileService.copy('/tmp/src.txt', '/tmp/dest.txt')
    expect(mockFs.copyFileSync).toHaveBeenCalledWith('/tmp/src.txt', '/tmp/dest.txt')
  })

  it('should classify file type by extension', async () => {
    const { fileService } = await import('../../../../src/main/services/FileService')
    expect(fileService.getType('photo.jpg')).toBe('image')
    expect(fileService.getType('song.mp3')).toBe('audio')
    expect(fileService.getType('doc.pdf')).toBe('document')
    expect(fileService.getType('code.ts')).toBe('code')
    expect(fileService.getType('data.xyz')).toBe('other')
  })
})
