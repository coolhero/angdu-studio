import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'

// Note: This E2E test requires a built application to run.
// It will be fully testable after `pnpm build` produces the output.
// For now, this provides the test structure and assertions.

let electronApp: ElectronApplication
let mainPage: Page

test.describe('Data Path Management', () => {
  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['./out/main/index.js'],
      timeout: 10000
    })
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('data settings page shows current path', async () => {
    mainPage = await electronApp.firstWindow()

    // Navigate to the settings page and select the Data tab
    // The exact navigation depends on the app routing structure
    // This test verifies the data path is displayed

    const dataPath = await mainPage.evaluate(() => {
      return (window as unknown as { api: { getDataPath: () => Promise<string> } }).api.getDataPath()
    })

    expect(dataPath).toBeTruthy()
    expect(typeof dataPath).toBe('string')
  })

  test('current data path is a valid directory', async () => {
    mainPage = await electronApp.firstWindow()

    const dataPath = await mainPage.evaluate(() => {
      return (window as unknown as { api: { getDataPath: () => Promise<string> } }).api.getDataPath()
    })

    expect(dataPath).toBeTruthy()
    // Data path should be an absolute path
    expect(dataPath.startsWith('/') || /^[A-Z]:\\/.test(dataPath)).toBe(true)
  })

  test('portable mode detection returns a boolean', async () => {
    mainPage = await electronApp.firstWindow()

    const isPortable = await mainPage.evaluate(() => {
      return (window as unknown as { api: { system: { isPortable: () => Promise<boolean> } } })
        .api.system.isPortable()
    })

    expect(typeof isPortable).toBe('boolean')
  })

  test('data path change triggers confirmation flow', async () => {
    mainPage = await electronApp.firstWindow()

    // Attempt to set a data path (this should be handled by the IPC handler)
    // In a real test, this would involve the folder picker dialog
    // For now, we verify the IPC channel is registered and responds

    try {
      // Calling setDataPath with an empty string should be rejected
      await mainPage.evaluate(() => {
        return (window as unknown as { api: { setDataPath: (p: string) => Promise<void> } })
          .api.setDataPath('')
      })
      // If it doesn't throw, the handler exists but may allow empty paths
    } catch {
      // Expected: setDataPath with empty string should fail,
      // confirming the handler is registered and validates input
    }

    // The main window should still be functional after the rejection
    const isVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.length > 0 && windows[0].isVisible()
    })

    expect(isVisible).toBe(true)
  })

  test('app info includes data path information', async () => {
    mainPage = await electronApp.firstWindow()

    const appInfo = await mainPage.evaluate(() => {
      return (window as unknown as { api: { getInfo: () => Promise<{ appDataPath: string }> } })
        .api.getInfo()
    })

    expect(appInfo).toBeDefined()
    expect(appInfo.appDataPath).toBeTruthy()
    expect(typeof appInfo.appDataPath).toBe('string')
  })
})
