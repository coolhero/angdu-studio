import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const MOCK_DATA_PATH = '/mock/user/data'
const MOCK_FILES_DIR = path.join(MOCK_DATA_PATH, 'files')
const MOCK_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue(MOCK_UUID)
}))

const mockReadFile = vi.fn()
const mockCopyFile = vi.fn()
const mockDeleteFile = vi.fn()
const mockEnsureDir = vi.fn()
const mockExists = vi.fn()

vi.mock('@main/services/FileSystemService', () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
  copyFile: (...args: unknown[]) => mockCopyFile(...args),
  deleteFile: (...args: unknown[]) => mockDeleteFile(...args),
  ensureDir: (...args: unknown[]) => mockEnsureDir(...args),
  exists: (...args: unknown[]) => mockExists(...args)
}))

vi.mock('@main/config', () => ({
  DATA_PATH: MOCK_DATA_PATH
}))

const mockShowOpenDialog = vi.fn()
const mockShowSaveDialog = vi.fn()
const mockOpenPath = vi.fn()

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: (...args: unknown[]) => mockShowOpenDialog(...args),
    showSaveDialog: (...args: unknown[]) => mockShowSaveDialog(...args)
  },
  shell: {
    openPath: (...args: unknown[]) => mockOpenPath(...args)
  }
}))

const mockStat = vi.fn()

vi.mock('fs/promises', () => ({
  default: {
    stat: (...args: unknown[]) => mockStat(...args)
  },
  stat: (...args: unknown[]) => mockStat(...args)
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

describe('FileStorage', () => {
  let fileStorage: typeof import('../FileStorage')

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockEnsureDir.mockResolvedValue(undefined)
    mockCopyFile.mockResolvedValue(undefined)
    mockDeleteFile.mockResolvedValue(undefined)
    mockReadFile.mockResolvedValue(Buffer.from('test content'))
    mockExists.mockResolvedValue(true)
    mockOpenPath.mockResolvedValue('')
    mockStat.mockResolvedValue({ size: 1024 })
    fileStorage = await import('../FileStorage')
  })

  describe('getFilesDir', () => {
    it('should return the files directory path under DATA_PATH', () => {
      const dir = fileStorage.getFilesDir()
      expect(dir).toBe(MOCK_FILES_DIR)
    })
  })

  describe('upload', () => {
    it('should copy file to managed directory with UUID-based naming', async () => {
      const sourcePath = '/tmp/test-document.pdf'
      mockStat.mockResolvedValue({ size: 2048 })

      const metadata = await fileStorage.upload(sourcePath)

      const expectedDest = path.join(MOCK_FILES_DIR, `${MOCK_UUID}.pdf`)
      expect(mockEnsureDir).toHaveBeenCalledWith(MOCK_FILES_DIR)
      expect(mockCopyFile).toHaveBeenCalledWith(sourcePath, expectedDest)
      expect(metadata.id).toBe(MOCK_UUID)
      expect(metadata.ext).toBe('.pdf')
      expect(metadata.name).toBe('test-document.pdf')
    })

    it('should create a valid FileMetadata object', async () => {
      const sourcePath = '/tmp/photo.png'
      mockStat.mockResolvedValue({ size: 4096 })

      const metadata = await fileStorage.upload(sourcePath)

      expect(metadata).toEqual(
        expect.objectContaining({
          id: MOCK_UUID,
          name: 'photo.png',
          ext: '.png',
          size: 4096,
          type: 'image',
          count: 0
        })
      )
      expect(metadata.path).toBe(path.join(MOCK_FILES_DIR, `${MOCK_UUID}.png`))
      expect(metadata.created_at).toBeGreaterThan(0)
    })

    it('should handle files without extensions', async () => {
      const sourcePath = '/tmp/Makefile'
      mockStat.mockResolvedValue({ size: 512 })

      const metadata = await fileStorage.upload(sourcePath)

      expect(metadata.ext).toBe('')
      expect(metadata.name).toBe('Makefile')
      const expectedDest = path.join(MOCK_FILES_DIR, MOCK_UUID)
      expect(mockCopyFile).toHaveBeenCalledWith(sourcePath, expectedDest)
    })

    it('should throw error if source file does not exist', async () => {
      const sourcePath = '/tmp/nonexistent.txt'
      mockStat.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      await expect(fileStorage.upload(sourcePath)).rejects.toThrow()
    })
  })

  describe('select', () => {
    it('should open native file dialog and return FileMetadata array', async () => {
      mockShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/tmp/selected-file.txt']
      })
      mockStat.mockResolvedValue({ size: 256 })

      const result = await fileStorage.select({})

      expect(mockShowOpenDialog).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('selected-file.txt')
    })

    it('should return empty array when dialog is canceled', async () => {
      mockShowOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: []
      })

      const result = await fileStorage.select({})

      expect(result).toEqual([])
    })

    it('should handle multiple file selection', async () => {
      mockShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/tmp/file1.txt', '/tmp/file2.pdf']
      })
      mockStat.mockResolvedValue({ size: 100 })

      const result = await fileStorage.select({ multiSelections: true })

      expect(result).toHaveLength(2)
    })
  })

  describe('download', () => {
    it('should copy file from managed directory to target path', async () => {
      const targetPath = '/tmp/downloads/my-file.pdf'
      const managedPath = path.join(MOCK_FILES_DIR, `${MOCK_UUID}.pdf`)
      mockExists.mockResolvedValue(true)

      await fileStorage.download(MOCK_UUID, '.pdf', targetPath)

      expect(mockCopyFile).toHaveBeenCalledWith(managedPath, targetPath)
    })

    it('should open save dialog when no target path provided', async () => {
      mockShowSaveDialog.mockResolvedValue({
        canceled: false,
        filePath: '/tmp/downloads/saved-file.pdf'
      })
      mockExists.mockResolvedValue(true)

      await fileStorage.download(MOCK_UUID, '.pdf')

      expect(mockShowSaveDialog).toHaveBeenCalled()
      expect(mockCopyFile).toHaveBeenCalled()
    })

    it('should do nothing when save dialog is canceled', async () => {
      mockShowSaveDialog.mockResolvedValue({
        canceled: true,
        filePath: undefined
      })

      await fileStorage.download(MOCK_UUID, '.pdf')

      expect(mockCopyFile).not.toHaveBeenCalled()
    })
  })

  describe('read', () => {
    it('should return file buffer from managed directory', async () => {
      const expectedBuffer = Buffer.from('file content')
      mockReadFile.mockResolvedValue(expectedBuffer)

      const result = await fileStorage.read(MOCK_UUID, '.txt')

      const expectedPath = path.join(MOCK_FILES_DIR, `${MOCK_UUID}.txt`)
      expect(mockReadFile).toHaveBeenCalledWith(expectedPath)
      expect(result).toBe(expectedBuffer)
    })
  })

  describe('delete', () => {
    it('should remove file from managed directory', async () => {
      await fileStorage.deleteFile(MOCK_UUID, '.txt')

      const expectedPath = path.join(MOCK_FILES_DIR, `${MOCK_UUID}.txt`)
      expect(mockDeleteFile).toHaveBeenCalledWith(expectedPath)
    })

    it('should handle deletion of non-existent file gracefully', async () => {
      mockDeleteFile.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      await expect(fileStorage.deleteFile(MOCK_UUID, '.txt')).rejects.toThrow('ENOENT')
    })
  })

  describe('open', () => {
    it('should open file with system default application', async () => {
      mockExists.mockResolvedValue(true)

      await fileStorage.open(MOCK_UUID, '.pdf')

      const expectedPath = path.join(MOCK_FILES_DIR, `${MOCK_UUID}.pdf`)
      expect(mockOpenPath).toHaveBeenCalledWith(expectedPath)
    })

    it('should throw error when file does not exist', async () => {
      mockExists.mockResolvedValue(false)

      await expect(fileStorage.open(MOCK_UUID, '.pdf')).rejects.toThrow()
    })
  })

  describe('getPath', () => {
    it('should return absolute path for a managed file', () => {
      const result = fileStorage.getPath(MOCK_UUID, '.pdf')

      expect(result).toBe(path.join(MOCK_FILES_DIR, `${MOCK_UUID}.pdf`))
    })
  })

  describe('path containment validation', () => {
    it('should reject directory traversal in file id', async () => {
      const maliciousId = '../../../etc/passwd'

      await expect(fileStorage.read(maliciousId, '')).rejects.toThrow()
    })

    it('should reject directory traversal via extension', async () => {
      const maliciousExt = '/../../../etc/shadow'

      await expect(fileStorage.read(MOCK_UUID, maliciousExt)).rejects.toThrow()
    })

    it('should reject path traversal in getPath', () => {
      expect(() => fileStorage.getPath('../../../etc/passwd', '')).toThrow()
    })
  })
})
