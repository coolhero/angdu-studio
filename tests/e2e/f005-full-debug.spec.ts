import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'

test('Full debug: capture state + check providers + attempt send', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)

  // Navigate to Home
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) {
    await homeTab.click({ force: true })
    await page.waitForTimeout(2000)
  }

  // Screenshot current state
  await page.screenshot({ path: 'test-results/debug-home.png', fullPage: true })

  // Check provider store state
  const storeState = await page.evaluate(() => {
    try {
      // Read from localStorage where Zustand persists
      const providerData = localStorage.getItem('angdu-providers')
      const modelData = localStorage.getItem('angdu-models')
      const assistantData = localStorage.getItem('angdu-assistants')
      return JSON.stringify({
        providerStore: providerData ? JSON.parse(providerData) : 'NOT_FOUND',
        modelStore: modelData ? JSON.parse(modelData) : 'NOT_FOUND',
        assistantStore: assistantData ? JSON.parse(assistantData) : 'NOT_FOUND',
      }, null, 2)
    } catch (e) {
      return `ERROR: ${e}`
    }
  })
  console.log('=== STORE STATE ===')
  console.log(storeState)

  // Check for scroll issues
  const chatAreaStyles = await page.evaluate(() => {
    const root = document.querySelector('#root')
    if (!root) return 'NO_ROOT'
    const html = root.innerHTML
    // Find elements with overflow
    const overflowEls = document.querySelectorAll('[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-hidden, .overflow-scroll')
    return JSON.stringify({
      rootHeight: root.clientHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      overflowElements: Array.from(overflowEls).map(el => ({
        tag: el.tagName,
        class: el.className.substring(0, 80),
        height: el.clientHeight,
        scrollHeight: el.scrollHeight,
        overflow: getComputedStyle(el).overflow
      }))
    }, null, 2)
  })
  console.log('=== LAYOUT/SCROLL ===')
  console.log(chatAreaStyles)

  // Try clicking model selector
  const modelBtn = page.locator('button', { hasText: '모델 선택' })
  if (await modelBtn.count() > 0) {
    await modelBtn.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/debug-model-selector.png', fullPage: true })

    // Check what's in the popover
    const popoverContent = await page.locator('[data-radix-popper-content-wrapper]').innerHTML().catch(() => 'NO_POPOVER')
    console.log('=== MODEL SELECTOR CONTENT (first 500 chars) ===')
    console.log(popoverContent.substring(0, 500))
  }

  // Try typing and sending
  const editor = page.locator('.ProseMirror')
  if (await editor.count() > 0) {
    await editor.click()
    await editor.pressSequentially('test message', { delay: 50 })
    await page.waitForTimeout(500)

    // Find send button and click
    const sendBtn = page.locator('button:has(svg.lucide-send), button:has(svg[class*="send"])')
    if (await sendBtn.count() > 0) {
      await sendBtn.first().click()
      await page.waitForTimeout(3000)
      await page.screenshot({ path: 'test-results/debug-after-send.png', fullPage: true })

      // Check if message appeared
      const messageCount = await page.locator('[class*="message"]').count()
      console.log('Message-like elements after send:', messageCount)
    } else {
      console.log('No send button found')
    }
  }

  await app.close()
})
