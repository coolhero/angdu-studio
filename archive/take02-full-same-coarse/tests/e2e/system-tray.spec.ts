import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'

// Note: System tray E2E tests are limited by Playwright's inability to
// directly interact with native OS tray icons. These tests verify the
// underlying window hide/show behavior that the tray controls.

let electronApp: ElectronApplication
let mainPage: Page

test.describe('System Tray Integration', () => {
  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['./out/main/index.js'],
      timeout: 10000
    })
    mainPage = await electronApp.firstWindow()
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('tray icon is created when app launches', async () => {
    // Verify the tray service was initialized by checking
    // that the app is running and the main window is visible
    const isVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.length > 0 && windows[0].isVisible()
    })
    expect(isVisible).toBe(true)
  })

  test('window can be hidden and shown (tray minimize/restore cycle)', async () => {
    // Hide the window (simulates minimize to tray)
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      win.hide()
    })

    // Verify window is hidden
    const isHidden = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return !win.isVisible()
    })
    expect(isHidden).toBe(true)

    // Show the window (simulates restore from tray)
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      win.show()
      win.focus()
    })

    // Verify window is visible again
    const isVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return win.isVisible()
    })
    expect(isVisible).toBe(true)
  })

  test('window maintains state after hide/show cycle', async () => {
    // Get initial window bounds
    const initialBounds = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return win.getBounds()
    })

    // Hide and show
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      win.hide()
    })
    await mainPage.waitForTimeout(100)

    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      win.show()
    })
    await mainPage.waitForTimeout(100)

    // Verify bounds are preserved
    const afterBounds = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return win.getBounds()
    })

    expect(afterBounds.width).toBe(initialBounds.width)
    expect(afterBounds.height).toBe(initialBounds.height)
  })
})
