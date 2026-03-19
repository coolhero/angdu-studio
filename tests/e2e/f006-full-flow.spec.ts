import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await _electron.launch({
    args: ['out/main/index.js', '--no-sandbox'],
    env: { ...process.env, NODE_ENV: 'test' }
  })
  page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(4000)
})

test.afterAll(async () => {
  await app?.close()
})

test.describe('F006 Full Flow Test', () => {

  test('Complete KB creation flow', async () => {
    // 1. Navigate to KB page
    await page.evaluate(() => { window.location.hash = '#/knowledge' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'tests/e2e/screenshots/f006-step1-kb-page.png' })

    // 2. Click the "Create Knowledge Base" button (or +)
    const createBtn = page.locator('button[title="Create Knowledge Base"]')
    const createBtnAlt = page.locator('button:has-text("Create Knowledge Base")')

    if (await createBtn.count() > 0) {
      await createBtn.first().click()
    } else if (await createBtnAlt.count() > 0) {
      await createBtnAlt.first().click()
    } else {
      // Find any plus button
      const plusBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') })
      if (await plusBtn.count() > 0) {
        await plusBtn.first().click()
      }
    }
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/e2e/screenshots/f006-step2-popup.png' })

    // 3. Check if dialog/popup opened
    const dialog = page.locator('[role="dialog"]')
    const dialogVisible = await dialog.count() > 0
    console.log('Dialog opened:', dialogVisible)

    if (dialogVisible) {
      // 4. Fill in name
      const nameInput = dialog.locator('input[type="text"]').first()
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test KB')
        console.log('Name filled: Test KB')
      }
      await page.screenshot({ path: 'tests/e2e/screenshots/f006-step3-filled.png' })

      // 5. Check for model selector
      const modelSelector = dialog.locator('select, [role="combobox"], button:has-text("model")')
      console.log('Model selectors found:', await modelSelector.count())

      // 6. Try to submit — look for submit/create button in dialog
      const submitBtn = dialog.locator('button:has-text("Create"), button:has-text("만들기"), button[type="submit"]')
      console.log('Submit buttons found:', await submitBtn.count())

      if (await submitBtn.count() > 0) {
        await submitBtn.first().click()
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'tests/e2e/screenshots/f006-step4-after-create.png' })
      }
    }

    // 7. Check the final page state
    await page.screenshot({ path: 'tests/e2e/screenshots/f006-step5-final.png' })
    const bodyText = await page.textContent('body')
    console.log('Final body text (first 300):', bodyText?.substring(0, 300))
  })

  test('Chat KB button opens popover', async () => {
    await page.evaluate(() => { window.location.hash = '#/' })
    await page.waitForTimeout(2000)

    const kbBtn = page.locator('button[title="Knowledge Base"]')
    const count = await kbBtn.count()
    console.log('KB button in chat:', count)

    if (count > 0) {
      await kbBtn.first().click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/e2e/screenshots/f006-kb-popover.png' })

      // Check if popover opened
      const popover = page.locator('[data-state="open"], [role="dialog"]')
      const popoverCount = await popover.count()
      console.log('Popover/dialog after KB click:', popoverCount)

      // Check popover content
      if (popoverCount > 0) {
        const popoverText = await popover.first().textContent()
        console.log('Popover text:', popoverText?.substring(0, 200))
      }
    }
  })
})
