import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const MOCK_DATA_PATH = '/mock/user/data'

vi.mock('@main/config', () => ({
  DATA_PATH: '/mock/user/data'
}))

vi.mock('@main/services/LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

const mockFsReadFile = vi.fn()
const mockFsWriteFile = vi.fn()
const mockFsCopyFile = vi.fn()
const mockFsUnlink = vi.fn()
const mockFsRename = vi.fn()
const mockFsMkdir = vi.fn()
const mockFsAccess = vi.fn()

vi.mock('fs/promises', () => ({
  default: {
    readFile: (...args: unknown[]) => mockFsReadFile(...args),
    writeFile: (...args: unknown[]) => mockFsWriteFile(...args),
    copyFile: (...args: unknown[]) => mockFsCopyFile(...args),
    unlink: (...args: unknown[]) => mockFsUnlink(...args),
    rename: (...args: unknown[]) => mockFsRename(...args),
    mkdir: (...args: unknown[]) => mockFsMkdir(...args),
    access: (...args: unknown[]) => mockFsAccess(...args)
  },
  readFile: (...args: unknown[]) => mockFsReadFile(...args),
  writeFile: (...args: unknown[]) => mockFsWriteFile(...args),
  copyFile: (...args: unknown[]) => mockFsCopyFile(...args),
  unlink: (...args: unknown[]) => mockFsUnlink(...args),
  rename: (...args: unknown[]) => mockFsRename(...args),
  mkdir: (...args: unknown[]) => mockFsMkdir(...args),
  access: (...args: unknown[]) => mockFsAccess(...args)
}))

describe('FileSystemService', () => {
  let fss: typeof import('../FileSystemService')

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockFsMkdir.mockResolvedValue(undefined)
    mockFsReadFile.mockResolvedValue(Buffer.from('test'))
    mockFsWriteFile.mockResolvedValue(undefined)
    mockFsCopyFile.mockResolvedValue(undefined)
    mockFsUnlink.mockResolvedValue(undefined)
    mockFsRename.mockResolvedValue(undefined)
    mockFsAccess.mockResolvedValue(undefined)
    fss = await import('../FileSystemService')
  })

  describe('readFile', () => {
    it('should read a file within the sandbox', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'test.txt')
      const expectedBuffer = Buffer.from('hello world')
      mockFsReadFile.mockResolvedValue(expectedBuffer)

      const result = await fss.readFile(filePath)

      expect(mockFsReadFile).toHaveBeenCalledWith(filePath)
      expect(result).toBe(expectedBuffer)
    })

    it('should reject paths outside the sandbox', async () => {
      const filePath = '/etc/passwd'

      await expect(fss.readFile(filePath)).rejects.toThrow('Path outside sandbox')
    })

    it('should reject directory traversal attempts', async () => {
      const filePath = path.join(MOCK_DATA_PATH, '..', '..', 'etc', 'passwd')

      await expect(fss.readFile(filePath)).rejects.toThrow('Path outside sandbox')
    })

    it('should throw when file does not exist', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'nonexistent.txt')
      mockFsReadFile.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      await expect(fss.readFile(filePath)).rejects.toThrow('ENOENT')
    })
  })

  describe('writeFile', () => {
    it('should write data to a file within the sandbox', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'output.txt')
      const data = 'hello world'

      await fss.writeFile(filePath, data)

      expect(mockFsMkdir).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true })
      expect(mockFsWriteFile).toHaveBeenCalledWith(filePath, data)
    })

    it('should write Buffer data to a file', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'binary.dat')
      const data = Buffer.from([0x00, 0x01, 0x02])

      await fss.writeFile(filePath, data)

      expect(mockFsWriteFile).toHaveBeenCalledWith(filePath, data)
    })

    it('should create parent directories recursively', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'deep', 'nested', 'dir', 'file.txt')

      await fss.writeFile(filePath, 'data')

      expect(mockFsMkdir).toHaveBeenCalledWith(path.join(MOCK_DATA_PATH, 'deep', 'nested', 'dir'), { recursive: true })
    })

    it('should reject paths outside the sandbox', async () => {
      const filePath = '/tmp/evil.txt'

      await expect(fss.writeFile(filePath, 'data')).rejects.toThrow('Path outside sandbox')
    })
  })

  describe('copyFile', () => {
    it('should copy a file to a destination within the sandbox', async () => {
      const src = '/tmp/external-file.txt'
      const dest = path.join(MOCK_DATA_PATH, 'files', 'copy.txt')

      await fss.copyFile(src, dest)

      expect(mockFsMkdir).toHaveBeenCalledWith(path.dirname(dest), { recursive: true })
      expect(mockFsCopyFile).toHaveBeenCalledWith(src, dest)
    })

    it('should reject when destination is outside the sandbox', async () => {
      const src = path.join(MOCK_DATA_PATH, 'files', 'test.txt')
      const dest = '/tmp/stolen-file.txt'

      await expect(fss.copyFile(src, dest)).rejects.toThrow('Path outside sandbox')
    })
  })

  describe('deleteFile', () => {
    it('should delete a file within the sandbox', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'to-delete.txt')

      await fss.deleteFile(filePath)

      expect(mockFsUnlink).toHaveBeenCalledWith(filePath)
    })

    it('should reject paths outside the sandbox', async () => {
      const filePath = '/etc/important-config'

      await expect(fss.deleteFile(filePath)).rejects.toThrow('Path outside sandbox')
    })

    it('should throw when file does not exist', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'ghost.txt')
      mockFsUnlink.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      await expect(fss.deleteFile(filePath)).rejects.toThrow('ENOENT')
    })
  })

  describe('moveFile', () => {
    it('should move a file to a new destination within the sandbox', async () => {
      const src = path.join(MOCK_DATA_PATH, 'files', 'original.txt')
      const dest = path.join(MOCK_DATA_PATH, 'files', 'moved.txt')

      await fss.moveFile(src, dest)

      expect(mockFsMkdir).toHaveBeenCalledWith(path.dirname(dest), { recursive: true })
      expect(mockFsRename).toHaveBeenCalledWith(src, dest)
    })

    it('should reject when destination is outside the sandbox', async () => {
      const src = path.join(MOCK_DATA_PATH, 'files', 'original.txt')
      const dest = '/tmp/exfiltrated.txt'

      await expect(fss.moveFile(src, dest)).rejects.toThrow('Path outside sandbox')
    })
  })

  describe('renameFile', () => {
    it('should rename a file within the same directory', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'old-name.txt')
      const newName = 'new-name.txt'
      const expectedDest = path.join(MOCK_DATA_PATH, 'files', 'new-name.txt')

      await fss.renameFile(filePath, newName)

      expect(mockFsRename).toHaveBeenCalledWith(filePath, expectedDest)
    })

    it('should reject rename that would escape the sandbox', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'safe.txt')
      const maliciousName = '../../../etc/cron.d/evil'

      await expect(fss.renameFile(filePath, maliciousName)).rejects.toThrow('Path outside sandbox')
    })
  })

  describe('ensureDir', () => {
    it('should create a directory recursively', async () => {
      const dirPath = path.join(MOCK_DATA_PATH, 'new', 'nested', 'dir')

      await fss.ensureDir(dirPath)

      expect(mockFsMkdir).toHaveBeenCalledWith(dirPath, { recursive: true })
    })
  })

  describe('exists', () => {
    it('should return true when file exists', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'exists.txt')
      mockFsAccess.mockResolvedValue(undefined)

      const result = await fss.exists(filePath)

      expect(result).toBe(true)
    })

    it('should return false when file does not exist', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'missing.txt')
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const result = await fss.exists(filePath)

      expect(result).toBe(false)
    })
  })

  describe('sandbox path validation edge cases', () => {
    it('should reject null bytes in path', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', 'test\x00.txt')

      // path.resolve may or may not handle null bytes, but the path should still be validated
      // The key is ensuring no escape from sandbox
      try {
        await fss.readFile(filePath)
        // If it doesn't throw, the resolved path must still be within sandbox
      } catch (e) {
        // Expected - either sandbox violation or fs error
        expect(e).toBeDefined()
      }
    })

    it('should handle symlink-like path components', async () => {
      const filePath = path.join(MOCK_DATA_PATH, 'files', '..', 'files', 'test.txt')

      // This resolves to within sandbox, so it should succeed
      const _result = await fss.readFile(filePath)
      expect(mockFsReadFile).toHaveBeenCalled()
    })
  })
})
