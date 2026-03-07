import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockHandle = vi.fn()
const mockMainWindow = {
  show: vi.fn(),
  focus: vi.fn(),
  hide: vi.fn(),
  minimize: vi.fn(),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  isMaximized: vi.fn().mockReturnValue(false),
  isFullScreen: vi.fn().mockReturnValue(false),
  setFullScreen: vi.fn(),
  close: vi.fn(),
  setSize: vi.fn(),
  webContents: { send: vi.fn() }
}

const mockApp = {
  getVersion: vi.fn().mockReturnValue('1.0.0'),
  isPackaged: false,
  getAppPath: vi.fn().mockReturnValue('/mock/app'),
  getPath: vi.fn().mockReturnValue('/mock/user/data'),
  getLocale: vi.fn().mockReturnValue('en-US'),
  quit: vi.fn(),
  relaunch: vi.fn(),
  exit: vi.fn()
}

vi.mock('electron', () => ({
  ipcMain: {
    handle: (...args: unknown[]) => mockHandle(...args)
  },
  BrowserWindow: vi.fn(),
  app: mockApp,
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn()
  },
  shell: {
    openPath: vi.fn(),
    openExternal: vi.fn()
  }
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

vi.mock('@main/constant', () => ({
  isMac: false,
  isWin: false,
  isLinux: false,
  isDev: false
}))

vi.mock('@main/config', () => ({
  DATA_PATH: '/mock/user/data'
}))

vi.mock('@main/services/FileSystemService', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  copyFile: vi.fn(),
  deleteFile: vi.fn(),
  moveFile: vi.fn(),
  renameFile: vi.fn(),
  ensureDir: vi.fn(),
  exists: vi.fn()
}))

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}))

vi.mock('fs/promises', () => ({
  default: {
    stat: vi.fn().mockResolvedValue({ size: 1024 }),
    access: vi.fn().mockResolvedValue(undefined)
  },
  stat: vi.fn().mockResolvedValue({ size: 1024 }),
  access: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@main/services/ConfigManager', () => ({
  configManager: {
    get: vi.fn(),
    set: vi.fn()
  }
}))

vi.mock('@main/services/ThemeService', () => ({
  themeService: {
    getTheme: vi.fn().mockReturnValue('system'),
    setTheme: vi.fn()
  }
}))

vi.mock('@main/services/AppUpdater', () => ({
  appUpdater: {
    checkForUpdates: vi.fn(),
    installUpdate: vi.fn()
  }
}))

vi.mock('@main/services/ShortcutService', () => ({
  shortcutService: {
    update: vi.fn()
  }
}))

vi.mock('@main/services/ProxyManager', () => ({
  proxyManager: {
    getProxy: vi.fn(),
    setProxy: vi.fn()
  }
}))

vi.mock('@main/services/WindowService', () => ({
  windowService: {
    openMini: vi.fn(),
    openSelection: vi.fn(),
    getMainWindow: vi.fn()
  }
}))

vi.mock('@main/services/NotificationService', () => ({
  notificationService: {
    show: vi.fn()
  }
}))

vi.mock('@main/services/FileStorage', () => ({
  select: vi.fn(),
  upload: vi.fn(),
  download: vi.fn(),
  read: vi.fn(),
  deleteFile: vi.fn(),
  open: vi.fn(),
  getPath: vi.fn()
}))

vi.mock('@main/services/AppService', () => ({
  appService: {
    getInfo: vi.fn().mockReturnValue({
      version: '1.0.0',
      isPackaged: false,
      appPath: '/mock/app',
      appDataPath: '/mock/user/data',
      platform: 'linux',
      arch: 'x64'
    }),
    quit: vi.fn(),
    relaunch: vi.fn(),
    getLocale: vi.fn().mockReturnValue('en-US'),
    setLocale: vi.fn(),
    getDataPath: vi.fn().mockReturnValue('/mock/user/data')
  }
}))

describe('File IPC Handler Registration (T040)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('should register all file:* IPC handlers', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const registeredChannels = mockHandle.mock.calls.map((call: unknown[]) => call[0])

    expect(registeredChannels).toContain('file:select')
    expect(registeredChannels).toContain('file:upload')
    expect(registeredChannels).toContain('file:download')
    expect(registeredChannels).toContain('file:read')
    expect(registeredChannels).toContain('file:delete')
    expect(registeredChannels).toContain('file:open')
    expect(registeredChannels).toContain('file:getPath')
  })

  it('should register exactly 7 file:* handlers', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const fileChannels = mockHandle.mock.calls
      .map((call: unknown[]) => call[0] as string)
      .filter((ch: string) => ch.startsWith('file:'))

    expect(fileChannels).toHaveLength(7)
  })

  it('should register handlers as functions', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const fileHandlers = mockHandle.mock.calls.filter((call: unknown[]) => (call[0] as string).startsWith('file:'))

    for (const [, handler] of fileHandlers) {
      expect(typeof handler).toBe('function')
    }
  })

  it('should register file:select handler that accepts options parameter', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const selectHandler = mockHandle.mock.calls.find((call: unknown[]) => call[0] === 'file:select')

    expect(selectHandler).toBeDefined()
    expect(typeof selectHandler?.[1]).toBe('function')
  })

  it('should register file:upload handler that accepts filePath parameter', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const uploadHandler = mockHandle.mock.calls.find((call: unknown[]) => call[0] === 'file:upload')

    expect(uploadHandler).toBeDefined()
    expect(typeof uploadHandler?.[1]).toBe('function')
  })

  it('should register file:download handler that accepts id and optional targetPath', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const downloadHandler = mockHandle.mock.calls.find((call: unknown[]) => call[0] === 'file:download')

    expect(downloadHandler).toBeDefined()
    expect(typeof downloadHandler?.[1]).toBe('function')
  })

  it('should register all app and window handlers alongside file handlers', async () => {
    const { registerIpc } = await import('../../ipc')
    registerIpc(
      mockMainWindow as unknown as import('electron').BrowserWindow,
      mockApp as unknown as typeof import('electron').app
    )

    const registeredChannels = mockHandle.mock.calls.map((call: unknown[]) => call[0])

    // App handlers should still be present
    expect(registeredChannels).toContain('app:getInfo')
    expect(registeredChannels).toContain('app:quit')

    // Window handlers should still be present
    expect(registeredChannels).toContain('window:show')
    expect(registeredChannels).toContain('window:close')
  })
})
