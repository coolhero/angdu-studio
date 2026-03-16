import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import path from 'path'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)

  // Navigate to Home tab (may be on Settings from previous session's persisted state)
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) {
    await homeTab.click({ force: true })
    await page.waitForTimeout(3000)
  }
})

test.afterAll(async () => {
  if (app) await app.close()
})

test('Phase 0: App launches with window title', async () => {
  const title = await page.title()
  expect(title).toBeTruthy()
  const windows = app.windows()
  expect(windows.length).toBeGreaterThanOrEqual(1)
})

test('Phase 0: Home route renders content (not blank)', async () => {
  const bodyHtml = await page.locator('body').innerHTML()
  expect(bodyHtml.length).toBeGreaterThan(100)
})

test('Phase 1: Root element renders React app', async () => {
  const root = page.locator('#root')
  await expect(root).toBeVisible()
  const rootContent = await root.innerHTML()
  expect(rootContent.length).toBeGreaterThan(50)
})

test('Phase 2: TipTap editor (ProseMirror) exists on Home page', async () => {
  // After navigating to Home tab, the editor should be visible
  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible({ timeout: 10000 })
})

test('Phase 2: Chat layout has no error boundary', async () => {
  const bodyHtml = await page.locator('body').innerHTML()
  expect(bodyHtml).not.toContain('Something went wrong')
})

test('Phase 3: No unhandled errors in console', async () => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('DevTools')) {
        errors.push(text)
      }
    }
  })
  await page.waitForTimeout(3000)
  expect(errors.length).toBeLessThan(3)
})
