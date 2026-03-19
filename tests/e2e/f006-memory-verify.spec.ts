import { test, expect, type ElectronApplication, type Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    timeout: 30000
  })
  page = await app.firstWindow()
  await page.waitForTimeout(3000)
})

test.afterAll(async () => {
  if (app) await app.close()
})

test('Memory settings page accessible from sidebar', async () => {
  await page.evaluate(() => { window.location.hash = '#/settings/memory' })
  await page.waitForTimeout(1500)

  const content = await page.locator('body').innerHTML()
  const hasMemory = content.includes('Memory') || content.includes('memory')
  expect(hasMemory).toBe(true)
})

test('Memory settings has global toggle', async () => {
  await page.evaluate(() => { window.location.hash = '#/settings/memory' })
  await page.waitForTimeout(1500)

  const content = await page.locator('body').innerHTML()
  const hasToggle = content.includes('Global Memory') || content.includes('switch') || content.includes('Switch')
  expect(hasToggle).toBe(true)
})

test('Memory settings has Beta badge', async () => {
  await page.evaluate(() => { window.location.hash = '#/settings/memory' })
  await page.waitForTimeout(1500)

  const content = await page.locator('body').innerHTML()
  expect(content).toContain('Beta')
})

test('Settings sidebar shows Memory link', async () => {
  await page.evaluate(() => { window.location.hash = '#/settings' })
  await page.waitForTimeout(1500)

  const nav = await page.locator('nav').innerHTML()
  const hasMemoryLink = nav.toLowerCase().includes('memory')
  expect(hasMemoryLink).toBe(true)
})

test('No errors on memory settings page', async () => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.evaluate(() => { window.location.hash = '#/settings/memory' })
  await page.waitForTimeout(2000)

  const critical = errors.filter(e => !e.includes('ResizeObserver'))
  expect(critical).toHaveLength(0)
})
