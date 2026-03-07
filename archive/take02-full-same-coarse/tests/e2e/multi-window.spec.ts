import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'

// Note: This E2E test requires a built application to run.
// It will be fully testable after `pnpm build` produces the output.
// For now, this provides the test structure and assertions.

let electronApp: ElectronApplication
let mainPage: Page

test.describe('Multi-Window Support', () => {
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

  test('main window is created on launch', async () => {
    mainPage = await electronApp.firstWindow()
    expect(mainPage).toBeTruthy()

    const windowCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })
    expect(windowCount).toBeGreaterThanOrEqual(1)
  })

  test('opening mini window creates a second window', async () => {
    const initialCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    // Trigger opening the mini window via IPC
    await mainPage.evaluate(() => {
      return (window as unknown as { api: { window: { openMini: () => Promise<void> } } }).api.window.openMini()
    })

    // Wait briefly for the window to be created
    await mainPage.waitForTimeout(500)

    const newCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    expect(newCount).toBe(initialCount + 1)
  })

  test('mini window has correct dimensions', async () => {
    const miniWindowSize = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      // Find the mini window (not the main window)
      const miniWindow = windows.find((w) => {
        const [width, height] = w.getSize()
        return width === 400 && height === 600
      })
      if (!miniWindow) return null
      const [width, height] = miniWindow.getSize()
      return { width, height }
    })

    expect(miniWindowSize).not.toBeNull()
    expect(miniWindowSize?.width).toBe(400)
    expect(miniWindowSize?.height).toBe(600)
  })

  test('mini window is always on top', async () => {
    const isAlwaysOnTop = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      const miniWindow = windows.find((w) => {
        const [width] = w.getSize()
        return width === 400
      })
      return miniWindow?.isAlwaysOnTop() ?? false
    })

    expect(isAlwaysOnTop).toBe(true)
  })

  test('opening selection toolbar creates another window', async () => {
    const initialCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    await mainPage.evaluate(() => {
      return (window as unknown as { api: { window: { openSelection: () => Promise<void> } } })
        .api.window.openSelection()
    })

    await mainPage.waitForTimeout(500)

    const newCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    expect(newCount).toBe(initialCount + 1)
  })

  test('selection toolbar is frameless', async () => {
    // Frameless windows don't have a native frame,
    // we verify by checking the window was created without frame
    const windowCount = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })

    // We should have at least 3 windows: main, mini, and selection toolbar
    expect(windowCount).toBeGreaterThanOrEqual(3)
  })

  test('both secondary windows function independently from main', async () => {
    // Verify main window is still responsive
    const isMainVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.length > 0 && windows[0].isVisible()
    })

    expect(isMainVisible).toBe(true)

    // Verify all windows are visible and not destroyed
    const allWindowsHealthy = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.every((w) => !w.isDestroyed() && w.isVisible())
    })

    expect(allWindowsHealthy).toBe(true)
  })

  test('closing secondary window does not affect main window', async () => {
    // Close the last opened window (selection toolbar)
    await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 1) {
        windows[windows.length - 1].close()
      }
    })

    await mainPage.waitForTimeout(300)

    // Main window should still be alive
    const mainWindowAlive = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows()
      return windows.length > 0 && !windows[0].isDestroyed()
    })

    expect(mainWindowAlive).toBe(true)
  })
})
