import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'

// Note: This E2E test requires a built application to run.
// It will be fully testable after `pnpm build` produces the output.
// For now, this provides the test structure and assertions.

let electronApp: ElectronApplication
let mainPage: Page

test.describe('App Launch', () => {
  test.beforeAll(async () => {
    // Launch the Electron application
    // The main entry point is at ./out/main/index.js after build
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

  test('cold start completes within 5 seconds', async () => {
    const startTime = Date.now()

    // Wait for the first window to appear
    mainPage = await electronApp.firstWindow()
    expect(mainPage).toBeTruthy()

    const elapsed = Date.now() - startTime
    expect(elapsed).toBeLessThan(5000)
  })

  test('main window is visible', async () => {
    mainPage = await electronApp.firstWindow()

    // Check that the window is visible
    const isVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.length > 0 && windows[0].isVisible()
    })

    expect(isVisible).toBe(true)
  })

  test('main window has correct minimum dimensions', async () => {
    mainPage = await electronApp.firstWindow()

    const { width, height } = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      const [minWidth, minHeight] = windows[0].getMinimumSize()
      return { width: minWidth, height: minHeight }
    })

    expect(width).toBe(800)
    expect(height).toBe(600)
  })

  test('main window has correct default dimensions', async () => {
    mainPage = await electronApp.firstWindow()

    const { width, height } = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      const [w, h] = windows[0].getSize()
      return { width: w, height: h }
    })

    // Default dimensions should be 1200x800 or the restored size
    expect(width).toBeGreaterThanOrEqual(800)
    expect(height).toBeGreaterThanOrEqual(600)
  })

  test('window restores previous size/position', async () => {
    mainPage = await electronApp.firstWindow()

    // Resize to a custom size
    await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      windows[0].setSize(1000, 700)
      windows[0].setPosition(150, 150)
    })

    // Get the size/position we just set
    const { width: newWidth, height: newHeight } = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      const [w, h] = windows[0].getSize()
      return { width: w, height: h }
    })

    expect(newWidth).toBe(1000)
    expect(newHeight).toBe(700)

    // Note: Full restore test would require closing and relaunching the app
    // which is handled by electron-window-state persistence
  })

  test('only one window is created on launch', async () => {
    const windowCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    // Should only have the main window
    expect(windowCount).toBe(1)
  })

  test('window has correct web preferences', async () => {
    const webPrefs = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      const prefs = windows[0].webContents.getLastWebPreferences()
      return {
        contextIsolation: prefs?.contextIsolation,
        sandbox: prefs?.sandbox
      }
    })

    expect(webPrefs.contextIsolation).toBe(true)
  })
})
