import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'

test('Send message end-to-end test', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)

  // Navigate to Home
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) await homeTab.click({ force: true })
  await page.waitForTimeout(2000)

  // Capture console errors
  const consoleErrors: string[] = []
  const consoleLogs: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
    else consoleLogs.push(`[${msg.type()}] ${msg.text().substring(0, 200)}`)
  })

  // Step 1: Check model selector state
  const modelBtn = page.locator('button', { hasText: '모델 선택' }).or(page.locator('button', { hasText: 'Select Model' }))
  const modelBtnCount = await modelBtn.count()
  console.log(`Model selector buttons: ${modelBtnCount}`)

  // Try to manually set a model via evaluate (simulate what would happen)
  const storeCheck = await page.evaluate(() => {
    try {
      // Check provider store
      const providerData = localStorage.getItem('angdu-providers')
      const parsed = providerData ? JSON.parse(providerData) : null
      const providers = parsed?.state?.providers ?? []
      const enabledWithModels = providers.filter((p: any) => p.enabled && p.models?.length > 0)

      return JSON.stringify({
        totalProviders: providers.length,
        enabledProviders: providers.filter((p: any) => p.enabled).length,
        providersWithModels: enabledWithModels.map((p: any) => ({
          name: p.name,
          modelCount: p.models.length,
          firstModel: p.models[0]?.name
        }))
      })
    } catch(e) {
      return `ERROR: ${e}`
    }
  })
  console.log('=== STORE CHECK ===')
  console.log(storeCheck)

  // Step 2: Type a message and send
  const editor = page.locator('.ProseMirror')
  if (await editor.count() > 0) {
    await editor.click()
    await editor.pressSequentially('Hello test', { delay: 30 })
    await page.waitForTimeout(500)

    // Press Enter to send
    await page.keyboard.press('Enter')
    await page.waitForTimeout(5000) // Wait for response

    // Capture state after send
    await page.screenshot({ path: 'test-results/after-send.png', fullPage: true })

    console.log('=== CONSOLE ERRORS AFTER SEND ===')
    consoleErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 300)}`))
    console.log('=== CONSOLE LOGS (last 10) ===')
    consoleLogs.slice(-10).forEach(l => console.log(`  ${l}`))
  }

  // Step 3: Check if any messages appeared
  const bodyHtml = await page.locator('#root').innerHTML()
  const hasUserMessage = bodyHtml.includes('Hello test')
  const hasError = bodyHtml.includes('error') || bodyHtml.includes('Error') || bodyHtml.includes('NO_MODEL')
  const hasNoOutput = bodyHtml.includes('No output')
  console.log(`\n=== RESULT ===`)
  console.log(`User message visible: ${hasUserMessage}`)
  console.log(`Error visible: ${hasError}`)
  console.log(`No output visible: ${hasNoOutput}`)
  console.log(`Body length: ${bodyHtml.length}`)

  await app.close()
})
