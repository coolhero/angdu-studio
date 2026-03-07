import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

// Note: This E2E test requires a built application to run.
// It will be fully testable after `pnpm build` produces the output.
// For now, this provides the test structure and assertions.

let electronApp: ElectronApplication
let mainPage: Page
let tempDir: string

test.describe('File Management', () => {
  test.beforeAll(async () => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-mgmt-e2e-'))

    // Create a sample test file
    fs.writeFileSync(path.join(tempDir, 'test-upload.txt'), 'Hello, this is a test file.')
    fs.writeFileSync(path.join(tempDir, 'test-image.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]))

    // Launch the Electron application
    electronApp = await electron.launch({
      args: ['./out/main/index.js'],
      timeout: 10000
    })
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }

    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  test('file:upload copies file to managed directory and returns metadata', async () => {
    mainPage = await electronApp.firstWindow()

    const testFilePath = path.join(tempDir, 'test-upload.txt')

    // Invoke the file:upload IPC channel directly
    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        // Access the ipc handler through the main process
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    // Verify metadata structure
    expect(metadata).toBeDefined()
    if (metadata) {
      expect(metadata).toHaveProperty('id')
      expect(metadata).toHaveProperty('name', 'test-upload.txt')
      expect(metadata).toHaveProperty('ext', '.txt')
      expect(metadata).toHaveProperty('size')
      expect(metadata).toHaveProperty('created_at')
      expect(metadata.size).toBeGreaterThan(0)
    }
  })

  test('file:read returns file content as buffer', async () => {
    mainPage = await electronApp.firstWindow()

    // First upload a file to get its ID
    const testFilePath = path.join(tempDir, 'test-upload.txt')

    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    if (metadata) {
      // Now read the file back
      const content = await electronApp.evaluate(
        async ({ ipcMain }, { id, ext }) => {
          const { ipcRenderer } = require('electron')
          const buffer = await ipcRenderer.invoke('file:read', id, ext)
          return buffer ? Buffer.from(buffer).toString('utf-8') : null
        },
        { id: metadata.id, ext: metadata.ext }
      )

      expect(content).toBe('Hello, this is a test file.')
    }
  })

  test('file:getPath returns absolute path for managed file', async () => {
    mainPage = await electronApp.firstWindow()

    const testFilePath = path.join(tempDir, 'test-upload.txt')

    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    if (metadata) {
      const filePath = await electronApp.evaluate(
        async ({ ipcMain }, { id, ext }) => {
          const { ipcRenderer } = require('electron')
          return ipcRenderer.invoke('file:getPath', id, ext)
        },
        { id: metadata.id, ext: metadata.ext }
      )

      expect(filePath).toBeDefined()
      expect(path.isAbsolute(filePath)).toBe(true)
      expect(filePath).toContain(metadata.id)
    }
  })

  test('file:delete removes file from managed directory', async () => {
    mainPage = await electronApp.firstWindow()

    const testFilePath = path.join(tempDir, 'test-upload.txt')

    // Upload first
    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    if (metadata) {
      // Delete the file
      await electronApp.evaluate(
        async ({ ipcMain }, { id, ext }) => {
          const { ipcRenderer } = require('electron')
          return ipcRenderer.invoke('file:delete', id, ext)
        },
        { id: metadata.id, ext: metadata.ext }
      )

      // Verify the file is gone by trying to read it
      const readResult = await electronApp.evaluate(
        async ({ ipcMain }, { id, ext }) => {
          const { ipcRenderer } = require('electron')
          try {
            await ipcRenderer.invoke('file:read', id, ext)
            return 'still exists'
          } catch {
            return 'deleted'
          }
        },
        { id: metadata.id, ext: metadata.ext }
      )

      expect(readResult).toBe('deleted')
    }
  })

  test('file:download copies managed file to a target location', async () => {
    mainPage = await electronApp.firstWindow()

    const testFilePath = path.join(tempDir, 'test-upload.txt')
    const downloadTarget = path.join(tempDir, 'downloaded-copy.txt')

    // Upload first
    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    if (metadata) {
      // Download to target
      await electronApp.evaluate(
        async ({ ipcMain }, { id, ext, target }) => {
          const { ipcRenderer } = require('electron')
          return ipcRenderer.invoke('file:download', id, ext, target)
        },
        { id: metadata.id, ext: metadata.ext, target: downloadTarget }
      )

      // Verify the downloaded file exists
      expect(fs.existsSync(downloadTarget)).toBe(true)
      const content = fs.readFileSync(downloadTarget, 'utf-8')
      expect(content).toBe('Hello, this is a test file.')
    }
  })

  test('file:open opens file with system default application', async () => {
    mainPage = await electronApp.firstWindow()

    // This test verifies the IPC channel exists and doesn't throw
    // Actual OS interaction cannot be fully verified in E2E
    const testFilePath = path.join(tempDir, 'test-upload.txt')

    const metadata = await electronApp.evaluate(
      async ({ ipcMain }, filePath) => {
        const { ipcRenderer } = require('electron')
        return ipcRenderer.invoke('file:upload', filePath)
      },
      testFilePath
    )

    if (metadata) {
      // The open call should not throw
      const result = await electronApp.evaluate(
        async ({ ipcMain }, { id, ext }) => {
          const { ipcRenderer } = require('electron')
          try {
            await ipcRenderer.invoke('file:open', id, ext)
            return 'success'
          } catch {
            return 'error'
          }
        },
        { id: metadata.id, ext: metadata.ext }
      )

      expect(result).toBe('success')
    }
  })

  test('path traversal attempts are blocked', async () => {
    mainPage = await electronApp.firstWindow()

    const result = await electronApp.evaluate(
      async ({ ipcMain }) => {
        const { ipcRenderer } = require('electron')
        try {
          await ipcRenderer.invoke('file:read', '../../../etc/passwd', '')
          return 'allowed'
        } catch {
          return 'blocked'
        }
      }
    )

    expect(result).toBe('blocked')
  })
})
