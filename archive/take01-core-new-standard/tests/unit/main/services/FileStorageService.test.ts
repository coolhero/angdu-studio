import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData')
  }
}))

// Mock paths
vi.mock('@main/utils/paths', () => ({
  getFilesPath: vi.fn().mockReturnValue('/mock/userData/files')
}))

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  createWriteStream: vi.fn().mockReturnValue({
    on: vi.fn((event, cb) => {
      if (event === 'finish') setTimeout(cb, 0)
      return { on: vi.fn() }
    }),
    close: vi.fn()
  })
}))

// Mock node:fs/promises
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from('test content')),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
  copyFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({
    size: 1024,
    birthtimeMs: 1700000000000,
    mtimeMs: 1700000000000
  })
}))

// Mock node:crypto
vi.mock('node:crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('test-uuid-1234')
}))

import { readFile, writeFile, unlink, copyFile } from 'node:fs/promises'
import { FileStorageService } from '@main/services/FileStorageService'

describe('FileStorageService', () => {
  let service: FileStorageService
  const testDir = '/mock/userData/files'

  beforeEach(() => {
    vi.clearAllMocks()
    service = new FileStorageService(testDir)
  })

  describe('upload', () => {
    it('copies file to files directory with UUID name', async () => {
      const result = await service.upload('/source/photo.png')

      expect(copyFile).toHaveBeenCalledWith(
        '/source/photo.png',
        join(testDir, 'test-uuid-1234.png')
      )
      expect(result.name).toBe('photo.png')
      expect(result.path).toBe(join(testDir, 'test-uuid-1234.png'))
      expect(result.size).toBe(1024)
      expect(result.mimeType).toBe('image/png')
    })
  })

  describe('read', () => {
    it('reads file contents as Buffer', async () => {
      const buffer = await service.read('/some/file.txt')
      expect(readFile).toHaveBeenCalledWith('/some/file.txt')
      expect(buffer).toEqual(Buffer.from('test content'))
    })
  })

  describe('write', () => {
    it('writes data to file', async () => {
      const data = Buffer.from('hello')
      await service.write('/some/file.txt', data)
      expect(writeFile).toHaveBeenCalledWith('/some/file.txt', data)
    })
  })

  describe('delete', () => {
    it('deletes the file', async () => {
      await service.delete('/some/file.txt')
      expect(unlink).toHaveBeenCalledWith('/some/file.txt')
    })
  })
})
