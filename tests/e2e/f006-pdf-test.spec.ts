import { test, expect, _electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'

test('KB file add - dialog properties check', async () => {
  const app = await _electron.launch({ args: ['out/main/index.js'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // Navigate to knowledge page
  await page.evaluate(() => { window.location.hash = '#/knowledge' })
  await page.waitForTimeout(2000)

  // Check what's on the page
  const bodyText = await page.textContent('body')
  console.log('Page content (first 500 chars):', bodyText?.substring(0, 500))

  // Check if there's a "+" or "Add" button
  const addButtons = page.locator('button').filter({ hasText: /Add|추가|\+/ })
  const addCount = await addButtons.count()
  console.log('Add buttons found:', addCount)

  // Check for any knowledge base list
  const allButtons = page.locator('button')
  const buttonCount = await allButtons.count()
  console.log('Total buttons on page:', buttonCount)

  // Check for error in console
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('Console error:', msg.text())
  })

  await page.waitForTimeout(1000)
  console.log('Page errors:', errors)

  await app.close()
})
