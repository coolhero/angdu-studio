import { describe, it, expect, vi } from 'vitest'

const mockIpcMain = {
  handle: vi.fn()
}

vi.mock('electron', () => ({
  ipcMain: mockIpcMain,
  dialog: { showOpenDialog: vi.fn(), showSaveDialog: vi.fn() },
  shell: { openPath: vi.fn() },
  app: { getPath: vi.fn(() => '/tmp'), setPath: vi.fn() },
  BrowserWindow: { fromWebContents: vi.fn(), getAllWindows: vi.fn(() => []) }
}))

vi.mock('../../src/main/bootstrap', () => ({
  filesDir: '/tmp/files',
  logsDir: '/tmp/logs',
  dataDir: '/tmp',
  isPortable: false,
  isAppImage: false,
  isWayland: false
}))

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => Buffer.from('test')),
  writeFileSync: vi.fn(),
  copyFileSync: vi.fn(),
  renameSync: vi.fn(),
  unlinkSync: vi.fn(),
  statSync: vi.fn(() => ({ size: 100, isFile: () => true, isDirectory: () => false, mtime: new Date(), ctime: new Date() })),
  readdirSync: vi.fn(() => []),
  appendFileSync: vi.fn(),
  createReadStream: vi.fn(),
  createWriteStream: vi.fn()
}))

vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'hash123')
  })),
  randomUUID: vi.fn(() => 'uuid-test')
}))

vi.mock('winston', () => {
  const formatFn = vi.fn(() => vi.fn(() => ({})))
  const format = Object.assign(formatFn, {
    combine: vi.fn(() => ({})),
    timestamp: vi.fn(() => ({})),
    printf: vi.fn(() => ({})),
    colorize: vi.fn(() => ({}))
  })
  return {
    format,
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(function (this: any) { return this }),
      add: vi.fn()
    })),
    transports: { Console: vi.fn() }
  }
})

vi.mock('winston-daily-rotate-file', () => ({
  default: vi.fn()
}))

vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      close: vi.fn()
    }))
  }
}))

vi.mock('glob', () => ({
  glob: vi.fn(() => Promise.resolve([]))
}))

describe('File IPC Round-trip', () => {
  it('should register all file IPC handlers', async () => {
    const { registerFileHandlers } = await import('../../src/main/ipc/file.ipc')
    registerFileHandlers()

    const registeredChannels = mockIpcMain.handle.mock.calls.map((call) => call[0])
    expect(registeredChannels).toContain('file:read')
    expect(registeredChannels).toContain('file:write')
    expect(registeredChannels).toContain('file:delete')
    expect(registeredChannels).toContain('file:copy')
    expect(registeredChannels).toContain('file:upload')
  })
})
