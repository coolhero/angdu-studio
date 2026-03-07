import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import type { ElectronApplication } from 'playwright'

// Note: This E2E test requires a built application to run.
// Run `pnpm build` before executing these tests.
// Performance thresholds per success criteria SC-001, SC-002, SC-004.

test.describe('Performance Validation', () => {
  let electronApp: ElectronApplication

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('cold start time is under 5000ms (SC-001)', async () => {
    const startTime = Date.now()

    electronApp = await electron.launch({
      args: ['./out/main/index.js'],
      timeout: 10000
    })

    const mainPage = await electronApp.firstWindow()
    expect(mainPage).toBeTruthy()

    const elapsed = Date.now() - startTime
    console.log(`Cold start time: ${elapsed}ms`)

    expect(elapsed).toBeLessThan(5000)
  })

  test('IPC round-trip time for app:getInfo is under 100ms (SC-002)', async () => {
    electronApp = await electron.launch({
      args: ['./out/main/index.js'],
      timeout: 10000
    })

    const mainPage = await electronApp.firstWindow()

    // Measure IPC round-trip time for a non-I/O operation
    const latency = await mainPage.evaluate(async () => {
      const start = performance.now()
      await (window as unknown as Record<string, { getInfo: () => Promise<unknown> }>).api.getInfo()
      const end = performance.now()
      return end - start
    })

    console.log(`IPC round-trip latency (app:getInfo): ${latency.toFixed(2)}ms`)

    expect(latency).toBeLessThan(100)
  })
})
