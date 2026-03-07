import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('fs/promises', () => {
  const m = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    copyFile: vi.fn(),
    rename: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn()
  }
  return { ...m, default: m }
})

vi.mock('fs', () => {
  const m = {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    createReadStream: vi.fn().mockReturnValue({ pipe: vi.fn(), on: vi.fn() }),
    createWriteStream: vi.fn().mockReturnValue({ on: vi.fn(), end: vi.fn() })
  }
  return { ...m, default: m }
})

vi.mock('electron', () => ({
  app: { getPath: vi.fn().mockReturnValue('/mock/user-data'), getName: vi.fn().mockReturnValue('Cherry Studio') },
  dialog: { showOpenDialog: vi.fn(), showSaveDialog: vi.fn() }
}))

import { readFile, writeFile, copyFile, rename, unlink, stat } from 'fs/promises'
import { FileStorageService } from '../FileStorageService'

const mockReadFile = vi.mocked(readFile)
const mockWriteFile = vi.mocked(writeFile)
const mockCopyFile = vi.mocked(copyFile)
const mockRename = vi.mocked(rename)
const mockUnlink = vi.mocked(unlink)
const mockStat = vi.mocked(stat)

describe('FileStorageService', () => {
  let service: FileStorageService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new FileStorageService('/mock/files')
  })

  describe('readFile', () => {
    it('should read file content', async () => {
      mockReadFile.mockResolvedValueOnce(Buffer.from('hello'))
      const result = await service.readFile('/mock/files/test.txt')
      expect(mockReadFile).toHaveBeenCalledWith('/mock/files/test.txt')
      expect(result).toEqual(Buffer.from('hello'))
    })
  })

  describe('writeFile', () => {
    it('should write content to file', async () => {
      mockWriteFile.mockResolvedValueOnce(undefined)
      await service.writeFile('/mock/files/test.txt', 'content')
      expect(mockWriteFile).toHaveBeenCalledWith('/mock/files/test.txt', 'content')
    })
  })

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      mockUnlink.mockResolvedValueOnce(undefined)
      await service.deleteFile('/mock/files/test.txt')
      expect(mockUnlink).toHaveBeenCalledWith('/mock/files/test.txt')
    })
  })

  describe('copyFile', () => {
    it('should copy file to destination', async () => {
      mockCopyFile.mockResolvedValueOnce(undefined)
      await service.copyFile('/mock/files/a.txt', '/mock/files/b.txt')
      expect(mockCopyFile).toHaveBeenCalledWith('/mock/files/a.txt', '/mock/files/b.txt')
    })
  })

  describe('moveFile', () => {
    it('should move file to destination', async () => {
      mockRename.mockResolvedValueOnce(undefined)
      await service.moveFile('/mock/files/a.txt', '/mock/files/b.txt')
      expect(mockRename).toHaveBeenCalledWith('/mock/files/a.txt', '/mock/files/b.txt')
    })
  })

  describe('getFileSize', () => {
    it('should return file size', async () => {
      mockStat.mockResolvedValueOnce({ size: 1024 } as any)
      const size = await service.getFileSize('/mock/files/test.txt')
      expect(size).toBe(1024)
    })
  })

  describe('isTextFile', () => {
    it('should detect text files by extension', () => {
      expect(service.isTextFile('test.txt')).toBe(true)
      expect(service.isTextFile('test.md')).toBe(true)
      expect(service.isTextFile('test.png')).toBe(false)
    })
  })
})
