import { test, _electron as electron } from '@playwright/test'
import path from 'path'
import os from 'os'

test('Capture main process error on chat send', async () => {
  const userDataDir = path.join(os.homedir(), 'Library/Application Support/angdu-studio')

  const mainProcessLogs: string[] = []

  const app = await electron.launch({
    args: [
      path.join(__dirname, '../../out/main/index.js'),
      `--user-data-dir=${userDataDir}`
    ],
    env: { ...process.env, NODE_ENV: 'production' },
  })

  // Capture main process console output
  app.process().stderr?.on('data', (data: Buffer) => {
    mainProcessLogs.push(`[stderr] ${data.toString().trim()}`)
  })
  app.process().stdout?.on('data', (data: Buffer) => {
    mainProcessLogs.push(`[stdout] ${data.toString().trim()}`)
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(6000)

  // Navigate to Home
  const homeTab = page.locator('[role="tab"]', { hasText: 'Home' })
  if (await homeTab.count() > 0) await homeTab.click({ force: true })
  await page.waitForTimeout(2000)

  // Type and send
  const editor = page.locator('.ProseMirror')
  if (await editor.count() > 0) {
    await editor.click()
    await editor.pressSequentially('test', { delay: 20 })
    await page.keyboard.press('Enter')

    // Wait for error
    await page.waitForTimeout(10000)
  }

  console.log('=== MAIN PROCESS LOGS ===')
  mainProcessLogs.forEach(l => console.log(l))

  // Also capture renderer console
  const rendererErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') rendererErrors.push(msg.text().substring(0, 500))
  })
  await page.waitForTimeout(2000)

  console.log('\n=== RENDERER ERRORS ===')
  rendererErrors.forEach(e => console.log(e))

  await app.close()
})
