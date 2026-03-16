import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'
import os from 'os'

test('Real environment: send message with user data', async () => {
  // Use the REAL user data directory (same as when user runs pnpm run dev)
  const userDataDir = path.join(os.homedir(), 'Library/Application Support/angdu-studio')

  const app = await electron.launch({
    args: [
      path.join(__dirname, '../../out/main/index.js'),
      `--user-data-dir=${userDataDir}`
    ],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(6000)

  // Collect all errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 300))
  })

  // Navigate to Home tab
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) await homeTab.click({ force: true })
  await page.waitForTimeout(3000)

  // Screenshot BEFORE anything
  await page.screenshot({ path: 'test-results/real-env-home.png', fullPage: true })

  // Check provider/model state from localStorage
  const storeState = await page.evaluate(() => {
    const providerData = localStorage.getItem('angdu-providers')
    const parsed = providerData ? JSON.parse(providerData) : null
    const providers = parsed?.state?.providers ?? []
    return {
      total: providers.length,
      enabled: providers.filter((p: any) => p.enabled).map((p: any) => ({
        name: p.name,
        models: p.models?.length ?? 0,
        apiKey: p.apiKey ? (p.apiKey === '***' ? 'MASKED' : p.apiKey.length > 0 ? 'SET' : 'EMPTY') : 'NONE'
      }))
    }
  })
  console.log('=== PROVIDER STATE ===')
  console.log(JSON.stringify(storeState, null, 2))

  // Check if model selector has options
  const modelBtn = page.locator('button').filter({ hasText: /모델 선택|Select Model/ })
  if (await modelBtn.count() > 0) {
    console.log('Model selector found, clicking...')
    await modelBtn.first().click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/real-env-model-popup.png', fullPage: true })

    // Count model items in popup
    const modelItems = page.locator('[data-radix-popper-content-wrapper] button')
    const count = await modelItems.count()
    console.log(`Model items in popup: ${count}`)

    // If models exist, select the first one
    if (count > 0) {
      await modelItems.first().click()
      await page.waitForTimeout(1000)
      console.log('Model selected!')
    } else {
      console.log('NO MODELS IN POPUP — this is why chat fails')
      // Close popup
      await page.keyboard.press('Escape')
    }
  }

  // Now try to send a message
  const editor = page.locator('.ProseMirror')
  if (await editor.count() > 0) {
    await editor.click()
    await editor.pressSequentially('Hello, can you hear me?', { delay: 20 })
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    console.log('Message sent, waiting for response...')

    // Wait up to 15 seconds for a response
    await page.waitForTimeout(15000)
    await page.screenshot({ path: 'test-results/real-env-after-send.png', fullPage: true })

    // Check what's on screen
    const html = await page.locator('#root').innerHTML()
    console.log(`\n=== AFTER SEND ===`)
    console.log(`HTML length: ${html.length}`)
    console.log(`Has user message: ${html.includes('Hello, can you hear me')}`)
    console.log(`Has error: ${html.includes('NO_MODEL') || html.includes('error')}`)
    console.log(`Has streaming indicator: ${html.includes('streaming') || html.includes('animate')}`)
  }

  console.log(`\n=== CONSOLE ERRORS ===`)
  errors.forEach(e => console.log(`  ${e}`))

  await app.close()
})
