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

  // Navigate to Home tab (may be on Settings from previous session)
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) {
    await homeTab.click({ force: true })
    await page.waitForTimeout(3000)
  }
})

test.afterAll(async () => {
  if (app) await app.close()
})

test('Chat flow: capture full page state', async () => {
  // Capture the full rendered HTML to understand current state
  const html = await page.locator('#root').innerHTML()
  console.log('=== FULL PAGE STATE ===')
  console.log('HTML length:', html.length)

  // Check for key UI elements
  const proseMirror = await page.locator('.ProseMirror').count()
  console.log('ProseMirror editors:', proseMirror)

  // Check for assistant panel
  const assistantRelated = await page.locator('text=Default Assistant').count()
  console.log('Default Assistant text:', assistantRelated)

  // Check for empty state
  const emptyState = await page.locator('text=Start a conversation').count()
  console.log('Empty state text:', emptyState)

  // Check for buttons
  const sendBtn = await page.locator('button').count()
  console.log('Total buttons:', sendBtn)

  // Take a screenshot for analysis
  await page.screenshot({ path: 'test-results/f005-chat-state.png', fullPage: true })
  console.log('Screenshot saved to test-results/f005-chat-state.png')
})

test('Chat flow: type message in editor', async () => {
  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible({ timeout: 5000 })

  // Type a test message
  await editor.click()
  await editor.fill('Hello, this is a test message')
  await page.waitForTimeout(1000)

  // Verify the editor has content
  const editorText = await editor.textContent()
  console.log('Editor text:', editorText)
  expect(editorText).toContain('Hello')
})

test('Chat flow: find and click send button', async () => {
  // Look for send button - various possible selectors
  const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last()
  const buttonCount = await sendButton.count()
  console.log('Potential send buttons:', buttonCount)

  // Try to find specific send icon (lucide Send icon)
  const allButtons = await page.locator('button').all()
  for (let i = 0; i < allButtons.length; i++) {
    const ariaLabel = await allButtons[i].getAttribute('aria-label')
    const text = await allButtons[i].textContent()
    console.log(`Button ${i}: aria-label="${ariaLabel}", text="${text?.substring(0, 30)}"`)
  }

  // Check if there's a send-like button
  const sendLike = page.locator('button[aria-label*="send" i], button[aria-label*="Send" i], button:has(svg.lucide-send)')
  const sendLikeCount = await sendLike.count()
  console.log('Send-like buttons:', sendLikeCount)
})

test('Chat flow: check if provider is configured', async () => {
  // The chat may not work because no AI provider is configured
  // Check for model/provider-related UI
  const modelSelector = await page.locator('text=model').count()
  const providerText = await page.locator('text=provider').count()
  const noProvider = await page.locator('text=No provider').count()
  const noModel = await page.locator('text=No model').count()

  console.log('Model mentions:', modelSelector)
  console.log('Provider mentions:', providerText)
  console.log('No provider:', noProvider)
  console.log('No model:', noModel)

  // Check store state via evaluate
  const storeState = await page.evaluate(() => {
    // @ts-ignore
    return JSON.stringify({
      hasApi: !!window.api,
      hasInvoke: !!window.api?.invoke,
    })
  })
  console.log('Store state:', storeState)
})
